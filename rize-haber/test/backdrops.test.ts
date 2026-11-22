// Sekme arka planları: kayıt düzeni, okunurluk (beyaz yazı) ve kayıtlı seçimin güvenli okunması.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  BACKDROPS,
  BACKDROP_TABS,
  DEFAULT_BACKDROPS,
  backdropFor,
  sanitizeBackdrops,
  weatherLandscape,
  weatherStyle,
  type BackdropTab,
} from '../src/backdrops.ts';
import { luminance, sceneFor } from '../src/weatherScene.ts';

/** WCAG göreli parlaklık ve beyazla karşıtlık oranı. */
function relLum(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}
const whiteContrast = (hex: string) => 1.05 / (relLum(hex) + 0.05);

const TABS = Object.keys(BACKDROPS) as BackdropTab[];

test('her sekmede ilk seçenek özgün sahne, en az dört seçenek, kimlikler benzersiz', () => {
  assert.deepEqual(new Set(BACKDROP_TABS.map((t) => t.id)), new Set(TABS));
  for (const tab of TABS) {
    const list = BACKDROPS[tab];
    assert.ok(list.length >= 4, `${tab}: en az 4 seçenek`);
    assert.equal(list[0].scene, undefined, `${tab}: ilk seçenek özgün sahne`);
    assert.equal(DEFAULT_BACKDROPS[tab], list[0].id);
    assert.equal(new Set(list.map((b) => b.id)).size, list.length, `${tab}: benzersiz kimlik`);
    for (const b of list) {
      assert.ok(b.name.length > 0 && b.hint.length > 0 && b.icon.length > 0, `${tab}/${b.id}: ad, açıklama, simge`);
      assert.ok(b.hint.length <= 70, `${tab}/${b.id}: açıklama kısa (Ayarlar'da tek satırda okunur)`);
    }
  }
  // Hava sekmesinin seçenekleri sabit sahne değil, manzara türüdür.
  assert.ok(BACKDROPS.weather.every((b) => !b.scene));
});

test('yeni sahneler beyaz yazının okunacağı kadar koyu; başlık gökyüzünün ilk rengi', () => {
  for (const tab of TABS) {
    for (const b of BACKDROPS[tab]) {
      const s = b.scene;
      if (!s) continue;
      const name = `${tab}/${b.id}`;
      assert.equal(s.sky.length, s.stops.length, `${name}: renk ve durak sayısı`);
      s.stops.forEach((v, i) => {
        assert.ok(v >= 0 && v <= 1, `${name}: durak 0–1`);
        if (i > 0) assert.ok(v > s.stops[i - 1], `${name}: duraklar artan`);
      });
      assert.equal(s.chrome.header, s.sky[0], `${name}: başlık gökyüzüyle kesintisiz`);
      for (const c of [s.chrome.header, s.chrome.footer]) {
        assert.ok(whiteContrast(c) >= 7, `${name}: çerçeve ${c} beyaz yazıyla en az 7:1`);
        assert.ok(luminance(c) < 0.36, `${name}: çerçeve koyu`);
      }
      for (const c of s.sky) assert.ok(whiteContrast(c) >= 4.5, `${name}: gökyüzü ${c} beyaz yazıyla en az 4.5:1`);
      assert.ok(s.veil >= 0 && s.veil <= 0.5, `${name}: karartma ölçülü`);
    }
  }
});

test('sahne katmanlarının ölçüleri ekran oranı içinde ve parçacık sayıları sınırlı', () => {
  for (const tab of TABS) {
    for (const b of BACKDROPS[tab]) {
      for (const e of b.scene?.effects ?? []) {
        const name = `${tab}/${b.id}/${e.type}`;
        if (e.type === 'ridge') {
          assert.ok(e.base > 0 && e.base <= 1, name);
          for (const [, rise, w] of e.peaks) assert.ok(rise > 0 && rise < e.base && w > 0, name);
        }
        if (e.type === 'bokeh' || e.type === 'motes') assert.ok(e.top < e.bottom && e.top >= 0 && e.bottom <= 1, name);
        if (e.type === 'bokeh') assert.ok(e.size[0] <= e.size[1], name);
        if ('count' in e) assert.ok(e.count > 0 && e.count <= 120, `${name}: telefonda akıcılık için en fazla 120`);
      }
    }
  }
});

test('kayıtlı seçim: bilinmeyen, eksik ya da bozuk değer özgün sahneye düşer', () => {
  assert.deepEqual(sanitizeBackdrops(undefined), DEFAULT_BACKDROPS);
  assert.deepEqual(sanitizeBackdrops('bozuk'), DEFAULT_BACKDROPS);
  assert.deepEqual(sanitizeBackdrops({ news: 'yok-boyle-sahne', tea: 42 }), DEFAULT_BACKDROPS);
  const kept = sanitizeBackdrops({ news: 'firtina', economy: 'altin', weather: 'kiyi' });
  assert.equal(kept.news, 'firtina');
  assert.equal(kept.economy, 'altin');
  assert.equal(kept.weather, 'kiyi');
  assert.equal(kept.tea, DEFAULT_BACKDROPS.tea);
  assert.equal(backdropFor('rizespor', { rizespor: 'konfeti' }).name, 'Konfeti');
  assert.equal(weatherStyle(null), 'canli');
});

test('hava manzarası her havada gökyüzünden koyu; canlı ve sade seçenek manzara eklemez', () => {
  assert.deepEqual(weatherLandscape('canli', ['#2F7FD3', '#7DB9EE']), []);
  assert.deepEqual(weatherLandscape('sade', ['#2F7FD3', '#7DB9EE']), []);
  for (const code of [0, 2, 3, 45, 61, 65, 73, 95]) {
    for (const isDay of [true, false]) {
      const sky = sceneFor(code, isDay).sky;
      for (const style of ['kackar', 'kiyi'] as const) {
        const layers = weatherLandscape(style, sky);
        assert.ok(layers.length > 0);
        for (const e of layers) {
          const cs = e.type === 'ridge' ? [e.color] : e.type === 'sea' ? [...e.colors] : [];
          for (const c of cs) assert.ok(luminance(c) < luminance(sky[1]), `${style} ${code}: ${c} gökyüzünden koyu`);
        }
      }
    }
  }
});
