// Piyasa verileri: TCMB kur ayrıştırma, altın, çeviri.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { GRAMS_PER_OUNCE, convert, formatRate, gramGoldTry, parseGold, parseTcmb } from '../src/markets.ts';

const xml = readFileSync(new URL('./fixtures/tcmb-today.xml', import.meta.url), 'utf8');

test('parseTcmb: tarih ve kurlar listedeki sırayla', () => {
  const { date, rates } = parseTcmb(xml);
  assert.equal(date, '2026-11-20');
  assert.deepEqual(
    rates.map((r) => r.code),
    ['USD', 'EUR', 'GBP', 'RUB'],
  );
  const usd = rates[0];
  assert.equal(usd.name, 'ABD Doları');
  assert.equal(usd.buying, 42.315);
  assert.equal(usd.selling, 42.3912);
  // Efektifi boş olan döviz de döviz kuruyla gelir.
  assert.equal(rates[3].selling, 0.5278);
});

test('parseTcmb: bozuk veride hata verir', () => {
  assert.throws(() => parseTcmb('<html>bakım</html>'));
  assert.throws(() => parseTcmb('<Tarih_Date Date="11/20/2026"></Tarih_Date>'));
});

test('parseGold: geçerli fiyat, aksi halde null', () => {
  assert.equal(parseGold({ name: 'Gold', price: 2650.4, symbol: 'XAU' }), 2650.4);
  assert.equal(parseGold({ price: '2650.4' }), 2650.4);
  assert.equal(parseGold({ price: 0 }), null);
  assert.equal(parseGold({ error: 'limit' }), null);
  assert.equal(parseGold(null), null);
});

test('gramGoldTry: ons × dolar ÷ 31,1035', () => {
  const { rates } = parseTcmb(xml);
  const gram = gramGoldTry(2650, rates)!;
  assert.ok(Math.abs(gram - (2650 * 42.3912) / GRAMS_PER_OUNCE) < 1e-9);
  assert.equal(gramGoldTry(null, rates), null);
  assert.equal(gramGoldTry(2650, []), null);
});

test('convert ve formatRate', () => {
  const rate = { code: 'USD', name: '', buying: 40, selling: 50 };
  assert.equal(convert(10, rate, true), 400);
  assert.equal(convert(100, rate, false), 2);
  assert.equal(formatRate(42.3912), '42,39');
  assert.equal(formatRate(0.5278), '0,5278');
  assert.equal(formatRate(3612.5), '3.612,50');
});
