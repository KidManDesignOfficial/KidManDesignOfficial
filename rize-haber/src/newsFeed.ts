/**
 * Haber akışı yardımcıları: otomatik yenileme kararı, yeni gelen haberlerin tespiti,
 * güne göre bölümleme ve kaynak rozeti. Yan etkisizdir; Node ile doğrudan test edilir.
 */
import type { NewsItem } from './rss';

/** Ekran açıkken haberler bu aralıkla kendiliğinden yenilenir. */
export const AUTO_REFRESH_MS = 5 * 60 * 1000;
/** Uygulamaya / sekmeye dönüldüğünde veri bundan eskiyse hemen yenilenir. */
export const STALE_AFTER_MS = 2 * 60 * 1000;

export function isStale(loadedAt: number | null | undefined, now: number = Date.now()): boolean {
  return !loadedAt || now - loadedAt >= STALE_AFTER_MS;
}

/** Önceki listede olmayan haberlerin kimlikleri (ilk yüklemede boş döner). */
export function newArrivals(previous: NewsItem[], incoming: NewsItem[]): string[] {
  if (previous.length === 0) return [];
  const seen = new Set(previous.map((i) => i.id));
  return incoming.filter((i) => !seen.has(i.id)).map((i) => i.id);
}

export type DaySection = 'Bugün' | 'Dün' | 'Bu hafta' | 'Daha önce';

export function daySection(date: Date | null, now: Date = new Date()): DaySection {
  if (!date) return 'Daha önce';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = date.getTime();
  if (t >= startOfToday) return 'Bugün';
  if (t >= startOfToday - 86_400_000) return 'Dün';
  if (t >= startOfToday - 6 * 86_400_000) return 'Bu hafta';
  return 'Daha önce';
}

export type FeedRow =
  | { kind: 'lead'; key: string; item: NewsItem }
  | { kind: 'section'; key: string; title: DaySection; count: number }
  | { kind: 'item'; key: string; item: NewsItem };

/**
 * Listeyi ekrana dizer: ilk haber manşet, kalanlar gün başlıklarıyla gruplanır.
 * Arama yapılırken manşet kullanılmaz (sonuçlar düz liste kalır).
 */
export function buildFeed(items: NewsItem[], { lead = true, now = new Date() }: { lead?: boolean; now?: Date } = {}): FeedRow[] {
  const rows: FeedRow[] = [];
  const rest = lead && items.length > 1 ? items.slice(1) : items;
  if (lead && items.length > 1) rows.push({ kind: 'lead', key: `lead:${items[0].id}`, item: items[0] });

  let current: DaySection | null = null;
  let header: Extract<FeedRow, { kind: 'section' }> | null = null;
  for (const item of rest) {
    const section = daySection(item.publishedAt, now);
    if (section !== current) {
      current = section;
      header = { kind: 'section', key: `section:${section}`, title: section, count: 0 };
      rows.push(header);
    }
    header!.count += 1;
    rows.push({ kind: 'item', key: item.id, item });
  }
  return rows;
}

/** Kaynak rozetinin zemin renkleri: açık ve koyu temada beyaz yazıyla okunur. */
export const SOURCE_COLORS = [
  '#2F6F4F',
  '#2B5C8A',
  '#7A3E5A',
  '#8A5A1E',
  '#4B4F9A',
  '#1F6F73',
  '#8A3B2B',
  '#5A6B2B',
] as const;

/** "Rize Gündem" → { initials: "RG", color } — aynı kaynak her zaman aynı rengi alır. */
export function sourceBadge(source: string): { initials: string; color: string } {
  const words = source
    .replace(/https?:\/\/|www\./gi, '')
    .split(/[\s.\-–_|]+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w));
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toLocaleUpperCase('tr-TR')
      : (words[0] ?? '?').slice(0, 2).toLocaleUpperCase('tr-TR');
  let hash = 0;
  for (const ch of source) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return { initials, color: SOURCE_COLORS[hash % SOURCE_COLORS.length] };
}

/** "az önce güncellendi" / "3 dk önce güncellendi" */
export function updatedLabel(loadedAt: number | null, now: number = Date.now()): string {
  if (!loadedAt) return '';
  const minutes = Math.floor((now - loadedAt) / 60_000);
  if (minutes < 1) return 'Az önce güncellendi';
  if (minutes < 60) return `${minutes} dk önce güncellendi`;
  return `${Math.floor(minutes / 60)} sa önce güncellendi`;
}
