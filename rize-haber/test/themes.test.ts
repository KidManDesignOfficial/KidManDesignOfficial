import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ACCENTS, PALETTE_IDS, PALETTES, buildColors, type AccentId } from '../src/colors.ts';

function lum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const accents = Object.keys(ACCENTS) as AccentId[];

test('Klasik tema önceki sürümün renkleriyle birebir aynı (varsayılan değişmedi)', () => {
  assert.deepEqual(buildColors('cay', false), buildColors('cay', false, 'klasik'));
  const light = buildColors('cay', false, 'klasik');
  const dark = buildColors('cay', true, 'klasik');
  assert.equal(light.background, '#F4F6F5');
  assert.equal(light.primarySoft, '#e4ede7');
  assert.equal(dark.background, '#0F1311');
  assert.equal(dark.header, '#124626');
});

test('Her tema her renk ve açık/koyu görünümde okunur (WCAG AA)', () => {
  for (const palette of PALETTE_IDS) {
    for (const accent of accents) {
      for (const isDark of [false, true]) {
        const c = buildColors(accent, isDark, palette);
        const where = `${palette}/${accent}/${isDark ? 'koyu' : 'açık'}`;
        assert.ok(contrast(c.text, c.background) >= 7, `${where}: metin/zemin`);
        assert.ok(contrast(c.text, c.card) >= 7, `${where}: metin/kart`);
        assert.ok(contrast(c.textMuted, c.card) >= 4.5, `${where}: soluk metin/kart ${contrast(c.textMuted, c.card).toFixed(2)}`);
        assert.ok(contrast(c.textMuted, c.background) >= 4.5, `${where}: soluk metin/zemin`);
        assert.ok(contrast(c.primary, c.card) >= 3, `${where}: vurgu/kart ${contrast(c.primary, c.card).toFixed(2)}`);
        assert.ok(contrast('#FFFFFF', c.header) >= 4.5, `${where}: üst çubuk yazısı`);
        assert.ok(contrast(c.text, c.primarySoft) >= 7, `${where}: metin/seçili satır`);
        assert.equal(c.isDark, isDark);
      }
    }
  }
});

test('Yüksek kontrast teması klasikten daha net', () => {
  for (const isDark of [false, true]) {
    const k = buildColors('cay', isDark, 'klasik');
    const h = buildColors('cay', isDark, 'kontrast');
    assert.ok(contrast(h.textMuted, h.card) > contrast(k.textMuted, k.card));
    assert.ok(contrast(h.border, h.card) > contrast(k.border, k.card));
  }
});

test('Zifiri koyu görünümde zemin tam siyah; renk tonlu tema vurguya göre değişir', () => {
  assert.equal(buildColors('deniz', true, 'zifiri').background, '#000000');
  assert.notEqual(buildColors('cay', false, 'tonlu').background, buildColors('bordo', false, 'tonlu').background);
  for (const id of PALETTE_IDS) assert.ok(PALETTES[id].name && PALETTES[id].hint);
});
