/** TYT Matematik: sayılar, cebir, problemler, kümeler-mantık, fonksiyon, sayma ve veri. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../../build.ts';

const b = builder('tyt-mat', 'b');

b.lesson('basamak', 7, 'Rakam, sayı, basamak değeri ve basamak çözümlemesiyle sayı soruları.', [
  UL('Rakamlar: 0, 1, 2, …, 9. İki basamaklı en küçük sayı 10, en büyük 99.', 'Sayı değeri rakamın kendisi; basamak değeri rakam × bulunduğu basamağın değeridir. 4725\'te 7\'nin basamak değeri 700.'),
  F('Çözümleme', 'AB = 10A + B', 'ABC = 100A + 10B + C', 'AB + BA = 11(A + B)', 'AB − BA = 9(A − B)'),
  EX('AB ve BA iki basamaklı sayılar, AB + BA = 132 ise A + B kaçtır?', ['11(A + B) = 132', 'A + B = 12'], '12'),
  TIP('"Farklı rakamlar" ifadesi varsa aynı rakamı iki kez kullanamazsınız; en büyük/en küçük değer sorularında bunu unutmayın.', 'warn'),
], [card('AB + BA', '11(A + B)'), card('AB − BA', '9(A − B)')]);
b.q('basamak', 'Üç basamaklı en büyük çift sayı ile iki basamaklı en küçük tek sayının toplamı kaçtır?', ['1008', '1009', '1010', '1011', '1012'], 'B', 'Üç basamaklı en büyük çift sayı 998, iki basamaklı en küçük tek sayı 11: 998 + 11 = 1009.', 1);
b.q('basamak', 'AB ve BA iki basamaklı doğal sayılardır. AB + BA = 132 olduğuna göre A + B kaçtır?', ['10', '11', '12', '13', '14'], 'C', 'AB + BA = 11(A + B) = 132 → A + B = 12.', 1);
b.q('basamak', '4725 sayısındaki 7 rakamının basamak değeri kaçtır?', ['7', '70', '700', '725', '7000'], 'C', '7 yüzler basamağındadır: 7 · 100 = 700.', 1);

b.lesson('bolunebilme', 9, 'Bölme algoritması ve 2, 3, 4, 5, 8, 9, 10, 11 ile bölünebilme kuralları.', [
  F('Bölme', 'Bölünen = Bölen · Bölüm + Kalan', '0 ≤ Kalan < Bölen'),
  TABLE(['Bölen', 'Kural'], ['2', 'Son rakam çift'], ['3', 'Rakamlar toplamı 3\'ün katı'], ['4', 'Son iki basamak 4\'ün katı'], ['5', 'Son rakam 0 veya 5'], ['8', 'Son üç basamak 8\'in katı'], ['9', 'Rakamlar toplamı 9\'un katı'], ['10', 'Son rakam 0'], ['11', 'Sağdan sola +, −, +, − ile toplam 11\'in katı']),
  EX('36a5 sayısı 11 ile tam bölünüyorsa a kaçtır?', ['Sağdan: +5 − a + 6 − 3 = 8 − a', '8 − a, 11\'in katı olmalı → a = 8', 'Kontrol: 3685 = 11 · 335'], 'a = 8'),
  TIP('Bir sayı hem 3 hem 4 ile bölünüyorsa 12 ile bölünür; aralarında asal bölenler birleştirilebilir (3 ve 4 asal değil ama aralarında asal).'),
], [card('9 ile bölünme', 'Rakamlar toplamı 9\'un katı'), card('11 ile bölünme', 'Sağdan + − + − toplamı 11\'in katı')]);
b.q('bolunebilme', 'Üç basamaklı 4a7 sayısı 9 ile tam bölünebildiğine göre a kaçtır?', ['1', '4', '5', '7', '8'], 'D', '4 + a + 7 = 11 + a, 9\'un katı olmalı → a = 7 (toplam 18).', 1);
b.q('bolunebilme', 'Bir doğal sayı 7 ile bölündüğünde bölüm 12, kalan 5 oluyor. Bu sayı kaçtır?', ['84', '87', '89', '91', '96'], 'C', 'Bölünen = 7 · 12 + 5 = 89.', 1);
b.q('bolunebilme', 'Dört basamaklı 36a5 sayısı 11 ile tam bölünebildiğine göre a kaçtır?', ['2', '4', '6', '8', '9'], 'D', 'Sağdan +5 − a + 6 − 3 = 8 − a; 11\'in katı olması için a = 8. Gerçekten 3685 = 11 · 335.', 2);

b.lesson('ebob-ekok', 9, 'En büyük ortak bölen ve en küçük ortak kat; problemlerde hangisinin kullanılacağı.', [
  UL('EBOB: Sayıların hepsini bölen en büyük sayı. Ortak asal çarpanların EN KÜÇÜK üslüleri çarpılır.', 'EKOK: Sayıların hepsinin katı olan en küçük sayı. Tüm asal çarpanların EN BÜYÜK üslüleri çarpılır.'),
  F('Bağıntı', 'EBOB(a, b) · EKOK(a, b) = a · b'),
  TABLE(['Problem ipucu', 'Kullan'], ['Parçalara bölmek, en büyük kare, en az ağaç', 'EBOB'], ['Birlikte tekrar, en kısa sürede buluşma, en küçük küp', 'EKOK']),
  EX('24 m ve 36 m kenarlı bahçenin çevresine eşit aralıkla, köşelere de gelecek biçimde en az kaç ağaç dikilir?', ['Aralık en büyük olmalı: EBOB(24, 36) = 12 m', 'Çevre = 2(24 + 36) = 120 m', 'Kapalı şekilde ağaç sayısı = 120 / 12'], '10 ağaç'),
], [card('EBOB · EKOK', 'a · b'), card('"En az ağaç"', 'EBOB ile aralık bulunur')]);
b.q('ebob-ekok', '12 ile 18 sayılarının EKOK\'u kaçtır?', ['6', '36', '72', '108', '216'], 'B', '12 = 2² · 3, 18 = 2 · 3². EKOK = 2² · 3² = 36.', 1);
b.q('ebob-ekok', 'Kenar uzunlukları 24 m ve 36 m olan dikdörtgen biçimli bir bahçenin çevresine, köşelere de birer tane gelmek koşuluyla eşit aralıklarla ağaç dikilecektir. En az kaç ağaç gerekir?', ['8', '10', '12', '14', '20'], 'B', 'Aralık EBOB(24, 36) = 12 m olmalı. Çevre 120 m; kapalı çizgide ağaç sayısı 120 / 12 = 10.', 2);
b.q('ebob-ekok', 'İki doğal sayının EBOB\'u 6, EKOK\'u 72\'dir. Sayılardan biri 18 olduğuna göre diğeri kaçtır?', ['12', '18', '24', '36', '48'], 'C', 'EBOB · EKOK = a · b → 6 · 72 = 18 · b → b = 24.', 2);

b.lesson('rasyonel', 8, 'Kesirlerle dört işlem, ondalık sayılar ve devirli ondalıkların kesre çevrilmesi.', [
  F('Kesirler', 'a/b + c/d = (ad + bc) / bd', 'a/b · c/d = ac / bd', 'a/b ÷ c/d = a/b · d/c'),
  UL('Toplama-çıkarmada paydalar eşitlenir (EKOK).', 'Ondalık çarpımda virgülden sonraki basamak sayıları toplanır: 0,25 · 0,4 = 0,100 = 0,1.'),
  F('Devirli ondalık', '0,aaa… = a/9', '0,ab̄ = ab/99', '0,3̄ = 3/9 = 1/3'),
  TIP('Sıralama sorularında payları ya da paydaları eşitlemek, ondalığa çevirmekten genellikle daha hızlıdır.'),
], [card('0,3̄', '1/3'), card('Kesir bölmesi', 'İkinciyi ters çevir, çarp')]);
b.q('rasyonel', '1/2 + 2/3 − 1/6 işleminin sonucu kaçtır?', ['1/2', '2/3', '5/6', '1', '7/6'], 'D', 'Payda 6: 3/6 + 4/6 − 1/6 = 6/6 = 1.', 1);
b.q('rasyonel', '0,25 · 0,4 işleminin sonucu kaçtır?', ['0,01', '0,1', '1', '0,65', '0,025'], 'B', '25 · 4 = 100; virgülden sonra 2 + 1 = 3 basamak: 0,100 = 0,1.', 1);
b.q('rasyonel', '0,333… devirli ondalık sayısının kesir olarak eşiti aşağıdakilerden hangisidir?', ['3/100', '3/10', '1/3', '33/100', '3/11'], 'C', '0,3̄ = 3/9 = 1/3.', 1);

b.lesson('esitsizlik', 8, 'Eşitsizlik çözme kuralları, aralıklar ve iki değişkenli sınır değer soruları.', [
  UL('Her iki tarafa aynı sayı eklenip çıkarılabilir.', 'Pozitif sayıyla çarpma/bölmede yön korunur; NEGATİF sayıyla çarpma/bölmede yön DEĞİŞİR.'),
  F('Aralık işlemleri', 'a < x < b ve c < y < d ise', 'a + c < x + y < b + d', 'a − d < x − y < b − c'),
  EX('−2x + 5 > 11 eşitsizliğinin çözümü nedir?', ['−2x > 6', 'Negatife bölünce yön döner: x < −3'], 'x < −3'),
  TIP('Çıkarmada sınırları çapraz alın: x − y\'nin en küçüğü (x\'in en küçüğü − y\'nin en büyüğü).', 'warn'),
], [card('Negatifle çarpma', 'Eşitsizlik yön değiştirir'), card('x − y aralığı', '(a − d, b − c)')]);
b.q('esitsizlik', '−2x + 5 > 11 eşitsizliğinin çözüm kümesi aşağıdakilerden hangisidir?', ['x > −3', 'x < −3', 'x > 3', 'x < 3', 'x < −8'], 'B', '−2x > 6; iki taraf −2\'ye bölünürken yön değişir: x < −3.', 1);
b.q('esitsizlik', '−3 < x ≤ 4 koşulunu sağlayan kaç tane x tam sayısı vardır?', ['5', '6', '7', '8', '9'], 'C', '−2, −1, 0, 1, 2, 3, 4 → 7 tam sayı (−3 dahil değil, 4 dahil).', 1);
b.q('esitsizlik', '2 < x < 5 ve 1 < y < 3 olduğuna göre x − y ifadesi kaç farklı tam sayı değeri alabilir?', ['3', '4', '5', '6', '7'], 'B', 'x − y aralığı: 2 − 3 < x − y < 5 − 1 → −1 < x − y < 4. Tam sayılar 0, 1, 2, 3 → 4 değer.', 3);

b.lesson('mutlak-deger', 8, 'Mutlak değerin tanımı, mutlak değerli denklem ve eşitsizlikler.', [
  F('Tanım', '|x| = x (x ≥ 0),  |x| = −x (x < 0)', '|x| ≥ 0,  |a · b| = |a| · |b|'),
  F('Denklem ve eşitsizlik', '|x − a| = b (b ≥ 0) → x = a + b veya x = a − b', '|x| < a → −a < x < a', '|x| > a → x > a veya x < −a'),
  P('|x − a|, sayı doğrusunda x ile a arasındaki uzaklıktır. Bu yorum birçok soruyu tek adımda çözdürür.'),
  PLOT('y = |x − 1| grafiği x = 1 noktasında kırılan bir V biçimindedir.', [-3, 5], [0, 5], { label: 'y = |x − 1|', f: (x) => Math.abs(x - 1) }),
], [card('|x − a| = b', 'x = a ± b'), card('|x| < a', '−a < x < a')]);
b.q('mutlak-deger', '|x − 3| = 5 denkleminin köklerinin toplamı kaçtır?', ['−2', '2', '6', '8', '10'], 'C', 'x − 3 = 5 → x = 8; x − 3 = −5 → x = −2. Toplam 6.', 1);
b.q('mutlak-deger', '|2x − 1| < 5 eşitsizliğini sağlayan kaç tane x tam sayısı vardır?', ['3', '4', '5', '6', '7'], 'B', '−5 < 2x − 1 < 5 → −4 < 2x < 6 → −2 < x < 3. Tam sayılar: −1, 0, 1, 2 → 4.', 2);
b.q('mutlak-deger', '|−7| − |3 − 8| işleminin sonucu kaçtır?', ['−12', '−2', '2', '4', '12'], 'C', '|−7| = 7, |3 − 8| = |−5| = 5. 7 − 5 = 2.', 1);

b.lesson('koklu', 9, 'Köklü sayılarda sadeleştirme, dört işlem ve paydayı kökten kurtarma (eşlenik).', [
  F('Kurallar', '√(a²) = |a|', '√a · √b = √(ab)   (a, b ≥ 0)', '√a / √b = √(a/b)', 'a√x ± b√x = (a ± b)√x', 'ⁿ√(aᵐ) = a^(m/n)'),
  UL('Kök dışına çıkarma: √12 = √(4 · 3) = 2√3', 'Toplama-çıkarma yalnızca kök içleri aynıysa yapılır.'),
  F('Eşlenik', '(√a − √b)(√a + √b) = a − b', '1 / (√3 − √2) = (√3 + √2) / (3 − 2) = √3 + √2'),
  TIP('√(0,09) gibi ondalıklarda kesre çevirin: √(9/100) = 3/10 = 0,3.'),
], [card('√12 + √27', '2√3 + 3√3 = 5√3'), card('Eşlenik', '(√a − √b)(√a + √b) = a − b')]);
b.q('koklu', '√12 + √27 işleminin sonucu kaçtır?', ['√39', '5√3', '6√3', '13√3', '3√5'], 'B', '√12 = 2√3, √27 = 3√3 → toplam 5√3.', 1);
b.q('koklu', '1 / (√3 − √2) ifadesinin eşiti aşağıdakilerden hangisidir?', ['√6', '√3 − √2', '√3 + √2', '1', '√5'], 'C', 'Pay ve payda (√3 + √2) ile çarpılır: (√3 + √2) / (3 − 2) = √3 + √2.', 2);
b.q('koklu', '√0,09 + √0,16 işleminin sonucu kaçtır?', ['0,05', '0,25', '0,5', '0,7', '0,07'], 'D', '√0,09 = 0,3 ve √0,16 = 0,4; toplam 0,7.', 1);

b.lesson('carpanlara-ayirma', 10, 'Ortak çarpan parantezi, özdeşlikler ve üç terimli ifadelerin çarpanlara ayrılması.', [
  F('Özdeşlikler', 'a² − b² = (a − b)(a + b)', '(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', 'a² + b² = (a + b)² − 2ab', 'a³ − b³ = (a − b)(a² + ab + b²)'),
  H('x² + bx + c'),
  P('Çarpımı c, toplamı b olan iki sayı bulunur: x² − 5x + 6 = (x − 2)(x − 3), çünkü (−2)(−3) = 6 ve (−2) + (−3) = −5.'),
  EX('98² − 2² işlemini hızlıca hesaplayın.', ['İki kare farkı: (98 − 2)(98 + 2)', '= 96 · 100'], '9600'),
], [card('İki kare farkı', 'a² − b² = (a − b)(a + b)'), card('a² + b²', '(a + b)² − 2ab')]);
b.q('carpanlara-ayirma', 'x² − 9 ifadesinin çarpanlarına ayrılmış biçimi aşağıdakilerden hangisidir?', ['(x − 9)(x + 1)', '(x − 3)²', '(x − 3)(x + 3)', '(x + 3)²', 'x(x − 9)'], 'C', 'İki kare farkı: x² − 3² = (x − 3)(x + 3).', 1);
b.q('carpanlara-ayirma', 'x² − 5x + 6 ifadesinin çarpanlarından biri aşağıdakilerden hangisidir?', ['x + 2', 'x − 2', 'x + 3', 'x − 6', 'x + 1'], 'B', 'x² − 5x + 6 = (x − 2)(x − 3).', 1);
b.q('carpanlara-ayirma', 'a + b = 7 ve a · b = 10 olduğuna göre a² + b² kaçtır?', ['19', '27', '29', '39', '49'], 'C', 'a² + b² = (a + b)² − 2ab = 49 − 20 = 29.', 2);
b.q('carpanlara-ayirma', '98² − 2² işleminin sonucu kaçtır?', ['9204', '9600', '9604', '9800', '9996'], 'B', '(98 − 2)(98 + 2) = 96 · 100 = 9600.', 1);

b.lesson('oran-oranti', 8, 'Oran, orantı sabiti, doğru ve ters orantı; ölçek hesabı.', [
  F('Orantı', 'a/b = c/d ⇔ a · d = b · c', 'a/x = b/y = c/z = k → a = xk, b = yk, c = zk'),
  TABLE(['Orantı', 'Anlamı', 'Örnek'], ['Doğru', 'Biri artarken diğeri aynı oranda artar (x/y sabit)', 'Ürün sayısı – toplam fiyat'], ['Ters', 'Biri artarken diğeri azalır (x · y sabit)', 'İşçi sayısı – iş süresi']),
  EX('Ölçeği 1/200 000 olan haritada 3 cm olan uzaklık gerçekte kaç km\'dir?', ['3 · 200 000 = 600 000 cm', '600 000 cm = 6 km'], '6 km'),
], [card('Ters orantı', 'x · y = sabit'), card('1 km', '100 000 cm')]);
b.q('oran-oranti', 'a/3 = b/5 ve a + b = 32 olduğuna göre b kaçtır?', ['12', '15', '18', '20', '24'], 'D', 'a = 3k, b = 5k → 8k = 32 → k = 4 → b = 20.', 1);
b.q('oran-oranti', '6 işçi bir işi 10 günde bitiriyor. Aynı hızda çalışan 15 işçi bu işi kaç günde bitirir?', ['2', '3', '4', '5', '25'], 'C', 'İşçi sayısı ile süre ters orantılıdır: 6 · 10 = 15 · t → t = 4.', 1);
b.q('oran-oranti', 'Ölçeği 1/200 000 olan bir haritada 3 cm olarak gösterilen uzaklık gerçekte kaç km\'dir?', ['0,6', '6', '60', '600', '6000'], 'B', '3 · 200 000 = 600 000 cm = 6 km.', 2);

b.lesson('denklem', 8, 'Birinci dereceden bir ve iki bilinmeyenli denklemler.', [
  FLOW('Bir bilinmeyenli denklem', 'Parantezleri aç, paydaları eşitle', 'Bilinmeyenleri bir tarafa, sayıları diğer tarafa topla', 'Katsayıya böl'),
  H('İki bilinmeyenli denklem sistemi'),
  UL('Yok etme: Denklemleri taraf tarafa toplayıp/çıkarıp bir bilinmeyeni yok et.', 'Yerine koyma: Birinden bir bilinmeyeni çekip diğerinde yerine yaz.'),
  EX('x + y = 10 ve x − y = 4 ise x · y kaçtır?', ['Taraf tarafa toplama: 2x = 14 → x = 7', 'y = 3'], '21'),
], [card('x/2 + x/3', '5x/6'), card('Yok etme yöntemi', 'Taraf tarafa topla/çıkar')]);
b.q('denklem', '3(x − 2) = 2x + 5 denkleminin çözümü kaçtır?', ['1', '7', '9', '11', '13'], 'D', '3x − 6 = 2x + 5 → x = 11.', 1);
b.q('denklem', 'x + y = 10 ve x − y = 4 olduğuna göre x · y kaçtır?', ['16', '21', '24', '28', '40'], 'B', 'Toplayınca 2x = 14 → x = 7, y = 3 → x · y = 21.', 1);
b.q('denklem', 'x/2 + x/3 = 10 denkleminin çözümü kaçtır?', ['6', '10', '12', '15', '60'], 'C', '(3x + 2x)/6 = 10 → 5x = 60 → x = 12.', 1);

b.lesson('sayi-problemleri', 9, 'Sözel ifadeleri denkleme çevirme; kesir problemlerinde "kalanın" tuzağı.', [
  TABLE(['İfade', 'Denklem'], ['Bir sayının 3 katının 5 fazlası', '3x + 5'], ['Bir sayının 2 eksiğinin yarısı', '(x − 2)/2'], ['Ardışık iki sayının toplamı', 'x + (x + 1)'], ['Bir sayının 2/5\'i', '2x/5']),
  TIP('"Kalanın 1/4\'ü" ifadesi tümün değil, önceki işlemden geriye kalan miktarın 1/4\'üdür. Kesir problemlerinde bütünü 12, 60 gibi paydaların ortak katı almak işi kolaylaştırır.', 'warn'),
  EX('Bir kitabın önce 1/3\'ü, sonra kalanın 1/4\'ü okunuyor; 60 sayfa kalıyor. Kitap kaç sayfadır?', ['Kalan: x · 2/3 · 3/4 = x/2', 'x/2 = 60'], '120 sayfa'),
], [card('"Kalanın" kesri', 'Önceki işlemden geriye kalanla çarp'), card('Bütün seçimi', 'Paydaların EKOK\'unu al')]);
b.q('sayi-problemleri', 'Bir sayının 3 katının 5 fazlası 29 olduğuna göre bu sayı kaçtır?', ['6', '7', '8', '9', '10'], 'C', '3x + 5 = 29 → 3x = 24 → x = 8.', 1);
b.q('sayi-problemleri', 'Bir sınıftaki öğrencilerin 2/5\'i kızdır. Sınıfta 18 erkek öğrenci olduğuna göre sınıf mevcudu kaçtır?', ['25', '30', '36', '40', '45'], 'B', 'Erkekler 3/5: 3x/5 = 18 → x = 30.', 1);
b.q('sayi-problemleri', 'Bir kitabın önce 1/3\'ü, sonra kalan kısmın 1/4\'ü okunuyor. Geriye 60 sayfa kaldığına göre kitap kaç sayfadır?', ['90', '100', '120', '150', '180'], 'C', 'Kalan = x · (2/3) · (3/4) = x/2 = 60 → x = 120.', 2);

b.lesson('yas-problemleri', 8, 'Yaş farkının değişmezliği ve zaman geçtikçe yaşların değişimi.', [
  UL('İki kişinin yaş farkı her zaman sabittir.', 't yıl sonra her kişinin yaşı t artar; n kişinin yaşları toplamı n · t artar.', 't yıl önce her kişinin yaşı t azalır.'),
  TABLE(['', 'Şimdi', '6 yıl sonra'], ['Kız', 'x', 'x + 6'], ['Anne', '4x', '4x + 6']),
  EX('Annenin yaşı kızının 4 katıdır. 6 yıl sonra 2,5 katı olacaktır. Kızın yaşı kaçtır?', ['4x + 6 = 2,5(x + 6)', '4x + 6 = 2,5x + 15', '1,5x = 9'], 'x = 6'),
], [card('Yaş farkı', 'Hiç değişmez'), card('n kişi, t yıl', 'Toplam n · t artar')]);
b.q('yas-problemleri', 'Bir annenin yaşı kızının yaşının 4 katıdır. 6 yıl sonra annenin yaşı kızının yaşının 2,5 katı olacağına göre kızın bugünkü yaşı kaçtır?', ['4', '5', '6', '8', '9'], 'C', '4x + 6 = 2,5(x + 6) → 1,5x = 9 → x = 6.', 2);
b.q('yas-problemleri', 'Ali 12, babası 40 yaşındadır. Kaç yıl sonra babasının yaşı Ali\'nin yaşının 2 katı olur?', ['10', '14', '16', '18', '28'], 'C', '40 + t = 2(12 + t) → 40 + t = 24 + 2t → t = 16. (28 ve 56 yaş)', 2);
b.q('yas-problemleri', 'Üç kardeşin bugünkü yaşları toplamı 36\'dır. 4 yıl sonra yaşları toplamı kaç olur?', ['36', '40', '44', '48', '52'], 'D', 'Her kardeş 4 yaş büyür: 36 + 3 · 4 = 48.', 1);

b.lesson('karisim', 8, 'Tuz-su, şeker-su karışımlarında oran hesabı; su ya da madde ekleme-çıkarma.', [
  F('Karışım', 'Oran = Madde miktarı / Karışım miktarı', 'Madde = Karışım · Oran'),
  FLOW('Çözüm yolu', 'Her karışımdaki saf madde miktarını hesapla', 'Eklenen/çıkarılan madde ve suyu yaz', 'Yeni madde / yeni toplam = yeni oran'),
  TIP('Su eklemek madde miktarını değiştirmez, yalnızca toplamı artırır; buharlaştırma ise yalnızca suyu azaltır.'),
  EX('%10 tuzlu 30 L su ile %40 tuzlu 20 L su karıştırılıyor. Yeni tuz oranı nedir?', ['Tuz: 3 + 8 = 11 L', 'Toplam: 50 L', 'Oran: 11/50'], '%22'),
], [card('Su eklemek', 'Madde sabit, toplam artar'), card('Madde', 'Karışım × oran')]);
b.q('karisim', '%25\'i tuz olan 40 gram tuzlu suya 10 gram tuz ekleniyor. Yeni karışımın tuz oranı yüzde kaçtır?', ['30', '35', '40', '45', '50'], 'C', 'Tuz 10 + 10 = 20 g, karışım 50 g → 20/50 = %40.', 1);
b.q('karisim', '%30\'u şeker olan 60 gram şerbete kaç gram su eklenirse şerbet %20 şekerli olur?', ['15', '20', '25', '30', '45'], 'D', 'Şeker 18 g sabit: 18 / (60 + x) = 0,2 → 60 + x = 90 → x = 30.', 2);
b.q('karisim', '%10 tuzlu 30 litre su ile %40 tuzlu 20 litre su karıştırılıyor. Karışımın tuz oranı yüzde kaçtır?', ['20', '22', '25', '28', '30'], 'B', 'Tuz 3 + 8 = 11 L, toplam 50 L → 11/50 = %22.', 2);

b.lesson('hareket', 10, 'Yol-hız-zaman bağıntısı, karşılaşma ve yetişme; havuz ve işçi problemleri.', [
  F('Hareket', 'Yol = Hız · Zaman', 'Karşılaşma süresi = Aradaki yol / (v₁ + v₂)', 'Yetişme süresi = Aradaki yol / (v₁ − v₂)', 'Ortalama hız = Toplam yol / Toplam zaman'),
  TIP('Ortalama hız, hızların aritmetik ortalaması DEĞİLDİR. Önce toplam süreyi bulun.', 'warn'),
  F('İşçi-havuz', 'Bir işi a günde bitiren kişi 1 günde işin 1/a\'sını yapar', 'Birlikte: 1/a + 1/b = 1/t'),
  EX('240 km\'lik yolun ilk yarısı 60 km/sa, kalanı 40 km/sa hızla gidiliyor. Ortalama hız nedir?', ['Süreler: 120/60 = 2 sa, 120/40 = 3 sa', 'Ortalama: 240 / 5'], '48 km/sa'),
], [card('Karşılaşma', 'x / (v₁ + v₂)'), card('Birlikte çalışma', '1/a + 1/b = 1/t')]);
b.q('hareket', 'Aralarında 360 km olan iki araç 50 km/sa ve 70 km/sa sabit hızlarla birbirlerine doğru aynı anda yola çıkıyor. Kaç saat sonra karşılaşırlar?', ['2', '2,5', '3', '4', '6'], 'C', 'Hızlar toplamı 120 km/sa: 360 / 120 = 3 saat.', 1);
b.q('hareket', 'Ali bir işi tek başına 6 günde, Veli 12 günde bitiriyor. İkisi birlikte bu işi kaç günde bitirir?', ['3', '4', '6', '8', '9'], 'B', '1/6 + 1/12 = 3/12 = 1/4 → 4 gün.', 1);
b.q('hareket', 'Bir araç 240 km\'lik yolun ilk yarısını 60 km/sa, kalan yarısını 40 km/sa hızla gidiyor. Aracın bu yoldaki ortalama hızı kaç km/sa\'tir?', ['44', '48', '50', '52', '55'], 'B', 'Süreler 2 + 3 = 5 saat; ortalama hız 240 / 5 = 48 km/sa. (Hızların ortalaması olan 50 tuzaktır.)', 2);

b.lesson('kumeler', 9, 'Küme gösterimleri, alt küme sayısı, birleşim-kesişim-fark ve küme problemleri.', [
  F('Alt kümeler', 'n elemanlı kümenin alt küme sayısı: 2ⁿ', 'Öz alt küme sayısı: 2ⁿ − 1'),
  TABLE(['İşlem', 'Anlamı'], ['A ∪ B', 'A\'da veya B\'de olanlar'], ['A ∩ B', 'Hem A\'da hem B\'de olanlar'], ['A \\ B', 'A\'da olup B\'de olmayanlar'], ['A′', 'Evrensel kümede A\'da olmayanlar']),
  F('Eleman sayısı', 's(A ∪ B) = s(A) + s(B) − s(A ∩ B)'),
  EX('30 öğrenciden 18\'i İngilizce, 15\'i Almanca biliyor; herkes en az birini biliyor. İkisini bilen kaç kişi?', ['30 = 18 + 15 − x', 'x = 3'], '3 öğrenci'),
], [card('Alt küme sayısı', '2ⁿ'), card('s(A ∪ B)', 's(A) + s(B) − s(A ∩ B)')]);
b.q('kumeler', 'A = {a, b, c, d} kümesinin kaç tane alt kümesi vardır?', ['4', '8', '15', '16', '32'], 'D', '4 elemanlı kümenin alt küme sayısı 2⁴ = 16.', 1);
b.q('kumeler', '30 kişilik bir sınıfta 18 öğrenci İngilizce, 15 öğrenci Almanca bilmektedir. Her öğrenci bu dillerden en az birini bildiğine göre iki dili de bilen kaç öğrenci vardır?', ['2', '3', '4', '5', '6'], 'B', 's(A ∪ B) = s(A) + s(B) − s(A ∩ B) → 30 = 33 − x → x = 3.', 1);
b.q('kumeler', 'A = {1, 2, 3, 4} ve B = {3, 4, 5} olduğuna göre A \\ B kümesi aşağıdakilerden hangisidir?', ['{1, 2}', '{3, 4}', '{5}', '{1, 2, 5}', '{1, 2, 3, 4, 5}'], 'A', 'A\'da olup B\'de olmayan elemanlar 1 ve 2\'dir.', 1);

b.lesson('mantik', 9, 'Önermeler, bağlaçlar ve doğruluk tablosu; koşullu önerme ve niceleyiciler.', [
  TABLE(['p', 'q', 'p ∧ q', 'p ∨ q', 'p ⇒ q', 'p ⇔ q'], ['1', '1', '1', '1', '1', '1'], ['1', '0', '0', '1', '0', '0'], ['0', '1', '0', '1', '1', '0'], ['0', '0', '0', '0', '1', '1']),
  TIP('p ⇒ q yalnızca "p doğru, q yanlış" iken yanlıştır. Doğrudan yanlışa gidilemez.'),
  F('Denklikler', '(p ∧ q)′ ≡ p′ ∨ q′   (De Morgan)', '(p ∨ q)′ ≡ p′ ∧ q′', 'p ⇒ q ≡ p′ ∨ q', '(p ⇒ q)′ ≡ p ∧ q′'),
  UL('∀ "her", ∃ "en az bir" niceleyicisidir.', '"Her x için P(x)" önermesinin olumsuzu: "En az bir x için P(x) değil".'),
], [card('p ⇒ q yanlış', 'Yalnızca 1 ⇒ 0'), card('(p ⇒ q)′', 'p ∧ q′')]);
b.q('mantik', 'p doğru, q yanlış bir önerme olduğuna göre aşağıdakilerden hangisi doğrudur?', ['p ∧ q', 'p ⇒ q', 'p ∨ q', 'p ⇔ q', 'p′'], 'C', '"veya" bağlacında önermelerden biri doğruysa bileşik önerme doğrudur: 1 ∨ 0 = 1.', 1);
b.q('mantik', '(p ⇒ q)′ önermesinin denki aşağıdakilerden hangisidir?', ['p′ ∨ q', 'p ∧ q′', 'p′ ∧ q', 'p ∨ q′', 'q ⇒ p'], 'B', 'p ⇒ q ≡ p′ ∨ q; olumsuzu De Morgan ile (p′ ∨ q)′ ≡ p ∧ q′.', 2);
b.q('mantik', '"Her x gerçek sayısı için x² ≥ 0\'dır." önermesinin olumsuzu aşağıdakilerden hangisidir?', ['Her x gerçek sayısı için x² < 0\'dır.', 'En az bir x gerçek sayısı için x² < 0\'dır.', 'En az bir x gerçek sayısı için x² ≥ 0\'dır.', 'Hiçbir x için x² ≥ 0 değildir.', 'Her x için x² ≤ 0\'dır.'], 'B', '"Her" niceleyicisi "en az bir" olur ve önerme olumsuzlanır: ≥ yerine <.', 2);

b.lesson('fonksiyon', 10, 'Fonksiyon kavramı, değer bulma, bileşke ve ters fonksiyon.', [
  P('A kümesinin her elemanını B kümesinin yalnız bir elemanına eşleyen bağıntıya fonksiyon denir. Tanım kümesinde açıkta eleman kalmaz; bir eleman iki farklı elemana gidemez.'),
  F('İşlemler', '(f ∘ g)(x) = f(g(x))   (önce g, sonra f)', 'f(x) = ax + b ise f⁻¹(x) = (x − b)/a', 'f(a) = b ⇔ f⁻¹(b) = a'),
  PLOT('f(x) = 2x + 3 (mavi) ve tersi f⁻¹(x) = (x − 3)/2 (turuncu), y = x doğrusuna göre simetriktir.', [-4, 5], [-4, 6],
    { label: 'f(x) = 2x + 3', f: (x) => 2 * x + 3 },
    { label: 'f⁻¹(x) = (x − 3)/2', f: (x) => (x - 3) / 2 },
    { label: 'y = x', f: (x) => x },
  ),
  TIP('f⁻¹(4) sorulduğunda ters fonksiyonu bulmak zorunda değilsiniz: f(y) = 4 denklemini çözmek yeterlidir.'),
], [card('Bileşke', '(f ∘ g)(x) = f(g(x))'), card('f⁻¹(b)', 'f(a) = b olan a')]);
b.q('fonksiyon', 'f(x) = 2x + 3 olduğuna göre f(4) kaçtır?', ['8', '9', '10', '11', '14'], 'D', 'f(4) = 2 · 4 + 3 = 11.', 1);
b.q('fonksiyon', 'f(x) = 3x − 1 ve g(x) = x + 2 olduğuna göre (f ∘ g)(1) kaçtır?', ['5', '6', '8', '9', '10'], 'C', 'g(1) = 3, f(3) = 9 − 1 = 8.', 1);
b.q('fonksiyon', 'f(x) = (x + 5)/2 olduğuna göre f⁻¹(4) kaçtır?', ['−1', '1', '3', '4,5', '13'], 'C', 'f(a) = 4 → (a + 5)/2 = 4 → a = 3.', 2);

b.lesson('polinom', 9, 'Polinomun derecesi, katsayılar toplamı, sabit terim ve kalan teoremi.', [
  UL('P(x) = aₙxⁿ + … + a₁x + a₀ biçiminde, üsleri doğal sayı olan ifadedir.', 'Derece: en büyük üs. Baş katsayı: en büyük üslü terimin katsayısı.'),
  F('Önemli değerler', 'Katsayılar toplamı = P(1)', 'Sabit terim = P(0)', 'P(x) ÷ (x − a) işleminde kalan = P(a)'),
  EX('P(x) = x³ − 2x + 7 polinomunun x − 2 ile bölümünden kalan nedir?', ['Kalan = P(2)', '8 − 4 + 7'], '11'),
  TIP('Bir polinomun derecesi soruluyorsa önce baş katsayının sıfır olmadığını kontrol edin.', 'warn'),
], [card('Katsayılar toplamı', 'P(1)'), card('x − a ile bölümde kalan', 'P(a)')]);
b.q('polinom', 'P(x) = 2x³ − x² + 4x − 5 polinomunun katsayılar toplamı kaçtır?', ['−5', '−1', '0', '1', '5'], 'C', 'P(1) = 2 − 1 + 4 − 5 = 0.', 1);
b.q('polinom', 'P(x) = x³ − 2x + 7 polinomunun x − 2 ile bölümünden kalan kaçtır?', ['3', '7', '9', '11', '15'], 'D', 'Kalan teoremi: P(2) = 8 − 4 + 7 = 11.', 1);
b.q('polinom', 'P(x) = (a − 3)x⁴ + 2x² + 1 polinomu ikinci dereceden olduğuna göre a kaçtır?', ['−3', '0', '2', '3', '4'], 'D', 'Dördüncü dereceden terimin katsayısı sıfır olmalı: a − 3 = 0 → a = 3.', 1);

b.lesson('ikinci-derece', 9, 'İkinci dereceden denklemlerin çözümü, diskriminant ve kökler arasındaki bağıntılar.', [
  F('ax² + bx + c = 0', 'Δ = b² − 4ac', 'x₁,₂ = (−b ± √Δ) / 2a', 'x₁ + x₂ = −b/a,   x₁ · x₂ = c/a'),
  TABLE(['Δ', 'Kökler'], ['Δ > 0', 'İki farklı gerçek kök'], ['Δ = 0', 'Çakışık (eşit) iki kök'], ['Δ < 0', 'Gerçek kök yok']),
  EX('x² − 7x + 12 = 0 denkleminin kökleri nelerdir?', ['Çarpımı 12, toplamı 7 olan sayılar: 3 ve 4', '(x − 3)(x − 4) = 0'], 'x = 3 veya x = 4'),
], [card('Kökler toplamı', '−b/a'), card('Çakışık kök', 'Δ = 0')]);
b.q('ikinci-derece', 'x² − 5x + 6 = 0 denkleminin kökleri toplamı kaçtır?', ['−6', '−5', '1', '5', '6'], 'D', 'x₁ + x₂ = −b/a = 5. (Kökler 2 ve 3)', 1);
b.q('ikinci-derece', 'x² − 7x + 12 = 0 denkleminin köklerinden büyüğü kaçtır?', ['2', '3', '4', '6', '12'], 'C', '(x − 3)(x − 4) = 0 → kökler 3 ve 4; büyüğü 4.', 1);
b.q('ikinci-derece', 'x² + 4x + m = 0 denkleminin çakışık iki kökü olduğuna göre m kaçtır?', ['2', '4', '8', '12', '16'], 'B', 'Δ = 16 − 4m = 0 → m = 4.', 2);

b.lesson('permutasyon', 10, 'Sayma kuralları, faktöriyel, permütasyon ve kombinasyon; tekrarlı permütasyon.', [
  F('Formüller', 'n! = n · (n − 1) · … · 1,  0! = 1', 'P(n, r) = n! / (n − r)!   (sıralama önemli)', 'C(n, r) = n! / (r!(n − r)!)   (seçim, sıra önemsiz)', 'Tekrarlı permütasyon: n! / (a! · b! · …)', 'Dairesel sıralama: (n − 1)!'),
  TABLE(['İpucu', 'Kullan'], ['Sıraya dizme, başkan-yardımcı seçme, şifre', 'Permütasyon'], ['Grup, takım, komisyon seçme', 'Kombinasyon']),
  EX('ANNE kelimesinin harfleriyle kaç farklı 4 harfli dizilim yazılır?', ['4 harf, N iki kez tekrar ediyor', '4! / 2! = 24 / 2'], '12'),
], [card('C(8, 3)', '56'), card('Dairesel', '(n − 1)!')]);
b.q('permutasyon', '5 kişi bir sıraya kaç farklı biçimde dizilebilir?', ['25', '60', '100', '120', '720'], 'D', 'İlk sıraya 5, ikinciye 4, … son sıraya 1 kişi gelebilir: 5! = 5 · 4 · 3 · 2 · 1 = 120.', 1);
b.q('permutasyon', '8 kişilik bir sınıftan 3 kişilik bir grup kaç farklı biçimde seçilebilir?', ['24', '56', '112', '336', '512'], 'B', 'Sıra önemsiz: C(8, 3) = 8 · 7 · 6 / 6 = 56.', 1);
b.q('permutasyon', 'ANNE kelimesinin harfleri kullanılarak anlamlı ya da anlamsız kaç farklı dört harfli kelime yazılabilir?', ['4', '6', '12', '18', '24'], 'C', 'N harfi iki kez geçer: 4! / 2! = 12.', 2);

b.lesson('veri', 9, 'Merkezî eğilim ve yayılım ölçüleri; tablo ve grafik yorumlama.', [
  TABLE(['Ölçü', 'Tanım'], ['Aritmetik ortalama', 'Verilerin toplamı / veri sayısı'], ['Medyan (ortanca)', 'Küçükten büyüğe sıralanınca ortadaki değer (çift sayıda veride ortadaki ikisinin ortalaması)'], ['Mod (tepe değer)', 'En çok tekrar eden değer'], ['Açıklık', 'En büyük − en küçük']),
  TIP('Medyan için veriler mutlaka sıralanmalıdır. Sıralanmadan ortadaki değeri almak en sık yapılan hatadır.', 'warn'),
  H('Grafikler'),
  UL('Sütun grafiği: Kategorileri karşılaştırır.', 'Çizgi grafiği: Zaman içindeki değişimi gösterir.', 'Daire grafiği: Bütünün parçalarını gösterir; açı = (değer / toplam) · 360°.'),
  EX('4, 7, 7, 9, 13 verilerinin ortalama, medyan ve modu nedir?', ['Toplam 40 → ortalama 8', 'Sıralı; ortadaki 7 → medyan 7', 'En çok tekrar eden 7 → mod 7'], '8, 7, 7'),
], [card('Medyan', 'Sırala, ortadakini al'), card('Daire grafiği açısı', '(değer / toplam) · 360°')]);
b.q('veri', '4, 7, 7, 9, 13 veri grubunun aritmetik ortalaması kaçtır?', ['7', '7,5', '8', '9', '10'], 'C', 'Toplam 40, veri sayısı 5: 40 / 5 = 8.', 1);
b.q('veri', '4, 7, 7, 9, 13 veri grubunun medyanı ve modu sırasıyla aşağıdakilerden hangisidir?', ['7 ve 7', '7 ve 9', '8 ve 7', '9 ve 7', '7 ve 13'], 'A', 'Sıralı verinin ortasındaki değer 7 (medyan); en çok tekrar eden değer 7 (mod).', 1);
b.q('veri', '3, 8, 2, 10, 6 veri grubunun açıklığı kaçtır?', ['4', '6', '7', '8', '10'], 'D', 'Açıklık = en büyük − en küçük = 10 − 2 = 8.', 1);

export default b.done();
