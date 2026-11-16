/**
 * Tarih yardımcıları: günlük seri (streak), gün anahtarı ve sınava kalan süre.
 * Tüm hesaplar cihazın yerel saatine göre yapılır.
 */

/** Yerel tarihi 'YYYY-AA-GG' biçiminde döndürür. */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/**
 * Art arda çalışılan gün sayısı. Bugün henüz çalışılmadıysa seri dünden geriye sayılır
 * (gün bitmeden seri kırılmış sayılmaz).
 */
export function streak(activeDays: Iterable<string>, today: Date = new Date()): number {
  const set = new Set(activeDays);
  let cursor = set.has(dayKey(today)) ? today : addDays(today, -1);
  let count = 0;
  while (set.has(dayKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

/** Sınav gününe kalan tam gün sayısı (sınav günü 0). */
export function daysUntil(target: Date, today: Date = new Date()): number {
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** 'GG.AA.YYYY' metnini tarihe çevirir; geçersizse null. */
export function parseTrDate(text: string): Date | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (d.getDate() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1) return null;
  return d;
}

export function formatTrDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function longTrDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Gün anahtarından tekrarlanabilir bir sayı üretir (günün sorusu için). */
export function daySeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
