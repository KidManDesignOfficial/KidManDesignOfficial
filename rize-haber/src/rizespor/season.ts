/**
 * Rizespor'un sezon özeti (iç saha / deplasman, gol ortalaması, gol yemeden biten maçlar) ve kadro
 * istatistiklerinden takım liderleri. Saf modüldür.
 */
import type { Match, Player } from './parse.ts';

export type Record3 = { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number };

export type SeasonSummary = {
  all: Record3;
  home: Record3;
  away: Record3;
  cleanSheets: number;
  failedToScore: number;
  /** En farklı galibiyet (yoksa null). */
  biggestWin: Match | null;
  /** Son maçlardan geriye doğru süren seri: "3 maçtır yenilmiyor" gibi. */
  streak: { kind: 'unbeaten' | 'winless' | 'winning' | 'losing'; length: number } | null;
};

const empty = (): Record3 => ({ played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });

function add(r: Record3, gf: number, ga: number): void {
  r.played++;
  r.goalsFor += gf;
  r.goalsAgainst += ga;
  if (gf > ga) {
    r.won++;
    r.points += 3;
  } else if (gf === ga) {
    r.drawn++;
    r.points += 1;
  } else r.lost++;
}

/** Biten maçlardan (sıra önemsiz) sezon özeti. */
export function seasonSummary(results: Match[]): SeasonSummary {
  const done = results
    .filter((m) => m.state === 'post' && m.result && m.homeScore !== null && m.awayScore !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const s: SeasonSummary = { all: empty(), home: empty(), away: empty(), cleanSheets: 0, failedToScore: 0, biggestWin: null, streak: null };
  let bestMargin = 0;
  for (const m of done) {
    const gf = (m.rizesporHome ? m.homeScore : m.awayScore)!;
    const ga = (m.rizesporHome ? m.awayScore : m.homeScore)!;
    add(s.all, gf, ga);
    add(m.rizesporHome ? s.home : s.away, gf, ga);
    if (ga === 0) s.cleanSheets++;
    if (gf === 0) s.failedToScore++;
    if (gf - ga > bestMargin) {
      bestMargin = gf - ga;
      s.biggestWin = m;
    }
  }
  s.streak = currentStreak(done.map((m) => m.result!));
  return s;
}

/** En az 2 maçlık güncel seri; en anlamlısı seçilir (galibiyet serisi > yenilmezlik). */
export function currentStreak(results: ('G' | 'B' | 'M')[]): SeasonSummary['streak'] {
  const rev = [...results].reverse();
  const run = (ok: (r: 'G' | 'B' | 'M') => boolean) => {
    let n = 0;
    while (n < rev.length && ok(rev[n])) n++;
    return n;
  };
  const winning = run((r) => r === 'G');
  if (winning >= 2) return { kind: 'winning', length: winning };
  const losing = run((r) => r === 'M');
  if (losing >= 2) return { kind: 'losing', length: losing };
  const unbeaten = run((r) => r !== 'M');
  if (unbeaten >= 2) return { kind: 'unbeaten', length: unbeaten };
  const winless = run((r) => r !== 'G');
  if (winless >= 2) return { kind: 'winless', length: winless };
  return null;
}

export function streakText(s: NonNullable<SeasonSummary['streak']>): string {
  switch (s.kind) {
    case 'winning':
      return `Üst üste ${s.length} galibiyet`;
    case 'losing':
      return `Üst üste ${s.length} mağlubiyet`;
    case 'unbeaten':
      return `${s.length} maçtır yenilmiyor`;
    case 'winless':
      return `${s.length} maçtır kazanamıyor`;
  }
}

export type Leader = { player: Player; value: number };
export type LeaderBoard = { id: 'goals' | 'assists' | 'apps' | 'saves' | 'cards'; label: string; unit: string; leaders: Leader[] };

/** Kadro istatistiklerinden ilk 3'ler. Değeri sıfır olan oyuncu listelenmez. */
export function teamLeaders(roster: Player[], top = 3): LeaderBoard[] {
  const board = (id: LeaderBoard['id'], label: string, unit: string, value: (p: Player) => number): LeaderBoard => ({
    id,
    label,
    unit,
    leaders: roster
      .map((player) => ({ player, value: value(player) }))
      .filter((l) => l.value > 0)
      .sort((a, b) => b.value - a.value || a.player.stats.apps - b.player.stats.apps || a.player.name.localeCompare(b.player.name, 'tr'))
      .slice(0, top),
  });
  return [
    board('goals', 'Gol', 'gol', (p) => p.stats.goals),
    board('assists', 'Asist', 'asist', (p) => p.stats.assists),
    board('apps', 'Maç', 'maç', (p) => p.stats.apps),
    board('saves', 'Kurtarış', 'kurtarış', (p) => (p.group === 'GK' ? p.stats.saves : 0)),
    board('cards', 'Kart', 'kart', (p) => p.stats.yellow + p.stats.red),
  ].filter((b) => b.leaders.length > 0);
}
