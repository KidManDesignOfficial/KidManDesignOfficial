import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CITY_SIM_JS, MAPLIBRE_JS, cityHtml } from '../src/city/cityPage.ts';

type P = [number, number];
// Sayfadaki simülasyon kodu metin olarak tutulur; burada aynen çalıştırılır.
const Sim = new Function(`${CITY_SIM_JS}; return CitySim;`)();

/** Rize merkezinde metre ofsetinden [lon,lat]. */
const O: P = [40.52, 41.02];
const at = (east: number, north: number): P => [O[0] + east / (111320 * Math.cos((O[1] * Math.PI) / 180)), O[1] + north / 111320];
function seq(seed = 7) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff), s / 0x7fffffff);
}

test('Yol ağı: karo parçaları ortak köşede birleşir, yinelenen kenar atılır, kısa kör uç budanır', () => {
  const g = Sim.buildGraph([
    { coords: [at(0, 0), at(100, 0)], cls: 'primary' },
    { coords: [at(100, 0), at(200, 0)], cls: 'primary' },
    { coords: [at(0, 0), at(100, 0)], cls: 'primary' }, // komşu karodaki aynı parça
    { coords: [at(100, 0), at(100, 80)], cls: 'minor' },
    { coords: [at(200, 0), at(212, 0)], cls: 'primary' }, // 12 m karo kesiği
    { coords: [at(0, 0), at(0, 50)], cls: 'path' }, // yaya yolu: ağa girmez
  ]);
  assert.equal(g.edges.length, 3);
  assert.ok(g.edges.every((e: { len: number }) => e.len > 50));
  const mid = g.nodes.get(Sim.buildGraph([{ coords: [at(100, 0), at(200, 0)], cls: 'minor' }]).edges[0].a.k);
  assert.equal(mid.e.length, 3);
});

test('Tek yön: -1 yönlü yol çevrilir; araç tek yönlü yola ters yönden hiç girmez', () => {
  // Kare blok: üst kenar tek yön (doğu→batı yazılmış ama -1: batı→doğu), diğerleri çift yön.
  const A = at(0, 0), B = at(120, 0), C = at(120, 120), D = at(0, 120);
  const g = Sim.buildGraph([
    { coords: [A, B], cls: 'secondary' },
    { coords: [B, C], cls: 'secondary' },
    { coords: [C, D], cls: 'secondary', oneway: -1 },
    { coords: [D, A], cls: 'secondary' },
  ]);
  const one = g.edges.find((e: { ow: boolean }) => e.ow);
  assert.equal(one.a.p, D);
  assert.equal(one.b.p, C);
  const rnd = seq();
  for (let k = 0; k < 20; k++) {
    const car = Sim.spawn(g, rnd);
    for (let i = 0; i < 400; i++) {
      assert.ok(Sim.advance(car, 0.25, rnd));
      if (car.e.ow) assert.equal(car.fwd, true, 'tek yönlü yolda ters yön');
    }
  }
});

test('Sağdan gidiş: kuzeye giden araç yolun doğusunda, güneye giden batısında', () => {
  const g = Sim.buildGraph([{ coords: [at(0, 0), at(0, 200)], cls: 'tertiary' }]);
  const e = g.edges[0];
  const north = Sim.pose({ e, fwd: e.a.p[1] < e.b.p[1], d: 50, lane: 0 });
  const south = Sim.pose({ e, fwd: e.a.p[1] > e.b.p[1], d: 50, lane: 0 });
  assert.ok(north.lon > O[0] && south.lon < O[0]);
  assert.ok(Math.abs(north.uy - 1) < 1e-6 && Math.abs(south.uy + 1) < 1e-6);
});

test('Takip mesafesi: öndeki araca yaklaşan durur, yol açıkken hızlanır', () => {
  const g = Sim.buildGraph([{ coords: [at(0, 0), at(400, 0)], cls: 'primary' }]);
  const e = g.edges[0];
  const rnd = seq(3);
  const lead = Sim.makeCar(e, true, 100, rnd);
  const back = Sim.makeCar(e, true, 94, rnd);
  lead.kind = back.kind = 'car';
  lead.v = 0;
  back.v = 12;
  back.lane = lead.lane = 0;
  for (let i = 0; i < 30; i++) Sim.follow([lead, back], 0.1);
  assert.ok(back.v < 1, String(back.v));
  const free = Sim.makeCar(e, true, 10, rnd);
  free.v = 0;
  for (let i = 0; i < 60; i++) Sim.follow([free], 0.1);
  assert.ok(free.v > 5);
});

test('3B araç: gövde + kabin; tünelde çizilmez; boyutlar gerçekçi', () => {
  const g = Sim.buildGraph([{ coords: [at(0, 0), at(100, 0)], cls: 'trunk' }]);
  const e = g.edges[0];
  const car = { ...Sim.makeCar(e, true, 50, seq()), kind: 'car', color: '#a3201b' };
  const out: { properties: { b: number; h: number } }[] = [];
  Sim.carFeatures(car, Sim.pose(car), 1, out);
  assert.equal(out.length, 2);
  assert.ok(out[1].properties.h > out[0].properties.h);
  assert.ok(Math.abs(Sim.dist(...((out[0] as unknown as { geometry: { coordinates: P[][] } }).geometry.coordinates[0].slice(0, 2) as [P, P])) - 1.8) < 0.05);
  const hidden: unknown[] = [];
  Sim.carFeatures({ ...car, e: { ...e, tunnel: true } }, Sim.pose(car), 1, hidden);
  assert.equal(hidden.length, 0);
  assert.equal(Sim.DIM.bus[0] > Sim.DIM.car[0] * 2, true);
});

test('Sayfa: sabit MapLibre sürümü, şablon artığı yok, seçenekler gömülü', () => {
  const html = cityHtml({ lon: 40.5195, lat: 41.0245, night: true, orbit: false, density: 2 });
  assert.match(MAPLIBRE_JS, /maplibre-gl@\d+\.\d+\.\d+\//);
  assert.ok(html.includes(MAPLIBRE_JS));
  assert.ok(!html.includes('${'));
  assert.ok(html.includes('"night":true') && html.includes('"density":2'));
  assert.ok(html.includes('tiles.openfreemap.org/styles/liberty'));
});

test('Trafik kilitlenmez: kalabalık bir mahallede araçlar uzun süre akmaya devam eder', () => {
  // 4×4 ızgara (100 m bloklar), bir ana cadde tek yön; 120 araç.
  const lines: { coords: P[]; cls: string; oneway?: number }[] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      if (i < 3) lines.push({ coords: [at(i * 100, j * 100), at((i + 1) * 100, j * 100)], cls: j === 1 ? 'primary' : 'minor', oneway: j === 1 ? 1 : 0 });
      if (j < 3) lines.push({ coords: [at(i * 100, j * 100), at(i * 100, (j + 1) * 100)], cls: 'tertiary' });
    }
  const g = Sim.buildGraph(lines);
  const rnd = seq(11);
  let cars = Array.from({ length: 120 }, () => Sim.spawn(g, rnd));
  let moving = 0;
  for (let step = 0; step < 3000; step++) {
    Sim.follow(cars, 0.05);
    cars = cars.filter((c: unknown) => Sim.advance(c, 0.05, rnd));
    while (cars.length < 120) cars.push(Sim.spawn(g, rnd));
    if (step > 2500) moving += cars.filter((c: { v: number }) => c.v > 1).length / cars.length;
  }
  assert.ok(moving / 499 > 0.5, `hareket eden oran ${(moving / 499).toFixed(2)}`);
});
