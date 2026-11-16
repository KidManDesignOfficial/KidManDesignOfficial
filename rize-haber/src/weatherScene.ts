/**
 * Hava durumu sahnesi: WMO hava kodunu ekranın arka planında oynayan canlı sahneye çevirir.
 * Saf modüldür (React/Expo içermez); hem uygulama hem testler kullanır.
 */

export type SceneKind = 'clear' | 'partly' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

export type Scene = {
  kind: SceneKind;
  isDay: boolean;
  /** Gökyüzü geçişi: üst → alt. Başlık çubuğu üst rengi kullanır, böylece ekranla kesintisiz birleşir. */
  sky: readonly [string, string];
  /** Gökyüzündeki bulut sayısı (0 = bulutsuz). */
  clouds: number;
  /** Bulutların koyuluğu: 0 = beyaz pamuk, 1 = koyu fırtına bulutu. */
  cloudShade: number;
  /** Yağmur damlası ya da kar tanesi sayısı. */
  particles: number;
  /** Güneş ya da ay görünür mü? */
  showSun: boolean;
  /** Yağmur sesi önerilebilir mi (yağmur, çiseleme, sağanak, fırtına)? */
  rainy: boolean;
};

type Sky = readonly [string, string];

const SKY: Record<SceneKind, { day: Sky; night: Sky }> = {
  clear: { day: ['#2F7FD3', '#7DB9EE'], night: ['#0B1530', '#1E2F5C'] },
  partly: { day: ['#3F86C4', '#8DBADF'], night: ['#121D3A', '#2A3A63'] },
  cloudy: { day: ['#56656F', '#8E9AA4'], night: ['#1C232C', '#3A4450'] },
  rain: { day: ['#34424F', '#5D6D7C'], night: ['#151C24', '#2E3A47'] },
  storm: { day: ['#1E242D', '#3A4350'], night: ['#0E1217', '#262D37'] },
  snow: { day: ['#5F7891', '#97ABBF'], night: ['#1E2A3A', '#44566B'] },
  fog: { day: ['#6E7980', '#A2ABB1'], night: ['#262C31', '#4A5157'] },
};

/** Hangi kod hangi sahne, kaç bulut ve kaç damla? Değerler telefonda akıcılık için sınırlıdır. */
function classify(code: number): Omit<Scene, 'isDay' | 'sky'> {
  const base = { clouds: 0, cloudShade: 0, particles: 0, showSun: false, rainy: false };
  if (code === 0) return { ...base, kind: 'clear', showSun: true };
  if (code === 1) return { ...base, kind: 'clear', showSun: true, clouds: 1 };
  if (code === 2) return { ...base, kind: 'partly', showSun: true, clouds: 3 };
  if (code === 3) return { ...base, kind: 'cloudy', clouds: 5, cloudShade: 0.35 };
  if (code === 45 || code === 48) return { ...base, kind: 'fog', clouds: 1, cloudShade: 0.2 };
  // Çiseleme (51–57) ve hafif yağmur/sağanak: seyrek damla.
  if ((code >= 51 && code <= 57) || code === 61 || code === 80) {
    return { ...base, kind: 'rain', clouds: 4, cloudShade: 0.55, particles: 45, rainy: true };
  }
  if (code === 63 || code === 66 || code === 81) {
    return { ...base, kind: 'rain', clouds: 5, cloudShade: 0.65, particles: 80, rainy: true };
  }
  if (code === 65 || code === 67 || code === 82) {
    return { ...base, kind: 'rain', clouds: 5, cloudShade: 0.75, particles: 120, rainy: true };
  }
  if (code === 71 || code === 77 || code === 85) return { ...base, kind: 'snow', clouds: 3, cloudShade: 0.3, particles: 40 };
  if (code === 73) return { ...base, kind: 'snow', clouds: 4, cloudShade: 0.35, particles: 60 };
  if (code === 75 || code === 86) return { ...base, kind: 'snow', clouds: 4, cloudShade: 0.4, particles: 85 };
  if (code === 95 || code === 96 || code === 99) {
    return { ...base, kind: 'storm', clouds: 5, cloudShade: 0.9, particles: 110, rainy: true };
  }
  // Bilinmeyen kod: sakin, bulutlu bir gökyüzü.
  return { ...base, kind: 'cloudy', clouds: 3, cloudShade: 0.3 };
}

export function sceneFor(code: number, isDay: boolean): Scene {
  const c = classify(code);
  return { ...c, isDay, sky: SKY[c.kind][isDay ? 'day' : 'night'] };
}

/**
 * Tekrarlanabilir sözde rastgele sayı (0–1). Sahnedeki damla/yıldız yerleşimi her çizimde aynı
 * kalsın diye sıra numarasından türetilir; Math.random kullanılmaz.
 */
export function seeded(index: number, salt = 0): number {
  let x = (index + 1) * 374761393 + (salt + 1) * 668265263;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
