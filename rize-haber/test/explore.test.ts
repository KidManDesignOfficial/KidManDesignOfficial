import { test } from 'node:test';
import assert from 'node:assert/strict';

import { PLACES } from '../src/data/discover.ts';
import { RIZE_DISTRICTS } from '../src/data/rize.ts';
import { VENUE_KINDS, VENUES, mapsNearbyUrl } from '../src/data/venues.ts';
import {
  distanceKm,
  formatKm,
  inSeason,
  nearest,
  planTarget,
  roughDriveMinutes,
  suggestToday,
  weatherKind,
  type DayWeather,
} from '../src/explore.ts';

const MERKEZ = { lat: 41.0201, lon: 40.5234 };
const AYDER = { lat: 40.9507, lon: 41.1031 };
const SUNNY: DayWeather = { code: 0, max: 22, precipitationProbability: 5 };
const RAIN: DayWeather = { code: 63, max: 14, precipitationProbability: 90 };
/** Yerel saatle 2026 tarihi (testler hangi saat diliminde koşarsa koşsun aynı sonuç). */
const at = (month: number, day: number, hour: number) => new Date(2026, month - 1, day, hour, 0, 0);

test('Uzaklık: Rize Merkez–Ayder kuş uçuşu ~49 km; biçimler okunaklı', () => {
  const km = distanceKm(MERKEZ, AYDER);
  assert.ok(km > 45 && km < 53, String(km));
  assert.equal(distanceKm(MERKEZ, MERKEZ), 0);
  assert.equal(formatKm(0.42), '400 m');
  assert.equal(formatKm(3.26), '3,3 km');
  assert.equal(formatKm(48.7), '49 km');
  assert.ok(roughDriveMinutes(km) >= 90 && roughDriveMinutes(km) <= 110);
});

test('Her gezi yerinin konumu Rize sınırları içinde ve mevsim aralığı geçerli', () => {
  for (const p of PLACES) {
    assert.ok(p.lat > 40.5 && p.lat < 41.4 && p.lon > 40.2 && p.lon < 41.5, `${p.id}: ${p.lat},${p.lon}`);
    if (p.months) assert.ok(p.months[0] >= 1 && p.months[1] <= 12, p.id);
  }
  assert.ok(PLACES.length >= 34);
  assert.ok(PLACES.filter((p) => p.popular).length >= 8);
});

test('Mevsim: yaylalar Haziran–Eylül, Aralık’ta önerilmez; yıl sonunu aşan aralık', () => {
  const pokut = PLACES.find((p) => p.id === 'pokut')!;
  assert.equal(inSeason(pokut, 7), true);
  assert.equal(inSeason(pokut, 12), false);
  assert.equal(inSeason({ months: [11, 3] }, 1), true);
  assert.equal(inSeason({ months: [11, 3] }, 6), false);
  assert.equal(inSeason({}, 12), true);
  const winter = suggestToday({ places: PLACES, ref: AYDER, weather: SUNNY, now: at(12, 5, 10), limit: 10 });
  assert.ok(winter.length > 0);
  assert.ok(!winter.some((s) => s.place.category === 'yayla' && s.place.months), 'kışın yayla önerildi');
});

test('Yağmurlu günde ilk öneri kapalı alan; güneşli yaz gününde açık hava', () => {
  const rainy = suggestToday({ places: PLACES, ref: MERKEZ, weather: RAIN, now: at(7, 10, 10) });
  assert.equal(rainy[0].place.indoor, true, rainy[0].place.id);
  assert.ok(rainy[0].reasons.some((r) => r.includes('Kapalı alan')));
  const sunny = suggestToday({ places: PLACES, ref: AYDER, weather: SUNNY, now: at(7, 10, 9) });
  assert.equal(sunny[0].place.indoor, false);
  assert.ok(sunny.some((s) => s.reasons.includes('Hava açık')));
});

test('Öneriler çeşitli: üç öneri üç farklı türden; "Başka öner" sonucu değiştirir, aynı gün kararlı', () => {
  const input = { places: PLACES, ref: MERKEZ, weather: SUNNY, now: at(8, 12, 9) };
  const a = suggestToday(input);
  assert.equal(a.length, 3);
  assert.equal(new Set(a.map((s) => s.place.category)).size, 3);
  assert.deepEqual(suggestToday(input).map((s) => s.place.id), a.map((s) => s.place.id));
  const ids = new Set<string>();
  for (let k = 0; k < 6; k++) for (const s of suggestToday({ ...input, shuffle: k })) ids.add(s.place.id);
  assert.ok(ids.size > 3, 'Başka öner hiç değişmiyor');
});

test('Saat ilerledikçe uzak tam günlük yerler düşer; akşam öneriler yarına kayar', () => {
  const late = suggestToday({ places: PLACES, ref: MERKEZ, weather: SUNNY, now: at(7, 10, 17), limit: 10 });
  assert.ok(!late.some((s) => s.place.visit === 'tam' && s.km > 30), late.map((s) => s.place.id).join());
  const evening = planTarget(at(7, 10, 19));
  assert.equal(evening.dayIndex, 1);
  assert.equal(evening.label, 'Yarın');
  assert.equal(evening.date.getHours(), 9);
  assert.equal(planTarget(at(7, 10, 11)).dayIndex, 0);
  assert.equal(planTarget(at(12, 10, 16)).dayIndex, 1);
});

test('Hava kodu sınıflaması', () => {
  assert.equal(weatherKind({ code: 0, max: 20, precipitationProbability: 0 }), 'clear');
  assert.equal(weatherKind({ code: 3, max: 20, precipitationProbability: 10 }), 'cloudy');
  assert.equal(weatherKind({ code: 61, max: 20, precipitationProbability: 80 }), 'rain');
  assert.equal(weatherKind({ code: 95, max: 20, precipitationProbability: 80 }), 'heavy');
  assert.equal(weatherKind({ code: 73, max: 0, precipitationProbability: 80 }), 'snow');
  assert.equal(weatherKind({ code: 45, max: 10, precipitationProbability: 10 }), 'fog');
});

test('En yakınlar: Ayder’den bakınca ilk sıralar Ayder çevresi', () => {
  const list = nearest(AYDER, PLACES, 3).map((x) => x.item.id);
  assert.ok(list.includes('ayder') && list.includes('gelintulu'), list.join());
  const fromCity = nearest(MERKEZ, PLACES, 5).map((x) => x.item.id);
  assert.ok(fromCity.includes('rizekalesi') && fromCity.includes('ataturkevi'), fromCity.join());
});

test('Mekânlar: kaynaklı, geçerli ilçe ve tür, harita sorgusu Rize içerir; puan/fiyat alanı yok', () => {
  const kinds = new Set(VENUE_KINDS.map((k) => k.id));
  const ids = VENUES.map((v) => v.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const v of VENUES) {
    assert.ok(kinds.has(v.kind), v.id);
    assert.ok(RIZE_DISTRICTS.includes(v.district), `${v.id}: ${v.district}`);
    assert.ok(v.mapsQuery.includes('Rize'), v.id);
    assert.ok(v.sources.length >= 1 && v.sources.every((s) => /^https:\/\//.test(s.url)), v.id);
    assert.ok(v.knownFor.length >= 1, v.id);
    assert.ok(!('rating' in v) && !('price' in v), v.id);
  }
  // Her türden en az bir mekân (boş filtre görünmesin).
  for (const k of VENUE_KINDS) assert.ok(VENUES.some((v) => v.kind === k.id), k.id);
  assert.equal(mapsNearbyUrl('çay bahçesi', 41.02, 40.5234), 'https://www.google.com/maps/search/%C3%A7ay%20bah%C3%A7esi/@41.0200,40.5234,14z');
});
