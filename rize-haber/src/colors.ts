/** Renk paletleri ve yazı ölçekleri (React'ten bağımsız; Node ile test edilir). */

export type AccentId = 'cay' | 'deniz' | 'kackar' | 'bordo' | 'gurgen';
export type TextSize = 'normal' | 'large' | 'xlarge';

/** Rize'den esinlenen vurgu renkleri. `light`/`dark`: açık ve koyu temadaki ana renk. */
export const ACCENTS: Record<AccentId, { name: string; short: string; light: string; dark: string }> = {
  cay: { name: 'Çay Yeşili', short: 'Çay', light: '#1B6B3A', dark: '#4CAF73' },
  deniz: { name: 'Karadeniz Mavisi', short: 'Karadeniz', light: '#0B5C7A', dark: '#4FB3D9' },
  kackar: { name: 'Kaçkar Laciverti', short: 'Kaçkar', light: '#25336B', dark: '#8C9EEB' },
  bordo: { name: 'Rize Bezi Bordosu', short: 'Rize Bezi', light: '#8A1E2D', dark: '#E07A86' },
  gurgen: { name: 'Gürgen Kahvesi', short: 'Gürgen', light: '#6B4423', dark: '#C9976B' },
};

export const TEXT_SCALES: Record<TextSize, { name: string; scale: number }> = {
  normal: { name: 'Normal', scale: 1 },
  large: { name: 'Büyük', scale: 1.15 },
  xlarge: { name: 'Çok büyük', scale: 1.3 },
};

export type Colors = {
  primary: string; // vurgu rengi (metin, simge, seçili öğe)
  onPrimary: string; // vurgu zemininde metin
  header: string; // üst çubuk ve dolu kartların zemini
  primarySoft: string; // vurgunun çok açık tonu (seçili satır, basılı durum)
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  isDark: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** İki rengi `t` oranında karıştırır (0 → a, 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

export function buildColors(accent: AccentId, isDark: boolean): Colors {
  const a = ACCENTS[accent];
  if (isDark) {
    return {
      primary: a.dark,
      onPrimary: '#FFFFFF',
      header: mix(a.light, '#000000', 0.35),
      primarySoft: mix(a.dark, '#121614', 0.82),
      background: '#0F1311',
      card: '#1A201C',
      text: '#E8EDEA',
      textMuted: '#9AA79F',
      border: '#2C3530',
      error: '#FF8A80',
      isDark,
    };
  }
  return {
    primary: a.light,
    onPrimary: '#FFFFFF',
    header: a.light,
    primarySoft: mix(a.light, '#FFFFFF', 0.88),
    background: '#F4F6F5',
    card: '#FFFFFF',
    text: '#16201A',
    textMuted: '#5E6B63',
    border: '#DCE3DE',
    error: '#B3261E',
    isDark,
  };
}

