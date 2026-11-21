// Haberler ekranının Rize manzarası: saate göre palet ve okunaklılık.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { rizePhase, rizeSkyFor } from '../src/rizeScene.ts';
import { STADIUM_CHROME, STADIUM_SKY } from '../src/rizespor/stadium.ts';
import { luminance } from '../src/weatherScene.ts';

test('günün saatine göre evre', () => {
  assert.equal(rizePhase(5), 'night');
  assert.equal(rizePhase(6), 'day');
  assert.equal(rizePhase(16), 'day');
  assert.equal(rizePhase(17), 'evening');
  assert.equal(rizePhase(19), 'evening');
  assert.equal(rizePhase(20), 'night');
  assert.equal(rizePhase(0), 'night');
});

test('her evrede başlık ve sekme çubuğu beyaz yazıya yetecek kadar koyu', () => {
  for (let h = 0; h < 24; h++) {
    const s = rizeSkyFor(h);
    assert.equal(s.chrome.header, s.sky[0], 'başlık gökyüzünün üst rengiyle birleşir');
    assert.ok(luminance(s.chrome.header) < 0.36, `${h}: başlık çok açık`);
    assert.ok(luminance(s.chrome.footer) < 0.36, `${h}: sekme çubuğu çok açık`);
  }
});

test('stadyum sahnesi: başlık gökyüzüyle aynı, çubuklar koyu', () => {
  assert.equal(STADIUM_CHROME.header, STADIUM_SKY[0]);
  assert.ok(luminance(STADIUM_CHROME.header) < 0.36);
  assert.ok(luminance(STADIUM_CHROME.footer) < 0.36);
});
