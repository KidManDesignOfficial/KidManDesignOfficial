/**
 * İlk 11'i saha üzerindeki satırlara yerleştirir.
 *
 * Kaynağın "formationPlace" numarası satır sırasıyla örtüşmediği için oyuncular mevki koduna göre
 * (G, RB, CD-L, DM, CM-R, LM, F …) kaleden ileriye sıralanır ve diziliş sayılarına ("4-1-4-1")
 * bölünür. Satır içinde soldan sağa sıralama kodun L/R ekinden çıkarılır.
 */
import type { LineupPlayer } from './parse.ts';

/** Kaleden uzaklık sırası: 0 kaleci … 6 forvet. */
function depth(code: string): number {
  const c = code.toUpperCase();
  if (c === 'G' || c === 'GK') return 0;
  // DM, "D" ile başladığı için defans kontrolünden önce bakılmalı.
  if (/^DM/.test(c)) return 2;
  if (/^(SW|CD|CB)/.test(c) || c === 'D' || /^(RB|LB|RWB|LWB|WB)$/.test(c)) return /WB$/.test(c) ? 1.5 : 1;
  if (/^(CM|RM|LM|M)/.test(c)) return 3;
  if (/^(AM|CAM)/.test(c)) return 4;
  if (/^(RW|LW)/.test(c)) return 5;
  return 6; // F, CF, ST …
}

/**
 * Soldan sağa konum: 0 kenar sol (LB, LM, LW), 1 iç sol (CD-L, CM-L), 2 orta,
 * 3 iç sağ (CD-R, CM-R), 4 kenar sağ (RB, RM, RW).
 */
function side(code: string): number {
  const c = code.toUpperCase();
  if (/-L$/.test(c)) return 1;
  if (/-R$/.test(c)) return 3;
  if (/^L/.test(c)) return 0;
  if (/^R/.test(c)) return 4;
  return 2;
}

export function parseFormation(formation: string | null | undefined): number[] | null {
  if (!formation) return null;
  const parts = formation.split('-').map(Number);
  if (parts.length < 2 || parts.some((n) => !Number.isInteger(n) || n <= 0)) return null;
  if (parts.reduce((a, b) => a + b, 0) !== 10) return null;
  return parts;
}

/**
 * Satırları kaleden ileriye döndürür: [ [kaleci], [defans…], …, [forvet…] ].
 * Diziliş bilinmiyorsa satırlar mevki derinliğine göre kendiliğinden oluşturulur.
 */
export function lineupRows(starters: LineupPlayer[], formation: string | null | undefined): LineupPlayer[][] {
  const sorted = [...starters].sort((a, b) => depth(a.position) - depth(b.position));
  const keeper = sorted.filter((p) => depth(p.position) === 0).slice(0, 1);
  const outfield = sorted.filter((p) => !keeper.includes(p));
  const counts = parseFormation(formation);

  let rows: LineupPlayer[][];
  if (counts && counts.reduce((a, b) => a + b, 0) === outfield.length) {
    rows = [];
    let i = 0;
    for (const n of counts) {
      rows.push(outfield.slice(i, i + n));
      i += n;
    }
  } else {
    const byDepth = new Map<number, LineupPlayer[]>();
    for (const p of outfield) {
      const d = Math.round(depth(p.position));
      byDepth.set(d, [...(byDepth.get(d) ?? []), p]);
    }
    rows = [...byDepth.entries()].sort((a, b) => a[0] - b[0]).map(([, ps]) => ps);
  }

  return [keeper, ...rows].filter((r) => r.length > 0).map((r) => [...r].sort((a, b) => side(a.position) - side(b.position)));
}
