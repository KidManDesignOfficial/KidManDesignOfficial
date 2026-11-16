/**
 * Resmi kaynak bağlantıları (T.C. Millî Eğitim Bakanlığı ve ÖSYM).
 *
 * Uygulama bu kurumların içeriklerini kopyalamaz; herkese açık resmi sayfaları canlı olarak
 * açar. MEB OGM Materyal içeriklerinin yayın hakları MEB'e aittir ve ticari amaçla kullanılamaz.
 * Bağlantılar `scripts/verify-sources.ts` ile gerçek siteye karşı doğrulanır.
 */

export const OGM = 'https://ogmmateryal.eba.gov.tr';
export const OSYM = 'https://www.osym.gov.tr';

export type MebLink = { label: string; url: string };

/** MEB Konu Özetleri sayfası: `?sinif=<9-12>&ders=<ders adı>` */
export function konuOzetiUrl(sinif: number, ders: string): string {
  return `${OGM}/konu-ozetleri?sinif=${sinif}&ders=${encodeURIComponent(ders)}`;
}

const TDE = 'Türk Dili ve Edebiyatı';
const INKILAP = 'T.C. İnkılap Tarihi ve Atatürkçülük';

/** Her ders için MEB resmi konu özetleri (sınıf, ders adı). */
export const MEB_SUMMARIES: Record<string, [number, string][]> = {
  'tyt-turkce': [[9, TDE], [10, TDE]],
  'tyt-mat': [[9, 'Matematik'], [10, 'Matematik']],
  'tyt-geo': [[9, 'Matematik'], [10, 'Matematik']],
  'tyt-fizik': [[9, 'Fizik'], [10, 'Fizik']],
  'tyt-kimya': [[9, 'Kimya'], [10, 'Kimya']],
  'tyt-biyo': [[9, 'Biyoloji'], [10, 'Biyoloji']],
  'tyt-tarih': [[9, 'Tarih'], [10, 'Tarih'], [12, INKILAP]],
  'tyt-cog': [[9, 'Coğrafya'], [10, 'Coğrafya']],
  'tyt-felsefe': [[10, 'Felsefe'], [11, 'Felsefe']],
  'tyt-din': [],
  'ayt-mat': [[11, 'Matematik'], [12, 'Matematik']],
  'ayt-geo': [[11, 'Matematik'], [12, 'Matematik']],
  'ayt-fizik': [[11, 'Fizik'], [12, 'Fizik']],
  'ayt-kimya': [[11, 'Kimya'], [12, 'Kimya']],
  'ayt-biyo': [[11, 'Biyoloji'], [12, 'Biyoloji']],
  'ayt-edebiyat': [[11, TDE], [12, TDE]],
  'ayt-tarih': [[10, 'Tarih'], [11, 'Tarih'], [12, INKILAP]],
  'ayt-cog': [[11, 'Coğrafya'], [12, 'Coğrafya']],
  'ayt-felsefe': [[11, 'Felsefe']],
  'ayt-din': [],
};

export function mebLinksForSubject(subjectId: string): MebLink[] {
  return (MEB_SUMMARIES[subjectId] ?? []).map(([s, d]) => ({ label: `${s}. sınıf ${d} konu özetleri`, url: konuOzetiUrl(s, d) }));
}

/** MEB YKS hazırlık kaynakları (OGM Materyal → YKS Hazırlık). */
export const MEB_YKS: { id: string; title: string; text: string; icon: string; url: string }[] = [
  { id: 'video', title: 'Video konu anlatımları', text: 'TYT/AYT tüm dersler, PDF ders notlarıyla', icon: 'play-circle', url: `${OGM}/konu-anlatimlari-video` },
  { id: 'ozet', title: 'MEBİ konu özeti kitapları', text: 'TYT ve AYT ders ders özet kitapları', icon: 'book', url: `${OGM}/mebi-konu-ozeti-kitaplari` },
  { id: 'deneme', title: 'MEBİ YKS denemeleri', text: 'Deneme kitapları (indir / incele)', icon: 'document-text', url: `${OGM}/mebi-yks-denemeleri` },
  { id: 'online', title: 'Çevrim içi denemeler', text: 'Soruları aç, video çözümleri izle', icon: 'globe', url: `${OGM}/cevrim-ici-denemeler` },
  { id: 'cikmis-cozum', title: 'Çıkmış soru video çözümleri', text: 'TRT EBA YKS soru çözümleri', icon: 'videocam', url: `${OGM}/yks-cikmis-soru-cozumleri` },
  { id: 'cikmis-kitap', title: 'YKS çıkmış soru kitapları', text: '2018–2026 TYT ve AYT', icon: 'library', url: `${OGM}/yks-cikmis-soru-kitaplari` },
  { id: 'adim', title: '3 Adım soru bankası', text: 'Konu pekiştirme soru bankaları', icon: 'layers', url: `${OGM}/3-adim-soru-bankasi` },
  { id: 'tarama', title: 'MEBİ tarama testi kitapları', text: 'Konu tarama testleri', icon: 'checkbox', url: `${OGM}/mebi-tarama-testi-kitaplari` },
  { id: 'puan', title: 'YKS puan hesaplama motoru', text: 'MEB’in resmi puan hesaplama aracı', icon: 'calculator', url: `${OGM}/yks-puan-hesaplama-motoru` },
  { id: 'hazirlik', title: 'Tüm YKS hazırlık kaynakları', text: 'OGM Materyal YKS Hazırlık sayfası', icon: 'school', url: `${OGM}/yks-hazirlik` },
];

/** ÖSYM canlı veri sayfaları. */
export const OSYM_PAGES = {
  yksAnnouncements: `${OSYM}/SinavGrubu/Index/2`,
  calendar: `${OSYM}/Sayfa/SinavTakvimi`,
  pastPapers: `${OSYM}/SinavGrubu/Menu/323`,
  aday: 'https://ais.osym.gov.tr',
  sonuc: 'https://sonuc.osym.gov.tr',
};
