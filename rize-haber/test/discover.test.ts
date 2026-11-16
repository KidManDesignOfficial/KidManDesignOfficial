import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CULTURE,
  DISCOVER_SOURCES,
  FOOD_KINDS,
  FOODS,
  PLACE_CATEGORIES,
  PLACES,
  PRACTICAL,
  mapsUrl,
} from '../src/data/discover.ts';
import { RIZE_DISTRICTS } from '../src/data/rize.ts';

const allUrls = [
  ...PLACES.map((p) => p.sourceUrl),
  ...FOODS.map((f) => f.sourceUrl),
  ...CULTURE.map((c) => c.sourceUrl),
  ...PRACTICAL.flatMap((p) => (p.sourceUrl ? [p.sourceUrl] : [])),
  ...DISCOVER_SOURCES.map((s) => s.url),
];

test('Her kaynak bağlantısı güvenli (https) ve bir kuruma ait', () => {
  for (const url of allUrls) assert.match(url, /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/, url);
});

test('Kimlikler benzersiz', () => {
  for (const list of [PLACES, FOODS, CULTURE]) {
    const ids = list.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length);
  }
});

test('Gezilecek yerler: geçerli kategori, ilçe ve eksiksiz içerik', () => {
  const categories = new Set(PLACE_CATEGORIES.map((c) => c.id));
  for (const p of PLACES) {
    assert.ok(categories.has(p.category), `${p.id}: kategori`);
    assert.ok(RIZE_DISTRICTS.includes(p.district), `${p.id}: bilinmeyen ilçe ${p.district}`);
    assert.ok(p.mapsQuery.includes('Rize'), `${p.id}: harita sorgusu Rize içermeli`);
    assert.ok(p.tagline.length > 20 && p.description.length > 60, `${p.id}: metin çok kısa`);
    assert.ok(p.highlights.length >= 2, `${p.id}: en az iki öne çıkan`);
  }
  // Her kategoride en az bir yer olmalı (boş filtre görünmesin).
  for (const c of PLACE_CATEGORIES) assert.ok(PLACES.some((p) => p.category === c.id), c.id);
});

test('Coğrafi işaretli ürün sayısı resmî sayıyla (14) tutarlı', () => {
  const gi = FOODS.filter((f) => f.geoIndication).length + CULTURE.filter((c) => c.badge?.startsWith('Coğrafi')).length;
  assert.equal(gi, 14);
});

test('Lezzetlerin türü geçerli', () => {
  const kinds = new Set(FOOD_KINDS.map((k) => k.id));
  for (const f of FOODS) assert.ok(kinds.has(f.kind), f.id);
});

test('mapsUrl Türkçe karakterleri güvenle kodlar', () => {
  assert.equal(
    mapsUrl('Ayder Yaylası, Çamlıhemşin, Rize'),
    'https://www.google.com/maps/search/?api=1&query=Ayder%20Yaylas%C4%B1%2C%20%C3%87aml%C4%B1hem%C5%9Fin%2C%20Rize',
  );
});
