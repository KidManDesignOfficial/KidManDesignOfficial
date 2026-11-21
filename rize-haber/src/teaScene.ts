/**
 * Çay ekranının "sabah çay bahçesi" sahnesinin renkleri. Saf modüldür; uygulama ve testler kullanır.
 *
 * Gökyüzü koyu yeşilden şafağın altın ışığına iner; önünde kat kat, sıra sıra çay tarlaları uzanır.
 * Üst başlık gökyüzünün ilk rengini, alt sekme çubuğu en öndeki tepenin tonunu alır.
 */
import type { SkyChrome } from './weatherScene.ts';

export const TEA_SKY = ['#0A2722', '#143D33', '#3B5C40', '#8D8A50'] as const;
export const TEA_SKY_STOPS = [0, 0.16, 0.3, 0.42] as const;

/** Uzaktan yakına çay tepeleri: uzakta puslu, önde koyu ve belirgin sıralı. */
export const TEA_LAYERS = [
  { color: '#2F5C45', rows: 'rgba(200,235,190,0.10)' },
  { color: '#21593D', rows: 'rgba(170,230,170,0.14)' },
  { color: '#1B6040', rows: 'rgba(160,230,160,0.17)' },
  { color: '#134A30', rows: 'rgba(150,225,160,0.20)' },
] as const;

/** Şafak güneşi. */
export const DAWN_SUN = '#FFDB8F';

export const TEA_CHROME: SkyChrome = { header: TEA_SKY[0], footer: '#0A2418' };

/** Cam yüzeyler ve yazı tonları (Çay ekranı). */
export const TEA_GLASS = {
  surface: 'rgba(255,255,255,0.10)',
  surfaceStrong: 'rgba(255,255,255,0.16)',
  border: 'rgba(255,255,255,0.17)',
  divider: 'rgba(255,255,255,0.11)',
  input: 'rgba(3,20,12,0.45)',
  text: '#FFFFFF',
  soft: 'rgba(255,255,255,0.76)',
  faint: 'rgba(255,255,255,0.55)',
  accent: '#9BE8B4',
  /** Demli çay rengi (ince belli bardak, vurgu). */
  amber: '#F2B35C',
  tea: ['#D0552A', '#8A2812'] as const,
} as const;
