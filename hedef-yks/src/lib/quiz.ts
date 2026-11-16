/**
 * Test oluşturma: konu/ders havuzundan soru seçimi, tohumlu karıştırma, deneme sınavı ve
 * öğretmen çalışma kâğıdı metni.
 */
import type { Question } from '../data/types.ts';

/** Tohumlu sözde rastgele sayı üreteci (mulberry32). Aynı tohum aynı sırayı verir. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const r = rng(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(items: readonly T[], count: number, seed: number): T[] {
  return shuffle(items, seed).slice(0, Math.max(0, count));
}

/** Kolaydan zora sıralar; aynı zorluktakiler kendi içinde karışık kalır. */
export function byDifficulty(qs: Question[], seed: number): Question[] {
  return shuffle(qs, seed).sort((a, b) => a.difficulty - b.difficulty);
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Öğretmen modu: paylaşılabilir düz metin çalışma kâğıdı + cevap anahtarı. */
export function worksheetText(title: string, qs: Question[], withKey = true): string {
  const lines: string[] = [title, '='.repeat(Math.min(40, title.length)), ''];
  qs.forEach((q, i) => {
    lines.push(`${i + 1}) ${q.text}`);
    q.options.forEach((o, k) => lines.push(`   ${LETTERS[k]}) ${o}`));
    lines.push('');
  });
  if (withKey) {
    lines.push('CEVAP ANAHTARI');
    lines.push(qs.map((q, i) => `${i + 1}-${LETTERS[q.answer]}`).join('  '));
  }
  lines.push('', 'Hedef YKS ile hazırlandı.');
  return lines.join('\n');
}

export function letter(i: number): string {
  return LETTERS[i] ?? '?';
}
