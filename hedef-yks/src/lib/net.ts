/**
 * Net hesabı ve sınav yardımcıları. ÖSYM kuralı: 4 yanlış 1 doğruyu götürür.
 */
export type Tally = { correct: number; wrong: number; blank: number };

export function net(correct: number, wrong: number): number {
  return Math.round((correct - wrong / 4) * 100) / 100;
}

export function tallyNet(t: Tally): number {
  return net(t.correct, t.wrong);
}

/** Bir testte girilen doğru + yanlış, soru sayısını aşamaz. */
export function clampTally(t: Tally, total: number): Tally {
  const correct = Math.max(0, Math.min(total, Math.floor(t.correct)));
  const wrong = Math.max(0, Math.min(total - correct, Math.floor(t.wrong)));
  return { correct, wrong, blank: total - correct - wrong };
}

export function formatNet(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}
