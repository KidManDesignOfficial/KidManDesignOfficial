/**
 * Yaş çay alım fiyatı verisi: tipler, doğrulama ve hesaplama yardımcıları.
 * Yan etkisizdir; Node ile doğrudan test edilir. Ağdan okuma `teaData.ts` içindedir.
 */

export type TeaPrice = { year: number; pricePerKg: number };

export type TeaData = {
  schemaVersion: 1;
  updatedAt: string; // YYYY-MM-DD
  current: TeaPrice & {
    announcedAt: string; // YYYY-MM-DD
    announcedBy: string;
    sourceUrl: string;
  };
  history: TeaPrice[]; // yeniden eskiye
  notes: string[];
  links: { label: string; url: string }[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isPrice = (v: unknown): boolean =>
  isObj(v) &&
  Number.isInteger(v.year) &&
  typeof v.pricePerKg === 'number' &&
  Number.isFinite(v.pricePerKg) &&
  v.pricePerKg > 0 &&
  v.pricePerKg < 10_000;
const isHttpsUrl = (v: unknown): v is string => typeof v === 'string' && v.startsWith('https://');

/**
 * Uzaktan gelen veriyi sıkı biçimde doğrular. Biçim bozuksa `null` döner;
 * böylece hatalı bir dosya yayınlansa bile uygulama yanlış fiyat göstermez.
 */
export function parseTeaData(input: unknown): TeaData | null {
  if (!isObj(input) || input.schemaVersion !== 1) return null;
  if (typeof input.updatedAt !== 'string' || !ISO_DATE.test(input.updatedAt)) return null;

  const c = input.current as Record<string, unknown>;
  if (
    !isObj(c) ||
    !isPrice(c) ||
    typeof c.announcedAt !== 'string' ||
    !ISO_DATE.test(c.announcedAt) ||
    typeof c.announcedBy !== 'string' ||
    !c.announcedBy ||
    !isHttpsUrl(c.sourceUrl)
  ) {
    return null;
  }

  if (!Array.isArray(input.history) || !input.history.every(isPrice)) return null;
  const notes = Array.isArray(input.notes) ? input.notes.filter((n) => typeof n === 'string') : [];
  const links = Array.isArray(input.links)
    ? input.links.filter((l): l is { label: string; url: string } => isObj(l) && typeof l.label === 'string' && isHttpsUrl(l.url))
    : [];

  return {
    schemaVersion: 1,
    updatedAt: input.updatedAt,
    current: {
      year: c.year as number,
      pricePerKg: c.pricePerKg as number,
      announcedAt: c.announcedAt,
      announcedBy: c.announcedBy,
      sourceUrl: c.sourceUrl as string,
    },
    history: [...(input.history as TeaPrice[])].sort((a, b) => b.year - a.year),
    notes,
    links,
  };
}

/** İki kaynaktan (ör. gömülü + indirilen) daha yeni olanı seçer. */
export function newerTeaData(a: TeaData | null, b: TeaData | null): TeaData | null {
  if (!a) return b;
  if (!b) return a;
  return b.updatedAt > a.updatedAt ? b : a;
}

/** Bir önceki yıla göre yüzde değişim; önceki yıl yoksa `null`. */
export function yearOverYearChange(data: TeaData): { previous: TeaPrice; percent: number } | null {
  const previous = data.history.find((h) => h.year === data.current.year - 1);
  if (!previous) return null;
  return { previous, percent: ((data.current.pricePerKg - previous.pricePerKg) / previous.pricePerKg) * 100 };
}

/** 1234.5 → "1.234,50" (Türkçe sayı biçimi; Intl'e bağımlı değil). */
export function formatNumber(value: number, decimals = 2): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}${grouped}${frac ? `,${frac}` : ''}`;
}

export function formatLira(value: number): string {
  return `${formatNumber(value)} ₺`;
}

/** "2026-05-12" → "12 Mayıs 2026" */
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function formatDateTr(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Kullanıcının yazdığı kg değerini çözer: "1.250,5" veya "1250.5" → 1250.5 */
export function parseKg(input: string): number | null {
  const cleaned = input.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}
