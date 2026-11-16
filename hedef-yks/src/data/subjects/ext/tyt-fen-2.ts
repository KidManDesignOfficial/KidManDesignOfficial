/** TYT Fen Bilimleri: Fizik, Kimya, Biyoloji'nin kalan konuları. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../../build.ts';

// ═════════════════════════════ FİZİK ═════════════════════════════
const fz = builder('tyt-fizik', 'b');

fz.lesson('giris', 7, 'Fiziğin alt dalları, temel ve türetilmiş büyüklükler, skaler ve vektörel nicelikler.', [
  TABLE(['Alt dal', 'İnceler'], ['Mekanik', 'Hareket ve kuvvet'], ['Termodinamik', 'Isı, sıcaklık, enerji dönüşümleri'], ['Elektromanyetizma', 'Elektrik ve manyetizma'], ['Optik', 'Işık ve görme olayları'], ['Atom ve nükleer fizik', 'Atomun ve çekirdeğin yapısı'], ['Katıhal fiziği', 'Katıların elektriksel ve manyetik özellikleri']),
  TABLE(['SI temel büyüklüğü', 'Birim'], ['Uzunluk', 'metre (m)'], ['Kütle', 'kilogram (kg)'], ['Zaman', 'saniye (s)'], ['Elektrik akımı', 'amper (A)'], ['Sıcaklık', 'kelvin (K)'], ['Madde miktarı', 'mol'], ['Işık şiddeti', 'kandela (cd)']),
  UL('Skaler büyüklük yalnızca sayı ve birimle ifade edilir: kütle, zaman, sıcaklık, enerji.', 'Vektörel büyüklüğün yönü de vardır: kuvvet, hız, ivme, yer değiştirme.'),
], [card('7 temel büyüklük', 'uzunluk, kütle, zaman, akım, sıcaklık, madde miktarı, ışık şiddeti'), card('Vektörel', 'Kuvvet, hız, ivme, yer değiştirme')]);
fz.q('giris', 'Aşağıdakilerden hangisi SI birim sisteminde temel büyüklüktür?', ['Kuvvet', 'Hız', 'Elektrik akımı', 'Enerji', 'Basınç'], 'C', 'Elektrik akımı (amper) yedi temel büyüklükten biridir; diğerleri temel büyüklüklerden türetilir.', 1);
fz.q('giris', 'Aşağıdakilerden hangisi vektörel bir büyüklüktür?', ['Kütle', 'Sıcaklık', 'Zaman', 'Kuvvet', 'Enerji'], 'D', 'Kuvvetin büyüklüğü yanında yönü de vardır.', 1);
fz.q('giris', 'Ayna ve merceklerde görüntü oluşumunu inceleyen fizik alt dalı aşağıdakilerden hangisidir?', ['Mekanik', 'Optik', 'Termodinamik', 'Nükleer fizik', 'Katıhal fiziği'], 'B', 'Işıkla ilgili olaylar optiğin konusudur.', 1);

fz.lesson('madde', 9, 'Kütle, hacim ve özkütle; karışımların özkütlesi; adezyon, kohezyon ve kılcallık.', [
  F('Özkütle', 'd = m / V', 'Eşit hacimli karışım: d = (d₁ + d₂)/2', 'Eşit kütleli karışım: d = 2d₁d₂/(d₁ + d₂)'),
  UL('Özkütle ayırt edici bir özelliktir; sıcaklık ve basınca bağlıdır.', 'Kohezyon: Aynı tür tanecikler arası çekim. Adezyon: Farklı tür tanecikler arası çekim.', 'Adezyon kohezyondan büyükse sıvı kılcal boruda yükselir (su–cam); küçükse alçalır (cıva–cam).', 'Dayanıklılık, kesit alanı / hacim oranıyla ilgilidir: Boyut büyüdükçe dayanıklılık azalır.'),
  EX('Eşit hacimde d ve 3d özkütleli iki sıvı karıştırılıyor. Karışımın özkütlesi nedir?', ['Eşit hacim: d = (d₁ + d₂)/2', '(d + 3d)/2'], '2d'),
], [card('Kılcallık (su-cam)', 'Adezyon > kohezyon → yükselir'), card('Eşit hacim karışımı', '(d₁ + d₂)/2')]);
fz.q('madde', 'Kütlesi 60 g ve hacmi 20 cm³ olan bir cismin özkütlesi kaç g/cm³\'tür?', ['0,33', '1,2', '3', '40', '1200'], 'C', 'd = m/V = 60/20 = 3 g/cm³.', 1);
fz.q('madde', 'Özkütleleri d ve 3d olan iki sıvıdan eşit hacimler alınarak homojen bir karışım yapılıyor. Karışımın özkütlesi nedir?', ['d', '1,5d', '2d', '3d', '4d'], 'C', 'Eşit hacimlerde karışım özkütlesi aritmetik ortalamadır: (d + 3d)/2 = 2d.', 2);
fz.q('madde', 'Suyun ince cam borularda yükselmesi aşağıdakilerden hangisiyle açıklanır?', ['Kohezyon kuvvetinin adezyondan büyük olması', 'Adezyon kuvvetinin kohezyondan büyük olması', 'Suyun özkütlesinin büyük olması', 'Kaldırma kuvveti', 'Açık hava basıncının azalması'], 'B', 'Su molekülleri ile cam arasındaki çekim (adezyon), su moleküllerinin kendi aralarındaki çekimden (kohezyon) büyüktür.', 2);

fz.lesson('enerji', 9, 'İş, güç, kinetik ve potansiyel enerji; enerjinin korunumu ve verim.', [
  F('Formüller', 'İş: W = F · x  (kuvvet yönündeki yol)', 'Güç: P = W / t', 'Kinetik enerji: Ek = ½ · m · v²', 'Yer çekimi potansiyel enerjisi: Ep = m · g · h', 'Verim = Alınan enerji / Verilen enerji'),
  UL('Kuvvet hareket yönüne dikse iş yapılmaz (ör. çantayı yatay taşırken ağırlığa karşı iş sıfırdır).', 'Sürtünmesiz ortamda mekanik enerji (Ek + Ep) korunur.', 'Hız iki katına çıkarsa kinetik enerji dört katına çıkar.'),
  EX('2 kg kütleli bir cisim 10 m yükseklikten serbest bırakılıyor. Yere çarpma anındaki kinetik enerjisi nedir? (g = 10 m/s², sürtünme yok)', ['Başlangıç Ep = 2 · 10 · 10 = 200 J', 'Enerji korunur: yerde Ek = 200 J'], '200 J'),
], [card('Ek', '½mv² — hız 2 kat → Ek 4 kat'), card('Ep', 'mgh')]);
fz.q('enerji', '10 N büyüklüğündeki bir kuvvet, bir cismi kuvvet doğrultusunda 5 m hareket ettiriyor. Kuvvetin yaptığı iş kaç J\'dür?', ['0,5', '2', '15', '50', '500'], 'D', 'W = F · x = 10 · 5 = 50 J.', 1);
fz.q('enerji', 'Kütlesi 2 kg olan bir cismin yerden 10 m yükseklikteki potansiyel enerjisi kaç J\'dür? (g = 10 m/s²)', ['20', '100', '200', '400', '2000'], 'C', 'Ep = m · g · h = 2 · 10 · 10 = 200 J.', 1);
fz.q('enerji', 'Bir cismin hızı iki katına çıkarılırsa kinetik enerjisi nasıl değişir?', ['Değişmez.', 'İki katına çıkar.', 'Dört katına çıkar.', 'Yarıya iner.', 'Sekiz katına çıkar.'], 'C', 'Ek = ½mv²; hız 2 kat olunca v² 4 kat olur.', 1);

fz.lesson('isi-sicaklik', 10, 'Isı ve sıcaklık farkı, termometre ölçekleri, ısı alışverişi ve hal değişimi.', [
  UL('Sıcaklık, taneciklerin ortalama kinetik enerjisinin göstergesidir; termometreyle ölçülür.', 'Isı, sıcaklık farkı nedeniyle aktarılan enerjidir; kalorimetre kabıyla ölçülür, birimi joule (J) veya kaloridir.'),
  F('Bağıntılar', 'K = °C + 273', '°F = 1,8 · °C + 32', 'Q = m · c · ΔT  (sıcaklık değişimi)', 'Q = m · L  (hal değişimi)'),
  TIP('Saf bir madde hal değiştirirken aldığı ısıyı taneciklerin arasındaki bağları koparmakta kullanır; bu sırada sıcaklığı DEĞİŞMEZ.', 'warn'),
  PLOT('Buzun ısıtılma grafiği (temsilî): Erime (0 °C) ve kaynama (100 °C) sırasında sıcaklık sabit kalır.', [0, 10], [-20, 120], { label: 'Sıcaklık (°C)', f: (t) => (t < 1 ? -20 + 20 * t : t < 3 ? 0 : t < 6 ? ((t - 3) / 3) * 100 : t < 9 ? 100 : 100 + (t - 9) * 15) }),
  UL('Genleşme: Isınan maddeler genellikle genleşir. Su 0–4 °C arasında ısıtıldığında büzülür (suyun anomalisi); bu yüzden göllerin yüzeyi donar, dipte canlılık sürer.'),
], [card('K = ?', '°C + 273'), card('Hal değişiminde sıcaklık', 'Değişmez')]);
fz.q('isi-sicaklik', '27 °C sıcaklık kaç kelvindir?', ['246', '273', '300', '327', '354'], 'C', 'K = °C + 273 = 27 + 273 = 300 K.', 1);
fz.q('isi-sicaklik', 'Öz ısısı 4 J/(g·°C) olan 50 g sıvının sıcaklığını 10 °C artırmak için kaç J ısı gerekir?', ['200', '500', '2000', '4000', '20000'], 'C', 'Q = m · c · ΔT = 50 · 4 · 10 = 2000 J.', 1);
fz.q('isi-sicaklik', 'Saf bir madde hal değiştirirken aşağıdakilerden hangisi değişmez?', ['Hacmi', 'Sıcaklığı', 'İç enerjisi', 'Özkütlesi', 'Tanecikler arası uzaklık'], 'B', 'Hal değişimi süresince alınan ısı tanecikler arası bağların kopmasında kullanılır; sıcaklık sabit kalır.', 2);
fz.q('isi-sicaklik', '50 °C sıcaklık kaç °F\'tır?', ['82', '90', '122', '132', '146'], 'C', '°F = 1,8 · 50 + 32 = 90 + 32 = 122.', 1);

fz.lesson('basinc', 11, 'Katı, sıvı ve gaz basıncı; Pascal ilkesi ve kaldırma kuvveti.', [
  F('Basınç', 'Katı: P = F / A', 'Sıvı: P = h · d · g', 'Kaldırma kuvveti: F_k = V_batan · d_sıvı · g'),
  UL('Sıvı basıncı kabın şekline değil, derinliğe ve sıvının özkütlesine bağlıdır.', 'Pascal ilkesi: Kapalı kaptaki sıvıya uygulanan basınç her yöne aynen iletilir (hidrolik fren, kriko).', 'Açık hava basıncı deniz seviyesinde 76 cmHg\'dir (Torricelli). Yükseldikçe azalır; bu nedenle suyun kaynama sıcaklığı düşer.'),
  TABLE(['Durum', 'Koşul'], ['Yüzme', 'd_cisim < d_sıvı; F_k = G'], ['Askıda kalma', 'd_cisim = d_sıvı; F_k = G'], ['Batma', 'd_cisim > d_sıvı; F_k < G']),
  EX('5 m derinlikte suyun basıncı nedir? (d = 1000 kg/m³, g = 10 m/s²)', ['P = h · d · g = 5 · 1000 · 10'], '50 000 Pa'),
], [card('Sıvı basıncı', 'h · d · g'), card('Yüzen cisim', 'Kaldırma kuvveti = ağırlık')]);
fz.q('basinc', 'Ağırlığı 600 N olan bir sandık, 0,2 m²\'lik yüzeyi üzerine yere konuluyor. Sandığın yere uyguladığı basınç kaç Pa\'dır?', ['120', '300', '3000', '6000', '12000'], 'C', 'P = F / A = 600 / 0,2 = 3000 Pa.', 1);
fz.q('basinc', 'Özkütlesi 1000 kg/m³ olan suyun 5 m derinlikteki sıvı basıncı kaç Pa\'dır? (g = 10 m/s²)', ['5000', '10000', '50000', '100000', '500000'], 'C', 'P = h · d · g = 5 · 1000 · 10 = 50 000 Pa.', 1);
fz.q('basinc', 'Suda yüzen bir cisim için aşağıdakilerden hangisi doğrudur?', ['Kaldırma kuvveti cismin ağırlığından büyüktür.', 'Kaldırma kuvveti cismin ağırlığına eşittir.', 'Cismin özkütlesi suyun özkütlesinden büyüktür.', 'Cismin tamamı suyun içindedir.', 'Kaldırma kuvveti sıfırdır.'], 'B', 'Dengede yüzen cisimde kaldırma kuvveti ağırlığı dengeler.', 2);
fz.q('basinc', 'Deniz seviyesinden yüksek bir dağa çıkıldıkça aşağıdakilerden hangisi gerçekleşir?', ['Açık hava basıncı artar, suyun kaynama sıcaklığı yükselir.', 'Açık hava basıncı azalır, suyun kaynama sıcaklığı düşer.', 'Açık hava basıncı değişmez.', 'Suyun kaynama sıcaklığı değişmez.', 'Açık hava basıncı azalır, kaynama sıcaklığı yükselir.'], 'B', 'Yükseldikçe üstteki hava sütunu kısalır, basınç azalır; düşük basınçta su daha düşük sıcaklıkta kaynar.', 2);

fz.lesson('elektrostatik', 9, 'Yük, elektriklenme çeşitleri, elektroskop ve Coulomb kuvveti.', [
  UL('Aynı cins yükler birbirini iter, zıt yükler çeker. Yük birimi coulomb (C); q = n · e.', 'İletkenlerde yük dış yüzeye dağılır; yalıtkanlarda oluştuğu yerde kalır.'),
  TABLE(['Elektriklenme', 'Sonuç'], ['Sürtünme', 'Cisimler eşit miktarda ZIT yükle yüklenir.'], ['Dokunma', 'Cisimler AYNI işaretli yükle yüklenir; özdeş kürelerde toplam yük eşit paylaşılır.'], ['Etki (indüksiyon)', 'Yaklaştırılan yüke yakın uçta zıt, uzak uçta aynı yük toplanır.']),
  F('Coulomb yasası', 'F = k · q₁ · q₂ / d²'),
  EX('+8q ve −2q yüklü özdeş iletken küreler dokundurulup ayrılıyor. Son yükleri nedir?', ['Toplam yük: +8q − 2q = +6q', 'Özdeş küreler eşit paylaşır'], 'Her biri +3q'),
], [card('Sürtünmeyle elektriklenme', 'Eşit ve zıt yük'), card('Uzaklık 2 kat', 'Coulomb kuvveti 1/4')]);
fz.q('elektrostatik', 'Sürtünme ile elektriklenen iki cisim için aşağıdakilerden hangisi doğrudur?', ['Aynı cins yükle yüklenirler.', 'Eşit miktarda zıt yükle yüklenirler.', 'Yalnızca biri yüklenir.', 'İkisi de nötr kalır.', 'Yük miktarları kütleleriyle orantılıdır.'], 'B', 'Bir cisim elektron kaybederken diğeri aynı sayıda elektron kazanır; yükler eşit ve zıttır.', 1);
fz.q('elektrostatik', 'İki noktasal yük arasındaki uzaklık iki katına çıkarılırsa aralarındaki elektriksel kuvvet nasıl değişir?', ['İki katına çıkar.', 'Dört katına çıkar.', 'Değişmez.', 'Yarıya iner.', 'Dörtte birine iner.'], 'E', 'F, d²\'yle ters orantılıdır: uzaklık 2 kat → kuvvet 1/4.', 1);
fz.q('elektrostatik', '+8q ve −2q yüklü özdeş iletken küreler birbirine dokundurulup ayrılıyor. Kürelerin son yükleri nedir?', ['+4q ve +4q', '+3q ve +3q', '+5q ve +5q', '+6q ve 0', '+8q ve −2q'], 'B', 'Toplam yük +6q, özdeş kürelerde eşit paylaşılır: +3q ve +3q.', 2);

fz.lesson('manyetizma', 8, 'Mıknatısın kutupları, manyetik alan, akımın manyetik etkisi ve Dünya\'nın manyetik alanı.', [
  UL('Mıknatısın iki kutbu vardır: N ve S. Aynı kutuplar iter, zıt kutuplar çeker.', 'Mıknatıs ne kadar küçük parçaya bölünürse bölünsün her parçanın yine N ve S kutbu olur; tek kutuplu mıknatıs yoktur.', 'Manyetik alan çizgileri mıknatısın dışında N\'den S\'ye yönelir.', 'Akım geçen tel çevresinde manyetik alan oluşur (Ørsted). Yönü sağ el kuralıyla bulunur: başparmak akım yönünde, kıvrılan parmaklar alan yönünde.'),
  TABLE(['Madde', 'Manyetik davranış'], ['Demir, nikel, kobalt', 'Mıknatısa güçlü çekilir (ferromanyetik)'], ['Bakır, alüminyum, plastik, cam', 'Mıknatısa belirgin şekilde çekilmez']),
  P('Bir bobinden (sarmal tel) akım geçirildiğinde içinde düzgün bir manyetik alan oluşur; içine demir çekirdek konulursa elektromıknatıs elde edilir. Akım kesilince mıknatıslık kaybolur (hurda vinçleri, elektrikli zil).'),
  TIP('Pusulanın N kutbu coğrafi kuzeyi gösterir; çünkü Dünya\'nın manyetik güney kutbu coğrafi kuzeye yakındır.'),
], [card('Mıknatıs ikiye bölünürse', 'İki ayrı mıknatıs (her biri N ve S)'), card('Akımın manyetik alanı', 'Sağ el kuralı')]);
fz.q('manyetizma', 'İki mıknatısın aynı adlı kutupları birbirine yaklaştırıldığında ne olur?', ['Birbirini çeker.', 'Birbirini iter.', 'Etkileşmez.', 'Kutuplar yer değiştirir.', 'Mıknatıslık kaybolur.'], 'B', 'Aynı adlı kutuplar birbirini iter, zıt adlı kutuplar çeker.', 1);
fz.q('manyetizma', 'Bir çubuk mıknatıs ortasından ikiye kesilirse ne olur?', ['Bir parça N, diğeri S kutbu olur.', 'Mıknatıslık özelliği kaybolur.', 'Her parça N ve S kutbu olan ayrı bir mıknatıs olur.', 'Yalnızca bir parça mıknatıs kalır.', 'Parçalar birbirini sürekli iter.'], 'C', 'Tek kutuplu mıknatıs yoktur; her parça kendi N ve S kutbuna sahip olur.', 1);
fz.q('manyetizma', 'Akım geçen düz bir telin çevresinde oluşan manyetik alanın yönü hangi kuralla bulunur?', ['Sol el kuralı', 'Sağ el kuralı', 'Lenz kuralı', 'Pascal ilkesi', 'Arşimet ilkesi'], 'B', 'Sağ elin başparmağı akım yönünü, kıvrılan dört parmak manyetik alan yönünü gösterir.', 1);

fz.lesson('dalgalar', 10, 'Dalga türleri, periyot-frekans-dalga boyu ilişkisi; ses ve su dalgaları.', [
  TABLE(['Sınıflama', 'Türler'], ['Titreşim doğrultusuna göre', 'Enine (ışık, yay dalgası) – Boyuna (ses)'], ['Taşıdığı enerjiye göre', 'Mekanik (ses, su, yay) – Elektromanyetik (ışık, radyo, X ışını)']),
  F('Temel bağıntı', 'v = λ · f', 'f = 1 / T'),
  UL('Dalganın frekansı kaynağa bağlıdır; ortam değişince DEĞİŞMEZ.', 'Hız ortama bağlıdır; dalga boyu hızla birlikte değişir.', 'Ses mekanik dalgadır: boşlukta yayılmaz, katılarda sıvı ve gazlardan daha hızlı yayılır.', 'Su dalgaları derin ortamdan sığ ortama geçerken yavaşlar, dalga boyu kısalır.'),
  EX('Frekansı 50 Hz, dalga boyu 4 m olan dalganın hızı nedir?', ['v = λ · f = 4 · 50'], '200 m/s'),
], [card('Ortam değişince', 'Frekans aynı kalır'), card('Ses', 'Boyuna, mekanik; boşlukta yayılmaz')]);
fz.q('dalgalar', 'Frekansı 50 Hz ve dalga boyu 4 m olan bir dalganın yayılma hızı kaç m/s\'dir?', ['0,08', '12,5', '46', '54', '200'], 'E', 'v = λ · f = 4 · 50 = 200 m/s.', 1);
fz.q('dalgalar', 'Ses dalgalarıyla ilgili aşağıdaki ifadelerden hangisi yanlıştır?', ['Mekanik dalgadır.', 'Boyuna dalgadır.', 'Boşlukta yayılabilir.', 'Katılarda havadakinden daha hızlı yayılır.', 'Frekansı kaynağa bağlıdır.'], 'C', 'Ses yayılmak için maddesel ortama ihtiyaç duyar; boşlukta yayılmaz.', 1);
fz.q('dalgalar', 'Bir dalga bir ortamdan başka bir ortama geçerken aşağıdakilerden hangisi değişmez?', ['Hızı', 'Dalga boyu', 'Frekansı', 'Yayılma doğrultusu', 'Genliği'], 'C', 'Frekans dalgayı oluşturan kaynağa bağlıdır; ortam değişse de aynı kalır.', 2);

fz.lesson('optik', 11, 'Işığın yansıması, düz ve küresel aynalar, kırılma, mercekler ve göz kusurları.', [
  UL('Yansıma kanunu: Gelme açısı = yansıma açısı (normalle yapılan açılar).', 'Düz aynada görüntü: düz, cisimle eşit boyda, aynaya uzaklığı eşit, sanal ve simetriktir.', 'Çukur ayna ışığı toplar (araba farı), tümsek ayna dağıtır ve geniş görüş alanı sağlar (dikiz aynası).'),
  H('Kırılma'),
  P('Işık az yoğun ortamdan çok yoğun ortama (havadan suya) geçerken yavaşlar ve normale yaklaşarak kırılır. Çok yoğundan az yoğuna geçerken sınır açısını aşarsa tam yansıma olur (fiber optik kablo).'),
  TABLE(['Mercek / kusur', 'Özellik'], ['İnce kenarlı (yakınsak)', 'Işığı toplar; hipermetropta kullanılır'], ['Kalın kenarlı (ıraksak)', 'Işığı dağıtır; miyopta kullanılır'], ['Miyop', 'Uzağı göremez; görüntü retinanın önüne düşer'], ['Hipermetrop', 'Yakını göremez; görüntü retinanın arkasına düşer']),
], [card('Yansıma kanunu', 'Gelme açısı = yansıma açısı'), card('Miyop', 'Kalın kenarlı (ıraksak) mercek')]);
fz.q('optik', 'Düz bir aynaya gelen ışının gelme açısı 35° ise yansıma açısı kaç derecedir?', ['35', '45', '55', '70', '145'], 'A', 'Yansıma kanununa göre gelme açısı yansıma açısına eşittir.', 1);
fz.q('optik', 'Düz aynada oluşan görüntü için aşağıdakilerden hangisi doğrudur?', ['Ters ve gerçektir.', 'Cisimden büyüktür.', 'Düz, cisimle eşit boyda ve sanaldır.', 'Ters ve cisimden küçüktür.', 'Aynanın önünde oluşur.'], 'C', 'Düz aynada görüntü düz, cisimle eşit boyda ve sanaldır; aynanın arkasında, cisimle aynı uzaklıkta görünür.', 1);
fz.q('optik', 'Miyop göz kusurunun giderilmesinde aşağıdakilerden hangisi kullanılır?', ['İnce kenarlı mercek', 'Kalın kenarlı mercek', 'Çukur ayna', 'Düz ayna', 'Prizma'], 'B', 'Miyopta görüntü retinanın önüne düştüğü için ışığı dağıtan kalın kenarlı (ıraksak) mercek kullanılır.', 2);
fz.q('optik', 'Işık havadan suya geçerken nasıl davranır?', ['Hızlanır ve normalden uzaklaşır.', 'Yavaşlar ve normale yaklaşarak kırılır.', 'Hızı değişmez.', 'Tam yansımaya uğrar.', 'Frekansı artar.'], 'B', 'Su havadan daha yoğun bir ortamdır; ışık yavaşlar ve normale yaklaşır.', 1);

// ═════════════════════════════ KİMYA ═════════════════════════════
const km = builder('tyt-kimya', 'b');

km.lesson('kimya-bilimi', 7, 'Simyadan kimyaya geçiş, kimyanın alt dalları, element sembolleri ve laboratuvar güvenliği.', [
  TABLE(['Bilim insanı', 'Katkısı'], ['Câbir bin Hayyân', 'Damıtma, süzme, kristallendirme gibi deneysel yöntemler'], ['Ebû Bekir er-Râzî', 'Alkol ve deney araçları; maddeleri sınıflandırma'], ['Robert Boyle', 'Element kavramını tanımladı; modern kimyanın başlangıcı'], ['Antoine Lavoisier', 'Kütlenin korunumu kanunu']),
  TABLE(['Sembol', 'Element'], ['Fe', 'Demir'], ['Cu', 'Bakır'], ['Ag', 'Gümüş'], ['Au', 'Altın'], ['Pb', 'Kurşun'], ['Na', 'Sodyum'], ['K', 'Potasyum'], ['Hg', 'Cıva']),
  UL('Element: Tek tür atomdan oluşan saf madde (O₂, Fe).', 'Bileşik: Farklı atomların belirli oranda birleşmesiyle oluşan saf madde (H₂O, NaCl).'),
  TIP('Laboratuvarda asit seyreltilirken suyun üzerine asit eklenir; tersi sıçramaya ve yanığa yol açar.', 'warn'),
], [card('Modern kimyanın başlangıcı', 'Robert Boyle'), card('Fe', 'Demir')]);
km.q('kimya-bilimi', 'Kütlenin korunumu kanununu ortaya koyan bilim insanı aşağıdakilerden hangisidir?', ['Robert Boyle', 'Antoine Lavoisier', 'John Dalton', 'Joseph Proust', 'Câbir bin Hayyân'], 'B', 'Lavoisier kapalı kapta yaptığı deneylerle tepkimelerde toplam kütlenin korunduğunu gösterdi.', 1);
km.q('kimya-bilimi', '"Fe" sembolü hangi elemente aittir?', ['Flor', 'Fosfor', 'Demir', 'Kurşun', 'Fermiyum'], 'C', 'Fe, demirin Latince adı "ferrum"dan gelir. Flor F, fosfor P, kurşun Pb\'dir.', 1);
km.q('kimya-bilimi', 'Aşağıdakilerden hangisi element değil, bileşiktir?', ['Altın', 'Oksijen gazı', 'Su', 'Demir', 'Helyum'], 'C', 'Su (H₂O), hidrojen ve oksijen atomlarının belirli oranda birleşmesiyle oluşur.', 1);

km.lesson('etkilesimler', 10, 'Güçlü etkileşimler (iyonik, kovalent, metalik) ve zayıf etkileşimler (hidrojen bağı, Van der Waals).', [
  TABLE(['Bağ', 'Oluşum', 'Örnek'], ['İyonik', 'Metal ile ametal arasında elektron aktarımı', 'NaCl, MgO'], ['Polar kovalent', 'Farklı ametaller arasında ortaklaşa elektron', 'HCl, H₂O'], ['Apolar kovalent', 'Aynı ametal atomları arasında', 'H₂, Cl₂, O₂'], ['Metalik', 'Metal katyonları ile serbest elektronlar', 'Fe, Cu']),
  H('Zayıf etkileşimler'),
  UL('Hidrojen bağı: H\'nin F, O veya N\'ye bağlı olduğu moleküller arasında (H₂O, NH₃, HF). Suyun kaynama noktasının yüksek olmasının nedenidir.', 'Dipol-dipol: Polar moleküller arasında.', 'London kuvvetleri: Tüm moleküller arasında; apolar moleküllerde tek etkileşimdir.'),
  TIP('Fiziksel değişimlerde (erime, kaynama) zayıf etkileşimler, kimyasal değişimlerde güçlü etkileşimler (bağlar) kırılır.'),
], [card('İyonik bağ', 'Metal + ametal'), card('Hidrojen bağı', 'H—F, H—O, H—N içeren moleküller arası')]);
km.q('etkilesimler', 'NaCl bileşiğindeki kimyasal bağ türü aşağıdakilerden hangisidir?', ['Apolar kovalent', 'Polar kovalent', 'İyonik', 'Metalik', 'Hidrojen bağı'], 'C', 'Na (metal) elektron verir, Cl (ametal) alır; oluşan zıt yüklü iyonlar arasında iyonik bağ vardır.', 1);
km.q('etkilesimler', 'Sıvı suda H₂O molekülleri arasındaki en etkin etkileşim aşağıdakilerden hangisidir?', ['İyonik bağ', 'Hidrojen bağı', 'Metalik bağ', 'London kuvvetleri', 'Apolar kovalent bağ'], 'B', 'Su moleküllerinde H, O\'ya bağlıdır; moleküller arasında güçlü hidrojen bağları oluşur.', 1);
km.q('etkilesimler', 'Aşağıdakilerden hangisinde apolar kovalent bağ vardır?', ['NaCl', 'HCl', 'H₂O', 'Cl₂', 'MgO'], 'D', 'Cl₂\'de aynı tür iki atom elektronları eşit paylaşır; bağ apolar kovalenttir.', 1);

km.lesson('maddenin-halleri', 9, 'Katı, sıvı, gaz ve plazma halleri; hal değişimleri, buhar basıncı ve kaynama.', [
  TABLE(['Hal değişimi', 'Geçiş'], ['Erime', 'Katı → sıvı'], ['Donma', 'Sıvı → katı'], ['Buharlaşma', 'Sıvı → gaz'], ['Yoğuşma', 'Gaz → sıvı'], ['Süblimleşme', 'Katı → gaz (naftalin, kuru buz)'], ['Kırağılaşma', 'Gaz → katı']),
  UL('Gazların belirli bir şekli ve hacmi yoktur; sıkıştırılabilir ve kabı doldurur.', 'Sıvıların belirli hacmi vardır, şekilleri kaba göre değişir.', 'Plazma: Yüksek sıcaklıkta iyonlaşmış gaz (yıldızlar, şimşek).'),
  P('Bir sıvı, buhar basıncı dış basınca eşit olduğunda kaynar. Bu yüzden düdüklü tencerede (yüksek basınç) su 100 °C\'nin üstünde, yüksek dağlarda ise altında kaynar.'),
], [card('Süblimleşme', 'Katı → gaz'), card('Kaynama koşulu', 'Buhar basıncı = dış basınç')]);
km.q('maddenin-halleri', 'Bir katının sıvı hâle geçmeden doğrudan gaz hâline geçmesine ne ad verilir?', ['Buharlaşma', 'Süblimleşme', 'Kırağılaşma', 'Yoğuşma', 'Erime'], 'B', 'Naftalin ve kuru buzda görülen bu olaya süblimleşme denir.', 1);
km.q('maddenin-halleri', 'Bir sıvının kaynaması için aşağıdaki koşullardan hangisi gerçekleşmelidir?', ['Sıvının buhar basıncı dış basınca eşit olmalıdır.', 'Sıcaklık 100 °C olmalıdır.', 'Sıvı yüzeyi genişletilmelidir.', 'Sıvı karıştırılmalıdır.', 'Dış basınç sıfır olmalıdır.'], 'A', 'Kaynama, buhar basıncının ortam basıncına eşitlendiği sıcaklıkta gerçekleşir; 100 °C yalnızca suyun 1 atm\'deki kaynama noktasıdır.', 2);
km.q('maddenin-halleri', 'Aşağıdakilerden hangisi gazların özelliklerinden biri değildir?', ['Sıkıştırılabilirler.', 'Bulundukları kabı tamamen doldururlar.', 'Belirli bir hacimleri vardır.', 'Tanecikleri arasındaki boşluklar büyüktür.', 'Tanecikleri hızlı ve düzensiz hareket eder.'], 'C', 'Gazların belirli bir hacmi yoktur; kabın hacmini alırlar.', 1);

km.lesson('doga-kimya', 8, 'Su döngüsü, su sertliği ve çevre kirliliğinin kimyasal nedenleri.', [
  TABLE(['Sorun', 'Kimyasal nedeni'], ['Asit yağmuru', 'SO₂ ve azot oksitlerin (NOₓ) su ile asit oluşturması'], ['Sera etkisinin artması', 'CO₂, CH₄, N₂O gibi sera gazları'], ['Ozon tabakasının incelmesi', 'CFC (kloroflorokarbon) gazları'], ['Suyun sertliği', 'Ca²⁺ ve Mg²⁺ iyonları']),
  UL('Sert su sabunun köpürmesini azaltır, tesisatta kireç (CaCO₃) birikimine yol açar.', 'Geri dönüşüm hammadde ve enerji tasarrufu sağlar; cam, metal, kâğıt ve plastikler ayrı toplanır.'),
], [card('Asit yağmuru', 'SO₂ ve NOₓ'), card('Su sertliği', 'Ca²⁺ ve Mg²⁺')]);
km.q('doga-kimya', 'Asit yağmurlarına neden olan başlıca gazlar aşağıdakilerden hangisidir?', ['O₂ ve N₂', 'SO₂ ve azot oksitler', 'He ve Ne', 'H₂ ve O₂', 'Ar ve CO'], 'B', 'Kükürt dioksit ve azot oksitler atmosferdeki su ile birleşerek sülfürik ve nitrik asit oluşturur.', 1);
km.q('doga-kimya', 'Ozon tabakasının incelmesinde en büyük paya sahip olan maddeler aşağıdakilerden hangisidir?', ['Kloroflorokarbonlar (CFC)', 'Karbondioksit', 'Su buharı', 'Azot gazı', 'Oksijen gazı'], 'A', 'Eski spreylerde ve soğutucularda kullanılan CFC\'ler stratosferde ozonu parçalar.', 1);
km.q('doga-kimya', 'Suyun sertliğine neden olan iyonlar aşağıdakilerden hangisidir?', ['Na⁺ ve K⁺', 'Ca²⁺ ve Mg²⁺', 'Cl⁻ ve F⁻', 'H⁺ ve OH⁻', 'Fe³⁺ ve Al³⁺'], 'B', 'Sert sularda kalsiyum ve magnezyum iyonları fazladır.', 1);

km.lesson('kanunlar', 9, 'Kütlenin korunumu, sabit oranlar, katlı oranlar ve birleşen hacimler kanunları.', [
  TABLE(['Kanun', 'Bilim insanı', 'İfade'], ['Kütlenin korunumu', 'Lavoisier', 'Tepkimeye giren maddelerin kütleleri toplamı ürünlerinkine eşittir.'], ['Sabit oranlar', 'Proust', 'Bir bileşikteki elementlerin kütlece birleşme oranı sabittir (suda H : O = 1 : 8).'], ['Katlı oranlar', 'Dalton', 'İki element birden fazla bileşik oluşturuyorsa, birinin sabit kütlesiyle birleşen diğerinin kütleleri arasında basit tam sayılı oran vardır (NO – NO₂).'], ['Birleşen hacimler', 'Gay-Lussac', 'Aynı koşullarda gazlar basit tam sayılı hacim oranlarıyla birleşir.']),
  EX('Suda kütlece H : O = 1 : 8 ise 4 g hidrojenle tam tepkimeye giren oksijen kaç gramdır?', ['1 g H ile 8 g O', '4 g H ile 4 · 8 = 32 g O'], '32 g'),
  TIP('Katlı oranlar kanunu için iki bileşikte de aynı iki element bulunmalıdır; NO ile NO₂ uygun, NO ile CO₂ uygun değildir.', 'warn'),
], [card('Sabit oranlar', 'Proust — suda H : O = 1 : 8'), card('Katlı oranlar', 'Dalton — NO, NO₂')]);
km.q('kanunlar', 'Su bileşiğinde hidrojenin oksijene kütlece birleşme oranı 1/8\'dir. 4 g hidrojenin tamamen tepkimeye girmesi için kaç g oksijen gerekir?', ['8', '16', '24', '32', '36'], 'D', 'Sabit oranlar kanunu: 1 g H 8 g O ile birleşir; 4 g H için 32 g O gerekir.', 1);
km.q('kanunlar', 'NO ve NO₂ bileşikleri aşağıdaki kanunlardan hangisine örnektir?', ['Kütlenin korunumu', 'Sabit oranlar', 'Katlı oranlar', 'Birleşen hacimler', 'Avogadro yasası'], 'C', 'Aynı iki element (N ve O) farklı oranlarda iki bileşik oluşturmuştur: Dalton\'un katlı oranlar kanunu.', 1);
km.q('kanunlar', 'Kapalı bir kapta gerçekleşen kimyasal tepkime sonrasında toplam kütle için ne söylenebilir?', ['Artar.', 'Azalır.', 'Değişmez.', 'Önce artar, sonra azalır.', 'Gaz oluşursa azalır.'], 'C', 'Kütlenin korunumu kanununa göre kapalı sistemde toplam kütle sabit kalır.', 1);

km.lesson('tepkimeler', 10, 'Kimyasal tepkime türleri, denklem denkleştirme ve sınırlayıcı bileşen hesabı.', [
  TABLE(['Tür', 'Örnek'], ['Yanma', 'CH₄ + 2O₂ → CO₂ + 2H₂O'], ['Sentez (birleşme)', '2H₂ + O₂ → 2H₂O'], ['Analiz (ayrışma)', 'CaCO₃ → CaO + CO₂'], ['Asit-baz (nötralleşme)', 'HCl + NaOH → NaCl + H₂O'], ['Çözünme-çökelme', 'AgNO₃ + NaCl → AgCl(k) + NaNO₃']),
  FLOW('Denkleştirme sırası', 'Önce metal ve ametal atomlarını (C, N, S…) denkleştir', 'Sonra hidrojenleri', 'En son oksijenleri say ve O₂ katsayısını bul'),
  H('Sınırlayıcı bileşen'),
  P('Tepkimede önce tükenen madde ürün miktarını belirler. 2H₂ + O₂ → 2H₂O tepkimesinde 4 mol H₂ ve 1 mol O₂ varsa O₂ sınırlayıcıdır; yalnızca 2 mol H₂O oluşur, 2 mol H₂ artar.'),
], [card('C₃H₈ yanması', 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O'), card('Sınırlayıcı bileşen', 'Önce tükenen madde')]);
km.q('tepkimeler', 'C₃H₈ + a O₂ → 3CO₂ + 4H₂O tepkimesi denkleştirildiğinde a kaç olur?', ['3', '4', '5', '7', '10'], 'C', 'Sağda O atomu: 3 · 2 + 4 · 1 = 10 → a = 10/2 = 5.', 1);
km.q('tepkimeler', '2H₂ + O₂ → 2H₂O tepkimesinde 4 mol H₂ ile 1 mol O₂ tam verimle tepkimeye sokuluyor. En fazla kaç mol H₂O oluşur?', ['1', '2', '3', '4', '5'], 'B', '1 mol O₂ en fazla 2 mol H₂ ile tepkimeye girer ve 2 mol H₂O oluşur; O₂ sınırlayıcı bileşendir.', 2);
km.q('tepkimeler', 'CaCO₃ → CaO + CO₂ tepkimesi hangi tepkime türüne örnektir?', ['Yanma', 'Sentez', 'Analiz (ayrışma)', 'Nötralleşme', 'Çökelme'], 'C', 'Bir bileşik daha basit maddelere ayrışmıştır.', 1);

km.lesson('karisimlar', 10, 'Homojen ve heterojen karışımlar, derişim hesabı ve ayırma yöntemleri.', [
  TABLE(['Karışım', 'Örnek'], ['Çözelti (homojen)', 'Tuzlu su, hava, alaşımlar'], ['Süspansiyon', 'Çamurlu su, ayran'], ['Emülsiyon', 'Zeytinyağı-su, mayonez'], ['Aerosol', 'Sis, sprey, duman'], ['Kolloit', 'Jöle, kan, süt']),
  F('Derişim', 'Kütlece % = (çözünen kütlesi / çözelti kütlesi) · 100'),
  TABLE(['Ayırma yöntemi', 'Dayandığı özellik', 'Örnek'], ['Süzme', 'Tanecik boyutu', 'Kum-su'], ['Damıtma', 'Kaynama noktası farkı', 'Tuzlu sudan saf su'], ['Ayırma hunisi', 'Yoğunluk farkı (karışmayan sıvılar)', 'Zeytinyağı-su'], ['Mıknatısla ayırma', 'Manyetik özellik', 'Demir tozu-kükürt'], ['Ayrımsal kristallendirme', 'Çözünürlük farkı', 'Şeker-tuz']),
], [card('Kütlece %', 'çözünen / çözelti · 100'), card('Zeytinyağı-su', 'Ayırma hunisi')]);
km.q('karisimlar', 'Aşağıdakilerden hangisi homojen bir karışımdır?', ['Çamurlu su', 'Zeytinyağı-su', 'Tuzlu su', 'Kum-su', 'Sis'], 'C', 'Tuz suda iyonlarına ayrışarak her noktada aynı özelliği gösteren bir çözelti oluşturur.', 1);
km.q('karisimlar', 'Kütlece %20\'lik 50 g şekerli su çözeltisinde kaç g şeker vardır?', ['2,5', '5', '10', '20', '40'], 'C', '50 · 20/100 = 10 g.', 1);
km.q('karisimlar', 'Zeytinyağı ve su karışımı en uygun hangi yöntemle ayrılır?', ['Süzme', 'Damıtma', 'Ayırma hunisi', 'Mıknatısla ayırma', 'Kristallendirme'], 'C', 'Birbirine karışmayan ve yoğunlukları farklı sıvılar ayırma hunisiyle ayrılır.', 1);

km.lesson('asit-baz', 10, 'Asit ve bazların özellikleri, pH, nötralleşme ve metallerle tepkimeleri.', [
  TABLE(['', 'Asit', 'Baz'], ['Suda verdiği iyon', 'H⁺', 'OH⁻'], ['pH (25 °C)', '< 7', '> 7'], ['Turnusol', 'Maviyi kırmızıya çevirir', 'Kırmızıyı maviye çevirir'], ['Tat / dokunma', 'Ekşi', 'Acı, kayganlık hissi'], ['Örnek', 'HCl (mide), sirke, limon', 'NaOH, sabun, kireç suyu']),
  F('Nötralleşme', 'Asit + Baz → Tuz + Su', 'HCl + NaOH → NaCl + H₂O'),
  UL('Aktif metaller (Mg, Zn, Fe…) asitlerle H₂ gazı oluşturur.', 'Soy metaller (Cu, Ag, Au) HCl ile H₂ açığa çıkarmaz.', 'Amfoter metaller (Al, Zn) hem asitlerle hem kuvvetli bazlarla tepkimeye girer.'),
], [card('Nötralleşme', 'Asit + baz → tuz + su'), card('Amfoter', 'Al ve Zn')]);
km.q('asit-baz', 'Aşağıdakilerden hangisi mavi turnusol kâğıdını kırmızıya çevirir?', ['Sabunlu su', 'Limon suyu', 'Kireç suyu', 'Saf su', 'Çamaşır sodası çözeltisi'], 'B', 'Limon suyu asidiktir (sitrik asit); asitler mavi turnusolü kırmızıya çevirir.', 1);
km.q('asit-baz', 'HCl ile NaOH arasındaki tepkimenin ürünleri aşağıdakilerden hangisidir?', ['NaCl ve H₂O', 'Na ve HClO', 'NaH ve ClOH', 'Cl₂ ve NaOH', 'H₂ ve NaClO'], 'A', 'Asit ile baz nötralleşerek tuz (NaCl) ve su oluşturur.', 1);
km.q('asit-baz', 'Aşağıdaki metallerden hangisi hem asitlerle hem de kuvvetli bazlarla tepkime verir?', ['Bakır', 'Altın', 'Alüminyum', 'Gümüş', 'Platin'], 'C', 'Alüminyum amfoter bir metaldir.', 2);

km.lesson('her-yerde', 8, 'Günlük hayattaki kimyasallar: temizlik maddeleri, polimerler, gıda katkıları ve güvenli kullanım.', [
  UL('Sabun: Yağ asitlerinin sodyum ya da potasyum tuzudur. Molekülün bir ucu suyu (hidrofil), diğer ucu yağı (hidrofob) sever; kiri suya taşır.', 'Çamaşır suyu (NaOCl) ile tuz ruhu (HCl) karıştırılmamalıdır: zehirli klor (Cl₂) gazı açığa çıkar.', 'Polimerler: Polietilen (poşet), PVC (boru), PET (polietilen tereftalat; su şişesi), teflon.', 'Gıda katkı maddeleri "E" koduyla etikette belirtilir (koruyucu, renklendirici, tatlandırıcı).'),
  TIP('Temizlik maddelerini birbiriyle karıştırmayın ve kapalı alanda kullanmayın; etiketteki tehlike işaretlerini okuyun.', 'warn'),
], [card('Çamaşır suyu + tuz ruhu', 'Zehirli klor gazı'), card('PET', 'Polietilen tereftalat')]);
km.q('her-yerde', 'Çamaşır suyu ile tuz ruhu karıştırıldığında açığa çıkan zehirli gaz aşağıdakilerden hangisidir?', ['Oksijen', 'Klor', 'Hidrojen', 'Karbondioksit', 'Azot'], 'B', 'NaOCl ile HCl tepkimeye girerek zehirli Cl₂ gazı oluşturur.', 1);
km.q('her-yerde', 'Su şişelerinin yapımında yaygın olarak kullanılan polimer aşağıdakilerden hangisidir?', ['PVC', 'Teflon', 'PET', 'Naylon', 'Bakalit'], 'C', 'PET (polietilen tereftalat) hafif, şeffaf ve geri dönüştürülebilir olduğu için içecek şişelerinde kullanılır.', 1);
km.q('her-yerde', 'Sabunun yağlı kiri temizlemesi aşağıdakilerden hangisiyle açıklanır?', ['Kiri yakması', 'Molekülünün bir ucunun suyu, diğer ucunun yağı sevmesi', 'Kirin özkütlesini artırması', 'Asidik olması', 'Kiri buharlaştırması'], 'B', 'Hidrofob uç yağa tutunur, hidrofil uç suya yönelir; yağ damlacıkları suyla uzaklaştırılır.', 2);

// ═════════════════════════════ BİYOLOJİ ═════════════════════════════
const bi = builder('tyt-biyo', 'b');

bi.lesson('ortak-ozellikler', 7, 'Canlıları cansızlardan ayıran ortak özellikler ve virüslerin durumu.', [
  UL('Hücreden oluşma', 'Beslenme, solunum ve boşaltım', 'Uyarılara tepki', 'Büyüme, gelişme ve üreme', 'Metabolizma: Yapım (anabolizma) + yıkım (katabolizma) tepkimeleri', 'Homeostazi: İç dengenin korunması', 'Adaptasyon (uyum)'),
  TIP('Fotosentez, hareket etme ya da eşeyli üreme her canlıda görülmez; "tüm canlılarda ortak" sorularında bu çeldiricilere dikkat edin.', 'warn'),
  P('Virüsler hücre yapısına sahip değildir; kendi metabolizmaları yoktur ve yalnızca canlı bir konak hücrenin içinde çoğalabilir. Bu nedenle canlı ile cansız arasında kabul edilir.'),
], [card('Katabolizma', 'Yıkım tepkimeleri'), card('Virüs', 'Hücre yok; konak dışında çoğalamaz')]);
bi.q('ortak-ozellikler', 'Aşağıdakilerden hangisi tüm canlıların ortak özelliği değildir?', ['Hücreden oluşma', 'Solunum yapma', 'Fotosentez yapma', 'Uyarılara tepki gösterme', 'Metabolizma'], 'C', 'Fotosentezi yalnızca bitkiler, algler ve bazı bakteriler yapar.', 1);
bi.q('ortak-ozellikler', 'Büyük moleküllerin küçük moleküllere parçalandığı metabolik tepkimelere ne ad verilir?', ['Anabolizma', 'Katabolizma', 'Homeostazi', 'Adaptasyon', 'Fotosentez'], 'B', 'Yıkım tepkimelerine katabolizma denir; genellikle enerji açığa çıkar.', 1);
bi.q('ortak-ozellikler', 'Virüslerin canlı kabul edilmemesinin temel nedeni aşağıdakilerden hangisidir?', ['Kalıtım materyallerinin olması', 'Hücre yapısına sahip olmamaları ve konak hücre dışında çoğalamamaları', 'Çok küçük olmaları', 'Protein kılıflarının olması', 'Hastalık yapmaları'], 'B', 'Virüslerin hücresi ve kendi metabolizması yoktur; çoğalmak için canlı bir hücreye ihtiyaç duyarlar.', 2);

bi.lesson('temel-bilesenler', 11, 'İnorganik ve organik bileşikler: su, mineraller, karbonhidratlar, lipitler, proteinler, enzimler, vitaminler.', [
  TABLE(['Karbonhidrat', 'Örnek'], ['Monosakkarit', 'Glikoz, fruktoz, galaktoz, riboz, deoksiriboz'], ['Disakkarit', 'Maltoz (glikoz + glikoz), sakkaroz (glikoz + fruktoz), laktoz (glikoz + galaktoz)'], ['Polisakkarit', 'Nişasta (bitki), glikojen (hayvan), selüloz (bitki hücre duvarı), kitin']),
  UL('Proteinlerin yapı birimi aminoasittir; aminoasitler peptit bağıyla bağlanır (dehidrasyon ile su çıkar).', 'Lipitler en çok enerji veren besindir; hücre zarının yapısına katılır (fosfolipit).', 'Vitaminler: Yağda çözünenler A, D, E, K; suda çözünenler B grubu ve C.'),
  H('Enzimler'),
  UL('Çoğu proteindir; tepkimeleri hızlandırır (aktivasyon enerjisini düşürür).', 'Substrata özgüdür (anahtar-kilit); tepkimeden değişmeden çıkar ve tekrar kullanılabilir.', 'Sıcaklık, pH, substrat ve enzim derişimi etkinliği etkiler; yüksek sıcaklıkta yapısı bozulur.'),
], [card('Sakkaroz', 'Glikoz + fruktoz'), card('Yağda çözünen vitaminler', 'A, D, E, K')]);
bi.q('temel-bilesenler', 'Sakkaroz (çay şekeri) hangi monosakkaritlerin birleşmesiyle oluşur?', ['Glikoz + glikoz', 'Glikoz + fruktoz', 'Glikoz + galaktoz', 'Fruktoz + galaktoz', 'Riboz + deoksiriboz'], 'B', 'Sakkaroz bir glikoz ile bir fruktozun glikozit bağıyla birleşmesinden oluşur.', 1);
bi.q('temel-bilesenler', 'Aşağıdakilerden hangisi yağda çözünen vitaminleri doğru olarak verir?', ['B ve C', 'A, D, E, K', 'A ve C', 'B, D, K', 'C, D, E'], 'B', 'A, D, E ve K vitaminleri yağda çözünür; B grubu ve C suda çözünür.', 1);
bi.q('temel-bilesenler', 'Enzimlerle ilgili aşağıdaki ifadelerden hangisi yanlıştır?', ['Tepkimeleri hızlandırır.', 'Substrata özgüdür.', 'Tepkimeye girerek tükenir.', 'Yüksek sıcaklıkta yapısı bozulabilir.', 'Çoğunluğu protein yapılıdır.'], 'C', 'Enzimler tepkimeden değişmeden çıkar ve tekrar tekrar kullanılabilir.', 2);

bi.lesson('madde-gecisi', 10, 'Hücre zarından pasif ve aktif taşıma, osmoz ve hücrelerin farklı ortamlardaki davranışı.', [
  TABLE(['Taşıma', 'Yön', 'Enerji (ATP)'], ['Difüzyon', 'Çoktan aza', 'Harcanmaz'], ['Kolaylaştırılmış difüzyon', 'Çoktan aza, taşıyıcı proteinle', 'Harcanmaz'], ['Osmoz', 'Suyun, az yoğun çözeltiden çok yoğun çözeltiye geçişi', 'Harcanmaz'], ['Aktif taşıma', 'Azdan çoğa', 'Harcanır'], ['Endositoz / ekzositoz', 'Büyük moleküllerin zar kesecikleriyle alınması/verilmesi', 'Harcanır']),
  TABLE(['Ortam', 'Hayvan hücresi', 'Bitki hücresi'], ['Hipotonik (saf su)', 'Su alır, şişer, patlar (alyuvarda hemoliz)', 'Su alır, şişer ama hücre duvarı patlamayı önler (turgor)'], ['Hipertonik (tuzlu su)', 'Su kaybeder, büzülür', 'Su kaybeder; zar duvardan ayrılır (plazmoliz)']),
], [card('Aktif taşıma', 'Azdan çoğa, ATP harcanır'), card('Alyuvar + saf su', 'Hemoliz (patlama)')]);
bi.q('madde-gecisi', 'Maddelerin az yoğun ortamdan çok yoğun ortama ATP harcanarak taşınmasına ne ad verilir?', ['Difüzyon', 'Osmoz', 'Aktif taşıma', 'Kolaylaştırılmış difüzyon', 'Plazmoliz'], 'C', 'Derişim farkına karşı yapılan taşıma enerji gerektirir: aktif taşıma.', 1);
bi.q('madde-gecisi', 'Saf suya konulan alyuvar hücresinde aşağıdakilerden hangisi gözlenir?', ['Su kaybederek büzülür.', 'Su alarak şişer ve patlar.', 'Hiçbir değişiklik olmaz.', 'Plazmoliz gerçekleşir.', 'Turgor basıncıyla korunur.'], 'B', 'Saf su hipotonik ortamdır; hücre osmozla su alır. Hücre duvarı olmadığı için patlar (hemoliz).', 2);
bi.q('madde-gecisi', 'Aşağıdakilerden hangisi ATP harcanmadan gerçekleşir?', ['Aktif taşıma', 'Endositoz', 'Ekzositoz', 'Osmoz', 'Fagositoz'], 'D', 'Osmoz pasif taşımadır; su derişim farkıyla kendiliğinden hareket eder.', 1);

bi.lesson('siniflandirma', 9, 'Sınıflandırma basamakları, ikili adlandırma, tür kavramı ve canlı âlemleri.', [
  FLOW('Sınıflandırma basamakları (büyükten küçüğe)', 'Âlem', 'Şube', 'Sınıf', 'Takım', 'Aile (familya)', 'Cins', 'Tür'),
  UL('Tür en küçük birimdir. Aynı türün bireyleri çiftleşip verimli yavrular oluşturabilir.', 'Alt basamaklara inildikçe ortak özellik artar, birey sayısı ve çeşitlilik azalır.', 'İkili adlandırma (Linnaeus): İlk sözcük cins, ikinci sözcük tür adıdır. Canis lupus (kurt), Canis familiaris (köpek).'),
  TABLE(['Âlem', 'Örnek'], ['Bakteriler', 'E. coli'], ['Arkeler', 'Aşırı tuzlu ortam canlıları'], ['Protistler', 'Amip, öglena, algler'], ['Mantarlar', 'Maya, şapkalı mantar'], ['Bitkiler', 'Eğrelti, çam, buğday'], ['Hayvanlar', 'Omurgalı ve omurgasızlar']),
], [card('En küçük birim', 'Tür'), card('Canis lupus', 'Cins: Canis, tür: lupus')]);
bi.q('siniflandirma', 'Sınıflandırmanın en küçük birimi aşağıdakilerden hangisidir?', ['Cins', 'Aile', 'Tür', 'Takım', 'Âlem'], 'C', 'Tür, ortak atadan gelen ve çiftleşip verimli döl verebilen bireyler topluluğudur.', 1);
bi.q('siniflandirma', 'Kurdun bilimsel adı Canis lupus, köpeğin Canis familiaris\'tir. Bu iki canlı için aşağıdakilerden hangisi kesinlikle söylenebilir?', ['Aynı türdendirler.', 'Aynı cinstendirler.', 'Farklı ailelerdendirler.', 'Farklı âlemlerdendirler.', 'Çiftleşemezler.'], 'B', 'İkili adlandırmada ilk sözcük cins adıdır; ikisi de Canis cinsindendir. Aynı cinsteki canlılar aynı ailede de bulunur.', 2);
bi.q('siniflandirma', 'Aynı türe ait bireyler için aşağıdakilerden hangisi doğrudur?', ['Farklı cinslerde bulunurlar.', 'Çiftleştiklerinde verimli yavrular oluşturabilirler.', 'Kromozom sayıları farklıdır.', 'Farklı âlemlere aittir.', 'Hiçbir ortak özellikleri yoktur.'], 'B', 'Tür tanımının temel ölçütü, doğal koşullarda çiftleşip verimli döl verebilmektir.', 1);

bi.lesson('bolunmeler', 11, 'Mitoz ve mayoz bölünmenin evreleri, sonuçları ve karşılaştırması.', [
  TABLE(['', 'Mitoz', 'Mayoz'], ['Oluşan hücre sayısı', '2', '4'], ['Kromozom sayısı', 'Korunur (2n → 2n)', 'Yarıya iner (2n → n)'], ['Kalıtsal çeşitlilik', 'Yok (özdeş hücreler)', 'Var (krossing-over, bağımsız dağılım)'], ['Görev', 'Büyüme, onarım, eşeysiz üreme', 'Gamet (üreme hücresi) oluşumu'], ['Gerçekleştiği hücre', 'Vücut hücreleri', 'Üreme ana hücreleri']),
  FLOW('Mitoz evreleri', 'Profaz: Kromozomlar belirginleşir, iğ iplikleri oluşur', 'Metafaz: Kromozomlar hücrenin ortasında dizilir', 'Anafaz: Kardeş kromatitler zıt kutuplara çekilir', 'Telofaz ve sitokinez: İki yeni hücre oluşur'),
  UL('Krossing-over, mayoz I\'in profaz evresinde homolog kromozomlar arasında gerçekleşir.', 'Sitokinez hayvanlarda boğumlanmayla, bitkilerde ara lamel (hücre plağı) oluşumuyla olur.'),
], [card('Mitoz', '2n → 2n, iki özdeş hücre'), card('Krossing-over', 'Mayoz I, profaz')]);
bi.q('bolunmeler', 'Kromozom sayısı 2n = 46 olan bir hücre mitoz bölünme geçirirse oluşan hücrelerin her birinde kaç kromozom bulunur?', ['23', '46', '69', '92', '12'], 'B', 'Mitozda kromozom sayısı korunur: her yeni hücrede 46 kromozom bulunur.', 1);
bi.q('bolunmeler', 'Krossing-over olayı aşağıdaki evrelerden hangisinde gerçekleşir?', ['Mitoz profaz', 'Mitoz anafaz', 'Mayoz I profaz', 'Mayoz II metafaz', 'Mayoz II telofaz'], 'C', 'Homolog kromozomlar mayoz I profazında yan yana gelir (sinaps) ve parça değişimi yapar.', 1);
bi.q('bolunmeler', 'Aşağıdakilerden hangisi mayozu mitozdan ayıran bir özelliktir?', ['DNA eşlenmesi olması', 'İğ ipliklerinin oluşması', 'Kromozom sayısının yarıya inmesi', 'Sitokinez görülmesi', 'Profaz evresinin bulunması'], 'C', 'Mayoz sonunda kromozom sayısı yarıya iner; diğer özellikler her iki bölünmede de görülür.', 2);

bi.lesson('ureme', 9, 'Eşeysiz üreme çeşitleri, eşeyli üreme ve partenogenez.', [
  TABLE(['Eşeysiz üreme', 'Örnek'], ['İkiye bölünme', 'Bakteri, amip, öglena'], ['Tomurcuklanma', 'Bira mayası, hidra'], ['Rejenerasyon (yenilenme)', 'Planarya, deniz yıldızı'], ['Sporla üreme', 'Mantarlar, eğrelti'], ['Vejetatif üreme', 'Patates yumrusu, çilek stolonu, çelikle üretme']),
  UL('Eşeysiz üremede oluşan bireyler (mutasyon olmadıkça) ataya genetik olarak özdeştir; mitoza dayanır.', 'Eşeyli üremede iki gametin döllenmesiyle oluşan bireyler kalıtsal çeşitlilik gösterir; değişen ortamlara uyum şansı yüksektir.', 'Partenogenez: Döllenmemiş yumurtadan yeni birey gelişmesi. Bal arısında erkek arılar (n) böyle oluşur.'),
], [card('Bira mayası', 'Tomurcuklanma'), card('Partenogenez', 'Döllenmemiş yumurtadan gelişme')]);
bi.q('ureme', 'Bira mayasında görülen eşeysiz üreme çeşidi aşağıdakilerden hangisidir?', ['İkiye bölünme', 'Tomurcuklanma', 'Rejenerasyon', 'Sporla üreme', 'Vejetatif üreme'], 'B', 'Maya hücresinde oluşan çıkıntı (tomurcuk) gelişip ayrılarak yeni bir birey oluşturur.', 1);
bi.q('ureme', 'Eşeysiz üremeyle oluşan bireyler için aşağıdakilerden hangisi doğrudur?', ['Kalıtsal çeşitlilik çok fazladır.', 'Mutasyon olmadıkça ataya genetik olarak özdeştir.', 'Mayoz bölünmeyle oluşur.', 'Döllenme gerçekleşir.', 'Her zaman iki ata gerekir.'], 'B', 'Eşeysiz üreme mitoza dayanır; yeni bireyler ata bireyin genetik kopyasıdır.', 1);
bi.q('ureme', 'Bal arılarında erkek arıların döllenmemiş yumurtadan gelişmesi hangi olaya örnektir?', ['Tomurcuklanma', 'Rejenerasyon', 'Partenogenez', 'Sporla üreme', 'Vejetatif üreme'], 'C', 'Döllenme olmadan yumurtadan yeni birey gelişmesine partenogenez denir.', 1);

bi.lesson('ekosistem', 11, 'Ekosistemin bileşenleri, besin zinciri, enerji akışı, madde döngüleri ve biyolojik birikim.', [
  UL('Abiyotik faktörler: Sıcaklık, ışık, su, toprak, mineraller.', 'Biyotik faktörler: Üreticiler (ototroflar), tüketiciler (heterotroflar), ayrıştırıcılar (bakteri ve mantarlar).'),
  FLOW('Besin zinciri ve enerji (yaklaşık %10 kuralı)', 'Üretici: 10 000 kJ', '1. tüketici: 1000 kJ', '2. tüketici: 100 kJ', '3. tüketici: 10 kJ'),
  UL('Enerji akışı tek yönlüdür ve her basamakta azalır; madde ise döngüler hâlinde tekrar kullanılır.', 'Azot döngüsü: Azot bağlayıcı bakteriler atmosferdeki N₂\'yi bitkilerin kullanabileceği bileşiklere çevirir; denitrifikasyon bakterileri azotu atmosfere geri verir.', 'Biyolojik birikim: DDT ve cıva gibi parçalanmayan maddeler besin zincirinin üst basamaklarında en yüksek derişime ulaşır.'),
], [card('%10 kuralı', 'Her basamağa enerjinin yaklaşık onda biri geçer'), card('Biyolojik birikim', 'En çok son tüketicide')]);
bi.q('ekosistem', 'Bir besin zincirinde üreticilerde depolanan enerji 10 000 kJ ise ikincil (2.) tüketicilere yaklaşık kaç kJ enerji aktarılır? (%10 kuralı)', ['10', '100', '1000', '5000', '10000'], 'B', 'Üretici 10 000 → 1. tüketici 1000 → 2. tüketici 100 kJ.', 2);
bi.q('ekosistem', 'Aşağıdakilerden hangisi abiyotik bir faktördür?', ['Bakteri', 'Mantar', 'Sıcaklık', 'Ot', 'Böcek'], 'C', 'Sıcaklık cansız bir çevre faktörüdür; diğerleri canlıdır.', 1);
bi.q('ekosistem', 'DDT gibi parçalanmayan zehirli maddeler bir besin zincirinde en yüksek derişime nerede ulaşır?', ['Üreticilerde', 'Birincil tüketicilerde', 'Zincirin son halkasındaki tüketicilerde', 'Ayrıştırıcılarda', 'Toprakta'], 'C', 'Her basamakta çok sayıda besin tüketildiği için madde birikerek son tüketicide en yüksek düzeye çıkar (biyolojik birikim).', 2);

bi.lesson('cevre-sorunlari', 8, 'Küresel ısınma, iklim değişikliği, kirlilik, erozyon ve Türkiye\'nin çevre politikaları.', [
  TABLE(['Sorun', 'Nedeni', 'Önlem'], ['Küresel ısınma', 'Fosil yakıt kaynaklı CO₂, metan', 'Yenilenebilir enerji, enerji verimliliği'], ['Ozon incelmesi', 'CFC gazları', 'Montreal Protokolü ile CFC yasağı'], ['Erozyon', 'Bitki örtüsünün yok edilmesi, yanlış tarım', 'Ağaçlandırma, taraçalama'], ['Su kirliliği', 'Arıtılmayan atık sular, tarım ilaçları', 'Arıtma tesisleri'], ['Biyoçeşitlilik kaybı', 'Habitat tahribi, aşırı avlanma', 'Koruma alanları']),
  UL('Türkiye 2017\'de Sıfır Atık Projesi\'ni başlattı.', 'Türkiye Paris İklim Anlaşması\'nı 2021\'de onayladı ve 2053 net sıfır emisyon hedefini açıkladı.'),
], [card('Türkiye net sıfır hedefi', '2053'), card('Sıfır Atık', '2017')]);
bi.q('cevre-sorunlari', 'Sera etkisinin artmasında en büyük paya sahip olan gaz aşağıdakilerden hangisidir?', ['Oksijen', 'Azot', 'Karbondioksit', 'Argon', 'Helyum'], 'C', 'Fosil yakıtların yanmasıyla atmosfere en çok salınan sera gazı karbondioksittir.', 1);
bi.q('cevre-sorunlari', 'Türkiye\'nin iklim değişikliğiyle mücadelede açıkladığı net sıfır emisyon hedef yılı aşağıdakilerden hangisidir?', ['2030', '2035', '2040', '2053', '2071'], 'D', 'Türkiye 2021\'de Paris Anlaşması\'nı onaylarken 2053 net sıfır emisyon hedefini açıkladı.', 1);
bi.q('cevre-sorunlari', 'Erozyonu önlemede en etkili yöntem aşağıdakilerden hangisidir?', ['Anızları yakmak', 'Ağaçlandırma yapmak ve bitki örtüsünü korumak', 'Eğim yönünde sürüm yapmak', 'Meraları aşırı otlatmak', 'Toprağı nadasa bırakmamak'], 'B', 'Bitki kökleri toprağı tutar; ağaçlandırma erozyonla mücadelenin temel yöntemidir.', 1);

export default [fz.done(), km.done(), bi.done()];
