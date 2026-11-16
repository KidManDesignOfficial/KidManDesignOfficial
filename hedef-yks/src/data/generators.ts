/**
 * Sınırsız soru üreticileri.
 *
 * Her üretici, tohumlu rastgele sayılarla yeni bir soru kurar; doğru cevap formülden hesaplanır
 * (elle yazılmış cevap yoktur), yanlış seçenekler tipik hatalardan (işlem/işaret/formül karışıklığı) türetilir.
 * Aynı tohum her zaman aynı soruyu verir; bu yüzden soru kimliği `g:<konu>:<tohum>` yeterlidir ve
 * Yanlış Defteri / ilerleme kaydı değişmeden çalışır.
 *
 * Kapsam: hesaplama içeren konular (Matematik, Geometri, Fizik, Kimya). Sözel derslerde üretilmez:
 * bilgi sorularının doğruluğu hesapla doğrulanamaz, bunlar elle yazılmış sorularda kalır.
 */
import type { Difficulty, Question } from './types.ts';
import { rng } from '../lib/quiz.ts';

type R = () => number;
type Drafted = Pick<Question, 'text' | 'options' | 'answer' | 'explanation' | 'difficulty'>;
type Gen = (r: R) => Drafted;

// ───────── Yardımcılar ─────────
const ri = (r: R, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const one = <T>(r: R, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const fmt = (n: number) => String(Math.round(n * 10000) / 10000).replace('.', ',').replace('-', '−');
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sup = (n: number) => String(n).split('').map((d) => (d === '-' ? '⁻' : SUP[+d])).join('');
const sub = (n: number) => String(n).split('').map((d) => SUB[+d]).join('');
const frac = (n: number, d: number) => {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  return b === 1 ? String(a) : `${a}/${b}`;
};
const sgn = (n: number) => (n < 0 ? '−' : '+');
const term = (n: number, v: string) => `${sgn(n)} ${Math.abs(n) === 1 && v ? '' : Math.abs(n)}${v}`;

/** Sayısal cevaplı soru: seçenekler küçükten büyüğe sıralanır; eksik yanlışlar cevabın çevresinden tamamlanır. */
const clean = (v: number) => Number.isFinite(v) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
class Retry extends Error {}

const r4 = (v: number) => Math.round(v * 10000) / 10000;

function num(_r: R, text: string, ans0: number, wrong0: number[], explanation: string, difficulty: Difficulty, unit = '', step = 1): Drafted {
  const ans = r4(ans0);
  const wrong = wrong0.map(r4);
  if (!clean(ans)) throw new Retry(); // sonsuz ondalıklı cevap: başka sayılarla yeniden üret
  const seen = new Set<number>([ans]);
  const ws: number[] = [];
  for (const w of wrong) {
    if (clean(w) && !seen.has(w) && !(ans > 0 && w < 0)) {
      seen.add(w);
      ws.push(w);
    }
  }
  for (let k = 1; ws.length < 4 && k < 50; k++)
    for (const w of [r4(ans + k * step), r4(ans - k * step)]) {
      if (ws.length < 4 && !seen.has(w) && !(ans > 0 && w <= 0)) {
        seen.add(w);
        ws.push(w);
      }
    }
  const pool = [...ws.slice(0, 4), ans];
  const sorted = pool.sort((a, b) => a - b);
  return {
    text,
    options: sorted.map((v) => `${fmt(v)}${unit}`) as Drafted['options'],
    answer: sorted.indexOf(ans) as Drafted['answer'],
    explanation,
    difficulty,
  };
}

/** Metin cevaplı soru: seçenek sırası tohuma göre karışır. */
function str(r: R, text: string, ans: string, wrong: string[], explanation: string, difficulty: Difficulty): Drafted {
  const ws = [...new Set(wrong.filter((w) => w !== ans))];
  // Tipik hatalar yetmezse cevabın ilk sayısını kaydırarak benzer görünümlü seçenek türet.
  for (let k = 1; ws.length < 4 && k < 40; k++) {
    const alt = ans.replace(/\d+/, (d) => String(Number(d) + k));
    if (alt !== ans && !ws.includes(alt)) ws.push(alt);
  }
  ws.length = Math.min(ws.length, 4);
  if (ws.length < 4) throw new Error('Yetersiz yanlış seçenek: ' + text);
  const all = [ans, ...ws];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return { text, options: all as Drafted['options'], answer: all.indexOf(ans) as Drafted['answer'], explanation, difficulty };
}

const poly = (cs: number[]) => {
  // cs: yüksekten düşüğe katsayılar
  const n = cs.length - 1;
  let s = '';
  cs.forEach((c, i) => {
    if (c === 0) return;
    const p = n - i;
    const v = p === 0 ? '' : p === 1 ? 'x' : `x${sup(p)}`;
    const body = Math.abs(c) === 1 && v ? v : `${Math.abs(c)}${v}`;
    s += s ? ` ${sgn(c)} ${body}` : `${c < 0 ? '−' : ''}${body}`;
  });
  return s || '0';
};

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10]];
const PAIRS_PARALLEL: [number, number, number][] = [[3, 6, 2], [6, 12, 4], [4, 12, 3], [10, 15, 6], [20, 30, 12], [6, 3, 2], [12, 4, 3]];

// ───────── TYT Matematik ─────────
const ebobEkok: Gen = (r) => {
  const g = ri(r, 2, 12);
  const [m, n] = one(r, [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [3, 7], [5, 6], [2, 7], [4, 9]] as const);
  const [a, b] = [g * m, g * n];
  if (r() < 0.5) {
    return num(r, `${a} ve ${b} sayılarının EBOB’u kaçtır?`, g, [m, n, g * m * n, a + b - g], `${a} = ${g}·${m}, ${b} = ${g}·${n}; ${m} ile ${n} aralarında asal olduğundan EBOB = ${g}.`, 1);
  }
  return num(r, `${a} ve ${b} sayılarının EKOK’u kaçtır?`, g * m * n, [a * b, g, a + b, g * (m + n)], `EBOB = ${g}; EBOB·EKOK = ${a}·${b} ⇒ EKOK = ${a * b}/${g} = ${g * m * n}.`, 2);
};

const bolunebilme: Gen = (r) => {
  const x = ri(r, 1, 9);
  const y = ri(r, 0, 9);
  const d = one(r, [3, 9] as const);
  const vals = [...Array(10).keys()].filter((a) => (x + a + y) % d === 0);
  const ans = vals.reduce((s, v) => s + v, 0);
  return num(r, `Üç basamaklı ${x}A${y} sayısı ${d} ile tam bölünebildiğine göre, A’nın alabileceği değerlerin toplamı kaçtır?`, ans, [ans + d, ans - d, vals.length, vals[0] ?? 0], `${d} ile bölünme kuralı: rakamlar toplamı ${d}’nın katı olmalı: ${x}+A+${y}. Olası A değerleri: ${vals.join(', ')}; toplamları ${ans}.`, 2, '', d);
};

const uslu: Gen = (r) => {
  let a = 0, b = 0, c = 0, e = 0;
  do {
    a = ri(r, 1, 12); b = ri(r, 1, 8); c = ri(r, 1, 6);
    e = a + 2 * b - 3 * c;
  } while (e < 1 || e > 25);
  return num(r, `2${sup(a)} · 4${sup(b)} ÷ 8${sup(c)} işleminin sonucu 2ˣ biçiminde yazılırsa x kaçtır?`, e, [a + b - c, a + 2 * b - 2 * c, a * b - c, a + b - 3 * c], `4 = 2², 8 = 2³ ⇒ 2${sup(a)} · 2${sup(2 * b)} ÷ 2${sup(3 * c)} = 2${sup(a)}⁺${sup(2 * b)}⁻${sup(3 * c)}; x = ${a} + ${2 * b} − ${3 * c} = ${e}.`, 2);
};

const koklu: Gen = (r) => {
  const k = ri(r, 2, 9);
  const m = one(r, [2, 3, 5, 6, 7] as const);
  if (r() < 0.5) {
    return str(r, `√${k * k * m} sayısının en sade biçimi aşağıdakilerden hangisidir?`, `${k}√${m}`, [`${m}√${k}`, `${k * m}√${m}`, `${k + m}`, `${k}√${k * m}`, `${k * k}√${m}`, `${k + 1}√${m}`, `${k}√${m + 1}`], `${k * k * m} = ${k * k}·${m} ⇒ √${k * k * m} = √${k * k}·√${m} = ${k}√${m}.`, 1);
  }
  const p = ri(r, 2, 9), q = ri(r, 2, 9);
  return str(r, `${p}√${m} + ${q}√${m} işleminin sonucu kaçtır?`, `${p + q}√${m}`, [`${p * q}√${m}`, `${p + q}√${2 * m}`, `√${(p + q) * m}`, `${p * q}√${2 * m}`, `${p + q + m}`, `${p + q + 1}√${m}`, `${p + q - 1}√${m}`], `Kareköklü terimlerde kök içi aynıysa katsayılar toplanır: (${p}+${q})√${m} = ${p + q}√${m}.`, 1);
};

const carpan: Gen = (r) => {
  const s = ri(r, 4, 15), d = ri(r, 2, 9);
  return num(r, `x + y = ${s} ve x − y = ${d} olduğuna göre x² − y² kaçtır?`, s * d, [s + d, s * s - d * d, s * s + d * d, (s - d)], `x² − y² = (x + y)(x − y) = ${s}·${d} = ${s * d}.`, 1);
};

const oranOranti: Gen = (r) => {
  const [m, n] = one(r, [[2, 3], [3, 5], [4, 7], [3, 4], [2, 5], [5, 6]] as const);
  const k = ri(r, 2, 19);
  const S = k * (m + n);
  return num(r, `a/b = ${m}/${n} ve a + b = ${S} olduğuna göre a kaçtır?`, k * m, [k * n, S - m, S / m, k * (n - m)], `a = ${m}k, b = ${n}k; a + b = ${m + n}k = ${S} ⇒ k = ${k}; a = ${m}·${k} = ${k * m}.`, 2);
};

const denklem: Gen = (r) => {
  const a = ri(r, 3, 8), c = ri(r, 1, a - 1), x = ri(r, 2, 12), b = ri(r, 1, 9);
  const d = (a - c) * x + b;
  return num(r, `${a}x + ${b} = ${c}x + ${d} denklemini sağlayan x değeri kaçtır?`, x, [x + 1, d - b, (d + b) / (a + c), -x], `${a}x − ${c}x = ${d} − ${b} ⇒ ${a - c}x = ${d - b} ⇒ x = ${x}.`, 1);
};

const yas: Gen = (r) => {
  for (let i = 0; i < 200; i++) {
    const s = ri(r, 4, 24), k = ri(r, 3, 8), t = ri(r, 2, 12);
    const f = (k * s + t) / (s + t);
    if (Number.isInteger(f) && f >= 2 && f < k) {
      return num(r, `Bir babanın yaşı oğlunun yaşının ${k} katıdır. ${t} yıl sonra babanın yaşı oğlunun yaşının ${f} katı olacağına göre babanın şimdiki yaşı kaçtır?`, k * s, [s, k * s + t, (k + 1) * s, s + t], `Oğul x, baba ${k}x. ${k}x + ${t} = ${f}(x + ${t}) ⇒ x = ${s}; baba ${k}·${s} = ${k * s}.`, 3);
    }
  }
  return num(r, 'Bir babanın yaşı oğlunun yaşının 5 katıdır. 4 yıl sonra baba oğlunun 3 katı olacağına göre babanın şimdiki yaşı kaçtır?', 20, [4, 24, 28, 12], 'Oğul x, baba 5x. 5x + 4 = 3(x + 4) ⇒ 2x = 8 ⇒ x = 4; baba 5·4 = 20.', 3);
};

const yuzde: Gen = (r) => {
  for (let i = 0; i < 200; i++) {
    const p = 100 * ri(r, 2, 12), a = one(r, [10, 20, 25, 50] as const), b = one(r, [10, 20, 25, 50] as const);
    const v = (p * (100 + a) * (100 - b)) / 10000;
    if (Number.isInteger(v) && v !== p) {
      return num(r, `Etiket fiyatı ${p} TL olan bir ürüne önce %${a} zam yapılıyor, sonra yeni fiyat üzerinden %${b} indirim uygulanıyor. Son fiyat kaç TL’dir?`, v, [p, (p * (100 + a - b)) / 100, p + (p * (a - b)) / 100 + 10, (p * (100 - b)) / 100], `Zamlı fiyat: ${p}·${100 + a}/100 = ${(p * (100 + a)) / 100}; indirimli: ${(p * (100 + a)) / 100}·${100 - b}/100 = ${v}.`, 2, ' TL', 10);
    }
  }
  return num(r, 'Etiket fiyatı 200 TL olan ürüne %10 zam yapılıp %20 indirim uygulanıyor. Son fiyat kaç TL’dir?', 176, [200, 180, 190, 160], '200·1,1 = 220; 220·0,8 = 176.', 2, ' TL', 10);
};

const karisim: Gen = (r) => {
  for (let i = 0; i < 300; i++) {
    const m1 = ri(r, 2, 9) * 10, m2 = ri(r, 2, 9) * 10, a = ri(r, 1, 6) * 5, b = ri(r, 1, 6) * 5;
    const v = (m1 * a + m2 * b) / (m1 + m2);
    if (Number.isInteger(v) && a !== b) {
      return num(r, `${m1} gram %${a}’lik tuzlu su ile ${m2} gram %${b}’lik tuzlu su karıştırılıyor. Oluşan karışımın yüzde derişimi kaçtır?`, v, [(a + b) / 2, a + b, Math.abs(a - b), v + 1], `Tuz: ${(m1 * a) / 100} + ${(m2 * b) / 100} = ${(m1 * a + m2 * b) / 100} g; toplam ${m1 + m2} g ⇒ %${v}.`, 2, '', 1);
    }
  }
  return num(r, '100 g %10’luk ile 100 g %20’lik çözelti karışırsa yüzde kaç olur?', 15, [30, 10, 20, 5], '(10+20)/2 = 15.', 2);
};

const hareket: Gen = (r) => {
  const v1 = ri(r, 4, 9) * 5, v2 = ri(r, 4, 9) * 5, t = ri(r, 2, 6);
  const d = (v1 + v2) * t;
  return num(r, `Aralarında ${d} km olan iki araç, hızları ${v1} km/sa ve ${v2} km/sa ile aynı anda birbirine doğru yola çıkıyor. Kaç saat sonra karşılaşırlar?`, t, [d / v1, d / v2, d / Math.abs(v1 - v2 || 1), (v1 + v2) / t], `Birbirine doğru giderken hızlar toplanır: t = ${d}/(${v1}+${v2}) = ${t} saat.`, 1);
};

const kumeler: Gen = (r) => {
  const c = ri(r, 3, 9), a = c + ri(r, 4, 12), b = c + ri(r, 3, 11);
  if (r() < 0.5) {
    return num(r, `s(A) = ${a}, s(B) = ${b} ve s(A ∩ B) = ${c} olduğuna göre s(A ∪ B) kaçtır?`, a + b - c, [a + b, a + b + c, a - c, a + b - 2 * c], `s(A∪B) = s(A) + s(B) − s(A∩B) = ${a} + ${b} − ${c} = ${a + b - c}.`, 1);
  }
  return num(r, `s(A) = ${a}, s(B) = ${b} ve s(A ∩ B) = ${c} olduğuna göre s(A − B) kaçtır?`, a - c, [b - c, a + b - c, a - b, a + c], `A − B = A’nın B ile ortak olmayan kısmı: ${a} − ${c} = ${a - c}.`, 1);
};

const ikinciDerece: Gen = (r) => {
  let x1 = 0, x2 = 0;
  do { x1 = ri(r, -7, 8); x2 = ri(r, -7, 8); } while (x1 === 0 || x2 === 0 || x1 === x2 || x1 + x2 === 0);
  const S = x1 + x2, P = x1 * x2;
  const eq = `${poly([1, -S, P])} = 0`;
  if (r() < 0.5) {
    return num(r, `${eq} denkleminin kökleri x₁ ve x₂ ise x₁² + x₂² kaçtır?`, S * S - 2 * P, [S * S, S * S + 2 * P, -S, P], `x₁ + x₂ = ${S}, x₁·x₂ = ${P}; x₁² + x₂² = (x₁+x₂)² − 2x₁x₂ = ${S * S} − ${2 * P} = ${S * S - 2 * P}.`, 2);
  }
  return num(r, `${eq} denkleminin kökler toplamı ile kökler çarpımının toplamı kaçtır?`, S + P, [S - P, P, S, -S + P], `Vieta: kökler toplamı = ${S}, kökler çarpımı = ${P}; toplamları ${S + P}.`, 1);
};

const WORDS = ['ANKARA', 'BALIK', 'ERZURUM', 'ISPARTA', 'MALATYA', 'KONYA', 'SAKARYA', 'ADANA', 'ELAZIĞ', 'KAYSERİ', 'MERSİN', 'ANTALYA'];
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const permutasyon: Gen = (r) => {
  const w = one(r, WORDS);
  const cnt: Record<string, number> = {};
  for (const ch of w) cnt[ch] = (cnt[ch] ?? 0) + 1;
  const ans = Object.values(cnt).reduce((v, k) => v / fact(k), fact(w.length));
  return num(r, `${w} sözcüğündeki harflerin tümü kullanılarak anlamlı ya da anlamsız kaç farklı sözcük yazılabilir?`, ans, [fact(w.length), ans * 2, ans / 2, fact(w.length - 1)], `${w.length}! / (tekrarlayan harflerin faktöriyelleri) = ${fact(w.length)} / ${Object.values(cnt).map((k) => fact(k)).reduce((x, y) => x * y, 1)} = ${ans}.`, 2, '', Math.max(1, Math.round(ans / 20)));
};

const olasilik: Gen = (r) => {
  const R = ri(r, 3, 7), B = ri(r, 2, 6), N = R + B;
  const ans = frac(R * (R - 1), N * (N - 1));
  return str(r, `Bir torbada ${R} kırmızı ve ${B} mavi bilye vardır. Torbadan geri koymadan art arda 2 bilye çekiliyor. İkisinin de kırmızı olma olasılığı kaçtır?`, ans, [frac(R * R, N * N), frac(R, N), frac(R * B, N * (N - 1)), frac(R * (R - 1), N * N), frac(R - 1, N)], `P = (${R}/${N})·(${R - 1}/${N - 1}) = ${R * (R - 1)}/${N * (N - 1)} = ${ans}.`, 2);
};

const veri: Gen = (r) => {
  const m = ri(r, 5, 60), delta = ri(r, 1, 9);
  const ans = 6 * (m + delta) - 5 * m;
  return num(r, `5 sayının aritmetik ortalaması ${m}’dir. Bu sayılara bir sayı daha eklendiğinde ortalama ${m + delta} oluyorsa eklenen sayı kaçtır?`, ans, [m + delta, 6 * delta, 5 * m + delta, ans - 5], `Toplam: 5·${m} = ${5 * m}; yeni toplam 6·${m + delta} = ${6 * (m + delta)}; eklenen = ${ans}.`, 2);
};

const mutlak: Gen = (r) => {
  const a = ri(r, -6, 6), b = ri(r, 2, 9);
  const eq = r() < 0.5;
  const ans = eq ? 2 * b + 1 : 2 * b - 1;
  const inner = `x ${a === 0 ? '' : `${sgn(-a)} ${Math.abs(a)}`}`.trim();
  return num(r, `|${inner}| ${eq ? '≤' : '<'} ${b} eşitsizliğini sağlayan kaç farklı x tam sayısı vardır?`, ans, [2 * b, ans + 2, b, ans - 2], `x ∈ ${eq ? '[' : '('}${a - b}, ${a + b}${eq ? ']' : ')'}; ${eq ? `${a - b}’den ${a + b}’ye kadar ${2 * b + 1}` : `${a - b + 1}’den ${a + b - 1}’e kadar ${2 * b - 1}`} tam sayı.`, 2);
};

const polinom: Gen = (r) => {
  const [a, b, c] = [ri(r, -5, 6), ri(r, -6, 7), ri(r, -9, 9)];
  const k = ri(r, 1, 4) * one(r, [1, -1] as const);
  const rem = k * k * k + a * k * k + b * k + c;
  return num(r, `P(x) = ${poly([1, a, b, c])} polinomunun x ${sgn(-k)} ${Math.abs(k)} ile bölümünden kalan kaçtır?`, rem, [-rem, c, P3(a, b, c, -k), rem + a], `Kalan teoremi: P(${k}) = ${k * k * k} ${term(a * k * k, '')} ${term(b * k, '')} ${term(c, '')} = ${rem}.`, 2);
};
const P3 = (a: number, b: number, c: number, k: number) => k * k * k + a * k * k + b * k + c;

const fonksiyon: Gen = (r) => {
  const [a, b, c, d, k] = [ri(r, 2, 5), ri(r, -5, 6), ri(r, 2, 4), ri(r, -4, 6), ri(r, 1, 4)];
  const g = c * k + d, ans = a * g + b;
  return num(r, `f(x) = ${a}x ${b === 0 ? '' : `${sgn(b)} ${Math.abs(b)}`} ve g(x) = ${c}x ${d === 0 ? '' : `${sgn(d)} ${Math.abs(d)}`} olduğuna göre (f∘g)(${k}) kaçtır?`, ans, [c * (a * k + b) + d, a * k + b + g, g, a * g], `g(${k}) = ${g}; f(${g}) = ${a}·${g} ${sgn(b)} ${Math.abs(b)} = ${ans}.`, 2);
};

// ───────── TYT Geometri ─────────
const acilar: Gen = (r) => {
  if (r() < 0.5) {
    const n = one(r, [5, 6, 8, 9, 10, 12] as const);
    const ans = ((n - 2) * 180) / n;
    return num(r, `Düzgün ${n} gen’in bir iç açısı kaç derecedir?`, ans, [360 / n, ((n - 2) * 180) / (n - 1), 180 - 360 / (n + 1), 180 * n - 360 - 100], `İç açılar toplamı (n−2)·180 = ${(n - 2) * 180}; düzgün çokgende eşit paylaşılır: ${(n - 2) * 180}/${n} = ${ans}°.`, 1, '°', 6);
  }
  const x = ri(r, 30, 80), y = ri(r, 25, 70);
  return num(r, `Bir ABC üçgeninde m(A) = ${x}° ve m(B) = ${y}° olduğuna göre C köşesindeki dış açının ölçüsü kaç derecedir?`, x + y, [180 - x - y, 180 - x, 180 - y, 360 - x - y], `Dış açı, kendisine komşu olmayan iki iç açının toplamına eşittir: ${x} + ${y} = ${x + y}°.`, 1, '°', 5);
};

const cokgenler: Gen = (r) => {
  const n = ri(r, 6, 40);
  if (r() < 0.4) return num(r, `Konveks bir ${n}-genin iç açıları toplamı kaç derecedir?`, (n - 2) * 180, [n * 180, (n - 1) * 180, 360, (n - 3) * 180], `(n−2)·180 = ${n - 2}·180 = ${(n - 2) * 180}°.`, 1, '°', 180);
  if (r() < 0.4) return num(r, `Konveks bir ${n}-genin bir köşesinden kaç köşegen çizilebilir?`, n - 3, [n - 2, n - 1, n, n * (n - 3) / 2], `Bir köşeden kendisi ve iki komşusu dışındaki ${n - 3} köşeye köşegen çizilir.`, 1);
  return num(r, `Konveks bir ${n}-genin kaç köşegeni vardır?`, (n * (n - 3)) / 2, [n * (n - 3), n * (n - 1) / 2, n - 3, (n * (n - 3)) / 2 + n], `n(n−3)/2 = ${n}·${n - 3}/2 = ${(n * (n - 3)) / 2}.`, 1);
};

const dikUcgen: Gen = (r) => {
  const [p, q, h] = one(r, TRIPLES);
  const k = ri(r, 1, 4);
  if (r() < 0.5) {
    return num(r, `Dik kenarları ${p * k} cm ve ${q * k} cm olan dik üçgenin hipotenüsü kaç cm’dir?`, h * k, [(p + q) * k, p * k * q * k / 2, p * k + 1, h * k + 1], `Pisagor: √(${p * k}² + ${q * k}²) = √${(h * k) ** 2} = ${h * k} cm.`, 1, ' cm');
  }
  return num(r, `Hipotenüsü ${h * k} cm olan bir dik üçgenin bir dik kenarı ${p * k} cm’dir. Diğer dik kenar kaç cm’dir?`, q * k, [h * k - p * k, h * k + p * k, (h * k * p * k) / 2, q * k + 1], `Pisagor: √(${h * k}² − ${p * k}²) = √${(q * k) ** 2} = ${q * k} cm.`, 2, ' cm');
};

const ucgenAlan: Gen = (r) => {
  const t = one(r, [[13, 14, 15], [5, 12, 13], [9, 10, 17], [6, 25, 29], [10, 13, 13], [7, 15, 20]] as const);
  const [a, b, c] = t;
  const s = (a + b + c) / 2;
  const A2 = s * (s - a) * (s - b) * (s - c);
  const A = Math.sqrt(A2);
  if (!Number.isInteger(A)) return ucgenAlan(r);
  return num(r, `Kenar uzunlukları ${a} cm, ${b} cm ve ${c} cm olan üçgenin alanı kaç cm²’dir?`, A, [(a * b) / 2, s, A + 6, A - 6], `Heron: s = ${s}; A = √(${s}·${s - a}·${s - b}·${s - c}) = √${A2} = ${A} cm².`, 3, ' cm²', 6);
};

const cember: Gen = (r) => {
  const th = one(r, [30, 45, 60, 90, 120, 150, 180, 240, 270] as const);
  const rad = 6 * ri(r, 1, 8);
  if (r() < 0.5) {
    const ans = `${frac(2 * rad * th, 360)}π`;
    return str(r, `Yarıçapı ${rad} cm olan çemberde ${th}° lik merkez açının gördüğü yayın uzunluğu kaç cm’dir?`, `${ans} cm`, [`${frac(rad * th, 360)}π cm`, `${frac(rad * rad * th, 360)}π cm`, `${frac(4 * rad * th, 360)}π cm`, `${frac(2 * rad * th, 180)}π cm`, `${2 * rad}π cm`, `${frac(6 * rad * th, 360)}π cm`, `${frac(2 * rad * th + 360, 360)}π cm`], `Yay = 2πr·θ/360 = 2π·${rad}·${th}/360 = ${ans} cm.`, 2);
  }
  const ans = `${frac(rad * rad * th, 360)}π`;
  return str(r, `Yarıçapı ${rad} cm olan dairede ${th}° lik merkez açılı daire diliminin alanı kaç cm²’dir?`, `${ans} cm²`, [`${frac(2 * rad * th, 360)}π cm²`, `${frac(rad * rad * th, 180)}π cm²`, `${rad * rad}π cm²`, `${frac(rad * rad * th, 720)}π cm²`, `${frac(rad * th, 360)}π cm²`, `${frac(3 * rad * rad * th, 360)}π cm²`, `${frac(rad * rad * th + 360, 360)}π cm²`], `Alan = πr²·θ/360 = π·${rad * rad}·${th}/360 = ${ans} cm².`, 2);
};

const dortgenler: Gen = (r) => {
  if (r() < 0.5) {
    const a = 2 * ri(r, 3, 9), c = 2 * ri(r, 2, 6), h = ri(r, 3, 12);
    return num(r, `Paralel kenarları ${a} cm ve ${c} cm, yüksekliği ${h} cm olan yamuğun alanı kaç cm²’dir?`, ((a + c) * h) / 2, [a * h, (a + c) * h, ((a + c) * h) / 4, (a * c * h) / 2], `Yamuk alanı = (a + c)·h/2 = ${a + c}·${h}/2 = ${((a + c) * h) / 2} cm².`, 1, ' cm²');
  }
  const [p, q, h] = one(r, [[6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]] as const);
  return num(r, `Kenar uzunlukları ${p} cm ve ${q} cm olan dikdörtgenin köşegeni kaç cm’dir?`, h, [p + q, (p + q) / 2, p * q / 2, h + 1], `Köşegen = √(${p}² + ${q}²) = √${h * h} = ${h} cm.`, 1, ' cm');
};

const katiCisim: Gen = (r) => {
  const k = r();
  if (k < 0.34) {
    const rr = ri(r, 2, 12), h = ri(r, 2, 15);
    return str(r, `Taban yarıçapı ${rr} cm, yüksekliği ${h} cm olan dik dairesel silindirin hacmi kaç cm³’tür?`, `${rr * rr * h}π cm³`, [`${2 * rr * h}π cm³`, `${(rr * rr * h) / 3}π cm³`.replace('.', ','), `${rr * h}π cm³`, `${2 * rr * (rr + h)}π cm³`, `${rr * rr * h * 2}π cm³`], `V = πr²h = π·${rr * rr}·${h} = ${rr * rr * h}π cm³.`, 1);
  }
  if (k < 0.67) {
    const rr = 3 * ri(r, 1, 2);
    const ans = (4 * rr ** 3) / 3;
    return str(r, `Yarıçapı ${rr} cm olan kürenin hacmi kaç cm³’tür?`, `${ans}π cm³`, [`${4 * rr * rr}π cm³`, `${rr ** 3}π cm³`, `${(2 * rr ** 3) / 3}π cm³`, `${ans * 2}π cm³`, `${ans + rr}π cm³`], `V = (4/3)πr³ = (4/3)π·${rr ** 3} = ${ans}π cm³.`, 2);
  }
  const a = ri(r, 2, 25);
  return num(r, `Bir ayrıtı ${a} cm olan küpün tüm yüzeylerinin alanı kaç cm²’dir?`, 6 * a * a, [a ** 3, 4 * a * a, 12 * a, 3 * a * a], `Küpün 6 yüzü vardır, her biri ${a}² = ${a * a}: ${6 * a * a} cm².`, 1, ' cm²', a);
};

const analitik: Gen = (r) => {
  const x = ri(r, -4, 4), y = ri(r, -4, 4), k = ri(r, 1, 3);
  if (r() < 0.5) {
    const [p, q, h] = one(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13]] as const);
    return num(r, `Analitik düzlemde A(${x}, ${y}) ve B(${x + p * k}, ${y + q * k}) noktaları arasındaki uzaklık kaç birimdir?`, h * k, [(p + q) * k, p * k, q * k, h * k + 1], `|AB| = √((${p * k})² + (${q * k})²) = √${(h * k) ** 2} = ${h * k}.`, 2, ' birim');
  }
  const m = ri(r, 2, 5) * one(r, [1, -1] as const), dx = ri(r, 1, 4);
  return num(r, `A(${x}, ${y}) ve B(${x + dx}, ${y + m * dx}) noktalarından geçen doğrunun eğimi kaçtır?`, m, [-m, 1 / m, m + 1, m * dx], `Eğim = (y₂ − y₁)/(x₂ − x₁) = ${m * dx}/${dx} = ${m}.`, 1);
};

// ───────── TYT Fizik (g = 10 m/s²) ─────────
const hareketKuvvet: Gen = (r) => {
  const k = r();
  if (k < 0.34) {
    const m = ri(r, 2, 12), a = ri(r, 2, 9);
    return num(r, `Sürtünmesiz yatay düzlemde durmakta olan ${m} kg’lık cisme yatay ${m * a} N kuvvet uygulanıyor. Cismin ivmesi kaç m/s²’dir?`, a, [m * a * m, m + a, (m * a) / (m + a), a + 2], `F = m·a ⇒ a = ${m * a}/${m} = ${a} m/s².`, 1, ' m/s²');
  }
  if (k < 0.67) {
    const v0 = ri(r, 0, 10), a = ri(r, 2, 6), t = ri(r, 2, 8);
    return num(r, `İlk hızı ${v0} m/s olan cisim ${a} m/s² sabit ivmeyle hızlanıyor. ${t} saniye sonunda hızı kaç m/s olur?`, v0 + a * t, [a * t, v0 + t, v0 * t + a, v0 + (a * t * t) / 2], `v = v₀ + a·t = ${v0} + ${a}·${t} = ${v0 + a * t} m/s.`, 1, ' m/s');
  }
  const a = ri(r, 2, 6), t = ri(r, 2, 8);
  return num(r, `Durgun halden ${a} m/s² ivmeyle harekete geçen cisim ${t} saniyede kaç metre yol alır?`, (a * t * t) / 2, [a * t, a * t * t, (a * t) / 2, a * t * t * 2], `x = ½·a·t² = ½·${a}·${t}² = ${(a * t * t) / 2} m.`, 2, ' m', 2);
};

const enerji: Gen = (r) => {
  if (r() < 0.5) {
    const m = 2 * ri(r, 1, 8), v = ri(r, 2, 12);
    return num(r, `${m} kg kütleli cisim ${v} m/s hızla hareket ediyor. Kinetik enerjisi kaç joule’dür?`, (m * v * v) / 2, [m * v * v, m * v, (m * v) / 2, (m * v * v) / 4], `Ek = ½·m·v² = ½·${m}·${v}² = ${(m * v * v) / 2} J.`, 1, ' J', m);
  }
  const m = ri(r, 2, 10), h = ri(r, 2, 15);
  return num(r, `${m} kg kütleli cisim yerden ${h} m yüksektedir (g = 10 m/s²). Yere göre potansiyel enerjisi kaç joule’dür?`, m * 10 * h, [m * h, m * 10 * h * 2, (m * 10 * h) / 2, 10 * h], `Ep = m·g·h = ${m}·10·${h} = ${m * 10 * h} J.`, 1, ' J', 10);
};

const basinc: Gen = (r) => {
  if (r() < 0.5) {
    const A = ri(r, 2, 10), P = ri(r, 2, 9) * 10;
    return num(r, `Yüzey alanı ${A} m² olan bir zemine dik ${A * P} N’luk kuvvet uygulanıyor. Zemine yapılan basınç kaç Pa’dır?`, P, [A * A * P, A + P, P / 2, P * 2], `P = F/A = ${A * P}/${A} = ${P} Pa.`, 1, ' Pa', 10);
  }
  const h = ri(r, 2, 15);
  return num(r, `Yoğunluğu 1000 kg/m³ olan suyun içinde yüzeyin ${h} m altındaki noktada sıvı basıncı kaç Pa’dır? (g = 10 m/s²)`, 1000 * 10 * h, [1000 * h, 10 * h, 1000 * 10 * h * 2, 100 * 10 * h], `P = d·g·h = 1000·10·${h} = ${10000 * h} Pa.`, 2, ' Pa', 1000);
};

const elektrikAkimi: Gen = (r) => {
  const k = r();
  if (k < 0.34) {
    const [a, b, c] = [ri(r, 2, 9), ri(r, 2, 9), ri(r, 2, 9)];
    return num(r, `${a} Ω, ${b} Ω ve ${c} Ω’luk dirençler seri bağlanmıştır. Eşdeğer direnç kaç Ω’dur?`, a + b + c, [(a * b * c) / (a + b + c), a * b + c, Math.max(a, b, c), a + b + c + 1], `Seri bağlamada dirençler toplanır: ${a}+${b}+${c} = ${a + b + c} Ω.`, 1, ' Ω');
  }
  if (k < 0.67) {
    const [a, b, e] = one(r, PAIRS_PARALLEL);
    return num(r, `${a} Ω ve ${b} Ω’luk iki direnç paralel bağlanmıştır. Eşdeğer direnç kaç Ω’dur?`, e, [a + b, (a + b) / 2, a * b, Math.min(a, b)], `Paralelde Reş = R₁R₂/(R₁+R₂) = ${a}·${b}/${a + b} = ${e} Ω.`, 2, ' Ω');
  }
  const R = ri(r, 2, 12), I = ri(r, 2, 8);
  return num(r, `${R} Ω’luk dirençten ${I} A akım geçiyorsa direncin uçları arasındaki potansiyel fark kaç volttur?`, R * I, [R / I, R + I, R * I * I, (R * I) / 2], `V = I·R = ${I}·${R} = ${R * I} V.`, 1, ' V');
};

const isi: Gen = (r) => {
  const m = ri(r, 2, 20) * 10, dT = ri(r, 2, 9) * 5;
  return num(r, `${m} g suyun sıcaklığını ${dT} °C artırmak için gereken ısı kaç kaloridir? (c_su = 1 cal/g·°C)`, m * dT, [m + dT, (m * dT) / 2, m * dT * 4, m / dT], `Q = m·c·ΔT = ${m}·1·${dT} = ${m * dT} cal.`, 1, ' cal', m);
};

const dalga: Gen = (r) => {
  const f = ri(r, 2, 10) * 5, lam = ri(r, 2, 12);
  if (r() < 0.5) {
    return num(r, `Frekansı ${f} Hz, dalga boyu ${lam} m olan dalganın yayılma hızı kaç m/s’dir?`, f * lam, [f + lam, f / lam, lam / f, f * lam * 2], `v = λ·f = ${lam}·${f} = ${f * lam} m/s.`, 1, ' m/s', 5);
  }
  return num(r, `Yayılma hızı ${f * lam} m/s ve frekansı ${f} Hz olan dalganın dalga boyu kaç metredir?`, lam, [f / lam, f * lam * f, lam * 2, (f * lam) / (lam + f)], `λ = v/f = ${f * lam}/${f} = ${lam} m.`, 1, ' m');
};

const optik: Gen = (r) => {
  const f = one(r, [4, 6, 8, 10, 12] as const), p = f * one(r, [2, 3] as const);
  const q = (p * f) / (p - f);
  if (!Number.isInteger(q)) return optik(r);
  return num(r, `Odak uzaklığı ${f} cm olan çukur aynanın önünde, aynadan ${p} cm uzağa bir cisim konuyor. Görüntü aynadan kaç cm uzakta oluşur?`, q, [p + f, p - f, f, p * f], `1/f = 1/p + 1/q ⇒ 1/q = 1/${f} − 1/${p} ⇒ q = ${q} cm.`, 3, ' cm');
};

const elektrostatik: Gen = (r) => {
  const F = ri(r, 1, 9) * 36, n = one(r, [2, 3] as const);
  return num(r, `İki noktasal yük arasındaki uzaklık ${n} katına çıkarılırsa aralarındaki elektriksel kuvvet ilk değeri ${F} N iken kaç N olur?`, F / (n * n), [F / n, F * n, F * n * n, F / (n * n * n)], `Coulomb: F ∝ 1/r²; uzaklık ${n} katına çıkarsa kuvvet ${n * n} kat azalır: ${F}/${n * n} = ${F / (n * n)} N.`, 2, ' N', 1);
};

// ───────── TYT Kimya ─────────
const MOLEKUL: [string, number][] = [['H₂O', 18], ['CO₂', 44], ['NH₃', 17], ['CH₄', 16], ['NaOH', 40], ['H₂SO₄', 98], ['CaCO₃', 100], ['C₆H₁₂O₆', 180], ['HNO₃', 63], ['Ca(OH)₂', 74]];
const mol: Gen = (r) => {
  const [f, M] = one(r, MOLEKUL);
  const n = one(r, [0.5, 1, 2, 3, 4, 5] as const);
  if (r() < 0.5) {
    return num(r, `${fmt(n * M)} gram ${f} kaç moldür? (Mol kütlesi: ${M} g/mol)`, n, [n * M * M, M / (n * M) || 1, n * 2, n + 1], `n = m/M = ${fmt(n * M)}/${M} = ${fmt(n)} mol.`, 1, ' mol', 1);
  }
  return num(r, `${fmt(n)} mol ${f} kaç gramdır? (Mol kütlesi: ${M} g/mol)`, n * M, [M / n, n + M, n * M * 2, M], `m = n·M = ${fmt(n)}·${M} = ${fmt(n * M)} g.`, 1, ' g', Math.max(1, Math.round(M / 4)));
};

const kanunlar: Gen = (r) => {
  const a = ri(r, 1, 4), b = ri(r, 1, 6);
  const used = Math.min(a, b);
  const prod = 11 * used;
  const left = 3 * (a - used) + 8 * (b - used);
  return num(r, `Karbondioksit (CO₂) bileşiğinde C : O kütle oranı 3 : 8’dir. ${3 * a} g C ile ${8 * b} g O₂ tam verimle tepkimeye girerse en çok kaç gram CO₂ oluşur?`, prod, [3 * a + 8 * b, 11 * Math.max(a, b), 11, prod + 11], `3 g C, 8 g O ile 11 g CO₂ verir. C ${a} birim, O ${b} birim; sınırlayıcı bileşen ${used} birim ⇒ ${used}·11 = ${prod} g. (Artan madde: ${left} g)`, 3, ' g', 1);
};

const karisimlarKimya: Gen = (r) => {
  const k = r();
  if (k < 0.34) {
    const [f, M] = one(r, MOLEKUL.slice(0, 5));
    const n = ri(r, 1, 4), V = one(r, [0.5, 1, 2] as const);
    return num(r, `${fmt(n * M)} gram ${f} ile hazırlanan ${fmt(V)} litre çözeltinin molar derişimi kaç mol/L’dir? (Mol kütlesi: ${M} g/mol)`, n / V, [(n * M) / V, n * V, V / n, n], `n = ${fmt(n * M)}/${M} = ${n} mol; M = n/V = ${n}/${fmt(V)} = ${fmt(n / V)} mol/L.`, 2, ' M', 0.5);
  }
  if (k < 0.67) {
    const M1 = ri(r, 2, 6), V1 = ri(r, 1, 5) * 100, f = one(r, [2, 4] as const);
    return num(r, `${M1} M ${V1} mL çözeltiye su eklenerek hacim ${V1 * f} mL’ye tamamlanıyor. Yeni derişim kaç M’dir?`, M1 / f, [M1 * f, M1 - f, M1 + f, M1 / (f * f)], `M₁V₁ = M₂V₂ ⇒ M₂ = ${M1}·${V1}/${V1 * f} = ${fmt(M1 / f)} M.`, 2, ' M', 0.5);
  }
  const m = ri(r, 1, 6) * 10, w = ri(r, 2, 9) * 10 + 40;
  const ans = (m * 100) / (m + w);
  if (!Number.isInteger(ans)) return karisimlarKimya(r);
  return num(r, `${m} g tuz ${w} g suda çözülüyor. Çözeltinin kütlece yüzde derişimi kaçtır?`, ans, [(m * 100) / w, m, (w * 100) / (m + w), ans + 5], `Yüzde = çözünen/çözelti·100 = ${m}/${m + w}·100 = ${ans}.`, 2, '', 1);
};

const asitBaz: Gen = (r) => {
  const k = ri(r, 1, 6);
  const t = r();
  if (t < 0.34) return num(r, `[H⁺] = 10${sup(-k)} M olan çözeltinin pH’ı kaçtır?`, k, [14 - k, -k, k + 1, 10 * k], `pH = −log[H⁺] = −log10${sup(-k)} = ${k}.`, 1);
  if (t < 0.67) return num(r, `[OH⁻] = 10${sup(-k)} M olan çözeltinin 25 °C’de pH’ı kaçtır?`, 14 - k, [k, 14 + k, -k, 7 - k], `pOH = ${k}; pH + pOH = 14 ⇒ pH = ${14 - k}.`, 2);
  return num(r, `10${sup(-k)} M HCl çözeltisinin pH’ı kaçtır? (HCl kuvvetli asittir, tam iyonlaşır)`, k, [14 - k, 2 * k, k + 1, 7], `HCl → H⁺ + Cl⁻; [H⁺] = 10${sup(-k)} M ⇒ pH = ${k}.`, 1);
};

const atom: Gen = (r) => {
  const Z = ri(r, 7, 20), n = ri(r, 0, 3) + 6, A = Z + n;
  const q = one(r, [-2, -1, 1, 2] as const);
  const sym = q > 0 ? `X${q === 1 ? '⁺' : '²⁺'}` : `X${q === -1 ? '⁻' : '²⁻'}`;
  if (r() < 0.5) return num(r, `Atom numarası ${Z}, kütle numarası ${A} olan ${sym} iyonundaki nötron sayısı kaçtır?`, n, [Z, A, A + Z, n + Math.abs(q)], `Nötron = A − Z = ${A} − ${Z} = ${n} (yükten etkilenmez).`, 1);
  return num(r, `Atom numarası ${Z}, kütle numarası ${A} olan ${sym} iyonundaki elektron sayısı kaçtır?`, Z - q, [Z, Z + q, A - Z, Z - q + 2], `Nötr atomda e⁻ = Z = ${Z}; yük ${q > 0 ? '+' : ''}${q} olduğundan e⁻ = ${Z} − (${q}) = ${Z - q}.`, 1);
};

// ───────── AYT Matematik ─────────
const limit: Gen = (r) => {
  const a = ri(r, 1, 6), k = r();
  if (k < 0.5) return num(r, `lim(x→${a}) (x² − ${a * a}) / (x − ${a}) değeri kaçtır?`, 2 * a, [a, a * a, 0, 2 * a + 1], `x² − ${a * a} = (x − ${a})(x + ${a}); sadeleşince lim (x + ${a}) = ${2 * a}.`, 2);
  return num(r, `lim(x→${a}) (x³ − ${a ** 3}) / (x − ${a}) değeri kaçtır?`, 3 * a * a, [a ** 3, 3 * a, a * a, 2 * a * a], `x³ − ${a ** 3} = (x − ${a})(x² + ${a}x + ${a * a}); x = ${a} için ${3 * a * a}.`, 3);
};

const turev: Gen = (r) => {
  const a = ri(r, 2, 6), n = ri(r, 2, 4), b = ri(r, -6, 7), k = ri(r, 1, 3);
  const ans = a * n * k ** (n - 1) + b;
  return num(r, `f(x) = ${a}x${sup(n)} ${b === 0 ? '' : `${sgn(b)} ${Math.abs(b)}x`} fonksiyonu için f′(${k}) kaçtır?`, ans, [a * k ** n + b * k, a * n * k ** n + b, a * n + b, a * k ** (n - 1) + b], `f′(x) = ${a * n}x${n - 1 > 1 ? sup(n - 1) : ''} ${sgn(b)} ${Math.abs(b)}; x = ${k} için ${ans}.`, 2);
};

const integral: Gen = (r) => {
  if (r() < 0.5) {
    const b = ri(r, 2, 6), c = 2 * ri(r, 1, 4), d = ri(r, 1, 5);
    const ans = (c * b * b) / 2 + d * b;
    return num(r, `∫₀${sup(b)} (${c}x + ${d}) dx integralinin değeri kaçtır?`, ans, [c * b + d, ans + b, (c * b * b) / 2, c * b * b + d * b], `∫(${c}x + ${d})dx = ${c / 2}x² + ${d}x; ${b} için ${(c * b * b) / 2} + ${d * b} = ${ans}.`, 2);
  }
  const b = 3 * ri(r, 1, 2);
  return num(r, `∫₀${sup(b)} x² dx integralinin değeri kaçtır?`, b ** 3 / 3, [b * b, b ** 3, b ** 3 / 2, (b * b) / 2], `∫x²dx = x³/3; 0’dan ${b}’ye ${b ** 3}/3 = ${b ** 3 / 3}.`, 2);
};

const logaritma: Gen = (r) => {
  const base = one(r, [2, 3, 4, 5, 6, 7, 10] as const), e1 = ri(r, 2, 6), e2 = ri(r, 1, e1 - 1);
  if (r() < 0.5) return num(r, `log${sub(base)} ${base ** e1} + log${sub(base)} ${base ** e2} işleminin sonucu kaçtır?`, e1 + e2, [e1 * e2, e1 - e2, base ** (e1 + e2), e1 + e2 + 1], `log${sub(base)} ${base ** e1} = ${e1}, log${sub(base)} ${base ** e2} = ${e2}; toplam ${e1 + e2}.`, 1);
  return num(r, `log${sub(base)} ${base ** e1} − log${sub(base)} ${base ** e2} işleminin sonucu kaçtır?`, e1 - e2, [e1 + e2, e1 * e2, base ** (e1 - e2), e1 - e2 + 1], `${e1} − ${e2} = ${e1 - e2}.`, 1);
};

const diziler: Gen = (r) => {
  const a1 = ri(r, -5, 10), d = ri(r, 2, 7), n = ri(r, 6, 15);
  const k = r();
  if (k < 0.5) return num(r, `İlk terimi ${a1}, ortak farkı ${d} olan aritmetik dizinin ${n}. terimi kaçtır?`, a1 + (n - 1) * d, [a1 + n * d, a1 * d * n, a1 + (n + 1) * d, (a1 + (n - 1) * d) / 2], `aₙ = a₁ + (n−1)d = ${a1} + ${n - 1}·${d} = ${a1 + (n - 1) * d}.`, 1);
  return num(r, `İlk terimi ${a1}, ortak farkı ${d} olan aritmetik dizinin ilk ${n} teriminin toplamı kaçtır?`, (n * (2 * a1 + (n - 1) * d)) / 2, [n * (a1 + (n - 1) * d), (n * (2 * a1 + n * d)) / 2, n * a1 + d, (n * (2 * a1 + (n - 1) * d)) / 4], `Sₙ = n(2a₁ + (n−1)d)/2 = ${n}·${2 * a1 + (n - 1) * d}/2 = ${(n * (2 * a1 + (n - 1) * d)) / 2}.`, 2);
};

const SIN: Record<number, number> = { 0: 0, 30: 0.5, 90: 1, 150: 0.5, 180: 0, 210: -0.5, 270: -1 };
const COS: Record<number, number> = { 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1, 300: 0.5 };
const trigonometri: Gen = (r) => {
  const s = one(r, Object.keys(SIN).map(Number)), c = one(r, Object.keys(COS).map(Number));
  const A = ri(r, 1, 4), B = ri(r, 1, 4);
  const ans = A * SIN[s] + B * COS[c];
  return num(r, `${A}·sin${s}° + ${B}·cos${c}° işleminin sonucu kaçtır?`, ans, [A * SIN[s] - B * COS[c], A + B, ans + 1, ans - 1], `sin${s}° = ${fmt(SIN[s])}, cos${c}° = ${fmt(COS[c])}; ${A}·(${fmt(SIN[s])}) + ${B}·(${fmt(COS[c])}) = ${fmt(ans)}.`, 2, '', 0.5);
};

const parabol: Gen = (r) => {
  const b = 2 * ri(r, -6, 6), c = ri(r, -9, 12);
  if (b === 0) return parabol(r);
  const xv = -b / 2, yv = c - (b * b) / 4;
  if (r() < 0.5) return num(r, `y = ${poly([1, b, c])} parabolünün tepe noktasının apsisi kaçtır?`, xv, [b / 2, -b, b, xv + 1], `Tepe apsisi x = −b/(2a) = ${-b}/2 = ${xv}.`, 1);
  return num(r, `y = ${poly([1, b, c])} fonksiyonunun alabileceği en küçük değer kaçtır?`, yv, [c, xv, -yv, c + (b * b) / 4], `Tepe: x = ${xv}; y = (${xv})² ${sgn(b)} ${Math.abs(b)}·(${xv}) ${sgn(c)} ${Math.abs(c)} = ${yv}.`, 2);
};

const kombinasyon: Gen = (r) => {
  const n = ri(r, 6, 11), k = ri(r, 2, 4);
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  const p = Array.from({ length: k }, (_, i) => n - i).reduce((x, y) => x * y, 1);
  return num(r, `${n} kişilik bir gruptan ${k} kişilik bir komite kaç farklı biçimde seçilebilir?`, c, [p, c * 2, n * k, Math.round(c / 2)], `C(${n},${k}) = ${n}!/(${k}!·${n - k}!) = ${c}.`, 2, '', Math.max(1, Math.round(c / 10)));
};

// ───────── AYT Fizik ─────────
const vektor: Gen = (r) => {
  const [p, q, h] = one(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10]] as const);
  const k = ri(r, 1, 4);
  if (r() < 0.5) return num(r, `Birbirine dik ${p * k} N ve ${q * k} N’luk iki kuvvetin bileşkesi kaç N’dir?`, h * k, [(p + q) * k, Math.abs(q - p) * k, p * k * q * k, h * k + 1], `R = √(${p * k}² + ${q * k}²) = ${h * k} N.`, 2, ' N');
  return num(r, `Aynı doğrultuda zıt yönlü ${p * k + q * k} N ve ${q * k} N’luk kuvvetlerin bileşkesi kaç N’dir?`, p * k, [(p + 2 * q) * k, (p + q) * k, q * k, p * k + 1], `Zıt yönlü kuvvetler çıkarılır: ${p * k + q * k} − ${q * k} = ${p * k} N.`, 1, ' N');
};

const newton: Gen = (r) => {
  const m1 = ri(r, 1, 5), m2 = ri(r, 1, 5), a = ri(r, 1, 4);
  const F = (m1 + m2) * a;
  return num(r, `Sürtünmesiz yatay düzlemde ${m1} kg ve ${m2} kg’lık iki cisim ipte bağlıdır; ${m1} kg’lık cisme ${F} N’luk kuvvet uygulanıp sistem çekiliyor. İpteki gerilme kaç N’dir?`, m2 * a, [F, m1 * a, F - m2 * a + m1, m1 * m2], `Sistemin ivmesi a = F/(m₁+m₂) = ${F}/${m1 + m2} = ${a} m/s²; ipi taşıyan m₂ için T = m₂·a = ${m2 * a} N.`, 3, ' N');
};

const sabitIvme: Gen = (r) => {
  const a = ri(r, 2, 5), t = ri(r, 2, 6), v0 = ri(r, 2, 10);
  const x = v0 * t + (a * t * t) / 2;
  return num(r, `İlk hızı ${v0} m/s olan cisim ${a} m/s² sabit ivmeyle ${t} saniye hızlanıyor. Bu sürede aldığı yol kaç metredir?`, x, [v0 * t, (a * t * t) / 2, v0 * t + a * t * t, (v0 + a * t) * t], `x = v₀t + ½at² = ${v0}·${t} + ½·${a}·${t}² = ${x} m.`, 2, ' m');
};

const momentum: Gen = (r) => {
  for (let i = 0; i < 200; i++) {
    const m1 = ri(r, 1, 6), m2 = ri(r, 1, 6), v1 = ri(r, 2, 12), v2 = ri(r, 1, 4);
    const v = (m1 * v1 + m2 * v2) / (m1 + m2);
    if (Number.isInteger(v)) return num(r, `${m1} kg’lık cisim ${v1} m/s hızla, aynı yönde ${v2} m/s hızla giden ${m2} kg’lık cisme çarpıp yapışıyor. Çarpışmadan sonra ortak hız kaç m/s olur?`, v, [(v1 + v2) / 2, v1 - v2, m1 * v1 + m2 * v2, v + 1], `Momentum korunur: (${m1}·${v1} + ${m2}·${v2}) / (${m1}+${m2}) = ${v} m/s.`, 3, ' m/s');
  }
  return num(r, '2 kg’lık cisim 6 m/s hızla, durgun 2 kg’lık cisme çarpıp yapışıyor. Ortak hız kaç m/s olur?', 3, [6, 12, 1, 4], 'Momentum korunur: 2·6 = 4·v ⇒ v = 3 m/s.', 3, ' m/s');
};

const kondansator: Gen = (r) => {
  if (r() < 0.5) {
    const [a, b, e] = one(r, PAIRS_PARALLEL);
    return num(r, `${a} μF ve ${b} μF’lık iki kondansatör seri bağlanıyor. Eşdeğer sığa kaç μF’tır?`, e, [a + b, (a + b) / 2, a * b, Math.min(a, b) + 1], `Seri: Ceş = C₁C₂/(C₁+C₂) = ${a}·${b}/${a + b} = ${e} μF.`, 2, ' μF');
  }
  const C = ri(r, 2, 9), V = ri(r, 2, 10);
  return num(r, `Sığası ${C} μF olan kondansatör ${V} V gerilimle yükleniyor. Depoladığı yük kaç μC’tur?`, C * V, [C / V, C + V, (C * V) / 2, C * V * V], `Q = C·V = ${C}·${V} = ${C * V} μC.`, 1, ' μC');
};

const elektrikAlan: Gen = (r) => {
  const F = ri(r, 1, 6) * 4, kk = one(r, [2, 3] as const);
  return num(r, `İki yükten her biri ${kk} katına çıkarılır, aralarındaki uzaklık değişmezse ilk değeri ${F} N olan elektriksel kuvvet kaç N olur?`, F * kk * kk, [F * kk, F / (kk * kk), F * 2 * kk, F + kk], `F = k·q₁q₂/r²; her iki yük ${kk} katına çıkınca F ${kk * kk} katına çıkar: ${F}·${kk * kk} = ${F * kk * kk} N.`, 2, ' N', 4);
};

const cembersel: Gen = (r) => {
  const v = ri(r, 2, 10), R = ri(r, 1, 5) * 2;
  if (r() < 0.5) return num(r, `${R} m yarıçaplı çembersel yörüngede ${v} m/s sabit çizgisel hızla dönen cismin merkezcil ivmesi kaç m/s²’dir?`, (v * v) / R, [v / R, v * v * R, v * R, (v * v) / (2 * R)], `a = v²/r = ${v * v}/${R} = ${fmt((v * v) / R)} m/s².`, 2, ' m/s²', 1);
  const m = ri(r, 1, 6);
  return num(r, `${m} kg kütleli cisim ${R} m yarıçaplı çemberde ${v} m/s hızla dönüyor. Cisme etki eden merkezcil kuvvet kaç N’dir?`, (m * v * v) / R, [m * v / R, m * v * v * R, (m * v * v) / (2 * R), m * v], `F = m·v²/r = ${m}·${v * v}/${R} = ${fmt((m * v * v) / R)} N.`, 2, ' N', 1);
};

const modernFizik: Gen = (r) => {
  const [n1, n2] = one(r, [[1, 2], [2, 4], [1, 4]] as const);
  const dE = 13.6 * (1 / (n1 * n1) - 1 / (n2 * n2));
  return num(r, `Hidrojen atomunda elektron n = ${n2} düzeyinden n = ${n1} düzeyine geçerken yayınlanan fotonun enerjisi kaç eV’dir? (Eₙ = −13,6/n² eV)`, dE, [13.6 * (n2 - n1), 13.6 / n1, 13.6 * (1 / n1 + 1 / n2), 13.6 * (1 / n1 - 1 / n2)], `ΔE = 13,6·(1/${n1}² − 1/${n2}²) = ${fmt(dE)} eV.`, 3, ' eV', 0.85);
};

const induksiyon: Gen = (r) => {
  const B = ri(r, 1, 5), L = ri(r, 1, 5) * 0.2, v = ri(r, 2, 10);
  const e = B * L * v;
  return num(r, `${fmt(B)} T’lık düzgün manyetik alana dik, ${fmt(L)} m uzunluğundaki iletken çubuk alana dik doğrultuda ${v} m/s hızla çekiliyor. Çubuğun uçlarında oluşan emk kaç volttur?`, e, [B * v, L * v, B * L, B * L * v * 2], `ε = B·ℓ·v = ${B}·${fmt(L)}·${v} = ${fmt(e)} V.`, 2, ' V', 0.2);
};

const alternatifAkim: Gen = (r) => {
  const N1 = ri(r, 1, 5) * 100, N2 = ri(r, 1, 5) * 200, V1 = ri(r, 1, 5) * 10;
  const V2 = (V1 * N2) / N1;
  return num(r, `Primer sarım sayısı ${N1}, sekonder sarım sayısı ${N2} olan ideal bir transformatörün primerine ${V1} V uygulanıyor. Sekonder gerilimi kaç volttur?`, V2, [(V1 * N1) / N2, V1 + N2 - N1, V1 * N2 / 100, V1], `V₂/V₁ = N₂/N₁ ⇒ V₂ = ${V1}·${N2}/${N1} = ${fmt(V2)} V.`, 2, ' V', 5);
};

const torkDenge: Gen = (r) => {
  const F1 = ri(r, 2, 9) * 10, d1 = ri(r, 1, 4) * 2, d2 = ri(r, 1, 4) * 2;
  const F2 = (F1 * d1) / d2;
  return num(r, `Eşit kollu olmayan bir kaldıraçta dayanak noktasının bir yanında ${d1} m uzaklığa ${F1} N’luk yük asılıdır. Dengeyi sağlamak için öbür yanda dayanaktan ${d2} m uzağa kaç N’luk kuvvet uygulanmalıdır?`, F2, [F1, F1 * d2 / (d1 + d2), F1 * d1 * d2, F1 + d1 + d2], `Tork dengesi: F₁·d₁ = F₂·d₂ ⇒ F₂ = ${F1}·${d1}/${d2} = ${fmt(F2)} N.`, 2, ' N', 5);
};

// ───────── AYT Kimya ─────────
const gaz: Gen = (r) => {
  for (let i = 0; i < 200; i++) {
    const P1 = ri(r, 1, 6), V1 = ri(r, 2, 10) * 2, T1 = one(r, [200, 300, 400] as const), P2 = ri(r, 1, 6), T2 = one(r, [200, 300, 400, 600] as const);
    const V2 = (P1 * V1 * T2) / (P2 * T1);
    if (Number.isInteger(V2) && V2 !== V1) {
      return num(r, `${P1} atm basınç, ${T1} K sıcaklık ve ${V1} L hacimdeki ideal gaz, ${P2} atm basınç ve ${T2} K sıcaklığa getirilirse hacmi kaç L olur?`, V2, [(P1 * V1) / P2, (V1 * T2) / T1, (P2 * V1 * T2) / (P1 * T1), V2 + V1], `P₁V₁/T₁ = P₂V₂/T₂ ⇒ V₂ = ${P1}·${V1}·${T2}/(${P2}·${T1}) = ${V2} L.`, 3, ' L', 2);
    }
  }
  return num(r, '1 atm, 300 K, 10 L gaz 2 atm 300 K’de kaç L olur?', 5, [10, 20, 2, 15], 'Boyle: 1·10 = 2·V ⇒ V = 5 L.', 2, ' L');
};

const denge: Gen = (r) => {
  for (let i = 0; i < 300; i++) {
    const a = ri(r, 1, 4), h = ri(r, 1, 3) * 2, c = ri(r, 1, 6);
    const Kc = (c * c) / (a * h ** 3);
    if (Number.isInteger(Kc) && Kc > 1 && a * h ** 3 > 0) {
      return num(r, `N₂(g) + 3H₂(g) ⇌ 2NH₃(g) tepkimesi dengedeyken [N₂] = ${a} M, [H₂] = ${h} M ve [NH₃] = ${c} M’dir. Tepkimenin derişimler türünden denge sabiti (Kc) kaçtır?`, Kc, [c / (a * h), (c * c) / (a * h), (c * c) / (a * 3 * h), c ** 3 / (a * h ** 3)], `Kc = [NH₃]²/([N₂][H₂]³) = ${c}²/(${a}·${h}³) = ${c * c}/${a * h ** 3} = ${Kc}.`, 3);
    }
  }
  return num(r, 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) tepkimesi dengedeyken [N₂] = 1 M, [H₂] = 2 M, [NH₃] = 4 M’dir. Kc kaçtır?', 2, [1, 4, 8, 16], 'Kc = 4²/(1·2³) = 16/8 = 2.', 3);
};

const hiz: Gen = (r) => {
  const m = ri(r, 1, 3), f = ri(r, 2, 4);
  return num(r, `Hız bağıntısı v = k[A]${sup(m)} olan bir tepkimede A’nın derişimi ${f} katına çıkarılırsa tepkime hızı kaç katına çıkar?`, f ** m, [f * m, m, f, f ** (m + 1)], `v ∝ [A]${sup(m)} ⇒ ${f}${sup(m)} = ${f ** m} kat.`, 2, ' kat', 1);
};

const asitBazDenge: Gen = (r) => {
  const a = ri(r, 3, 7), b = ri(r, 1, 3);
  const s = a + b;
  const [a2, b2] = s % 2 === 0 ? [a, b] : [a, b + 1];
  const pH = (a2 + b2) / 2;
  return num(r, `Zayıf bir asidin Ka değeri 10${sup(-a2)} ve derişimi 10${sup(-b2)} M’dir. Çözeltinin pH’ı kaçtır? (Zayıf asit: [H⁺] = √(Ka·C))`, pH, [a2, b2, a2 + b2, 14 - pH], `[H⁺] = √(10${sup(-a2)}·10${sup(-b2)}) = 10${sup(-(a2 + b2) / 2)} ⇒ pH = ${pH}.`, 3);
};

const E0: [string, number][] = [['Zn', -0.76], ['Cu', 0.34], ['Ag', 0.8], ['Fe', -0.44], ['Mg', -2.37], ['Al', -1.66], ['Ni', -0.25], ['Pb', -0.13]];
const elektrokimya: Gen = (r) => {
  const i = ri(r, 0, E0.length - 1);
  let j = ri(r, 0, E0.length - 1);
  if (j === i) j = (j + 1) % E0.length;
  const [hi, lo] = E0[i][1] > E0[j][1] ? [E0[i], E0[j]] : [E0[j], E0[i]];
  const e = Math.round((hi[1] - lo[1]) * 100) / 100;
  return num(r, `Standart indirgenme potansiyelleri E°(${hi[0]}) = ${fmt(hi[1])} V ve E°(${lo[0]}) = ${fmt(lo[1])} V olan yarı hücrelerden kurulan pilin standart pil potansiyeli (E°pil) kaç V’tur?`, e, [Math.round((hi[1] + lo[1]) * 100) / 100, -e, Math.round(Math.abs(hi[1]) * 100) / 100, Math.round((e + 0.5) * 100) / 100], `E°pil = E°katot − E°anot = ${fmt(hi[1])} − (${fmt(lo[1])}) = ${fmt(e)} V (${hi[0]} katot, ${lo[0]} anot).`, 2, ' V', 0.2);
};

const enerjiKimya: Gen = (r) => {
  const a = ri(r, 2, 9) * 50 * one(r, [1, -1] as const), b = ri(r, 2, 9) * 50 * one(r, [1, -1] as const);
  return num(r, `Hess yasasına göre: (1) tepkimenin ΔH₁ = ${a} kJ ve (2) tepkimenin ΔH₂ = ${b} kJ ise, bu iki tepkimenin toplanmasıyla elde edilen tepkimenin ΔH değeri kaç kJ’dür?`, a + b, [a - b, -(a + b), a * b / 100, (a + b) / 2], `Tepkimeler toplanırsa entalpiler toplanır: ${a} + (${b}) = ${a + b} kJ.`, 1, ' kJ', 50);
};

const karbon: Gen = (r) => {
  const n = ri(r, 3, 24);
  const k = r();
  if (k < 0.34) return num(r, `${n} karbon atomlu açık zincirli doymuş bir hidrokarbonda (alkan) kaç hidrojen atomu bulunur?`, 2 * n + 2, [2 * n, 2 * n - 2, n + 2, 2 * n + 4], `Alkanların genel formülü CₙH₂ₙ₊₂: 2·${n} + 2 = ${2 * n + 2}.`, 1);
  if (k < 0.67) return num(r, `C${sub(n)}H${sub(2 * n + 2)} bileşiğinde toplam kaç tane σ (sigma) bağı vardır?`, 3 * n + 1, [2 * n + 2, 3 * n, 4 * n, 3 * n + 2], `Alkanda C−C bağı ${n - 1}, C−H bağı ${2 * n + 2}; toplam ${3 * n + 1} (hepsi σ).`, 2);
  return num(r, `${n} karbonlu açık zincirli, bir çift bağlı hidrokarbonda (alken) kaç hidrojen atomu bulunur?`, 2 * n, [2 * n + 2, 2 * n - 2, n, 2 * n + 1], `Alkenlerin genel formülü CₙH₂ₙ: ${2 * n}.`, 1);
};

const ELEMENT_DIZ = (Z: number) => {
  const order: [string, number][] = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10]];
  let left = Z;
  let last: [string, number] = ['1s', 0];
  for (const [n, cap] of order) {
    const e = Math.min(cap, left);
    if (e > 0) last = [n, e];
    left -= e;
    if (left <= 0) break;
  }
  return last;
};
const modernAtom: Gen = (r) => {
  if (r() < 0.5) {
    const n = ri(r, 1, 4);
    return num(r, `Bir atomun ${n}. enerji düzeyinde (kabuğunda) en fazla kaç elektron bulunabilir?`, 2 * n * n, [n * n, 2 * n, 2 * (n + 1) ** 2, 8], `En fazla 2n² elektron: 2·${n}² = ${2 * n * n}.`, 1);
  }
  const Z = ri(r, 5, 18);
  const [sub_, e] = ELEMENT_DIZ(Z);
  const unp = sub_.endsWith('p') ? (e <= 3 ? e : 6 - e) : e === 1 ? 1 : 0;
  return num(r, `Atom numarası ${Z} olan nötr elementin temel hâldeki atomunda kaç tane eşleşmemiş (yalnız) elektron bulunur?`, unp, [unp + 1, Z - 2 * Math.floor(Z / 2), e, unp + 2], `Elektron dizilişi son alt kabuk: ${sub_}${e}. Hund kuralı: eşleşmemiş elektron = ${unp}.`, 3, '', 1);
};


// ───────── Ek üreticiler (çeşitlilik) ─────────
const ucgenAlan2: Gen = (r) => {
  if (r() < 0.5) {
    const b = ri(r, 4, 40), h = 2 * ri(r, 2, 20);
    return num(r, `Tabanı ${b} cm, bu tabana ait yüksekliği ${h} cm olan üçgenin alanı kaç cm²’dir?`, (b * h) / 2, [b * h, b + h, (b * h) / 4, b * h * 2], `Alan = taban·yükseklik/2 = ${b}·${h}/2 = ${(b * h) / 2} cm².`, 1, ' cm²', 5);
  }
  const [a0, b0, c0] = one(r, [[13, 14, 15], [5, 12, 13], [9, 10, 17], [6, 25, 29], [10, 13, 13], [7, 15, 20], [3, 4, 5], [6, 8, 10]] as const);
  const k = ri(r, 1, 5);
  const [a, b, c] = [a0 * k, b0 * k, c0 * k];
  const s = (a + b + c) / 2, A = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  if (!Number.isInteger(A)) return ucgenAlan2(r);
  return num(r, `Kenar uzunlukları ${a} cm, ${b} cm ve ${c} cm olan üçgenin alanı kaç cm²’dir?`, A, [(a * b) / 2, s, A + 6, A - 6], `Heron: s = ${s}; A = √(${s}·${s - a}·${s - b}·${s - c}) = ${A} cm².`, 3, ' cm²', 6);
};

const dengeGen: Gen = (r) => {
  const t = ri(r, 0, 2);
  const a = ri(r, 1, 8), b = ri(r, 1, 8), c = ri(r, 1, 8);
  if (t === 0) {
    const K = (c * c) / (a * b);
    return num(r, `H₂(g) + I₂(g) ⇌ 2HI(g) tepkimesi dengedeyken [H₂] = ${a} M, [I₂] = ${b} M ve [HI] = ${c} M’dir. Kc kaçtır?`, K, [c / (a * b), (c * c) / (a + b), (2 * c) / (a * b), (a * b) / (c * c)], `Kc = [HI]²/([H₂][I₂]) = ${c}²/(${a}·${b}) = ${c * c}/${a * b} = ${fmt(K)}.`, 3, '', 1);
  }
  if (t === 1) {
    const K = (c * c) / (a * a * b);
    return num(r, `2SO₂(g) + O₂(g) ⇌ 2SO₃(g) tepkimesi dengedeyken [SO₂] = ${a} M, [O₂] = ${b} M ve [SO₃] = ${c} M’dir. Kc kaçtır?`, K, [(c * c) / (a * b), c / (a * b), (c * c) / (2 * a * b), (a * a * b) / (c * c)], `Kc = [SO₃]²/([SO₂]²[O₂]) = ${c}²/(${a}²·${b}) = ${fmt(K)}.`, 3, '', 1);
  }
  const K = (c * c) / a;
  return num(r, `N₂O₄(g) ⇌ 2NO₂(g) tepkimesi dengedeyken [N₂O₄] = ${a} M ve [NO₂] = ${c} M’dir. Kc kaçtır?`, K, [c / a, (2 * c) / a, (c * c) / (2 * a), a / (c * c)], `Kc = [NO₂]²/[N₂O₄] = ${c}²/${a} = ${fmt(K)}.`, 3, '', 1);
};

const modernFizik2: Gen = (r) => {
  const t = r();
  if (t < 0.5) {
    const lam = one(r, [124, 155, 248, 310, 413, 620, 1240] as const);
    const E = 1240 / lam;
    return num(r, `Dalga boyu ${lam} nm olan fotonun enerjisi kaç eV’dir? (hc = 1240 eV·nm)`, E, [lam / 1240, 1240 * lam, E * 2, E + 1], `E = hc/λ = 1240/${lam} = ${fmt(E)} eV.`, 2, ' eV', 0.5);
  }
  const E = ri(r, 3, 12), W = ri(r, 1, E - 1);
  return num(r, `Enerjisi ${E} eV olan foton, bağlanma (eşik) enerjisi ${W} eV olan metale çarpıyor. Sökülen elektronun maksimum kinetik enerjisi kaç eV’dir?`, E - W, [E + W, E, W, E * W], `Fotoelektrik olay: Ek = E − W = ${E} − ${W} = ${E - W} eV.`, 2, ' eV', 1);
};

const hizGen2: Gen = (r) => {
  if (r() < 0.5) {
    const base = one(r, [2, 3] as const), dT = ri(r, 1, 5) * 10;
    return num(r, `Sıcaklık her 10 °C arttığında hızı ${base} katına çıkan bir tepkimede sıcaklık ${dT} °C artırılırsa hız kaç katına çıkar?`, base ** (dT / 10), [base * dT / 10, dT / 10, base ** (dT / 10) + base, base ** (dT / 10 + 1)], `${dT} °C = ${dT / 10} basamak; hız ${base}${sup(dT / 10)} = ${base ** (dT / 10)} kat artar.`, 2, ' kat', 1);
  }
  const c0 = ri(r, 4, 10) / 5, d = ri(r, 1, 3) / 5, t = ri(r, 1, 5) * 10;
  return num(r, `Bir madde derişimi ${t} saniyede ${fmt(c0)} M’den ${fmt(c0 - d)} M’ye düşüyor. Ortalama tepkime hızı kaç M/s’dir?`, d / t, [c0 / t, (c0 - d) / t, d * t, d], `Hız = Δ[A]/Δt = ${fmt(d)}/${t} = ${fmt(d / t)} M/s.`, 2, ' M/s', 0.01);
};

const optik2: Gen = (r) => {
  const t = r();
  if (t < 0.34) {
    const x = ri(r, 2, 40);
    return num(r, `Düzlem aynadan ${x} cm uzağa bir cisim konulmuştur. Cisim ile görüntüsü arasındaki uzaklık kaç cm’dir?`, 2 * x, [x, x / 2, 3 * x, 4 * x], `Görüntü, aynanın arkasında eşit uzaklıkta oluşur: ${x} + ${x} = ${2 * x} cm.`, 1, ' cm', 2);
  }
  if (t < 0.67) {
    const p = ri(r, 2, 12) * 2, q = ri(r, 1, 5) * 2, h = ri(r, 2, 9);
    const hi = (h * q) / p;
    return num(r, `Cisim aynaya ${p} cm, görüntü aynaya ${q} cm uzaklıktadır. Cismin boyu ${h} cm ise görüntünün boyu kaç cm’dir?`, hi, [h * p / q, h * (p + q), h + q - p + 10, h], `Büyütme m = q/p = ${q}/${p}; h′ = h·m = ${h}·${q}/${p} = ${fmt(hi)} cm.`, 3, ' cm', 0.5);
  }
  const n = one(r, [1.5, 2, 1.25] as const), c = 300000;
  return num(r, `Işığın boşluktaki hızı ${c} km/s’dir. Kırılma indisi ${fmt(n)} olan ortamda ışığın hızı kaç km/s’dir?`, c / n, [c * n, c / (n * n), c, c / 2 + n], `v = c/n = ${c}/${fmt(n)} = ${fmt(c / n)} km/s.`, 2, ' km/s', 10000);
};

const permutasyon2: Gen = (r) => {
  const n = ri(r, 4, 10), k = ri(r, 2, 4);
  const t = r();
  if (t < 0.34) return num(r, `${n} kişi bir sıraya kaç farklı biçimde dizilebilir?`, fact(n), [n * n, fact(n - 1), 2 * n, fact(n) / 2], `${n}! = ${fact(n)}.`, 1, '', Math.max(1, fact(n) / 20));
  if (t < 0.67) {
    const ans = fact(n) / fact(n - k);
    return num(r, `${n} kişi arasından ${k} kişi, sıralı olarak (ilk, ikinci…) kaç farklı biçimde seçilebilir?`, ans, [n * k, ans / fact(k), fact(n), n ** k], `P(${n},${k}) = ${n}!/${n - k}! = ${ans}.`, 2, '', Math.max(1, Math.round(ans / 15)));
  }
  return num(r, `${n} kişi yuvarlak bir masa etrafına kaç farklı biçimde oturabilir?`, fact(n - 1), [fact(n), fact(n - 2), n, fact(n - 1) / 2], `Dairesel dizilişte (n−1)! = ${n - 1}! = ${fact(n - 1)}.`, 2, '', Math.max(1, fact(n - 1) / 15));
};

const olasilik2: Gen = (r) => {
  if (r() < 0.5) {
    const s = ri(r, 3, 11);
    let cnt = 0;
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) cnt++;
    const ans = frac(cnt, 36);
    return str(r, `İki zar birlikte atılıyor. Üst yüzlerdeki sayıların toplamının ${s} olma olasılığı kaçtır?`, ans, [frac(cnt, 12), frac(cnt + 1, 36), frac(cnt, 6), frac(s, 36), frac(2 * cnt, 36)], `Toplamı ${s} olan ${cnt} durum vardır; tüm durumlar 36. P = ${cnt}/36 = ${ans}.`, 2);
  }
  const n = ri(r, 3, 7), k = ri(r, 1, n - 1);
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  const ans = frac(c, 2 ** n);
  return str(r, `Bir madeni para ${n} kez atılıyor. Tam ${k} kez tura gelme olasılığı kaçtır?`, ans, [frac(1, 2 ** n), frac(k, n), frac(c, 2 ** (n - 1)), frac(c + 1, 2 ** n), frac(1, 2 ** k)], `C(${n},${k}) = ${c} durum; toplam 2${sup(n)} = ${2 ** n}. P = ${c}/${2 ** n} = ${ans}.`, 3);
};

const limit2: Gen = (r) => {
  const t = r();
  if (t < 0.34) {
    const a = ri(r, 1, 9), b = ri(r, 1, 9), c = ri(r, 1, 9), d = ri(r, 1, 9);
    return num(r, `lim(x→∞) (${a}x + ${b}) / (${c}x + ${d}) değeri kaçtır?`, a / c, [b / d, a * c, (a + b) / (c + d), a / c + 1], `Eşit dereceli polinomlarda limit baş katsayıların oranıdır: ${a}/${c} = ${fmt(a / c)}.`, 2, '', 0.5);
  }
  if (t < 0.67) {
    const a = ri(r, 1, 9), b = ri(r, -9, 9), c = ri(r, 1, 6);
    return num(r, `lim(x→0) (${a}x² ${b === 0 ? '' : `${sgn(b)} ${Math.abs(b)}x`}) / (${c}x) değeri kaçtır?`, b / c, [a / c, (a + b) / c, b, 0], `Paydaki x ile sadeleştirilirse (${a}x ${sgn(b)} ${Math.abs(b)})/${c}; x → 0 için ${fmt(b / c)}.`, 2, '', 0.5);
  }
  const a = ri(r, 1, 7), m = ri(r, 1, 6);
  return num(r, `lim(x→${a}) (x² + ${m}x) değeri kaçtır?`, a * a + m * a, [a + m, a * a, a * m, a * a + m * a + 1], `Polinom fonksiyon süreklidir; x = ${a} yazılır: ${a * a} + ${m * a} = ${a * a + m * a}.`, 1);
};

const elektrikAlan2: Gen = (r) => {
  const t = r();
  if (t < 0.5) {
    const q = ri(r, 1, 9), E = ri(r, 2, 20);
    return num(r, `${q} μC’lık yük, şiddeti ${E} N/μC olan bir elektrik alanında bulunuyor. Yüke etki eden kuvvet kaç N’dir?`, q * E, [E / q, q + E, q * E * 2, q * E / 2], `F = q·E = ${q}·${E} = ${q * E} N.`, 1, ' N', 2);
  }
  const E = ri(r, 2, 20) * 10, d = ri(r, 1, 9) / 10;
  return num(r, `Düzgün elektrik alan şiddeti ${E} N/C olan bölgede, alan doğrultusunda ${fmt(d)} m aralıklı iki nokta arasındaki potansiyel fark kaç volttur?`, E * d, [E / d, E + d, E * d * 2, E], `V = E·d = ${E}·${fmt(d)} = ${fmt(E * d)} V.`, 2, ' V', 1);
};

const elektrostatik2: Gen = (r) => {
  const q1 = ri(r, 2, 12) * 2, q2 = ri(r, 1, 8) * 2;
  if (r() < 0.5) {
    return num(r, `Özdeş iki iletken küreden birinin yükü +${q1} μC, diğerinin yükü +${q2} μC’dir. Küreler birbirine dokundurulup ayrılırsa her birinin yükü kaç μC olur?`, (q1 + q2) / 2, [q1 + q2, q1 - q2, (q1 + q2) / 4, q1], `Özdeş kürelerde yük eşit paylaşılır: (${q1} + ${q2})/2 = ${(q1 + q2) / 2} μC.`, 2, ' μC', 1);
  }
  return num(r, `Özdeş iki iletken küreden birinin yükü +${q1 + 2 * q2} μC, diğerinin yükü −${2 * q2} μC’dir. Küreler dokundurulup ayrılırsa her birinin yükü kaç μC olur?`, q1 / 2, [q1 + 2 * q2, q1, q2, q1 / 4 + q2], `Toplam yük: ${q1 + 2 * q2} − ${2 * q2} = ${q1}; eşit paylaşım: ${q1}/2 = ${q1 / 2} μC.`, 3, ' μC', 1);
};

const asitBaz2: Gen = (r) => {
  const k = ri(r, 1, 6), t = r();
  if (t < 0.34) return num(r, `10${sup(-k)} M NaOH çözeltisinin 25 °C’de pH’ı kaçtır? (NaOH kuvvetli bazdır)`, 14 - k, [k, 14 + k, 7 - k, -k], `[OH⁻] = 10${sup(-k)} ⇒ pOH = ${k}; pH = 14 − ${k} = ${14 - k}.`, 2);
  if (t < 0.67) {
    const k2 = ri(r, 1, 4), n = ri(r, 1, Math.min(3, 6 - k2));
    return num(r, `pH’ı ${k2} olan kuvvetli asit çözeltisi ${10 ** n} katına seyreltiliyor. Yeni pH kaç olur?`, k2 + n, [k2 - n, k2 * n, k2 + 2 * n, 7], `Kuvvetli asit ${10 ** n} kat seyrelince [H⁺] ${10 ** n} kat azalır, pH ${n} artar: ${k2} + ${n} = ${k2 + n}.`, 2);
  }
  const ph = ri(r, 8, 13);
  return num(r, `pH’ı ${ph} olan çözeltinin pOH’ı kaçtır? (25 °C)`, 14 - ph, [ph, 7, 14, ph - 7], `pH + pOH = 14 olduğundan pOH = 14 − ${ph} = ${14 - ph}.`, 1);
};

const kombinasyon2: Gen = (r) => {
  const n = ri(r, 4, 12), t = r();
  if (t < 0.34) return num(r, `${n} elemanlı bir kümenin kaç tane alt kümesi vardır?`, 2 ** n, [n * n, 2 * n, 2 ** n - 1, 2 ** (n - 1)], `Alt küme sayısı 2ⁿ = 2${sup(n)} = ${2 ** n}.`, 1, '', Math.max(1, 2 ** n / 20));
  if (t < 0.67) {
    const k = ri(r, 2, 3);
    let c = 1;
    for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
    return num(r, `${n} elemanlı bir kümenin ${k} elemanlı kaç alt kümesi vardır?`, c, [n * k, c * fact(k), n ** k, c + n], `C(${n},${k}) = ${c}.`, 2, '', Math.max(1, Math.round(c / 8)));
  }
  const m = ri(r, 3, 7), w = ri(r, 3, 7);
  return num(r, `${m} erkek ve ${w} kız öğrenci arasından 1 erkek ve 1 kız öğrenci kaç farklı biçimde seçilebilir?`, m * w, [m + w, m * w * 2, fact(m) * w, (m + w) * (m + w - 1) / 2], `Çarpma prensibi: ${m}·${w} = ${m * w}.`, 1);
};

const modernAtom2: Gen = (r) => {
  const t = r();
  if (t < 0.34) {
    const n = ri(r, 1, 5);
    return num(r, `Bir atomun ${n}. enerji düzeyinde toplam kaç orbital bulunur?`, n * n, [2 * n * n, n, 2 * n, n * n - 1], `Bir düzeydeki orbital sayısı n² = ${n}² = ${n * n}.`, 2);
  }
  const Z = ri(r, 3, 20);
  const orders: [string, number][] = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];
  let left = Z;
  let p = 0, sEl = 0;
  for (const [nm, cap] of orders) {
    const e = Math.min(cap, left);
    if (nm.endsWith('p')) p += e;
    else sEl += e;
    left -= e;
  }
  if (t < 0.67) return num(r, `Atom numarası ${Z} olan nötr atomda toplam kaç elektron p alt kabuklarında bulunur?`, p, [sEl, Z - p, p + 2, Z], `Dizilim (1s 2s 2p 3s 3p 4s sırasıyla): p alt kabuklarında toplam ${p} elektron vardır.`, 3);
  return num(r, `Atom numarası ${Z} olan nötr atomda toplam kaç elektron s alt kabuklarında bulunur?`, sEl, [p, Z - sEl, sEl + 2, Z], `Dizilim (1s 2s 2p 3s 3p 4s sırasıyla): s alt kabuklarında toplam ${sEl} elektron vardır.`, 3);
};

const vektor2: Gen = (r) => {
  const [c, , th] = one(r, [[0.8, 0.6, 37], [0.6, 0.8, 53], [0.5, 0.866, 60]] as const);
  if (th === 60) {
    const F = ri(r, 2, 20) * 2;
    return num(r, `${F} N’luk kuvvet yatayla 60° açı yapıyor. Kuvvetin yatay bileşeni kaç N’dir? (cos60° = 0,5)`, F / 2, [F, F * 2, F * 0.866, F / 4], `Fx = F·cos60° = ${F}·0,5 = ${F / 2} N.`, 2, ' N', 1);
  }
  const F = ri(r, 1, 10) * 5;
  return num(r, `${F} N’luk kuvvet yatayla ${th}° açı yapıyor. Kuvvetin ${c === 0.8 ? 'yatay' : 'düşey'} bileşeni kaç N’dir? (sin37° = cos53° = 0,6; cos37° = sin53° = 0,8)`, F * 0.8, [F * 0.6, F, F * 0.5, F * 1.25], `${th}° için ${c === 0.8 ? 'yatay' : 'düşey'} bileşen ${F}·0,8 = ${fmt(F * 0.8)} N.`, 2, ' N', 1);
};

const yas2: Gen = (r) => {
  const d = ri(r, 20, 35), a = ri(r, 4, 16);
  const kiz = 2 * a + 2;
  return num(r, `Bir annenin yaşı kızının yaşından ${d} fazladır. ${a} yıl önce kız ${a + 2} yaşında olduğuna göre annenin bugünkü yaşı kaçtır?`, kiz + d, [a + 2 + d, d + a, a + 2 + a, d * 2], `Kızın bugünkü yaşı ${a + 2} + ${a} = ${kiz}; anne ${kiz} + ${d} = ${kiz + d}.`, 2);
};

const kanunlar2: Gen = (r) => {
  const T: [string, string, string, number, number][] = [
    ['Fe', 'S', 'FeS', 7, 4], ['Mg', 'O', 'MgO', 3, 2], ['Ca', 'O', 'CaO', 5, 2], ['C', 'H', 'CH₄', 3, 1], ['N', 'H', 'NH₃', 14, 3], ['H', 'O', 'H₂O', 1, 8], ['C', 'O', 'CO₂', 3, 8],
  ];
  const [x, y, f, rx, ry] = one(r, T);
  const a = ri(r, 1, 6), b = ri(r, 1, 6);
  const used = Math.min(a, b);
  const prod = used * (rx + ry);
  return num(r, `${f} bileşiğinde ${x} : ${y} kütle oranı ${rx} : ${ry}’dir. ${a * rx} g ${x} ile ${b * ry} g ${y} tepkimeye giriyor. En çok kaç gram ${f} oluşur?`, prod, [a * rx + b * ry, (rx + ry) * Math.max(a, b), rx + ry, prod + (rx + ry)], `${rx} g ${x} + ${ry} g ${y} → ${rx + ry} g ${f}. ${x}: ${a} birim, ${y}: ${b} birim; sınırlayıcı ${used} birim ⇒ ${used}·${rx + ry} = ${prod} g.`, 3, ' g', 1);
};

const dikUcgen2: Gen = (r) => {
  const [p, q, h] = one(r, TRIPLES);
  const k = ri(r, 1, 8);
  const ht = (p * q * k) / h;
  if (!clean(ht)) return dikUcgen2(r);
  return num(r, `Dik kenarları ${p * k} cm ve ${q * k} cm olan dik üçgende hipotenüse ait yükseklik kaç cm’dir?`, ht, [(p * k + q * k) / 2, p * k * q * k / 2, h * k / 2, ht + 1], `Alan = (${p * k}·${q * k})/2 = h·${h * k}/2 ⇒ yükseklik = ${p * k * q * k}/${h * k} = ${fmt(ht)} cm.`, 3, ' cm', 1);
};

// ───────── Kayıt: konu kimliği → üreticiler ─────────
export const GENERATORS: Record<string, Gen[]> = {
  'tyt-mat.ebob-ekok': [ebobEkok],
  'tyt-mat.bolunebilme': [bolunebilme],
  'tyt-mat.uslu': [uslu],
  'tyt-mat.koklu': [koklu],
  'tyt-mat.carpanlara-ayirma': [carpan],
  'tyt-mat.oran-oranti': [oranOranti],
  'tyt-mat.denklem': [denklem],
  'tyt-mat.yas-problemleri': [yas, yas2],
  'tyt-mat.yuzde-kar-zarar': [yuzde],
  'tyt-mat.karisim': [karisim],
  'tyt-mat.hareket': [hareket],
  'tyt-mat.kumeler': [kumeler],
  'tyt-mat.ikinci-derece': [ikinciDerece],
  'tyt-mat.permutasyon': [permutasyon, permutasyon2],
  'tyt-mat.olasilik': [olasilik, olasilik2],
  'tyt-mat.veri': [veri],
  'tyt-mat.mutlak-deger': [mutlak],
  'tyt-mat.polinom': [polinom],
  'tyt-mat.fonksiyon': [fonksiyon],
  'tyt-geo.acilar': [acilar],
  'tyt-geo.cokgenler': [cokgenler],
  'tyt-geo.dik-ucgen': [dikUcgen, dikUcgen2],
  'tyt-geo.ucgende-alan': [ucgenAlan, ucgenAlan2],
  'tyt-geo.cember': [cember],
  'tyt-geo.dortgenler': [dortgenler],
  'tyt-geo.kati-cisimler': [katiCisim],
  'tyt-geo.analitik': [analitik],
  'tyt-fizik.hareket-kuvvet': [hareketKuvvet],
  'tyt-fizik.enerji': [enerji],
  'tyt-fizik.basinc': [basinc],
  'tyt-fizik.elektrik-akimi': [elektrikAkimi],
  'tyt-fizik.isi-sicaklik': [isi],
  'tyt-fizik.dalgalar': [dalga],
  'tyt-fizik.optik': [optik, optik2],
  'tyt-fizik.elektrostatik': [elektrostatik, elektrostatik2],
  'tyt-kimya.mol': [mol],
  'tyt-kimya.kanunlar': [kanunlar, kanunlar2],
  'tyt-kimya.karisimlar': [karisimlarKimya],
  'tyt-kimya.asit-baz': [asitBaz, asitBaz2],
  'tyt-kimya.atom-periyodik': [atom],
  'ayt-mat.fonksiyon': [fonksiyon],
  'ayt-mat.polinom': [polinom],
  'ayt-mat.ikinci-derece': [ikinciDerece],
  'ayt-mat.parabol': [parabol],
  'ayt-mat.trigonometri': [trigonometri],
  'ayt-mat.logaritma': [logaritma],
  'ayt-mat.diziler': [diziler],
  'ayt-mat.limit': [limit, limit2],
  'ayt-mat.turev': [turev],
  'ayt-mat.integral': [integral],
  'ayt-mat.kombinasyon': [kombinasyon, kombinasyon2],
  'ayt-mat.olasilik': [olasilik, olasilik2],
  'ayt-fizik.vektorler': [vektor, vektor2],
  'ayt-fizik.newton': [newton],
  'ayt-fizik.sabit-ivme': [sabitIvme],
  'ayt-fizik.momentum': [momentum],
  'ayt-fizik.tork-denge': [torkDenge],
  'ayt-fizik.basit-makineler': [torkDenge],
  'ayt-fizik.elektrik-alan': [elektrikAlan, elektrikAlan2],
  'ayt-fizik.kondansator': [kondansator],
  'ayt-fizik.induksiyon': [induksiyon],
  'ayt-fizik.alternatif-akim': [alternatifAkim],
  'ayt-fizik.cembersel': [cembersel],
  'ayt-fizik.modern-fizik': [modernFizik, modernFizik2],
  'ayt-fizik.atom-fizigi': [modernFizik, modernFizik2],
  'ayt-kimya.modern-atom': [modernAtom, modernAtom2],
  'ayt-kimya.gazlar': [gaz],
  'ayt-kimya.cozeltiler': [karisimlarKimya],
  'ayt-kimya.enerji': [enerjiKimya],
  'ayt-kimya.hiz': [hiz, hizGen2],
  'ayt-kimya.denge': [dengeGen, denge],
  'ayt-kimya.asit-baz-denge': [asitBazDenge, asitBaz, asitBaz2],
  'ayt-kimya.elektrokimya': [elektrokimya],
  'ayt-kimya.karbon': [karbon],
  'ayt-kimya.organik': [karbon],
};

export const GEN_PREFIX = 'g:';
export const hasGenerator = (topicId: string) => topicId in GENERATORS;

/** Tohumdan soru üretir; aynı (konu, tohum) her zaman aynı soruyu verir. */
export function generatedQuestion(topicId: string, seed: number): Question | null {
  const gens = GENERATORS[topicId];
  if (!gens) return null;
  const r = rng(seed * 2654435761 + 12345);
  const g = gens[Math.floor(r() * gens.length)];
  let d: Drafted | null = null;
  for (let i = 0; i < 30 && !d; i++) {
    try {
      d = g(r);
    } catch (e) {
      if (!(e instanceof Retry)) throw e;
    }
  }
  if (!d) return null;
  // Negatif sayılarda tutarlı eksi işareti ve ondalık virgülü (seçeneklerle aynı biçim).
  const tidy = (t: string) => t.replace(/(^|[\s(=,])-(?=\d)/g, '$1−').replace(/(\d)\.(\d)/g, '$1,$2');
  return { id: `${GEN_PREFIX}${topicId}:${seed}`, topicId, ...d, text: tidy(d.text), explanation: tidy(d.explanation) };
}

/** `g:<konu>:<tohum>` kimliğini çözer; üretilmiş soru değilse null. */
export function questionFromGenId(id: string): Question | null {
  if (!id.startsWith(GEN_PREFIX)) return null;
  const i = id.lastIndexOf(':');
  const seed = Number(id.slice(i + 1));
  return Number.isInteger(seed) ? generatedQuestion(id.slice(GEN_PREFIX.length, i), seed) : null;
}

/** Bir konu için `count` farklı üretilmiş soru (tohumlar rastgele başlangıçtan ardışık). */
export function generatedSet(topicId: string, count: number, start = Math.floor(Math.random() * 1e6)): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  for (let s = start; out.length < count && s < start + count * 20; s++) {
    const q = generatedQuestion(topicId, s);
    if (q && !seen.has(q.text)) {
      seen.add(q.text);
      out.push(q);
    }
  }
  return out;
}
