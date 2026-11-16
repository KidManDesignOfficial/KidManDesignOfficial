/**
 * Canlı veri: resmi sayfayı indirir, ayrıştırır, son başarılı sonucu cihazda saklar.
 *
 * - Açılışta önce önbellekteki son veri gösterilir (anında), ardından arka planda tazelenir.
 * - İnternet yoksa ya da site yanıt vermezse önbellek "son güncelleme: …" bilgisiyle gösterilir.
 * - Önbellek de yoksa hata durumu döner; ekran resmi sayfayı açma seçeneği sunar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export type LiveState<T> = {
  data: T | null;
  /** Verinin resmi siteden alındığı an (ms). */
  fetchedAt: number | null;
  loading: boolean;
  /** Son deneme başarısızsa açıklama; önbellekten gösteriliyor olabilir. */
  error: string | null;
  fromCache: boolean;
  refresh: () => void;
};

const PREFIX = 'hedefyks:live:v1:';

export async function fetchText(url: string, timeoutMs = 15000, headers?: Record<string, string>): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: headers ?? { Accept: 'text/html,application/xhtml+xml' } });
    if (!res.ok) throw new Error(`Sunucu ${res.status} yanıtı verdi`);
    return await res.text();
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Bağlantı zaman aşımına uğradı');
    throw new Error((e as Error).message?.includes('Network') ? 'İnternet bağlantısı yok' : (e as Error).message || 'Bağlantı kurulamadı');
  } finally {
    clearTimeout(t);
  }
}

/**
 * @param key   önbellek anahtarı
 * @param url   resmi sayfa adresi
 * @param parse HTML → veri; boş sonuç (dizi uzunluğu 0) "sayfa yapısı değişti" sayılır
 * @param maxAgeMs bu süreden yeni önbellek varsa ağ isteği atılmaz (yenile ile zorlanabilir)
 */
export function useLive<T>(key: string, url: string | null, parse: (html: string) => T, maxAgeMs = 30 * 60 * 1000, headers?: Record<string, string>): LiveState<T> {
  const [data, setData] = useState<T | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [tick, setTick] = useState(0);
  const parseRef = useRef(parse);
  useEffect(() => {
    parseRef.current = parse;
  }, [parse]);
  const headersRef = useRef(headers);
  const forced = useRef(false);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    (async () => {
      setLoading(true);
      let cachedAt = 0;
      try {
        const raw = await AsyncStorage.getItem(PREFIX + key);
        if (raw && alive) {
          const c = JSON.parse(raw) as { at: number; data: T };
          cachedAt = c.at;
          setData(c.data);
          setFetchedAt(c.at);
          setFromCache(true);
        }
      } catch {
        // önbellek okunamadı; ağdan denenecek
      }
      if (!forced.current && cachedAt && Date.now() - cachedAt < maxAgeMs) {
        if (alive) setLoading(false);
        return;
      }
      forced.current = false;
      try {
        const parsed = parseRef.current(await fetchText(url, 15000, headersRef.current));
        if (Array.isArray(parsed) && parsed.length === 0) throw new Error('Resmi sayfanın yapısı değişmiş olabilir');
        const at = Date.now();
        if (!alive) return;
        setData(parsed);
        setFetchedAt(at);
        setFromCache(false);
        setError(null);
        AsyncStorage.setItem(PREFIX + key, JSON.stringify({ at, data: parsed })).catch(() => {});
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [key, url, maxAgeMs, tick]);

  const refresh = useCallback(() => {
    forced.current = true;
    setTick((t) => t + 1);
  }, []);

  return { data, fetchedAt, loading, error, fromCache, refresh };
}

export function agoText(at: number | null): string {
  if (!at) return '';
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} sa önce`;
  return new Date(at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}
