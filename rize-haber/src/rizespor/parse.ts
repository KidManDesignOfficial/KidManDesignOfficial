/**
 * ESPN futbol verisini uygulamanın kendi tiplerine çevirir.
 *
 * Kaynak resmî/belgelenmiş değildir; bu yüzden her alan savunmacı biçimde okunur: beklenmeyen ya da
 * eksik veri uygulamayı çökertmez, ilgili kayıt atlanır. Fonksiyonlar yan etkisizdir ve gerçek
 * yanıtlardan alınmış örneklerle (`test/fixtures/espn`) test edilir.
 */
import { RIZESPOR_ID, STAT_LABELS, positionGroup, teamName, venueName, zoneLabel, type PositionGroup, type StatGroup } from './names.ts';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);
const num = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
};
const get = (v: unknown, ...path: (string | number)[]): unknown =>
  path.reduce<unknown>((acc, key) => (isObj(acc) || Array.isArray(acc) ? (acc as Obj)[key as string] : undefined), v);

export type MatchState = 'pre' | 'in' | 'post';

export type TeamRef = { id: string; name: string; abbr: string };

export type Match = {
  id: string;
  date: Date;
  home: TeamRef;
  away: TeamRef;
  homeScore: number | null;
  awayScore: number | null;
  state: MatchState;
  /** Kısa durum: "MS", "İY", "67'", "Ertelendi" … */
  status: string;
  venue: string | null;
  /** Oyun saati (saniye; canlıda yerel olarak ilerletilir) ve devre (1, 2; uzatmalar 3, 4). */
  clockSec: number | null;
  period: number | null;
  /** Saat işliyor mu (canlı ve devre arası değil). */
  running: boolean;
  /** Rizespor açısından sonuç (yalnızca biten maçlar). */
  result: 'G' | 'B' | 'M' | null;
  rizesporHome: boolean;
};

function parseTeam(v: unknown): TeamRef | null {
  const id = str(get(v, 'id'));
  if (!id) return null;
  return {
    id,
    name: teamName(str(get(v, 'displayName'))),
    abbr: str(get(v, 'abbreviation')) ?? '',
  };
}

function parseScore(v: unknown): number | null {
  if (isObj(v)) return num(v.value) ?? num(v.displayValue);
  return num(v);
}

/** ESPN durum nesnesini kısa Türkçe metne çevirir. */
export function statusText(status: unknown): { state: MatchState; text: string; running: boolean } {
  const base = statusTextBase(status);
  const name = str(get(status, 'type', 'name')) ?? '';
  const paused = name.includes('HALFTIME') || name.includes('END_PERIOD') || name.includes('ABANDONED') || name.includes('SUSPENDED') || name.includes('DELAY');
  return { ...base, running: base.state === 'in' && !paused };
}

/** "67'" → 67·60, "45'+2'" → (45+2)·60. Saat değeri yoksa gösterilen dakikadan türetilir. */
export function clockSeconds(status: unknown): number | null {
  const display = str(get(status, 'displayClock')) ?? '';
  const plus = /^(\d+)'\s*\+\s*(\d+)/.exec(display);
  if (plus) return (Number(plus[1]) + Number(plus[2])) * 60 - 30;
  const value = num(get(status, 'clock'));
  if (value !== null && value > 0) return value;
  const m = /^(\d+)'/.exec(display);
  return m ? Number(m[1]) * 60 - 30 : null;
}

function statusTextBase(status: unknown): { state: MatchState; text: string } {
  const type = get(status, 'type');
  const rawState = str(get(type, 'state'));
  const state: MatchState = rawState === 'in' || rawState === 'post' ? rawState : 'pre';
  const name = str(get(type, 'name')) ?? '';
  const clock = str(get(status, 'displayClock'));

  if (name.includes('HALFTIME')) return { state, text: 'Devre arası' };
  if (name.includes('POSTPONED')) return { state: 'pre', text: 'Ertelendi' };
  if (name.includes('CANCELED') || name.includes('CANCELLED')) return { state: 'pre', text: 'İptal' };
  if (name.includes('ABANDONED') || name.includes('SUSPENDED')) return { state, text: 'Durduruldu' };
  if (state === 'post') {
    if (name.includes('PEN')) return { state, text: 'MS (pen.)' };
    if (name.includes('AET') || name.includes('EXTRA')) return { state, text: 'MS (uz.)' };
    return { state, text: 'MS' };
  }
  if (state === 'in') return { state, text: clock && clock !== "0'" ? clock : 'Canlı' };
  return { state, text: '' };
}

export function parseEvent(e: unknown): Match | null {
  const id = str(get(e, 'id'));
  const date = new Date(str(get(e, 'date')) ?? str(get(e, 'competitions', 0, 'date')) ?? '');
  const comp = get(e, 'competitions', 0);
  if (!id || Number.isNaN(date.getTime()) || !isObj(comp)) return null;

  const competitors = arr(comp.competitors);
  const homeC = competitors.find((c) => get(c, 'homeAway') === 'home');
  const awayC = competitors.find((c) => get(c, 'homeAway') === 'away');
  const home = parseTeam(get(homeC, 'team'));
  const away = parseTeam(get(awayC, 'team'));
  if (!home || !away) return null;

  const { state, text, running } = statusText(comp.status);
  const homeScore = state === 'pre' ? null : parseScore(get(homeC, 'score'));
  const awayScore = state === 'pre' ? null : parseScore(get(awayC, 'score'));
  const rizesporHome = home.id === RIZESPOR_ID;

  let result: Match['result'] = null;
  if (state === 'post' && homeScore !== null && awayScore !== null && (rizesporHome || away.id === RIZESPOR_ID)) {
    const us = rizesporHome ? homeScore : awayScore;
    const them = rizesporHome ? awayScore : homeScore;
    result = us > them ? 'G' : us === them ? 'B' : 'M';
  }

  return {
    id,
    date,
    home,
    away,
    homeScore,
    awayScore,
    state,
    status: text,
    venue: venueName(str(get(comp, 'venue', 'fullName'))),
    clockSec: state === 'in' ? clockSeconds(comp.status) : null,
    period: num(get(comp, 'status', 'period')),
    running,
    result,
    rizesporHome,
  };
}

/** Takım fikstür/sonuç yanıtı → maçlar (tarihe göre artan). */
export function parseSchedule(json: unknown): Match[] {
  return arr(get(json, 'events'))
    .map(parseEvent)
    .filter((m): m is Match => m !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type StandingRow = {
  rank: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  zone: { color: string; label: string } | null;
};

export function parseStandings(json: unknown): StandingRow[] {
  const entries = arr(get(json, 'children', 0, 'standings', 'entries'));
  const rows: StandingRow[] = [];
  for (const e of entries) {
    const team = parseTeam(get(e, 'team'));
    if (!team) continue;
    const stats = new Map<string, number>();
    for (const s of arr(get(e, 'stats'))) {
      const name = str(get(s, 'name'));
      const value = num(get(s, 'value')) ?? num(get(s, 'displayValue'));
      if (name && value !== null) stats.set(name, value);
    }
    const rank = stats.get('rank');
    const points = stats.get('points');
    if (rank === undefined || points === undefined) continue;
    const zoneColor = str(get(e, 'note', 'color'));
    const label = zoneLabel(str(get(e, 'note', 'description')));
    rows.push({
      rank,
      team,
      played: stats.get('gamesPlayed') ?? 0,
      won: stats.get('wins') ?? 0,
      drawn: stats.get('ties') ?? 0,
      lost: stats.get('losses') ?? 0,
      goalsFor: stats.get('pointsFor') ?? 0,
      goalsAgainst: stats.get('pointsAgainst') ?? 0,
      goalDiff: stats.get('pointDifferential') ?? 0,
      points,
      zone: zoneColor && label ? { color: zoneColor, label } : null,
    });
  }
  return rows.sort((a, b) => a.rank - b.rank);
}

export type Player = {
  id: string;
  name: string;
  jersey: string | null;
  group: PositionGroup;
  age: number | null;
  nationality: string | null; // alpha-3
  country: string | null; // İngilizce ülke adı (erişilebilirlik etiketi için)
  injured: boolean;
  /** Sezon istatistikleri (kaynakta yoksa sıfır). */
  stats: PlayerSeason;
};

export type PlayerSeason = {
  apps: number;
  goals: number;
  assists: number;
  shots: number;
  yellow: number;
  red: number;
  saves: number;
  conceded: number;
};

function seasonStats(a: unknown): PlayerSeason {
  const map = new Map<string, number>();
  for (const c of arr(get(a, 'statistics', 'splits', 'categories'))) {
    for (const st of arr(get(c, 'stats'))) {
      const name = str(get(st, 'name'));
      const value = num(get(st, 'value'));
      if (name && value !== null) map.set(name, value);
    }
  }
  const n = (k: string) => map.get(k) ?? 0;
  return {
    apps: n('appearances'),
    goals: n('totalGoals'),
    assists: n('goalAssists'),
    shots: n('totalShots'),
    yellow: n('yellowCards'),
    red: n('redCards'),
    saves: n('saves'),
    conceded: n('goalsConceded'),
  };
}

export function parseRoster(json: unknown): Player[] {
  const players: Player[] = [];
  for (const a of arr(get(json, 'athletes'))) {
    const id = str(get(a, 'id'));
    const name = str(get(a, 'displayName'));
    if (!id || !name) continue;
    players.push({
      id,
      name,
      jersey: str(get(a, 'jersey')),
      group: positionGroup(str(get(a, 'position', 'name'))),
      age: num(get(a, 'age')),
      nationality: str(get(a, 'citizenshipCountry', 'abbreviation')),
      country: str(get(a, 'flag', 'alt')),
      injured: arr(get(a, 'injuries')).length > 0,
      stats: seasonStats(a),
    });
  }
  const jersey = (p: Player) => num(p.jersey) ?? 999;
  return players.sort((a, b) => jersey(a) - jersey(b));
}

export type EventKind = 'goal' | 'own-goal' | 'penalty' | 'yellow' | 'red' | 'sub' | 'other';

export type MatchEvent = {
  id: string;
  kind: EventKind;
  minute: string;
  /** Sıralama için dakika (saniye cinsinden saat değeri yoksa dakikadan türetilir). */
  order: number;
  teamId: string | null;
  /** Gol/kart: oyuncu; değişiklik: giren oyuncu. */
  player: string | null;
  /** Değişiklik: çıkan oyuncu. */
  playerOut: string | null;
  /** Gol: asist yapan oyuncu (kaynak verirse). */
  assist: string | null;
  /** Devre (1, 2 …); bilinmiyorsa dakikadan tahmin edilir. */
  period: number;
};

function eventKind(typeText: string, typeKey: string, scoring: boolean): EventKind {
  const t = `${typeKey} ${typeText}`.toLowerCase();
  if (t.includes('own')) return 'own-goal';
  if (t.includes('penalty') && (t.includes('scored') || scoring)) return 'penalty';
  if (scoring || t.includes('goal')) return 'goal';
  if (t.includes('red')) return 'red';
  if (t.includes('yellow')) return 'yellow';
  if (t.includes('substitution')) return 'sub';
  return 'other';
}

function minuteOrder(display: string, clockValue: number | null): number {
  if (clockValue !== null) return clockValue;
  const m = /^(\d+)'(?:\+(\d+))?/.exec(display);
  return m ? (Number(m[1]) + Number(m[2] ?? 0) / 100) * 60 : 0;
}

export type LineupPlayer = {
  name: string;
  jersey: string | null;
  position: string;
  subbedOut: boolean;
  subbedIn: boolean;
  /** Bu maçtaki istatistikler. */
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  saves: number;
  yellow: number;
  red: number;
};
export type Lineup = { teamId: string; formation: string | null; starters: LineupPlayer[]; bench: LineupPlayer[] };
export type TeamStat = { key: string; label: string; group: StatGroup; home: number; away: number; percent: boolean };

/** Bir takımın son maçlarından biri (kendi açısından). */
export type FormGame = { id: string; date: Date; opponent: string; home: boolean; goalsFor: number; goalsAgainst: number; result: 'G' | 'B' | 'M' };

/** İki takımın önceki karşılaşmalarından biri. */
export type H2HGame = { id: string; date: Date; home: TeamRef; away: TeamRef; homeScore: number; awayScore: number };

export type MatchDetail = {
  match: Match;
  events: MatchEvent[];
  stats: TeamStat[];
  lineups: { home: Lineup | null; away: Lineup | null };
  referee: string | null;
  attendance: number | null;
  /** İki takımın bu maçtan önceki son 5 maçı (yeniden eskiye). */
  form: { home: FormGame[]; away: FormGame[] };
  h2h: H2HGame[];
};

function parseFormGames(json: unknown, teamId: string): FormGame[] {
  const block = arr(get(json, 'lastFiveGames')).find((b) => str(get(b, 'team', 'id')) === teamId);
  const out: FormGame[] = [];
  for (const e of arr(get(block, 'events'))) {
    const id = str(get(e, 'id'));
    const date = new Date(str(get(e, 'gameDate')) ?? '');
    const hs = num(get(e, 'homeTeamScore'));
    const as = num(get(e, 'awayTeamScore'));
    const raw = str(get(e, 'gameResult'));
    if (!id || Number.isNaN(date.getTime()) || hs === null || as === null || !raw) continue;
    const home = str(get(e, 'homeTeamId')) === teamId;
    out.push({
      id,
      date,
      opponent: teamName(str(get(e, 'opponent', 'displayName'))),
      home,
      goalsFor: home ? hs : as,
      goalsAgainst: home ? as : hs,
      result: raw === 'W' ? 'G' : raw === 'D' ? 'B' : 'M',
    });
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function parseH2H(json: unknown, currentId: string): H2HGame[] {
  const out: H2HGame[] = [];
  for (const series of arr(get(json, 'seasonseries'))) {
    for (const e of arr(get(series, 'events'))) {
      const id = str(get(e, 'id'));
      if (!id || id === currentId || get(e, 'statusType', 'state') !== 'post') continue;
      const date = new Date(str(get(e, 'date')) ?? '');
      const cs = arr(get(e, 'competitors'));
      const hc = cs.find((c) => get(c, 'homeAway') === 'home');
      const ac = cs.find((c) => get(c, 'homeAway') === 'away');
      const home = parseTeam(get(hc, 'team'));
      const away = parseTeam(get(ac, 'team'));
      const homeScore = parseScore(get(hc, 'score'));
      const awayScore = parseScore(get(ac, 'score'));
      if (Number.isNaN(date.getTime()) || !home || !away || homeScore === null || awayScore === null) continue;
      if (!out.some((x) => x.id === id)) out.push({ id, date, home, away, homeScore, awayScore });
    }
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function parseSummary(json: unknown, fallbackId = ''): MatchDetail | null {
  const comp = get(json, 'header', 'competitions', 0);
  const match = parseEvent({
    id: str(get(json, 'header', 'id')) ?? fallbackId,
    date: str(get(comp, 'date')),
    competitions: [
      {
        ...(isObj(comp) ? comp : {}),
        venue: { fullName: str(get(json, 'gameInfo', 'venue', 'fullName')) },
      },
    ],
  });
  if (!match) return null;

  const events: MatchEvent[] = [];
  for (const [i, k] of arr(get(json, 'keyEvents')).entries()) {
    const kind = eventKind(str(get(k, 'type', 'text')) ?? '', str(get(k, 'type', 'type')) ?? '', get(k, 'scoringPlay') === true);
    if (kind === 'other') continue;
    const minute = str(get(k, 'clock', 'displayValue')) ?? '';
    const participants = arr(get(k, 'participants')).map((p) => str(get(p, 'athlete', 'displayName')));
    events.push({
      id: str(get(k, 'id')) ?? `${i}`,
      kind,
      minute,
      order: minuteOrder(minute, num(get(k, 'clock', 'value'))),
      teamId: str(get(k, 'team', 'id')),
      player: participants[0] ?? null,
      playerOut: kind === 'sub' ? (participants[1] ?? null) : null,
      assist: kind === 'goal' || kind === 'penalty' ? (participants[1] ?? null) : null,
      period: num(get(k, 'period', 'number')) ?? (minuteOrder(minute, null) > 45.5 * 60 ? 2 : 1),
    });
  }
  events.sort((a, b) => a.order - b.order);

  const teams = arr(get(json, 'boxscore', 'teams'));
  const statsFor = (teamId: string) => {
    const t = teams.find((x) => str(get(x, 'team', 'id')) === teamId);
    const map = new Map<string, number>();
    for (const s of arr(get(t, 'statistics'))) {
      const name = str(get(s, 'name'));
      const value = num(get(s, 'displayValue'));
      if (name && value !== null) map.set(name, value);
    }
    // Pas isabeti kaynakta 0–1 kesir olarak gelir ve yuvarlanmıştır; isabetli/toplam pastan yeniden hesaplanır.
    const acc = map.get('accuratePasses');
    const tot = map.get('totalPasses');
    if (acc !== undefined && tot) map.set('passPct', (acc / tot) * 100);
    else if (map.has('passPct')) map.set('passPct', map.get('passPct')! * 100);
    return map;
  };
  const homeStats = statsFor(match.home.id);
  const awayStats = statsFor(match.away.id);
  const stats: TeamStat[] = STAT_LABELS.filter((s) => homeStats.has(s.key) && awayStats.has(s.key)).map((s) => ({
    key: s.key,
    label: s.label,
    group: s.group,
    home: homeStats.get(s.key)!,
    away: awayStats.get(s.key)!,
    percent: s.percent ?? false,
  }));

  const lineupFor = (side: 'home' | 'away'): Lineup | null => {
    const teamId = side === 'home' ? match.home.id : match.away.id;
    const r = arr(get(json, 'rosters')).find(
      (x) => get(x, 'homeAway') === side || str(get(x, 'team', 'id')) === teamId,
    );
    if (!r) return null;
    const players = arr(get(r, 'roster'))
      .map((p) => {
        const name = str(get(p, 'athlete', 'displayName'));
        if (!name) return null;
        const ps = new Map<string, number>();
        for (const st of arr(get(p, 'stats'))) {
          const k = str(get(st, 'name'));
          const v = num(get(st, 'value')) ?? num(get(st, 'displayValue'));
          if (k && v !== null) ps.set(k, v);
        }
        const n = (k: string) => ps.get(k) ?? 0;
        return {
          starter: get(p, 'starter') === true,
          player: {
            name,
            jersey: str(get(p, 'jersey')),
            position: str(get(p, 'position', 'abbreviation')) ?? '',
            subbedOut: get(p, 'subbedOut') === true,
            subbedIn: get(p, 'subbedIn') === true,
            goals: n('totalGoals'),
            assists: n('goalAssists'),
            shots: n('totalShots'),
            shotsOnTarget: n('shotsOnTarget'),
            saves: n('saves'),
            yellow: n('yellowCards'),
            red: n('redCards'),
          },
        };
      })
      .filter((x): x is { starter: boolean; player: LineupPlayer } => x !== null);
    const starters = players.filter((p) => p.starter).map((p) => p.player);
    if (starters.length === 0) return null;
    return {
      teamId,
      formation: str(get(r, 'formation')),
      starters,
      bench: players.filter((p) => !p.starter).map((p) => p.player),
    };
  };

  const officials = arr(get(json, 'gameInfo', 'officials'));
  const referee = str(get(officials.find((o) => /referee/i.test(str(get(o, 'position', 'name')) ?? '')), 'displayName'));
  const attendance = num(get(json, 'gameInfo', 'attendance'));

  return {
    match,
    events,
    stats,
    lineups: { home: lineupFor('home'), away: lineupFor('away') },
    referee,
    attendance: attendance && attendance > 0 ? attendance : null,
    form: { home: parseFormGames(json, match.home.id), away: parseFormGames(json, match.away.id) },
    h2h: parseH2H(json, match.id),
  };
}

/** Rizespor açısından son N maçın formu (eskiden yeniye). */
export function recentForm(matches: Match[], n = 5): ('G' | 'B' | 'M')[] {
  return matches
    .filter((m) => m.result !== null)
    .slice(-n)
    .map((m) => m.result!);
}
