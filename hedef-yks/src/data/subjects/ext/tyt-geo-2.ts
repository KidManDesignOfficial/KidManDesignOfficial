/** TYT Geometri: üçgenler, çokgenler, dörtgenler, çember, analitik ve katı cisimler. */
import { EX, F, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../../build.ts';

const b = builder('tyt-geo', 'b');

b.lesson('ozel-ucgenler', 9, 'İkizkenar, eşkenar ve özel açılı dik üçgenlerin kenar-açı bağıntıları.', [
  TABLE(['Üçgen', 'Özellik'], ['İkizkenar', 'Taban açıları eşittir; tabana inen yükseklik aynı zamanda kenarortay ve açıortaydır.'], ['Eşkenar', 'Tüm açılar 60°; h = a√3/2, Alan = a²√3/4'], ['30°-60°-90°', 'Kenarlar x, x√3, 2x (30°\'nin karşısı en kısa)'], ['45°-45°-90°', 'Kenarlar x, x, x√2'], ['30°-30°-120°', 'Kenarlar x, x, x√3']),
  EX('Kenarı 6 cm olan eşkenar üçgenin yüksekliği nedir?', ['h = a√3/2', 'h = 6√3/2'], '3√3 cm'),
  TIP('Bir soruda 15°, 75° gibi açılar varsa çoğunlukla şekle yardımcı çizgi çizerek 30-60-90 ya da 45-45-90 üçgeni oluşturmanız beklenir.'),
], [card('Eşkenar üçgen yüksekliği', 'a√3/2'), card('45-45-90', 'x, x, x√2')]);
b.q('ozel-ucgenler', 'Bir kenarı 6 cm olan eşkenar üçgenin yüksekliği kaç cm\'dir?', ['3', '3√2', '3√3', '6', '6√3'], 'C', 'h = a√3/2 = 6√3/2 = 3√3.', 1);
b.q('ozel-ucgenler', 'Tepe açısı 40° olan ikizkenar üçgenin taban açılarından biri kaç derecedir?', ['40', '50', '60', '70', '80'], 'D', 'Taban açıları eşittir: (180 − 40)/2 = 70°.', 1);
b.q('ozel-ucgenler', 'Hipotenüsü 8√2 cm olan ikizkenar dik üçgenin bir dik kenarı kaç cm\'dir?', ['4', '4√2', '8', '8√2', '16'], 'C', '45-45-90 üçgeninde hipotenüs = x√2 → x = 8.', 1);

b.lesson('ucgende-alan', 9, 'Üçgenin alan formülleri ve aynı yükseklikli üçgenlerde alan oranı.', [
  F('Alan', 'A = (taban · yükseklik) / 2', 'A = (1/2) · a · b · sin C', 'Heron: A = √(u(u − a)(u − b)(u − c)),  u = (a + b + c)/2'),
  UL('Yükseklikleri ortak olan üçgenlerin alanları tabanlarıyla orantılıdır.', 'Kenarortay üçgenin alanını iki eşit parçaya ayırır.', 'Üç kenarortay üçgeni alanları eşit 6 üçgene böler.'),
  EX('Kenarları 8 ve 5, aradaki açı 30° olan üçgenin alanı nedir?', ['A = (1/2) · 8 · 5 · sin 30°', '= 20 · 1/2'], '10 birimkare'),
], [card('sin ile alan', '(1/2) · a · b · sin C'), card('Ortak yükseklik', 'Alan oranı = taban oranı')]);
b.q('ucgende-alan', 'Taban uzunluğu 10 cm ve bu tabana ait yüksekliği 6 cm olan bir üçgenin alanı kaç cm²\'dir?', ['15', '16', '30', '32', '60'], 'C', 'A = 10 · 6 / 2 = 30.', 1);
b.q('ucgende-alan', 'İki kenarı 8 cm ve 5 cm, bu kenarlar arasındaki açı 30° olan üçgenin alanı kaç cm²\'dir?', ['10', '20', '10√3', '20√3', '40'], 'A', 'A = (1/2) · 8 · 5 · sin 30° = 20 · 1/2 = 10.', 2);
b.q('ucgende-alan', 'ABC üçgeninde D noktası [BC] üzerindedir. |BD| = 3 cm, |DC| = 5 cm ve A(ABD) = 12 cm² ise A(ADC) kaç cm²\'dir?', ['15', '18', '20', '24', '32'], 'C', 'İki üçgenin A köşesinden inen yüksekliği ortaktır; alanlar tabanlarla orantılı: 12/3 = x/5 → x = 20.', 2);

b.lesson('benzerlik', 10, 'Üçgenlerde benzerlik koşulları, Thales teoremi ve benzerlik oranının çevre ile alana etkisi.', [
  UL('AA: İki açısı eşit üçgenler benzerdir.', 'KAK: İki kenar orantılı ve aradaki açı eşit.', 'KKK: Üç kenar orantılı.'),
  F('Benzerlik oranı k ise', 'Kenar ve çevreler oranı = k', 'Alanlar oranı = k²', 'Hacimler oranı (cisimlerde) = k³'),
  H('Temel orantı (Thales)'),
  P('ABC üçgeninde DE ∥ BC ise |AD|/|AB| = |AE|/|AC| = |DE|/|BC|.'),
  EX('DE ∥ BC, |AD| = 4, |DB| = 2, |DE| = 6 ise |BC| kaçtır?', ['|AB| = 6', '4/6 = 6/|BC|'], '|BC| = 9'),
], [card('Alan oranı', 'Benzerlik oranının karesi'), card('Thales', 'Paralel doğru orantılı parçalar ayırır')]);
b.q('benzerlik', 'Benzerlik oranı 2/3 olan iki üçgenin alanları oranı kaçtır?', ['2/3', '4/9', '8/27', '3/2', '1/3'], 'B', 'Alanlar oranı benzerlik oranının karesidir: (2/3)² = 4/9.', 1);
b.q('benzerlik', 'ABC üçgeninde D ∈ [AB], E ∈ [AC] ve DE ∥ BC\'dir. |AD| = 4 cm, |DB| = 2 cm, |DE| = 6 cm ise |BC| kaç cm\'dir?', ['8', '9', '10', '12', '3'], 'B', '|AB| = 6. |AD|/|AB| = |DE|/|BC| → 4/6 = 6/|BC| → |BC| = 9.', 2);
b.q('benzerlik', 'Kenar uzunlukları 3, 4 ve 5 cm olan üçgene benzer bir üçgenin en uzun kenarı 15 cm\'dir. Bu üçgenin çevresi kaç cm\'dir?', ['24', '30', '36', '45', '60'], 'C', 'Benzerlik oranı 15/5 = 3. Çevre 12 · 3 = 36.', 1);

b.lesson('aciortay-kenarortay', 10, 'Açıortay teoremleri, kenarortay ve ağırlık merkezi özellikleri.', [
  F('İç açıortay teoremi', 'A açısının açıortayı BC\'yi D\'de keserse: |AB| / |AC| = |BD| / |DC|'),
  UL('Kenarortaylar ağırlık merkezinde (G) kesişir ve köşeden itibaren 2 : 1 oranında bölünür: |AG| = 2|GD|.', 'Dik üçgende hipotenüse ait kenarortay hipotenüsün yarısıdır.', 'İç açıortaylar iç teğet çemberin merkezinde kesişir.'),
  EX('|AB| = 6, |AC| = 9, |BC| = 10 olan üçgende A\'nın açıortayı BC\'yi D\'de kesiyor. |BD| kaçtır?', ['|BD| / |DC| = 6/9 = 2/3', '|BD| = 10 · 2/5'], '4'),
  TIP('Ağırlık merkezi sorularında kenarortayı 3 parçaya bölün: köşe tarafı 2 parça, kenar tarafı 1 parça.'),
], [card('Ağırlık merkezi', 'Kenarortayı 2 : 1 böler'), card('Hipotenüse ait kenarortay', 'Hipotenüs / 2')]);
b.q('aciortay-kenarortay', 'ABC üçgeninde |AB| = 6 cm, |AC| = 9 cm, |BC| = 10 cm\'dir. A açısının iç açıortayı [BC]\'yi D noktasında kestiğine göre |BD| kaç cm\'dir?', ['3', '4', '4,5', '5', '6'], 'B', '|BD| / |DC| = 6/9 = 2/3; |BD| = 10 · 2/5 = 4.', 2);
b.q('aciortay-kenarortay', 'Hipotenüsü 14 cm olan bir dik üçgende hipotenüse ait kenarortay kaç cm\'dir?', ['5', '6', '7', '7√2', '14'], 'C', 'Dik üçgende hipotenüse ait kenarortay hipotenüsün yarısıdır: 7.', 1);
b.q('aciortay-kenarortay', 'ABC üçgeninde [AD] kenarortayı 12 cm, G ağırlık merkezidir. |AG| kaç cm\'dir?', ['4', '6', '8', '10', '12'], 'C', 'G kenarortayı köşeden itibaren 2 : 1 böler: |AG| = 12 · 2/3 = 8.', 1);

b.lesson('cokgenler', 8, 'Çokgenlerde iç ve dış açılar, düzgün çokgenler ve köşegen sayısı.', [
  F('n kenarlı çokgen', 'İç açılar toplamı = (n − 2) · 180°', 'Dış açılar toplamı = 360°', 'Düzgün çokgende bir dış açı = 360° / n', 'Köşegen sayısı = n(n − 3) / 2'),
  TABLE(['Çokgen', 'İç açılar toplamı', 'Düzgünse bir iç açı'], ['Üçgen', '180°', '60°'], ['Dörtgen', '360°', '90°'], ['Beşgen', '540°', '108°'], ['Altıgen', '720°', '120°'], ['Sekizgen', '1080°', '135°']),
  TIP('Düzgün altıgen, kenarı altıgenin kenarına eşit 6 eşkenar üçgenden oluşur: Alan = 6 · a²√3/4.'),
], [card('İç açılar toplamı', '(n − 2) · 180°'), card('Köşegen sayısı', 'n(n − 3)/2')]);
b.q('cokgenler', 'Bir altıgenin iç açılarının ölçüleri toplamı kaç derecedir?', ['360', '540', '720', '900', '1080'], 'C', '(6 − 2) · 180° = 720°.', 1);
b.q('cokgenler', 'Bir dış açısı 40° olan düzgün çokgen kaç kenarlıdır?', ['6', '8', '9', '10', '12'], 'C', 'n = 360° / 40° = 9.', 1);
b.q('cokgenler', 'Bir sekizgenin kaç köşegeni vardır?', ['16', '20', '24', '28', '40'], 'B', 'n(n − 3)/2 = 8 · 5 / 2 = 20.', 1);

b.lesson('dortgenler', 11, 'Paralelkenar, eşkenar dörtgen, dikdörtgen, kare, yamuk ve deltoidin özellikleri ve alanları.', [
  TABLE(['Dörtgen', 'Öne çıkan özellik', 'Alan'], ['Paralelkenar', 'Karşılıklı kenarlar paralel ve eşit; köşegenler birbirini ortalar', 'taban · yükseklik'], ['Eşkenar dörtgen', 'Tüm kenarlar eşit; köşegenler dik ve birbirini ortalar', 'e · f / 2'], ['Dikdörtgen', 'Tüm açılar 90°; köşegenler eşit', 'a · b'], ['Kare', 'Hem eşkenar dörtgen hem dikdörtgen; köşegen a√2', 'a²'], ['Yamuk', 'Yalnız bir çift kenar paralel; orta taban (a + c)/2', '((a + c)/2) · h'], ['Deltoid', 'İki çift komşu kenar eşit; köşegenler dik', 'e · f / 2']),
  TIP('Köşegenleri dik olan her dörtgenin alanı e · f / 2\'dir (eşkenar dörtgen, kare, deltoid).'),
  EX('Köşegeni 6√2 olan karenin alanı nedir?', ['Köşegen = a√2 → a = 6', 'Alan = 6²'], '36'),
], [card('Dik köşegenli dörtgen alanı', 'e · f / 2'), card('Yamuk alanı', '((a + c)/2) · h')]);
b.q('dortgenler', 'Köşegen uzunlukları 6 cm ve 8 cm olan eşkenar dörtgenin alanı kaç cm²\'dir?', ['12', '14', '24', '28', '48'], 'C', 'Köşegenler dik olduğu için alan e · f / 2 = 6 · 8 / 2 = 24.', 1);
b.q('dortgenler', 'Paralel kenarları 10 cm ve 6 cm, yüksekliği 4 cm olan yamuğun alanı kaç cm²\'dir?', ['16', '24', '32', '40', '64'], 'C', 'A = (10 + 6)/2 · 4 = 32.', 1);
b.q('dortgenler', 'Köşegen uzunluğu 6√2 cm olan karenin alanı kaç cm²\'dir?', ['12', '18', '36', '48', '72'], 'C', 'Köşegen a√2 = 6√2 → a = 6; alan 36. (Ya da köşegenler karesinin yarısı: 72/2 = 36.)', 1);

b.lesson('cember', 9, 'Çemberin ve dairenin temel elemanları; çevre, alan, yay ve dilim hesapları.', [
  UL('Çap = 2 · yarıçap. Çemberin en uzun kirişi çaptır.', 'Teğet, değme noktasındaki yarıçapa diktir.', 'Bir noktadan çembere çizilen iki teğet parçasının uzunlukları eşittir.'),
  F('Formüller', 'Çevre = 2πr     Alan = πr²', 'Yay uzunluğu = 2πr · α/360°', 'Daire dilimi alanı = πr² · α/360°'),
  EX('Çevresi 12π olan dairenin alanı nedir?', ['2πr = 12π → r = 6', 'Alan = π · 36'], '36π'),
], [card('Dilim alanı', 'πr² · α/360°'), card('Teğet', 'Yarıçapa diktir')]);
b.q('cember', 'Çevresi 12π cm olan bir dairenin alanı kaç cm²\'dir?', ['6π', '12π', '24π', '36π', '144π'], 'D', '2πr = 12π → r = 6 → alan π · 6² = 36π.', 1);
b.q('cember', 'Yarıçapı 4 cm olan bir çemberde 90°\'lik merkez açının gördüğü yayın uzunluğu kaç cm\'dir?', ['π', '2π', '4π', '8π', '16π'], 'B', '2π · 4 · 90/360 = 8π/4 = 2π.', 1);
b.q('cember', 'Merkez açısı 120° olan bir daire diliminin alanı 12π cm² ise dairenin yarıçapı kaç cm\'dir?', ['3', '4', '6', '9', '12'], 'C', 'πr² · 120/360 = 12π → r² = 36 → r = 6.', 2);

b.lesson('analitik', 10, 'Koordinat düzlemi, iki nokta arası uzaklık, eğim ve doğru denklemleri.', [
  F('Formüller', 'Uzaklık: √((x₂ − x₁)² + (y₂ − y₁)²)', 'Orta nokta: ((x₁ + x₂)/2, (y₁ + y₂)/2)', 'Eğim: m = (y₂ − y₁)/(x₂ − x₁)', 'Doğru: y − y₁ = m(x − x₁)'),
  UL('ax + by = c doğrusu x eksenini (c/a, 0), y eksenini (0, c/b) noktasında keser.', 'Paralel doğruların eğimleri eşit, dik doğruların eğimleri çarpımı −1\'dir.'),
  PLOT('2x + 3y = 12 doğrusu eksenleri (6, 0) ve (0, 4) noktalarında keser; eksenlerle alanı 12 olan bir üçgen oluşturur.', [-1, 7], [-1, 5], { label: '2x + 3y = 12', f: (x) => (12 - 2 * x) / 3 }),
], [card('Eğim', '(y₂ − y₁)/(x₂ − x₁)'), card('Eksen kesişimleri', 'x = 0 ve y = 0 yaz')]);
b.q('analitik', 'A(−1, 2) ve B(3, 5) noktaları arasındaki uzaklık kaç birimdir?', ['4', '5', '6', '7', '8'], 'B', '√((3 − (−1))² + (5 − 2)²) = √(16 + 9) = 5.', 1);
b.q('analitik', '2x + 3y = 12 doğrusunun koordinat eksenleriyle oluşturduğu üçgenin alanı kaç birimkaredir?', ['6', '8', '12', '18', '24'], 'C', 'x eksenini (6, 0), y eksenini (0, 4) noktasında keser. Alan = 6 · 4 / 2 = 12.', 2);
b.q('analitik', '(1, 2) ve (3, 8) noktalarından geçen doğrunun eğimi kaçtır?', ['1/3', '2', '3', '4', '6'], 'C', 'm = (8 − 2)/(3 − 1) = 6/2 = 3.', 1);

b.lesson('kati-cisimler', 10, 'Prizma, küp, silindir, piramit, koni ve kürenin alan ve hacim formülleri.', [
  TABLE(['Cisim', 'Hacim', 'Yüzey alanı'], ['Küp', 'a³', '6a²'], ['Dikdörtgenler prizması', 'a · b · c', '2(ab + bc + ac)'], ['Silindir', 'πr²h', '2πr² + 2πrh'], ['Piramit', '(taban alanı · h)/3', 'taban + yan yüzler'], ['Koni', 'πr²h/3', 'πr² + πr·ℓ'], ['Küre', '4πr³/3', '4πr²']),
  TIP('Koni ve piramidin hacmi, aynı taban ve yükseklikteki silindir ve prizmanın hacminin 1/3\'üdür.'),
  EX('Yüzey alanı 54 cm² olan küpün hacmi nedir?', ['6a² = 54 → a² = 9 → a = 3', 'Hacim = 3³'], '27 cm³'),
], [card('Küre hacmi', '4πr³/3'), card('Koni hacmi', 'πr²h/3')]);
b.q('kati-cisimler', 'Yüzey alanı 54 cm² olan bir küpün hacmi kaç cm³\'tür?', ['9', '18', '27', '36', '81'], 'C', '6a² = 54 → a = 3 → hacim 27.', 1);
b.q('kati-cisimler', 'Taban yarıçapı 3 cm ve yüksekliği 5 cm olan dik dairesel koninin hacmi kaç cm³\'tür?', ['9π', '15π', '30π', '45π', '75π'], 'B', 'V = πr²h/3 = π · 9 · 5 / 3 = 15π.', 1);
b.q('kati-cisimler', 'Yarıçapı 3 cm olan bir kürenin hacmi kaç cm³\'tür?', ['12π', '27π', '36π', '54π', '108π'], 'C', 'V = 4πr³/3 = 4π · 27 / 3 = 36π.', 1);
b.q('kati-cisimler', 'Ayrıt uzunlukları 2 cm, 3 cm ve 4 cm olan dikdörtgenler prizmasının yüzey alanı kaç cm²\'dir?', ['24', '26', '48', '52', '104'], 'D', '2(2 · 3 + 3 · 4 + 2 · 4) = 2(6 + 12 + 8) = 52.', 1);

export default b.done();
