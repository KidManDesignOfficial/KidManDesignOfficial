import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sceneFor, seeded } from '../src/weatherScene.ts';

test('açık hava: gündüz güneş, gece lacivert gökyüzü', () => {
  const day = sceneFor(0, true);
  assert.equal(day.kind, 'clear');
  assert.equal(day.showSun, true);
  assert.equal(day.clouds, 0);
  assert.equal(day.rainy, false);
  const night = sceneFor(0, false);
  assert.equal(night.kind, 'clear');
  assert.notDeepEqual(night.sky, day.sky);
});

test('yağmur şiddeti damla sayısını belirler', () => {
  const drizzle = sceneFor(51, true);
  const moderate = sceneFor(63, true);
  const heavy = sceneFor(65, true);
  for (const s of [drizzle, moderate, heavy]) {
    assert.equal(s.kind, 'rain');
    assert.equal(s.rainy, true);
  }
  assert.ok(drizzle.particles < moderate.particles);
  assert.ok(moderate.particles < heavy.particles);
});

test('fırtına, kar, sis ve kapalı doğru sahneye düşer', () => {
  assert.equal(sceneFor(95, true).kind, 'storm');
  assert.equal(sceneFor(95, true).rainy, true);
  assert.equal(sceneFor(73, true).kind, 'snow');
  assert.equal(sceneFor(73, true).rainy, false);
  assert.equal(sceneFor(45, true).kind, 'fog');
  assert.equal(sceneFor(3, true).kind, 'cloudy');
  assert.equal(sceneFor(2, false).kind, 'partly');
  assert.equal(sceneFor(81, true).kind, 'rain');
});

test('bilinmeyen kod güvenli varsayılana düşer', () => {
  const s = sceneFor(1234, true);
  assert.equal(s.kind, 'cloudy');
  assert.equal(s.particles, 0);
});

test('tüm WMO kodları için sahne tutarlı ve sınırlı', () => {
  const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  for (const code of codes) {
    for (const isDay of [true, false]) {
      const s = sceneFor(code, isDay);
      assert.equal(s.sky.length, 2);
      for (const c of s.sky) assert.match(c, /^#[0-9A-F]{6}$/);
      assert.ok(s.particles <= 120, `kod ${code}: telefonda akıcılık için en fazla 120 parçacık`);
      assert.ok(s.clouds <= 5);
      assert.ok(s.cloudShade >= 0 && s.cloudShade <= 1);
      if (s.rainy) assert.ok(s.kind === 'rain' || s.kind === 'storm');
    }
  }
});

test('seeded tekrarlanabilir ve 0–1 aralığında', () => {
  assert.equal(seeded(7, 2), seeded(7, 2));
  assert.notEqual(seeded(7, 2), seeded(8, 2));
  for (let i = 0; i < 500; i++) {
    const v = seeded(i, i % 5);
    assert.ok(v >= 0 && v < 1);
  }
});
