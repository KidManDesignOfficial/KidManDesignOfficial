/** Tarih biçimlendirme yardımcıları (Türkçe). */

export function timeAgo(date: Date | null, now: Date = new Date()): string {
  if (!date) return '';
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'az önce';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/** "2026-11-15" → "Bugün" / "Yarın" / gün adı. */
export function dayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Bugün';
  if (index === 1) return 'Yarın';
  const [y, m, d] = isoDate.split('-').map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
}

/** "2026-11-15T07:12" → "07:12" */
export function clockTime(isoLocal: string | null): string {
  return isoLocal?.split('T')[1]?.slice(0, 5) ?? '–';
}
