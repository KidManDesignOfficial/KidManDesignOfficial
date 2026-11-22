/**
 * Haberler ekranının arka plan sahnesi "Rize manzarası": günün saatine göre renk alır
 * (gündüz, akşam üstü, gece). Saf modüldür; uygulama ve testler kullanır.
 *
 * Tüm paletler beyaz yazının okunacağı kadar koyudur; üst başlık gökyüzünün ilk rengini,
 * alt sekme çubuğu sahnenin en alt tonunu alır (hava ve Rizespor ekranlarındaki gibi kesintisiz).
 */
import type { SkyChrome } from './weatherScene.ts';

export type RizePhase = 'day' | 'evening' | 'night';

export type RizeSky = {
  phase: RizePhase;
  /** Gökyüzü: üst → ufuk. */
  sky: readonly [string, string, string];
  /** Uzak (karlı) Kaçkar sırtları. Opak olmalı: üst üste binen sırtlar saydamsa kafes deseni oluşur. */
  farMountains: string;
  /** Yakın sırtlar. */
  nearMountains: string;
  /** Karadeniz. */
  sea: readonly [string, string];
  /** Ön plandaki çay tepeleri (açık / koyu). */
  hills: readonly [string, string];
  /** Çay sıraları. */
  rows: string;
  chrome: SkyChrome;
};

const DAY: RizeSky = {
  phase: 'day',
  sky: ['#0F3E5C', '#1D6782', '#4D8F98'],
  farMountains: '#4A8296',
  nearMountains: '#1F4E52',
  sea: ['#175A72', '#0F4357'],
  hills: ['#1F6040', '#123E29'],
  rows: 'rgba(140,210,140,0.22)',
  chrome: { header: '#0F3E5C', footer: '#0B271B' },
};

const EVENING: RizeSky = {
  phase: 'evening',
  sky: ['#1A1E46', '#4B3562', '#B4644F'],
  farMountains: '#71506F',
  nearMountains: '#2B2C46',
  sea: ['#3A3A63', '#22284A'],
  hills: ['#21423A', '#11261F'],
  rows: 'rgba(255,190,140,0.16)',
  chrome: { header: '#1A1E46', footer: '#0C1A15' },
};

const NIGHT: RizeSky = {
  phase: 'night',
  sky: ['#050B1A', '#0B1B36', '#15324C'],
  farMountains: '#1C3050',
  nearMountains: '#0F1D2D',
  sea: ['#0E2539', '#081827'],
  hills: ['#102C22', '#081811'],
  rows: 'rgba(140,190,170,0.12)',
  chrome: { header: '#050B1A', footer: '#06130E' },
};

/** 06:00–16:59 gündüz, 17:00–19:59 akşam üstü, diğer saatler gece. */
export function rizePhase(hour: number): RizePhase {
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export function rizeSkyFor(hour: number): RizeSky {
  const phase = rizePhase(hour);
  return phase === 'day' ? DAY : phase === 'evening' ? EVENING : NIGHT;
}

/** Cam yüzeyler ve yazı tonları (Haberler ekranı). */
export const NEWS_GLASS = {
  surface: 'rgba(255,255,255,0.10)',
  pressed: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.17)',
  divider: 'rgba(255,255,255,0.12)',
  input: 'rgba(4,14,26,0.45)',
  text: '#FFFFFF',
  soft: 'rgba(255,255,255,0.76)',
  faint: 'rgba(255,255,255,0.55)',
  accent: '#8FE3B0',
  /** Yükleniyor taslakları. */
  bone: 'rgba(255,255,255,0.14)',
} as const;
