/**
 * YKS ders ve konu kataloğu.
 *
 * Konu başlıkları ÖSYM'nin YKS kapsamını ve MEB ortaöğretim öğretim programlarını izler.
 * Soru sayıları son yılların YKS dağılımına göre verilmiştir; ÖSYM her yıl kılavuzda
 * dağılımı yeniden yayımlar, sınav öncesi kılavuzla karşılaştırılmalıdır.
 *
 * Konu kimliği = `<ders kimliği>.<kısa ad>`; içerik dosyaları bu kimlikle bağlanır.
 */
import type { Field, Subject, TopicMeta } from './types.ts';

const ALL: Field[] = ['SAY', 'EA', 'SOZ', 'DIL'];

function topics(subjectId: string, list: [string, string][]): TopicMeta[] {
  return list.map(([slug, title]) => ({ id: `${subjectId}.${slug}`, title }));
}

function subject(s: Omit<Subject, 'topics'>, list: [string, string][]): Subject {
  return { ...s, topics: topics(s.id, list) };
}

export const SUBJECTS: Subject[] = [
  // ───────────────────────────── TYT ─────────────────────────────
  subject(
    { id: 'tyt-turkce', exam: 'TYT', name: 'Türkçe', short: 'Türkçe', icon: 'book', colors: ['#F43F5E', '#BE123C'], examQuestions: 40, test: 'Türkçe', fields: ALL },
    [
      ['sozcukte-anlam', 'Sözcükte Anlam'],
      ['soz-yorumu', 'Söz Yorumu, Deyim ve Atasözleri'],
      ['cumlede-anlam', 'Cümlede Anlam'],
      ['paragraf', 'Paragrafta Anlam ve Yapı'],
      ['ses-bilgisi', 'Ses Bilgisi'],
      ['yazim', 'Yazım Kuralları'],
      ['noktalama', 'Noktalama İşaretleri'],
      ['sozcukte-yapi', 'Sözcükte Yapı (Kök ve Ekler)'],
      ['isim-sifat', 'İsimler ve Sıfatlar'],
      ['zamir-zarf', 'Zamirler ve Zarflar'],
      ['edat-baglac', 'Edat, Bağlaç ve Ünlem'],
      ['fiiller', 'Fiiller (Kip, Kişi, Yapı)'],
      ['ek-fiil', 'Ek Fiil'],
      ['fiilimsi', 'Fiilimsiler'],
      ['ogeler', 'Cümlenin Ögeleri'],
      ['cumle-turleri', 'Cümle Türleri'],
      ['cati', 'Fiilde Çatı'],
      ['anlatim-bozuklugu', 'Anlatım Bozuklukları'],
    ],
  ),
  subject(
    { id: 'tyt-mat', exam: 'TYT', name: 'Matematik', short: 'Mat', icon: 'calculator', colors: ['#6366F1', '#4338CA'], examQuestions: 30, test: 'Temel Matematik', fields: ALL },
    [
      ['temel-kavramlar', 'Temel Kavramlar ve Sayılar'],
      ['basamak', 'Sayı Basamakları'],
      ['bolunebilme', 'Bölme ve Bölünebilme'],
      ['ebob-ekok', 'EBOB – EKOK'],
      ['rasyonel', 'Rasyonel ve Ondalık Sayılar'],
      ['esitsizlik', 'Basit Eşitsizlikler'],
      ['mutlak-deger', 'Mutlak Değer'],
      ['uslu', 'Üslü Sayılar'],
      ['koklu', 'Köklü Sayılar'],
      ['carpanlara-ayirma', 'Çarpanlara Ayırma'],
      ['oran-oranti', 'Oran – Orantı'],
      ['denklem', 'Birinci Dereceden Denklemler'],
      ['sayi-problemleri', 'Sayı ve Kesir Problemleri'],
      ['yas-problemleri', 'Yaş Problemleri'],
      ['yuzde-kar-zarar', 'Yüzde, Kâr – Zarar Problemleri'],
      ['karisim', 'Karışım Problemleri'],
      ['hareket', 'Hareket ve İşçi Problemleri'],
      ['kumeler', 'Kümeler ve Kartezyen Çarpım'],
      ['mantik', 'Mantık'],
      ['fonksiyon', 'Fonksiyonlar'],
      ['polinom', 'Polinomlar'],
      ['ikinci-derece', 'İkinci Dereceden Denklemler'],
      ['permutasyon', 'Permütasyon ve Kombinasyon'],
      ['olasilik', 'Olasılık'],
      ['veri', 'Veri, İstatistik ve Grafikler'],
    ],
  ),
  subject(
    { id: 'tyt-geo', exam: 'TYT', name: 'Geometri', short: 'Geo', icon: 'shapes', colors: ['#8B5CF6', '#6D28D9'], examQuestions: 10, test: 'Temel Matematik', fields: ALL },
    [
      ['acilar', 'Doğruda ve Üçgende Açılar'],
      ['dik-ucgen', 'Dik Üçgen ve Pisagor'],
      ['ozel-ucgenler', 'Özel Üçgenler'],
      ['ucgende-alan', 'Üçgende Alan'],
      ['benzerlik', 'Üçgende Benzerlik'],
      ['aciortay-kenarortay', 'Açıortay ve Kenarortay'],
      ['cokgenler', 'Çokgenler'],
      ['dortgenler', 'Dörtgenler'],
      ['cember', 'Çember ve Daire'],
      ['analitik', 'Noktanın ve Doğrunun Analitiği'],
      ['kati-cisimler', 'Katı Cisimler'],
    ],
  ),
  subject(
    { id: 'tyt-fizik', exam: 'TYT', name: 'Fizik', short: 'Fizik', icon: 'magnet', colors: ['#0EA5E9', '#0369A1'], examQuestions: 7, test: 'Fen Bilimleri', fields: ALL },
    [
      ['giris', 'Fizik Bilimine Giriş'],
      ['madde', 'Madde ve Özellikleri'],
      ['hareket-kuvvet', 'Hareket ve Kuvvet'],
      ['enerji', 'İş, Güç ve Enerji'],
      ['isi-sicaklik', 'Isı, Sıcaklık ve Genleşme'],
      ['basinc', 'Basınç ve Kaldırma Kuvveti'],
      ['elektrostatik', 'Elektrostatik'],
      ['elektrik-akimi', 'Elektrik Akımı ve Devreler'],
      ['manyetizma', 'Mıknatıs ve Manyetizma'],
      ['dalgalar', 'Dalgalar'],
      ['optik', 'Optik'],
    ],
  ),
  subject(
    { id: 'tyt-kimya', exam: 'TYT', name: 'Kimya', short: 'Kimya', icon: 'flask', colors: ['#10B981', '#047857'], examQuestions: 7, test: 'Fen Bilimleri', fields: ALL },
    [
      ['kimya-bilimi', 'Kimya Bilimi'],
      ['atom-periyodik', 'Atom ve Periyodik Sistem'],
      ['etkilesimler', 'Kimyasal Türler Arası Etkileşimler'],
      ['maddenin-halleri', 'Maddenin Halleri'],
      ['doga-kimya', 'Doğa ve Kimya'],
      ['kanunlar', 'Kimyanın Temel Kanunları'],
      ['mol', 'Mol Kavramı'],
      ['tepkimeler', 'Kimyasal Tepkimeler ve Hesaplamalar'],
      ['karisimlar', 'Karışımlar'],
      ['asit-baz', 'Asitler, Bazlar ve Tuzlar'],
      ['her-yerde', 'Kimya Her Yerde'],
    ],
  ),
  subject(
    { id: 'tyt-biyo', exam: 'TYT', name: 'Biyoloji', short: 'Biyo', icon: 'leaf', colors: ['#84CC16', '#4D7C0F'], examQuestions: 6, test: 'Fen Bilimleri', fields: ALL },
    [
      ['ortak-ozellikler', 'Canlıların Ortak Özellikleri'],
      ['temel-bilesenler', 'Canlıların Temel Bileşenleri'],
      ['hucre', 'Hücre ve Organeller'],
      ['madde-gecisi', 'Hücre Zarından Madde Geçişi'],
      ['siniflandirma', 'Canlıların Sınıflandırılması'],
      ['bolunmeler', 'Mitoz ve Mayoz Bölünme'],
      ['ureme', 'Eşeyli ve Eşeysiz Üreme'],
      ['kalitim', 'Kalıtım'],
      ['ekosistem', 'Ekosistem Ekolojisi'],
      ['cevre-sorunlari', 'Güncel Çevre Sorunları'],
    ],
  ),
  subject(
    { id: 'tyt-tarih', exam: 'TYT', name: 'Tarih', short: 'Tarih', icon: 'hourglass', colors: ['#F59E0B', '#B45309'], examQuestions: 5, test: 'Sosyal Bilimler', fields: ALL },
    [
      ['tarih-zaman', 'Tarih ve Zaman'],
      ['ilk-cag', 'İnsanlığın İlk Dönemleri'],
      ['orta-cag', 'Orta Çağ’da Dünya'],
      ['ilk-turk', 'İlk ve Orta Çağlarda Türk Dünyası'],
      ['islam', 'İslam Medeniyetinin Doğuşu'],
      ['turk-islam', 'İlk Türk-İslam Devletleri'],
      ['selcuklu', 'Selçuklu Türkiyesi'],
      ['osmanli-kurulus', 'Beylikten Devlete Osmanlı'],
      ['osmanli-dunya', 'Dünya Gücü Osmanlı'],
      ['degisim-cagi', 'Değişim Çağında Avrupa ve Osmanlı'],
      ['denge', 'Uluslararası İlişkilerde Denge (1774–1914)'],
      ['xx-yuzyil', 'XX. Yüzyıl Başlarında Osmanlı'],
      ['milli-mucadele', 'Millî Mücadele'],
      ['ataturkculuk', 'Atatürkçülük ve Türk İnkılabı'],
    ],
  ),
  subject(
    { id: 'tyt-cog', exam: 'TYT', name: 'Coğrafya', short: 'Coğ', icon: 'earth', colors: ['#14B8A6', '#0F766E'], examQuestions: 5, test: 'Sosyal Bilimler', fields: ALL },
    [
      ['doga-insan', 'Doğa ve İnsan'],
      ['dunya-hareketleri', 'Dünya’nın Şekli ve Hareketleri'],
      ['konum', 'Coğrafi Konum'],
      ['harita', 'Harita Bilgisi'],
      ['iklim', 'Atmosfer ve İklim'],
      ['yer-sekilleri', 'İç ve Dış Kuvvetler'],
      ['su-toprak-bitki', 'Su, Toprak ve Bitki Örtüsü'],
      ['nufus', 'Nüfus'],
      ['goc', 'Göç'],
      ['yerlesme', 'Yerleşme'],
      ['ekonomik', 'Ekonomik Faaliyetler'],
      ['bolgeler', 'Bölgeler ve Uluslararası Ulaşım'],
      ['afetler', 'Doğal Afetler'],
    ],
  ),
  subject(
    { id: 'tyt-felsefe', exam: 'TYT', name: 'Felsefe', short: 'Fels', icon: 'bulb', colors: ['#A855F7', '#7E22CE'], examQuestions: 5, test: 'Sosyal Bilimler', fields: ALL },
    [
      ['felsefeyi-tanima', 'Felsefeyi Tanıma'],
      ['bilgi', 'Bilgi Felsefesi'],
      ['varlik', 'Varlık Felsefesi'],
      ['ahlak', 'Ahlak Felsefesi'],
      ['sanat', 'Sanat Felsefesi'],
      ['din-felsefesi', 'Din Felsefesi'],
      ['siyaset', 'Siyaset Felsefesi'],
      ['bilim', 'Bilim Felsefesi'],
    ],
  ),
  subject(
    { id: 'tyt-din', exam: 'TYT', name: 'Din Kültürü', short: 'Din', icon: 'moon', colors: ['#06B6D4', '#0E7490'], examQuestions: 5, test: 'Sosyal Bilimler', fields: ALL },
    [
      ['bilgi-inanc', 'Bilgi ve İnanç'],
      ['din-islam', 'Din ve İslam'],
      ['ibadet', 'İslam ve İbadet'],
      ['ahlak', 'Ahlak ve Değerler'],
      ['hz-muhammed', 'Hz. Muhammed’in Hayatı'],
      ['vahiy-akil', 'Vahiy ve Akıl'],
      ['yorumlar', 'İslam Düşüncesinde Yorumlar'],
    ],
  ),

  // ───────────────────────────── AYT ─────────────────────────────
  subject(
    { id: 'ayt-mat', exam: 'AYT', name: 'Matematik', short: 'Mat', icon: 'infinite', colors: ['#4F46E5', '#312E81'], examQuestions: 30, test: 'Matematik', fields: ['SAY', 'EA'] },
    [
      ['fonksiyon', 'Fonksiyonlarda Uygulamalar'],
      ['polinom', 'Polinomlar'],
      ['ikinci-derece', 'İkinci Dereceden Denklem ve Eşitsizlikler'],
      ['parabol', 'Parabol'],
      ['trigonometri', 'Trigonometri'],
      ['logaritma', 'Üstel ve Logaritmik Fonksiyonlar'],
      ['diziler', 'Diziler'],
      ['limit', 'Limit ve Süreklilik'],
      ['turev', 'Türev'],
      ['integral', 'İntegral'],
      ['kombinasyon', 'Permütasyon, Kombinasyon ve Binom'],
      ['olasilik', 'Koşullu Olasılık'],
    ],
  ),
  subject(
    { id: 'ayt-geo', exam: 'AYT', name: 'Geometri', short: 'Geo', icon: 'triangle', colors: ['#7C3AED', '#4C1D95'], examQuestions: 10, test: 'Matematik', fields: ['SAY', 'EA'] },
    [
      ['ucgenler', 'Üçgenler (Tekrar ve İleri)'],
      ['cokgen-dortgen', 'Çokgenler ve Dörtgenler'],
      ['cember-daire', 'Çember ve Daire'],
      ['dogru-analitik', 'Doğrunun Analitik İncelenmesi'],
      ['donusumler', 'Dönüşüm Geometrisi'],
      ['cember-analitik', 'Çemberin Analitik İncelenmesi'],
      ['kati-cisimler', 'Katı Cisimler'],
    ],
  ),
  subject(
    { id: 'ayt-fizik', exam: 'AYT', name: 'Fizik', short: 'Fizik', icon: 'planet', colors: ['#0284C7', '#0C4A6E'], examQuestions: 14, test: 'Fen Bilimleri', fields: ['SAY'] },
    [
      ['vektorler', 'Vektörler ve Bağıl Hareket'],
      ['newton', 'Newton’un Hareket Yasaları'],
      ['sabit-ivme', 'Sabit İvmeli Hareket ve Atışlar'],
      ['enerji-hareket', 'Enerji ve Hareket'],
      ['momentum', 'İtme ve Momentum'],
      ['tork-denge', 'Tork, Denge ve Kütle Merkezi'],
      ['basit-makineler', 'Basit Makineler'],
      ['elektrik-alan', 'Elektriksel Kuvvet, Alan ve Potansiyel'],
      ['kondansator', 'Kondansatörler'],
      ['induksiyon', 'Manyetizma ve Elektromanyetik İndükleme'],
      ['alternatif-akim', 'Alternatif Akım ve Transformatörler'],
      ['cembersel', 'Düzgün Çembersel Hareket'],
      ['bhh', 'Basit Harmonik Hareket'],
      ['dalga-mekanigi', 'Dalga Mekaniği'],
      ['atom-fizigi', 'Atom Fiziği ve Radyoaktivite'],
      ['modern-fizik', 'Modern Fizik ve Uygulamaları'],
    ],
  ),
  subject(
    { id: 'ayt-kimya', exam: 'AYT', name: 'Kimya', short: 'Kimya', icon: 'beaker', colors: ['#059669', '#064E3B'], examQuestions: 13, test: 'Fen Bilimleri', fields: ['SAY'] },
    [
      ['modern-atom', 'Modern Atom Teorisi'],
      ['gazlar', 'Gazlar'],
      ['cozeltiler', 'Sıvı Çözeltiler ve Çözünürlük'],
      ['enerji', 'Kimyasal Tepkimelerde Enerji'],
      ['hiz', 'Kimyasal Tepkimelerde Hız'],
      ['denge', 'Kimyasal Denge'],
      ['asit-baz-denge', 'Asit-Baz ve Çözünürlük Dengesi'],
      ['elektrokimya', 'Kimya ve Elektrik'],
      ['karbon', 'Karbon Kimyasına Giriş'],
      ['organik', 'Organik Bileşikler'],
      ['enerji-kaynaklari', 'Enerji Kaynakları ve Bilimsel Gelişmeler'],
    ],
  ),
  subject(
    { id: 'ayt-biyo', exam: 'AYT', name: 'Biyoloji', short: 'Biyo', icon: 'fitness', colors: ['#65A30D', '#365314'], examQuestions: 13, test: 'Fen Bilimleri', fields: ['SAY'] },
    [
      ['sinir', 'Sinir Sistemi'],
      ['endokrin', 'Endokrin Sistem'],
      ['duyu', 'Duyu Organları'],
      ['destek-hareket', 'Destek ve Hareket Sistemi'],
      ['sindirim', 'Sindirim Sistemi'],
      ['dolasim', 'Dolaşım ve Bağışıklık Sistemi'],
      ['solunum', 'Solunum Sistemi'],
      ['bosaltim', 'Boşaltım Sistemi'],
      ['ureme-sistemi', 'Üreme Sistemi ve Embriyonik Gelişim'],
      ['komunite', 'Komünite ve Popülasyon Ekolojisi'],
      ['nukleik-asit', 'Nükleik Asitler ve Protein Sentezi'],
      ['biyoteknoloji', 'Genetik Mühendisliği ve Biyoteknoloji'],
      ['enerji', 'Canlılık ve Enerji: Fotosentez, Solunum'],
      ['bitki', 'Bitki Biyolojisi'],
    ],
  ),
  subject(
    { id: 'ayt-edebiyat', exam: 'AYT', name: 'Türk Dili ve Edebiyatı', short: 'Edb', icon: 'library', colors: ['#E11D48', '#881337'], examQuestions: 24, test: 'TDE – Sosyal-1', fields: ['EA', 'SOZ'] },
    [
      ['siir-bilgisi', 'Şiir Bilgisi: Nazım Birimi, Ölçü, Uyak'],
      ['soz-sanatlari', 'Söz Sanatları'],
      ['islamiyet-oncesi', 'İslamiyet Öncesi Türk Edebiyatı'],
      ['gecis', 'Geçiş Dönemi Eserleri'],
      ['halk', 'Halk Edebiyatı'],
      ['divan', 'Divan Edebiyatı'],
      ['tanzimat', 'Tanzimat Edebiyatı'],
      ['servet-i-funun', 'Servet-i Fünun ve Fecr-i Âti'],
      ['milli', 'Millî Edebiyat'],
      ['cumhuriyet', 'Cumhuriyet Dönemi Türk Edebiyatı'],
      ['akimlar', 'Edebî Akımlar'],
      ['turler', 'Roman, Hikâye, Tiyatro ve Öğretici Metinler'],
    ],
  ),
  subject(
    { id: 'ayt-tarih', exam: 'AYT', name: 'Tarih', short: 'Tarih', icon: 'flag', colors: ['#D97706', '#78350F'], examQuestions: 21, test: 'TDE – Sosyal-1 / Sosyal-2', fields: ['EA', 'SOZ'] },
    [
      ['tarih-bilimi', 'Tarih Bilimi ve Uygarlıklar'],
      ['turk-islam', 'Türk-İslam Devletleri'],
      ['osmanli-siyaset', 'Osmanlı Siyaseti (1302–1774)'],
      ['osmanli-kultur', 'Osmanlı Devlet Yapısı ve Kültürü'],
      ['en-uzun-yuzyil', 'En Uzun Yüzyıl (1789–1914)'],
      ['birinci-dunya', 'I. Dünya Savaşı'],
      ['milli-mucadele', 'Millî Mücadele'],
      ['ataturk-donemi', 'Atatürk Dönemi İç ve Dış Politika'],
      ['iki-savas-arasi', 'İki Savaş Arası Dönem ve II. Dünya Savaşı'],
      ['soguk-savas', 'Soğuk Savaş ve Yumuşama Dönemi'],
      ['kuresellesme', 'Küreselleşen Dünya'],
    ],
  ),
  subject(
    { id: 'ayt-cog', exam: 'AYT', name: 'Coğrafya', short: 'Coğ', icon: 'map', colors: ['#0D9488', '#134E4A'], examQuestions: 17, test: 'TDE – Sosyal-1 / Sosyal-2', fields: ['EA', 'SOZ'] },
    [
      ['ekosistem', 'Ekosistemler ve Biyoçeşitlilik'],
      ['nufus-politikalari', 'Nüfus Politikaları'],
      ['turkiye-nufus', 'Türkiye’de Nüfus ve Yerleşme'],
      ['ekonomi', 'Ekonomik Faaliyetler ve Doğal Kaynaklar'],
      ['tarim-hayvancilik', 'Türkiye’de Tarım ve Hayvancılık'],
      ['enerji-sanayi', 'Türkiye’de Madenler, Enerji ve Sanayi'],
      ['ulasim-ticaret', 'Ulaşım, Ticaret ve Turizm'],
      ['bolgesel-kalkinma', 'Bölgesel Kalkınma Projeleri'],
      ['kultur-bolgeleri', 'Kültür Bölgeleri ve Küresel Ortam'],
      ['cevre-toplum', 'Çevre ve Toplum'],
    ],
  ),
  subject(
    { id: 'ayt-felsefe', exam: 'AYT', name: 'Felsefe Grubu', short: 'FelsG', icon: 'people', colors: ['#9333EA', '#581C87'], examQuestions: 12, test: 'Sosyal Bilimler-2', fields: ['SOZ'] },
    [
      ['mantik-klasik', 'Mantık: Klasik Mantık'],
      ['mantik-sembolik', 'Mantık: Sembolik Mantık'],
      ['psikoloji', 'Psikoloji: Temel Süreçler'],
      ['ogrenme-bellek', 'Psikoloji: Öğrenme, Bellek, Düşünme'],
      ['sosyoloji', 'Sosyoloji: Birey ve Toplum'],
      ['kurumlar', 'Sosyoloji: Toplumsal Kurumlar ve Değişme'],
      ['felsefe-tarihi', 'Felsefe Tarihi (MÖ 6. yy – 20. yy)'],
    ],
  ),
  subject(
    { id: 'ayt-din', exam: 'AYT', name: 'Din Kültürü', short: 'Din', icon: 'star', colors: ['#0891B2', '#164E63'], examQuestions: 6, test: 'Sosyal Bilimler-2', fields: ['SOZ'] },
    [
      ['dunya-ahiret', 'Dünya ve Ahiret'],
      ['kuran-hz-muhammed', 'Kur’an’a Göre Hz. Muhammed'],
      ['kavramlar', 'Kur’an’da Bazı Kavramlar'],
      ['inanc-meseleleri', 'İnançla İlgili Meseleler'],
      ['diger-dinler', 'Yahudilik, Hristiyanlık, Hint ve Çin Dinleri'],
      ['islam-bilim', 'İslam ve Bilim'],
      ['anadolu-islam', 'Anadolu’da İslam ve Tasavvufi Yorumlar'],
    ],
  ),
];

export const SUBJECT_BY_ID: Record<string, Subject> = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

export function subjectOfTopic(topicId: string): Subject | undefined {
  return SUBJECT_BY_ID[topicId.split('.')[0]];
}

export function topicTitle(topicId: string): string {
  return subjectOfTopic(topicId)?.topics.find((t) => t.id === topicId)?.title ?? topicId;
}

export const FIELD_LABELS: Record<Field, string> = {
  SAY: 'Sayısal',
  EA: 'Eşit Ağırlık',
  SOZ: 'Sözel',
  DIL: 'Dil',
};
