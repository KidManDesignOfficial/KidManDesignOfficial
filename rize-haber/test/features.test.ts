import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_SEEN_IDS, diffNews } from '../src/newsDiff.ts';
import type { NewsItem } from '../src/rss.ts';
import { nextHours } from '../src/weather.ts';

const NOW = new Date('2026-11-15T12:00:00Z');

function item(id: string, minutesAgo: number | null): NewsItem {
  return {
    id,
    title: `Haber ${id}`,
    link: `https://example.com/${id}`,
    source: 'Kaynak',
    publishedAt: minutesAgo === null ? null : new Date(NOW.getTime() - minutesAgo * 60_000),
    summary: '',
    imageUrl: null,
  };
}

test('diffNews: ilk çalıştırmada hiçbir şey bildirilmez, mevcutlar görüldü sayılır', () => {
  const result = diffNews([item('a', 5), item('b', 10)], null, NOW);
  assert.deepEqual(result.fresh, []);
  assert.deepEqual(result.seenIds, ['a', 'b']);
});

test('diffNews: yalnızca görülmemiş ve son 6 saatteki haberler bildirilir', () => {
  const items = [item('yeni', 5), item('eski-gorulmus', 10), item('cok-eski', 7 * 60), item('tarihsiz', null)];
  const result = diffNews(items, ['eski-gorulmus'], NOW);
  assert.deepEqual(result.fresh.map((i) => i.id), ['yeni']);
  assert.deepEqual(result.seenIds, ['yeni', 'eski-gorulmus', 'cok-eski', 'tarihsiz']);
});

test('diffNews: aynı haber ikinci kontrolde tekrar bildirilmez', () => {
  const first = diffNews([item('x', 1)], [], NOW);
  assert.equal(first.fresh.length, 1);
  const second = diffNews([item('x', 1)], first.seenIds, NOW);
  assert.equal(second.fresh.length, 0);
});

test('diffNews: görülmüş listesi sınırı aşmaz, en yeniler korunur', () => {
  const old = Array.from({ length: MAX_SEEN_IDS }, (_, i) => `eski-${i}`);
  const result = diffNews([item('yeni', 1)], old, NOW);
  assert.equal(result.seenIds.length, MAX_SEEN_IDS);
  assert.equal(result.seenIds[0], 'yeni');
  assert.ok(!result.seenIds.includes(`eski-${MAX_SEEN_IDS - 1}`));
});

test('nextHours: içinde bulunulan saatten başlar ve kısaltır', () => {
  const hours = ['2026-11-15T20:00', '2026-11-15T21:00', '2026-11-15T22:00', '2026-11-15T23:00'].map(
    (time) => ({ time }),
  );
  assert.deepEqual(
    nextHours(hours, '2026-11-15T21:45', 2).map((h) => h.time),
    ['2026-11-15T21:00', '2026-11-15T22:00'],
  );
  assert.deepEqual(nextHours(hours, '2026-11-16T05:00', 2), []);
});
