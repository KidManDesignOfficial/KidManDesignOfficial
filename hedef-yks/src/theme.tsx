/**
 * Renk sistemi ve tema. Ekranlar `useTheme()` ile renkleri (`c`), yazı ölçekleyicisini (`fs`)
 * ve karanlık mod bilgisini alır.
 */
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'normal' | 'large';
export const TEXT_SCALE: Record<TextSize, number> = { small: 0.92, normal: 1, large: 1.12 };

const light = {
  bg: '#F4F5FB',
  card: '#FFFFFF',
  cardAlt: '#EEF0FA',
  text: '#141632',
  textMuted: '#5E6283',
  textFaint: '#9093AE',
  border: '#E3E5F1',
  primary: '#5B4BF5',
  primaryDark: '#3A2BC9',
  primarySoft: '#ECEAFF',
  accent: '#FF7A45',
  success: '#12B76A',
  successSoft: '#DDF7EA',
  danger: '#F04438',
  dangerSoft: '#FDE6E4',
  warning: '#F79009',
  warningSoft: '#FEF0DA',
  info: '#2E90FA',
  infoSoft: '#E1EFFE',
  tabBar: '#FFFFFF',
  overlay: 'rgba(20,22,50,0.45)',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#0D0E1C',
  card: '#181A2E',
  cardAlt: '#20233B',
  text: '#F1F2FA',
  textMuted: '#A9ACC8',
  textFaint: '#6D7092',
  border: '#2A2D48',
  primary: '#8B7DFF',
  primaryDark: '#5B4BF5',
  primarySoft: '#2A2550',
  accent: '#FF9466',
  success: '#32D583',
  successSoft: '#123A2A',
  danger: '#F97066',
  dangerSoft: '#3D1B1B',
  warning: '#FDB022',
  warningSoft: '#3A2A0D',
  info: '#53B1FD',
  infoSoft: '#122B45',
  tabBar: '#14162A',
  overlay: 'rgba(0,0,0,0.6)',
};

export const GRADIENT = {
  hero: ['#6D5DFC', '#3A2BC9'] as [string, string],
  heroDark: ['#4A3BD6', '#221A7A'] as [string, string],
  warm: ['#FF8A4C', '#F5445B'] as [string, string],
  success: ['#2FD38A', '#0E9F6E'] as [string, string],
  teacher: ['#0EA5E9', '#4F46E5'] as [string, string],
};

type ThemeValue = { c: Colors; dark: boolean; fs: (n: number) => number };
const Ctx = createContext<ThemeValue | null>(null);

export function ThemeProvider({ mode, textSize, children }: { mode: ThemeMode; textSize: TextSize; children: ReactNode }) {
  const system = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const value = useMemo<ThemeValue>(() => {
    const s = TEXT_SCALE[textSize];
    return { c: isDark ? dark : light, dark: isDark, fs: (n) => Math.round(n * s) };
  }, [isDark, textSize]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme, ThemeProvider içinde kullanılmalı.');
  return v;
}

/** Hex rengi saydamlıkla birleştirir: alpha('#5B4BF5', 0.2) */
export function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
