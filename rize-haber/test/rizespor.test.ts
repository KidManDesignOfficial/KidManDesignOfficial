// Gerçek ESPN yanıtlarından (kırpılmış) alınan örneklerle veri okuyucu testleri.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { lineupRows, parseFormation } from '../src/rizespor/formation.ts';
import { flagEmoji, teamName, venueName } from '../src/rizespor/names.ts';
import {
  parseEvent,
  parseRoster,
  parseSchedule,
  parseStandings,
  parseSummary,
  recentForm,
  statusText,
} from '../src/rizespor/parse.ts';

const load = (name: string) =>
  JSON.parse(readFileSync(new URL(`./fixtures/espn/${name}.json`, import.meta.url), 'utf8'));

test('Sonuçlar: skorlar sayı olarak okunur, Rizespor açısından G/B/M hesaplanır', () => {
  const matches = parseSchedule(load('results'));
  assert.equal(matches.length, 11);
  const last = matches.at(-1)!;
  assert.equal(last.home.name, 'Çaykur Rizespor');
  assert.equal(last.away.name, 'Erzurum BB');
  assert.equal(last.homeScore, 2);
  assert.equal(last.awayScore, 1);
  assert.equal(last.result, 'G');
  assert.equal(last.status, 'MS');
  assert.equal(last.venue, 'Çaykur Didi Stadyumu');
  // Trabzonspor maçı 3-4 kaybedildi.
  const trabzon = matches.find((m) => m.away.name === 'Trabzonspor')!;
  assert.deepEqual([trabzon.homeScore, trabzon.awayScore, trabzon.result], [3, 4, 'M']);
  assert.deepEqual(recentForm(matches), recentForm(matches).map((r) => r)); // biçim
  assert.equal(recentForm(matches).length, 5);
  for (const m of matches) assert.ok(m.result !== null, 'tüm sonuçlarda G/B/M olmalı');
});

test('Fikstür: oynanmamış maçlarda skor yok, tarih sırası artan', () => {
  const fixtures = parseSchedule(load('fixtures'));
  assert.ok(fixtures.length > 10);
  assert.equal(fixtures[0].state, 'pre');
  assert.equal(fixtures[0].homeScore, null);
  assert.equal(fixtures[0].home.name, 'Amed SFK');
  for (let i = 1; i < fixtures.length; i++) assert.ok(fixtures[i].date >= fixtures[i - 1].date);
  assert.ok(fixtures.some((m) => m.away.name === 'Kasımpaşa' || m.home.name === 'Kasımpaşa'));
});

test('Puan durumu: 18 takım, sıralı, Rizespor satırı doğru', () => {
  const rows = parseStandings(load('standings'));
  assert.equal(rows.length, 18);
  rows.forEach((r, i) => assert.equal(r.rank, i + 1));
  const riz = rows.find((r) => r.team.id === '7656')!;
  assert.deepEqual(
    [riz.rank, riz.played, riz.won, riz.drawn, riz.lost, riz.goalDiff, riz.points],
    [11, 11, 4, 2, 5, -3, 14],
  );
  assert.equal(rows[0].zone?.label, 'Şampiyonlar Ligi');
  assert.equal(rows.find((r) => r.team.name === 'Beşiktaş')?.rank, 4);
});

test('Kadro: 29 oyuncu, mevki grupları ve bayrak', () => {
  const players = parseRoster(load('roster'));
  assert.equal(players.length, 29);
  const groups = new Map<string, number>();
  for (const p of players) groups.set(p.group, (groups.get(p.group) ?? 0) + 1);
  assert.deepEqual(Object.fromEntries(groups), { GK: 4, DEF: 8, MID: 7, FWD: 10 });
  const fofana = players.find((p) => p.name === 'Yahia Fofana')!;
  assert.equal(fofana.jersey, '75');
  assert.equal(flagEmoji(fofana.nationality), '🇨🇮');
});

test('Maç ayrıntısı: goller, kartlar, değişiklikler, istatistik ve ilk 11', () => {
  const d = parseSummary(load('summary'))!;
  assert.ok(d);
  assert.deepEqual([d.match.homeScore, d.match.awayScore], [2, 1]);
  const goals = d.events.filter((e) => e.kind === 'goal');
  assert.deepEqual(goals.map((g) => [g.minute, g.player]), [
    ["31'", 'Ali Sowe'],
    ["37'", 'Ibrahim Diabate'],
    ["66'", 'Ali Sowe'],
  ]);
  const sub = d.events.find((e) => e.kind === 'sub' && e.player === 'Emrecan Bulut')!;
  assert.equal(sub.playerOut, 'Ahmed Kutucu');
  assert.ok(d.events.some((e) => e.kind === 'yellow'));
  for (let i = 1; i < d.events.length; i++) assert.ok(d.events[i].order >= d.events[i - 1].order);
  const poss = d.stats.find((s) => s.key === 'possessionPct')!;
  assert.deepEqual([poss.home, poss.away, poss.percent], [62.3, 37.7, true]);
  assert.equal(d.lineups.home?.formation, '4-1-4-1');
  assert.equal(d.lineups.home?.starters.length, 11);
  assert.equal(d.lineups.away?.formation, '5-4-1');
});

test('Diziliş: oyuncular mevki koduna göre doğru satırlara yerleşir', () => {
  const d = parseSummary(load('summary'))!;
  const home = lineupRows(d.lineups.home!.starters, d.lineups.home!.formation);
  assert.deepEqual(home.map((r) => r.length), [1, 4, 1, 4, 1]);
  assert.deepEqual(home[1].map((p) => p.position), ['LB', 'CD-L', 'CD-R', 'RB']);
  assert.equal(home[2][0].position, 'DM');
  assert.deepEqual(home[3].map((p) => p.position), ['LM', 'CM-L', 'CM-R', 'RM']);
  assert.equal(home[4][0].name, 'Ali Sowe');
  const away = lineupRows(d.lineups.away!.starters, d.lineups.away!.formation);
  assert.deepEqual(away.map((r) => r.length), [1, 5, 4, 1]);
  assert.deepEqual(away[1].map((p) => p.position), ['LB', 'CD-L', 'CD', 'CD-R', 'RB']);
  // Diziliş bilinmezse derinliğe göre satır oluşur, oyuncu kaybolmaz.
  assert.equal(lineupRows(d.lineups.home!.starters, null).flat().length, 11);
  assert.equal(parseFormation('4-4-3'), null);
});

test('Durum metinleri ve savunmacı okuma', () => {
  assert.deepEqual(statusText({ type: { state: 'in', name: 'STATUS_IN_PROGRESS' }, displayClock: "67'" }), { state: 'in', text: "67'" });
  assert.deepEqual(statusText({ type: { state: 'in', name: 'STATUS_HALFTIME' } }), { state: 'in', text: 'Devre arası' });
  assert.equal(statusText({ type: { state: 'pre', name: 'STATUS_POSTPONED' } }).text, 'Ertelendi');
  assert.equal(parseEvent({}), null);
  assert.equal(parseEvent(null), null);
  assert.deepEqual(parseSchedule({ events: [null, 5, { id: 'x' }] }), []);
  assert.deepEqual(parseStandings('bozuk'), []);
  assert.equal(parseSummary({}), null);
  assert.equal(teamName('Fenerbahce'), 'Fenerbahçe');
  assert.equal(teamName('Yeni Takım'), 'Yeni Takım');
  assert.equal(venueName('Estadio Ornek'), 'Ornek Stadyumu');
});
