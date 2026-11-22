/**
 * Rehberlerde ve yorum sitelerinde sık önerilen lokanta, kafe ve pideciler (Kasım 2026'da derlendi).
 *
 * İlke: yalnızca adı ve bilinen yemeği yayımlanmış kaynaklarda açıkça geçen işletmeler alınır; puan, fiyat
 * veya çalışma saati yazılmaz (hızla değişir). Kaynağı tek olanlar `sources` dizisinde tek kayıtla görünür;
 * uygulama bunu kullanıcıya açıkça gösterir. Güncel yorumlar ve saatler için her kartta harita bağlantısı vardır.
 *
 * Konumlar işletmenin kendi adresi değil, bulunduğu ilçe/yayla merkezinin yaklaşık noktasıdır (`approx`);
 * yol tarifi her zaman işletme adıyla harita araması üzerinden yapılır.
 */

export type VenueKind = 'yoresel' | 'balik' | 'pide' | 'kafe';

export const VENUE_KINDS: { id: VenueKind; label: string; icon: string }[] = [
  { id: 'yoresel', label: 'Yöresel lokanta', icon: '🍲' },
  { id: 'balik', label: 'Balık', icon: '🐟' },
  { id: 'pide', label: 'Pide', icon: '🫓' },
  { id: 'kafe', label: 'Kafe', icon: '☕' },
];

export type VenueSource = { label: string; url: string };

export type Venue = {
  id: string;
  name: string;
  district: string;
  /** Yayla/mahalle gibi daha dar bölge (varsa). */
  area?: string;
  kind: VenueKind;
  /** Kaynaklarda öne çıkarılan yemek veya özellikler. */
  knownFor: string[];
  mapsQuery: string;
  lat: number;
  lon: number;
  /** Konum işletmenin değil, bölge merkezinin. */
  approx: true;
  sources: VenueSource[];
};

const TRIPADVISOR_RIZE = 'https://www.tripadvisor.com/Restaurants-g673824-Rize_Rize_Province_Turkish_Black_Sea_Coast.html';
const WANDERLOG_RIZE = 'https://wanderlog.com/list/geoCategory/369244/best-restaurants-to-have-dinner-in-rize';
const KUCUKOTELLER_CAMLIHEMSIN = 'https://www.kucukoteller.com.tr/camlihemsin-ne-yenilir-ne-icilir';
const GUIDE_ISTANBUL = 'https://www.theguideistanbul.com/article/%C3%A7aml%C4%B1hem%C5%9Fin-finding-peace-nature/';
const WANDERLOG_CAMLIHEMSIN = 'https://wanderlog.com/list/geoCategory/201225/where-to-eat-best-restaurants-in-camlihemsin';
const MENUBURADA_PIDE = 'https://menuburada.com/restoranlar/rize-pidecileri';

const MERKEZ = { lat: 41.0201, lon: 40.5234 };
const AYDER = { lat: 40.9507, lon: 41.1031 };

export const VENUES: Venue[] = [
  {
    id: 'liman',
    name: 'Liman Lokantası',
    district: 'Merkez',
    kind: 'yoresel',
    knownFor: ['Laz böreği', 'Kuru fasulye', 'Kavurma', 'Odun ateşinde Karadeniz yemekleri'],
    mapsQuery: 'Liman Lokantası, Rize',
    ...MERKEZ,
    approx: true,
    sources: [
      { label: 'Tripadvisor', url: TRIPADVISOR_RIZE },
      { label: 'Wanderlog', url: WANDERLOG_RIZE },
      { label: 'Trip.com', url: 'https://uk.trip.com/travel-guide/foods/Rize-50106-restaurant/Liman%20Lokantasi-19828190' },
    ],
  },
  {
    id: 'kuzeybalik',
    name: 'Kuzey Balık Lokantası',
    district: 'Merkez',
    kind: 'balik',
    knownFor: ['Izgara hamsi', 'Hamsili pilav', 'Mevsim balıkları'],
    mapsQuery: 'Kuzey Balık Lokantası, Rize',
    ...MERKEZ,
    approx: true,
    sources: [
      { label: 'Trip.com', url: 'https://nz.trip.com/restaurant/trkiye/engindere-mahallesi/detail/kuzey-balik-lokantasi-19828214' },
    ],
  },
  {
    id: 'zumrut',
    name: 'Zümrüt Restoran',
    district: 'Çamlıhemşin',
    area: 'Ayder',
    kind: 'yoresel',
    knownFor: ['Fırtına Deresi alabalığı (ızgara)'],
    mapsQuery: 'Zümrüt Restoran, Ayder, Çamlıhemşin, Rize',
    ...AYDER,
    approx: true,
    sources: [{ label: 'Küçük Oteller', url: KUCUKOTELLER_CAMLIHEMSIN }],
  },
  {
    id: 'kardelen',
    name: 'Kardelen Restoran',
    district: 'Çamlıhemşin',
    area: 'Ayder',
    kind: 'yoresel',
    knownFor: ['Muhlama', 'Yöresel kavurma'],
    mapsQuery: 'Kardelen Restoran, Ayder, Çamlıhemşin, Rize',
    ...AYDER,
    approx: true,
    sources: [{ label: 'Küçük Oteller', url: KUCUKOTELLER_CAMLIHEMSIN }],
  },
  {
    id: 'keyfyemen',
    name: 'Keyf Yemen',
    district: 'Çamlıhemşin',
    area: 'Ayder',
    kind: 'yoresel',
    knownFor: ['Geniş menü', 'Yöresel yemekler'],
    mapsQuery: 'Keyf Yemen, Ayder, Çamlıhemşin, Rize',
    ...AYDER,
    approx: true,
    sources: [
      { label: 'Wanderlog', url: WANDERLOG_CAMLIHEMSIN },
    ],
  },
  {
    id: 'gurgendibi',
    name: 'Gürgendibi Restoran',
    district: 'Çamlıhemşin',
    kind: 'yoresel',
    knownFor: ['Muhlama', 'Çalkama (karalahana)', 'Kahvaltı'],
    mapsQuery: 'Gürgendibi Restoran, Çamlıhemşin, Rize',
    lat: 41.0458,
    lon: 41.0053,
    approx: true,
    sources: [{ label: 'The Guide Istanbul', url: GUIDE_ISTANBUL }],
  },
  {
    id: 'cinciva',
    name: 'Çinçiva Kafe',
    district: 'Çamlıhemşin',
    area: 'Şenyuva',
    kind: 'kafe',
    knownFor: ['Köy kahvehanesinden dönüştürülmüş mekân', 'Karalahana yemekleri', 'Muhlama', 'Köprü manzarası'],
    mapsQuery: 'Çinçiva Kafe, Şenyuva, Çamlıhemşin, Rize',
    lat: 40.9975,
    lon: 40.975,
    approx: true,
    sources: [{ label: 'The Guide Istanbul', url: GUIDE_ISTANBUL }],
  },
  {
    id: 'timya',
    name: 'Timya Pide ve Kebap Salonu',
    district: 'Ardeşen',
    kind: 'pide',
    knownFor: ['Pide', 'Kebap'],
    mapsQuery: 'Timya Pide ve Kebap Salonu, Ardeşen, Rize',
    lat: 41.1911,
    lon: 41.0006,
    approx: true,
    sources: [{ label: 'Menü Burada', url: MENUBURADA_PIDE }],
  },
  {
    id: 'ozgurpide',
    name: 'Özgür Pide',
    district: 'Fındıklı',
    kind: 'pide',
    knownFor: ['Pide'],
    mapsQuery: 'Özgür Pide, Fındıklı, Rize',
    lat: 41.273,
    lon: 41.142,
    approx: true,
    sources: [{ label: 'Menü Burada', url: MENUBURADA_PIDE }],
  },
  {
    id: 'cansupide',
    name: 'Cansu Pide',
    district: 'Fındıklı',
    kind: 'pide',
    knownFor: ['Pide'],
    mapsQuery: 'Cansu Pide, Fındıklı, Rize',
    lat: 41.273,
    lon: 41.142,
    approx: true,
    sources: [{ label: 'Menü Burada', url: MENUBURADA_PIDE }],
  },
];

/** Haritada, verilen noktanın çevresinde serbest arama ("lokanta", "kafe" …). */
export function mapsNearbyUrl(query: string, lat: number, lon: number): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat.toFixed(4)},${lon.toFixed(4)},14z`;
}
