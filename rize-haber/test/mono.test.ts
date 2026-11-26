// "Tek renk" düzeni: sahne filtresi, çerçeve tonlama ve vurgu tonlamanın doğruluğu ve okunurluğu.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ACCENTS, buildColors, sceneTint, tint, type AccentId } from '../src/colors.ts';
import { BACKDROPS } from '../src/backdrops.ts';
import { ECON_CHROME, MARKET } from '../src/economyScene.ts';
import { GLASS, STADIUM_CHROME } from '../src/rizespor/stadium.ts';
import { TEA_CHROME, TEA_GLASS } from '../src/teaScene.ts';
import { hueOf, monoTint, parseColor, sceneFilter, sceneTone, simulateFilter, uiTone } from '../src/mono.ts';

const accents = Object.keys(ACCENTS) as AccentId[];

function relLum(color: string): number {
  const p = parseColor(color)!;
  const ch = p.rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
const contrastWithWhite = (c: string) => 1.05 / (relLum(c) + 0.05);
const hueGap = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

test('kapalıyken renkler değişmez; açıkken colors.mono dolu', () => {
  const off = buildColors('cay', false);
  assert.equal(off.mono, null);
  assert.equal(tint(off, '#7BE0A6'), '#7BE0A6');
  assert.equal(sceneTint(off, '#050D1C'), '#050D1C');
  assert.ok(buildColors('cay', true, 'klasik', true).mono);
});

test('sahne filtresi gri pikseli seçilen rengin tonuna boyar (her renk için ±8°; açık gride kırpılma payı)', () => {
  for (const id of accents) {
    if (id === 'grafit') continue;
    const t = monoTint(ACCENTS[id].light);
    const want = hueOf(ACCENTS[id].light)!;
    for (const gray of ['#303030', '#808080', '#B0B0B0']) {
      const got = hueOf(simulateFilter(t, gray));
      assert.ok(got !== null && hueGap(got, want) <= 8, `${id} ${gray}: ${got} ≠ ${want}`);
    }
  }
});

test('Grafit tam siyah-beyaz: yalnızca gri ton filtresi, çıktı nötr', () => {
  const t = monoTint(ACCENTS.grafit.light);
  assert.equal(t.neutral, true);
  assert.equal(sceneFilter(t, 'android'), 'grayscale(1)');
  assert.equal(hueOf(sceneTone(t, '#1B6B3A')), null);
  assert.equal(hueOf(uiTone(t, '#F2C75C')), null);
});

test('Android filtreyi sondan başa uygular: sıra ters çevrilir, önce gri ton işler', () => {
  const t = monoTint(ACCENTS.cay.light);
  const android = sceneFilter(t, 'android').split(' ');
  const web = sceneFilter(t, 'web').split(' ');
  assert.equal(android.at(-1), 'grayscale(1)');
  assert.equal(web[0], 'grayscale(1)');
  assert.deepEqual([...android].reverse(), web);
});

test('JS tonlaması filtreyle birebir aynı: başlık ile sahnenin ilk rengi arasında dikiş olmaz', () => {
  for (const id of accents) {
    const t = monoTint(ACCENTS[id].light);
    for (const c of [STADIUM_CHROME.header, TEA_CHROME.footer, ECON_CHROME.header, '#1D6782', '#FFDB8F']) {
      assert.equal(sceneTone(t, c), simulateFilter(t, c), `${id} ${c}`);
    }
  }
});

test('tek renkte her sekmenin ve her arka planın çerçevesi beyaz yazıyla okunur (≥ 4,5:1)', () => {
  const chromes = [STADIUM_CHROME, TEA_CHROME, ECON_CHROME, ...Object.values(BACKDROPS).flatMap((list) => list.flatMap((b) => (b.scene ? [b.scene.chrome] : [])))];
  for (const id of accents) {
    const c = buildColors(id, true, 'klasik', true);
    for (const ch of chromes) {
      for (const which of ['header', 'footer'] as const) {
        const toned = sceneTint(c, ch[which]);
        assert.ok(contrastWithWhite(toned) >= 4.5, `${id} ${which} ${ch[which]} → ${toned}: ${contrastWithWhite(toned).toFixed(2)}`);
      }
    }
  }
});

test('vurgu tonlama: açıklık ve saydamlık korunur, ton seçilen renkten gelir, beyaz/gri değişmez', () => {
  const t = monoTint(ACCENTS.deniz.light);
  for (const c of [GLASS.accent, MARKET.gold, TEA_GLASS.accent, '#0A8A43']) {
    const out = uiTone(t, c);
    assert.ok(hueGap(hueOf(out)!, t.hue) < 2, `${c} → ${out}`);
    assert.ok(Math.abs(relLum(out) - relLum(c)) < 0.12, `${c} açıklığı korunmalı`);
  }
  assert.equal(uiTone(t, '#FFFFFF'), '#FFFFFF');
  assert.equal(uiTone(t, 'rgba(255,255,255,0.74)'), 'rgba(255,255,255,0.74)');
  assert.equal(uiTone(t, '#8A94A6'), '#8A94A6');
  assert.match(uiTone(t, 'rgba(242,199,92,0.3)'), /^rgba\(\d+,\d+,\d+,0\.3\)$/);
});
