/**
 * Widget verisini üretir ve yerel modüle yazar.
 *
 * - `syncWidgets()`: ağa çıkmaz; ekranların zaten kaydettiği son verilerden (çevrimdışı önbellek)
 *   anlık görüntü üretir. Uygulama açılınca, arka plana geçerken ve görünüm ayarları değişince çağrılır.
 * - `refreshWidgetData()`: arka plan görevinde, yalnızca ana ekranda widget varsa ve yalnızca o
 *   widget'ların ihtiyaç duyduğu kaynakları indirir; sonucu önbelleğe yazar (uygulama da hızlı açılır).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { installedWidgets, setWidgetSnapshot, widgetsAvailable } from '../../modules/rize-widgets';
import { NEWS_CATEGORIES, WEATHER_LOCATIONS, googleNewsRssUrl } from '../config';
import { fetchMarkets } from '../markets';
import { loadCachedMarkets, loadCachedNews, loadCachedWeather, saveCachedMarkets, saveCachedNews, saveCachedWeather } from '../offline';
import { placeById } from '../places';
import { fetchFixtures, fetchScoreboard, latestResults, loadCachedClubData, mergeClubData, nextMatch } from '../rizespor/api';
import { fetchRss, keepRelevant } from '../rss';
import { loadSettings } from '../storage';
import { loadLocalTeaData } from '../teaData';
import { TEXT_SCALES, sanitizeSettings } from '../theme';
import { fetchWeather } from '../weather';
import type { Match } from '../rizespor/parse';
import { buildSnapshot, pickMatch, widgetTheme, type WidgetKind } from './snapshot';

const NEWS_KEY = NEWS_CATEGORIES[0].id;
/**
 * Arka plan görevinin en son indirdiği maç (skor tablosundan gelen canlı skor dahil) ve indirildiği an.
 * Rizespor önbelleği ham ESPN yanıtını tuttuğu için canlı skor oraya işlenmez; widget için ayrı saklanır.
 */
const MATCH_KEY = 'rizehaber:widgets:match:v1';
/** Bu süreden eski maç kaydı yerine önbellekteki fikstür kullanılır. */
const MATCH_TTL_MS = 2 * 3600_000;

type StoredMatch = { savedAt: number; match: Omit<Match, 'date'> & { date: string } };

async function saveMatchOverlay(match: Match, savedAt: number): Promise<void> {
  const stored: StoredMatch = { savedAt, match: { ...match, date: match.date.toISOString() } };
  try {
    await AsyncStorage.setItem(MATCH_KEY, JSON.stringify(stored));
  } catch {
    // yok say
  }
}

async function loadMatchOverlay(now: number): Promise<{ match: Match; savedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(MATCH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredMatch;
    const date = new Date(s.match.date);
    if (!Number.isFinite(s.savedAt) || Number.isNaN(date.getTime()) || now - s.savedAt > MATCH_TTL_MS) return null;
    return { match: { ...s.match, date }, savedAt: s.savedAt };
  } catch {
    return null;
  }
}

/** Ana ekranda en az bir widget var mı; varsa hangileri. */
export function placedWidgets(): Set<WidgetKind> {
  const counts = installedWidgets();
  return new Set((Object.keys(counts) as WidgetKind[]).filter((k) => (counts[k] ?? 0) > 0));
}

let pending: Promise<void> | null = null;
let again = false;

/** Önbellekteki son verilerle widget'ları günceller. Üst üste çağrılar tek çalışmada birleşir. */
export function syncWidgets(): Promise<void> {
  if (!widgetsAvailable) return Promise.resolve();
  if (pending) {
    again = true;
    return pending;
  }
  pending = (async () => {
    do {
      again = false;
      await writeSnapshot().catch(() => {});
    } while (again);
  })().finally(() => {
    pending = null;
  });
  return pending;
}

async function writeSnapshot(): Promise<void> {
  const settings = sanitizeSettings(await loadSettings());
  const place = placeById(settings.weatherLocationId) ?? placeById(WEATHER_LOCATIONS[0].id)!;
  const now = Date.now();
  const [weather, news, markets, tea, club, overlay] = await Promise.all([
    loadCachedWeather(place.id),
    loadCachedNews(NEWS_KEY),
    loadCachedMarkets(),
    loadLocalTeaData().catch(() => null),
    loadCachedClubData().catch(() => null),
    loadMatchOverlay(now),
  ]);
  // Arka plan görevinin yeni kaydı varsa o (canlı skor dahil); yoksa uygulamanın önbelleğindeki fikstür.
  // Önbellekteki maçın indirilme zamanı bilinmez: 0 verilir, canlı skor widget'ta "CANLI" değil "Son durum" görünür.
  const cachedMatch = club ? pickMatch(nextMatch(club, now), latestResults(club)[0] ?? null, now) : null;
  const match = overlay ?? (cachedMatch ? { match: cachedMatch, savedAt: 0 } : null);
  const snapshot = buildSnapshot({
    now,
    textScale: TEXT_SCALES[settings.textSize].scale,
    theme: widgetTheme({ accent: settings.accent, palette: settings.palette, monochrome: settings.monochrome, mode: settings.mode }),
    weather: weather ? { place: place.name, weather: weather.weather, savedAt: weather.savedAt } : null,
    news: news ? { items: news.items, savedAt: news.savedAt } : null,
    markets: markets ? { markets, savedAt: markets.fetchedAt } : null,
    tea,
    match,
  });
  await setWidgetSnapshot(JSON.stringify(snapshot));
}

const BG = { retries: 0, timeoutMs: 20_000 } as const;

/**
 * Arka plan görevi: ana ekrandaki widget'ların verisini tazeler. Kaynaklar paralel ve birbirinden
 * bağımsızdır; biri başarısız olursa diğerleri yine güncellenir.
 *
 * @param skip Bu görevde zaten indirilmiş kaynaklar (ör. bildirim kontrolü haberleri çektiyse).
 * @returns Widget yoksa `false` (hiçbir şey indirilmez).
 */
export async function refreshWidgetData(skip: { news?: boolean } = {}): Promise<boolean> {
  const placed = placedWidgets();
  if (placed.size === 0) return false;
  const jobs: Promise<unknown>[] = [];

  if (placed.has('weather')) {
    jobs.push(
      (async () => {
        const settings = sanitizeSettings(await loadSettings());
        const place = placeById(settings.weatherLocationId) ?? placeById(WEATHER_LOCATIONS[0].id)!;
        await saveCachedWeather(place.id, await fetchWeather(place));
      })(),
    );
  }
  if (placed.has('news') && !skip.news) {
    jobs.push(
      (async () => {
        const items = keepRelevant(await fetchRss(googleNewsRssUrl(NEWS_CATEGORIES[0].query), undefined, BG));
        await saveCachedNews(NEWS_KEY, items);
      })(),
    );
  }
  if (placed.has('markets')) {
    jobs.push((async () => saveCachedMarkets(await fetchMarkets()))());
  }
  if (placed.has('rizespor')) {
    jobs.push(
      (async () => {
        // Fikstür önbelleğe yazılır; günün skor tablosu canlı / yeni biten maçı fikstüre işler.
        const [fixtures, today] = await Promise.all([fetchFixtures(), fetchScoreboard().catch(() => null)]);
        const merged = mergeClubData(await loadCachedClubData(), { fixtures, ...(today ? { today } : {}) });
        const now = Date.now();
        const match = pickMatch(nextMatch(merged, now), latestResults(merged)[0] ?? null, now);
        if (match) await saveMatchOverlay(match, now);
      })(),
    );
  }
  await Promise.allSettled(jobs);
  await syncWidgets();
  return true;
}

