/**
 * Rizespor ekranının "maç gecesi" stadyum sahnesinin renkleri. Saf modüldür; uygulama ve testler kullanır.
 *
 * Gökyüzü gece mavisinden (kulübün laciverti) tribünlerin karanlığına, oradan çim yeşiline iner.
 * Üst başlık gökyüzünün ilk rengini, alt sekme çubuğu sahnenin en alt tonunu alır; böylece ekran
 * hava durumu sayfasındaki gibi baştan sona kesintisiz görünür.
 */
import type { SkyChrome } from '../weatherScene';

/** Üstten alta arka plan geçişi ve durakları. */
export const STADIUM_SKY = ['#050D1C', '#0A1E3C', '#0C2A33', '#0B3B27', '#08301F'] as const;
export const STADIUM_SKY_STOPS = [0, 0.28, 0.46, 0.7, 1] as const;

/** Çim biçme şeritleri (koyu / açık). */
export const GRASS = ['#0E5A31', '#11683A'] as const;

/** Projektör ışığı (sıcak beyaz). */
export const FLOODLIGHT = '#FFF6D8';

export const STADIUM_CHROME: SkyChrome = { header: STADIUM_SKY[0], footer: '#06251A' };

/** Cam (yarı saydam) yüzeyler ve yazı tonları: koyu sahnenin üstünde okunaklı kalır. */
export const GLASS = {
  surface: 'rgba(255,255,255,0.09)',
  surfaceStrong: 'rgba(255,255,255,0.15)',
  border: 'rgba(255,255,255,0.16)',
  divider: 'rgba(255,255,255,0.10)',
  text: '#FFFFFF',
  soft: 'rgba(255,255,255,0.74)',
  faint: 'rgba(255,255,255,0.5)',
  /** Rizespor satırlarında ve vurgularda açık yeşil. */
  accent: '#7BE0A6',
  /** Puan durumunda Rizespor satırının zemini. */
  highlight: 'rgba(10,138,67,0.32)',
} as const;
