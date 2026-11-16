/**
 * Uygulama genelindeki sabitler: haber kategorileri, hava durumu konumları.
 * Renkler `colors.ts` içindedir.
 * Yeni kategori veya ilçe eklemek için yalnızca bu dosyayı düzenlemek yeterlidir.
 */

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

/**
 * Hava durumu konumları: 12 ilçenin tamamı + Ayder Yaylası. İlçe merkezlerinin koordinatları
 * (harita kaynakları / Wikipedia ile doğrulanmıştır). Tüm ilçelerin listede olması testle denetlenir.
 */
export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: 'merkez', name: 'Rize Merkez', latitude: 41.0201, longitude: 40.5234 },
  { id: 'ardesen', name: 'Ardeşen', latitude: 41.1911, longitude: 41.0006 },
  { id: 'camlihemsin', name: 'Çamlıhemşin', latitude: 41.048, longitude: 41.008 },
  { id: 'cayeli', name: 'Çayeli', latitude: 41.089, longitude: 40.729 },
  { id: 'derepazari', name: 'Derepazarı', latitude: 41.024, longitude: 40.4218 },
  { id: 'findikli', name: 'Fındıklı', latitude: 41.273, longitude: 41.142 },
  { id: 'guneysu', name: 'Güneysu', latitude: 40.985, longitude: 40.61 },
  { id: 'hemsin', name: 'Hemşin', latitude: 41.0503, longitude: 40.9017 },
  { id: 'ikizdere', name: 'İkizdere', latitude: 40.779, longitude: 40.557 },
  { id: 'iyidere', name: 'İyidere', latitude: 41.012, longitude: 40.362 },
  { id: 'kalkandere', name: 'Kalkandere', latitude: 40.9288, longitude: 40.4424 },
  { id: 'pazar', name: 'Pazar', latitude: 41.179, longitude: 40.885 },
  { id: 'ayder', name: 'Ayder Yaylası', latitude: 40.953, longitude: 41.103 },
];

/** Play Store'da ve uygulamada görünen geliştirici bilgileri (haber uygulaması kuralı gereği iletişim zorunludur). */
export const DEVELOPER_NAME = 'KIDMAN';
export const CONTACT_EMAIL = 'cikskral03@gmail.com';
