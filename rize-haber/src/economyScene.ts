/**
 * Ekonomi ekranının "piyasa ekranı" sahnesi: renkler ve süsleme grafiklerinin geometrisi.
 * Saf modüldür; uygulama ve testler kullanır.
 *
 * Arka plandaki mum grafiği ve yükselen çizgi yalnızca süslemedir, gerçek veri göstermez;
 * gerçek değerler kartlarda ve kayan kur bandındadır.
 */
import { seeded, type SkyChrome } from './weatherScene.ts';

/** Gece mavisi "terminal" zemini: üstten alta. */
export const ECON_SKY = ['#050A17', '#0A1631', '#0B1D38', '#071425'] as const;
export const ECON_SKY_STOPS = [0, 0.35, 0.7, 1] as const;

export const ECON_CHROME: SkyChrome = { header: ECON_SKY[0], footer: '#061021' };

/** Piyasa renkleri: yükselen yeşil, düşen kırmızı, altın sarısı. */
export const MARKET = {
  up: '#3DDC97',
  down: '#FF6B7A',
  gold: '#F2C75C',
  goldSoft: '#F7DE9C',
} as const;

/** Cam yüzeyler ve yazı tonları (Ekonomi ekranı). */
export const ECON_GLASS = {
  surface: 'rgba(255,255,255,0.08)',
  surfaceStrong: 'rgba(255,255,255,0.14)',
  border: 'rgba(255,255,255,0.15)',
  divider: 'rgba(255,255,255,0.09)',
  input: 'rgba(2,8,20,0.5)',
  text: '#FFFFFF',
  soft: 'rgba(255,255,255,0.74)',
  faint: 'rgba(255,255,255,0.5)',
  accent: MARKET.gold,
  goldSurface: 'rgba(242,199,92,0.12)',
  goldBorder: 'rgba(242,199,92,0.34)',
} as const;

/** Döviz kodlarının bayrakları (kur tablosunda rozetin yanında). */
export const FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  SAR: '🇸🇦',
  RUB: '🇷🇺',
  GEL: '🇬🇪',
};

/** Değerler 0–1 arasıdır; 1 grafiğin tepesidir. */
export type Candle = { open: number; close: number; high: number; low: number };

/**
 * Yukarı eğilimli, tekrarlanabilir bir mum serisi üretir ve 0.06–0.94 aralığına yayar.
 * Aynı `salt` her zaman aynı seriyi verir.
 */
export function candleSeries(count: number, salt = 0): Candle[] {
  let price = 0;
  const raw = Array.from({ length: count }, (_, i) => {
    const open = price;
    const close = open + (seeded(i, salt) - 0.5) * 0.1 + 0.02;
    const high = Math.max(open, close) + seeded(i, salt + 1) * 0.035;
    const low = Math.min(open, close) - seeded(i, salt + 2) * 0.035;
    price = close;
    return { open, close, high, low };
  });
  const min = Math.min(...raw.map((c) => c.low));
  const max = Math.max(...raw.map((c) => c.high));
  const span = max - min || 1;
  const fit = (v: number) => 0.06 + ((v - min) / span) * 0.88;
  return raw.map((c) => ({ open: fit(c.open), close: fit(c.close), high: fit(c.high), low: fit(c.low) }));
}

/** Kademeli yükselen, hafif dalgalı çizgi (0–1). */
export function trendLine(count: number, salt = 0): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0;
    const wave = Math.sin(t * Math.PI * 3.2 + salt) * 0.08 + (seeded(i, salt) - 0.5) * 0.12;
    return Math.min(0.96, Math.max(0.04, 0.15 + t * 0.68 + wave));
  });
}

export type Segment = { left: number; top: number; length: number; angle: number };

/**
 * Noktaları birleştiren çizgi parçaları. Her parça, ortası iki noktanın ortasına gelen ve
 * `angle` derece döndürülen `length` uzunluğunda, `thickness` kalınlığında bir kutudur.
 */
export function segments(points: { x: number; y: number }[], thickness: number): Segment[] {
  const out: Segment[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    out.push({
      left: (a.x + b.x) / 2 - length / 2,
      top: (a.y + b.y) / 2 - thickness / 2,
      length,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return out;
}
