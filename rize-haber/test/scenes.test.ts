// Ekonomi ve Çay sahneleri: okunaklı çubuk renkleri ve süsleme grafiklerinin geometrisi.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { candleSeries, ECON_CHROME, ECON_SKY, FLAGS, segments, trendLine } from '../src/economyScene.ts';
import { CURRENCIES } from '../src/markets.ts';
import { TEA_CHROME, TEA_SKY } from '../src/teaScene.ts';
import { luminance } from '../src/weatherScene.ts';

test('ekonomi ve çay sahnesi: başlık gökyüzüyle aynı, çubuklar beyaz yazıya yetecek kadar koyu', () => {
  for (const [chrome, sky] of [
    [ECON_CHROME, ECON_SKY],
    [TEA_CHROME, TEA_SKY],
  ] as const) {
    assert.equal(chrome.header, sky[0]);
    assert.ok(luminance(chrome.header) < 0.36);
    assert.ok(luminance(chrome.footer) < 0.36);
  }
});

test('mum serisi: tekrarlanabilir, 0–1 içinde, fitiller gövdeyi kapsar, yukarı eğilimli', () => {
  const a = candleSeries(24, 3);
  assert.deepEqual(a, candleSeries(24, 3));
  assert.equal(a.length, 24);
  for (const c of a) {
    for (const v of [c.open, c.close, c.high, c.low]) assert.ok(v >= 0 && v <= 1);
    assert.ok(c.high >= Math.max(c.open, c.close));
    assert.ok(c.low <= Math.min(c.open, c.close));
  }
  assert.ok(a[a.length - 1].close > a[0].open);
});

test('eğilim çizgisi 0–1 içinde ve sonu başından yüksek', () => {
  const t = trendLine(22, 1);
  assert.equal(t.length, 22);
  assert.ok(t.every((v) => v >= 0 && v <= 1));
  assert.ok(t[t.length - 1] > t[0]);
});

test('çizgi parçası iki noktanın ortasında, doğru uzunluk ve açıda', () => {
  const [s] = segments([{ x: 0, y: 0 }, { x: 30, y: 40 }], 2);
  assert.equal(s.length, 50);
  assert.equal(s.left, 15 - 25);
  assert.equal(s.top, 20 - 1);
  assert.ok(Math.abs(s.angle - (Math.atan2(40, 30) * 180) / Math.PI) < 1e-9);
  assert.equal(segments([{ x: 0, y: 0 }], 2).length, 0);
});

test('her dövizin bayrağı var', () => {
  for (const c of CURRENCIES) assert.ok(FLAGS[c.code], c.code);
});
