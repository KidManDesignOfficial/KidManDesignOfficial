/** TYT Sosyal Bilimler: Tarih, Coğrafya, Felsefe, Din Kültürü ve Ahlak Bilgisi. */
import { EX, F, FLOW, H, P, TABLE, TIMELINE, TIP, UL, builder, card } from '../build.ts';

// ═════════════════════════════ TARİH ═════════════════════════════
const tr = builder('tyt-tarih');

tr.lesson(
  'milli-mucadele',
  12,
  'Mondros\'tan Lozan\'a Millî Mücadele\'nin hazırlık, örgütlenme ve askerî-siyasi aşamaları.',
  [
    H('Kronoloji'),
    TIMELINE(
      ['30 Ekim 1918', 'Mondros Ateşkes Antlaşması', '7. madde ile İtilaf Devletleri\'ne istedikleri yeri işgal hakkı tanındı.'],
      ['15 Mayıs 1919', 'İzmir\'in Yunanlar tarafından işgali', 'Kuvâ-yı Millîye\'nin doğuşunu hızlandırdı.'],
      ['19 Mayıs 1919', 'Mustafa Kemal Samsun\'a çıktı', 'Millî Mücadele fiilen başladı.'],
      ['22 Haziran 1919', 'Amasya Genelgesi', 'Gerekçe, amaç ve yöntem ilk kez belirlendi.'],
      ['23 Temmuz 1919', 'Erzurum Kongresi', 'Toplanış bakımından bölgesel, kararları bakımından ulusal.'],
      ['4 Eylül 1919', 'Sivas Kongresi', 'Tüm cemiyetler Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti\'nde birleşti.'],
      ['28 Ocak 1920', 'Misak-ı Millî', 'Son Osmanlı Mebusan Meclisi\'nde kabul edildi.'],
      ['23 Nisan 1920', 'TBMM açıldı', 'Millî egemenliğe dayalı yeni meclis.'],
      ['3 Aralık 1920', 'Gümrü Antlaşması', 'TBMM\'nin imzaladığı ilk uluslararası antlaşma.'],
      ['13 Eylül 1921', 'Sakarya Meydan Muharebesi zaferi', 'Yunan ilerleyişi kesin olarak durduruldu.'],
      ['20 Ekim 1921', 'Ankara Antlaşması', 'Fransa ile imzalandı; Güney Cephesi kapandı.'],
      ['30 Ağustos 1922', 'Başkomutanlık Meydan Muharebesi', 'Büyük Taarruz\'un zaferle sonuçlanması.'],
      ['11 Ekim 1922', 'Mudanya Ateşkesi', 'İstanbul ve Boğazlar savaşsız kurtarıldı.'],
      ['24 Temmuz 1923', 'Lozan Barış Antlaşması', 'Yeni Türk devletinin bağımsızlığı uluslararası alanda tanındı.'],
    ),
    H('Kongre ve genelgeler'),
    TABLE(
      ['Belge / Kongre', 'Öne çıkan özellik'],
      ['Amasya Genelgesi', '"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır." → millî egemenliğe ilk vurgu'],
      ['Erzurum Kongresi', 'Manda ve himaye ilk kez reddedildi; Temsil Heyeti kuruldu.'],
      ['Sivas Kongresi', 'Manda ve himaye kesin olarak reddedildi; Temsil Heyeti tüm yurdu temsil etti; İrade-i Millîye gazetesi.'],
      ['Misak-ı Millî', 'Millî sınırlar ve tam bağımsızlık ilkesi belirlendi.'],
    ),
    TIP('"İlk kez" ve "kesin olarak" ifadelerine dikkat: manda ve himaye Erzurum\'da İLK KEZ, Sivas\'ta KESİN olarak reddedilmiştir.'),
  ],
  [
    card('Manda ilk kez reddedildi', 'Erzurum Kongresi'),
    card('TBMM\'nin ilk uluslararası antlaşması', 'Gümrü Antlaşması (3 Aralık 1920)'),
    card('Fransa ile imzalanan antlaşma', 'Ankara Antlaşması (20 Ekim 1921)'),
  ],
);

tr.q('milli-mucadele', 'Manda ve himayenin ilk kez reddedildiği toplantı aşağıdakilerden hangisidir?', ['Amasya Genelgesi', 'Erzurum Kongresi', 'Sivas Kongresi', 'Misak-ı Millî', 'Balıkesir Kongresi'], 'B', 'Manda ve himaye Erzurum Kongresi\'nde ilk kez reddedilmiş, Sivas Kongresi\'nde ise kesin olarak reddedilmiştir.', 1);
tr.q('milli-mucadele', '"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır." ifadesi aşağıdakilerden hangisinde yer alır?', ['Amasya Genelgesi', 'Havza Genelgesi', 'Erzurum Kongresi Bildirisi', 'Misak-ı Millî', 'Sivas Kongresi Bildirisi'], 'A', 'Bu ifade 22 Haziran 1919 tarihli Amasya Genelgesi\'ndedir ve millî egemenliğe yapılan ilk vurgu kabul edilir.', 1);
tr.q('milli-mucadele', 'Sakarya Meydan Muharebesi\'nden sonra imzalanan antlaşmalardan hangisi Fransa ile yapılmıştır?', ['Gümrü Antlaşması', 'Moskova Antlaşması', 'Kars Antlaşması', 'Ankara Antlaşması', 'Mudanya Ateşkesi'], 'D', '20 Ekim 1921 Ankara Antlaşması Fransa ile imzalandı ve Güney Cephesi kapandı. Kars Antlaşması Kafkas cumhuriyetleriyle imzalanmıştır.', 2);
tr.q('milli-mucadele', 'TBMM\'nin imzaladığı ilk uluslararası antlaşma aşağıdakilerden hangisidir?', ['Moskova Antlaşması', 'Gümrü Antlaşması', 'Kars Antlaşması', 'Ankara Antlaşması', 'Lozan Antlaşması'], 'B', 'Doğu Cephesi\'nde Ermenistan ile imzalanan Gümrü Antlaşması (3 Aralık 1920) TBMM\'nin ilk uluslararası antlaşmasıdır.', 1);
tr.q('milli-mucadele', 'Aşağıdaki gelişmelerden hangisi diğerlerinden daha önce gerçekleşmiştir?', ['TBMM\'nin açılması', 'Sakarya Meydan Muharebesi', 'Sivas Kongresi', 'Mudanya Ateşkesi', 'Lozan Antlaşması'], 'C', 'Sivas Kongresi Eylül 1919; TBMM Nisan 1920; Sakarya 1921; Mudanya 1922; Lozan 1923.', 2);

tr.lesson(
  'ataturkculuk',
  11,
  'Atatürk ilkeleri ve siyasi, hukuki, eğitim-kültür, toplumsal ve ekonomik alandaki inkılaplar.',
  [
    H('Atatürk ilkeleri'),
    TABLE(
      ['İlke', 'Özü'],
      ['Cumhuriyetçilik', 'Egemenliğin millete ait olduğu, seçimle gelen yönetim'],
      ['Milliyetçilik', 'Ortak geçmiş, dil ve ülküye dayalı birleştirici millet anlayışı'],
      ['Halkçılık', 'Kanun önünde eşitlik, ayrıcalıkların reddi'],
      ['Devletçilik', 'Özel sektörün yetersiz kaldığı alanlarda devletin ekonomiye katılması'],
      ['Laiklik', 'Din ve devlet işlerinin ayrılması, din ve vicdan özgürlüğü'],
      ['İnkılapçılık', 'Yapılan inkılapların korunması ve çağdaşlaşmanın sürdürülmesi'],
    ),
    H('İnkılaplar'),
    TIMELINE(
      ['1 Kasım 1922', 'Saltanatın kaldırılması'],
      ['29 Ekim 1923', 'Cumhuriyetin ilanı'],
      ['3 Mart 1924', 'Halifeliğin kaldırılması, Tevhid-i Tedrisat Kanunu', 'Eğitim-öğretim birleştirildi.'],
      ['1925', 'Şapka Kanunu; tekke, zaviye ve türbelerin kapatılması; uluslararası takvim ve saat'],
      ['17 Şubat 1926', 'Türk Medeni Kanunu', 'Hukuk birliği; kadın-erkek eşitliği'],
      ['1 Kasım 1928', 'Yeni Türk harflerinin kabulü', 'Ardından Millet Mektepleri açıldı.'],
      ['1930 – 1934', 'Kadınlara belediye (1930), muhtarlık (1933), milletvekili seçme-seçilme (1934) hakkı'],
      ['1931 – 1932', 'Türk Tarih Kurumu ve Türk Dil Kurumu\'nun temelleri'],
      ['1934', 'Soyadı Kanunu'],
      ['1937', 'Atatürk ilkeleri (laiklik dahil) anayasaya girdi'],
    ),
    TIP('Bir inkılabın hangi alanda yapıldığını sorarken amacına bakın: Medeni Kanun → hukuk, Tevhid-i Tedrisat → eğitim, Soyadı → toplumsal hayat.'),
  ],
  [card('Kadınlara milletvekili seçme-seçilme hakkı', '5 Aralık 1934'), card('Laiklik anayasada', '1937'), card('Eğitimde birlik', 'Tevhid-i Tedrisat (3 Mart 1924)')],
);

tr.q('ataturkculuk', 'Ekonomide özel sektörün yetersiz kaldığı alanlarda devletin yatırım yapmasını öngören Atatürk ilkesi aşağıdakilerden hangisidir?', ['Halkçılık', 'Devletçilik', 'Laiklik', 'İnkılapçılık', 'Milliyetçilik'], 'B', 'Devletçilik ilkesi, özel teşebbüsün yetersiz kaldığı alanlarda devletin ekonomik hayata katılmasını öngörür (1930\'lardaki kalkınma planları).', 1);
tr.q('ataturkculuk', 'Türk kadınına milletvekili seçme ve seçilme hakkı hangi yıl tanınmıştır?', ['1926', '1930', '1933', '1934', '1946'], 'D', '5 Aralık 1934\'te yapılan anayasa değişikliğiyle kadınlara milletvekili seçme ve seçilme hakkı tanındı.', 1);
tr.q('ataturkculuk', 'Laiklik ilkesi Türkiye Cumhuriyeti anayasasına hangi yıl girmiştir?', ['1924', '1928', '1931', '1934', '1937'], 'E', '1937 anayasa değişikliğiyle Atatürk ilkeleri, dolayısıyla laiklik anayasaya eklendi. 1928\'de ise "Devletin dini İslam\'dır" maddesi çıkarılmıştı.', 2);
tr.q('ataturkculuk', 'Tevhid-i Tedrisat Kanunu\'nun temel amacı aşağıdakilerden hangisidir?', ['Yeni harflerin kabul edilmesi', 'Eğitim ve öğretimin tek çatı altında birleştirilmesi', 'Kadınlara siyasi hak tanınması', 'Ölçü birimlerinin standartlaştırılması', 'Hukuk birliğinin sağlanması'], 'B', '3 Mart 1924\'te kabul edilen kanunla tüm eğitim kurumları Maarif Vekâleti\'ne bağlandı.', 1);
tr.q('ataturkculuk', 'Aşağıdakilerden hangisi hukuk alanında yapılmış bir inkılaptır?', ['Şapka Kanunu', 'Harf İnkılabı', 'Türk Medeni Kanunu\'nun kabulü', 'Ölçüler Kanunu', 'Tekke ve zaviyelerin kapatılması'], 'C', '1926\'da kabul edilen Türk Medeni Kanunu hukuk birliğini sağlamış, aile ve kadın haklarında köklü değişiklikler getirmiştir.', 1);

// ═════════════════════════════ COĞRAFYA ═════════════════════════════
const cg = builder('tyt-cog');

cg.lesson(
  'dunya-hareketleri',
  9,
  'Dünya\'nın günlük ve yıllık hareketi, yerel saat hesabı ve mevsimlerin oluşumu.',
  [
    H('Günlük hareket (kendi ekseni etrafında)'),
    P('Dünya batıdan doğuya doğru 24 saatte bir tur atar. Bu nedenle doğudaki yerler Güneş\'i daha önce görür ve yerel saatleri ileridir.'),
    F('Yerel saat', '1° boylam farkı = 4 dakika', '15° boylam farkı = 1 saat', 'Doğuya gidildikçe saat İLERİ, batıya gidildikçe GERİ'),
    UL('Sonuçları: Gece-gündüzün ardalanması, yerel saat farkları, günlük sıcaklık farkları, cisimlerin sapması (Coriolis), Güneş\'in doğuşu ve batışının farklı saatlerde görülmesi.'),
    EX('30° D boylamında yerel saat 14.00 iken 75° D boylamında yerel saat kaçtır?', ['Boylam farkı: 75 − 30 = 45°', '45 · 4 = 180 dk = 3 saat', '75° D daha doğuda → saat ileri: 14.00 + 3'], '17.00'),
    H('Yıllık hareket (Güneş etrafında)'),
    P('Dünya Güneş etrafındaki bir turunu 365 gün 6 saatte tamamlar. Eksen eğikliği (23° 27′) ile birlikte bu hareket mevsimleri oluşturur.'),
    TABLE(['Tarih', 'Kuzey Yarım Küre\'de durum'], ['21 Mart', 'Gece-gündüz eşit (ilkbahar ekinoksu)'], ['21 Haziran', 'En uzun gündüz (yaz gündönümü)'], ['23 Eylül', 'Gece-gündüz eşit (sonbahar ekinoksu)'], ['21 Aralık', 'En uzun gece (kış gündönümü)']),
    TIP('Mevsimler günlük harekete DEĞİL, yıllık hareket ve eksen eğikliğine bağlıdır.', 'warn'),
  ],
  [card('1° boylam', '4 dakika'), card('21 Haziran (KYK)', 'En uzun gündüz')],
);

cg.q('dunya-hareketleri', 'Aralarında 30° boylam farkı bulunan iki merkez arasındaki yerel saat farkı ne kadardır?', ['30 dakika', '1 saat', '2 saat', '3 saat', '4 saat'], 'C', 'Her 1° boylam 4 dakika: 30 · 4 = 120 dakika = 2 saat.', 1);
cg.q('dunya-hareketleri', 'Kuzey Yarım Küre\'de en uzun gündüzün yaşandığı tarih aşağıdakilerden hangisidir?', ['21 Mart', '21 Haziran', '23 Eylül', '21 Aralık', '1 Ocak'], 'B', '21 Haziran\'da Güneş ışınları Yengeç Dönencesi\'ne dik gelir; Kuzey Yarım Küre\'de en uzun gündüz yaşanır.', 1);
cg.q('dunya-hareketleri', 'Aşağıdakilerden hangisi Dünya\'nın kendi ekseni etrafında dönmesinin bir sonucu DEĞİLDİR?', ['Gece ve gündüzün ardalanması', 'Yerel saat farklarının oluşması', 'Mevsimlerin oluşması', 'Rüzgârların sapması', 'Günlük sıcaklık farklarının oluşması'], 'C', 'Mevsimler, Dünya\'nın Güneş etrafındaki yıllık hareketi ve eksen eğikliğinin sonucudur.', 2);
cg.q('dunya-hareketleri', '30° Doğu boylamında yerel saat 14.00 iken 75° Doğu boylamında yerel saat kaçtır?', ['11.00', '12.00', '13.00', '17.00', '18.00'], 'D', '45° fark × 4 dk = 3 saat. 75° D daha doğuda olduğu için saati ileridir: 17.00.', 2);

cg.lesson(
  'iklim',
  10,
  'Hava durumu ile iklim farkı, sıcaklığı etkileyen etmenler ve Türkiye\'deki iklim tipleri.',
  [
    H('Hava durumu ve iklim'),
    P('Hava durumu kısa süreli (saatlik, günlük) atmosfer koşullarıdır. İklim ise geniş bir alanda uzun yıllar boyunca gözlenen ortalama koşullardır.'),
    H('Sıcaklığı etkileyen etmenler'),
    UL('Enlem: Ekvatordan kutuplara gidildikçe sıcaklık azalır.', 'Yükselti: Her 200 m\'de yaklaşık 1 °C azalır.', 'Karasallık: Denizden uzaklaştıkça sıcaklık farkları artar.', 'Bakı: Kuzey Yarım Küre\'de güneye bakan yamaçlar daha sıcaktır.', 'Okyanus akıntıları ve rüzgârlar.'),
    H('Türkiye\'de iklim tipleri'),
    TABLE(['İklim', 'Yaz', 'Kış', 'Bitki örtüsü'], ['Akdeniz', 'Sıcak ve kurak', 'Ilık ve yağışlı', 'Maki'], ['Karadeniz', 'Serin ve yağışlı', 'Ilık ve yağışlı', 'Orman'], ['Karasal', 'Sıcak ve kurak', 'Soğuk ve kar yağışlı', 'Bozkır']),
    TIP('Karadeniz ikliminin ayırt edici özelliği "her mevsim yağışlı" olmasıdır; en fazla yağış sonbahardadır.'),
    FLOW('Bakı etkisi (KYK)', 'Güneye bakan yamaç', 'Güneş ışınlarını daha dik açıyla alır', 'Daha sıcak; kar daha erken erir; tarım ve yerleşme daha yukarıda'),
  ],
  [card('Yükselti etkisi', 'Her 200 m\'de ≈ 1 °C azalma'), card('Karadeniz iklimi', 'Her mevsim yağışlı, orman')],
);

cg.q('iklim', 'Yükselti arttıkça sıcaklık genel olarak her 200 metrede yaklaşık kaç °C azalır?', ['0,5', '1', '2', '5', '10'], 'B', 'Sıcaklık her 100 m\'de yaklaşık 0,5 °C, yani her 200 m\'de yaklaşık 1 °C azalır.', 1);
cg.q('iklim', 'Aşağıdakilerden hangisi iklimle değil, hava durumuyla ilgili bir ifadedir?', ['Akdeniz kıyılarında yazlar sıcak ve kurak geçer.', 'Karadeniz Bölgesi her mevsim yağış alır.', 'Yarın İstanbul\'da öğleden sonra sağanak yağış bekleniyor.', 'İç Anadolu\'da kışlar soğuk ve kar yağışlıdır.', 'Doğu Anadolu\'da karasallık etkisi fazladır.'], 'C', 'Belirli bir gün ve saate ait kısa süreli bilgi hava durumudur. Diğerleri uzun yılların ortalamasını anlatır.', 1);
cg.q('iklim', 'Her mevsim yağışlı olan ve doğal bitki örtüsü orman olan iklim tipi aşağıdakilerden hangisidir?', ['Akdeniz iklimi', 'Karasal iklim', 'Karadeniz iklimi', 'Çöl iklimi', 'Tundra iklimi'], 'C', 'Karadeniz ikliminde yağış yıl boyunca görülür; nemli ortam orman gelişimini sağlar.', 1);
cg.q('iklim', 'Kuzey Yarım Küre\'deki bir dağın güneye bakan yamaçlarıyla ilgili aşağıdakilerden hangisi söylenebilir?', ['Daha az güneş enerjisi alır.', 'Kar örtüsü daha uzun süre kalır.', 'Orman üst sınırı daha alçaktadır.', 'Güneş ışınlarını daha dik açıyla alır ve daha sıcaktır.', 'Tarım alanları daha alçakta sona erer.'], 'D', 'Kuzey Yarım Küre\'de Güneş güneyden geldiği için güneye bakan yamaçlar ışınları daha dik alır; sıcaklık, tarım ve yerleşme sınırı daha yüksektir.', 2);

// ═════════════════════════════ FELSEFE ═════════════════════════════
const fl = builder('tyt-felsefe');

fl.lesson(
  'felsefeyi-tanima',
  8,
  'Felsefenin anlamı, felsefi düşüncenin özellikleri ve temel alanları.',
  [
    H('Felsefe nedir?'),
    P('"Felsefe" sözcüğü Yunanca "philo" (sevgi) ve "sophia" (bilgelik) sözcüklerinden türemiştir: bilgelik sevgisi. Felsefe; varlık, bilgi ve değer üzerine akla dayalı, eleştirel ve sistemli düşünme etkinliğidir.'),
    H('Felsefi düşüncenin özellikleri'),
    UL('Eleştirel ve sorgulayıcıdır.', 'Refleksiftir (düşünce üzerine düşünür).', 'Sistemli ve tutarlıdır.', 'Evrenseldir; kesin ve mutlak sonuçlar ortaya koymaz.', 'Akla ve mantığa dayanır; deney ve gözlemle doğrulanmaz.'),
    TIP('"Deney ve gözlemle kesin sonuçlara ulaşır" ifadesi bilimsel bilginin özelliğidir, felsefenin değil.', 'warn'),
    H('Felsefenin temel alanları'),
    TABLE(['Alan', 'Temel soru'], ['Varlık (ontoloji)', 'Varlık nedir? Gerçekten var olan nedir?'], ['Bilgi (epistemoloji)', 'Doğru bilgi mümkün müdür?'], ['Ahlak (etik)', 'İyi nedir? Evrensel bir ahlak yasası var mıdır?'], ['Sanat (estetik)', 'Güzel nedir?'], ['Siyaset', 'En iyi yönetim biçimi hangisidir?'], ['Din felsefesi', 'Tanrı\'nın varlığı akılla kanıtlanabilir mi?'], ['Bilim felsefesi', 'Bilimsel yöntem nedir?']),
    H('İlk filozoflar'),
    P('Felsefe MÖ 6. yüzyılda İyonya\'da (Batı Anadolu) doğdu. İlk filozof kabul edilen Thales, evrenin ana maddesini (arkhe) "su" olarak açıkladı. Anaksimenes havayı, Herakleitos ateşi, Pythagoras sayıyı, Demokritos atomu arkhe olarak gördü.'),
  ],
  [card('Philosophia', 'Bilgelik sevgisi'), card('İlk filozof ve arkhesi', 'Thales — su')],
);

fl.q('felsefeyi-tanima', '"Felsefe" sözcüğünün kökeni olan "philosophia" ne anlama gelir?', ['Akıl yürütme', 'Bilgelik sevgisi', 'Doğru bilgi', 'Varlık bilgisi', 'Düşünce sanatı'], 'B', 'Philo (sevgi) + sophia (bilgelik) = bilgelik sevgisi.', 1);
fl.q('felsefeyi-tanima', 'Aşağıdakilerden hangisi felsefi düşüncenin özelliklerinden biri DEĞİLDİR?', ['Eleştirel olması', 'Sorgulayıcı olması', 'Deney ve gözlemle kesin sonuçlara ulaşması', 'Sistemli olması', 'Refleksif olması'], 'C', 'Deney ve gözleme dayanıp kesin sonuçlara ulaşmak bilimsel bilginin özelliğidir. Felsefe akıl yürütmeye dayanır.', 1);
fl.q('felsefeyi-tanima', 'Aşağıdaki sorulardan hangisi bilgi felsefesinin (epistemoloji) alanına girer?', ['Varlığın ilk nedeni nedir?', 'Doğru bilgi mümkün müdür?', 'İyi ve kötünün ölçütü nedir?', 'Güzel nedir?', 'En iyi yönetim biçimi hangisidir?'], 'B', 'Bilginin imkânı, kaynağı ve sınırları epistemolojinin konusudur. Diğerleri sırasıyla ontoloji, ahlak, estetik ve siyaset felsefesine aittir.', 1);
fl.q('felsefeyi-tanima', 'İlk filozof kabul edilen ve evrenin ana maddesini (arkhe) su olarak açıklayan düşünür kimdir?', ['Herakleitos', 'Thales', 'Anaksimenes', 'Pythagoras', 'Demokritos'], 'B', 'Miletli Thales arkheyi su olarak açıklamıştır. Anaksimenes hava, Herakleitos ateş, Pythagoras sayı, Demokritos atom demiştir.', 1);

fl.lesson(
  'bilgi',
  10,
  'Doğru bilginin imkânı, kaynağı ve ölçütü konusundaki temel görüşler ve filozoflar.',
  [
    H('Doğru bilgi mümkün müdür?'),
    UL('Mümkün değildir: Sofistler (Protagoras: "İnsan her şeyin ölçüsüdür", Gorgias) ve septikler (Pyrrhon).', 'Mümkündür: Diğer görüşler, bilginin kaynağı konusunda ayrışır.'),
    H('Bilginin kaynağı'),
    TABLE(
      ['Görüş', 'Kaynak', 'Temsilciler'],
      ['Rasyonalizm (akılcılık)', 'Akıl; doğuştan ilkeler', 'Platon, Descartes, Leibniz, Farabi'],
      ['Empirizm (deneycilik)', 'Deney; zihin boş levhadır (tabula rasa)', 'John Locke, Hume, Berkeley'],
      ['Kritisizm (eleştiricilik)', 'Akıl + deney; içerik deneyden, form akıldan', 'Immanuel Kant'],
      ['Entüisyonizm (sezgicilik)', 'Sezgi', 'Bergson, Gazali'],
      ['Pozitivizm', 'Olgulara dayalı bilimsel bilgi', 'Auguste Comte'],
      ['Pragmatizm', 'Doğruluk = işe yararlılık, fayda', 'William James, John Dewey'],
      ['Fenomenoloji', 'Özün görülmesi (öz bilgisi)', 'Edmund Husserl'],
      ['Analitik felsefe', 'Dilin analizi', 'Wittgenstein, Russell'],
    ),
    TIP('Descartes\'ın şüphesi YÖNTEMSEL şüphedir: kesin bilgiye ulaşmak için şüpheyi araç olarak kullanır. "Düşünüyorum, öyleyse varım." Bu yüzden septik değil rasyonalisttir.', 'warn'),
    EX('"Bir düşünce işe yarıyor ve sorun çözüyorsa doğrudur." görüşü hangi akıma aittir?', ['Doğruluk ölçütü fayda/işe yararlılık olarak belirlenmiş.'], 'Pragmatizm'),
  ],
  [card('Tabula rasa', 'John Locke — empirizm'), card('Kant', 'Kritisizm: akıl + deney'), card('Doğruluk = fayda', 'Pragmatizm')],
);

fl.q('bilgi', '"İnsan zihni doğuşta boş bir levha (tabula rasa) gibidir; tüm bilgiler deneyle edinilir." görüşü aşağıdaki filozoflardan hangisine aittir?', ['Descartes', 'Platon', 'John Locke', 'Kant', 'Bergson'], 'C', 'Tabula rasa kavramı empirist (deneyci) filozof John Locke ile özdeşleşmiştir.', 1);
fl.q('bilgi', '"Bilginin içeriğini deney, biçimini akıl sağlar." görüşünü savunan akım aşağıdakilerden hangisidir?', ['Rasyonalizm', 'Empirizm', 'Kritisizm', 'Pozitivizm', 'Entüisyonizm'], 'C', 'Kant\'ın kritisizmi akılcılık ve deneyciliği uzlaştırır: Algısız kavramlar boş, kavramsız algılar kördür.', 2);
fl.q('bilgi', 'Doğru bilginin mümkün olmadığını savunan görüş aşağıdakilerden hangisidir?', ['Rasyonalizm', 'Empirizm', 'Septisizm', 'Pozitivizm', 'Pragmatizm'], 'C', 'Septisizm (kuşkuculuk) kesin bilginin elde edilemeyeceğini ileri sürer; temsilcisi Pyrrhon\'dur.', 1);
fl.q('bilgi', '"Bir bilginin doğruluğunun ölçütü, pratik hayatta işe yarayıp yaramamasıdır." görüşü hangi akıma aittir?', ['Fenomenoloji', 'Pragmatizm', 'Analitik felsefe', 'Rasyonalizm', 'Entüisyonizm'], 'B', 'Pragmatizm (W. James, J. Dewey) bilginin doğruluğunu faydasıyla ölçer.', 1);

// ═════════════════════════════ DİN KÜLTÜRÜ ═════════════════════════════
const dn = builder('tyt-din');

dn.lesson(
  'ibadet',
  9,
  'İslam\'ın inanç esasları, temel kaynakları ve başlıca ibadetler; zekâtın kimlere verileceği.',
  [
    H('İmanın şartları'),
    UL('Allah\'a iman', 'Meleklere iman', 'Kitaplara iman', 'Peygamberlere iman', 'Ahiret gününe iman', 'Kader ve kazaya iman'),
    H('İslam\'ın temel kaynakları'),
    P('Kur\'an-ı Kerim birinci kaynaktır. Sünnet ise Hz. Muhammed\'in söz, fiil ve onaylarının bütünüdür ve Kur\'an\'ı açıklar.'),
    H('Başlıca ibadetler'),
    TABLE(['İbadet', 'Temel bilgi'], ['Namaz', 'Günde beş vakit; bedenle yapılan ibadet'], ['Oruç', 'Ramazan ayında; nefis terbiyesi'], ['Zekât', 'Nisap miktarı mala sahip olanın malının belirli oranını (para ve ticaret malında kırkta bir, %2,5) vermesi'], ['Hac', 'Gücü yetene ömründe bir kez farz; hem mal hem bedenle']),
    H('Zekât kimlere verilir?'),
    P('Kur\'an\'a göre (Tevbe, 60) zekât; fakirlere, yoksullara, zekât toplamakla görevlilere, kalpleri İslam\'a ısındırılacak olanlara, kölelere, borçlulara, Allah yolunda olanlara ve yolda kalmışlara verilir.'),
    TIP('Zekât; kişinin anne-babasına, dedesine, çocuklarına, torunlarına ve eşine verilmez, çünkü bunların bakımı zaten kişinin sorumluluğundadır.', 'warn'),
  ],
  [card('İmanın şartları', '6: Allah, melekler, kitaplar, peygamberler, ahiret, kader'), card('Zekât oranı', 'Kırkta bir (%2,5)')],
);

dn.q('ibadet', 'Aşağıdakilerden hangisi imanın şartlarından biri değildir?', ['Allah\'a iman', 'Meleklere iman', 'Zekât vermek', 'Ahirete iman', 'Kadere iman'], 'C', 'Zekât bir ibadettir (İslam\'ın şartlarındandır); imanın şartları arasında yer almaz.', 1);
dn.q('ibadet', 'Hz. Muhammed\'in söz, davranış ve onaylarının bütününe ne ad verilir?', ['Fıkıh', 'Sünnet', 'İcma', 'Kıyas', 'Tefsir'], 'B', 'Sünnet, Kur\'an\'dan sonra İslam\'ın ikinci temel kaynağıdır.', 1);
dn.q('ibadet', 'Nisap miktarı paraya sahip bir Müslüman zekât olarak malının ne kadarını verir?', ['Onda bir', 'Yirmide bir', 'Kırkta bir', 'Ellide bir', 'Yüzde bir'], 'C', 'Para, altın ve ticaret mallarında zekât oranı kırkta bir, yani %2,5\'tir.', 1);
dn.q('ibadet', 'Aşağıdakilerden hangisine zekât verilemez?', ['Borçlulara', 'Yolda kalmışlara', 'Fakirlere', 'Anne ve babaya', 'Yoksullara'], 'D', 'Kişinin bakmakla yükümlü olduğu anne-baba, eş, çocuk ve torunlarına zekât verilmez.', 1);

dn.lesson(
  'hz-muhammed',
  9,
  'Hz. Muhammed\'in hayatındaki dönüm noktaları: doğumdan vahye, hicretten Veda Haccı\'na.',
  [
    TIMELINE(
      ['571', 'Mekke\'de doğdu'],
      ['610', 'Hira Mağarası\'nda ilk vahiy', '"Oku!" emriyle peygamberlik başladı.'],
      ['613', 'Açıktan davet'],
      ['615', 'Habeşistan\'a hicret', 'Baskılar nedeniyle bir grup Müslüman göç etti.'],
      ['619', 'Hüzün yılı', 'Hz. Hatice ve Ebu Talip vefat etti.'],
      ['622', 'Medine\'ye hicret', 'Hicri takvimin başlangıcı.'],
      ['624', 'Bedir Savaşı'],
      ['625', 'Uhud Savaşı'],
      ['627', 'Hendek Savaşı'],
      ['628', 'Hudeybiye Antlaşması', 'Müşrikler Müslümanları ilk kez siyasi olarak tanıdı.'],
      ['630', 'Mekke\'nin fethi'],
      ['632', 'Veda Haccı ve vefatı'],
    ),
    TIP('Hicret takvimin başlangıcı olarak Hz. Ömer döneminde kabul edilmiştir.', 'info'),
    H('Örnek ahlakı'),
    P('Peygamberliğinden önce bile dürüstlüğüyle "el-Emin" (güvenilir) olarak tanınmıştır. Merhamet, adalet, tevazu ve sabır onun ahlakının öne çıkan yönleridir.'),
  ],
  [card('Hicri takvimin başlangıcı', '622 — Medine\'ye hicret'), card('İlk vahiy', '610 — Hira Mağarası')],
);

dn.q('hz-muhammed', 'Hicri takvimin başlangıcı olarak kabul edilen olay aşağıdakilerden hangisidir?', ['İlk vahyin gelmesi', 'Habeşistan\'a hicret', 'Medine\'ye hicret', 'Bedir Savaşı', 'Mekke\'nin fethi'], 'C', '622\'deki Medine\'ye hicret, Hz. Ömer döneminde takvimin başlangıcı olarak kabul edildi.', 1);
dn.q('hz-muhammed', 'Mekkeli müşriklerin Müslümanları ilk kez siyasi bir topluluk olarak tanıdığı antlaşma aşağıdakilerden hangisidir?', ['Akabe Biatları', 'Medine Sözleşmesi', 'Hudeybiye Antlaşması', 'Veda Hutbesi', 'Mekke\'nin fethi'], 'C', '628\'deki Hudeybiye Antlaşması ile Mekkeliler Müslümanları muhatap kabul etmiştir.', 2);
dn.q('hz-muhammed', 'Hz. Muhammed\'e ilk vahyin geldiği yer aşağıdakilerden hangisidir?', ['Sevr Mağarası', 'Hira Mağarası', 'Kâbe', 'Mescid-i Nebevi', 'Arafat'], 'B', 'İlk vahiy 610 yılında Hira Mağarası\'nda gelmiştir. Sevr Mağarası hicret sırasında saklanılan yerdir.', 1);
dn.q('hz-muhammed', 'Aşağıdaki olaylardan hangisi diğerlerinden önce gerçekleşmiştir?', ['Bedir Savaşı', 'Habeşistan\'a hicret', 'Hendek Savaşı', 'Mekke\'nin fethi', 'Veda Haccı'], 'B', 'Habeşistan\'a hicret 615\'te, Medine\'ye hicretten (622) önce gerçekleşmiştir. Diğerleri 624–632 arasındadır.', 2);

export default [tr.done(), cg.done(), fl.done(), dn.done()];
