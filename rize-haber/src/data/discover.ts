/**
 * "Rize'yi Keşfet" içeriği: gezilecek yerler, lezzetler, kültür ve pratik bilgiler.
 *
 * Bilgiler resmî kaynaklardan (Rize İl Kültür ve Turizm Müdürlüğü, Kültür Portalı, Rize Valiliği,
 * Türk Patent Coğrafi İşaretler Portalı, GoTürkiye, DHMİ) derlenip özetlenmiştir; metinler birebir
 * alıntı değildir. Kaynakların farklı rakam verdiği yerler `note` alanında açıkça belirtilir.
 * Bu dosya React'ten bağımsızdır; bütünlüğü `test/discover.test.ts` ile denetlenir.
 */

export type PlaceCategory = 'yayla' | 'doga' | 'tarih' | 'muze';

export const PLACE_CATEGORIES: { id: PlaceCategory; label: string; icon: string }[] = [
  { id: 'yayla', label: 'Yaylalar', icon: '⛰️' },
  { id: 'doga', label: 'Doğa', icon: '🌲' },
  { id: 'tarih', label: 'Tarihi yapılar', icon: '🏰' },
  { id: 'muze', label: 'Müzeler', icon: '🏛️' },
];

export type Place = {
  id: string;
  name: string;
  district: string;
  category: PlaceCategory;
  /** Kart üzerinde görünen tek cümlelik tanıtım. */
  tagline: string;
  /** Ayrıntı görünümündeki açıklama. */
  description: string;
  highlights: string[];
  note?: string;
  /** Harita uygulamasında aranacak metin. */
  mapsQuery: string;
  sourceUrl: string;
  /** Yaklaşık konum (kuş uçuşu uzaklık ve "en yakın" sıralaması için; yol tarifi `mapsQuery` ile yapılır). */
  lat: number;
  lon: number;
  /** Kapalı alan (yağmurda da gezilebilir). */
  indoor: boolean;
  /** Rahat ulaşılabilen aylar [başlangıç, bitiş] (1–12). Yoksa yıl boyu. */
  months?: readonly [number, number];
  /** Önerilen ziyaret süresi. */
  visit: VisitLength;
  /** Rehberlerde en sık önerilen "mutlaka görülecek" yerlerden. */
  popular?: boolean;
};

export type VisitLength = 'kisa' | 'yarim' | 'tam';

export const VISIT_LABELS: Record<VisitLength, string> = { kisa: '1–2 saat', yarim: 'Yarım gün', tam: 'Tam gün' };

/** Yaylalara yollar genellikle Haziran–Eylül arasında rahat açıktır (kar ve çamur nedeniyle). */
const YAYLA_SEASON = [6, 9] as const;

const KTB = 'https://rize.ktb.gov.tr';
const PORTAL = 'https://www.kulturportali.gov.tr/turkiye/rize';

export const PLACES: Place[] = [
  {
    id: 'ayder',
    name: 'Ayder Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Rize’nin en popüler yaylalarından; kaplıcası ve Kaçkarlar’a açılan kapısıyla.',
    description:
      'Yaklaşık 1.218 metre yükseklikteki Ayder, Rize’nin en popüler turizm merkezlerinden biridir. Kaçkar ' +
      'Dağları’na kuzeyden yapılan tırmanışların başlangıç noktasıdır; termal kaplıcası ve konaklama ' +
      'imkânlarıyla bölgeyi gezmek için iyi bir üs olur.',
    highlights: [
      'Termal kaplıca',
      'Gelintülü Şelalesi: yaklaşık 23 metreden Fırtına Deresi’ne dökülür',
      'Kaçkar yürüyüşlerinin başlangıç noktası',
    ],
    note: 'Ayder’in Çamlıhemşin’e uzaklığı kaynaklarda 16 ve 19 km olarak farklı verilir.',
    mapsQuery: 'Ayder Yaylası, Çamlıhemşin, Rize',
    sourceUrl: `${KTB}/TR-112789/yayla-turizmi.html`,
    lat: 40.9507, lon: 41.1031, indoor: false, months: [5, 10], visit: 'tam', popular: true,
  },
  {
    id: 'kackar',
    name: 'Kaçkar Dağları Milli Parkı',
    district: 'Çamlıhemşin',
    category: 'doga',
    tagline: 'Rize’nin en yüksek noktası Kaçkar Dağı ve işaretli yürüyüş parkurları.',
    description:
      '1994 yılında milli park ilan edilen alan, Rize’nin en yüksek noktası olan Kaçkar Dağı’nı içine alır. ' +
      'Park içinde işaretli yürüyüş parkurları bulunur; dağcılık ve doğa yürüyüşü için Türkiye’nin önde gelen ' +
      'rotalarındandır.',
    highlights: ['1994’te milli park ilan edildi', '8 yürüyüş parkuru', 'Rize’nin en yüksek noktası'],
    note: 'Kaçkar Dağı’nın yüksekliği Rize Valiliği’nde 3.937 m, Kültür Portalı’nda 3.992 m olarak geçer.',
    mapsQuery: 'Kaçkar Dağları Milli Parkı, Rize',
    sourceUrl: `${PORTAL}/gezilecekyer/kackar-daglari-milli-parki`,
    lat: 40.8611, lon: 41.1011, indoor: false, months: YAYLA_SEASON, visit: 'tam', popular: true,
  },
  {
    id: 'firtina',
    name: 'Fırtına Vadisi',
    district: 'Çamlıhemşin',
    category: 'doga',
    tagline: 'Tarihî taş kemer köprüler, rafting ve doğa yürüyüşleri.',
    description:
      'Fırtına Deresi boyunca uzanan vadi; taş kemer köprüleri, doğa yürüyüşü parkurları ve rafting ' +
      'imkânıyla bilinir. Zil Kale ve Palovit Şelalesi ile aynı gün içinde gezilebilir.',
    highlights: [
      'Şenyuva Köprüsü gibi tarihî taş kemer köprüler',
      'Rafting ve doğa yürüyüşü',
      'Fırtına Deresi yaklaşık 57 km uzunluğundadır',
    ],
    mapsQuery: 'Fırtına Vadisi, Çamlıhemşin, Rize',
    sourceUrl: 'https://rize.goturkiye.com/tr/rize-rotalari',
    lat: 41.0458, lon: 41.0053, indoor: false, visit: 'yarim', popular: true,
  },
  {
    id: 'zilkale',
    name: 'Zil Kale',
    district: 'Çamlıhemşin',
    category: 'tarih',
    tagline: 'Fırtına Vadisi’nde yükselen, Rize’nin en büyük kalesi.',
    description:
      'Fırtına Vadisi’nde yükselen Zil Kale, ildeki en büyük kaledir. Vadinin kemer köprüleriyle birlikte ' +
      'bölgenin en önemli tarihî duraklarından biridir.',
    highlights: ['Rize’nin en büyük kalesi', 'Fırtına Vadisi’nin kemer köprüleriyle aynı rota'],
    mapsQuery: 'Zil Kale, Çamlıhemşin, Rize',
    sourceUrl: `${KTB}/TR-127865/kaleler.html`,
    lat: 40.9592, lon: 40.9631, indoor: false, months: [4, 11], visit: 'yarim', popular: true,
  },
  {
    id: 'palovit',
    name: 'Palovit Şelalesi',
    district: 'Çamlıhemşin',
    category: 'doga',
    tagline: 'Bölgenin en gür akan şelalesi, milli park sınırları içinde.',
    description:
      'Kaçkar Dağları Milli Parkı içinde yer alan Palovit, bölgenin en bol sulu şelalesi olarak anılır. ' +
      'Fırtına Vadisi ve Zil Kale rotasıyla birleştirilebilir.',
    highlights: ['Bölgenin en bol sulu şelalesi', 'Kaçkar Dağları Milli Parkı içinde'],
    mapsQuery: 'Palovit Şelalesi, Çamlıhemşin, Rize',
    sourceUrl: `${KTB}/TR-112780/selaleler.html`,
    lat: 40.9414, lon: 40.9931, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'pokut',
    name: 'Pokut ve Sal Yaylaları',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Fırtına ve Hala dereleri arasında, geleneksel ahşap yayla evleri.',
    description:
      'Fırtına ve Hala dereleri arasında yer alan Pokut, doğa yürüyüşü için elverişli bir yayladır; ' +
      'komşusu Sal ile birlikte geleneksel yayla yaşamının sürdüğü yerlerdendir. Çamlıhemşin’den ulaşım ' +
      'yaklaşık iki saat sürer.',
    highlights: ['Geleneksel ahşap yayla evleri', 'Doğa yürüyüşü', 'Çamlıhemşin’den yaklaşık iki saat'],
    note: 'Pokut’un yüksekliği Kültür Portalı’nda 2.032 m, GoTürkiye’de 2.170 m olarak geçer.',
    mapsQuery: 'Pokut Yaylası, Çamlıhemşin, Rize',
    sourceUrl: `${PORTAL}/gezilecekyer/pokut-yaylasi`,
    lat: 40.9631, lon: 41.0253, indoor: false, months: YAYLA_SEASON, visit: 'tam', popular: true,
  },
  {
    id: 'elevit',
    name: 'Elevit Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Horonlarıyla ünlü, Ağustos şenlikleriyle canlanan yayla.',
    description:
      'Yaklaşık 1.884 metre yükseklikteki Elevit, horonlarıyla ünlüdür; Ağustos aylarında yapılan ' +
      'şenlikleriyle dikkat çeker. Çat’tan yürüyüşle ya da araç yoluyla ulaşılabilir.',
    highlights: ['Ağustos şenlikleri', 'Horon', 'Çat’tan yürüyüş rotası'],
    mapsQuery: 'Elevit Yaylası, Çamlıhemşin, Rize',
    sourceUrl: `${PORTAL}/gezilecekyer/elevit-yaylasi`,
    lat: 40.86, lon: 41.02, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'yukarikackar',
    name: 'Yukarı Kaçkar Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Her Ağustos bir ay süren Vartavor Şenlikleri’nin evi.',
    description:
      'Kalabalık bir yayla yerleşimi olan Yukarı Kaçkar, her yıl Ağustos ayında yapılan ve yaklaşık bir ay ' +
      'süren Vartavor Şenlikleri ile ünlüdür.',
    highlights: ['Vartavor Şenlikleri (Ağustos)', 'Geleneksel yayla yerleşimi'],
    mapsQuery: 'Yukarı Kaçkar Yaylası, Çamlıhemşin, Rize',
    sourceUrl: `${PORTAL}/gezilecekyer/kackar-yaylasi`,
    lat: 40.89, lon: 41.13, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'huser',
    name: 'Huser Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Kaçkarlar ve çevre vadileri tek bakışta gören panorama.',
    description:
      'Huser’den Kaçkar Dağları ile Palakçur, Avusor, Çeymakçur ve Kavrun vadileri kesintisiz görülür.',
    highlights: ['Kaçkar Dağları panoraması', 'Dört vadiye birden bakış'],
    mapsQuery: 'Huser Yaylası, Çamlıhemşin, Rize',
    sourceUrl: 'https://goturkiye.com/rize/routes',
    lat: 40.9736, lon: 41.1131, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'anzer',
    name: 'Anzer Yaylası (Ballıköy)',
    district: 'İkizdere',
    category: 'yayla',
    tagline: 'Dünyaca ünlü Anzer balının çiçekleri bu yaylada açar.',
    description:
      'Ballıköy adıyla da bilinen Anzer, İkizdere’de yüksek bir yayladır. Coğrafi işaretli Anzer balı bu ' +
      'yaylanın çiçeklerinden elde edilir. Yayla, bir yandan Bayburt’a, diğer yandan Trabzon Uzungöl’e bağlanır.',
    highlights: ['Anzer balının kaynağı', 'Ballıköy olarak da bilinir', 'Uzungöl bağlantısı'],
    note: 'Yüksekliği Rize Valiliği’nde yaklaşık 2.105 m; bazı turizm kaynaklarında 2.200–2.300 m olarak geçer.',
    mapsQuery: 'Anzer Yaylası, İkizdere, Rize',
    sourceUrl: 'https://rize.gov.tr/yaylalar',
    lat: 40.5913, lon: 40.517, indoor: false, months: YAYLA_SEASON, visit: 'tam', popular: true,
  },
  {
    id: 'ovit',
    name: 'Ovit Dağı',
    district: 'İkizdere',
    category: 'yayla',
    tagline: 'Kışın kayak, yazın trekking: 2008’den beri Kış Turizm Merkezi.',
    description:
      'Yaklaşık 2.640 metre yükseklikteki Ovit, 2008 yılında Bakanlar Kurulu kararıyla Kış Turizm Merkezi ' +
      'ilan edildi. Yaz aylarında trekking, dağcılık ve cip safarisi yapılabilir.',
    highlights: ['Kış Turizm Merkezi (2008)', 'Kış sporları', 'Yaz trekkingi'],
    mapsQuery: 'Ovit Dağı, İkizdere, Rize',
    sourceUrl: `${KTB}/TR-112809/ovit-dagi-kis-turizm-merkezi.html`,
    lat: 40.63, lon: 40.64, indoor: false, visit: 'tam',
  },
  {
    id: 'rizekalesi',
    name: 'Rize Kalesi',
    district: 'Merkez',
    category: 'tarih',
    tagline: 'İç kalesi 6. yüzyıla uzanan, şehir merkezindeki tarihî kale.',
    description:
      'Şehir merkezinin güneybatısındaki kalenin iç kısmının I. Justinianus döneminde (527–565), aşağı ' +
      'kalesinin ise 13. yüzyılda yapıldığı düşünülür. Zil Kale’den sonra ilin en büyük kalesidir.',
    highlights: ['İç kale: 6. yüzyıl', 'Aşağı kale: 13. yüzyıl', 'Zil Kale’den sonra ilin en büyük kalesi'],
    mapsQuery: 'Rize Kalesi, Rize',
    sourceUrl: `${KTB}/TR-127865/kaleler.html`,
    lat: 41.0275, lon: 40.5103, indoor: false, visit: 'kisa', popular: true,
  },
  {
    id: 'kizkalesi',
    name: 'Kız Kalesi',
    district: 'Pazar',
    category: 'tarih',
    tagline: 'Denizin içindeki kayalık adacıkta, yalnız bir gözetleme kulesi.',
    description:
      'Pazar ilçesinin batısında, karayla bağlantısı kesilmiş küçük kayalık bir adacık üzerindedir. Kare ' +
      'planlı yapının gözetleme amacıyla yapıldığı düşünülür; yapım tarihi kesin değildir (13–14. yüzyıl tahmin edilir).',
    highlights: ['Deniz üzerindeki kayalık adacık', 'Gözetleme kulesi', '13–14. yüzyıl (tahmini)'],
    mapsQuery: 'Kız Kalesi, Pazar, Rize',
    sourceUrl: `${PORTAL}/kulturenvanteri/kiz-kalesi-1`,
    lat: 41.1828, lon: 40.8742, indoor: false, visit: 'kisa',
  },
  {
    id: 'ataturkevi',
    name: 'Atatürk Evi Müzesi',
    district: 'Merkez',
    category: 'muze',
    tagline: 'Atatürk’ün 17 Eylül 1924’te konakladığı Mehmet Mataracı Konağı.',
    description:
      'Müftü Mahallesi’ndeki Mehmet Mataracı Konağı, Atatürk’ün 17 Eylül 1924’teki Rize ziyaretinde ' +
      'konakladığı evdir. Restore edilerek müzeye dönüştürülmüş ve 27 Aralık 1985’te ziyarete açılmıştır.',
    highlights: ['Atatürk’ün konakladığı ev', '1985’ten beri müze', 'Bahçeli konak'],
    mapsQuery: 'Atatürk Evi Müzesi, Rize',
    sourceUrl: `${PORTAL}/gezilecekyer/ataturkevi-muzesi-mehmet-mataraci-konagi`,
    lat: 41.0233, lon: 40.5342, indoor: true, visit: 'kisa', popular: true,
  },
  {
    id: 'rizemuzesi',
    name: 'Rize Müzesi',
    district: 'Merkez',
    category: 'muze',
    tagline: '“Sarı Ev” olarak bilinen 19. yüzyıl yapısında, 1998’den beri.',
    description:
      '19. yüzyıldan kalma ve “Sarı Ev” olarak da bilinen yapıda hizmet veren müze, 1998’de ziyarete açıldı. ' +
      'Etnografik eserler, sikkeler ve arkeolojik buluntular sergilenir. Müze Kart geçerlidir.',
    highlights: ['Etnografya', 'Sikke koleksiyonu', 'Arkeolojik eserler'],
    mapsQuery: 'Rize Müzesi, Rize',
    sourceUrl: 'https://muze.gov.tr/muze-detay?SectionId=RZM01&DistId=MRK',
    lat: 41.024, lon: 40.5215, indoor: true, visit: 'kisa',
  },
  // ——— Vikipedi (tr) maddelerinden derlenen ek yerler; koordinatlar madde ve GeoNames verisinden ———
  {
    id: 'ziraatcay',
    name: 'Ziraat Botanik Çay Bahçesi',
    district: 'Merkez',
    category: 'doga',
    tagline: 'Şehrin üstündeki tepede, çay bahçeleri arasında manzaralı mola.',
    description:
      'Rize’nin eski çay plantasyonlarından biri üzerinde kurulan bahçe, şehir merkezine ve denize bakan bir ' +
      'tepededir. Çay bitkisini yakından görmek, küçük ölçekli çay işleme örneklerini izlemek ve manzara eşliğinde ' +
      'demli bir Rize çayı içmek için şehirde en çok önerilen duraklardandır.',
    highlights: ['Şehir ve deniz manzarası', 'Çay bitkisini yakından görme', 'Çay bahçesinde mola'],
    mapsQuery: 'Ziraat Botanik Çay Bahçesi, Rize',
    sourceUrl: 'https://goturkiye.com/culturaljourneys/tea-route',
    lat: 41.0218, lon: 40.5175, indoor: false, visit: 'kisa', popular: true,
  },
  {
    id: 'islampasa',
    name: 'İslampaşa (Kurşunlu) Camii',
    district: 'Merkez',
    category: 'tarih',
    tagline: '1571’den kalma, şehrin en eski camilerinden.',
    description:
      'İskender Cafer Paşa tarafından 1571’de yaptırılan cami, dikdörtgen planlıdır. Moloz taştan örülen yapının ' +
      'kubbesinde 24 pencere bulunur; kurşun kaplı kubbesi nedeniyle Kurşunlu Cami adıyla da anılır.',
    highlights: ['1571’de yapıldı', 'Kubbede 24 pencere', 'Şehir merkezinde'],
    mapsQuery: 'İslampaşa Camii, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C4%B0slampa%C5%9Fa_Kur%C5%9Funlu_Cami',
    lat: 41.0237, lon: 40.5165, indoor: true, visit: 'kisa',
  },
  {
    id: 'senyuva',
    name: 'Şenyuva (Çinçiva) Köprüsü',
    district: 'Çamlıhemşin',
    category: 'tarih',
    tagline: 'Fırtına Deresi’nin en ünlü taş kemer köprüsü, 1696.',
    description:
      'Fırtına Deresi üzerindeki tek gözlü kemer köprü 1696’da yaptırılmıştır. Yaklaşık 40 metre uzunluğu ve ' +
      '20 metre yüksekliğiyle vadinin en çok fotoğraflanan köprülerindendir. Çamlıhemşin’e yaklaşık 7 km ' +
      'uzaklıktadır; çevresindeki Şenyuva köyü taş ve ahşap evleriyle dikkat çeker.',
    highlights: ['1696 yapımı tek gözlü kemer', '40 m uzunluk, 20 m yükseklik', 'Çamlıhemşin’e ~7 km'],
    note: 'Köprünün kitabesi 1946 selinde kaybolmuştur.',
    mapsQuery: 'Şenyuva Köprüsü, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C5%9Eenyuva_K%C3%B6pr%C3%BCs%C3%BC',
    lat: 40.9975, lon: 40.975, indoor: false, visit: 'kisa', popular: true,
  },
  {
    id: 'mikron',
    name: 'Mikron Köprüsü',
    district: 'Çamlıhemşin',
    category: 'tarih',
    tagline: 'Çamlıhemşin’in hemen yanında, 41 metrelik kesme taş kemer.',
    description:
      '19. yüzyılda yapıldığı tahmin edilen köprü Fırtına Deresi üzerindedir; 41 metre uzunluğunda ve 11 metre ' +
      'yüksekliğindedir. Sele karşı geniş tutulan ayak açıklıklarıyla bilinir; 1998’de özgün biçimi korunarak onarılmıştır.',
    highlights: ['Çamlıhemşin’e ~2 km', '41 m uzunluk', '1998’de onarıldı'],
    mapsQuery: 'Mikron Köprüsü, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Mikron_K%C3%B6pr%C3%BCs%C3%BC',
    lat: 41.0456, lon: 41.0253, indoor: false, visit: 'kisa',
  },
  {
    id: 'kocakopru',
    name: 'Koca Köprü (Dört Gözlü Köprü)',
    district: 'Pazar',
    category: 'tarih',
    tagline: 'Pazar’da dört kemerli taş köprü.',
    description:
      'Pazar ilçesindeki dört kemerli taş köprü, kemer sayısı nedeniyle Dört Gözlü Köprü olarak da bilinir. ' +
      'Bölgedeki tek kemerli köprülerin çoğundan farklı olarak çok gözlü yapısıyla dikkat çeker.',
    highlights: ['Dört kemer (göz)', 'Pazar ilçesinde', 'Kısa bir mola için uygun'],
    mapsQuery: 'Koca Köprü, Pazar, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Koca_K%C3%B6pr%C3%BC',
    lat: 41.1314, lon: 40.9028, indoor: false, visit: 'kisa',
  },
  {
    id: 'ciha',
    name: 'Ciha Kalesi',
    district: 'Pazar',
    category: 'tarih',
    tagline: 'Hemşin Deresi kıyısında, dairesel planlı gözetleme kalesi.',
    description:
      'Pazar’a yaklaşık 7 km uzaklıktaki kalenin haberleşme ve gözetleme amacıyla kullanıldığı, 14. yüzyılda ' +
      'yapıldığı tahmin edilir. Dairesel planlıdır; kuzeydoğudaki giriş kapısı iki kuleyle desteklenir, ortada ' +
      'daire planlı bir kule daha vardır.',
    highlights: ['14. yüzyıl (tahmini)', 'Dairesel plan, merkezde kule', 'Pazar’a ~7 km'],
    mapsQuery: 'Ciha Kalesi, Pazar, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Ciha_Kalesi_(Rize)',
    lat: 41.1042, lon: 40.9006, indoor: false, visit: 'kisa',
  },
  {
    id: 'cukurluhoca',
    name: 'Çukurluhoca Medresesi',
    district: 'Çayeli',
    category: 'tarih',
    tagline: 'Alt katı taş, üst katı ahşap: 19. yüzyıl köy medresesi.',
    description:
      'Eski adıyla Babik Medresesi, 1870 civarında yapıldığı düşünülen iki katlı bir yapıdır. Alt katı kesme ' +
      'taştan, üst katı giydirme tekniğiyle ahşaptan yapılmıştır. Alt kattaki çok sayıda ocak, bu katın aşhane ' +
      'olarak kullanıldığını düşündürür.',
    highlights: ['1870 civarı (tahmini)', 'Taş ve ahşap bir arada', 'Bölgeye özgü giydirme tekniği'],
    mapsQuery: 'Çukurluhoca Medresesi, Çayeli, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C3%87ukurluhoca_Medresesi',
    lat: 40.9447, lon: 40.7725, indoor: false, visit: 'kisa',
  },
  {
    id: 'inceler',
    name: 'İnceler Konağı',
    district: 'Fındıklı',
    category: 'tarih',
    tagline: 'Çağlayan köyünde geleneksel bir Laz evi.',
    description:
      'Fındıklı’nın Çağlayan köyündeki konak, Doğu Karadeniz’in geleneksel Laz evi mimarisinin örneklerindendir. ' +
      'Çağlayan Deresi vadisine yapılacak bir gezide yol üstünde görülebilir.',
    highlights: ['Geleneksel Laz evi', 'Çağlayan vadisi', 'Fındıklı’ya yakın'],
    mapsQuery: 'İnceler Konağı, Fındıklı, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C4%B0nceler_Kona%C4%9F%C4%B1',
    lat: 41.2583, lon: 41.2047, indoor: false, visit: 'kisa',
  },
  {
    id: 'ardesenkilise',
    name: 'Ardeşen Kilisesi',
    district: 'Ardeşen',
    category: 'tarih',
    tagline: 'Geç Bizans döneminden kalma kilise kalıntısı.',
    description:
      'Ardeşen’in Çiftekavak mahallesindeki Ortodoks kilisesi kalıntısının Orta Çağ’da, Geç Bizans döneminde ' +
      'yapıldığı düşünülür. Beş kenarlı merkez apsisi, Trabzon İmparatorluğu dönemi mimarisinin ayırt edici ' +
      'özelliklerinden sayılır.',
    highlights: ['Geç Bizans dönemi (tahmini)', 'Beş kenarlı apsis', 'Kalıntı; çevre düzenlemesi sınırlı'],
    mapsQuery: 'Ardeşen Kilisesi, Çiftekavak, Ardeşen, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Arde%C5%9Fen_Kilisesi',
    lat: 41.1958, lon: 41.0017, indoor: false, visit: 'kisa',
  },
  {
    id: 'gelintulu',
    name: 'Gelintülü Şelalesi',
    district: 'Çamlıhemşin',
    category: 'doga',
    tagline: 'Ayder’in simgesi: “gelin tülü” gibi dökülen şelale.',
    description:
      'Ayder yakınlarında, Kavron Deresi’nden beslenen şelale yaklaşık 1.320 metre rakımdadır. Adını, ince ' +
      'bir tül gibi dökülen suyundan alır; Ayder’e gelenlerin ilk uğrak yerlerindendir.',
    highlights: ['Ayder’e yürüme mesafesinde', 'Kavron Deresi’nden beslenir', '~1.320 m rakım'],
    note: 'Şelalenin yüksekliği Vikipedi’de 15 m, bazı turizm kaynaklarında ~23 m olarak geçer.',
    mapsQuery: 'Gelintülü Şelalesi, Ayder, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Gelint%C3%BCl%C3%BC_%C5%9Eelalesi',
    lat: 40.95, lon: 41.1106, indoor: false, months: [5, 10], visit: 'kisa', popular: true,
  },
  {
    id: 'camlihemsinselale',
    name: 'Çamlıhemşin Şelalesi',
    district: 'Çamlıhemşin',
    category: 'doga',
    tagline: 'İlçe merkezine 200 metre, dört mevsim akan şelale.',
    description:
      'Çamlıhemşin merkezine yalnızca 200 metre uzaklıktaki şelale 25 metre yüksekten dökülür. Tüm mevsimlerde ' +
      'akması sayesinde Ayder ya da Fırtına Vadisi yolunda kısa bir mola için idealdir.',
    highlights: ['25 m yükseklik', 'Dört mevsim akar', 'Merkeze 200 m'],
    mapsQuery: 'Çamlıhemşin Şelalesi, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C3%87aml%C4%B1hem%C5%9Fin_%C5%9Eelalesi',
    lat: 41.0461, lon: 41.0039, indoor: false, visit: 'kisa',
  },
  {
    id: 'agaran',
    name: 'Ağaran Şelalesi',
    district: 'Çayeli',
    category: 'doga',
    tagline: 'Sarp kayadan bembeyaz köpüklerle dökülen şelale.',
    description:
      'Şairler Deresi’nden beslenen şelale, Çayeli’ne yaklaşık 12 km uzaklıktadır. Yüksek ve sarp bir kayadan ' +
      'çevresine beyaz köpükler saçarak akmasından dolayı “Ağaran” adını almıştır.',
    highlights: ['Çayeli’ne ~12 km', 'Şairler Deresi', 'Yağışlı günlerden sonra daha gösterişli'],
    mapsQuery: 'Ağaran Şelalesi, Çayeli, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/A%C4%9Faran_%C5%9Eelalesi',
    lat: 41.045, lon: 40.8089, indoor: false, visit: 'yarim',
  },
  {
    id: 'karaali',
    name: 'Karaali (Avla) Şelalesi',
    district: 'Fındıklı',
    category: 'doga',
    tagline: 'Arılı Deresi vadisinde, denize yakın alçak şelale.',
    description:
      'Fındıklı’daki Arılı Deresi vadisinde yer alan şelale yaklaşık 210 metre rakımdadır. Sahile yakın olduğu için ' +
      'yaylalara çıkmadan, kışın da ulaşılabilecek doğa duraklarındandır.',
    highlights: ['Arılı Deresi vadisi', '~210 m rakım', 'Kışın da ulaşılabilir'],
    mapsQuery: 'Karaali Şelalesi, Fındıklı, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Karaali_%C5%9Eelalesi',
    lat: 41.2133, lon: 41.1475, indoor: false, visit: 'yarim',
  },
  {
    id: 'pileki',
    name: 'Pileki Mağarası',
    district: 'İyidere',
    category: 'doga',
    tagline: 'Tünelleri, kuyuları ve gölleriyle yapay bir mağara.',
    description:
      'İyidere’deki mağara insan eliyle oluşturulmuştur; içinde çok sayıda tünel, kuyu ve göl bulunur. İki büyük ' +
      'girişi vardır.',
    highlights: ['Yapay mağara', 'Tünel, kuyu ve göller', 'İki büyük giriş'],
    note: 'Mağara içi için el feneri ve kaymayan ayakkabı önerilir; ziyaret koşullarını yerelde sorun.',
    mapsQuery: 'Pileki Mağarası, İyidere, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Pileki_Ma%C4%9Faras%C4%B1',
    lat: 40.99, lon: 40.375, indoor: true, visit: 'kisa',
  },
  {
    id: 'amlakit',
    name: 'Amlakit Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Palovit vadisinde, ulaşımı en kolay yüksek yaylalardan.',
    description:
      'Rakımı 1.900–2.200 metre arasında değişen Amlakit, Palovit Yaylası’nın aşağısında, Zilkale’ye inen vadideki ' +
      'çamlıklara bitişiktir. 120–130 evlik yayla, bölgedeki diğer yaylalara göre ulaşımı kolay olanlardandır; ' +
      'Palovit Deresi yaylayı ikiye böler.',
    highlights: ['1.900–2.200 m', 'Ulaşımı görece kolay', 'Palovit Deresi kıyısında'],
    mapsQuery: 'Amlakit Yaylası, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Amlakit_Yaylas%C4%B1',
    lat: 40.9031, lon: 41.0717, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'gito',
    name: 'Gito Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Çat vadisinde, 2.070 metrede sis denizi manzarası.',
    description:
      'Çat vadisindeki Gito, yaklaşık 2.070 metre rakımdadır ve ilçe merkezine 31 km uzaklıktadır. Sabahları ' +
      'vadileri dolduran bulut denizi manzarası ve daha sakin yürüyüş rotalarıyla önerilir.',
    highlights: ['~2.070 m rakım', 'Çat vadisi', 'İlçeye ~31 km'],
    mapsQuery: 'Gito Yaylası, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Gito_Yaylas%C4%B1',
    lat: 40.9028, lon: 40.9242, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'kavrun',
    name: 'Kavrun Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: 'Ayder’in 10 km ötesinde, Kaçkar yürüyüşlerinin yolu üstünde.',
    description:
      'Aşağı ve Yukarı Kavrun olarak ikiye ayrılan yayla 1.980–2.350 metre arasındadır ve Ayder’e yaklaşık 10 km ' +
      'uzaklıktadır. Ortasından Kavran Deresi geçer; toprak yolla ulaşılır ve Mayıs–Ekim arasında kullanılır.',
    highlights: ['Ayder’e ~10 km', '1.980–2.350 m', 'Mayıs–Ekim arası yaylacılık'],
    mapsQuery: 'Kavrun Yaylası, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Kavrun_Yaylas%C4%B1',
    lat: 40.925, lon: 41.135, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'samistal',
    name: 'Samistal Yaylası',
    district: 'Çamlıhemşin',
    category: 'yayla',
    tagline: '2.450 metrede taş evler ve Kaçkar zirvelerine bakan manzara.',
    description:
      'İlçe merkezine 22 km uzaklıktaki Samistal 2.450 metre rakımdadır. Büyük taş kütleleri arasındaki taş evleriyle ' +
      'dikkat çeker. Yaylada konaklama tesisi yoktur; günübirlik ya da çadırla gidilir.',
    highlights: ['~2.450 m rakım', 'Taş yayla evleri', 'Konaklama tesisi yok'],
    mapsQuery: 'Samistal Yaylası, Çamlıhemşin, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/Samistal_Yaylas%C4%B1',
    lat: 40.9115, lon: 41.101, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
  {
    id: 'cagrankaya',
    name: 'Çağrankaya Yaylaları',
    district: 'İkizdere',
    category: 'yayla',
    tagline: 'İkizdere’ye 15 km, araçla ulaşılan üç yayla.',
    description:
      'İkizdere’nin kuzeybatısında, yaklaşık 2.300 metre rakımdaki üç yayladan (Aşağı Yayla, Kurtlar Yaylası, Büyük ' +
      'Yayla) oluşur. Kamp, trekking ve arazi sürüşü için elverişlidir; her türlü kara taşıtıyla ulaşılabilir.',
    highlights: ['Üç yayla bir arada', '~2.300 m', 'Kamp ve trekking'],
    mapsQuery: 'Çağrankaya Yaylası, İkizdere, Rize',
    sourceUrl: 'https://tr.wikipedia.org/wiki/%C3%87a%C4%9Frankaya_Yaylalar%C4%B1',
    lat: 40.8252, lon: 40.6479, indoor: false, months: YAYLA_SEASON, visit: 'tam',
  },
];

export type Food = {
  id: string;
  name: string;
  kind: 'yemek' | 'tatli' | 'urun';
  icon: string;
  description: string;
  /** Coğrafi işaret tescili (Türk Patent). */
  geoIndication?: string;
  sourceUrl: string;
};

export const FOOD_KINDS: { id: Food['kind']; label: string; icon: string }[] = [
  { id: 'yemek', label: 'Yemekler', icon: '🍲' },
  { id: 'tatli', label: 'Tatlılar', icon: '🍮' },
  { id: 'urun', label: 'Ürünler', icon: '🫙' },
];

export const FOODS: Food[] = [
  {
    id: 'cay',
    name: 'Rize Çayı',
    kind: 'urun',
    icon: '🍵',
    description: 'Türkiye çayının ana vatanından; Rize’nin simgesi ve ekonomisinin bel kemiği.',
    geoIndication: 'Menşe adı · 2021 · Rize Ticaret Borsası',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'anzer',
    name: 'Anzer Balı',
    kind: 'urun',
    icon: '🍯',
    description: 'İkizdere’deki Anzer Yaylası’nın çiçeklerinden elde edilen, dünyaca ünlü bal.',
    geoIndication: 'Menşe adı',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'ayderbali',
    name: 'Ayder Balı',
    kind: 'urun',
    icon: '🍯',
    description: 'Ayder Yaylası ve çevresinin çiçek örtüsünden üretilen yöresel bal.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: 'https://www.rize.gov.tr/ayder-bali-cografi-isaret-tescili-aldi',
  },
  {
    id: 'muhlama',
    name: 'Rize Muhlaması',
    kind: 'yemek',
    icon: '🥘',
    description:
      'Mısır unu, tereyağı ve kolot peyniriyle bakır sahanda pişirilip tahta kaşıkla sıcak servis edilir. ' +
      'Yörede kuymak da denir.',
    geoIndication: 'Mahreç işareti · Rize Ticaret ve Sanayi Odası',
    sourceUrl: `${KTB}/TR-256617/rize-muhlamasi.html`,
  },
  {
    id: 'koloti',
    name: 'Çayeli Koloti Peyniri',
    kind: 'urun',
    icon: '🧀',
    description: 'Muhlamanın da vazgeçilmezi olan yöresel peynir.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: 'https://www.rize.gov.tr/cayeli-koloti-peyniri-cografi-isaret-tescili-aldi',
  },
  {
    id: 'kavurma',
    name: 'Rize Kavurması',
    kind: 'yemek',
    icon: '🍖',
    description: 'Rize mutfağının tescilli et yemeklerinden.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'fasulye',
    name: 'Çayeli Kuru Fasulye Yemeği',
    kind: 'yemek',
    icon: '🫘',
    description: 'Çayeli’nin adıyla anılan, tescilli kuru fasulye yemeği.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'pide',
    name: 'Derepazarı Pidesi',
    kind: 'yemek',
    icon: '🫓',
    description: 'Derepazarı’nın tescilli pidesi.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'simit',
    name: 'Rize Simidi',
    kind: 'urun',
    icon: '🥯',
    description: 'Rize’ye özgü simit; kahvaltıların ve çay saatlerinin eşlikçisi.',
    geoIndication: 'Mahreç işareti · 2019 · Rize Belediyesi',
    sourceUrl: 'https://ci.turkpatent.gov.tr/cografi-isaretler/detay/38421',
  },
  {
    id: 'baston',
    name: 'Rize Baston Ekmek',
    kind: 'urun',
    icon: '🥖',
    description: 'Uzun, baston biçimli yöresel ekmek.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: `${KTB}/TR-256610/cografi-isaretli-urunler.html`,
  },
  {
    id: 'pepecura',
    name: 'Rize Pepeçurası',
    kind: 'tatli',
    icon: '🍇',
    description:
      'İsabella üzümü, mısır unu ve un ile yapılan, muhallebiye benzeyen geleneksel üzüm tatlısı.',
    geoIndication: 'Coğrafi işaret tescilli · 2021',
    sourceUrl: `${KTB}/TR-256620/rize-pepecurasi.html`,
  },
  {
    id: 'lokum',
    name: 'Rize Enişte Lokumu',
    kind: 'tatli',
    icon: '🍬',
    description: 'Rize’ye özgü, coğrafi işaret tescilli geleneksel lokum.',
    geoIndication: 'Coğrafi işaret tescilli',
    sourceUrl: 'https://www.rize.gov.tr/rize-eniste-lokumu-cografi-isaret-tescili-aldi',
  },
  {
    id: 'hamsi',
    name: 'Hamsi',
    kind: 'yemek',
    icon: '🐟',
    description: 'Karadeniz’in gümüş balığı; yörede yalnızca hamsiyle yirmiden fazla yemek yapılır.',
    sourceUrl: `${KTB}/TR-191577/halk-mutfagi.html`,
  },
  {
    id: 'lazboregi',
    name: 'Laz Böreği',
    kind: 'tatli',
    icon: '🥧',
    description: 'Muhallebili, şerbetli hamur tatlısı; özel günlerin vazgeçilmezi.',
    sourceUrl: `${KTB}/TR-191577/halk-mutfagi.html`,
  },
];

export type CultureItem = { id: string; title: string; icon: string; text: string; sourceUrl: string; badge?: string };

export const CULTURE: CultureItem[] = [
  {
    id: 'feretiko',
    title: 'Rize Bezi (Feretiko)',
    icon: '🧵',
    text:
      'Bölgenin kendirinden elde edilen ince ve esnek ipliklerle dokunan geleneksel bez. Rize’nin coğrafi ' +
      'işaret alan ilk ürünüdür.',
    badge: 'Coğrafi işaret · 2008',
    sourceUrl: `${PORTAL}/nealinir/rize-bezi-feretiko`,
  },
  {
    id: 'corap',
    title: 'Hemşin Çorabı',
    icon: '🧦',
    text: 'Desenleriyle tanınan, Hemşin yöresine özgü el örgüsü çorap.',
    badge: 'Coğrafi işaret',
    sourceUrl: 'https://rize.gov.tr/hemsin-corabi-cografi-isaret-tescili-aldi',
  },
  {
    id: 'horon',
    title: 'Horon',
    icon: '💃',
    text:
      'Karadeniz’in coşkulu halk oyunu. Hemşin horonları (Çayeli’nin dağlık kesimi, Hemşin, Pazar, Ardeşen, ' +
      'Fındıklı) tulumla; Rize horonları (İkizdere–İyidere hattından Çayeli sahiline) kemençeyle oynanır.',
    sourceUrl: `${KTB}/TR-113715/horon.html`,
  },
  {
    id: 'kemence',
    title: 'Kemençe',
    icon: '🎻',
    text: 'Tek parça ağaçtan oyularak yapılan, yay ile çalınan telli çalgı; Rize horonlarının sesi.',
    sourceUrl: `${KTB}/TR-113715/horon.html`,
  },
  {
    id: 'tulum',
    title: 'Tulum',
    icon: '🎶',
    text: 'Hemşin horonlarına eşlik eden, deriden yapılan nefesli çalgı.',
    sourceUrl: `${KTB}/TR-113715/horon.html`,
  },
];

export const FESTIVALS: { name: string; when: string; where: string }[] = [
  { name: 'Vartavor Şenlikleri', when: 'Ağustos (yaklaşık bir ay)', where: 'Yukarı Kaçkar Yaylası, Çamlıhemşin' },
  { name: 'Elevit Yayla Şenlikleri', when: 'Ağustos', where: 'Elevit Yaylası, Çamlıhemşin' },
  { name: 'Ayder Sanat, Kültür ve Doğa Festivali', when: 'Yaz dönemi', where: 'Ayder, Çamlıhemşin' },
  { name: 'Uluslararası Tulum ve Müzik Festivali', when: 'Tarihleri her yıl duyurulur', where: 'Rize' },
];

export const PRACTICAL: { title: string; icon: string; text: string; sourceUrl?: string }[] = [
  {
    title: 'Rize-Artvin Havalimanı',
    icon: '✈️',
    text:
      '14 Mayıs 2022’de açılan havalimanı, Pazar–Yeşilköy kıyısında denize dolgu yapılarak inşa edildi. ' +
      'Rize merkezine yaklaşık 34 km uzaklıktadır; terminalde ÇAYKUR müzesi ve mini çay fabrikası bulunur.',
    sourceUrl: 'https://dhmi.gov.tr/Sayfalar/Haber/rize-artvin-havalimani-acildi.aspx',
  },
  {
    title: 'Yayla mevsimi',
    icon: '🌤️',
    text:
      'Yaylalar ve yayla şenlikleri yaz aylarında canlanır; yüksek yaylalarda hava hızla değişebilir. ' +
      'Yola çıkmadan önce Hava sekmesinden ilçenin tahminine bakın.',
  },
  {
    title: 'Acil durum',
    icon: '🚑',
    text: 'Ambulans, itfaiye, polis ve jandarma için tek numara: 112.',
  },
];

export const DISCOVER_SOURCES: { label: string; url: string }[] = [
  { label: 'Rize İl Kültür ve Turizm Müdürlüğü', url: `${KTB}` },
  { label: 'Kültür Portalı – Rize', url: `${PORTAL}` },
  { label: 'Rize Valiliği – Yaylalar', url: 'https://rize.gov.tr/yaylalar' },
  { label: 'GoTürkiye – Rize', url: 'https://goturkiye.com/rize' },
  { label: 'Türk Patent – Coğrafi İşaretler Portalı', url: 'https://ci.turkpatent.gov.tr' },
];

export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
