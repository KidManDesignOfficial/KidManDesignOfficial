/**
 * Rize bilgi sayfası içeriği.
 *
 * Bilgiler aşağıdaki resmî kaynaklardan derlenmiş ve özetlenmiştir; metin birebir alıntı değildir.
 * Kaynakların birbirinden farklı bilgi verdiği yerler `note` alanında açıkça belirtilmiştir.
 * İçerik güncellenirken her maddenin bir resmî kaynağa dayandığından emin olun.
 */

export type TimelineEntry = {
  period: string;
  title: string;
  text: string;
  note?: string;
};

export const RIZE_FACTS: { label: string; value: string }[] = [
  { label: 'Plaka kodu', value: '53' },
  { label: 'İlçe sayısı (merkez dahil)', value: '12' },
  { label: 'Bölge', value: 'Doğu Karadeniz' },
  { label: 'Kurtuluş günü', value: '2 Mart 1918' },
];

export const RIZE_DISTRICTS = [
  'Merkez',
  'Ardeşen',
  'Çamlıhemşin',
  'Çayeli',
  'Derepazarı',
  'Fındıklı',
  'Güneysu',
  'Hemşin',
  'İkizdere',
  'İyidere',
  'Kalkandere',
  'Pazar',
];

export const RIZE_NAME_ORIGIN =
  'Rize adının kökeni konusunda farklı görüşler vardır. Rize Valiliği, adın Rumcada “dağ eteği” anlamında ' +
  'kullanılan “Riza” sözcüğünden geldiğini belirtir. Diğer bir görüşe göre ad, pirinç anlamına gelen ' +
  '“Rhisos” ya da insanların toplandığı yeri ifade eden “Rhizion” sözcüklerinden türemiştir.';

export const RIZE_HISTORY: TimelineEntry[] = [
  {
    period: 'Antik Çağ',
    title: 'İlk yazılı kayıtlar',
    text:
      'Bölgenin adı yazılı kaynaklarda ilk kez MÖ 8. yüzyılda geçer. Rize, antik dönemde Kolkhis olarak ' +
      'anılan bölgenin içinde yer alır. Yoğun orman örtüsü nedeniyle bu döneme ait arkeolojik bulgu sınırlıdır.',
  },
  {
    period: 'MÖ 180',
    title: 'Pontus Krallığı',
    text: 'Pontus Kralı Farnakes, MÖ 180 yılında Rize’yi krallığının topraklarına kattı.',
  },
  {
    period: 'Roma ve Bizans',
    title: 'Roma ve Doğu Roma dönemi',
    text:
      'Pontus Krallığı’nın yıkılmasıyla bölge Roma yönetimine geçti. Roma İmparatorluğu’nun 395 yılında ' +
      'ikiye ayrılmasının ardından Rize, Doğu Roma (Bizans) topraklarında kaldı.',
    note: 'Roma hâkimiyetinin başlangıcı için kaynaklarda MÖ 66 ve MS 10 gibi farklı tarihler geçer.',
  },
  {
    period: '1204',
    title: 'Trabzon Rum İmparatorluğu',
    text:
      'Dördüncü Haçlı Seferi’nin ardından Komnenos hanedanı Trabzon merkezli bir devlet kurdu. Rize bu devletin ' +
      'sınırları içinde, bir yönetim merkezi olarak kaldı.',
  },
  {
    period: '1461',
    title: 'Osmanlı dönemi',
    text:
      'Fatih Sultan Mehmet’in 1461’de Trabzon’u fethetmesiyle Rize de savaşsız olarak Osmanlı topraklarına ' +
      'katıldı ve Trabzon Sancağı’na bağlı bir kaza oldu. Rize’nin fethi her yıl törenlerle anılır.',
    note: 'Bazı kaynaklar Rize’nin 1470’te Ali Paşa komutasında Osmanlı egemenliğine girdiğini yazar.',
  },
  {
    period: '1878',
    title: 'Lazistan Sancağı’nın merkezi',
    text:
      '1878 Berlin Antlaşması ile Lazistan Sancağı’nın merkezi Batum Rusya’ya bırakılınca, sancağın merkezi Rize oldu.',
  },
  {
    period: '1916 – 1918',
    title: 'Rus işgali ve kurtuluş',
    text:
      'Birinci Dünya Savaşı sırasında Mart 1916’da Rus ordusu tarafından işgal edilen Rize, 2 Mart 1918’de ' +
      'işgalden kurtuldu. 2 Mart her yıl Rize’nin kurtuluş günü olarak kutlanır.',
    note: 'İşgal tarihi Rize Valiliği’nde 9 Mart 1916, Rize Belediyesi’nde 6 Mart 1916 olarak geçer.',
  },
  {
    period: '1923 – 1924',
    title: 'Cumhuriyet dönemi',
    text:
      '29 Kasım 1923’te Lazistan adının yerine resmî olarak Rize adı kabul edildi; Rize 20 Nisan 1924’te ' +
      'vilayet oldu. Mustafa Kemal Atatürk, 17 Eylül 1924’te Rize’yi ziyaret etti.',
  },
];

export const TEA_HISTORY: TimelineEntry[] = [
  {
    period: '1923',
    title: 'İlk fidanlık',
    text:
      'Ziraat Umum Müfettişi Zihni Derin, çay tarımını başlatmak üzere Rize’ye geldi ve fidanlık kurulmasına öncülük etti.',
  },
  {
    period: '6 Şubat 1924',
    title: '407 sayılı Kanun',
    text:
      'TBMM, Rize ve Borçka’da çay yetiştirilmesini yasal güvenceye alan 407 sayılı Kanun’u kabul etti. ' +
      'Türkiye’de çay tarımı bu kanunla resmen başladı.',
  },
  {
    period: '1947',
    title: 'İlk çay fabrikası',
    text: 'Günlük 60 ton yaş çay işleme kapasiteli ilk fabrika, Rize Fener Mahallesi’nde açıldı.',
    note: 'ÇAYKUR’un bir yayınında açılış yılı 1946 olarak geçer.',
  },
  {
    period: '1971 – 1973',
    title: 'Çay Kurumu',
    text:
      '4 Aralık 1971’de 1497 sayılı Çay Kurumu Kanunu yürürlüğe girdi; kurum 1973’te Rize’de faaliyete başladı.',
  },
  {
    period: '1983',
    title: 'ÇAYKUR',
    text: 'Kurumun adı Çay İşletmeleri Genel Müdürlüğü (ÇAYKUR) olarak değiştirildi.',
  },
];

export const RIZE_SOURCES: { label: string; url: string }[] = [
  { label: 'Rize Valiliği – Rize’nin Tarihçesi', url: 'https://www.rize.gov.tr/rizenin-tarihcesi' },
  { label: 'Rize İl Kültür ve Turizm Müdürlüğü – Tarihçe', url: 'https://rize.ktb.gov.tr/TR-55291/tarihce.html' },
  { label: 'Rize Belediyesi – Tarihçe', url: 'https://www.rize.bel.tr/icerik/tarihce' },
  { label: 'ÇAYKUR – Kurum Tarihçesi', url: 'https://www.caykur.gov.tr/Pages/Kurumsal/KurumHakkinda.aspx?ItemId=6' },
];
