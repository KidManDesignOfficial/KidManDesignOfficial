import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { countdownParts, dayLabel, shortName, signed } from '../src/rizespor/format.ts';
import { parseSchedule } from '../src/rizespor/parse.ts';
import { REMINDER_MINUTES, reminderText, upcomingForReminders } from '../src/rizespor/schedule.ts';

const fixtures = parseSchedule(
  JSON.parse(readFileSync(new URL('./fixtures/espn/fixtures.json', import.meta.url), 'utf8')),
);

test('Hatırlatmalar: maçtan tam 30 dk önce, en yakın 4 maç, geçmiş zamana kurulmaz', () => {
  const first = fixtures[0];
  const now = first.date.getTime() - 2 * 3600_000; // ilk maçtan 2 saat önce
  const items = upcomingForReminders(fixtures, now);
  assert.equal(items.length, 4);
  assert.equal(items[0].match.id, first.id);
  assert.equal(first.date.getTime() - items[0].at.getTime(), REMINDER_MINUTES * 60_000);
  for (let i = 1; i < items.length; i++) assert.ok(items[i].at > items[i - 1].at);

  // Hatırlatma saati geçmişse (maça 20 dk kala) o maç atlanır.
  const late = upcomingForReminders(fixtures, first.date.getTime() - 20 * 60_000);
  assert.ok(!late.some((x) => x.match.id === first.id));
});

test('Ertelenen ya da başlamış maç için hatırlatma kurulmaz', () => {
  const postponed = { ...fixtures[0], status: 'Ertelendi' };
  const live = { ...fixtures[1], state: 'in' as const, status: "12'" };
  const now = fixtures[0].date.getTime() - 5 * 3600_000;
  const ids = upcomingForReminders([postponed, live, fixtures[2]], now).map((x) => x.match.id);
  assert.deepEqual(ids, [fixtures[2].id]);
});

test('Hatırlatma metni', () => {
  const t = reminderText(fixtures[1]);
  assert.equal(t.title, '🍵 Çayını demle, maç başlıyor!');
  assert.equal(t.body, 'Çaykur Rizespor – Kasımpaşa maçı 30 dakika sonra başlıyor · Çaykur Didi Stadyumu.');
});

test('Tarih ve sayı biçimleri', () => {
  const now = new Date(2026, 10, 16, 12, 0);
  assert.equal(dayLabel(new Date(2026, 10, 16, 20, 0), now), 'Bugün');
  assert.equal(dayLabel(new Date(2026, 10, 17, 20, 0), now), 'Yarın');
  assert.equal(dayLabel(new Date(2026, 10, 21, 16, 0), now), 'Cmt 21 Kas');
  assert.deepEqual(countdownParts(((2 * 24 + 5) * 3600 + 12 * 60 + 33) * 1000), { days: 2, hours: 5, minutes: 12, seconds: 33 });
  assert.deepEqual(countdownParts(-5000), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  assert.equal(signed(12), '+12');
  assert.equal(signed(-3), '-3');
  assert.equal(signed(0), '0');
  assert.equal(shortName('Ahmed Kutucu'), 'Kutucu');
  assert.equal(shortName('Pepe'), 'Pepe');
});
