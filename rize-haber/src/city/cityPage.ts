/**
 * Keşfet → Kuşbakışı: Rize'ye yukarıdan bakan, binaları 3B ve sokaklarında araçların aktığı canlı harita.
 *
 * Nasıl çalışır (araştırma özeti):
 * - Harita: MapLibre GL JS (açık kaynak WebGL harita motoru) + OpenFreeMap "Liberty" stili. OpenFreeMap,
 *   OpenStreetMap verisinden üretilmiş vektör karoları anahtarsız ve ücretsiz sunar; binalar
 *   `fill-extrusion` katmanıyla 3B çizilir.
 * - Trafik: Görünen bölgedeki gerçek yollar (OSM `transportation` katmanı: sınıf, tek yön, tünel) karolardan
 *   okunur ve bir yol ağına (graf) dönüştürülür. Araçlar bu ağ üzerinde sağdan, yol sınıfına uygun hızda,
 *   tek yön kurallarına uyarak ve öndeki araçla mesafe bırakarak ilerler; kavşaklarda düz gitmeyi tercih eder.
 *   Araçlar da bina gibi 3B kutulardır (gövde + kabin), böylece binaların arkasında doğru gizlenirler.
 * - Gerçek zamanlı trafik verisi değildir; trafik bir canlandırmadır (ekranda belirtilir).
 *
 * Sayfa bir WebView (web'de iframe) içinde çalışır. Hermes, fonksiyon kaynak metnini saklamadığı için
 * sayfa kodu metin olarak tutulur; çekirdek simülasyon (`CITY_SIM_JS`) testlerde Node'da çalıştırılır.
 */

export const MAPLIBRE_VERSION = '5.24.0';
export const MAPLIBRE_JS = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
export const MAPLIBRE_CSS = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Sayfaya gönderilen komutlar. */
export type CityCommand =
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'fly'; lon: number; lat: number; zoom?: number }
  | { type: 'orbit'; on: boolean }
  | { type: 'night'; on: boolean }
  | { type: 'density'; level: 0 | 1 | 2 };

/** Sayfadan gelen iletiler. */
export type CityMessage =
  | { type: 'ready' }
  | { type: 'stats'; cars: number; roads: number }
  | { type: 'orbit'; on: boolean }
  | { type: 'error'; reason: 'offline' | 'webgl' | 'script' };

export type CityPageOptions = {
  lon: number;
  lat: number;
  night: boolean;
  orbit: boolean;
  density: 0 | 1 | 2;
  /** Testlerde yerel dosya verilebilir. */
  scriptUrl?: string;
  cssUrl?: string;
};

/**
 * Yol ağı ve araç simülasyonu. Saf JavaScript (ES5 sözdizimine yakın; eski WebView'larda da çalışır).
 * Dışarıya `CitySim` nesnesini verir.
 */
export const CITY_SIM_JS = String.raw`
var CitySim = (function () {
  // Yol sınıfı → hız (m/sn, kabaca şehir içi) ve trafik ağırlığı (ana yollar daha kalabalık).
  var CLASS = {
    motorway: { v: 22, w: 5 }, trunk: { v: 16, w: 5 }, primary: { v: 13, w: 4 },
    secondary: { v: 11, w: 3 }, tertiary: { v: 9, w: 2 }, minor: { v: 7, w: 0.8 }, service: { v: 4, w: 0.12 }
  };
  var Q = 1e5; // düğüm eşleme hassasiyeti (~1 m)
  var MLAT = 111320;

  function nkey(p) { return Math.round(p[0] * Q) + ':' + Math.round(p[1] * Q); }
  function mx(lat) { return MLAT * Math.cos(lat * Math.PI / 180); }
  function dist(a, b) { return Math.hypot((b[0] - a[0]) * mx(a[1]), (b[1] - a[1]) * MLAT); }

  /**
   * lines: [{ coords: [[lon,lat],...], cls, oneway (1|-1|0), tunnel }]
   * Karolar kenarlarında kesildiği için aynı yol birden çok parça halinde gelir; ortak köşeler aynı
   * düğüme eşlenir, yinelenen kenarlar atılır, karo sınırındaki kısa kör uçlar budanır.
   */
  function buildGraph(lines) {
    var nodes = new Map(), edges = [], seen = new Set();
    function node(p) {
      var k = nkey(p), n = nodes.get(k);
      if (!n) { n = { k: k, p: p, e: [] }; nodes.set(k, n); }
      return n;
    }
    for (var li = 0; li < lines.length; li++) {
      var l = lines[li];
      if (!CLASS[l.cls]) continue;
      for (var i = 1; i < l.coords.length; i++) {
        var a = node(l.coords[i - 1]), b = node(l.coords[i]);
        if (a === b) continue;
        var ek = a.k < b.k ? a.k + '|' + b.k : b.k + '|' + a.k;
        if (seen.has(ek)) continue;
        seen.add(ek);
        var ow = l.oneway === 1 || l.oneway === -1 ? l.oneway : 0;
        var e = { k: ek, a: ow === -1 ? b : a, b: ow === -1 ? a : b, len: dist(a.p, b.p), cls: l.cls, ow: ow !== 0, tunnel: !!l.tunnel, alive: true };
        edges.push(e);
        e.a.e.push(e);
        e.b.e.push(e);
      }
    }
    // Kör uç budama: tek bağlantılı düğüme giden kısa kenarlar (karo kesiği) iki tur.
    for (var pass = 0; pass < 2; pass++) {
      for (var j = 0; j < edges.length; j++) {
        var x = edges[j];
        if (!x.alive || x.len > 30) continue;
        if (degree(x.a) === 1 || degree(x.b) === 1) x.alive = false;
      }
    }
    var live = edges.filter(function (e) { return e.alive; });
    nodes.forEach(function (n) { n.e = n.e.filter(function (e) { return e.alive; }); });
    var byKey = new Map();
    live.forEach(function (e) { byKey.set(e.k, e); });
    return { nodes: nodes, edges: live, byKey: byKey };
  }
  function degree(n) { var c = 0; for (var i = 0; i < n.e.length; i++) if (n.e[i].alive) c++; return c; }

  /** Bu kenara bu düğümden girilebilir mi (tek yön)? */
  function canEnter(e, n) { return !e.ow || e.a === n; }

  function heading(e, fwd) {
    var s = fwd ? e.a.p : e.b.p, t = fwd ? e.b.p : e.a.p;
    return Math.atan2((t[0] - s[0]) * mx(s[1]), (t[1] - s[1]) * MLAT); // radyan, kuzeyden saat yönünde
  }

  /** Kavşakta sonraki kenar: düz devam ağırlıklı, ana yollar tercihli, geri dönüş yalnızca çıkmazda. */
  function nextEdge(cur, node, fwd, rnd) {
    var h0 = heading(cur, fwd), opts = [], total = 0;
    for (var i = 0; i < node.e.length; i++) {
      var e = node.e[i];
      if (e === cur || !canEnter(e, node)) continue;
      var f = e.a === node;
      var turn = Math.cos(heading(e, f) - h0); // 1 düz, -1 geri
      var w = (CLASS[e.cls].w + 0.3) * (0.08 + Math.max(0, turn + 0.25)) * (e.cls === cur.cls ? 1.6 : 1);
      opts.push({ e: e, f: f, w: w });
      total += w;
    }
    if (!opts.length) return null;
    var r = rnd() * total;
    for (var j = 0; j < opts.length; j++) { r -= opts[j].w; if (r <= 0) return opts[j]; }
    return opts[opts.length - 1];
  }

  var PALETTE = [
    ['#f4f5f6', 26], ['#c9ccd1', 16], ['#8e949b', 14], ['#2b2e33', 14], ['#1f3a68', 8],
    ['#a3201b', 7], ['#5b6b3a', 3], ['#d8cbb0', 4], ['#3a6ea5', 5], ['#6b1d2a', 3]
  ];
  function pick(list, rnd) {
    var t = 0, i; for (i = 0; i < list.length; i++) t += list[i][1];
    var r = rnd() * t;
    for (i = 0; i < list.length; i++) { r -= list[i][1]; if (r <= 0) return list[i][0]; }
    return list[0][0];
  }
  // Araç türleri: boyutlar metre (uzunluk, genişlik, yükseklik).
  var KINDS = [
    ['car', 80], ['taxi', 8], ['minibus', 7], ['bus', 3], ['truck', 2]
  ];
  var DIM = { car: [4.4, 1.8, 1.45], taxi: [4.5, 1.8, 1.48], minibus: [6.8, 2.1, 2.5], bus: [11.5, 2.5, 3.1], truck: [9.5, 2.5, 3.4] };

  function makeCar(e, fwd, d, rnd) {
    var kind = pick(KINDS, rnd);
    if ((e.cls === 'minor' || e.cls === 'service') && (kind === 'bus' || kind === 'truck')) kind = 'car';
    var color = kind === 'taxi' ? '#f2c200' : kind === 'minibus' ? '#f1f1ec' : kind === 'bus' ? (rnd() < 0.5 ? '#1f6fb2' : '#e9e9e4') : kind === 'truck' ? '#d9d9d2' : pick(PALETTE, rnd);
    var vf = 0.75 + rnd() * 0.4;
    return {
      e: e, fwd: fwd, d: d, v: CLASS[e.cls].v * vf * 0.6, vf: vf, kind: kind, color: color,
      lane: e.ow && (e.cls === 'trunk' || e.cls === 'primary' || e.cls === 'motorway') ? (rnd() < 0.5 ? -1 : 1) : 0,
      to: fwd ? e.b.k : e.a.k
    };
  }

  /** Aracı ilerletir; kenar sonunda kavşak seçer. false dönerse araç yeniden doğmalı. */
  function advance(car, dt, rnd) {
    car.d += car.v * dt;
    var guard = 0;
    while (car.d >= car.e.len && guard++ < 8) {
      car.d -= car.e.len;
      var node = car.fwd ? car.e.b : car.e.a;
      var nx = nextEdge(car.e, node, car.fwd, rnd);
      if (!nx) {
        if (car.e.ow) return false; // tek yönlü çıkmaz (genelde görünüm dışı kesik)
        car.fwd = !car.fwd; // çift yönlü çıkmaz sokak: geri dön
      } else {
        car.e = nx.e;
        car.fwd = nx.f;
        if (!car.e.ow) car.lane = 0;
      }
      car.to = car.fwd ? car.e.b.k : car.e.a.k;
    }
    return true;
  }

  /** Aynı kenarda aynı yönde gidenler arasında takip mesafesi; hızlar yumuşak değişir. */
  function follow(cars, dt) {
    var groups = new Map();
    for (var i = 0; i < cars.length; i++) {
      var c = cars[i], g = c.e.k + (c.fwd ? '>' : '<') + c.lane;
      var arr = groups.get(g); if (!arr) { arr = []; groups.set(g, arr); }
      arr.push(c);
    }
    groups.forEach(function (arr) {
      arr.sort(function (a, b) { return b.d - a.d; });
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i], target = CLASS[c.e.cls].v * c.vf;
        if (i > 0) {
          var lead = arr[i - 1], gap = lead.d - c.d - (DIM[lead.kind][0] + DIM[c.kind][0]) / 2;
          if (gap < 4) target = 0;
          else if (gap < 18) target = Math.min(target, lead.v * (gap / 18) + 0.5);
        }
        var k = target < c.v ? 3 : 1.2; // fren hızlı, kalkış yavaş
        c.v += (target - c.v) * Math.min(1, dt * k);
        if (c.v < 0) c.v = 0;
      }
    });
  }

  /** Aracın konumu (lon,lat) ve yönü (radyan). Sağdan gidiş: yön vektörünün sağına kaydırılır. */
  function pose(car) {
    var e = car.e, s = car.fwd ? e.a.p : e.b.p, t = car.fwd ? e.b.p : e.a.p;
    var f = e.len > 0 ? Math.min(1, car.d / e.len) : 0;
    var k = mx(s[1]);
    var dx = (t[0] - s[0]) * k, dy = (t[1] - s[1]) * MLAT, L = Math.hypot(dx, dy) || 1;
    var ux = dx / L, uy = dy / L;
    var off = e.ow ? car.lane * 1.7 : (e.cls === 'minor' || e.cls === 'service' ? 1.5 : 2.1);
    var x = dx * f + uy * off, y = dy * f - ux * off;
    return { lon: s[0] + x / k, lat: s[1] + y / MLAT, ux: ux, uy: uy };
  }

  /** Yönlendirilmiş dikdörtgen (metre) → [lon,lat] halkası. */
  function rect(ps, along, len, wid, scale) {
    var k = mx(ps.lat), ux = ps.ux, uy = ps.uy, hl = len * scale / 2, hw = wid * scale / 2;
    var cx = ux * along * scale, cy = uy * along * scale;
    var pts = [[hl, hw], [hl, -hw], [-hl, -hw], [-hl, hw], [hl, hw]];
    return pts.map(function (q) {
      var x = cx + ux * q[0] + uy * q[1], y = cy + uy * q[0] - ux * q[1];
      return [ps.lon + x / k, ps.lat + y / MLAT];
    });
  }

  /** 3B araç gövdesi: alt gövde + kabin (+ taksi lambası). scale: görünürlük için büyütme. */
  function carFeatures(car, ps, scale, out) {
    var dm = DIM[car.kind], L = dm[0], W = dm[1], H = dm[2] * scale;
    var hide = car.e.tunnel;
    if (hide) return;
    if (car.kind === 'car' || car.kind === 'taxi') {
      out.push(feat(rect(ps, 0, L, W, scale), car.color, 0.25 * scale, H * 0.55));
      out.push(feat(rect(ps, -0.25, L * 0.5, W * 0.84, scale), shade(car.color), H * 0.55, H));
      if (car.kind === 'taxi') out.push(feat(rect(ps, -0.2, 0.5, 0.9, scale), '#222', H, H + 0.25 * scale));
    } else if (car.kind === 'truck') {
      out.push(feat(rect(ps, L / 2 - 1.1, 2.2, W, scale), '#c43c2c', 0.3 * scale, H * 0.8));
      out.push(feat(rect(ps, -1.2, L - 2.6, W, scale), car.color, 0.4 * scale, H));
    } else {
      out.push(feat(rect(ps, 0, L, W, scale), car.color, 0.3 * scale, H * 0.92));
      out.push(feat(rect(ps, 0, L * 0.92, W * 0.9, scale), car.kind === 'bus' ? '#cfd4d8' : '#e2e2dc', H * 0.92, H));
    }
  }
  function feat(ring, c, b, h) {
    return { type: 'Feature', properties: { c: c, b: b, h: h }, geometry: { type: 'Polygon', coordinates: [ring] } };
  }
  // Kabin camı: gövde renginden koyu, hafif mavimsi.
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    function m(x, t) { return Math.round(x * 0.35 + t * 0.65); }
    return 'rgb(' + m(r, 38) + ',' + m(g, 48) + ',' + m(b, 62) + ')';
  }

  /** Yeni araç için kenar seç: uzunluk × sınıf ağırlığı; isteğe bağlı süzgeç (ör. görünüm içi). */
  function spawn(graph, rnd, filter) {
    var list = filter ? graph.edges.filter(filter) : graph.edges;
    var total = 0, i;
    for (i = 0; i < list.length; i++) total += list[i].len * CLASS[list[i].cls].w;
    if (!total) return null;
    var r = rnd() * total;
    for (i = 0; i < list.length; i++) {
      var e = list[i];
      r -= e.len * CLASS[e.cls].w;
      if (r <= 0) {
        var fwd = e.ow ? true : rnd() < 0.5;
        return makeCar(e, fwd, rnd() * e.len, rnd);
      }
    }
    return null;
  }

  /** Graf yenilenince araçları yeni kenarlara taşır; bulunamayan araçlar null döner. */
  function remap(car, graph) {
    var e = graph.byKey.get(car.e.k);
    if (!e) return null;
    car.e = e;
    car.fwd = e.b.k === car.to;
    if (car.d > e.len) car.d = e.len;
    return car;
  }

  /** Görünür yol uzunluğundan hedef araç sayısı (yoğunluk 0: az, 1: normal, 2: yoğun). */
  function targetCount(graph, inView, level, max) {
    var w = 0;
    for (var i = 0; i < graph.edges.length; i++) {
      var e = graph.edges[i];
      if (inView(e)) w += e.len * CLASS[e.cls].w;
    }
    var per = [220, 115, 65][level];
    return Math.max(0, Math.min(max, Math.round(w / per)));
  }

  return {
    CLASS: CLASS, DIM: DIM, buildGraph: buildGraph, nextEdge: nextEdge, makeCar: makeCar, advance: advance,
    follow: follow, pose: pose, carFeatures: carFeatures, spawn: spawn, remap: remap, targetCount: targetCount,
    dist: dist, canEnter: canEnter
  };
})();
`;

/** Harita sayfası: MapLibre kurulumu, gece/gündüz, kamera turu, araç döngüsü ve RN köprüsü. */
const PAGE_JS = String.raw`
(function () {
  var O = window.__CITY_OPTS;
  function post(m) {
    var s = JSON.stringify(m);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }
  if (typeof maplibregl === 'undefined') { post({ type: 'error', reason: 'offline' }); return; }
  var seed = 1234567;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  var map;
  try {
    var probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { post({ type: 'error', reason: 'webgl' }); return; }
    map = new maplibregl.Map({
      container: 'map', style: O.style, center: [O.lon, O.lat], zoom: 16.9, pitch: 58, bearing: -20,
      maxPitch: 75, minZoom: 12, maxZoom: 19.5, attributionControl: { compact: true }, fadeDuration: 0,
      canvasContextAttributes: { antialias: true }
    });
  } catch (err) {
    post({ type: 'error', reason: 'webgl' });
    return;
  }

  var state = { paused: false, orbit: O.orbit, night: O.night, density: O.density, userAt: 0, loaded: false };
  var graph = null, cars = [], lastT = 0, lastDraw = 0, raf = 0;
  var MAX_CARS = 220;

  // --- Görünüm ---------------------------------------------------------------------------------
  var DAY = {
    background: '#efece6', water: '#7fb3d8', building: ['#f1ede6', '#e4ddd2', '#d6cdbf'],
    sky: { 'sky-color': '#7fb6e6', 'horizon-color': '#e3eef6', 'fog-color': '#eef2f4', 'sky-horizon-blend': 0.55, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.55, 'atmosphere-blend': 0 },
    light: { anchor: 'map', position: [1.4, 215, 35], color: '#fff6e8', intensity: 0.42 }
  };
  var NIGHT = {
    background: '#141a24', water: '#0b1a2c', building: ['#30333b', '#3b3f49', '#4a4f5c'],
    sky: { 'sky-color': '#05080f', 'horizon-color': '#1b2740', 'fog-color': '#121a28', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.6, 'atmosphere-blend': 0 },
    light: { anchor: 'map', position: [1.2, 200, 50], color: '#ffe2bd', intensity: 0.22 }
  };
  var dayPaint = {};

  function setPaint(id, prop, v) { if (map.getLayer(id)) try { map.setPaintProperty(id, prop, v); } catch (e) {} }
  function remember(id, prop) {
    var k = id + '|' + prop;
    if (!(k in dayPaint) && map.getLayer(id)) dayPaint[k] = map.getPaintProperty(id, prop);
  }

  function applyTheme() {
    var T = state.night ? NIGHT : DAY;
    map.getStyle().layers.forEach(function (l) {
      if (l.type === 'background') { remember(l.id, 'background-color'); setPaint(l.id, 'background-color', T.background); }
      else if (l.id === 'water') { remember(l.id, 'fill-color'); setPaint(l.id, 'fill-color', T.water); }
      else if (l.type === 'fill' && l.id !== 'water') {
        remember(l.id, 'fill-color'); remember(l.id, 'fill-opacity');
        if (state.night) { setPaint(l.id, 'fill-color', '#1c2330'); setPaint(l.id, 'fill-opacity', 0.55); }
        else { setPaint(l.id, 'fill-color', dayPaint[l.id + '|fill-color']); setPaint(l.id, 'fill-opacity', dayPaint[l.id + '|fill-opacity']); }
      } else if (l.type === 'line' && /^(road|bridge|tunnel)_/.test(l.id) && !/casing|rail|hatching|arrow/.test(l.id)) {
        remember(l.id, 'line-color');
        setPaint(l.id, 'line-color', state.night ? (/trunk|primary|motorway/.test(l.id) ? '#6b5a3a' : '#3a4352') : dayPaint[l.id + '|line-color']);
      } else if (l.type === 'line' && /casing/.test(l.id)) {
        remember(l.id, 'line-color');
        setPaint(l.id, 'line-color', state.night ? '#0e131b' : dayPaint[l.id + '|line-color']);
      } else if (l.type === 'symbol') {
        remember(l.id, 'text-color'); remember(l.id, 'text-halo-color');
        setPaint(l.id, 'text-color', state.night ? '#c9d3e3' : dayPaint[l.id + '|text-color']);
        setPaint(l.id, 'text-halo-color', state.night ? 'rgba(10,14,22,0.85)' : dayPaint[l.id + '|text-halo-color']);
      }
    });
    var b = T.building;
    setPaint('building-3d', 'fill-extrusion-color', ['interpolate', ['linear'], ['get', 'render_height'], 0, b[0], 20, b[1], 45, b[2]]);
    setPaint('building-3d', 'fill-extrusion-opacity', 1);
    setPaint('lights', 'circle-opacity', state.night ? 0.95 : 0);
    setPaint('lights', 'circle-stroke-opacity', 0);
    setPaint('lamps', 'circle-opacity', state.night ? 0.5 : 0);
    try { map.setSky(T.sky); } catch (e) {}
    try { map.setLight(T.light); } catch (e) {}
    document.body.style.background = state.night ? '#05080f' : '#cfe3f3';
    document.body.className = state.night ? 'night' : '';
  }

  map.on('styleimagemissing', function (e) {
    // Eksik POI simgeleri için boş görsel (konsol uyarısını önler).
    if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
  });

  map.on('load', function () {
    state.loaded = true;
    // Kalabalığı azalt: dükkân/POI simgeleri gizlenir; sokak ve semt adları kalır.
    ['poi_r20', 'poi_r7', 'poi_r1', 'poi_transit', 'highway-shield-non-us', 'highway-shield-us-interstate', 'road_shield_us', 'road_one_way_arrow', 'road_one_way_arrow_opposite']
      .forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none'); });

    // Binalar: OSM'de kat bilgisi olmayan çoğu yapı 4–5 m görünür; Rize merkezindeki apartman dokusuna
    // yakın olsun diye yüksekliği bilinmeyenler yapı kimliğine bağlı sabit bir değerle 3–9 kat (9–27 m) yapılır.
    if (map.getLayer('building-3d')) {
      map.setLayerZoomRange('building-3d', 13.5, 24);
      map.setPaintProperty('building-3d', 'fill-extrusion-height', [
        'case', ['>', ['coalesce', ['get', 'render_height'], 0], 6], ['get', 'render_height'],
        ['+', 9, ['*', 3, ['%', ['coalesce', ['id'], 0], 7]]]
      ]);
      map.setPaintProperty('building-3d', 'fill-extrusion-vertical-gradient', true);
    }

    map.addSource('cars', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, tolerance: 0, buffer: 8 });
    map.addLayer({
      id: 'cars', type: 'fill-extrusion', source: 'cars',
      paint: {
        'fill-extrusion-color': ['get', 'c'], 'fill-extrusion-base': ['get', 'b'], 'fill-extrusion-height': ['get', 'h'],
        'fill-extrusion-opacity': 1, 'fill-extrusion-vertical-gradient': false
      }
    });
    map.addSource('lights', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, tolerance: 0 });
    map.addLayer({
      id: 'lights', type: 'circle', source: 'lights',
      paint: {
        'circle-color': ['get', 'c'], 'circle-blur': 0.9, 'circle-opacity': 0,
        'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 14, ['*', 0.6, ['get', 'r']], 18, ['*', 9, ['get', 'r']]],
        'circle-pitch-alignment': 'map'
      }
    });
    // Sokak lambaları (gece): ana yolların köşe noktalarında sıcak ışık halkaları.
    map.addSource('lamps', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'lamps', type: 'circle', source: 'lamps',
      paint: {
        'circle-color': '#ffcf7a', 'circle-blur': 1, 'circle-opacity': 0, 'circle-pitch-alignment': 'map',
        'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 14, 2, 18, 34]
      }
    }, 'building-3d');

    applyTheme();
    post({ type: 'ready' });
    rebuild();
    start();
  });

  map.on('error', function (e) {
    if (!state.loaded) { clearTimeout(window.__offT); window.__offT = setTimeout(function () { if (!state.loaded) post({ type: 'error', reason: 'offline' }); }, 12000); }
  });
  setTimeout(function () { if (!state.loaded) post({ type: 'error', reason: 'offline' }); }, 25000);

  // --- Yol ağı -----------------------------------------------------------------------------------
  var ROAD_CLASSES = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'];
  function rebuild() {
    if (!state.loaded) return;
    var feats = map.querySourceFeatures('openmaptiles', { sourceLayer: 'transportation', filter: ['in', ['get', 'class'], ['literal', ROAD_CLASSES]] });
    var lines = [];
    feats.forEach(function (f) {
      var g = f.geometry, p = f.properties;
      var parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
      // ramp/link (kavşak kolları) yollar da ağa dahil; servis yolları seyrek kullanılır.
      parts.forEach(function (c) { lines.push({ coords: c, cls: p['class'], oneway: p.oneway || 0, tunnel: p.brunnel === 'tunnel' }); });
    });
    graph = CitySim.buildGraph(lines);
    var kept = [];
    cars.forEach(function (c) { var r = CitySim.remap(c, graph); if (r) kept.push(r); });
    cars = kept;
    // Lambalar: ana yol köşeleri, ~35 m arayla.
    var lamps = [], last = null;
    graph.edges.forEach(function (e) {
      if (!/trunk|primary|secondary|tertiary/.test(e.cls) || e.tunnel) return;
      var n = Math.floor(e.len / 35);
      for (var i = 0; i <= n; i++) {
        var f = n ? i / n : 0, p = [e.a.p[0] + (e.b.p[0] - e.a.p[0]) * f, e.a.p[1] + (e.b.p[1] - e.a.p[1]) * f];
        if (last && CitySim.dist(last, p) < 25) continue;
        lamps.push({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: p } });
        last = p;
      }
    });
    map.getSource('lamps').setData({ type: 'FeatureCollection', features: lamps.slice(0, 1500) });
    var roads = 0; graph.edges.forEach(function (e) { roads += e.len; });
    post({ type: 'stats', cars: cars.length, roads: Math.round(roads) });
  }
  var rebuildT = 0;
  map.on('idle', function () { clearTimeout(rebuildT); rebuildT = setTimeout(rebuild, 150); });
  map.on('sourcedata', function (e) {
    if (e.sourceId === 'openmaptiles' && e.isSourceLoaded) { clearTimeout(rebuildT); rebuildT = setTimeout(rebuild, 400); }
  });

  // --- Görünüm sınırları ---------------------------------------------------------------------------
  function viewBox(pad) {
    var b = map.getBounds(), w = b.getEast() - b.getWest(), h = b.getNorth() - b.getSouth();
    return [b.getWest() - w * pad, b.getSouth() - h * pad, b.getEast() + w * pad, b.getNorth() + h * pad];
  }
  function inBox(p, bb) { return p[0] >= bb[0] && p[0] <= bb[2] && p[1] >= bb[1] && p[1] <= bb[3]; }
  function edgeIn(bb) { return function (e) { return inBox(e.a.p, bb) || inBox(e.b.p, bb); }; }

  // --- Döngü ---------------------------------------------------------------------------------------
  function carScale() {
    // Görünürlük için araçlar uzak yakınlaştırmada biraz büyütülür (yakında gerçek boyutuna iner).
    var z = map.getZoom();
    return z >= 18.5 ? 1.15 : z <= 15 ? 3 : 3 - (z - 15) * (1.85 / 3.5);
  }

  function tick(t) {
    raf = 0;
    if (state.paused) return;
    var dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0.016;
    lastT = t;
    if (state.orbit && graph && t - state.userAt > 9000 && !map.isMoving()) {
      map.setBearing(map.getBearing() + dt * 2.6);
    }
    if (graph && graph.edges.length) {
      var sim = dt * 1.6; // "vızır vızır": gerçek hızın 1,6 katı
      var view = viewBox(0.15), keep = viewBox(0.6);
      var want = CitySim.targetCount(graph, edgeIn(view), state.density, MAX_CARS);
      CitySim.follow(cars, sim);
      var next = [];
      for (var i = 0; i < cars.length; i++) {
        var c = cars[i];
        if (!CitySim.advance(c, sim, rnd)) continue;
        var ps = CitySim.pose(c);
        if (!inBox([ps.lon, ps.lat], keep)) continue; // çok uzaklaşan araç bırakılır
        next.push(c);
      }
      cars = next.slice(0, Math.max(want, 0) + 20);
      // Eksik araçlar: ilk açılışta her yere, sonra görünümün kenarlarına doğar (aniden belirmesin).
      var outer = viewBox(0.45), visible = viewBox(0);
      var fresh = cars.length === 0, adds = 0;
      while (cars.length < want && adds++ < 12) {
        var nc = CitySim.spawn(graph, rnd, fresh ? edgeIn(view) : function (e) { return edgeIn(outer)(e) && !(inBox(e.a.p, visible) && inBox(e.b.p, visible)); });
        if (!nc) nc = CitySim.spawn(graph, rnd, edgeIn(view));
        if (!nc) break;
        cars.push(nc);
      }
      if (t - lastDraw > 33) { draw(); lastDraw = t; }
    }
    raf = requestAnimationFrame(tick);
  }

  function draw() {
    var feats = [], lights = [], s = carScale();
    for (var i = 0; i < cars.length; i++) {
      var c = cars[i], ps = CitySim.pose(c);
      CitySim.carFeatures(c, ps, s, feats);
      if (state.night && !c.e.tunnel) {
        var L = CitySim.DIM[c.kind][0] * s / 2 + 1.5 * s, k = 111320 * Math.cos(ps.lat * Math.PI / 180);
        lights.push(pt(ps.lon + ps.ux * L / k, ps.lat + ps.uy * L / 111320, '#fff3c4', 1.2));
        var B = CitySim.DIM[c.kind][0] * s / 2;
        lights.push(pt(ps.lon - ps.ux * B / k, ps.lat - ps.uy * B / 111320, '#ff2a1a', 0.45));
      }
    }
    map.getSource('cars').setData({ type: 'FeatureCollection', features: feats });
    if (state.night) map.getSource('lights').setData({ type: 'FeatureCollection', features: lights });
  }
  function pt(lon, lat, c, r) { return { type: 'Feature', properties: { c: c, r: r }, geometry: { type: 'Point', coordinates: [lon, lat] } }; }

  function start() { if (!raf && !state.paused) { lastT = 0; raf = requestAnimationFrame(tick); } }

  // Kullanıcı haritayı ellerse kamera turu 9 sn durur.
  ['dragstart', 'zoomstart', 'rotatestart', 'pitchstart'].forEach(function (ev) {
    map.on(ev, function (e) { if (e.originalEvent) state.userAt = performance.now(); });
  });

  // --- Komutlar ------------------------------------------------------------------------------------
  window.cityCmd = function (c) {
    if (!c || !c.type) return;
    if (c.type === 'pause') { state.paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; }
    else if (c.type === 'resume') { state.paused = false; start(); }
    else if (c.type === 'orbit') { state.orbit = !!c.on; state.userAt = 0; }
    else if (c.type === 'night') {
      state.night = !!c.on;
      if (state.loaded) { applyTheme(); if (!state.night) map.getSource('lights').setData({ type: 'FeatureCollection', features: [] }); }
    }
    else if (c.type === 'density') { state.density = c.level; }
    else if (c.type === 'fly') {
      cars = [];
      state.userAt = 0;
      map.flyTo({ center: [c.lon, c.lat], zoom: c.zoom || 16.9, pitch: 58, speed: 1.1, curve: 1.3, essential: true });
    }
  };
  window.addEventListener('message', function (e) {
    try { window.cityCmd(typeof e.data === 'string' ? JSON.parse(e.data) : e.data); } catch (err) {}
  });
  document.addEventListener('message', function (e) { // Android WebView eski köprü
    try { window.cityCmd(JSON.parse(e.data)); } catch (err) {}
  });
})();
`;

/** WebView/iframe içine verilen tam HTML. */
export function cityHtml(o: CityPageOptions): string {
  const opts = { lon: o.lon, lat: o.lat, night: o.night, orbit: o.orbit, density: o.density, style: MAP_STYLE_URL };
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="${o.cssUrl ?? MAPLIBRE_CSS}">
<style>
html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:${o.night ? '#05080f' : '#cfe3f3'}}
.maplibregl-ctrl-attrib{font:11px system-ui,sans-serif;opacity:.85}
.maplibregl-ctrl-bottom-right{bottom:4px}
body.night .maplibregl-ctrl-attrib{background:rgba(12,16,24,.75);color:#c9d3e3}
body.night .maplibregl-ctrl-attrib a{color:#c9d3e3}
</style></head><body><div id="map"></div>
<script>window.__CITY_OPTS=${JSON.stringify(opts)};</script>
<script>${CITY_SIM_JS}</script>
<script src="${o.scriptUrl ?? MAPLIBRE_JS}" onerror="window.__noLib=1"></script>
<script>${PAGE_JS}</script>
</body></html>`;
}

/** Kısayol noktaları (Rize'de bina verisi en zengin yerler önce). */
export type CitySpot = { id: string; label: string; lon: number; lat: number; zoom?: number };
