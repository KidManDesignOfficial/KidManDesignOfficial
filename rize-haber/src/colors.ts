/** Renk paletleri ve yazı ölçekleri (React'ten bağımsız; Node ile test edilir). */
import { cachedMonoTint, sceneTone, uiTone, type MonoTint } from './mono.ts';

export type AccentId = 'cay' | 'deniz' | 'kackar' | 'bordo' | 'gurgen' | 'firtina' | 'grafit';
export type TextSize = 'normal' | 'large' | 'xlarge';

/** Rize'den esinlenen vurgu renkleri. `light`/`dark`: açık ve koyu temadaki ana renk. */
export const ACCENTS: Record<AccentId, { name: string; short: string; light: string; dark: string }> = {
  cay: { name: 'Çay Yeşili', short: 'Çay', light: '#1B6B3A', dark: '#4CAF73' },
  deniz: { name: 'Karadeniz Mavisi', short: 'Karadeniz', light: '#0B5C7A', dark: '#4FB3D9' },
  kackar: { name: 'Kaçkar Laciverti', short: 'Kaçkar', light: '#25336B', dark: '#8C9EEB' },
  bordo: { name: 'Rize Bezi Bordosu', short: 'Rize Bezi', light: '#8A1E2D', dark: '#E07A86' },
  gurgen: { name: 'Gürgen Kahvesi', short: 'Gürgen', light: '#6B4423', dark: '#C9976B' },
  firtina: { name: 'Fırtına Deresi', short: 'Fırtına', light: '#0E6B66', dark: '#4DC2B8' },
  /** Nötr gri: "Tek renk" düzeniyle birlikte uygulama tamamen siyah-beyaz olur. */
  grafit: { name: 'Grafit', short: 'Grafit', light: '#36393C', dark: '#B9BDC1' },
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
  /** "Tek renk" düzeni açıksa seçilen rengin tonlama ayarları; kapalıysa null. */
  mono: MonoTint | null;
};

/**
 * Arayüz vurgusunu (kulüp yeşili, altın sarısı, sahne bağlantı rengi…) etkin renk düzenine uyarlar:
 * "Tek renk" kapalıyken rengi olduğu gibi, açıkken seçilen rengin tonunda döndürür.
 */
export function tint(colors: Pick<Colors, 'mono'>, color: string): string {
  return colors.mono ? uiTone(colors.mono, color) : color;
}

/** Sahne rengini (üst başlık / alt sekme çubuğu) sahne filtresiyle aynı tona çevirir. */
export function sceneTint(colors: Pick<Colors, 'mono'>, color: string): string {
  return colors.mono ? sceneTone(colors.mono, color) : color;
}

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

/** Zemin, kart, metin ve çizgi tonları; vurgu renginden bağımsız seçilir. */
export type PaletteId = 'klasik' | 'kagit' | 'sis' | 'tonlu' | 'zifiri' | 'kontrast';

type Surface = { background: string; card: string; text: string; textMuted: string; border: string; error: string };

/**
 * Tema paletleri. Her biri açık ve koyu görünüm için ayrı zemin tanımlar. `tonlu` sabit renk
 * yerine seçili vurgu renginden türetilir (aşağıda `buildColors`).
 */
export const PALETTES: Record<PaletteId, { name: string; hint: string; light: Surface; dark: Surface }> = {
  klasik: {
    name: 'Klasik',
    hint: 'Sade, dengeli zemin',
    light: { background: '#F4F6F5', card: '#FFFFFF', text: '#16201A', textMuted: '#5E6B63', border: '#DCE3DE', error: '#B3261E' },
    dark: { background: '#0F1311', card: '#1A201C', text: '#E8EDEA', textMuted: '#9AA79F', border: '#2C3530', error: '#FF8A80' },
  },
  kagit: {
    name: 'Kâğıt',
    hint: 'Sıcak krem; uzun okumada göz yormaz',
    light: { background: '#F3ECDF', card: '#FFFAF1', text: '#2A2017', textMuted: '#6B5C4D', border: '#E2D6C2', error: '#A8261C' },
    dark: { background: '#16120E', card: '#221C16', text: '#EDE4D6', textMuted: '#A99A8A', border: '#3A3027', error: '#FF8A7A' },
  },
  sis: {
    name: 'Yayla Sisi',
    hint: 'Serin, mavimsi gri tonlar',
    light: { background: '#EDF1F5', card: '#FAFCFE', text: '#17202A', textMuted: '#586574', border: '#D3DBE4', error: '#B3261E' },
    dark: { background: '#0F141A', card: '#18202A', text: '#E5EBF2', textMuted: '#93A1B0', border: '#28323E', error: '#FF8A80' },
  },
  tonlu: {
    name: 'Renk tonlu',
    hint: 'Zemin seçtiğiniz rengin tonunu alır',
    // Gerçek değerler vurgu renginden hesaplanır; bunlar yalnızca yedek.
    light: { background: '#F4F6F5', card: '#FFFFFF', text: '#16201A', textMuted: '#5E6B63', border: '#DCE3DE', error: '#B3261E' },
    dark: { background: '#0F1311', card: '#1A201C', text: '#E8EDEA', textMuted: '#9AA79F', border: '#2C3530', error: '#FF8A80' },
  },
  zifiri: {
    name: 'Zifiri',
    hint: 'Koyuda tam siyah; OLED’de pil dostu',
    light: { background: '#FFFFFF', card: '#F5F6F7', text: '#0B0D0E', textMuted: '#585D62', border: '#E1E3E6', error: '#B3261E' },
    dark: { background: '#000000', card: '#0E0F10', text: '#F2F3F4', textMuted: '#9A9EA3', border: '#232528', error: '#FF8A80' },
  },
  kontrast: {
    name: 'Yüksek kontrast',
    hint: 'En net yazı ve belirgin çizgiler',
    light: { background: '#FFFFFF', card: '#FFFFFF', text: '#000000', textMuted: '#2B2B2B', border: '#5C5C5C', error: '#8C0F0F' },
    dark: { background: '#000000', card: '#0A0A0A', text: '#FFFFFF', textMuted: '#DADADA', border: '#9A9A9A', error: '#FFA8A0' },
  },
};

export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];

/** Seçili vurgu renginden türetilen hafif tonlu zemin (`tonlu` paleti). */
function tintedSurface(a: { light: string; dark: string }, isDark: boolean): Surface {
  if (isDark) {
    return {
      background: mix(a.light, '#000000', 0.82),
      card: mix(a.light, '#000000', 0.7),
      text: mix(a.dark, '#FFFFFF', 0.86),
      textMuted: mix(a.dark, '#FFFFFF', 0.45),
      border: mix(a.light, '#000000', 0.5),
      error: '#FF8A80',
    };
  }
  return {
    background: mix(a.light, '#FFFFFF', 0.9),
    card: mix(a.light, '#FFFFFF', 0.97),
    text: mix(a.light, '#000000', 0.78),
    textMuted: mix(a.light, '#3A3A3A', 0.55),
    border: mix(a.light, '#FFFFFF', 0.8),
    error: '#B3261E',
  };
}

export function buildColors(accent: AccentId, isDark: boolean, palette: PaletteId = 'klasik', monochrome = false): Colors {
  const a = ACCENTS[accent] ?? ACCENTS.cay;
  const mono = monochrome ? cachedMonoTint(a.light) : null;
  const p = PALETTES[palette] ?? PALETTES.klasik;
  const surface = palette === 'tonlu' ? tintedSurface(a, isDark) : isDark ? p.dark : p.light;
  const strong = palette === 'kontrast';
  if (isDark) {
    // Tam siyah zeminde vurgu biraz açılır ki seçili öğeler net seçilsin.
    const primary = strong ? mix(a.dark, '#FFFFFF', 0.3) : a.dark;
    return {
      ...surface,
      primary,
      onPrimary: '#FFFFFF',
      header: mix(a.light, '#000000', palette === 'zifiri' || strong ? 0.55 : 0.35),
      // Klasik palet önceki sürümlerle birebir aynı kalsın.
      primarySoft: mix(primary, palette === 'klasik' ? '#121614' : surface.background, 0.82),
      isDark,
      mono,
    };
  }
  const primary = strong ? mix(a.light, '#000000', 0.2) : a.light;
  return {
    ...surface,
    primary,
    onPrimary: '#FFFFFF',
    header: primary,
    primarySoft: mix(primary, surface.card, 0.88),
    isDark,
    mono,
  };
}
