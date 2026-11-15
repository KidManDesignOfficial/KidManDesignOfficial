/**
 * Bildirimler için "hangi haberler yeni?" hesabı.
 * Yan etkisiz (saf) fonksiyonlardır; Node ile doğrudan test edilir.
 */
import type { NewsItem } from './rss';

/** Bu kadar eski haberler, ilk kez görülse bile bildirilmez (gecikmiş besleme kayıtlarına karşı). */
export const MAX_NOTIFY_AGE_MS = 6 * 60 * 60 * 1000;
/** Hafızada tutulacak en fazla görülmüş haber kimliği sayısı. */
export const MAX_SEEN_IDS = 300;

export type NewsDiff = {
  /** Bildirilecek haberler, yeniden eskiye. */
  fresh: NewsItem[];
  /** Kaydedilecek güncel "görülmüş" listesi. */
  seenIds: string[];
};

/**
 * @param seenIds Daha önce görülen kimlikler; `null` ise ilk çalıştırmadır
 *                ve kullanıcıya eski haberler yağmasın diye hiçbir şey bildirilmez.
 */
export function diffNews(items: NewsItem[], seenIds: string[] | null, now: Date = new Date()): NewsDiff {
  const currentIds = items.map((i) => i.id);
  if (seenIds === null) {
    return { fresh: [], seenIds: currentIds.slice(0, MAX_SEEN_IDS) };
  }

  const seen = new Set(seenIds);
  const fresh = items.filter(
    (item) =>
      !seen.has(item.id) &&
      item.publishedAt !== null &&
      now.getTime() - item.publishedAt.getTime() <= MAX_NOTIFY_AGE_MS,
  );

  const merged = [...currentIds, ...seenIds.filter((id) => !currentIds.includes(id))];
  return { fresh, seenIds: merged.slice(0, MAX_SEEN_IDS) };
}
