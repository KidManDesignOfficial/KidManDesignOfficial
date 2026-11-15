/**
 * Tema ve kullanıcı ayarları.
 *
 * Her ekran `useTheme()` ile renkleri (`colors`) ve yazı ölçekleyicisini (`fs`) alır,
 * stillerini `useMemo` içinde bunlardan üretir. Ayarlar telefonda kalıcıdır.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { ACCENTS, TEXT_SCALES, buildColors, type AccentId, type Colors, type TextSize } from './colors';
import { WEATHER_LOCATIONS } from './config';
import { loadSettings, saveSettings } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export { ACCENTS, TEXT_SCALES };
export type { AccentId, Colors, TextSize };

export type Settings = {
  accent: AccentId;
  mode: ThemeMode;
  textSize: TextSize;
  weatherLocationId: string;
};

export const DEFAULT_SETTINGS: Settings = {
  accent: 'cay',
  mode: 'system',
  textSize: 'normal',
  weatherLocationId: WEATHER_LOCATIONS[0].id,
};

type ThemeValue = {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  colors: Colors;
  /** Yazı boyutunu kullanıcının seçtiği ölçeğe göre büyütür. */
  fs: (size: number) => number;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const systemScheme = useColorScheme();

  useEffect(() => {
    loadSettings().then((stored) => setSettings({ ...DEFAULT_SETTINGS, ...stored }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && systemScheme === 'dark');
  const colors = useMemo(() => buildColors(settings.accent, isDark), [settings.accent, isDark]);
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
