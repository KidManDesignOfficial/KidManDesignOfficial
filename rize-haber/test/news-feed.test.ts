// Haber akışı yardımcıları: otomatik yenileme, yeni haber tespiti, gün bölümleri, kaynak rozeti.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SOURCE_COLORS,
  STALE_AFTER_MS,
  buildFeed,
  daySection,
  isStale,
  newArrivals,
  sourceBadge,
  updatedLabel,
} from '../src/newsFeed.ts';
import type { NewsItem } from '../src/rss.ts';

const item = (id: string, publishedAt: Date | null): NewsItem => ({
  id,
  title: `Haber ${id}`,
  link: `https://example.com/${id}`,
  source: 'Rize Gündem',
  summary: '',
  publishedAt,
  imageUrl: null,
});

const NOW = new Date(2026, 10, 21, 15, 0);

test('isStale: veri yoksa veya süresi dolduysa yenile', () => {
  const now = 1_000_000_000;
  assert.equal(isStale(null, now), true);
  assert.equal(isStale(now - STALE_AFTER_MS + 1, now), false);
  assert.equal(isStale(now - STALE_AFTER_MS, now), true);
});

test('newArrivals: ilk yüklemede boş, sonrasında yalnızca yeni kimlikler', () => {
  const a = item('a', NOW);
  const b = item('b', NOW);
  const c = item('c', NOW);
  assert.deepEqual(newArrivals([], [a, b]), []);
  assert.deepEqual(newArrivals([a, b], [c, a, b]), ['c']);
  assert.deepEqual(newArrivals([a, b], [a, b]), []);
});

test('daySection: Bugün / Dün / Bu hafta / Daha önce', () => {
  assert.equal(daySection(new Date(2026, 10, 21, 0, 5), NOW), 'Bugün');
  assert.equal(daySection(new Date(2026, 10, 20, 23, 59), NOW), 'Dün');
  assert.equal(daySection(new Date(2026, 10, 16, 12), NOW), 'Bu hafta');
  assert.equal(daySection(new Date(2026, 10, 10), NOW), 'Daha önce');
  assert.equal(daySection(null, NOW), 'Daha önce');
});

test('buildFeed: ilk haber manşet, kalanlar gün başlıklarıyla', () => {
  const items = [
    item('1', new Date(2026, 10, 21, 14)),
    item('2', new Date(2026, 10, 21, 9)),
    item('3', new Date(2026, 10, 20, 9)),
    item('4', new Date(2026, 10, 20, 8)),
  ];
  const rows = buildFeed(items, { now: NOW });
  assert.deepEqual(
    rows.map((r) => r.kind),
    ['lead', 'section', 'item', 'section', 'item', 'item'],
  );
  const sections = rows.filter((r) => r.kind === 'section');
  assert.deepEqual(
    sections.map((r) => (r.kind === 'section' ? [r.title, r.count] : null)),
    [
      ['Bugün', 1],
      ['Dün', 2],
    ],
  );
  // Anahtarlar benzersiz olmalı (FlatList).
  assert.equal(new Set(rows.map((r) => r.key)).size, rows.length);
});

test('buildFeed: aramada manşet yok; tek haberde manşet yok', () => {
  const items = [item('1', NOW), item('2', NOW)];
  assert.equal(buildFeed(items, { lead: false, now: NOW })[0].kind, 'section');
  assert.equal(buildFeed([item('1', NOW)], { now: NOW })[0].kind, 'section');
  assert.deepEqual(buildFeed([], { now: NOW }), []);
});

test('sourceBadge: baş harfler ve sabit renk', () => {
  assert.equal(sourceBadge('Rize Gündem').initials, 'RG');
  assert.equal(sourceBadge('Hürriyet').initials, 'HÜ');
  assert.equal(sourceBadge('www.rizeolay.com').initials, 'RC');
  assert.equal(sourceBadge('Rize Gündem').color, sourceBadge('Rize Gündem').color);
  assert.ok((SOURCE_COLORS as readonly string[]).includes(sourceBadge('NTV').color));
});

test('updatedLabel: göreli güncelleme zamanı', () => {
  const now = 10_000_000;
  assert.equal(updatedLabel(null, now), '');
  assert.equal(updatedLabel(now - 30_000, now), 'Az önce güncellendi');
  assert.equal(updatedLabel(now - 5 * 60_000, now), '5 dk önce güncellendi');
  assert.equal(updatedLabel(now - 2 * 3_600_000, now), '2 sa önce güncellendi');
});
