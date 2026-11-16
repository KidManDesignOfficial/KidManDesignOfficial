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
};

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
