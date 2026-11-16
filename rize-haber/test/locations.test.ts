import { test } from 'node:test';
import assert from 'node:assert/strict';

import { WEATHER_LOCATIONS } from '../src/config.ts';
import { RIZE_DISTRICTS } from '../src/data/rize.ts';

test('Hava durumunda 12 ilçenin hepsi var', () => {
  const names = WEATHER_LOCATIONS.map((l) => l.name);
  for (const d of RIZE_DISTRICTS) {
    const expected = d === 'Merkez' ? 'Rize Merkez' : d;
    assert.ok(names.includes(expected), `eksik ilçe: ${expected}`);
  }
  assert.equal(RIZE_DISTRICTS.length, 12);
});

test('Konumlar benzersiz ve Rize il sınırları içinde', () => {
  const ids = WEATHER_LOCATIONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of WEATHER_LOCATIONS) {
    // Rize ili yaklaşık 40.6–41.4 K, 40.2–41.4 D aralığındadır.
    assert.ok(l.latitude > 40.6 && l.latitude < 41.4, `${l.name} enlem`);
    assert.ok(l.longitude > 40.2 && l.longitude < 41.4, `${l.name} boylam`);
  }
});

test('Varsayılan konum Rize Merkez', () => {
  assert.equal(WEATHER_LOCATIONS[0].id, 'merkez');
});
