/**
 * Tema ve kullanıcı ayarları.
 *
 * Her ekran `useTheme()` ile renkleri (`colors`) ve yazı ölçekleyicisini (`fs`) alır,
 * stillerini `useMemo` içinde bunlardan üretir. Ayarlar telefonda kalıcıdır.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  ACCENTS,
  PALETTES,
  PALETTE_IDS,
  TEXT_SCALES,
  buildColors,
  type AccentId,
  type Colors,
  type PaletteId,
  type TextSize,
} from './colors';
import { DEFAULT_BACKDROPS, sanitizeBackdrops, type BackdropChoice } from './backdrops';
import { WEATHER_LOCATIONS } from './config';
import { setHapticsEnabled } from './haptics';
import { placeById } from './places';
import { loadSettings, saveSettings } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';
/** Alt sekme çubuğundaki sekmeler (açılış ekranı seçimi için). */
export type TabId = 'news' | 'rizespor' | 'tea' | 'economy' | 'weather' | 'rize';
/**
 * Keşfet sekmesi şimdilik kapalı: sekme çubuğunda, açılış sekmesi seçiminde ve tanıtımda görünmez.
 * Kodu duruyor; geri açmak için `true` yapın ve app.json → android.blockedPermissions listesinden
 * `ACCESS_COARSE_LOCATION`ı çıkarın (Keşfet'in “Konumumu kullan” düğmesi bu izni ister). Kapalıyken izin
 * bilerek engellenir: mağaza sürümü kullanmadığı bir konum iznini istemesin (test/store.test.ts denetler).
 */
export const DISCOVER_ENABLED = false;
export const TAB_IDS: TabId[] = (['news', 'rizespor', 'tea', 'economy', 'weather', 'rize'] as TabId[]).filter(
  (id) => DISCOVER_ENABLED || id !== 'rize',
);
export { ACCENTS, PALETTES, PALETTE_IDS, TEXT_SCALES };
export type { AccentId, Colors, PaletteId, TextSize };

export type Settings = {
  accent: AccentId;
  /** Zemin/kart/metin paleti (Klasik, Kâğıt, Yayla Sisi…). */
  palette: PaletteId;
  mode: ThemeMode;
  textSize: TextSize;
  weatherLocationId: string;
  /** Hava ekranında son seçilen köy/yayla kimlikleri (en yeni başta). */
  recentPlaces: string[];
  /** Geçiş, açılır-kapanır ve dokunma animasyonları. */
  uiMotion: boolean;
  /** Arka plan sahnelerindeki sürekli hareket (yağmur, bulut, buhar, borsa şeridi, stadyum ışıkları). */
  sceneMotion: boolean;
  /** Dokunuşlarda hafif titreşim. */
  haptics: boolean;
  /** Yağmurlu havada Hava ekranında yağmur sesi. */
  rainSound: boolean;
  /** Uygulama açıldığında gösterilen sekme. */
  startTab: TabId;
  /** Her sekmenin arka plan sahnesi (Ayarlar → Arka planlar). */
  backdrops: BackdropChoice;
};

export const DEFAULT_SETTINGS: Settings = {
  accent: 'cay',
  palette: 'klasik',
  mode: 'system',
  textSize: 'normal',
  weatherLocationId: WEATHER_LOCATIONS[0].id,
  recentPlaces: [],
  uiMotion: true,
  sceneMotion: true,
  haptics: true,
  rainSound: false,
  startTab: 'news',
  backdrops: DEFAULT_BACKDROPS,
};

/** Telefonda saklı (eski sürümden kalma ya da bozuk olabilecek) ayarları güvenli hâle getirir. */
export function sanitizeSettings(stored: Partial<Settings> | null | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  return {
    accent: s.accent in ACCENTS ? s.accent : DEFAULT_SETTINGS.accent,
    palette: PALETTE_IDS.includes(s.palette) ? s.palette : DEFAULT_SETTINGS.palette,
    mode: s.mode === 'light' || s.mode === 'dark' || s.mode === 'system' ? s.mode : DEFAULT_SETTINGS.mode,
    textSize: s.textSize in TEXT_SCALES ? s.textSize : DEFAULT_SETTINGS.textSize,
    weatherLocationId: placeById(String(s.weatherLocationId)) ? s.weatherLocationId : DEFAULT_SETTINGS.weatherLocationId,
    recentPlaces: Array.isArray(s.recentPlaces) ? s.recentPlaces.filter((id) => typeof id === 'string' && placeById(id)) : [],
    uiMotion: bool(s.uiMotion, true),
    sceneMotion: bool(s.sceneMotion, true),
    haptics: bool(s.haptics, true),
    rainSound: bool(s.rainSound, false),
    startTab: TAB_IDS.includes(s.startTab) ? s.startTab : DEFAULT_SETTINGS.startTab,
    backdrops: sanitizeBackdrops(s.backdrops),
  };
}

type ThemeValue = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  colors: Colors;
  /** Yazı boyutunu kullanıcının seçtiği ölçeğe göre büyütür. */
  fs: (size: number) => number;
};

const ThemeContext = createContext<ThemeValue | null>(null);

/**
 * @param initial Açılışta önceden okunmuş ayarlar (açılış ekranı kapanmadan yüklenir; ilk karede
 *   doğru tema ve sekme görünür). Verilmezse ayarlar burada okunur.
 */
export function ThemeProvider({ children, initial }: { children: ReactNode; initial?: Partial<Settings> }) {
  const [settings, setSettings] = useState<Settings>(() => sanitizeSettings(initial));
  const systemScheme = useColorScheme();

  useEffect(() => {
    if (initial) return;
    loadSettings().then((stored) => setSettings(sanitizeSettings(stored)));
  }, [initial]);

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && systemScheme === 'dark');
  const colors = useMemo(() => buildColors(settings.accent, isDark, settings.palette), [settings.accent, isDark, settings.palette]);
  const scale = TEXT_SCALES[settings.textSize].scale;
  const fs = useCallback((size: number) => Math.round(size * scale), [scale]);

  const value = useMemo(
    () => ({ settings, updateSettings, colors, fs }),
    [settings, updateSettings, colors, fs],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme, ThemeProvider içinde kullanılmalı.');
  return value;
}
