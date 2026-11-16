/**
 * Telefonda kalıcı veri: favoriler, ayarlar, bildirim için görülmüş haberler.
 * Okuma/yazma hataları uygulamayı çökertmez; varsayılan değer döner.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NewsItem } from './rss';
import type { Settings } from './theme';

const KEYS = {
  favorites: 'rizehaber:favorites:v1',
  notificationsEnabled: 'rizehaber:notificationsEnabled:v1',
  seenIds: 'rizehaber:seenIds:v1',
  settings: 'rizehaber:settings:v1',
  teaData: 'rizehaber:teaData:v1',
  placeList: 'rizehaber:placeList:v1',
} as const;

type StoredNewsItem = Omit<NewsItem, 'publishedAt'> & { publishedAt: string | null };

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama doluysa veya erişilemiyorsa sessizce geç; uygulama çalışmaya devam eder.
  }
}

export async function loadFavorites(): Promise<NewsItem[]> {
  const stored = await readJson<StoredNewsItem[]>(KEYS.favorites, []);
  return stored.map((item) => ({
    ...item,
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
  }));
}

export function saveFavorites(items: NewsItem[]): Promise<void> {
  const stored: StoredNewsItem[] = items.map((item) => ({
    ...item,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
  }));
  return writeJson(KEYS.favorites, stored);
}

export function loadNotificationsEnabled(): Promise<boolean> {
  return readJson(KEYS.notificationsEnabled, false);
}

export function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  return writeJson(KEYS.notificationsEnabled, enabled);
}

/** `null` → henüz hiç kontrol yapılmadı. */
export function loadSeenIds(): Promise<string[] | null> {
  return readJson<string[] | null>(KEYS.seenIds, null);
}

export function saveSeenIds(ids: string[]): Promise<void> {
  return writeJson(KEYS.seenIds, ids);
}

export async function clearSeenIds(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.seenIds);
  } catch {
    // yok say
  }
}

export function loadSettings(): Promise<Partial<Settings>> {
  return readJson<Partial<Settings>>(KEYS.settings, {});
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJson(KEYS.settings, settings);
}

/** Son başarılı indirilen çay verisi (çevrimdışı açılışlar için). */
export function loadCachedTeaData(): Promise<unknown> {
  return readJson<unknown>(KEYS.teaData, null);
}

export function saveCachedTeaData(data: unknown): Promise<void> {
  return writeJson(KEYS.teaData, data);
}

/** "Gitmek istediklerim" listesindeki yerlerin kimlikleri. */
export async function loadPlaceList(): Promise<string[]> {
  const ids = await readJson<unknown>(KEYS.placeList, []);
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
}

export function savePlaceList(ids: string[]): Promise<void> {
  return writeJson(KEYS.placeList, ids);
}
