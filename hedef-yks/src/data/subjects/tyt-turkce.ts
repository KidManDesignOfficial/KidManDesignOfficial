import { EX, FLOW, H, P, TABLE, TIP, UL, builder, card } from '../build.ts';

const b = builder('tyt-turkce');

// ── Sözcükte Anlam ──────────────────────────────────────────────
b.lesson(
  'sozcukte-anlam',
  8,
  'Bir sözcüğün cümledeki anlamını, bağlamdan yola çıkarak belirlemeyi öğreneceğiz.',
  [
    H('Gerçek, yan ve mecaz anlam'),
    P('Sözcüğün akla gelen ilk ve temel anlamına gerçek (temel) anlam denir. Gerçek anlamla ilgisini koruyarak kazanılan yeni anlamlar yan anlam, gerçek anlamından tamamen uzaklaşan kullanımlar ise mecaz anlamdır.'),
    TABLE(
      ['Anlam', 'Örnek', 'Açıklama'],
      ['Gerçek', 'Sıcak çorba içtik.', 'Isısı yüksek'],
      ['Yan', 'Masanın ayağı kırıldı.', 'Ayak → taşıyıcı bölüm'],
      ['Mecaz', 'Bize çok sıcak davrandı.', 'Sıcak → içten, samimi'],
      ['Terim', 'Bu açı 90 dereceden büyük.', 'Bir bilim/sanat dalına özgü'],
    ),
    H('Anlam olayları'),
    UL(
      'Ad aktarması (mecaz-ı mürsel): Benzetme amacı olmadan bir sözcüğün yerine ilgili başka bir sözcüğün kullanılması. "Bütün salon ayağa kalktı." (salon → içindekiler)',
      'Deyim aktarması: Benzetme yoluyla ad verme. "Dağın eteği", "çaydanlığın kulpu"',
      'Dolaylama: Bir kavramı birden çok sözcükle anlatma. "Çanakkale" yerine "Boğaz şehri" gibi.',
      'Somutlaşma / soyutlaşma: Soyut kavramı somut sözcükle anlatma ("ağır söz") ya da tersi.',
      'Duyular arası aktarma: Bir duyuya ait niteliği başka duyu için kullanma. "Acı bir ses" (tat → işitme)',
      'Güzel adlandırma (hüsnütabir): Kaba ya da hoş olmayan sözün yerine daha hoş olanı kullanma. "Vefat etti"',
    ),
    TIP('Soru kökünde "altı çizili sözcük" ifadesi varsa sözcüğü cümleden çıkarıp yerine eş anlamlısını koyarak deneyin; anlam değişmeden oturan seçenek doğru yanıta yaklaşır.'),
    H('Anlam ilişkileri'),
    UL(
      'Eş anlamlı: Yazılışları farklı, anlamları aynı (siyah – kara)',
      'Zıt anlamlı: Anlamca karşıt (uzun – kısa). "Gelmek – gelmemek" zıt anlam değil, olumsuzluktur.',
      'Eş sesli (sesteş): Yazılışı aynı, anlamı ilgisiz (yüz: çehre / 100 / yüzmek)',
      'Genel – özel ve parça – bütün ilişkisi (meyve – elma, yaprak – ağaç)',
    ),
    EX(
      '"Soğuk" sözcüğü hangi cümlede mecaz anlamdadır? I. Soğuk suyla yıkandı.  II. Bize soğuk bir selam verdi.',
      ['I. cümlede su gerçekten düşük sıcaklıktadır → gerçek anlam.', 'II. cümlede "soğuk" ilgisiz, mesafeli anlamındadır → mecaz.'],
      'II. cümle',
    ),
  ],
  [
    card('Duyular arası aktarma', 'Bir duyunun niteliğini başka duyu için kullanmak: "tatlı ses", "keskin koku".'),
    card('Ad aktarması', 'Benzetme amacı olmadan ilgili başka sözcükle anlatmak: "Ankara açıklama yaptı."'),
    card('Zıt anlam ≠ olumsuzluk', '"Gelmek – gelmemek" zıt anlamlı değildir; "gelmek – gitmek" zıt anlamlıdır.'),
  ],
);

b.q('sozcukte-anlam', 'Aşağıdaki cümlelerin hangisinde «» içindeki sözcük mecaz anlamda kullanılmıştır?', [
  'Çocuk «sıcak» sütü yavaş yavaş içti.',
  'Bu odanın duvarları çok «ince».',
  'Toplantıda bize çok «soğuk» davrandı.',
  'Bahçedeki «yüksek» ağaçları budadık.',
  'Masanın üzerindeki «kırık» bardağı topladım.',
], 'C', '"Soğuk davranmak" ilgisiz, mesafeli davranmak demektir; sözcük gerçek anlamından (düşük sıcaklık) uzaklaşmıştır. Diğerlerinde sözcükler gerçek anlamdadır.', 1);

b.q('sozcukte-anlam', 'Aşağıdakilerin hangisinde duyular arası aktarma vardır?', [
  'Kapının ardından acı bir ses duydum.',
  'Sabah erkenden yola çıktık.',
  'Kitabın son sayfalarını okuyamadım.',
  'Kapıyı yavaşça kapattı.',
  'Ağaçların gölgesinde dinlendik.',
], 'A', '"Acı" tat duyusuna ait bir niteliktir; burada işitme duyusuyla algılanan "ses" için kullanılmıştır.', 1);

b.q('sozcukte-anlam', 'Aşağıdaki cümlelerin hangisinde ad aktarması (mecaz-ı mürsel) yapılmıştır?', [
  'Dün akşam çok güzel bir film izledik.',
  'Kardeşim okula yeni başladı.',
  'Konser bitince bütün salon ayağa kalktı.',
  'Öğretmen tahtaya bir soru yazdı.',
  'Yağmur sabaha kadar durmadan yağdı.',
], 'C', 'Ayağa kalkan salon değil, salondaki insanlardır. Benzetme amacı gütmeden "içindekiler" yerine "salon" denmiştir.', 2);

b.q('sozcukte-anlam', 'Aşağıdakilerin hangisinde «» içindeki sözcük terim anlamıyla kullanılmıştır?', [
  'Bu «açı» 90 dereceden büyük olduğu için geniş açıdır.',
  'Olaya farklı bir «açı»dan bakmalısın.',
  'Ona çok «ağır» sözler söyledi.',
  'Yüzünde «derin» bir iz vardı.',
  'Herkes onun «tatlı» dilini sever.',
], 'A', '"Açı" ilk seçenekte geometri terimidir. İkinci seçenekte "bakış açısı" anlamında mecazdır.', 1);

// ── Paragrafta Anlam ────────────────────────────────────────────
b.lesson(
  'paragraf',
  10,
  'TYT Türkçenin yaklaşık yarısı paragraf sorusudur. Ana düşünceyi, yapıyı ve anlatım biçimlerini hızla tanımayı öğreneceğiz.',
  [
    H('Paragrafın yapısı'),
    FLOW('Bir paragraf üç bölümden oluşur', 'Giriş: Konu tanıtılır; bağlayıcıyla başlamaz.', 'Gelişme: Düşünce açıklanır, örneklenir, desteklenir.', 'Sonuç: Ana düşünce çoğu zaman burada toplanır.'),
    TIP('Giriş cümlesi "Bu nedenle, çünkü, ayrıca, ama, o da" gibi önceki bir cümleye bağlanan ifadelerle başlamaz. Böyle başlayan seçenekleri hemen eleyin.'),
    H('Ana düşünce ve yardımcı düşünce'),
    P('Ana düşünce, yazarın okura asıl vermek istediği iletidir; paragrafın tamamını kapsar. Yardımcı düşünceler ana düşünceyi destekleyen ayrıntılardır. "Değinilmemiştir" sorularında paragrafta geçen her yardımcı düşünceyi işaretleyerek ilerleyin.'),
    H('Anlatım biçimleri'),
    TABLE(
      ['Biçim', 'Belirtisi'],
      ['Açıklama', 'Bilgi verir, öğretir; nesnel ve sade.'],
      ['Tartışma', 'Bir görüşü çürütüp kendi görüşünü kanıtlamaya çalışır; okurla tartışır.'],
      ['Öyküleme', 'Olay, kişi, yer, zaman vardır; hareket bildirir.'],
      ['Betimleme', 'Sözcüklerle resim çizer; duyulara seslenir, sıfatlar yoğundur.'],
    ),
    H('Düşünceyi geliştirme yolları'),
    UL(
      'Tanımlama: "… nedir?" sorusuna yanıt verir.',
      'Örneklendirme: Soyut düşünceyi somut örnekle açar.',
      'Karşılaştırma: İki varlık/kavram arasındaki benzerlik-farklılık.',
      'Tanık gösterme: Ünlü birinin sözüne başvurma.',
      'Sayısal veriler: İstatistik, oran, yüzde ile destekleme.',
      'Benzetme: Bir şeyi başka bir şeye benzeterek anlatma.',
    ),
    EX(
      '"Bir araştırmaya göre düzenli kitap okuyan öğrencilerin %68\'i sınavlarda daha başarılıdır." cümlesinde hangi yol kullanılmıştır?',
      ['Cümlede oran (%68) verilmiştir.', 'Düşünce bir istatistikle desteklenmiştir.'],
      'Sayısal verilerden yararlanma',
    ),
  ],
  [
    card('Giriş cümlesi kuralı', 'Bağlayıcıyla (bu yüzden, çünkü, ayrıca) ya da önceki cümleye gönderme yapan zamirle başlamaz.'),
    card('Betimleme mi öyküleme mi?', 'Hareket ve zaman akışı varsa öyküleme; durağan bir görüntü çiziliyorsa betimleme.'),
  ],
);

b.q('paragraf', '"Kitap okumak yalnızca bilgi edinmek için değil, empati yeteneğimizi geliştirmek için de önemlidir. Bir romanın kahramanıyla birlikte sevinir, üzülür, korkarız. Böylece başka hayatları içeriden görme fırsatı buluruz. Bu deneyim, gerçek hayatta karşılaştığımız insanları daha iyi anlamamızı sağlar."\n\nBu paragrafta asıl anlatılmak istenen aşağıdakilerden hangisidir?', [
  'Romanlar, gerçek hayattan alınmış olayları anlatır.',
  'Kitap okumak, başkalarını anlama becerimizi geliştirir.',
  'Okurlar roman kahramanlarını örnek almalıdır.',
  'Bilgi edinmenin en etkili yolu roman okumaktır.',
  'İnsanların duyguları birbirine benzer.',
], 'B', 'Paragraf, okumanın empatiyi, yani başkalarını anlama yeteneğini geliştirdiğini anlatır; son cümle bunu toparlar.', 1);

b.q('paragraf', '"Bir araştırmaya göre her gün en az yarım saat kitap okuyan öğrencilerin yüzde altmış sekizi, okumayanlara göre sınavlarda daha yüksek başarı göstermiştir."\n\nBu cümlede kullanılan düşünceyi geliştirme yolu aşağıdakilerden hangisidir?', [
  'Tanık gösterme',
  'Benzetme',
  'Tanımlama',
  'Sayısal verilerden yararlanma',
  'Karşılaştırma',
], 'D', 'Düşünce bir oranla (yüzde altmış sekiz) desteklenmiştir. Bir karşılaştırma da sezilse de cümlenin dayanağı sayısal veridir.', 2);

b.q('paragraf', 'Aşağıdaki cümlelerden hangisi bir paragrafın giriş cümlesi olmaya en uygundur?', [
  'Bu nedenle şairler duygularını dizelere dökmüştür.',
  'Çünkü insan, yaşadığını paylaşma ihtiyacı duyar.',
  'Ayrıca şiirde ses ve ritim de önemlidir.',
  'Şiir, duyguların en yoğun biçimde dile getirildiği edebî türdür.',
  'Onun bu tutumu da okurları etkilemiştir.',
], 'D', 'Diğer seçenekler "bu nedenle, çünkü, ayrıca, onun bu tutumu" gibi önceki bir cümleye bağlanan ifadelerle başlar; bu yüzden giriş cümlesi olamaz.', 1);

b.q('paragraf', '"Kasabanın girişindeki yaşlı çınarın dalları, yorgun kollar gibi yola sarkıyordu. Gövdesindeki derin yarıklarda yosunlar yeşeriyor, yapraklarının arasından süzülen güneş toprağa altın lekeler düşürüyordu."\n\nBu paragrafta ağır basan anlatım biçimi aşağıdakilerden hangisidir?', [
  'Tartışma',
  'Betimleme',
  'Öyküleme',
  'Açıklama',
  'Diyalog',
], 'B', 'Bir olay akışı yoktur; çınar ağacının görüntüsü renk ve ayrıntılarla resmedilmiştir. Bu betimlemedir.', 1);

// ── Yazım Kuralları ─────────────────────────────────────────────
b.lesson(
  'yazim',
  8,
  'TDK yazım kurallarının sınavda en sık sorulan bölümlerini (de/da, ki, mi, sayılar, büyük harf) toparlıyoruz.',
  [
    H('"de / da" bağlacı ve eki'),
    P('Bağlaç olan "de/da" her zaman ayrı yazılır ve cümleden çıkarıldığında anlam bozulmaz, yalnızca daralır. Bulunma eki "-de/-da/-te/-ta" ise bitişik yazılır ve "nerede?" sorusuna yanıt verir.'),
    EX('"Arkadaşımda bu kitabı okumuş." cümlesi doğru mu?', ['"da" çıkarılınca "Arkadaşım bu kitabı okumuş." cümlesi anlamlıdır.', 'Demek ki "da" bağlaçtır ve ayrı yazılmalıdır.'], 'Yanlış: "Arkadaşım da bu kitabı okumuş."'),
    H('"ki" bağlacı ve eki'),
    UL(
      'Bağlaç "ki" ayrı yazılır: "Duydum ki unutmuşsun."',
      'Sıfat yapan "-ki" ve zamir "-ki" bitişiktir: "evdeki", "seninki".',
      'Kalıplaşmış olanlar bitişik: belki, çünkü, sanki, mademki, oysaki, halbuki.',
      '"Öyle ki", "diyelim ki", "kaldı ki" ayrı yazılır.',
    ),
    H('Soru eki "mi"'),
    P('Soru eki her zaman ayrı yazılır, kendinden sonraki ekler ona bitişir: "Geldin mi?", "Okuyor musunuz?"'),
    H('Sayıların yazımı'),
    UL(
      'Harfle yazılan sayılar ayrı yazılır: on beş, yüz yirmi üç.',
      'Sıra sayıları: "3." ya da "3\'üncü" yazılır; "3.cü" yanlıştır.',
      'Üleştirme sayıları rakamla yazılmaz: "birer, ikişer".',
    ),
    H('Büyük harflerin kullanımı'),
    UL(
      'Kişi, kurum, kuruluş, yer adları büyük harfle başlar: "Türk Dil Kurumu", "Ağrı Dağı".',
      'Belirli bir tarih bildiren gün ve ay adları büyük başlar: "29 Ekim 1923 Pazartesi".',
      'Yön adları yer adından önce gelip ona dahil olursa büyük: "Doğu Anadolu".',
    ),
    TIP('Yazım sorularında önce "de/da", "ki", "mi" ve sayı içeren seçeneklere bakın; hataların büyük kısmı bunlarda saklıdır.'),
  ],
  [
    card('"de/da" testi', 'Cümleden çıkarınca anlam bozulmuyorsa bağlaçtır → ayrı yaz.'),
    card('Bitişik "ki"ler', 'belki, çünkü, sanki, mademki, oysaki, halbuki'),
  ],
);

b.q('yazim', 'Aşağıdaki cümlelerin hangisinde bir yazım yanlışı vardır?', [
  'Sen de bizimle gelmelisin.',
  'Evde kimse yoktu.',
  'Ben de bu yarışmaya katılacağım.',
  'Arkadaşımda bu kitabı okumuş.',
  'Okulda bir tören düzenlendi.',
], 'D', '"da" cümleden çıkarılınca "Arkadaşım bu kitabı okumuş." anlamlı kalır; bu nedenle bağlaçtır ve "Arkadaşım da" biçiminde ayrı yazılmalıdır.', 1);

b.q('yazim', 'Aşağıdaki cümlelerin hangisinde "ki"nin yazımıyla ilgili bir yanlışlık yapılmıştır?', [
  'Duydum ki bizi unutmuşsun.',
  'Sanki hiçbir şey olmamış gibi davrandı.',
  'Bahçedeki çiçekler sararmış.',
  'Öyleki herkes şaşkınlıktan donup kaldı.',
  'Mademki geleceksin, haber ver.',
], 'D', '"Öyle ki" kalıbı ayrı yazılır. "Sanki" ve "mademki" kalıplaşmış olduğu için bitişik, "bahçedeki"deki "-ki" ise sıfat yapan ek olduğu için bitişiktir.', 2);

b.q('yazim', 'Aşağıdaki cümlelerin hangisinde sayıların yazımıyla ilgili bir yanlışlık vardır?', [
  'On beş gün sonra tatile çıkacağız.',
  'Kitabın 2\'nci baskısı yeni çıktı.',
  'Sınıfta yirmi beş öğrenci var.',
  'Yarışmada 3.cü oldu.',
  'Ödevini 3. sayfaya kadar yaptı.',
], 'D', 'Sıra sayısı rakamla "3." ya da "3\'üncü" biçiminde yazılır. "3.cü" yazımı yanlıştır.', 1);

b.q('yazim', 'Aşağıdaki cümlelerin hangisinde büyük harflerin kullanımıyla ilgili bir yanlışlık yapılmıştır?', [
  'Cumhuriyet 29 Ekim 1923 Pazartesi günü ilan edildi.',
  'Yaz tatilinde Doğu Karadeniz\'i gezdik.',
  'Türk Dil Kurumu yeni sözlüğünü yayımladı.',
  'Bu yıl Ağrı dağı\'na tırmanmayı planlıyoruz.',
  'Toplantı Ankara\'da yapılacak.',
], 'D', 'Özel adlarda ada dahil olan tür bildiren sözcükler de büyük harfle başlar: "Ağrı Dağı". Belirli tarih bildiren gün adı ("Pazartesi") ve yer adının parçası olan yön adı ("Doğu Karadeniz") büyük harfle yazılır.', 2);

// Konu anlatımı henüz yazılmamış konular için de soru bankası tutulur.
b.q('anlatim-bozuklugu', '"Yarın bu konuyu kesinlikle belki konuşuruz." cümlesindeki anlatım bozukluğunun nedeni aşağıdakilerden hangisidir?', [
  'Gereksiz sözcük kullanımı',
  'Anlamca çelişen sözcüklerin bir arada kullanılması',
  'Özne eksikliği',
  'Ek yanlışlığı',
  'Yüklem eksikliği',
], 'B', '"Kesinlikle" kesinlik, "belki" ise olasılık bildirir. Anlamca çelişen bu iki sözcük birlikte kullanılamaz.', 1);

b.q('anlatim-bozuklugu', '"Toplantıya yaklaşık elli kadar kişi katıldı." cümlesindeki anlatım bozukluğu nasıl giderilir?', [
  '"toplantıya" sözcüğü çıkarılarak',
  '"yaklaşık" ya da "kadar" sözcüklerinden biri çıkarılarak',
  '"kişi" yerine "insan" getirilerek',
  '"katıldı" yerine "geldi" getirilerek',
  'Cümleye özne eklenerek',
], 'B', '"Yaklaşık" ve "kadar" aynı tahmin anlamını taşır; birlikte kullanılınca gereksiz sözcük kullanımı olur. Biri çıkarılınca bozukluk giderilir.', 2);

export default b.done();
