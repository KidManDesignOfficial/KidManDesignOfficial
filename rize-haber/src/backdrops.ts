/**
 * Sekme arka planları: her sekme için kullanıcının Ayarlar → Arka planlar'dan seçebildiği sahneler.
 * Saf modüldür (React içermez); uygulama ve testler kullanır.
 *
 * Her sekmenin ilk seçeneği o sekmenin özgün sahnesidir (Rize manzarası, maç gecesi stadyumu, sabah
 * çay bahçesi, piyasa ekranı, canlı hava) ve `scene` taşımaz. Diğer seçenekler aşağıdaki katman
 * listesinden (`effects`) `components/Backdrop.tsx` tarafından çizilir.
 *
 * Hava sekmesinin seçenekleri sabit sahne değildir: gökyüzü her zaman o anki havaya göre kalır,
 * seçim yalnızca üzerine çizilen manzarayı (dağ, kıyı) ya da sadeliği değiştirir.
 *
 * Kural: Sekmelerdeki yazılar beyaz ve kartlar camdır. Bu yüzden tüm gökyüzü renkleri ve çerçeve
 * renkleri (üst başlık, alt sekme çubuğu) beyaz yazının okunacağı kadar koyudur (bkz. test/backdrops.test.ts).
 */
import { darken, type SkyChrome } from './weatherScene.ts';

export type BackdropTab = 'news' | 'rizespor' | 'tea' | 'economy' | 'weather';

/** Konumlar ve boyutlar ekranın genişliğine (x, w) ya da yüksekliğine (y, top, bottom) oranla verilir. */
export type Effect =
  /** Güneş, ay ya da ışık kaynağı: hâleli yuvarlak. `rgb` "r,g,b" biçiminde. */
  | { type: 'glow'; x: number; y: number; size: number; rgb: string; core?: string }
  /** Göz kırpan yıldızlar, ekranın üstünden `bottom` oranına kadar. */
  | { type: 'stars'; count: number; bottom: number }
  /** Gökyüzünde yavaşça salınan ışık kuşakları (Samanyolu, şafak tülü). */
  | { type: 'band'; colors: readonly string[]; y: number; height: number; angle: number }
  /** Dağ silueti: `peaks` = [tepe x, yükseklik (taban üstünden), genişlik]. `fill` alttaki boşluğu doldurur. */
  | { type: 'ridge'; color: string; base: number; peaks: readonly (readonly [number, number, number])[]; snow?: boolean; fill?: boolean }
  /** Sırtlarda süzülen sis kuşakları. */
  | { type: 'fog'; y: number; count: number; alpha: number }
  /** Eğik yağmur çizgileri. */
  | { type: 'rain'; count: number }
  /** Ara ara çakan şimşek. */
  | { type: 'lightning' }
  /** Işıldayan deniz kuşağı. */
  | { type: 'sea'; top: number; bottom: number; colors: readonly [string, string] }
  /** Sıra sıra çay dikili tepeler. */
  | { type: 'hills'; top: number; colors: readonly [string, string]; rows: string }
  /** Yumuşak ışık lekeleri: `float` yavaşça yükselir, `twinkle` yerinde göz kırpar. */
  | { type: 'bokeh'; count: number; colors: readonly string[]; size: readonly [number, number]; top: number; bottom: number; mode: 'float' | 'twinkle' }
  /** Yağan konfeti. */
  | { type: 'confetti'; count: number; colors: readonly string[] }
  /** Yükselen zerreler (altın tozu, ateş böceği). */
  | { type: 'motes'; count: number; color: string; size: number; top: number; bottom: number; glow: boolean }
  /** Rüzgârda savrulan yapraklar. */
  | { type: 'leaves'; count: number; colors: readonly string[] }
  /** Bir noktadan yükselen buğu. */
  | { type: 'steam'; x: number; y: number; count: number }
  /** Eğik, ağır ağır kayan şeritler. */
  | { type: 'stripes'; colors: readonly [string, string]; band: number; angle: number }
  /** İnce çizgilerden ağ ve üzerinde akan ışık. */
  | { type: 'grid'; color: string; pulse: string; gap: number }
  /** Pencereleri yanıp sönen şehir silueti. */
  | { type: 'skyline'; color: string; base: number; window: string };

export type BackdropScene = {
  /** Gökyüzü geçişi: üst → alt. Üst başlık ilk rengi alır. */
  sky: readonly string[];
  stops: readonly number[];
  chrome: SkyChrome;
  effects: readonly Effect[];
  /** Kartların arkasındaki okunurluk karartması (0–1). */
  veil: number;
};

export type Backdrop = {
  id: string;
  name: string;
  hint: string;
  /** Ionicons simge adı. */
  icon: string;
  /** Ayarlar'daki küçük renk yuvarlağı. */
  swatch: readonly [string, string];
  /** Yoksa sekmenin özgün sahnesi (ya da Hava'da manzara türü) kullanılır. */
  scene?: BackdropScene;
};

const sade = (sky: readonly [string, string], footer: string): Backdrop => ({
  id: 'sade',
  name: 'Sade',
  hint: 'Yalnızca renk geçişi; hareket yok, en az pil harcar',
  icon: 'contrast-outline',
  swatch: sky,
  scene: { sky, stops: [0, 1], chrome: { header: sky[0], footer }, effects: [], veil: 0 },
});

const NEWS: Backdrop[] = [
  {
    id: 'manzara',
    name: 'Rize manzarası',
    hint: 'Saate göre gündüz, akşam ya da gece; Kaçkarlar, deniz ve çay tepeleri',
    icon: 'image-outline',
    swatch: ['#1D6782', '#1F6040'],
  },
  {
    id: 'gece',
    name: 'Yıldızlı Kaçkar',
    hint: 'Samanyolu altında karlı zirveler ve ay ışığı',
    icon: 'moon-outline',
    swatch: ['#0A1430', '#1A2C4A'],
    scene: {
      sky: ['#02050F', '#08122B', '#122648'],
      stops: [0, 0.4, 0.72],
      chrome: { header: '#02050F', footer: '#060D18' },
      veil: 0.3,
      effects: [
        { type: 'stars', count: 70, bottom: 0.5 },
        { type: 'band', colors: ['rgba(150,170,255,0)', 'rgba(170,180,255,0.16)', 'rgba(255,220,240,0.10)', 'rgba(150,170,255,0)'], y: 0.16, height: 0.16, angle: -18 },
        { type: 'glow', x: 0.82, y: 0.22, size: 180, rgb: '210,220,255', core: '#EEF0E6' },
        { type: 'ridge', color: '#1B2D4C', base: 0.5, snow: true, peaks: [[0.08, 0.12, 0.5], [0.36, 0.2, 0.6], [0.66, 0.15, 0.52], [0.95, 0.18, 0.55]] },
        { type: 'fog', y: 0.4, count: 2, alpha: 0.05 },
        { type: 'ridge', color: '#0C1828', base: 0.6, fill: true, peaks: [[-0.02, 0.08, 0.5], [0.3, 0.06, 0.45], [0.6, 0.1, 0.55], [0.92, 0.07, 0.5]] },
      ],
    },
  },
  {
    id: 'firtina',
    name: 'Karadeniz fırtınası',
    hint: 'Kurşuni gök, eğik yağmur, ara ara çakan şimşek',
    icon: 'thunderstorm-outline',
    swatch: ['#1B2631', '#0E1A23'],
    scene: {
      sky: ['#0A1016', '#16212B', '#26333F'],
      stops: [0, 0.4, 0.62],
      chrome: { header: '#0A1016', footer: '#070E13' },
      veil: 0.25,
      effects: [
        { type: 'fog', y: 0.12, count: 3, alpha: 0.06 },
        { type: 'ridge', color: '#141E27', base: 0.5, peaks: [[0.05, 0.08, 0.5], [0.32, 0.12, 0.55], [0.85, 0.1, 0.5]] },
        { type: 'sea', top: 0.5, bottom: 1, colors: ['#1A2A36', '#0A141B'] },
        { type: 'rain', count: 80 },
        { type: 'lightning' },
      ],
    },
  },
  {
    id: 'sis',
    name: 'Yayla sisi',
    hint: 'Kat kat sırtlar arasında ağır ağır süzülen sis',
    icon: 'cloudy-outline',
    swatch: ['#3A5058', '#24403A'],
    scene: {
      sky: ['#14232C', '#2C434B', '#4A625F'],
      stops: [0, 0.3, 0.5],
      chrome: { header: '#14232C', footer: '#0C1C16' },
      veil: 0.3,
      effects: [
        { type: 'glow', x: 0.25, y: 0.16, size: 200, rgb: '235,240,230' },
        { type: 'ridge', color: '#405A57', base: 0.4, peaks: [[0.1, 0.08, 0.5], [0.45, 0.12, 0.6], [0.85, 0.09, 0.55]] },
        { type: 'fog', y: 0.33, count: 2, alpha: 0.12 },
        { type: 'ridge', color: '#2E4844', base: 0.5, peaks: [[-0.05, 0.08, 0.55], [0.35, 0.06, 0.5], [0.72, 0.1, 0.6]] },
        { type: 'fog', y: 0.44, count: 2, alpha: 0.1 },
        { type: 'ridge', color: '#1F3832', base: 0.62, peaks: [[0.2, 0.09, 0.6], [0.6, 0.06, 0.5], [1.0, 0.08, 0.55]] },
        { type: 'fog', y: 0.57, count: 2, alpha: 0.08 },
        { type: 'ridge', color: '#132A22', base: 0.75, fill: true, peaks: [[-0.1, 0.07, 0.6], [0.4, 0.09, 0.7], [0.9, 0.06, 0.55]] },
      ],
    },
  },
  sade(['#0D2233', '#0A1A14'], '#0A1A14'),
];

const RIZESPOR: Backdrop[] = [
  {
    id: 'stadyum',
    name: 'Maç gecesi',
    hint: 'Projektörler, tribün flaşları ve çim saha; golde havai fişek',
    icon: 'football-outline',
    swatch: ['#0A1E3C', '#0B3B27'],
  },
  {
    id: 'tribun',
    name: 'Tribün ışıkları',
    hint: 'Telefon fenerleri gibi göz kırpan yeşil-mavi ışıklar',
    icon: 'flashlight-outline',
    swatch: ['#082034', '#0A2B2A'],
    scene: {
      sky: ['#030C17', '#082034', '#0A2B2A', '#05160F'],
      stops: [0, 0.35, 0.7, 1],
      chrome: { header: '#030C17', footer: '#05160F' },
      veil: 0.3,
      effects: [
        { type: 'bokeh', count: 14, colors: ['rgba(47,191,113,0.16)', 'rgba(61,139,255,0.16)'], size: [60, 140], top: 0.1, bottom: 0.9, mode: 'float' },
        { type: 'bokeh', count: 46, colors: ['rgba(255,255,255,0.9)', 'rgba(150,230,190,0.9)', 'rgba(150,200,255,0.9)'], size: [2, 4], top: 0.28, bottom: 0.8, mode: 'twinkle' },
      ],
    },
  },
  {
    id: 'konfeti',
    name: 'Konfeti',
    hint: 'Yeşil, mavi ve beyaz konfeti yağmuru',
    icon: 'sparkles-outline',
    swatch: ['#0A2A1E', '#0B2438'],
    scene: {
      sky: ['#04120D', '#0A2A1E', '#0B2438', '#06121F'],
      stops: [0, 0.35, 0.7, 1],
      chrome: { header: '#04120D', footer: '#06121F' },
      veil: 0.3,
      effects: [
        { type: 'glow', x: 0.5, y: 0.02, size: 320, rgb: '120,220,170' },
        { type: 'confetti', count: 34, colors: ['#2FBF71', '#3D8BFF', '#FFFFFF', '#7BE0A6'] },
      ],
    },
  },
  {
    id: 'cubuklu',
    name: 'Yeşil-mavi çubuklar',
    hint: 'Forma çubukları gibi ağır ağır kayan şeritler',
    icon: 'reorder-four-outline',
    swatch: ['#0B4D2C', '#0B2F5C'],
    scene: {
      sky: ['#04101A', '#061A22', '#04140F'],
      stops: [0, 0.5, 1],
      chrome: { header: '#04101A', footer: '#04140F' },
      veil: 0.38,
      effects: [{ type: 'stripes', colors: ['rgba(18,120,66,0.42)', 'rgba(22,78,160,0.42)'], band: 56, angle: -24 }],
    },
  },
  sade(['#082034', '#06251A'], '#06251A'),
];

const TEA: Backdrop[] = [
  {
    id: 'bahce',
    name: 'Sabah çay bahçesi',
    hint: 'Şafak ışığında kat kat çay tarlaları, sis ve yapraklar',
    icon: 'sunny-outline',
    swatch: ['#143D33', '#1B6040'],
  },
  {
    id: 'demlik',
    name: 'Demlik buharı',
    hint: 'Demli çay renginde sıcak zemin, yükselen buğu',
    icon: 'cafe-outline',
    swatch: ['#4A2410', '#2A1309'],
    scene: {
      sky: ['#120804', '#26120A', '#3E1E0E', '#200F07'],
      stops: [0, 0.35, 0.75, 1],
      chrome: { header: '#120804', footer: '#1A0C06' },
      veil: 0.25,
      effects: [
        { type: 'glow', x: 0.5, y: 0.95, size: 420, rgb: '242,150,70' },
        { type: 'steam', x: 0.5, y: 0.92, count: 6 },
        { type: 'motes', count: 12, color: '#F2B35C', size: 2.5, top: 0.3, bottom: 1, glow: false },
      ],
    },
  },
  {
    id: 'hasat',
    name: 'Hasat akşamı',
    hint: 'Gün batımında çay tepeleri ve ateş böcekleri',
    icon: 'partly-sunny-outline',
    swatch: ['#3A2148', '#7A3B3A'],
    scene: {
      sky: ['#0E0B22', '#2A1A40', '#5A2E40', '#6E3A30'],
      stops: [0, 0.22, 0.38, 0.5],
      chrome: { header: '#0E0B22', footer: '#0A1810' },
      veil: 0.3,
      effects: [
        { type: 'stars', count: 18, bottom: 0.25 },
        { type: 'glow', x: 0.3, y: 0.47, size: 300, rgb: '255,160,100', core: '#FFB27A' },
        { type: 'ridge', color: '#2A2338', base: 0.52, peaks: [[0.1, 0.06, 0.5], [0.55, 0.09, 0.6], [0.95, 0.07, 0.5]] },
        { type: 'hills', top: 0.5, colors: ['#1A3020', '#0E1E14'], rows: 'rgba(255,190,140,0.14)' },
        { type: 'motes', count: 16, color: '#E6F28A', size: 3, top: 0.5, bottom: 0.95, glow: true },
      ],
    },
  },
  {
    id: 'yaprak',
    name: 'Yaprak yağmuru',
    hint: 'Koyu yeşil zeminde süzülen çay yaprakları',
    icon: 'leaf-outline',
    swatch: ['#0A2A1B', '#0D3622'],
    scene: {
      sky: ['#03140C', '#0A2A1B', '#0D3622', '#061A10'],
      stops: [0, 0.3, 0.7, 1],
      chrome: { header: '#03140C', footer: '#05160D' },
      veil: 0.28,
      effects: [
        { type: 'bokeh', count: 10, colors: ['rgba(140,220,150,0.10)', 'rgba(200,235,150,0.08)'], size: [70, 160], top: 0, bottom: 1, mode: 'float' },
        { type: 'leaves', count: 16, colors: ['#8FD9A4', '#C9E59A', '#5FBF7A'] },
      ],
    },
  },
  sade(['#0A2722', '#0A2418'], '#0A2418'),
];

const ECONOMY: Backdrop[] = [
  {
    id: 'piyasa',
    name: 'Piyasa ekranı',
    hint: 'Gece mavisi terminal, mum grafiği ve kayan kur bandı',
    icon: 'stats-chart-outline',
    swatch: ['#0A1631', '#0B1D38'],
  },
  {
    id: 'altin',
    name: 'Altın tozu',
    hint: 'Siyah zeminde yükselen altın zerreleri',
    icon: 'diamond-outline',
    swatch: ['#121019', '#3A2E14'],
    scene: {
      sky: ['#060609', '#100E16', '#1A150E', '#0A0907'],
      stops: [0, 0.4, 0.8, 1],
      chrome: { header: '#060609', footer: '#0A0907' },
      veil: 0.25,
      effects: [
        { type: 'glow', x: 0.7, y: 0.05, size: 360, rgb: '242,199,92' },
        { type: 'motes', count: 36, color: '#F2C75C', size: 2.5, top: 0, bottom: 1, glow: true },
      ],
    },
  },
  {
    id: 'ag',
    name: 'Veri ağı',
    hint: 'Üzerinde ışık akan ince çizgilerden bir ağ',
    icon: 'git-network-outline',
    swatch: ['#06202E', '#071A28'],
    scene: {
      sky: ['#020C14', '#062030', '#061A28', '#020A12'],
      stops: [0, 0.35, 0.75, 1],
      chrome: { header: '#020C14', footer: '#020A12' },
      veil: 0.22,
      effects: [{ type: 'grid', color: 'rgba(90,200,255,0.08)', pulse: '#5AC8FF', gap: 44 }],
    },
  },
  {
    id: 'sehir',
    name: 'Şehir ışıkları',
    hint: 'Gece göğü altında pencereleri yanıp sönen binalar',
    icon: 'business-outline',
    swatch: ['#101A3A', '#1C2448'],
    scene: {
      sky: ['#050916', '#0E1834', '#1A2246'],
      stops: [0, 0.4, 0.62],
      chrome: { header: '#050916', footer: '#07090F' },
      veil: 0.3,
      effects: [
        { type: 'stars', count: 30, bottom: 0.4 },
        { type: 'glow', x: 0.5, y: 0.6, size: 420, rgb: '255,190,120' },
        { type: 'skyline', color: '#0A0E1C', base: 0.62, window: '#F7DE9C' },
      ],
    },
  },
  sade(['#050A17', '#061021'], '#061021'),
];

const WEATHER: Backdrop[] = [
  {
    id: 'canli',
    name: 'Canlı hava',
    hint: 'Gökyüzü, bulut, yağmur ve kar o anki havaya göre',
    icon: 'partly-sunny-outline',
    swatch: ['#2F7FD3', '#7DB9EE'],
  },
  {
    id: 'kackar',
    name: 'Kaçkar sırtları',
    hint: 'Aynı canlı hava; arkada karlı dağ silueti',
    icon: 'triangle-outline',
    swatch: ['#3F86C4', '#2A4A5C'],
  },
  {
    id: 'kiyi',
    name: 'Karadeniz kıyısı',
    hint: 'Aynı canlı hava; ufukta deniz ve kıyı',
    icon: 'boat-outline',
    swatch: ['#3F86C4', '#175A72'],
  },
  {
    id: 'sade',
    name: 'Sade gökyüzü',
    hint: 'Yalnızca havanın rengi; bulut, yağmur ve hareket yok',
    icon: 'contrast-outline',
    swatch: ['#56656F', '#8E9AA4'],
  },
];

export const BACKDROPS: Record<BackdropTab, readonly Backdrop[]> = {
  news: NEWS,
  rizespor: RIZESPOR,
  tea: TEA,
  economy: ECONOMY,
  weather: WEATHER,
};

/** Ayarlar'da gösterilme sırası ve sekme adları. */
export const BACKDROP_TABS: readonly { id: BackdropTab; label: string; icon: string }[] = [
  { id: 'news', label: 'Haberler', icon: 'newspaper-outline' },
  { id: 'rizespor', label: 'Rizespor', icon: 'football-outline' },
  { id: 'tea', label: 'Çay', icon: 'leaf-outline' },
  { id: 'economy', label: 'Ekonomi', icon: 'trending-up-outline' },
  { id: 'weather', label: 'Hava', icon: 'partly-sunny-outline' },
];

export type BackdropChoice = Record<BackdropTab, string>;

/** Varsayılan: her sekmede özgün sahne. */
export const DEFAULT_BACKDROPS: BackdropChoice = {
  news: NEWS[0].id,
  rizespor: RIZESPOR[0].id,
  tea: TEA[0].id,
  economy: ECONOMY[0].id,
  weather: WEATHER[0].id,
};

/** Seçili arka plan; bilinmeyen kimlik (eski sürüm, bozuk kayıt) özgün sahneye düşer. */
export function backdropFor(tab: BackdropTab, choice: Partial<BackdropChoice> | null | undefined): Backdrop {
  const list = BACKDROPS[tab];
  return list.find((b) => b.id === choice?.[tab]) ?? list[0];
}

/** Telefonda saklı seçimi güvenli hâle getirir. */
export function sanitizeBackdrops(stored: unknown): BackdropChoice {
  const s = stored && typeof stored === 'object' ? (stored as Partial<BackdropChoice>) : {};
  const out = { ...DEFAULT_BACKDROPS };
  for (const tab of Object.keys(BACKDROPS) as BackdropTab[]) out[tab] = backdropFor(tab, s).id;
  return out;
}

/** Hava sekmesi: seçime göre manzara türü. */
export type WeatherStyle = 'canli' | 'kackar' | 'kiyi' | 'sade';
export function weatherStyle(choice: Partial<BackdropChoice> | null | undefined): WeatherStyle {
  return backdropFor('weather', choice).id as WeatherStyle;
}

/**
 * Hava sekmesinde gökyüzünün önüne çizilen manzara. Renkler gökyüzünün alt renginden koyulaştırılır;
 * böylece güneşli öğlede de fırtınalı gecede de sahneyle uyumlu kalır.
 */
export function weatherLandscape(style: WeatherStyle, sky: readonly [string, string]): Effect[] {
  const low = sky[1];
  if (style === 'kackar') {
    return [
      { type: 'ridge', color: darken(low, 0.3), base: 0.46, snow: true, peaks: [[0.06, 0.1, 0.5], [0.34, 0.17, 0.6], [0.64, 0.12, 0.5], [0.94, 0.15, 0.55]] },
      { type: 'fog', y: 0.38, count: 2, alpha: 0.07 },
      { type: 'ridge', color: darken(low, 0.5), base: 0.56, fill: true, peaks: [[-0.04, 0.07, 0.5], [0.28, 0.05, 0.45], [0.58, 0.09, 0.55], [0.9, 0.06, 0.5]] },
    ];
  }
  if (style === 'kiyi') {
    return [
      { type: 'ridge', color: darken(low, 0.42), base: 0.47, peaks: [[0.08, 0.05, 0.42], [0.3, 0.07, 0.5], [0.86, 0.04, 0.4]] },
      { type: 'sea', top: 0.47, bottom: 1, colors: [darken(low, 0.35), darken(low, 0.62)] },
    ];
  }
  return [];
}
