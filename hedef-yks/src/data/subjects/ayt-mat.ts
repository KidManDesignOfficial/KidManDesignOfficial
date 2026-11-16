/** AYT Matematik ve Geometri. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../build.ts';

const m = builder('ayt-mat');

m.lesson(
  'parabol',
  10,
  'İkinci dereceden fonksiyonun grafiği: tepe noktası, eksenleri kesme ve parabol denklemi yazma.',
  [
    H('Genel biçim'),
    F('y = ax² + bx + c   (a ≠ 0)', 'a > 0 → kollar yukarı (en küçük değer var)', 'a < 0 → kollar aşağı (en büyük değer var)', 'y eksenini (0, c) noktasında keser'),
    H('Tepe noktası T(r, k)'),
    F(undefined, 'r = −b / (2a)', 'k = f(r)', 'Simetri ekseni: x = r'),
    PLOT('Mavi: y = x² − 4x + 3 (kollar yukarı, tepe (2, −1)). Turuncu: y = −x² + 2x + 3 (kollar aşağı, tepe (1, 4)).', [-2, 5], [-3, 6],
      { label: 'y = x² − 4x + 3', f: (x) => x * x - 4 * x + 3 },
      { label: 'y = −x² + 2x + 3', f: (x) => -x * x + 2 * x + 3 },
    ),
    H('x eksenini kesme: diskriminant'),
    TABLE(['Δ = b² − 4ac', 'Durum'], ['Δ > 0', 'x eksenini iki noktada keser'], ['Δ = 0', 'x eksenine teğettir'], ['Δ < 0', 'x eksenini kesmez']),
    H('Denklem yazma'),
    UL('Kökler x₁, x₂ biliniyorsa: y = a(x − x₁)(x − x₂)', 'Tepe noktası (r, k) biliniyorsa: y = a(x − r)² + k'),
    EX('Kökleri 1 ve 5 olan, y eksenini (0, 10) noktasında kesen parabolün denklemi nedir?', ['y = a(x − 1)(x − 5)', 'x = 0 için: a · (−1)(−5) = 5a = 10 → a = 2', 'y = 2(x² − 6x + 5)'], 'y = 2x² − 12x + 10'),
  ],
  [card('Tepe apsisi', 'r = −b / 2a'), card('Teğetlik koşulu', 'Δ = 0')],
);

m.q('parabol', 'y = x² − 6x + 5 parabolünün tepe noktası aşağıdakilerden hangisidir?', ['(3, −4)', '(−3, 4)', '(3, 4)', '(6, 5)', '(1, 0)'], 'A', 'r = 6/2 = 3; k = 9 − 18 + 5 = −4 → T(3, −4).', 1);
m.q('parabol', 'y = x² − 4x + m parabolü x eksenine teğet olduğuna göre m kaçtır?', ['1', '2', '3', '4', '8'], 'D', 'Teğetlik için Δ = 16 − 4m = 0 → m = 4.', 1);
m.q('parabol', 'f(x) = −2x² + 8x − 3 fonksiyonunun alabileceği en büyük değer kaçtır?', ['3', '4', '5', '6', '8'], 'C', 'a < 0 olduğundan tepe noktası en büyük değeri verir: r = −8/(−4) = 2, f(2) = −8 + 16 − 3 = 5.', 2);
m.q('parabol', 'Kökleri 1 ve 5 olan ve y eksenini (0, 10) noktasında kesen parabolün denklemi aşağıdakilerden hangisidir?', ['y = x² − 6x + 5', 'y = 2x² − 12x + 10', 'y = 2x² + 12x + 10', 'y = −2x² + 12x − 10', 'y = 10x² − 60x + 50'], 'B', 'y = a(x − 1)(x − 5); x = 0\'da 5a = 10 → a = 2 → y = 2x² − 12x + 10.', 2);

m.lesson(
  'logaritma',
  10,
  'Logaritmanın tanımı, özellikleri, taban değiştirme ve logaritmik fonksiyonun tanım kümesi.',
  [
    H('Tanım'),
    F(undefined, 'logₐ b = c  ⇔  aᶜ = b', 'Koşullar: a > 0, a ≠ 1, b > 0', 'log x = log₁₀ x     ln x = logₑ x'),
    H('Özellikler'),
    F('Kurallar', 'logₐ(x · y) = logₐ x + logₐ y', 'logₐ(x / y) = logₐ x − logₐ y', 'logₐ xⁿ = n · logₐ x', 'logₐ a = 1,   logₐ 1 = 0', 'Taban değiştirme: logₐ b = log b / log a', 'logₐ b · log_b c = logₐ c'),
    TIP('logₐ b · log_b c zincirinde ortadaki b\'ler "sadeleşir": log₂ 5 · log₅ 16 = log₂ 16 = 4.'),
    PLOT('y = 2ˣ ile y = log₂ x birbirinin tersidir; y = x doğrusuna göre simetriktir.', [-2, 6], [-3, 6],
      { label: 'y = 2ˣ', f: (x) => 2 ** x },
      { label: 'y = log₂ x', f: (x) => (x > 0 ? Math.log2(x) : NaN) },
      { label: 'y = x', f: (x) => x },
    ),
    H('Tanım kümesi'),
    P('logₐ f(x) ifadesinin tanımlı olması için f(x) > 0 olmalıdır; taban değişken içeriyorsa taban > 0 ve taban ≠ 1 koşulları da eklenir.'),
    EX('log₃(x − 1) = 2 ise x kaçtır?', ['Tanımdan: x − 1 = 3²', 'x − 1 = 9'], 'x = 10'),
  ],
  [card('logₐ b = c', 'aᶜ = b'), card('log 4 + log 25', 'log 100 = 2')],
);

m.q('logaritma', 'log₂ 32 ifadesinin değeri kaçtır?', ['3', '4', '5', '6', '16'], 'C', '2⁵ = 32 olduğundan log₂ 32 = 5.', 1);
m.q('logaritma', 'log 4 + log 25 işleminin sonucu kaçtır?', ['1', '2', '3', '10', '29'], 'B', 'log 4 + log 25 = log(4 · 25) = log 100 = 2.', 1);
m.q('logaritma', 'log₃(x − 1) = 2 olduğuna göre x kaçtır?', ['7', '8', '9', '10', '11'], 'D', 'x − 1 = 3² = 9 → x = 10.', 1);
m.q('logaritma', 'f(x) = log(x − 3) fonksiyonunun en geniş tanım kümesi aşağıdakilerden hangisidir?', ['(−∞, 3)', '[3, ∞)', '(3, ∞)', 'ℝ', 'ℝ − {3}'], 'C', 'Logaritmanın içi pozitif olmalı: x − 3 > 0 → x > 3.', 1);
m.q('logaritma', 'log₂ 5 · log₅ 16 işleminin sonucu kaçtır?', ['1', '2', '3', '4', '8'], 'D', 'Zincir kuralı: log₂ 5 · log₅ 16 = log₂ 16 = 4.', 2);

m.lesson(
  'turev',
  12,
  'Türev kuralları, teğetin eğimi, artan-azalan fonksiyonlar ve ekstremum noktaları.',
  [
    H('Türevin anlamı'),
    P('f′(a), f fonksiyonunun x = a noktasındaki anlık değişim hızıdır ve grafikte o noktadaki teğetin eğimini verir.'),
    F('Temel kurallar', '(c)′ = 0     (xⁿ)′ = n · xⁿ⁻¹', '(f ± g)′ = f′ ± g′', '(f · g)′ = f′g + fg′', '(f / g)′ = (f′g − fg′) / g²', 'Zincir: [f(g(x))]′ = f′(g(x)) · g′(x)'),
    H('Artan – azalan, ekstremum'),
    UL('f′(x) > 0 olan aralıkta f artandır; f′(x) < 0 ise azalandır.', 'f′ işaret değiştirdiği noktada yerel ekstremum vardır: + → − ise yerel maksimum, − → + ise yerel minimum.'),
    PLOT('f(x) = x³ − 3x (mavi) ve türevi f′(x) = 3x² − 3 (turuncu). f′ = 0 olan x = −1 ve x = 1 noktalarında f\'nin yerel maksimum ve minimumu var.', [-2.5, 2.5], [-4, 6],
      { label: 'f(x) = x³ − 3x', f: (x) => x ** 3 - 3 * x },
      { label: 'f′(x) = 3x² − 3', f: (x) => 3 * x * x - 3 },
    ),
    FLOW('Ekstremum bulma', 'f′(x) = 0 denklemini çöz', 'Kritik noktalarda f′\'nin işaret değişimine bak', 'Bu noktaları f\'de yerine koyarak değerleri bul'),
    EX('f(x) = (2x + 1)³ ise f′(0) kaçtır?', ['Zincir kuralı: f′(x) = 3(2x + 1)² · 2', 'f′(0) = 3 · 1 · 2'], '6'),
    TIP('"Teğetin eğimi", "anlık hız", "değişim oranı" ifadelerinin hepsi türev demektir.'),
  ],
  [card('(xⁿ)′', 'n · xⁿ⁻¹'), card('Çarpım kuralı', 'f′g + fg′'), card('Teğet eğimi', 'f′(a)')],
);

m.q('turev', 'f(x) = 3x⁴ − 2x + 1 olduğuna göre f′(1) kaçtır?', ['8', '10', '12', '13', '14'], 'B', 'f′(x) = 12x³ − 2 → f′(1) = 10.', 1);
m.q('turev', 'f(x) = (2x + 1)³ olduğuna göre f′(0) kaçtır?', ['2', '3', '6', '9', '12'], 'C', 'f′(x) = 3(2x + 1)² · 2 → f′(0) = 6.', 2);
m.q('turev', 'y = x² + 3x eğrisine x = 1 apsisli noktasından çizilen teğetin eğimi kaçtır?', ['1', '3', '4', '5', '6'], 'D', 'y′ = 2x + 3 → x = 1 için eğim 5.', 1);
m.q('turev', 'f(x) = x³ − 3x fonksiyonunun yerel maksimum değeri kaçtır?', ['−2', '−1', '0', '1', '2'], 'E', 'f′(x) = 3x² − 3 = 0 → x = ±1. f′ işareti x = −1\'de + → − değişir; yerel maksimum f(−1) = −1 + 3 = 2.', 2);

// ═════════════════════════════ AYT GEOMETRİ ═════════════════════════════
const g = builder('ayt-geo');

g.lesson(
  'cember-daire',
  10,
  'Çemberde açılar, kiriş özellikleri, yay uzunluğu ve daire diliminin alanı.',
  [
    H('Çemberde açılar'),
    TABLE(['Açı', 'Ölçüsü'], ['Merkez açı', 'Gördüğü yaya eşit'], ['Çevre açı', 'Gördüğü yayın yarısı'], ['Teğet-kiriş açı', 'Gördüğü yayın yarısı'], ['İç açı', 'Gördüğü yayların toplamının yarısı'], ['Dış açı', 'Gördüğü yayların farkının yarısı']),
    TIP('Çapı gören çevre açı her zaman 90°\'dir. Teğet, değme noktasındaki yarıçapa diktir.'),
    H('Kiriş özellikleri'),
    P('Merkezden bir kirişe indirilen dikme kirişi ortalar. Yarıçap r, merkezin kirişe uzaklığı d ise kirişin yarısı √(r² − d²)\'dir.'),
    H('Uzunluk ve alan'),
    F('Formüller', 'Çevre = 2πr     Alan = πr²', 'Yay uzunluğu = 2πr · α / 360', 'Dilim alanı = πr² · α / 360'),
    EX('Yarıçapı 6 cm olan dairede merkez açısı 60° olan dilimin alanı kaç cm²\'dir?', ['πr² · α / 360 = 36π · 60 / 360', '= 36π / 6'], '6π cm²'),
  ],
  [card('Çevre açı', 'Yayın yarısı'), card('Çapı gören çevre açı', '90°')],
);

g.q('cember-daire', 'Bir çemberde çevre açının gördüğü yay 110° ise bu çevre açı kaç derecedir?', ['35', '45', '55', '70', '110'], 'C', 'Çevre açı gördüğü yayın yarısıdır: 110 / 2 = 55°.', 1);
g.q('cember-daire', 'Yarıçapı 6 cm olan bir dairede merkez açısı 60° olan daire diliminin alanı kaç cm²\'dir?', ['3π', '6π', '9π', '12π', '36π'], 'B', '36π · 60/360 = 6π.', 1);
g.q('cember-daire', 'Bir çemberde çapı gören çevre açı kaç derecedir?', ['45', '60', '90', '120', '180'], 'C', 'Çap 180°\'lik yayı görür; çevre açı bunun yarısı olan 90°\'dir.', 1);
g.q('cember-daire', 'Yarıçapı 5 cm olan bir çemberde merkeze uzaklığı 3 cm olan kirişin uzunluğu kaç cm\'dir?', ['4', '6', '7', '8', '10'], 'D', 'Kirişin yarısı √(25 − 9) = 4 → kiriş 8 cm.', 2);

g.lesson(
  'dogru-analitik',
  10,
  'İki nokta arası uzaklık, orta nokta, eğim, doğru denklemi ve noktanın doğruya uzaklığı.',
  [
    F('Noktalar', '|AB| = √((x₂ − x₁)² + (y₂ − y₁)²)', 'Orta nokta: ((x₁ + x₂)/2 , (y₁ + y₂)/2)'),
    F('Doğru', 'Eğim: m = (y₂ − y₁) / (x₂ − x₁)', 'Denklem: y − y₁ = m(x − x₁)', 'ax + by + c = 0 doğrusunun eğimi: −a / b'),
    UL('Paralel doğrular: m₁ = m₂', 'Dik doğrular: m₁ · m₂ = −1'),
    F('Noktanın doğruya uzaklığı', 'd = |a·x₀ + b·y₀ + c| / √(a² + b²)'),
    PLOT('y = 2x + 1 (mavi) ile ona dik olan y = −x/2 + 3 (turuncu). Eğimlerin çarpımı 2 · (−1/2) = −1.', [-3, 4], [-3, 6],
      { label: 'y = 2x + 1', f: (x) => 2 * x + 1 },
      { label: 'y = −x/2 + 3', f: (x) => -x / 2 + 3 },
    ),
    EX('Orijinin 3x + 4y − 10 = 0 doğrusuna uzaklığı kaç birimdir?', ['d = |3·0 + 4·0 − 10| / √(9 + 16)', '= 10 / 5'], '2 birim'),
  ],
  [card('Dik doğrular', 'm₁ · m₂ = −1'), card('Noktanın doğruya uzaklığı', '|ax₀ + by₀ + c| / √(a² + b²)')],
);

g.q('dogru-analitik', 'A(1, 2) ve B(4, 6) noktaları arasındaki uzaklık kaç birimdir?', ['3', '4', '5', '6', '7'], 'C', '√(3² + 4²) = √25 = 5.', 1);
g.q('dogru-analitik', 'A(2, 3) ve B(6, −1) noktalarını birleştiren doğru parçasının orta noktası aşağıdakilerden hangisidir?', ['(4, 2)', '(4, 1)', '(2, 1)', '(8, 2)', '(3, 1)'], 'B', '((2 + 6)/2, (3 − 1)/2) = (4, 1).', 1);
g.q('dogru-analitik', 'y = 2x + 1 doğrusuna dik olan bir doğrunun eğimi kaçtır?', ['−2', '−1/2', '1/2', '1', '2'], 'B', 'Dik doğrularda m₁ · m₂ = −1 → 2 · m = −1 → m = −1/2.', 1);
g.q('dogru-analitik', 'Orijinin 3x + 4y − 10 = 0 doğrusuna uzaklığı kaç birimdir?', ['1', '3/2', '2', '5/2', '10'], 'C', 'd = |−10| / √(9 + 16) = 10 / 5 = 2.', 2);

export default [m.done(), g.done()];
