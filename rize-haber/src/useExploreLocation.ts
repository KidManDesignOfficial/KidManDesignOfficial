/**
 * Keşfet önerilerinin "nereye göre" hesaplandığı nokta.
 *
 * Varsayılan: Ayarlar'daki konum (ilçe ya da köy) — izin gerektirmez. Kullanıcı "Konumumu kullan"a
 * dokunursa telefonun yaklaşık konumu (yalnızca kaba konum izni) bir kez alınır. Koordinatlar yalnızca
 * bellekte tutulur; hiçbir yere kaydedilmez ve gönderilmez.
 */
import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';

import { distanceKm, type LatLon } from './explore';
import { DISTRICT_PLACES, placeById, placeSubtitle } from './places';
import { useTheme } from './theme';

export type ExploreRef = LatLon & {
  label: string;
  source: 'setting' | 'gps';
  detail: string;
  /** İnternete gönderilebilecek nokta (hava tahmini): GPS'te en yakın ilçe merkezi, aksi halde seçilen yer. */
  publicPoint: LatLon & { name: string };
};

const RIZE_CENTER = { lat: 41.0201, lon: 40.5234 };

export type LocateResult = 'ok' | 'denied' | 'error';

export function useExploreLocation() {
  const { settings } = useTheme();
  const [gps, setGps] = useState<LatLon | null>(null);
  const [locating, setLocating] = useState(false);

  const fromSetting = useMemo<ExploreRef>(() => {
    const p = placeById(settings.weatherLocationId) ?? placeById('merkez')!;
    const point = { lat: p.latitude, lon: p.longitude };
    return { ...point, label: p.name, source: 'setting', detail: placeSubtitle(p), publicPoint: { ...point, name: p.name } };
  }, [settings.weatherLocationId]);

  const ref = useMemo<ExploreRef>(() => {
    if (!gps) return fromSetting;
    const far = distanceKm(gps, RIZE_CENTER) > 120;
    // Gerçek koordinat telefonda kalır; dışarıya (hava servisi) yalnızca en yakın ilçe merkezi gider.
    const d = DISTRICT_PLACES.reduce((best, p) =>
      distanceKm(gps, { lat: p.latitude, lon: p.longitude }) < distanceKm(gps, { lat: best.latitude, lon: best.longitude }) ? p : best,
    );
    return {
      ...gps,
      label: 'Konumun',
      source: 'gps',
      detail: far ? 'Rize dışındasın; uzaklıklar buna göre' : `Yaklaşık konum · ${d.name} yakını`,
      publicPoint: { lat: d.latitude, lon: d.longitude, name: d.name },
    };
  }, [fromSetting, gps]);

  const locate = useCallback(async (): Promise<LocateResult> => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') return 'denied';
      // Önce telefonun bildiği son konum (anında, pil dostu); yoksa düşük hassasiyetle yeni ölçüm.
      const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 }).catch(() => null);
      const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
      setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      return 'ok';
    } catch {
      return 'error';
    } finally {
      setLocating(false);
    }
  }, []);

  const resetToSetting = useCallback(() => setGps(null), []);

  return { ref, locating, locate, resetToSetting };
}
