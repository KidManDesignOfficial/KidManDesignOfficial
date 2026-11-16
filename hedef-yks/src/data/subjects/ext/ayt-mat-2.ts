/** AYT Matematik ve Geometri'nin kalan konuları. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../../build.ts';

const m = builder('ayt-mat', 'b');

m.lesson('fonksiyon', 10, 'Fonksiyon grafiklerinin yorumu, tek-çift fonksiyonlar, öteleme ve parçalı fonksiyonlar.', [
  TABLE(['Özellik', 'Tanım', 'Grafik'], ['Çift fonksiyon', 'f(−x) = f(x)', 'y eksenine göre simetrik (x², |x|)'], ['Tek fonksiyon', 'f(−x) = −f(x)', 'Orijine göre simetrik (x³, x)']),
  F('Öteleme', 'y = f(x − a) + b → grafik a birim sağa, b birim yukarı', 'y = f(x + a) → a birim sola', 'y = −f(x) → x eksenine göre yansıma'),
  PLOT('y = x² (mavi) grafiği 2 birim sağa ve 1 birim yukarı ötelenince y = (x − 2)² + 1 (turuncu) olur.', [-3, 5], [-1, 8],
    { label: 'y = x²', f: (x) => x * x },
    { label: 'y = (x − 2)² + 1', f: (x) => (x - 2) ** 2 + 1 },
  ),
  EX('f(x) = 2x + 1 (x < 1) ve f(x) = x² (x ≥ 1) ise f(0) + f(2) kaçtır?', ['0 < 1 → f(0) = 2 · 0 + 1 = 1', '2 ≥ 1 → f(2) = 4'], '5'),
], [card('Çift fonksiyon', 'f(−x) = f(x), y eksenine simetrik'), card('f(x − a) + b', 'a sağa, b yukarı')]);
m.q('fonksiyon', 'Aşağıdaki fonksiyonlardan hangisi tek fonksiyondur?', ['f(x) = x²', 'f(x) = x³', 'f(x) = x² + 1', 'f(x) = |x|', 'f(x) = x⁴ − x²'], 'B', 'f(−x) = (−x)³ = −x³ = −f(x); x³ tek fonksiyondur. Diğerleri çift fonksiyondur.', 1);
m.q('fonksiyon', 'y = f(x) fonksiyonunun grafiği 2 birim sağa ve 3 birim yukarı ötelenirse elde edilen grafiğin denklemi aşağıdakilerden hangisidir?', ['y = f(x + 2) + 3', 'y = f(x − 2) + 3', 'y = f(x − 2) − 3', 'y = f(x + 3) − 2', 'y = f(x) + 5'], 'B', 'Sağa öteleme x yerine x − 2, yukarı öteleme fonksiyona +3 olarak yansır.', 2);
m.q('fonksiyon', 'f(x) = 2x + 1 (x < 1 için) ve f(x) = x² (x ≥ 1 için) olarak tanımlanıyor. f(0) + f(2) kaçtır?', ['3', '4', '5', '6', '7'], 'C', 'f(0) = 1 (ilk kural), f(2) = 4 (ikinci kural); toplam 5.', 1);

m.lesson('polinom', 10, 'Polinom bölmesi, kalan teoremi, çarpan-kök ilişkisi ve P(x + a) türü sorular.', [
  F('Bölme', 'P(x) = B(x) · Q(x) + K(x),  der K < der B', 'P(x)\'in x − a ile bölümünden kalan P(a)', 'P(a) = 0 ⇔ x − a, P(x)\'in çarpanıdır'),
  UL('P(x + 1) verilip P(2) isteniyorsa x + 1 = 2, yani x = 1 yazılır.', 'İkinci dereceden bir polinomla bölümde kalan en çok birinci derecedendir: K(x) = ax + b.'),
  EX('P(x)\'in x − 2 ile bölümünden kalan 5, x + 1 ile bölümünden kalan −1 ise (x − 2)(x + 1) ile bölümünden kalan nedir?', ['K(x) = ax + b', 'P(2) = 2a + b = 5, P(−1) = −a + b = −1', '3a = 6 → a = 2, b = 1'], 'K(x) = 2x + 1'),
], [card('Çarpan koşulu', 'P(a) = 0'), card('İkinci dereceden bölende kalan', 'ax + b')]);
m.q('polinom', 'P(x) = x³ + ax² − 4x + 4 polinomu x − 1 ile tam bölünebildiğine göre a kaçtır?', ['−2', '−1', '0', '1', '2'], 'B', 'P(1) = 1 + a − 4 + 4 = a + 1 = 0 → a = −1.', 1);
m.q('polinom', 'P(x + 1) = x² + 3x + 5 olduğuna göre P(2) kaçtır?', ['5', '7', '9', '11', '13'], 'C', 'x + 1 = 2 → x = 1: P(2) = 1 + 3 + 5 = 9.', 1);
m.q('polinom', 'P(x) polinomunun x − 2 ile bölümünden kalan 5, x + 1 ile bölümünden kalan −1\'dir. P(x)\'in (x − 2)(x + 1) ile bölümünden kalan aşağıdakilerden hangisidir?', ['x + 3', '2x + 1', '2x − 1', '3x − 1', 'x + 1'], 'B', 'K(x) = ax + b: 2a + b = 5 ve −a + b = −1 → a = 2, b = 1.', 3);

m.lesson('ikinci-derece', 10, 'Kökleri verilen denklemi kurma, kökler arasındaki bağıntılar ve ikinci dereceden eşitsizlikler.', [
  F('Bağıntılar', 'x₁ + x₂ = −b/a,  x₁ · x₂ = c/a', 'x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂', 'Kökleri x₁, x₂ olan denklem: x² − (x₁ + x₂)x + x₁x₂ = 0'),
  H('Eşitsizlikler'),
  P('ax² + bx + c ifadesi, a > 0 iken kökler arasında negatif, kökler dışında pozitiftir (a < 0 ise tersi).'),
  PLOT('y = x² − x − 6 = (x − 3)(x + 2): −2 ile 3 arasında grafik x ekseninin altında (negatif).', [-4, 5], [-8, 10], { label: 'y = x² − x − 6', f: (x) => x * x - x - 6 }),
  FLOW('Eşitsizlik çözümü', 'İfadeyi sıfıra eşitle, kökleri bul', 'İşaret tablosu kur (en sağ, baş katsayının işareti)', 'İstenen işaretli aralıkları yaz'),
], [card('x₁² + x₂²', '(x₁ + x₂)² − 2x₁x₂'), card('a > 0', 'Kökler arası negatif')]);
m.q('ikinci-derece', 'Kökleri 2 ve −3 olan, baş katsayısı 1 olan ikinci dereceden denklem aşağıdakilerden hangisidir?', ['x² − x − 6 = 0', 'x² + x − 6 = 0', 'x² + x + 6 = 0', 'x² − 5x + 6 = 0', 'x² + 5x − 6 = 0'], 'B', 'x² − (2 − 3)x + (2)(−3) = x² + x − 6 = 0.', 1);
m.q('ikinci-derece', 'x² − x − 6 < 0 eşitsizliğinin çözüm kümesi aşağıdakilerden hangisidir?', ['(−3, 2)', '(−2, 3)', '(−∞, −2) ∪ (3, ∞)', '[−2, 3]', '(2, 3)'], 'B', '(x − 3)(x + 2) < 0; baş katsayı pozitif olduğu için ifade kökler arasında negatiftir: −2 < x < 3.', 2);
m.q('ikinci-derece', 'x² − 4x + 1 = 0 denkleminin kökleri x₁ ve x₂ ise x₁² + x₂² kaçtır?', ['12', '14', '15', '16', '18'], 'B', 'x₁ + x₂ = 4, x₁x₂ = 1 → 16 − 2 = 14.', 2);

m.lesson('trigonometri', 12, 'Birim çember, özel açılar, temel özdeşlikler, radyan ve trigonometrik fonksiyonların periyodu.', [
  TABLE(['Açı', 'sin', 'cos', 'tan'], ['0°', '0', '1', '0'], ['30°', '1/2', '√3/2', '√3/3'], ['45°', '√2/2', '√2/2', '1'], ['60°', '√3/2', '1/2', '√3'], ['90°', '1', '0', 'tanımsız']),
  F('Temel bağıntılar', 'sin²x + cos²x = 1', 'tan x = sin x / cos x', 'π radyan = 180°', 'sin(a ± b) = sin a cos b ± cos a sin b', 'Kosinüs teoremi: a² = b² + c² − 2bc · cos A'),
  PLOT('sin x (mavi) ve cos x (turuncu) grafikleri; ikisinin de periyodu 2π, değer aralığı [−1, 1].', [-1, 7], [-1.5, 1.5],
    { label: 'y = sin x', f: (x) => Math.sin(x) },
    { label: 'y = cos x', f: (x) => Math.cos(x) },
  ),
  UL('y = sin(kx) ve y = cos(kx) fonksiyonlarının esas periyodu 2π / |k|.', 'Dar açılı dik üçgende: sin = karşı/hipotenüs, cos = komşu/hipotenüs, tan = karşı/komşu.'),
], [card('sin²x + cos²x', '1'), card('sin(kx) periyodu', '2π / |k|')]);
m.q('trigonometri', 'sin 30° + cos 60° işleminin sonucu kaçtır?', ['0', '1/2', '1', '√3/2', '√3'], 'C', 'sin 30° = 1/2 ve cos 60° = 1/2; toplam 1.', 1);
m.q('trigonometri', 'x bir dar açı ve sin x = 3/5 olduğuna göre tan x kaçtır?', ['3/5', '3/4', '4/5', '4/3', '5/3'], 'B', '3-4-5 dik üçgeni: cos x = 4/5, tan x = 3/4.', 1);
m.q('trigonometri', 'f(x) = sin(2x) fonksiyonunun esas periyodu aşağıdakilerden hangisidir?', ['π/4', 'π/2', 'π', '2π', '4π'], 'C', 'Periyot 2π / 2 = π.', 1);
m.q('trigonometri', '120° kaç radyandır?', ['π/2', '2π/3', '3π/4', '5π/6', 'π'], 'B', '120 · π/180 = 2π/3.', 1);

m.lesson('diziler', 9, 'Aritmetik ve geometrik dizilerde genel terim ve ilk n terim toplamı.', [
  TABLE(['', 'Aritmetik dizi', 'Geometrik dizi'], ['Tanım', 'Ardışık terimler farkı sabit (d)', 'Ardışık terimler oranı sabit (r)'], ['Genel terim', 'aₙ = a₁ + (n − 1)d', 'aₙ = a₁ · rⁿ⁻¹'], ['İlk n terim toplamı', 'Sₙ = n(a₁ + aₙ)/2', 'Sₙ = a₁(rⁿ − 1)/(r − 1)']),
  TIP('Aritmetik dizide ortadaki terim, eşit uzaklıktaki iki terimin ortalamasıdır: a₅ = (a₁ + a₉)/2. Geometrik dizide ise geometrik ortalamadır: a₅² = a₁ · a₉.'),
  EX('a₁ = 2, r = 3 olan geometrik dizinin 4. terimi nedir?', ['a₄ = a₁ · r³', '= 2 · 27'], '54'),
], [card('Aritmetik genel terim', 'a₁ + (n − 1)d'), card('Geometrik genel terim', 'a₁ · rⁿ⁻¹')]);
m.q('diziler', 'İlk terimi 3, ortak farkı 4 olan aritmetik dizinin 10. terimi kaçtır?', ['36', '39', '40', '42', '43'], 'B', 'a₁₀ = 3 + 9 · 4 = 39.', 1);
m.q('diziler', 'İlk terimi 1, 20. terimi 39 olan aritmetik dizinin ilk 20 teriminin toplamı kaçtır?', ['200', '380', '400', '420', '800'], 'C', 'S₂₀ = 20 · (1 + 39)/2 = 400.', 1);
m.q('diziler', 'İlk terimi 2 ve ortak çarpanı 3 olan geometrik dizinin 4. terimi kaçtır?', ['18', '24', '48', '54', '162'], 'D', 'a₄ = 2 · 3³ = 54.', 1);

m.lesson('limit', 11, 'Limit kavramı, belirsizlikler, sonsuzda limit ve süreklilik.', [
  UL('x a\'ya yaklaşırken f(x)\'in yaklaştığı değer limittir; sağdan ve soldan limitler eşitse limit vardır.', '0/0 belirsizliğinde çarpanlara ayırıp sadeleştirin.', 'Sonsuzda rasyonel fonksiyon: Pay ve paydanın dereceleri eşitse limit baş katsayılar oranıdır; payın derecesi küçükse 0\'dır.'),
  F('Süreklilik', 'f, x = a\'da sürekli ⇔ lim (x→a) f(x) = f(a)'),
  EX('lim (x→2) (x² − 4)/(x − 2) kaçtır?', ['0/0 belirsizliği', '(x − 2)(x + 2)/(x − 2) = x + 2', 'x → 2: 4'], '4'),
], [card('0/0', 'Çarpanlara ayır, sadeleştir'), card('Sonsuzda eşit dereceler', 'Baş katsayılar oranı')]);
m.q('limit', 'lim (x→2) (x² − 4)/(x − 2) limitinin değeri kaçtır?', ['0', '2', '4', '8', 'Limit yoktur'], 'C', '(x − 2)(x + 2)/(x − 2) = x + 2 → 4.', 1);
m.q('limit', 'lim (x→∞) (3x² + 1)/(x² − 5) limitinin değeri kaçtır?', ['0', '1/3', '1', '3', '∞'], 'D', 'Pay ve paydanın dereceleri eşit (2); limit baş katsayılar oranı 3/1 = 3.', 1);
m.q('limit', 'f(x) = x + a (x < 1 için) ve f(x) = 3x (x ≥ 1 için) fonksiyonu x = 1\'de sürekli olduğuna göre a kaçtır?', ['0', '1', '2', '3', '4'], 'C', 'Soldan limit 1 + a, sağdan limit ve f(1) = 3 olmalı: 1 + a = 3 → a = 2.', 2);

m.lesson('integral', 11, 'Belirsiz integral kuralları, belirli integral ve eğri altındaki alan.', [
  F('Kurallar', '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + C  (n ≠ −1)', '∫ k · f(x) dx = k ∫ f(x) dx', '∫ₐᵇ f(x) dx = F(b) − F(a)'),
  P('Belirli integral, x ekseninin üstünde kalan bölgede eğri ile eksen arasındaki alana eşittir; eksenin altındaki alanlar negatif çıkar.'),
  PLOT('y = x² eğrisi ile x ekseni arasında, x = 0 ile x = 3 arasındaki alan ∫₀³ x² dx = 9 birimkaredir.', [-1, 3.5], [0, 10], { label: 'y = x²', f: (x) => x * x }),
  TIP('Türev ile integral ters işlemlerdir: bulduğunuz ilkelin türevini alarak sonucu kontrol edin.'),
], [card('∫ xⁿ dx', 'xⁿ⁺¹/(n + 1) + C'), card('Belirli integral', 'F(b) − F(a)')]);
m.q('integral', '∫ (3x² + 2x) dx integralinin sonucu aşağıdakilerden hangisidir?', ['6x + 2 + C', 'x³ + x² + C', '3x³ + 2x² + C', 'x³ + 2x² + C', 'x² + x + C'], 'B', '∫3x² dx = x³ ve ∫2x dx = x²; sonuç x³ + x² + C.', 1);
m.q('integral', '∫₀² (2x + 1) dx belirli integralinin değeri kaçtır?', ['4', '6', '8', '10', '12'], 'B', '[x² + x]₀² = (4 + 2) − 0 = 6.', 1);
m.q('integral', 'y = x² eğrisi, x ekseni, x = 0 ve x = 3 doğruları arasında kalan bölgenin alanı kaç birimkaredir?', ['3', '6', '9', '18', '27'], 'C', '∫₀³ x² dx = [x³/3]₀³ = 27/3 = 9.', 2);

m.lesson('kombinasyon', 10, 'Kombinasyon problemleri, Pascal üçgeni ve binom açılımı.', [
  F('Binom', '(a + b)ⁿ açılımında n + 1 terim vardır', 'Genel terim: C(n, r) · aⁿ⁻ʳ · bʳ', 'Katsayılar toplamı: değişkenlere 1 yazılır', 'C(n, r) = C(n, n − r)'),
  P('Pascal üçgeninde her sayı üstündeki iki sayının toplamıdır; n. satır (a + b)ⁿ açılımının katsayılarını verir: 1, 4, 6, 4, 1 → (a + b)⁴.'),
  EX('6 erkek ve 4 kız arasından 2 erkek ve 2 kızdan oluşan kaç farklı ekip kurulur?', ['C(6, 2) = 15', 'C(4, 2) = 6', 'Çarpma kuralı: 15 · 6'], '90'),
], [card('(a + b)ⁿ terim sayısı', 'n + 1'), card('Katsayılar toplamı', 'Değişkenlere 1 yaz')]);
m.q('kombinasyon', '(x + 2)⁵ ifadesinin açılımında kaç terim vardır?', ['4', '5', '6', '7', '10'], 'C', '(a + b)ⁿ açılımında n + 1 = 6 terim vardır.', 1);
m.q('kombinasyon', '(x + 1)⁶ ifadesinin açılımında x⁴\'lü terimin katsayısı kaçtır?', ['6', '15', '20', '30', '60'], 'B', 'C(6, 2) · x⁴ · 1² = 15x⁴.', 2);
m.q('kombinasyon', '(2x − 1)⁴ ifadesinin açılımındaki katsayılar toplamı kaçtır?', ['−1', '0', '1', '16', '81'], 'C', 'x = 1 yazılır: (2 − 1)⁴ = 1.', 1);
m.q('kombinasyon', '6 erkek ve 4 kız öğrenci arasından 2 erkek ve 2 kızdan oluşan 4 kişilik kaç farklı ekip oluşturulabilir?', ['45', '90', '120', '180', '210'], 'B', 'C(6, 2) · C(4, 2) = 15 · 6 = 90.', 2);

m.lesson('olasilik', 9, 'Koşullu olasılık, bağımsız olaylar ve indirgenmiş örnek uzay.', [
  F('Koşullu olasılık', 'P(A | B) = P(A ∩ B) / P(B)', 'Bağımsız olaylar: P(A ∩ B) = P(A) · P(B)'),
  P('"… bilindiğine göre" ifadesi örnek uzayı daraltır: Yalnızca koşulu sağlayan durumlar yeni örnek uzay olur.'),
  EX('Bir zar atılıyor; gelen sayının çift olduğu biliniyor. 4\'ten büyük olma olasılığı nedir?', ['Yeni örnek uzay: {2, 4, 6}', '4\'ten büyük: {6}'], '1/3'),
], [card('P(A | B)', 'P(A ∩ B) / P(B)'), card('Bağımsızlık', 'P(A ∩ B) = P(A) · P(B)')]);
m.q('olasilik', 'Bir zar atılıyor. Gelen sayının çift olduğu bilindiğine göre 4\'ten büyük olma olasılığı kaçtır?', ['1/6', '1/4', '1/3', '1/2', '2/3'], 'C', 'Örnek uzay {2, 4, 6}; 4\'ten büyük olan yalnız 6: 1/3.', 1);
m.q('olasilik', 'A ve B bağımsız olaylardır. P(A) = 0,5 ve P(B) = 0,4 olduğuna göre P(A ∩ B) kaçtır?', ['0,1', '0,2', '0,45', '0,5', '0,9'], 'B', 'Bağımsız olaylarda P(A ∩ B) = 0,5 · 0,4 = 0,2.', 1);
m.q('olasilik', 'İki zar atılıyor. Üst yüzlerdeki sayıların toplamının 8 olduğu bilindiğine göre zarlardan birinin 3 olma olasılığı kaçtır?', ['1/5', '1/3', '2/5', '1/2', '3/5'], 'C', 'Toplam 8: (2,6), (3,5), (4,4), (5,3), (6,2) → 5 durum. 3 içerenler (3,5) ve (5,3): 2/5.', 2);

// ═════════════════════════════ AYT GEOMETRİ ═════════════════════════════
const g = builder('ayt-geo', 'b');

g.lesson('ucgenler', 11, 'Kosinüs ve sinüs teoremleri, üçgen eşitsizliği ve açı-kenar bağıntıları.', [
  F('Teoremler', 'Kosinüs: a² = b² + c² − 2bc · cos A', 'Sinüs: a / sin A = b / sin B = c / sin C = 2R', 'Üçgen eşitsizliği: |b − c| < a < b + c'),
  UL('Büyük açının karşısında büyük kenar bulunur.', 'a² < b² + c² ise A dar açı; a² = b² + c² ise dik; a² > b² + c² ise geniş açıdır.'),
  EX('İki kenarı 5 ve 8, aradaki açı 60° olan üçgenin üçüncü kenarı nedir?', ['a² = 25 + 64 − 2 · 5 · 8 · cos 60°', '= 89 − 40 = 49'], 'a = 7'),
], [card('Kosinüs teoremi', 'a² = b² + c² − 2bc cos A'), card('Üçgen eşitsizliği', '|b − c| < a < b + c')]);
g.q('ucgenler', 'Bir üçgenin iki kenarı 5 cm ve 8 cm, bu kenarlar arasındaki açı 60°\'dir. Üçüncü kenar kaç cm\'dir?', ['6', '7', '8', '9', '√89'], 'B', 'a² = 25 + 64 − 2 · 5 · 8 · 1/2 = 49 → a = 7.', 2);
g.q('ucgenler', 'İki kenarı 4 cm ve 9 cm olan bir üçgenin üçüncü kenarı tam sayı olduğuna göre kaç farklı değer alabilir?', ['5', '6', '7', '8', '9'], 'C', '9 − 4 < a < 9 + 4 → 5 < a < 13; a ∈ {6, 7, …, 12} → 7 değer.', 2);
g.q('ucgenler', 'Bir ABC üçgeninde |BC| = 10 cm ve A açısı 30°\'dir. Üçgenin çevrel çemberinin yarıçapı kaç cm\'dir?', ['5', '5√3', '10', '10√3', '20'], 'C', 'Sinüs teoremi: a / sin A = 2R → 10 / (1/2) = 20 = 2R → R = 10.', 2);

g.lesson('cokgen-dortgen', 10, 'Düzgün çokgenlerin alanı ve dörtgenlerde açı, köşegen ve orta taban bağıntıları.', [
  F('Düzgün çokgenler', 'Düzgün altıgen alanı = 6 · a²√3/4', 'Düzgün n-genin bir iç açısı = (n − 2) · 180° / n'),
  UL('Paralelkenarda komşu açılar bütünler (toplamı 180°), karşı açılar eşittir.', 'Yamukta orta taban (yan kenarların orta noktalarını birleştiren) = (alt taban + üst taban)/2.', 'Dikdörtgende köşegen √(a² + b²); köşegenler eşit ve birbirini ortalar.'),
  TIP('Düzgün altıgeni merkezden köşelere çizilen doğrularla 6 eşkenar üçgene bölmek, alan ve uzunluk sorularının çoğunu çözer.'),
], [card('Düzgün altıgen alanı', '6 · a²√3/4'), card('Yamuk orta tabanı', '(a + c)/2')]);
g.q('cokgen-dortgen', 'Bir kenarı 4 cm olan düzgün altıgenin alanı kaç cm²\'dir?', ['12√3', '16√3', '24√3', '32√3', '48√3'], 'C', '6 · 16√3/4 = 24√3.', 2);
g.q('cokgen-dortgen', 'Paralel kenarları 8 cm ve 14 cm olan bir yamuğun orta tabanı kaç cm\'dir?', ['6', '10', '11', '12', '22'], 'C', 'Orta taban = (8 + 14)/2 = 11.', 1);
g.q('cokgen-dortgen', 'Bir paralelkenarın bir iç açısı 70° olduğuna göre bu açıya komşu olan iç açı kaç derecedir?', ['20', '70', '110', '140', '290'], 'C', 'Paralelkenarda komşu açılar bütünlerdir: 180 − 70 = 110°.', 1);

g.lesson('donusumler', 9, 'Analitik düzlemde öteleme, yansıma ve dönme dönüşümleri.', [
  TABLE(['Dönüşüm', 'P(x, y) noktasının görüntüsü'], ['a sağa, b yukarı öteleme', '(x + a, y + b)'], ['x eksenine göre yansıma', '(x, −y)'], ['y eksenine göre yansıma', '(−x, y)'], ['Orijine göre yansıma', '(−x, −y)'], ['y = x doğrusuna göre yansıma', '(y, x)'], ['Orijin etrafında +90° dönme', '(−y, x)'], ['Orijin etrafında 180° dönme', '(−x, −y)']),
  TIP('Pozitif yön saat yönünün tersidir. Orijin etrafında 180° dönme ile orijine göre yansıma aynı sonucu verir.'),
  EX('A(2, 5) noktası orijin etrafında pozitif yönde 90° döndürülürse hangi noktaya gelir?', ['+90° dönme kuralı: (x, y) → (−y, x)', '(2, 5) → (−5, 2)'], '(−5, 2)'),
], [card('+90° dönme', '(x, y) → (−y, x)'), card('y = x yansıması', '(x, y) → (y, x)')]);
g.q('donusumler', 'A(3, −2) noktasının y eksenine göre yansıması aşağıdakilerden hangisidir?', ['(3, 2)', '(−3, −2)', '(−3, 2)', '(−2, 3)', '(2, −3)'], 'B', 'y eksenine göre yansımada x koordinatının işareti değişir: (−3, −2).', 1);
g.q('donusumler', 'A(2, 5) noktasının orijin etrafında pozitif yönde 90° döndürülmesiyle elde edilen nokta aşağıdakilerden hangisidir?', ['(5, 2)', '(−5, 2)', '(5, −2)', '(−2, −5)', '(−2, 5)'], 'B', '+90° dönme: (x, y) → (−y, x) = (−5, 2).', 2);
g.q('donusumler', 'A(1, 4) noktası 3 birim sola ve 2 birim aşağı ötelenirse hangi noktaya gelir?', ['(4, 6)', '(−2, 2)', '(4, 2)', '(−2, 6)', '(−3, −2)'], 'B', '(1 − 3, 4 − 2) = (−2, 2).', 1);
g.q('donusumler', '(4, −1) noktasının y = x doğrusuna göre yansıması aşağıdakilerden hangisidir?', ['(−1, 4)', '(1, −4)', '(−4, 1)', '(4, 1)', '(−1, −4)'], 'A', 'y = x yansımasında koordinatlar yer değiştirir: (−1, 4).', 1);

g.lesson('cember-analitik', 10, 'Çemberin standart ve genel denklemi; doğru ile çemberin birbirine göre konumu.', [
  F('Denklemler', 'Standart: (x − a)² + (y − b)² = r²  → merkez (a, b)', 'Genel: x² + y² + Dx + Ey + F = 0', 'Merkez (−D/2, −E/2),  r² = (D² + E²)/4 − F'),
  TABLE(['Merkezin doğruya uzaklığı d', 'Konum'], ['d < r', 'Doğru çemberi iki noktada keser'], ['d = r', 'Doğru çembere teğettir'], ['d > r', 'Doğru çemberi kesmez']),
  EX('x² + y² − 6x + 4y − 3 = 0 çemberinin yarıçapı nedir?', ['Merkez (3, −2)', 'r² = 9 + 4 + 3 = 16'], 'r = 4'),
], [card('Genel denklemden merkez', '(−D/2, −E/2)'), card('Teğetlik', 'd = r')]);
g.q('cember-analitik', '(x − 2)² + (y + 3)² = 16 çemberinin merkezi ve yarıçapı aşağıdakilerden hangisidir?', ['(2, 3) ve 4', '(−2, 3) ve 16', '(2, −3) ve 4', '(2, −3) ve 16', '(−2, −3) ve 4'], 'C', 'Standart denklemde merkez (a, b) = (2, −3), r² = 16 → r = 4.', 1);
g.q('cember-analitik', 'x² + y² − 6x + 4y − 3 = 0 çemberinin yarıçapı kaç birimdir?', ['2', '3', '4', '5', '16'], 'C', 'Merkez (3, −2); r² = 3² + (−2)² − (−3) = 16 → r = 4.', 2);
g.q('cember-analitik', 'Merkezi orijin ve yarıçapı 5 olan çember ile 3x + 4y − 25 = 0 doğrusunun birbirine göre konumu nedir?', ['İki noktada kesişirler.', 'Doğru çembere teğettir.', 'Kesişmezler.', 'Doğru merkezden geçer.', 'Doğru çemberin içindedir.'], 'B', 'Merkezin doğruya uzaklığı |−25| / 5 = 5 = r; doğru teğettir.', 2);

g.lesson('kati-cisimler', 11, 'Prizma, piramit, silindir, koni ve kürede alan-hacim; benzer cisimler.', [
  TABLE(['Cisim', 'Yanal alan', 'Hacim'], ['Silindir', '2πrh', 'πr²h'], ['Dik koni', 'πrℓ (ℓ: ana doğru)', 'πr²h/3'], ['Kare dik piramit', '4 · (a · yan yüz yüksekliği)/2', 'a²h/3'], ['Küre', 'Yüzey: 4πr²', '4πr³/3']),
  UL('Dik konide ℓ² = r² + h².', 'Benzerlik oranı k olan cisimlerde alanlar oranı k², hacimler oranı k³.'),
  EX('Taban yarıçapı 3 cm, yüksekliği 4 cm olan dik koninin yanal alanı nedir?', ['ℓ = √(9 + 16) = 5', 'Yanal alan = π · 3 · 5'], '15π cm²'),
], [card('Koni yanal alanı', 'πrℓ'), card('Benzer cisimlerde hacim oranı', 'k³')]);
g.q('kati-cisimler', 'Taban yarıçapı 3 cm ve yüksekliği 4 cm olan dik dairesel koninin yanal alanı kaç cm²\'dir?', ['9π', '12π', '15π', '24π', '36π'], 'C', 'Ana doğru ℓ = 5; yanal alan πrℓ = 15π.', 2);
g.q('kati-cisimler', 'Yarıçapları oranı 1/2 olan iki kürenin hacimleri oranı kaçtır?', ['1/2', '1/4', '1/8', '1/16', '2'], 'C', 'Hacimler oranı benzerlik oranının küpüdür: (1/2)³ = 1/8.', 1);
g.q('kati-cisimler', 'Taban ayrıtı 6 cm ve yüksekliği 4 cm olan kare dik piramidin hacmi kaç cm³\'tür?', ['24', '36', '48', '72', '144'], 'C', 'V = a²h/3 = 36 · 4 / 3 = 48.', 1);
g.q('kati-cisimler', 'Taban yarıçapı 2 cm ve yüksekliği 5 cm olan dik silindirin yanal alanı kaç cm²\'dir?', ['10π', '20π', '24π', '28π', '40π'], 'B', 'Yanal alan = 2πrh = 2π · 2 · 5 = 20π.', 1);

export default [m.done(), g.done()];
