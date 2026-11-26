/**
 * "Tek renk" düzeni: uygulamanın tamamını tek bir rengin tonlarına indirir.
 *
 * İki parçası var:
 * 1. Sahne filtresi: arka plan sahneleri (manzara, stadyum, çay bahçesi, piyasa, gökyüzü) bir renk
 *    matrisi filtresiyle boyanır: önce gri tona çevrilir, sonra seçilen rengin tonuyla renklendirilir.
 *    Renk matrisi filtreleri Android'in her sürümünde donanım katmanıyla çalışır.
 * 2. Vurgu tonlama: kartlardaki renkli vurgular (kulüp yeşili, altın sarısı, açık yeşil bağlantılar)
 *    aynı açıklıkta kalıp seçilen rengin tonunu alır. Beyaz, siyah ve gri tonlar değişmez; böylece
 *    yazılar okunaklı kalır.
 *
 * Saf modüldür (React içermez); Node ile test edilir. Android'in hesabı (FilterHelper.kt) burada
 * birebir taklit edilir; böylece üst başlık ile filtrelenmiş sahnenin ilk rengi aynı çıkar.
 */

type Vec3 = [number, number, number];
/** 3×3 renk matrisi, satır sırasıyla (bu filtrelerde sabit terim yoktur). */
type Mat3 = number[];

const LUMA: Vec3 = [0.2126, 0.7152, 0.0722];

const SEPIA: Mat3 = [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131];

function hueRotateMatrix(deg: number): Mat3 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [
    0.213 + 0.787 * c - 0.213 * s, 0.715 - 0.715 * c - 0.715 * s, 0.072 - 0.072 * c + 0.928 * s,
    0.213 - 0.213 * c + 0.143 * s, 0.715 + 0.285 * c + 0.14 * s, 0.072 - 0.072 * c - 0.283 * s,
    0.213 - 0.213 * c - 0.787 * s, 0.715 - 0.715 * c + 0.715 * s, 0.072 + 0.928 * c + 0.072 * s,
  ];
}

/** Android `ColorMatrix.setSaturation` (0.213 / 0.715 / 0.072 katsayıları). */
function saturateMatrix(v: number): Mat3 {
  const R = 0.213 * (1 - v);
  const G = 0.715 * (1 - v);
  const B = 0.072 * (1 - v);
  return [R + v, G, B, R, G + v, B, R, G, B + v];
}

function apply(m: Mat3, [r, g, b]: Vec3): Vec3 {
  return [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b];
}

const luma = (c: Vec3) => LUMA[0] * c[0] + LUMA[1] * c[1] + LUMA[2] * c[2];
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Gri girdinin sepya sonrası yönü: (1,1,1) → sepya. */
const SEPIA_WHITE = apply(SEPIA, [1, 1, 1]);

const cache = new Map<string, MonoTint>();
/** `monoTint` sonucunu renk başına bir kez hesaplar. */
export function cachedMonoTint(base: string): MonoTint {
  let t = cache.get(base);
  if (!t) {
    t = monoTint(base);
    cache.set(base, t);
  }
  return t;
}

export type MonoTint = {
  /** Seçilen renk ("#RRGGBB"). */
  base: string;
  /** Renk tonu (0–360) ve doygunluk (0–1); vurgu tonlamada kullanılır. */
  hue: number;
  sat: number;
  /** Filtre zinciri: gri ton → sepya → ton kaydırma → doygunluk → parlaklık. */
  hueRotate: number;
  saturate: number;
  brightness: number;
  /** Gri bir girdinin (açıklığı 1) filtre sonrası rengi; sahne renkleri bununla çarpılır. */
  tint: Vec3;
  /** Nötr renk: sahne yalnızca gri tona çevrilir (siyah-beyaz). */
  neutral: boolean;
};

/** "#RRGGBB" / "#RGB" / "rgb(a)(…)" → [r,g,b] (0–1) ve saydamlık. Çözülemezse null. */
export function parseColor(color: string): { rgb: Vec3; alpha: number } | null {
  const c = color.trim();
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(c);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    const n = parseInt(hex.slice(0, 6), 16);
    const alpha = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
    return { rgb: [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255], alpha };
  }
  m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c);
  if (m) return { rgb: [+m[1] / 255, +m[2] / 255, +m[3] / 255], alpha: m[4] === undefined ? 1 : +m[4] };
  return null;
}

function formatColor(rgb: Vec3, alpha: number): string {
  const b = rgb.map((x) => Math.round(clamp01(x) * 255));
  if (alpha >= 1) return `#${b.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  return `rgba(${b[0]},${b[1]},${b[2]},${+alpha.toFixed(3)})`;
}

function rgbToHsl([r, g, b]: Vec3): Vec3 {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb([h, s, l]: Vec3): Vec3 {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** Ton kaydırma + doygunluk + parlaklık sonrası gri girdinin rengi. */
function chain(hue: number, sat: number): Vec3 {
  return apply(saturateMatrix(sat), apply(hueRotateMatrix(hue), SEPIA_WHITE));
}

/**
 * Seçilen renk için filtre ayarlarını bulur. Hedef: gri bir pikselin açıklığı korunsun, rengi seçilen
 * rengin tonu ve (`strength` oranında) doygunluğu olsun. Ton kaydırma ve doygunluk ızgarada aranır,
 * sonra parlaklık açıklığı eşitler. Sonuç renk başına bir kez hesaplanır.
 */
export function monoTint(base: string, strength = 0.75): MonoTint {
  const parsed = parseColor(base);
  const rgb: Vec3 = parsed ? parsed.rgb : [0.5, 0.5, 0.5];
  const [hue, sat] = rgbToHsl(rgb);
  // Nötr renk (Grafit): yalnızca gri ton; sonuç tam siyah-beyaz olur.
  if (Math.max(...rgb) - Math.min(...rgb) < 0.06) {
    return { base, hue, sat: 0, hueRotate: 0, saturate: 0, brightness: 1, tint: [1, 1, 1], neutral: true };
  }
  const y = Math.max(0.02, luma(rgb));
  // Açıklığı 1 olan hedef renk: griden seçilen renge doğru `strength` kadar.
  const target: Vec3 = [0, 1, 2].map((i) => 1 + strength * (rgb[i] / y - 1)) as Vec3;

  let best = { h: 0, s: 0, err: Infinity };
  const score = (h: number, s: number) => {
    const v = chain(h, s);
    const k = 1 / luma(v);
    return (v[0] * k - target[0]) ** 2 + (v[1] * k - target[1]) ** 2 + (v[2] * k - target[2]) ** 2;
  };
  for (let h = 0; h < 360; h += 4) {
    for (let s = 0; s <= 6; s += 0.1) {
      const err = score(h, s);
      if (err < best.err) best = { h, s, err };
    }
  }
  // İnce ayar.
  for (let h = best.h - 4; h <= best.h + 4; h += 0.5) {
    for (let s = Math.max(0, best.s - 0.1); s <= best.s + 0.1; s += 0.01) {
      const err = score(h, s);
      if (err < best.err) best = { h, s, err };
    }
  }
  const hueRotate = ((Math.round(best.h * 2) / 2) % 360 + 360) % 360;
  const saturate = Math.round(best.s * 100) / 100;
  const v = chain(hueRotate, saturate);
  const brightness = Math.round((1 / luma(v)) * 1000) / 1000;
  const tint = v.map((x) => x * brightness) as Vec3;
  return { base, hue, sat, hueRotate, saturate, brightness, tint, neutral: false };
}

/**
 * Sahne katmanına verilecek `filter` değeri. Android filtre listesini sondan başa uygular
 * (FilterHelper: `preConcat`); web ise baştan sona. `platform` buna göre sırayı çevirir; her iki
 * durumda da önce gri ton, en son parlaklık uygulanır.
 */
export function sceneFilter(t: MonoTint, platform: 'android' | 'web' | 'ios' | string): string {
  if (t.neutral) return 'grayscale(1)';
  const steps = ['grayscale(1)', 'sepia(1)', `hue-rotate(${t.hueRotate}deg)`, `saturate(${t.saturate})`, `brightness(${t.brightness})`];
  return (platform === 'android' ? steps.reverse() : steps).join(' ');
}

/** Bir sahne rengini filtreyle birebir aynı tona çevirir (üst başlık ve alt çubuk için). */
export function sceneTone(t: MonoTint, color: string): string {
  const p = parseColor(color);
  if (!p) return color;
  const l = luma(p.rgb);
  return formatColor([t.tint[0] * l, t.tint[1] * l, t.tint[2] * l], p.alpha);
}

/**
 * Arayüz vurgusunu tek renge çevirir: açıklık korunur, ton seçilen renkten gelir. Doygunluğu çok düşük
 * * renkler (beyaz, siyah, gri, mavimsi gri, cam yüzeyler) olduğu gibi kalır.
 */
export function uiTone(t: MonoTint, color: string): string {
  const p = parseColor(color);
  if (!p) return color;
  const [, s, l] = rgbToHsl(p.rgb);
  if (s < 0.15) return color;
  return formatColor(hslToRgb([t.hue, Math.min(s, Math.max(t.sat, 0.0)), l]), p.alpha);
}

/** Renk tonu (0–360); gri için null. Testler ve önizleme için. */
export function hueOf(color: string): number | null {
  const p = parseColor(color);
  if (!p) return null;
  const [h, s] = rgbToHsl(p.rgb);
  return s < 0.05 ? null : h;
}

/** Filtre zincirini (Android sırasıyla) bir renge uygular; testlerde sahne filtresini doğrulamak için. */
export function simulateFilter(t: MonoTint, color: string): string {
  const p = parseColor(color);
  if (!p) return color;
  const g = luma(p.rgb);
  if (t.neutral) return formatColor([g, g, g], p.alpha);
  let v: Vec3 = apply(SEPIA, [g, g, g]);
  v = apply(hueRotateMatrix(t.hueRotate), v);
  v = apply(saturateMatrix(t.saturate), v);
  return formatColor([v[0] * t.brightness, v[1] * t.brightness, v[2] * t.brightness], p.alpha);
}
