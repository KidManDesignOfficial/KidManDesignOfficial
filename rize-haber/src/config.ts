/**
 * Uygulama genelindeki sabitler: renkler, haber kategorileri, hava durumu konumları.
 * Yeni kategori veya ilçe eklemek için yalnızca bu dosyayı düzenlemek yeterlidir.
 */

export const COLORS = {
  primary: '#1B6B3A', // Rize çay yeşili
  primaryDark: '#124D29',
  primaryLight: '#E3F1E8',
  background: '#F4F6F5',
  card: '#FFFFFF',
  text: '#16201A',
  textMuted: '#5E6B63',
  border: '#DCE3DE',
  error: '#B3261E',
} as const;

export type NewsCategory = {
  id: string;
  label: string;
  /** Google Haberler arama sorgusu (OR, tırnak ve when: operatörleri desteklenir). */
  query: string;
};

/**
 * Her kategori ayrı bir Google Haberler RSS araması olarak çekilir.
 * `when:7d` son 7 günün haberleriyle sınırlar.
 */
export const NEWS_CATEGORIES: NewsCategory[] = [
  { id: 'all', label: 'Tümü', query: 'Rize when:7d' },
  { id: 'gundem', label: 'Gündem', query: 'Rize (valilik OR belediye OR vali OR başkan) when:7d' },
  { id: 'spor', label: 'Spor', query: '"Çaykur Rizespor" OR Rizespor when:7d' },
  { id: 'ekonomi', label: 'Ekonomi', query: 'Rize (çay OR ÇAYKUR OR fındık OR liman OR ekonomi) when:7d' },
  { id: 'asayis', label: 'Asayiş', query: 'Rize (kaza OR polis OR jandarma OR yangın OR heyelan) when:7d' },
  {
    id: 'ilceler',
    label: 'İlçeler',
    query:
      '(Çayeli OR Ardeşen OR Fındıklı OR Güneysu OR İkizdere OR Çamlıhemşin OR Kalkandere OR İyidere OR Derepazarı OR Hemşin OR "Pazar Rize") when:7d',
  },
];

export function googleNewsRssUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&ceid=TR:tr`;
}

export type WeatherLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

/** İlçe merkezlerinin yaklaşık koordinatları. */
export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: 'merkez', name: 'Rize Merkez', latitude: 41.0201, longitude: 40.5234 },
  { id: 'cayeli', name: 'Çayeli', latitude: 41.089, longitude: 40.729 },
  { id: 'pazar', name: 'Pazar', latitude: 41.179, longitude: 40.885 },
  { id: 'ardesen', name: 'Ardeşen', latitude: 41.1911, longitude: 41.0006 },
  { id: 'findikli', name: 'Fındıklı', latitude: 41.273, longitude: 41.142 },
  { id: 'guneysu', name: 'Güneysu', latitude: 40.985, longitude: 40.61 },
  { id: 'ikizdere', name: 'İkizdere', latitude: 40.779, longitude: 40.557 },
  { id: 'camlihemsin', name: 'Çamlıhemşin', latitude: 41.048, longitude: 41.008 },
  { id: 'ayder', name: 'Ayder Yaylası', latitude: 40.953, longitude: 41.103 },
];
