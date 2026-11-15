import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  formatDateTr,
  formatLira,
  formatNumber,
  newerTeaData,
  parseKg,
  parseTeaData,
  yearOverYearChange,
} from '../src/tea.ts';
import { buildColors, mix } from '../src/colors.ts';

const realData = JSON.parse(readFileSync(new URL('../data/cay.json', import.meta.url), 'utf8'));

test('Depodaki data/cay.json geçerli ve resmî kaynak bağlantısı içeriyor', () => {
  const data = parseTeaData(realData);
  assert.ok(data, 'cay.json doğrulamayı geçmeli');
  assert.equal(data.current.year, 2026);
  assert.equal(data.current.pricePerKg, 35);
  assert.ok(data.current.sourceUrl.startsWith('https://www.tarimorman.gov.tr/'));
  assert.deepEqual(data.history.map((h) => h.year), [2026, 2025, 2024]);
});

test('parseTeaData bozuk veya tehlikeli veriyi reddeder', () => {
  const bad = (patch: Record<string, unknown>) => parseTeaData({ ...realData, ...patch });
  assert.equal(parseTeaData(null), null);
  assert.equal(bad({ schemaVersion: 2 }), null);
  assert.equal(bad({ updatedAt: 'dün' }), null);
  assert.equal(bad({ current: { ...realData.current, pricePerKg: -5 } }), null);
  assert.equal(bad({ current: { ...realData.current, pricePerKg: '35' } }), null);
  assert.equal(bad({ current: { ...realData.current, sourceUrl: 'http://ornek.com' } }), null);
  assert.equal(bad({ history: [{ year: 2026 }] }), null);
  // Geçersiz bağlantılar elenir, veri yine kabul edilir.
  const filtered = bad({ links: [{ label: 'x', url: 'javascript:alert(1)' }, ...realData.links] });
  assert.equal(filtered?.links.length, realData.links.length);
});

test('newerTeaData güncelleme tarihi yeni olanı seçer', () => {
  const a = parseTeaData(realData)!;
  const b = parseTeaData({ ...realData, updatedAt: '2027-05-15' })!;
  assert.equal(newerTeaData(a, b), b);
  assert.equal(newerTeaData(b, a), b);
  assert.equal(newerTeaData(null, a), a);
});

test('yearOverYearChange bir önceki yıla göre yüzdeyi hesaplar', () => {
  const change = yearOverYearChange(parseTeaData(realData)!);
  assert.equal(change?.previous.year, 2025);
  assert.equal(formatNumber(change!.percent, 1), '37,6');
});

test('Türkçe sayı ve tarih biçimi', () => {
  assert.equal(formatNumber(35), '35,00');
  assert.equal(formatNumber(1234567.891), '1.234.567,89');
  assert.equal(formatLira(43750), '43.750,00 ₺');
  assert.equal(formatDateTr('2026-05-12'), '12 Mayıs 2026');
});

test('parseKg kullanıcı girişini çözer', () => {
  assert.equal(parseKg('1250'), 1250);
  assert.equal(parseKg('1.250,5'), 1250.5);
  assert.equal(parseKg('12,75'), 12.75);
  assert.equal(parseKg('12.75'), 12.75);
  assert.equal(parseKg(''), null);
  assert.equal(parseKg('abc'), null);
  assert.equal(parseKg('0'), null);
  assert.equal(parseKg('-5'), null);
});

test('Tema renkleri: karışım ve koyu/açık palet', () => {
  assert.equal(mix('#000000', '#FFFFFF', 0.5), '#808080');
  const light = buildColors('cay', false);
  const dark = buildColors('cay', true);
  assert.equal(light.primary, '#1B6B3A');
  assert.equal(dark.isDark, true);
  assert.notEqual(light.background, dark.background);
});
