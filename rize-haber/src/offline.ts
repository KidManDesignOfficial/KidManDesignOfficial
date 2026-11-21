/**
 * Haber ve hava durumunun son başarılı verisi. İnternet yokken (ör. yaylada) ekran boş kalmaz;
 * son veri "çevrimdışı" notuyla gösterilir.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Markets } from './markets';
import type { NewsItem } from './rss';
import type { Weather } from './weather';

const PREFIX = 'rizehaber:offline:v1:';

type Stored<T> = { savedAt: number; data: T };

async function read<T>(key: string): Promise<Stored<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Stored<T>) : null;
  } catch {
    return null;
  }
}

async function write<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // depolama doluysa sessizce geç
  }
}

type StoredNews = Omit<NewsItem, 'publishedAt'> & { publishedAt: string | null };

export async function loadCachedNews(key: string): Promise<{ items: NewsItem[]; savedAt: number } | null> {
  const s = await read<StoredNews[]>(`news:${key}`);
  if (!s || !Array.isArray(s.data)) return null;
  return {
    savedAt: s.savedAt,
    items: s.data.map((i) => ({ ...i, publishedAt: i.publishedAt ? new Date(i.publishedAt) : null })),
  };
}

export function saveCachedNews(key: string, items: NewsItem[]): Promise<void> {
  // Yalnızca ilk 40 haber saklanır; depolama küçük kalır.
  return write<StoredNews[]>(
    `news:${key}`,
    items.slice(0, 40).map((i) => ({ ...i, publishedAt: i.publishedAt ? i.publishedAt.toISOString() : null })),
  );
}

export async function loadCachedWeather(locationId: string): Promise<{ weather: Weather; savedAt: number } | null> {
  const s = await read<Weather>(`weather:${locationId}`);
  return s && s.data && s.data.current ? { weather: s.data, savedAt: s.savedAt } : null;
}

export function saveCachedWeather(locationId: string, weather: Weather): Promise<void> {
  return write(`weather:${locationId}`, weather);
}

export async function loadCachedMarkets(): Promise<Markets | null> {
  const s = await read<Markets>('markets');
  return s && s.data && Array.isArray(s.data.rates) && s.data.rates.length ? s.data : null;
}

export function saveCachedMarkets(markets: Markets): Promise<void> {
  return write('markets', markets);
}

/** "14:05" ya da "dün 14:05" ya da "12 Kas 14:05" */
export function savedAtLabel(savedAt: number, now = Date.now()): string {
  const d = new Date(savedAt);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const days = Math.floor((new Date(now).setHours(0, 0, 0, 0) - new Date(savedAt).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return hm;
  if (days === 1) return `dün ${hm}`;
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]} ${hm}`;
}
