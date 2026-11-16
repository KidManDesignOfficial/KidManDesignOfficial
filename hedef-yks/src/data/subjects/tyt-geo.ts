import { EX, F, H, P, TABLE, TIP, UL, builder, card } from '../build.ts';

const b = builder('tyt-geo');

b.lesson(
  'acilar',
  8,
  'Tümler-bütünler açılar, paralel doğrularda açılar ve üçgenin iç-dış açı bağıntıları.',
  [
    H('Açı çeşitleri'),
    TABLE(['Açı', 'Ölçü'], ['Dar açı', '0° < α < 90°'], ['Dik açı', '90°'], ['Geniş açı', '90° < α < 180°'], ['Doğru açı', '180°'], ['Tam açı', '360°']),
    F('Tümler ve bütünler', 'Tümler açılar: α + β = 90°', 'Bütünler açılar: α + β = 180°', 'Ters açılar birbirine eşittir.'),
    H('Paralel iki doğru ve bir kesen'),
    UL('Yöndeş açılar eşittir.', 'İç ters (Z kuralı) açılar eşittir.', 'Karşı durumlu iç açıların toplamı 180°\'dir (U kuralı).'),
    H('Üçgende açılar'),
    F('Üçgen', 'İç açılar toplamı: 180°', 'Bir dış açı = kendisine komşu olmayan iki iç açının toplamı', 'Dış açılar toplamı: 360°'),
    TIP('Büyük açının karşısında büyük kenar bulunur. Bu bağıntı kenar sıralama sorularının anahtarıdır.'),
    EX('Bütünleri, tümlerinin 4 katı olan açı kaç derecedir?', ['Açı x olsun: 180 − x = 4(90 − x)', '180 − x = 360 − 4x', '3x = 180 → x = 60'], '60°'),
  ],
  [card('Dış açı kuralı', 'Komşu olmayan iki iç açının toplamına eşittir.'), card('Tümler / bütünler', '90° / 180°')],
);

b.q('acilar', 'Tümleri kendisinin 2 katı olan açı kaç derecedir?', ['15', '20', '30', '45', '60'], 'C', 'x + 2x = 90 → x = 30°.', 1);
b.q('acilar', 'Bir üçgenin iç açıları 2, 3 ve 4 sayılarıyla orantılıdır. Bu üçgenin en büyük iç açısı kaç derecedir?', ['50', '60', '70', '80', '90'], 'D', '2k + 3k + 4k = 180 → k = 20. En büyük açı 4k = 80°.', 1);
b.q('acilar', 'Bir üçgende iki iç açının ölçüsü 50° ve 65°\'dir. Üçüncü köşedeki dış açı kaç derecedir?', ['105', '110', '115', '120', '130'], 'C', 'Dış açı, komşu olmayan iki iç açının toplamıdır: 50 + 65 = 115°.', 1);
b.q('acilar', 'Bütünleri, tümlerinin 4 katı olan açı kaç derecedir?', ['30', '45', '50', '60', '75'], 'D', '180 − x = 4(90 − x) → 3x = 180 → x = 60°.', 2);

b.lesson(
  'dik-ucgen',
  9,
  'Pisagor bağıntısı, özel dik üçgenler ve Öklid bağıntılarıyla dik üçgen sorularını hızla çözüyoruz.',
  [
    H('Pisagor teoremi'),
    P('Dik üçgende hipotenüs (dik açının karşısındaki en uzun kenar) c, dik kenarlar a ve b ise:'),
    F(undefined, 'a² + b² = c²'),
    H('Sık kullanılan Pisagor üçlüleri'),
    TABLE(['Üçlü', 'Katları'], ['3 – 4 – 5', '6-8-10, 9-12-15'], ['5 – 12 – 13', '10-24-26'], ['8 – 15 – 17', '16-30-34'], ['7 – 24 – 25', '14-48-50']),
    TIP('Üçlüleri ezberlemek hem zaman kazandırır hem de işlem hatasını önler.'),
    H('Öklid bağıntıları'),
    P('Hipotenüse ait yükseklik h, hipotenüsü p ve k parçalarına ayırsın:'),
    F('Öklid', 'h² = p · k', 'a² = p · c   ve   b² = k · c', 'a · b = c · h'),
    H('Özel dik üçgenler'),
    UL('30° – 60° – 90° üçgeninde kenarlar: x, x√3, 2x', '45° – 45° – 90° üçgeninde kenarlar: x, x, x√2'),
    EX('Hipotenüsü 13 cm, bir dik kenarı 5 cm olan dik üçgenin alanı kaç cm²\'dir?', ['5 – 12 – 13 üçlüsünden diğer dik kenar 12 cm.', 'Alan = (5 · 12) / 2'], '30 cm²'),
  ],
  [card('Öklid yükseklik', 'h² = p · k'), card('30-60-90', 'x, x√3, 2x'), card('45-45-90', 'x, x, x√2')],
);

b.q('dik-ucgen', 'Dik kenarları 6 cm ve 8 cm olan bir dik üçgenin hipotenüsü kaç cm\'dir?', ['9', '10', '11', '12', '14'], 'B', '6² + 8² = 36 + 64 = 100 → c = 10 (3-4-5 üçlüsünün 2 katı).', 1);
b.q('dik-ucgen', 'Hipotenüsü 13 cm, bir dik kenarı 5 cm olan dik üçgenin alanı kaç cm²\'dir?', ['20', '26', '30', '32', '60'], 'C', 'Diğer dik kenar 12 cm (5-12-13). Alan = 5 · 12 / 2 = 30.', 1);
b.q('dik-ucgen', 'Bir dik üçgende hipotenüse ait yükseklik hipotenüsü 4 cm ve 9 cm uzunluğunda iki parçaya ayırıyor. Bu yükseklik kaç cm\'dir?', ['5', '6', '6,5', '7', '8'], 'B', 'Öklid bağıntısı: h² = 4 · 9 = 36 → h = 6.', 2);
b.q('dik-ucgen', 'Kenar uzunlukları 7, 24 ve 25 birim olan bir üçgenin alanı kaç birimkaredir?', ['56', '72', '84', '96', '168'], 'C', '7² + 24² = 625 = 25² olduğu için üçgen diktir. Alan = 7 · 24 / 2 = 84.', 2);
b.q('dik-ucgen', 'Bir 30° – 60° – 90° üçgeninde 30°\'lik açının karşısındaki kenar 4 cm ise hipotenüs kaç cm\'dir?', ['4', '4√2', '4√3', '6', '8'], 'E', '30°\'nin karşısı x, hipotenüs 2x\'tir. x = 4 → hipotenüs 8 cm.', 1);

export default b.done();
