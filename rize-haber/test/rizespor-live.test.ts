import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  LIVE_POLL_MS,
  SOON_POLL_MS,
  applyLive,
  awaitingKickoff,
  detectMoments,
  inMatchWindow,
  liveMinute,
  matchProgress,
  momentText,
  pollDelay,
  scoreboardDate,
} from '../src/rizespor/live.ts';
import { parseRoster, parseSchedule, parseSummary, statusText, type Match } from '../src/rizespor/parse.ts';
import { currentStreak, seasonSummary, teamLeaders } from '../src/rizespor/season.ts';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`./fixtures/espn/${name}.json`, import.meta.url), 'utf8'));

const KICKOFF = Date.parse('2026-11-21T13:00:00Z');

function match(over: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    date: new Date(KICKOFF),
    home: { id: '132335', name: 'Amed SFK', abbr: 'AMED' },
    away: { id: '7656', name: 'Çaykur Rizespor', abbr: 'CAY' },
    homeScore: null,
    awayScore: null,
    state: 'pre',
    status: '',
    venue: null,
    clockSec: null,
    period: null,
    running: false,
    result: null,
    rizesporHome: false,
    ...over,
  };
}

const live = (clockSec: number, status: string, period = clockSec > 2700 ? 2 : 1, extra: Partial<Match> = {}) =>
  match({ state: 'in', status, clockSec, period, running: true, homeScore: 0, awayScore: 0, ...extra });

test('Maç penceresi: başlamadan 15 dk önce açılır, maç "başlamadı" görünse bile sürer', () => {
  const m = match();
  assert.equal(inMatchWindow(m, KICKOFF - 20 * 60_000), false);
  assert.equal(inMatchWindow(m, KICKOFF - 10 * 60_000), true);
  // Kaynak henüz "başladı" demese de (eski hata buydu) yenileme sürer.
  assert.equal(inMatchWindow(m, KICKOFF + 30 * 60_000), true);
  assert.equal(awaitingKickoff(m, KICKOFF + 60_000), true);
  assert.equal(inMatchWindow(m, KICKOFF + 4 * 3600_000), false);
  assert.equal(inMatchWindow(match({ status: 'Ertelendi' }), KICKOFF), false);
  assert.equal(inMatchWindow(live(600, "10'"), KICKOFF + 9 * 3600_000), true);
});

test('Yenileme planı: maçta 20 sn, maça 3 saatten az kala 5 dk, aksi halde yok', () => {
  assert.equal(pollDelay([match()], KICKOFF - 5 * 60_000), LIVE_POLL_MS);
  assert.equal(pollDelay([match()], KICKOFF - 2 * 3600_000), SOON_POLL_MS);
  assert.equal(pollDelay([match()], KICKOFF - 26 * 3600_000), null);
  assert.equal(pollDelay([match({ state: 'post', status: 'MS' })], KICKOFF + 3600_000), null);
});

test('Canlı dakika iki yenileme arasında ilerler; normal süre dolunca +dakika gösterilir', () => {
  assert.equal(liveMinute(live(66 * 60 + 10, "67'"), 0), "67'");
  assert.equal(liveMinute(live(66 * 60 + 10, "67'"), 60_000), "68'");
  // İlk yarının uzatması: 45'+2'
  assert.equal(liveMinute(live(44 * 60 + 30, "45'", 1), 150_000), "45'+2'");
  // Kaynağın kendi "+" gösterimi korunur ve ilerler.
  assert.equal(liveMinute(live(93 * 60 - 30, "90'+3'", 2), 60_000), "90'+4'");
  // Bağlantı koparsa saat en çok 4 dakika ileri sarılır.
  assert.equal(liveMinute(live(600, "10'"), 30 * 60_000), "14'");
  // Devre arasında saat durur.
  assert.equal(liveMinute(match({ state: 'in', status: 'Devre arası', clockSec: 2700, period: 1, running: false }), 120_000), 'Devre arası');
  assert.equal(matchProgress(live(2700, "45'"), 0), 0.5);
  assert.equal(matchProgress(match({ state: 'post' }), 0), 1);
});

test('Durum ve saat ESPN nesnesinden okunur', () => {
  const second = statusText({ displayClock: "67'", clock: 3990, period: 2, type: { state: 'in', name: 'STATUS_SECOND_HALF' } });
  assert.deepEqual(second, { state: 'in', text: "67'", running: true });
  const ht = statusText({ displayClock: "45'", period: 1, type: { state: 'in', name: 'STATUS_HALFTIME' } });
  assert.equal(ht.text, 'Devre arası');
  assert.equal(ht.running, false);
});

test('Anlar: gol, başlama, devre arası, maç sonu yakalanır; ilk yüklemede kutlama yok', () => {
  const pre = match();
  const kicked = live(30, "1'");
  assert.deepEqual(detectMoments([pre], [kicked]).map((m) => m.kind), ['kickoff']);

  const scored = live(1132, "19'", 1, { awayScore: 1 });
  const goals = detectMoments([kicked], [scored]);
  assert.equal(goals.length, 1);
  assert.deepEqual(goals[0], { kind: 'goal', match: scored, side: 'away', us: true });
  assert.equal(momentText(goals[0]).title, 'GOOOL!');

  const ht = match({ state: 'in', status: 'Devre arası', homeScore: 0, awayScore: 1 });
  assert.deepEqual(detectMoments([scored], [ht]).map((m) => m.kind), ['halftime']);

  const ft = match({ state: 'post', status: 'MS', homeScore: 0, awayScore: 2, result: 'G' });
  const end = detectMoments([live(5000, "84'", 2, { awayScore: 1 })], [ft]);
  assert.deepEqual(end.map((m) => m.kind), ['fulltime', 'goal']);
  assert.equal(momentText(end[0]).title, 'Maç sonu · Galibiyet!');

  assert.deepEqual(detectMoments([], [scored]), []);
  // Rizespor'un oynamadığı maçlar kutlanmaz.
  const other = (s: number) => match({ id: 'x', home: { id: '1', name: 'A', abbr: 'A' }, away: { id: '2', name: 'B', abbr: 'B' }, state: 'in', homeScore: s, awayScore: 0 });
  assert.deepEqual(detectMoments([other(0)], [other(1)]), []);
});

test('Skor tablosu: günün maçları okunur, Rizespor maçı fikstüre işlenir', () => {
  const today = parseSchedule(fixture('scoreboard'));
  assert.ok(today.length >= 3);
  const ours = today.find((m) => m.away.id === '7656' || m.home.id === '7656');
  assert.ok(ours);
  assert.equal(ours.state, 'post');
  assert.equal(`${ours.homeScore}-${ours.awayScore}`, '0-2');

  const stale = { ...ours, state: 'pre' as const, homeScore: null, awayScore: null, status: '', venue: 'Diyarbakır Stadyumu' };
  const data = { fixtures: [stale], results: [] as Match[] };
  const merged = applyLive(data, today);
  assert.equal(merged.fixtures[0].state, 'post');
  assert.equal(merged.fixtures[0].awayScore, 2);
  assert.equal(applyLive(data, []), data);
  // Takım listelerinde hiç görünmeyen Rizespor maçı fikstüre eklenir; diğer maçlar eklenmez.
  const added = applyLive({ fixtures: [] as Match[], results: [] as Match[] }, today);
  assert.deepEqual(added.fixtures.map((m) => m.id), [ours.id]);
  assert.equal(scoreboardDate(new Date('2026-11-21T23:30:00Z')), '20261121');
});

test('Maç ayrıntısı: hakem, son 5 maç formu, önceki karşılaşmalar ve oyuncu istatistikleri', () => {
  const d = parseSummary(fixture('summary-h2h'))!;
  assert.equal(d.referee, 'Cihan Aydin');
  assert.equal(d.form.home.length, 5);
  assert.equal(d.form.away.length, 5);
  for (const list of [d.form.home, d.form.away]) {
    for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].date >= list[i].date, 'form yeniden eskiye');
  }
  assert.ok(d.h2h.length >= 1);
  assert.ok(d.h2h.every((g) => g.id !== d.match.id));
  const keys = d.stats.map((s) => s.key);
  for (const k of ['possessionPct', 'passPct', 'totalTackles', 'saves']) assert.ok(keys.includes(k), k);
  const pass = d.stats.find((s) => s.key === 'passPct')!;
  assert.ok(pass.home > 50 && pass.home <= 100, 'pas isabeti yüzde olarak');
  const gk = [...(d.lineups.home?.starters ?? []), ...(d.lineups.away?.starters ?? [])].find((p) => p.position === 'G' && p.saves > 0);
  assert.ok(gk, 'kurtarış yapan kaleci');
});

test('Sezon özeti ve seriler', () => {
  const results = parseSchedule(fixture('results'));
  const s = seasonSummary(results);
  assert.equal(s.all.played, s.home.played + s.away.played);
  assert.equal(s.all.won + s.all.drawn + s.all.lost, s.all.played);
  assert.equal(s.all.points, s.all.won * 3 + s.all.drawn);
  assert.deepEqual(currentStreak(['M', 'G', 'G', 'G']), { kind: 'winning', length: 3 });
  assert.deepEqual(currentStreak(['M', 'G', 'B', 'G']), { kind: 'unbeaten', length: 3 });
  assert.deepEqual(currentStreak(['G', 'M', 'B']), { kind: 'winless', length: 2 });
  assert.equal(currentStreak(['G']), null);
});

test('Takım liderleri: sıfır değerler listelenmez, kurtarış yalnızca kalecilerde', () => {
  const roster = parseRoster(fixture('roster')).map((p, i) => ({
    ...p,
    stats: { apps: 10, goals: i === 3 ? 5 : i === 7 ? 2 : 0, assists: 0, shots: 0, yellow: 0, red: 0, saves: 9, conceded: 0 },
  }));
  const boards = teamLeaders(roster);
  const goals = boards.find((b) => b.id === 'goals')!;
  assert.deepEqual(goals.leaders.map((l) => l.value), [5, 2]);
  assert.ok(!boards.some((b) => b.id === 'assists'));
  assert.ok(boards.find((b) => b.id === 'saves')!.leaders.every((l) => l.player.group === 'GK'));
});
