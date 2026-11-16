/** TYT Türkçe: anlam bilgisi, ses bilgisi, noktalama ve dil bilgisi konuları. */
import { EX, F, FLOW, H, P, TABLE, TIP, UL, builder, card } from '../../build.ts';

const b = builder('tyt-turkce', 'b');

// ── Söz yorumu, deyim ve atasözleri ─────────────────────────────
b.lesson('soz-yorumu', 8, 'Deyim, atasözü ve özdeyişleri ayırt etmeyi, cümledeki anlamlarını yorumlamayı öğreneceğiz.', [
  TABLE(['Tür', 'Özellik', 'Örnek'],
    ['Deyim', 'Kalıplaşmış, çoğunlukla mecaz anlamlı söz öbeği; yargı bildirmez, genellikle bir kavramı ya da durumu karşılar.', 'Ağzı kulaklarına varmak (çok sevinmek)'],
    ['Atasözü', 'Uzun deneyimlerden doğmuş, öğüt veren, kalıplaşmış ve anonim cümle; bir yargı bildirir.', 'Damlaya damlaya göl olur.'],
    ['Özdeyiş (vecize)', 'Söyleyeni belli olan, düşünce yoğunluğu yüksek söz.', '"Hayatta en hakiki mürşit ilimdir." (Atatürk)'],
  ),
  TIP('Deyim ile atasözünü ayırmanın en hızlı yolu: söz tek başına bir yargı (cümle) bildiriyorsa atasözü, cümle içinde bir öge gibi kullanılıyorsa deyimdir.'),
  H('Deyimlerin anlamı'),
  UL('Deyim sözcükleri tek tek değil, bir bütün olarak anlam taşır: "göz atmak" = kısaca bakmak.', 'Deyimin sözcükleri değiştirilemez: "kulak asmamak" yerine "kulak takmamak" denemez.', 'Bazı deyimler gerçek anlamlıdır: "yol almak".'),
  EX('"Dereyi görmeden paçaları sıvamak" ne anlama gelir?', ['Dere görülmeden paçaları sıvamak, gerekmeden önce hazırlık yapmaktır.', 'Mecaz anlamı: Bir işin gerçekleşeceği kesinleşmeden ona göre davranmaya başlamak.'], 'Erken davranıp hazırlığa girişmek'),
  H('Söz yorumu soruları'),
  P('Soru kökünde "Bu sözle anlatılmak istenen" deniyorsa sözcüklerin gerçek anlamına takılmadan sözün yaşamdaki karşılığını bulun; seçeneklerde sözün gerçek anlamını tekrar eden çeldiriciler sıktır.'),
], [card('Deyim', 'Kalıplaşmış söz öbeği; yargı bildirmez'), card('Atasözü', 'Anonim, öğüt veren, yargı bildiren cümle')]);

b.q('soz-yorumu', '"Ağzı kulaklarına varmak" deyiminin anlamı aşağıdakilerden hangisidir?', ['Çok konuşmak', 'Çok sevinmek', 'Sır saklayamamak', 'Herkese kulak vermek', 'Çok şaşırmak'], 'B', 'Bu deyim, sevinçten yüzün gülmesi, yani çok sevinmek anlamına gelir.', 1);
b.q('soz-yorumu', 'Aşağıdakilerden hangisi bir atasözüdür?', ['Etekleri zil çalmak', 'Göz atmak', 'Kulak asmamak', 'Damlaya damlaya göl olur.', 'Burnu havada olmak'], 'D', 'Diğerleri yargı bildirmeyen deyimlerdir. "Damlaya damlaya göl olur." ise küçük birikimlerin zamanla büyüyeceği yargısını öğüt olarak verir.', 1);
b.q('soz-yorumu', '"Dereyi görmeden paçaları sıvamak" sözüyle anlatılmak istenen aşağıdakilerden hangisidir?', ['Bir işe hiç hazırlanmadan başlamak', 'Bir işin gerçekleşeceği kesinleşmeden ona hazırlanmaya girişmek', 'Tehlikeli işlerden uzak durmak', 'Zor durumda başkalarından yardım istemek', 'Bir işi yarım bırakmak'], 'B', 'Söz, henüz ortada olmayan bir durum için önceden harekete geçmeyi eleştirir.', 2);

// ── Cümlede anlam ──────────────────────────────────────────────
b.lesson('cumlede-anlam', 10, 'Cümleler arasındaki anlam ilişkilerini, öznel-nesnel yargıları ve örtülü anlamı tanıyacağız.', [
  TABLE(['İlişki', 'İpucu', 'Örnek'],
    ['Neden-sonuç', 'için, -den, -dığı için, çünkü (gerçekleşmiş neden)', 'Yağmur yağdığı için maç ertelendi.'],
    ['Amaç-sonuç', 'için, diye, amacıyla (ulaşılmak istenen hedef)', 'Sınavı kazanmak için gece gündüz çalıştı.'],
    ['Koşul-sonuç', '-se, -dıkça, -mezse', 'Erken çıkarsan otobüse yetişirsin.'],
    ['Karşılaştırma', 'göre, daha, en, kadar', 'Bu kitap öncekinden daha sürükleyici.'],
  ),
  TIP('Amaç ile nedeni ayırmak için "-mek için" yerine "-mek amacıyla" koymayı deneyin. Anlam bozulmuyorsa amaç-sonuç cümlesidir.'),
  H('Öznel ve nesnel yargı'),
  UL('Nesnel yargı: Kanıtlanabilir, kişiden kişiye değişmeyen bilgi. "Ankara 1923\'te başkent oldu."', 'Öznel yargı: Kişisel görüş, beğeni ya da duygu. "Ankara\'nın en güzel mevsimi sonbahardır."'),
  H('Örtülü anlam'),
  P('Cümlede açıkça söylenmeyen ama sezdirilen anlamdır. "de/da, bile, hâlâ, yine, artık" gibi sözcükler örtülü anlam yaratır: "Bu kitabı Ali de okumuş." cümlesi, Ali\'den başka okuyanların da olduğunu sezdirir.'),
  FLOW('Örtülü anlam soruları', 'İpucu sözcüğü bul (de, bile, yine, hâlâ, artık)', 'O sözcük çıkınca kaybolan anlamı yaz', 'Bu anlamı karşılayan seçeneği işaretle'),
], [card('Amaç mı neden mi?', '"için" yerine "amacıyla" geliyorsa amaç-sonuç'), card('"Ali de geldi."', 'Örtülü anlam: Ali\'den başkası da geldi.')]);

b.q('cumlede-anlam', 'Aşağıdaki cümlelerin hangisinde amaç-sonuç ilişkisi vardır?', ['Yağmur yağdığı için maç ertelendi.', 'Sınavı kazanmak için gece gündüz çalıştı.', 'Hava soğuk olduğundan dışarı çıkmadık.', 'Erken çıkarsan otobüse yetişirsin.', 'Çok yorulduğundan erkenden uyudu.'], 'B', '"Sınavı kazanmak" ulaşılmak istenen hedeftir: "kazanmak amacıyla" denebilir. Diğerlerinde gerçekleşmiş bir neden ya da koşul vardır.', 1);
b.q('cumlede-anlam', 'Aşağıdaki cümlelerin hangisinde nesnel bir yargı vardır?', ['Bu romanın sonu çok etkileyiciydi.', 'Türkiye\'nin en yüksek dağı Ağrı Dağı\'dır.', 'Yaz akşamları sahilde yürümek insanı dinlendirir.', 'Onun şiirleri herkesi derinden etkiler.', 'En lezzetli meyve kirazdır.'], 'B', 'Ağrı Dağı\'nın Türkiye\'nin en yüksek dağı olması ölçülebilir, kanıtlanabilir bir bilgidir. Diğerleri kişisel değerlendirmedir.', 1);
b.q('cumlede-anlam', '"Bu kitabı Ali de okumuş." cümlesinden aşağıdakilerden hangisi çıkarılabilir?', ['Kitabı yalnızca Ali okumuştur.', 'Ali kitabı beğenmemiştir.', 'Kitabı Ali\'den başka okuyanlar da vardır.', 'Ali kitabı yarım bırakmıştır.', 'Kitap yeni yayımlanmıştır.'], 'C', '"de" bağlacı, aynı işi yapan başkalarının da olduğunu sezdirir (örtülü anlam).', 1);

// ── Ses bilgisi ────────────────────────────────────────────────
b.lesson('ses-bilgisi', 9, 'Türkçenin ünlüleri, ünlü uyumları ve sınavda en çok sorulan ses olayları.', [
  TABLE(['Ünlüler', 'Düz', 'Yuvarlak'], ['Kalın', 'a, ı', 'o, u'], ['İnce', 'e, i', 'ö, ü']),
  UL('Büyük ünlü uyumu: Bir sözcükteki ünlülerin hepsi kalın ya da hepsi incedir. "çocuk", "evler" uyar; "kardeş", "kitap" uymaz.', 'Küçük ünlü uyumu: Düz ünlüden sonra düz, yuvarlak ünlüden sonra ya düz-geniş (a, e) ya da yuvarlak-dar (u, ü) gelir.'),
  H('Ses olayları'),
  TABLE(['Olay', 'Açıklama', 'Örnek'],
    ['Ünsüz yumuşaması', 'p, ç, t, k ünlüyle başlayan ek alınca b, c, d, ğ/g olur', 'kitap → kitabı, ağaç → ağacı'],
    ['Ünsüz benzeşmesi', 'Sert ünsüzden sonra c, d, g sertleşir', 'yurt + da → yurtta, kitap + cı → kitapçı'],
    ['Ünlü düşmesi', 'İkinci hecedeki dar ünlü düşer', 'ağız → ağzı, oğul → oğlu'],
    ['Ünlü daralması', '-yor ekinden önce a/e, ı/i/u/ü olur', 'başla + yor → başlıyor'],
    ['Ünsüz düşmesi', '-cık/-cik, -msı, -l ekleriyle sondaki k/r düşer', 'küçük + cük → küçücük'],
    ['Kaynaştırma', 'İki ünlü arasına y, ş, s, n girer', 'kapı-y-ı, iki-ş-er, su-y-u'],
  ),
  TIP('"Sert ünsüzler: Fe Sı Ştı Ç Hı Kı Pe Te" (f, s, t, k, ç, ş, h, p). Ek bu harflerden sonra geliyorsa ünsüz benzeşmesi aranır.'),
], [card('Ünsüz benzeşmesi örneği', 'yurt + da → yurtta'), card('Ünlü düşmesi örneği', 'ağız → ağzı')]);

b.q('ses-bilgisi', '"ağzı" sözcüğünde aşağıdaki ses olaylarından hangisi vardır?', ['Ünsüz yumuşaması', 'Ünlü düşmesi', 'Ünlü daralması', 'Ünsüz benzeşmesi', 'Ünsüz türemesi'], 'B', '"ağız" sözcüğü ünlüyle başlayan "-ı" ekini alınca ikinci hecedeki "ı" düşmüştür: ağız → ağzı.', 1);
b.q('ses-bilgisi', 'Aşağıdaki sözcüklerin hangisinde ünsüz benzeşmesi (sertleşme) vardır?', ['kitabı', 'başlıyor', 'yurtta', 'oğlu', 'küçücük'], 'C', '"yurt + da" birleşirken sert "t" ünsüzünden sonra gelen "d" sertleşerek "t" olmuştur.', 1);
b.q('ses-bilgisi', 'Aşağıdaki sözcüklerden hangisi büyük ünlü uyumuna uymaz?', ['çocuk', 'dağlar', 'evler', 'kardeş', 'gözlük'], 'D', '"kardeş" sözcüğünde kalın "a" ile ince "e" bir aradadır. Diğerlerinde ünlülerin hepsi ya kalın ya incedir.', 1);

// ── Noktalama ──────────────────────────────────────────────────
b.lesson('noktalama', 9, 'Noktalama işaretlerinin TDK kurallarına göre kullanım yerleri ve sık yapılan yanlışlar.', [
  TABLE(['İşaret', 'Başlıca kullanım'],
    ['Nokta (.)', 'Cümle sonu, kısaltmalar, sıra sayıları (3.), saat (14.30)'],
    ['Virgül (,)', 'Eş görevli sözcükleri ayırma, sıralı cümleler, hitap, ara söz'],
    ['Noktalı virgül (;)', 'Virgüllerle ayrılmış türleri ya da öbekleri birbirinden ayırma'],
    ['İki nokta (:)', 'Açıklama ve örnek verilecek yerde, konuşma çizgisinden önce'],
    ['Üç nokta (…)', 'Tamamlanmamış cümle, söylenmek istenmeyen söz'],
    ['Soru işareti (?)', 'Soru cümlesi sonu; ayraç içinde kuşku: 1071 (?)'],
    ['Ünlem (!)', 'Sevinç, korku, şaşma, emir; ayraç içinde alay: (!)'],
    ['Kesme (\')', 'Özel adlara gelen ekleri ayırma: Ankara\'ya'],
  ),
  TIP('Kurum, kuruluş, kurul, birleşim, oturum ve iş yeri adlarına gelen ekler kesmeyle AYRILMAZ: "Türk Dil Kurumuna", "Türkiye Büyük Millet Meclisine". Kısaltmalara gelen ekler ise ayrılır: "TBMM\'nin".', 'warn'),
  H('Virgül'),
  UL('Eş görevli sözcükler: "Elma, armut, ayva aldık."', 'Sıralı cümleler: "Eve geldi, çantasını bıraktı."', 'Uzun cümlede öznenin ayrılması: "Ali, okula her gün yürüyerek gider."', 'Hitap: "Arkadaşlar, toplantı başlıyor."'),
  EX('"Türk Dil Kurumu\'na başvurdum." yazımı doğru mu?', ['Kurum adlarına gelen ekler kesmeyle ayrılmaz.'], 'Yanlış: "Türk Dil Kurumuna başvurdum."'),
], [card('Kurum adı + ek', 'Kesme yok: Türk Dil Kurumuna'), card('Kuşku bildiren işaret', 'Ayraç içinde soru işareti: (?)')]);

b.q('noktalama', 'Aşağıdakilerin hangisinde kesme işaretinin kullanımıyla ilgili bir yanlışlık vardır?', ['Ankara\'ya yarın gideceğiz.', 'Atatürk\'ün söylevini okuduk.', 'Dilekçemi Türk Dil Kurumu\'na gönderdim.', '2023\'te mezun oldu.', 'TBMM\'nin açılışı 23 Nisan 1920\'dedir.'], 'C', 'Kurum ve kuruluş adlarına gelen ekler kesme işaretiyle ayrılmaz: "Türk Dil Kurumuna".', 2);
b.q('noktalama', 'Cümlede kendisinden sonra açıklama ya da örnek verileceğini gösteren noktalama işareti aşağıdakilerden hangisidir?', ['Noktalı virgül', 'İki nokta', 'Üç nokta', 'Virgül', 'Kısa çizgi'], 'B', 'İki nokta, açıklama ve örnek verilecek cümleden sonra kullanılır: "Pazardan şunları aldık: domates, biber, patlıcan."', 1);
b.q('noktalama', 'Bilginin kesin olmadığını, kuşkuyla karşılandığını göstermek için ayraç içinde kullanılan işaret aşağıdakilerden hangisidir?', ['Ünlem', 'Nokta', 'Soru işareti', 'Üç nokta', 'Virgül'], 'C', 'Ayraç içindeki soru işareti kuşku bildirir: "Yunus Emre 1240 (?) yılında doğmuştur."', 1);

// ── Sözcükte yapı ──────────────────────────────────────────────
b.lesson('sozcukte-yapi', 9, 'Kök, gövde, yapım ve çekim ekleri; basit, türemiş ve birleşik sözcükler.', [
  F('Yapı çözümleme', 'Sözcük = kök + (yapım ekleri) + (çekim ekleri)', 'Kök + yapım eki = gövde'),
  TABLE(['Ek türü', 'Görevi', 'Örnek'], ['Yapım eki', 'Yeni bir sözcük türetir, anlamı değiştirir', 'göz → gözlük, sev- → sevgi'], ['Çekim eki', 'Sözcüğü cümleye bağlar; anlamı değiştirmez', 'ev-ler-imiz-de, gel-di-m']),
  H('Yapı bakımından sözcükler'),
  UL('Basit: Kök ve yalnızca çekim eki taşır. "kalem", "evlerimizde"', 'Türemiş: Kökü en az bir yapım eki almıştır. "kitaplık", "yazar", "sevgi"', 'Birleşik: En az iki sözcüğün birleşmesiyle oluşur. "hanımeli", "bilgisayar", "Kuşadası"'),
  TIP('Kökü bulmak için sözcüğü sondan ekleri atarak kısaltın; anlamlı en küçük parçada durun. Kökün isim mi fiil mi olduğunu "-mak/-mek" ekleyerek deneyin: sev-mek anlamlıysa fiil köküdür.'),
  EX('"gözlükçü" sözcüğünü çözümleyin.', ['göz: isim kökü', '-lük: yapım eki → gözlük (gövde)', '-çü: yapım eki → gözlükçü'], 'Türemiş sözcük'),
], [card('Basit sözcük', 'Yalnız kök + çekim ekleri: evlerimizde'), card('Birleşik sözcük', 'İki sözcükten: hanımeli, bilgisayar')]);

b.q('sozcukte-yapi', 'Aşağıdaki sözcüklerden hangisi yapı bakımından birleşiktir?', ['kitaplık', 'kalem', 'hanımeli', 'yazar', 'evler'], 'C', '"hanımeli" iki ayrı sözcüğün (hanım + eli) birleşmesiyle yeni bir kavram (çiçek adı) karşılar.', 1);
b.q('sozcukte-yapi', 'Aşağıdaki sözcüklerin hangisinde yapım eki yoktur?', ['gözlükler', 'yazıcı', 'sevgi', 'evlerimizde', 'denizci'], 'D', '"ev-ler-imiz-de" yalnızca çekim ekleri (çoğul, iyelik, bulunma) almıştır; yapı bakımından basittir.', 2);
b.q('sozcukte-yapi', 'Aşağıdaki sözcüklerin hangisinin kökü fiildir?', ['taşlık', 'kitapçı', 'sevgi', 'gözlük', 'başlık'], 'C', '"sevgi" sözcüğünün kökü "sev-" fiilidir (sev-mek). Diğerlerinin kökleri isimdir.', 1);

// ── İsimler ve sıfatlar ────────────────────────────────────────
b.lesson('isim-sifat', 10, 'İsim türleri, isim tamlamaları ve sıfat çeşitleri; sıfat ile ismi ayırma yolları.', [
  H('İsimler'),
  UL('Özel / cins isim: "Ankara" – "şehir"', 'Somut / soyut: "masa" – "sevgi"', 'Tekil / çoğul / topluluk: "asker" – "askerler" – "ordu" (tekil biçimde çokluk bildirir)'),
  H('İsim tamlamaları'),
  TABLE(['Tür', 'Yapı', 'Örnek'], ['Belirtili', 'tamlayan -ın + tamlanan -ı', 'evin kapısı'], ['Belirtisiz', 'tamlayan eksiz + tamlanan -ı', 'okul bahçesi'], ['Takısız', 'iki isim de eksiz; malzeme/benzetme', 'taş duvar, demir kapı'], ['Zincirleme', 'tamlayan ya da tamlanan bir tamlama', 'okulun bahçe kapısı']),
  H('Sıfatlar'),
  TABLE(['Sıfat', 'Örnek'], ['Niteleme', 'kırmızı elma, uzun yol'], ['İşaret', 'bu kitap, şu ev'], ['Sayı', 'üç kalem, ikinci sıra, ikişer elma'], ['Belgisiz', 'bazı öğrenciler, her gün, birkaç kişi'], ['Soru', 'hangi film, kaç kişi']),
  TIP('Sıfat ismin önünde onu niteler ya da belirtir. Önünde nitelediği bir isim yoksa sözcük adlaşmış sıfat ya da zamirdir: "Gençler geldi." (adlaşmış sıfat)', 'warn'),
], [card('Topluluk ismi', 'ordu, sürü, orman'), card('Belirtili tamlama', 'evin kapısı (-ın + -ı)')]);

b.q('isim-sifat', 'Aşağıdakilerden hangisi topluluk ismidir?', ['kitaplar', 'ordu', 'ağaç', 'sevgi', 'deniz'], 'B', '"ordu" tekil biçimde olduğu hâlde birçok askerden oluşan topluluğu karşılar.', 1);
b.q('isim-sifat', 'Aşağıdakilerden hangisi belirtili isim tamlamasıdır?', ['taş duvar', 'okul bahçesi', 'evin kapısı', 'kırmızı elma', 'üç kitap'], 'C', '"ev-in kapı-sı": tamlayan ilgi ekini (-in), tamlanan iyelik ekini (-sı) almıştır.', 1);
b.q('isim-sifat', 'Aşağıdaki cümlelerin hangisinde belgisiz sıfat kullanılmıştır?', ['Bu kitabı çok beğendim.', 'Üç kalem aldım.', 'Hangi filmi izleyeceğiz?', 'Bazı öğrenciler erken geldi.', 'Uzun yol bizi yordu.'], 'D', '"bazı" ismi sayısını tam belirtmeden belirtir; belgisiz sıfattır. Diğerleri sırasıyla işaret, sayı, soru ve niteleme sıfatıdır.', 1);

// ── Zamirler ve zarflar ────────────────────────────────────────
b.lesson('zamir-zarf', 10, 'Zamir türleri ve zamir-sıfat ayrımı; zarf türleri ve zarfın neyi nitelediği.', [
  TABLE(['Zamir', 'Örnek'], ['Kişi', 'ben, sen, o, biz, siz, onlar'], ['Dönüşlülük', 'kendi (kendim, kendin…)'], ['İşaret', 'bu, şu, o, bunlar, öteki'], ['Belgisiz', 'bazısı, birkaçı, herkes, kimse, hepsi'], ['Soru', 'kim, ne, hangisi, kaçı'], ['İlgi zamiri', '-ki: benimki, seninki']),
  TIP('"Bu kitap" → sıfat (ismin önünde). "Bunu aldım" → zamir (ismin yerini tutuyor). Ayrımın anahtarı, sözcükten sonra bir ismin gelip gelmediğidir.'),
  H('Zarflar'),
  TABLE(['Zarf', 'Soru', 'Örnek'], ['Durum', 'Nasıl?', 'Hızlı koştu.'], ['Zaman', 'Ne zaman?', 'Yarın gideceğiz.'], ['Yer-yön', 'Nereye? (eksiz)', 'İçeri girdi.'], ['Miktar (azlık-çokluk)', 'Ne kadar?', 'Çok konuştu. En güzel şarkı.'], ['Soru', '—', 'Niçin geldin? Nasıl yaptın?']),
  P('Zarflar fiilleri, fiilimsileri, sıfatları ve başka zarfları niteler. Yer-yön zarfları ek almadan kullanılır: "aşağı indi" zarf, "aşağıya indi" ise isimdir.'),
], [card('Zamir mi sıfat mı?', 'Arkasından isim geliyorsa sıfat'), card('Yer-yön zarfı', 'Ek almaz: içeri, dışarı, aşağı, ileri')]);

b.q('zamir-zarf', 'Aşağıdaki cümlelerin hangisinde «» içindeki sözcük zamirdir?', ['«Bu» kitabı iki günde okudum.', '«Bunu» kimse bilmiyordu.', '«Her» gün sabah koşar.', '«Hangi» rengi seçtin?', '«Birkaç» kişi erken geldi.'], 'B', '"Bunu" bir ismin yerini tutmuştur; zamirdir. Diğerleri kendilerinden sonra gelen ismi belirttiği için sıfattır.', 1);
b.q('zamir-zarf', 'Aşağıdaki cümlelerin hangisinde zaman zarfı vardır?', ['Çocuk hızlı koştu.', 'Çok yorulduk.', 'Yarın Ankara\'ya gideceğiz.', 'İçeri girdi.', 'Niçin geldin?'], 'C', '"Yarın" fiilin ne zaman gerçekleşeceğini bildirir. Diğerleri durum, miktar, yer-yön ve soru zarfıdır.', 1);
b.q('zamir-zarf', 'Aşağıdaki cümlelerin hangisinde «» içindeki sözcük miktar (azlık-çokluk) zarfıdır?', ['Toplantıda «çok» konuştu.', '«Dün» geldi.', 'Yolda «yavaş» yürüdü.', 'Merdivenden «aşağı» indi.', '«Nasıl» geldin?'], 'A', '"çok", "konuştu" fiilinin miktarını bildirir: Ne kadar konuştu? Çok.', 1);

// ── Edat, bağlaç, ünlem ────────────────────────────────────────
b.lesson('edat-baglac', 8, 'Tek başına anlamı olmayan, görevli sözcükler: edatlar, bağlaçlar ve ünlemler.', [
  TABLE(['Tür', 'Görev', 'Örnekler'], ['Edat (ilgeç)', 'Sözcükler arasında anlam ilgisi kurar', 'gibi, kadar, için, ile, göre, karşı, sanki, ancak, yalnız'], ['Bağlaç', 'Sözcükleri ya da cümleleri bağlar', 've, ile, ama, fakat, çünkü, ya…ya, hem…hem, de, ki, ise, oysa'], ['Ünlem', 'Duygu, seslenme, onay bildirir', 'Ah!, Eyvah!, Hey!, Evet']),
  H('"ile" bağlaç mı edat mı?'),
  UL('Yerine "ve" getirilebiliyorsa bağlaçtır: "Ali ile Veli okula gitti." → "Ali ve Veli"', 'Araç ya da birliktelik bildiriyorsa edattır: "Kalemle yazdı.", "Annesiyle markete gitti."'),
  TIP('Bağlaçlar cümleden çıkarıldığında cümlenin anlamı daralır ama bozulmaz; edat çıkarıldığında ise cümle çoğunlukla bozulur.'),
  EX('"Çok çalıştı ama kazanamadı." cümlesindeki "ama" hangi ilgiyi kurar?', ['Beklenen sonuç (kazanmak) gerçekleşmemiştir.'], 'Karşıtlık ilgisi kuran bağlaç'),
], [card('"ile" testi', '"ve" yerine geçiyorsa bağlaç'), card('Edat örnekleri', 'gibi, kadar, için, göre')]);

b.q('edat-baglac', 'Aşağıdaki cümlelerin hangisinde "ile" bağlaç olarak kullanılmıştır?', ['Otobüsle eve döndü.', 'Ali ile Veli okula gitti.', 'Kalemle mektup yazdı.', 'Annesiyle markete gitti.', 'Sevgiyle baktı.'], 'B', '"Ali ile Veli" yerine "Ali ve Veli" denebilir; bu yüzden "ile" bağlaçtır. Diğerlerinde araç, birliktelik ya da durum bildiren edattır.', 2);
b.q('edat-baglac', 'Aşağıdaki cümlelerin hangisinde edat kullanılmıştır?', ['Kardeşin gibi çalışkan ol.', 'Ali ve Veli geldi.', 'Eyvah, geç kaldık!', 'Hem okuyor hem çalışıyor.', 'Ya bugün ya yarın gel.'], 'A', '"gibi" benzerlik ilgisi kuran bir edattır. "ve", "hem…hem", "ya…ya" bağlaç; "eyvah" ünlemdir.', 1);
b.q('edat-baglac', '"Çok çalıştı ama kazanamadı." cümlesindeki "ama" hangi görevdedir?', ['Benzerlik bildiren edat', 'Karşıtlık bildiren bağlaç', 'Neden bildiren bağlaç', 'Seslenme ünlemi', 'Sınırlama bildiren edat'], 'B', '"ama", beklenenin tersi bir sonuç bildiren iki cümleyi bağlar: karşıtlık bağlacıdır.', 1);

// ── Fiiller ────────────────────────────────────────────────────
b.lesson('fiiller', 11, 'Fiillerin anlam özellikleri, haber ve dilek kipleri, kişi ekleri ve zaman kayması.', [
  TABLE(['Anlam', 'Özellik', 'Örnek'], ['İş (kılış)', 'Nesne alabilir', 'okumak, yazmak'], ['Durum', 'Nesne almaz, öznenin içinde bulunduğu durumu bildirir', 'uyumak, gülmek, oturmak'], ['Oluş', 'Kendiliğinden, zamanla gerçekleşir', 'sararmak, büyümek, acıkmak']),
  H('Kipler'),
  TABLE(['Haber kipleri', 'Ek', 'Dilek kipleri', 'Ek'], ['Görülen geçmiş', '-dı', 'Gereklilik', '-malı'], ['Öğrenilen geçmiş', '-mış', 'İstek', '-a / -e'], ['Şimdiki zaman', '-yor', 'Dilek-şart', '-sa / -se'], ['Gelecek zaman', '-acak', 'Emir', 'ek yok (gel, gelsin…)'], ['Geniş zaman', '-r / -ar', '', '']),
  H('Zaman (anlam) kayması'),
  P('Bir kip ekinin kendi zamanı dışında başka bir zaman anlamında kullanılmasıdır. "Yarın okula gidiyorum." cümlesinde şimdiki zaman eki gelecek zaman anlamı vermiştir.'),
  TIP('Zaman kayması sorularında cümledeki zaman zarfına (yarın, dün, her gün) bakın; ekin zamanıyla çelişiyorsa kayma vardır.'),
], [card('Oluş fiili', 'Kendiliğinden gerçekleşir: sararmak, büyümek'), card('Zaman kayması', '"Yarın gidiyorum." -yor → gelecek')]);

b.q('fiiller', 'Aşağıdaki cümlelerin hangisinde zaman kayması vardır?', ['Dün akşam sinemaya gittik.', 'Şu anda kitap okuyorum.', 'Yarın okula gidiyorum.', 'Her sabah erken kalkar.', 'Gelecek yıl üniversiteye başlayacağım.'], 'C', '"-yor" şimdiki zaman ekidir; "yarın" zarfı nedeniyle gelecek zaman anlamında kullanılmıştır.', 1);
b.q('fiiller', 'Aşağıdaki cümlelerin hangisinin yüklemi oluş bildiren bir fiildir?', ['Kitabı bir günde okudu.', 'Bütün gün uyudu.', 'Sonbaharda yapraklar sarardı.', 'Mektubu postaya verdi.', 'Bahçede oturduk.'], 'C', '"sararmak" kendiliğinden, zamanla gerçekleşen bir değişimi bildirir; oluş fiilidir.', 2);
b.q('fiiller', 'Aşağıdaki cümlelerin hangisinde gereklilik kipi kullanılmıştır?', ['Okula erken gitmelisin.', 'Keşke biraz daha kalsaydın.', 'Yarın bize gel.', 'Bu akşam sinemaya gidelim.', 'Ödevini bitirdi.'], 'A', '"-malı/-meli" eki gereklilik kipidir. Diğerlerinde dilek-şart, emir, istek ve görülen geçmiş zaman vardır.', 1);

// ── Ek fiil ────────────────────────────────────────────────────
b.lesson('ek-fiil', 8, 'Ek fiilin iki görevi: isim soylu sözcükleri yüklem yapmak ve basit zamanlı fiillerden birleşik zamanlı fiil türetmek.', [
  TABLE(['Ek fiil', 'İsim soylu sözcükle', 'Fiille (birleşik zaman)'], ['Geniş zaman -dır', 'Öğretmendir.', '—'], ['Hikâye (i-di)', 'Öğretmendi.', 'Geliyordu. (şimdiki zamanın hikâyesi)'], ['Rivayet (i-miş)', 'Öğretmenmiş.', 'Gelecekmiş. (gelecek zamanın rivayeti)'], ['Şart (i-se)', 'Öğretmense', 'Gelirse… (geniş zamanın şartı)']),
  UL('Ek fiilin olumsuzu "değil" sözcüğüyle yapılır: "Öğretmen değildi."', 'Ek fiil isim soylu sözcüklere geldiğinde cümle isim cümlesi olur.', 'Fiilin kip ekinden sonra gelen -dı, -mış, -sa ek fiildir: gel-iyor-du.'),
  TIP('Bir ekin ek fiil olup olmadığını anlamak için önünde başka bir kip eki olup olmadığına bakın: "geldi" (görülen geçmiş, tek kip) – "geliyordu" (-yor + ek fiil -du).'),
], [card('Ek fiilin 1. görevi', 'İsmi yüklem yapar: Hava soğuktu.'), card('Ek fiilin 2. görevi', 'Birleşik zaman: geliyordu, gelecekmiş')]);

b.q('ek-fiil', 'Aşağıdaki cümlelerin hangisinde ek fiil, birleşik zamanlı fiil oluşturmuştur?', ['O, çok iyi bir öğretmendi.', 'Hava bugün çok güzelmiş.', 'Akşam evdeydik.', 'Sen gelmeden önce okula gidiyordu.', 'Hastaysa doktora gitsin.'], 'D', '"gid-iyor-du": şimdiki zaman ekinden sonra gelen ek fiil "-du" birleşik zamanlı fiil (şimdiki zamanın hikâyesi) yapmıştır. Diğerlerinde ek fiil isim soylu sözcüğü yüklem yapmıştır.', 2);
b.q('ek-fiil', '"Çocukken çok yaramazdım." cümlesinin yüklemindeki ek fiil hangi kiptedir?', ['Geniş zaman', 'Hikâye (görülen geçmiş)', 'Rivayet (öğrenilen geçmiş)', 'Şart', 'Gereklilik'], 'B', '"yaramaz-dı-m": "-dı" ek fiilin hikâye (görülen geçmiş) biçimidir.', 1);
b.q('ek-fiil', 'Ek fiilin olumsuzu aşağıdakilerden hangisiyle yapılır?', ['-ma / -me eki', '"yok" sözcüğü', '"değil" sözcüğü', '-sız / -siz eki', '"hiç" sözcüğü'], 'C', 'İsim cümlelerinde olumsuzluk "değil" ile sağlanır: "Öğretmen değildir."', 1);

// ── Fiilimsiler ────────────────────────────────────────────────
b.lesson('fiilimsi', 10, 'Fiillerden türeyip isim, sıfat ya da zarf görevinde kullanılan sözcükler.', [
  TABLE(['Fiilimsi', 'Ekler', 'Örnek'], ['İsim-fiil', '-ma, -ış, -mak', 'Okumayı severim. Gülüşü güzel.'], ['Sıfat-fiil', '-an, -ası, -maz, -ar, -dık, -acak, -mış', 'Koşan çocuk, yazdığı mektup'], ['Zarf-fiil', '-ıp, -arak, -ınca, -ken, -madan, -dıkça, -alı, -casına, -meksizin, -a…-a', 'Eve gelince ödevini yaptı.']),
  TIP('"-ma" eki olumsuzluk eki de olabilir: "gelme!" (emir, olumsuz). Fiilimsi olan -ma, sözcüğü isimleştirir ve çekim eki alabilir: "gelmesi".', 'warn'),
  H('Kalıcı isimler'),
  P('Bazı fiilimsiler zamanla bir varlığın adı olmuştur ve artık fiilimsi sayılmaz: dondurma, çakmak, dolma, kazma, yazar, gelecek (zaman anlamında).'),
  UL('Fiilimsiler olumsuz yapılabilir ve kip eki almaz.', 'Fiilimsi içeren cümleler genellikle girişik birleşik cümledir.'),
], [card('Zarf-fiil ekleri', '-ıp, -arak, -ınca, -ken, -madan, -dıkça'), card('Kalıcı isim', 'dondurma, çakmak → fiilimsi değil')]);

b.q('fiilimsi', 'Aşağıdaki cümlelerin hangisinde zarf-fiil kullanılmıştır?', ['Okumayı çok seviyorum.', 'Koşan çocuk düştü.', 'Eve gelince ödevini yaptı.', 'Yazdığı mektubu okudu.', 'Gülüşü herkesi etkiledi.'], 'C', '"gel-ince" fiili zaman yönünden nitelediği için zarf-fiildir. Diğerleri isim-fiil ya da sıfat-fiildir.', 1);
b.q('fiilimsi', 'Aşağıdaki cümlelerin hangisinde «» içindeki sözcük fiilimsi DEĞİLDİR?', ['«Okumak» insanı geliştirir.', '«Koşan» çocuk yoruldu.', 'Markette «dondurma» aldık.', 'Beni «görünce» gülümsedi.', 'İngilizceyi «yazarak» öğrendi.'], 'C', '"dondurma" bir yiyeceğin adı olmuş kalıcı isimdir; fiilimsi sayılmaz.', 2);
b.q('fiilimsi', '"Yazdığı mektubu bana okudu." cümlesindeki fiilimsinin türü aşağıdakilerden hangisidir?', ['İsim-fiil', 'Sıfat-fiil', 'Zarf-fiil', 'Kalıcı isim', 'Fiilimsi yoktur'], 'B', '"yaz-dığı" ekiyle "mektup" ismini niteler; sıfat-fiildir.', 1);

// ── Cümlenin ögeleri ───────────────────────────────────────────
b.lesson('ogeler', 11, 'Yüklemden başlayarak özne, nesne, dolaylı tümleç ve zarf tümlecini bulma yöntemi.', [
  FLOW('Öge bulma sırası', 'Yüklemi bul (yargıyı taşıyan öge)', 'Yükleme "kim/ne?" sor → özne', '"neyi/ne?" sor → belirtili/belirtisiz nesne', '"nereye, nerede, nereden, kime?" sor → dolaylı tümleç', '"nasıl, ne zaman, niçin, ne kadar?" sor → zarf tümleci'),
  TABLE(['Öge', 'Soru', 'Örnek'], ['Özne', 'kim? ne?', 'Annem geldi.'], ['Belirtili nesne', 'neyi? kimi?', 'Kitabı okudu.'], ['Belirtisiz nesne', 'ne?', 'Kitap okudu.'], ['Dolaylı tümleç', 'nereye, kime, neden…', 'Bana söyledi.'], ['Zarf tümleci', 'nasıl, ne zaman, niçin', 'Dün geldi.']),
  H('Sözde özne'),
  P('Edilgen fiillerde işi yapan belli değildir; işten etkilenen öge özne gibi görünür: "Kapı açıldı." (Kapıyı biri açtı.) Buna sözde özne denir.'),
  EX('"Dün akşam annem bana güzel bir hediye aldı." cümlesinin ögelerini sıralayın.', ['Yüklem: aldı', 'Kim aldı? annem → özne', 'Ne aldı? güzel bir hediye → belirtisiz nesne', 'Kime? bana → dolaylı tümleç', 'Ne zaman? dün akşam → zarf tümleci'], 'ZT – Ö – DT – BN – Y'),
], [card('Sözde özne', 'Edilgen yüklem: Kapı açıldı.'), card('Belirtili nesne', '-ı hâl eki alır: Kitabı okudu.')]);

b.q('ogeler', '"Dün akşam annem bana güzel bir hediye aldı." cümlesinin öge dizilişi aşağıdakilerden hangisidir?', ['Zarf tümleci – Özne – Dolaylı tümleç – Belirtisiz nesne – Yüklem', 'Özne – Zarf tümleci – Nesne – Dolaylı tümleç – Yüklem', 'Zarf tümleci – Özne – Belirtili nesne – Dolaylı tümleç – Yüklem', 'Dolaylı tümleç – Özne – Zarf tümleci – Belirtisiz nesne – Yüklem', 'Zarf tümleci – Dolaylı tümleç – Özne – Nesne – Yüklem'], 'A', 'Dün akşam (ne zaman? ZT) – annem (kim? Ö) – bana (kime? DT) – güzel bir hediye (ne? belirtisiz nesne) – aldı (Y).', 2);
b.q('ogeler', 'Aşağıdaki cümlelerin hangisinde sözde özne vardır?', ['Çocuklar bahçede oynuyor.', 'Kapı birden açıldı.', 'Ali kitabını okudu.', 'Kuşlar güneye uçtu.', 'Öğretmen soruyu sordu.'], 'B', '"açıldı" edilgen bir fiildir; kapıyı açan belli değildir. "Kapı" sözde öznedir.', 1);
b.q('ogeler', 'Aşağıdaki cümlelerin hangisinde belirtili nesne vardır?', ['Akşam kitap okudu.', 'Kitabı masaya koydu.', 'Okula erken gitti.', 'Bize çok güldü.', 'Yarın Ankara\'ya gidecek.'], 'B', '"Kitabı" yükleme sorulan "neyi?" sorusunun yanıtıdır ve belirtme hâl eki almıştır.', 1);

// ── Cümle türleri ──────────────────────────────────────────────
b.lesson('cumle-turleri', 10, 'Cümleleri yükleminin türüne, yerine, anlamına ve yapısına göre sınıflandırma.', [
  TABLE(['Ölçüt', 'Türler'], ['Yüklemin türü', 'İsim cümlesi (Hava soğuk.) – Fiil cümlesi (Kar yağdı.)'], ['Yüklemin yeri', 'Kurallı (yüklem sonda) – Devrik (yüklem sonda değil) – Eksiltili (yüklem yok)'], ['Anlam', 'Olumlu – Olumsuz – Soru – Ünlem'], ['Yapı', 'Basit – Birleşik – Sıralı – Bağlı']),
  H('Birleşik cümleler'),
  UL('Girişik: Fiilimsili yan cümle içerir. "Okula gelince beni ara."', 'Şartlı: "-sa/-se" ile kurulur. "Çalışırsan başarırsın."', 'Ki\'li: "Duydum ki geliyorsun."', 'İç içe: Bir cümle başka bir cümlenin ögesi olur. "Annem \'Yarın gel.\' dedi."'),
  H('Yapıca olumsuz – anlamca olumlu'),
  P('"Bunu bilmeyen yok." cümlesi "yok" nedeniyle yapıca olumsuzdur ama "herkes biliyor" anlamı taşır; anlamca olumludur.'),
], [card('Devrik cümle', 'Yüklem sonda değil: Gel buraya.'), card('Şartlı birleşik cümle', 'Çalışırsan başarırsın.')]);

b.q('cumle-turleri', 'Aşağıdaki cümlelerden hangisi devrik bir cümledir?', ['Yarın erken kalkacağız.', 'Gel buraya hemen.', 'Kitabı masaya bıraktım.', 'Herkes toplantıya katıldı.', 'Akşam yağmur yağdı.'], 'B', '"Gel" yüklemi cümlenin sonunda değil başında yer aldığı için cümle devriktir.', 1);
b.q('cumle-turleri', 'Aşağıdakilerden hangisi şartlı birleşik cümledir?', ['Okula giderken onu gördüm.', 'Çalışırsan başarırsın.', 'Duydum ki tatile çıkıyorsun.', 'Kitap okudu, uyudu.', 'Hem güldü hem ağladı.'], 'B', 'Temel cümlenin yargısı "-sa/-se" ekiyle kurulan şart yan cümlesine bağlıdır.', 1);
b.q('cumle-turleri', 'Aşağıdaki cümlelerin hangisi yapıca olumsuz, anlamca olumludur?', ['Bu soruyu kimse çözemedi.', 'Bunu bilmeyen yok.', 'Bugün okula gitmedim.', 'Hiç ders çalışmadı.', 'Ona güvenmiyorum.'], 'B', '"bilmeyen yok" = herkes biliyor. Yapıda olumsuzluk ("yok") vardır ama anlam olumludur.', 2);

// ── Fiilde çatı ────────────────────────────────────────────────
b.lesson('cati', 10, 'Fiillerin özneye ve nesneye göre çatı özellikleri: etken-edilgen, geçişli-geçişsiz, dönüşlü, işteş, ettirgen.', [
  TABLE(['Özne-yüklem ilişkisi', 'Ek', 'Örnek'], ['Etken', '—', 'Ali kapıyı açtı.'], ['Edilgen', '-l, -n', 'Kapı açıldı.'], ['Dönüşlü', '-l, -n (iş özneye döner)', 'Çocuk yıkandı. (kendini yıkadı)'], ['İşteş', '-ş', 'Kuşlar cıvıldaştı. Arkadaşlar selamlaştı.']),
  TABLE(['Nesne-yüklem ilişkisi', 'Özellik', 'Örnek'], ['Geçişli', 'Nesne alabilir', 'okumak (neyi?)'], ['Geçişsiz', 'Nesne alamaz', 'uyumak, gülmek'], ['Oldurgan', 'Geçişsiz fiil geçişli olur', 'gülmek → güldürmek'], ['Ettirgen', 'Geçişli fiil, işi başkasına yaptırır', 'içmek → içirmek']),
  TIP('Edilgen fiilin önüne "biri tarafından" koyun: "Yollar (biri tarafından) temizlendi." anlam bozulmuyorsa edilgendir.'),
], [card('Edilgen testi', '"... tarafından" eklenebiliyor mu?'), card('İşteş çatı', 'Birlikte ya da karşılıklı yapma: -ş')]);

b.q('cati', 'Aşağıdaki cümlelerin hangisinin yüklemi edilgen çatılıdır?', ['Çocuk parkta koştu.', 'Yollar sabah erkenden temizlendi.', 'Ayşe çok sevindi.', 'Annesi çocuğu uyuttu.', 'Kuşlar ağaçta öttü.'], 'B', '"temizlendi" fiilinde işi yapan belli değildir; "-l" eki edilgen çatı oluşturmuştur.', 1);
b.q('cati', 'Aşağıdaki cümlelerin hangisinde yüklem işteş çatılıdır?', ['Kitabı bir günde okudu.', 'Kapı rüzgârla açıldı.', 'Çocuk banyoda yıkandı.', 'Kuşlar ağaçta cıvıldaştı.', 'Ayşe çok sevindi.'], 'D', '"cıvıldaşmak" işin birlikte yapıldığını bildirir; "-ş" eki işteş çatı oluşturmuştur.', 2);
b.q('cati', 'Aşağıdaki cümlelerin hangisinde yüklem ettirgen çatılıdır?', ['Ağaçlar budandı.', 'Kuşlar uçtu.', 'Çocuk güldü.', 'Kitabı okudu.', 'Annesi çocuğa süt içirdi.'], 'E', '"içmek" geçişli bir fiildir; "-ir" ekiyle işin başkasına yaptırıldığını bildiren ettirgen fiil olmuştur.', 2);

// ── Anlatım bozuklukları ───────────────────────────────────────
b.lesson('anlatim-bozuklugu', 11, 'Anlam ve yapı kaynaklı anlatım bozukluklarını tanıma ve düzeltme.', [
  H('Anlamdan kaynaklanan bozukluklar'),
  UL('Gereksiz sözcük: "Yaklaşık elli kadar kişi" (yaklaşık = kadar)', 'Anlamca çelişen sözcükler: "kesinlikle belki"', 'Sözcüğün yanlış anlamda kullanılması: "Katılım oranı çok fazlaydı." (oran "yüksek" olur)', 'Mantık ve sıralama hatası: "Ölümlü ya da ağır yaralı kaza" yerine "Ağır yaralı ya da ölümlü"', 'Deyim yanlışlığı: "kulak takmamak" yanlıştır; doğrusu "kulak asmamak"'),
  H('Yapıdan (dil bilgisinden) kaynaklanan bozukluklar'),
  TABLE(['Bozukluk', 'Örnek', 'Neden'], ['Özne-yüklem uyumsuzluğu', 'Her öğrenci ödevlerini yapmalıdırlar.', 'Tekil özne, çoğul yüklem'], ['Ortak öge yanlışlığı', 'Kurala uymayan ve yanlış bulanlar…', '"kurala uymak" (-a) / "kuralı bulmak" (-ı)'], ['Yüklem eksikliği', 'Ben çay, o kahve içti.', '"Ben çay içtim" yüklemi eksik'], ['Tamlama yanlışlığı', 'Okulun ve evin önü', 'iki tamlayana tek tamlanan'], ['Ek yanlışlığı', 'Bize de bekliyorlar.', '"Bizi de bekliyorlar."']),
  TIP('Bağlaçla bağlanan iki yüklem varsa her birinin ortak ögeyle ayrı ayrı uyup uymadığını kontrol edin; ortak öge yanlışlığı TYT\'nin en sevdiği bozukluktur.'),
], [card('Ortak öge yanlışlığı', 'Bağlanan yüklemler farklı hâl eki ister'), card('Özne-yüklem uyumu', 'Her öğrenci … yapmalıdır (tekil)')]);

b.q('anlatim-bozuklugu', '"Bu kurala uymayan ve yanlış bulan kişiler oldu." cümlesindeki anlatım bozukluğunun nedeni aşağıdakilerden hangisidir?', ['Gereksiz sözcük kullanılması', 'Ortak öge yanlışlığı', 'Özne eksikliği', 'Deyim yanlışlığı', 'Mantık hatası'], 'B', '"kurala" ögesi iki yükleme ortak kullanılmış; ama "uymak" -a, "bulmak" ise -ı hâl eki ister: "Bu kurala uymayan ve bu kuralı yanlış bulan…" olmalıdır.', 3);
b.q('anlatim-bozuklugu', '"Her öğrenci derse zamanında gelmeli ve ödevlerini yapmalıdırlar." cümlesindeki anlatım bozukluğu nasıl giderilir?', ['"Her" sözcüğü çıkarılarak', '"zamanında" yerine "erken" getirilerek', '"yapmalıdırlar" yerine "yapmalıdır" getirilerek', '"ödevlerini" yerine "ödevini" getirilerek', '"derse" sözcüğü çıkarılarak'], 'C', '"Her öğrenci" tekil bir öznedir; yüklem de tekil olmalıdır: "yapmalıdır".', 2);

export default b.done();
