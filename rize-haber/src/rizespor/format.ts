/** Maç tarih ve geri sayım biçimleri (Türkçe, telefonun yerel saatiyle). Yan etkisiz. */

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const DAYS_LONG = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const pad = (n: number) => String(n).padStart(2, '0');

export function clock(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Bugün", "Yarın", "Dün" ya da "Cmt 21 Kas". */
export function dayLabel(date: Date, now: Date = new Date()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return 'Bugün';
  if (sameDay(date, tomorrow)) return 'Yarın';
  if (sameDay(date, yesterday)) return 'Dün';
  return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "Cumartesi, 21 Kas · 16:00" */
export function longKickoff(date: Date, now: Date = new Date()): string {
  const day = dayLabel(date, now);
  const prefix = day === 'Bugün' || day === 'Yarın' ? day : `${DAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return `${prefix} · ${clock(date)}`;
}

/** Kalan süre: { days, hours, minutes, seconds } (negatifse sıfır). */
export function countdownParts(ms: number): { days: number; hours: number; minutes: number; seconds: number } {
  const t = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(t / 86400),
    hours: Math.floor((t % 86400) / 3600),
    minutes: Math.floor((t % 3600) / 60),
    seconds: t % 60,
  };
}

/** Puan tablosunda averaj: +12 / 0 / -3 */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

/** "Ahmed Kutucu" → "Kutucu"; tek kelimeyse olduğu gibi. Saha üzerindeki kısa ad. */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : full;
}
