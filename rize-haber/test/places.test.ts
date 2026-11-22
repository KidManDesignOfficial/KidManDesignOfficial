import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_PLACES,
  DISTRICTS,
  districtPlaceCount,
  normalizeTr,
  placeById,
  placeSubtitle,
  placesInDistrict,
  pushRecent,
  searchPlaces,
} from '../src/places.ts';

test('Konum listesi: 12 ilçe ve yüzlerce köy/yayla, kimlikler benzersiz', () => {
  assert.equal(DISTRICTS.length, 12);
  assert.ok(ALL_PLACES.length > 450, `yalnızca ${ALL_PLACES.length} konum`);
  const ids = ALL_PLACES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Her köy bir ilçeye bağlı ve Rize il sınırları içinde', () => {
  const districtIds = new Set(DISTRICTS.map((d) => d.id));
  for (const p of ALL_PLACES) {
    assert.ok(districtIds.has(p.district), `${p.name}: bilinmeyen ilçe ${p.district}`);
    assert.ok(p.latitude > 40.5 && p.latitude < 41.4, `${p.name} enlem ${p.latitude}`);
    assert.ok(p.longitude > 40.2 && p.longitude < 41.5, `${p.name} boylam ${p.longitude}`);
    if (p.elevation != null) assert.ok(p.elevation > 0 && p.elevation < 4000, `${p.name} rakım`);
  }
  // Her ilçenin en az birkaç köyü olmalı.
  for (const d of DISTRICTS) assert.ok(districtPlaceCount(d.id) >= 5, `${d.name}: ${districtPlaceCount(d.id)} köy`);
});

test('Türkçe harflere duyarsız sadeleştirme', () => {
  assert.equal(normalizeTr('İkizdere'), 'ikizdere');
  assert.equal(normalizeTr('ÇAYELİ'), 'cayeli');
  assert.equal(normalizeTr('Işıklı'), 'isikli');
  assert.equal(normalizeTr('  Fındıklı '), 'findikli');
});

test('Arama: ilçe adı, Türkçe karaktersiz yazım ve önce tam eşleşme', () => {
  assert.equal(searchPlaces('cayeli')[0].place.id, 'cayeli');
  assert.equal(searchPlaces('ikizdere')[0].place.id, 'ikizdere');
  assert.equal(searchPlaces('Ayder')[0].place.name.startsWith('Ayder'), true);
  assert.deepEqual(searchPlaces('   '), []);
});

test('Arama: köyün eski adıyla bulunur (Elevit → Yaylaköy, Anzer → Ballıköy)', () => {
  const elevit = searchPlaces('elevit');
  const yaylakoy = elevit.find((h) => h.place.name === 'Yaylaköy');
  assert.ok(yaylakoy, 'Yaylaköy bulunamadı');
  assert.equal(yaylakoy.matchedAka, 'Elevit');
  assert.equal(yaylakoy.place.district, 'camlihemsin');

  const anzer = searchPlaces('anzer').find((h) => h.place.name === 'Ballıköy');
  assert.ok(anzer, 'Ballıköy bulunamadı');
  assert.equal(anzer.place.district, 'ikizdere');
});

test('Arama: ilçe adı yazılınca önce ilçe, ardından o ilçenin köyleri gelir', () => {
  const hits = searchPlaces('hemşin');
  assert.equal(hits[0].place.id, 'hemsin');
  assert.ok(hits.some((h) => h.place.kind !== 'ilce' && h.place.district === 'hemsin'));
});

test('İlçe görünümü: belde → köy → yayla sırası, ilçe merkezi hariç', () => {
  const list = placesInDistrict('camlihemsin');
  assert.ok(list.length > 30);
  assert.ok(!list.some((p) => p.kind === 'ilce'));
  const order = { belde: 1, koy: 2, yayla: 3, ilce: 0 };
  for (let i = 1; i < list.length; i++) assert.ok(order[list[i - 1].kind] <= order[list[i].kind]);
  assert.ok(list.some((p) => p.kind === 'yayla'));
});

test('Alt yazı: ilçe · tür · rakım', () => {
  const p = searchPlaces('elevit').find((h) => h.place.name === 'Yaylaköy')!.place;
  assert.match(placeSubtitle(p), /^Çamlıhemşin · Köy · 2\.\d{3} m$/);
  assert.equal(placeSubtitle(placeById('pazar')!), 'İlçe merkezi');
});

test('Son seçilenler: en yeni başta, tekrarsız, sınırlı', () => {
  assert.deepEqual(pushRecent(['a', 'b', 'c'], 'b'), ['b', 'a', 'c']);
  assert.deepEqual(pushRecent(['a', 'b', 'c'], 'd', 3), ['d', 'a', 'b']);
});

test('Ayder tek kez listelenir (elle tanımlı kayıt GeoNames kopyasını gizler)', () => {
  const ayder = searchPlaces('ayder').filter((h) => h.place.name.startsWith('Ayder'));
  assert.equal(ayder.length, 1);
  assert.equal(ayder[0].place.id, 'ayder');
});
