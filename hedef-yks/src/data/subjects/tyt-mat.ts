import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../build.ts';

const b = builder('tyt-mat');

// ── Temel Kavramlar ─────────────────────────────────────────────
b.lesson(
  'temel-kavramlar',
  9,
  'Sayı kümeleri, tek-çift, asal sayılar ve ardışık sayılar: TYT matematiğin temeli.',
  [
    H('Sayı kümeleri'),
    TABLE(
      ['Küme', 'Sembol', 'Örnek'],
      ['Doğal sayılar', 'ℕ', '0, 1, 2, 3, …'],
      ['Tam sayılar', 'ℤ', '…, −2, −1, 0, 1, 2, …'],
      ['Rasyonel sayılar', 'ℚ', 'a/b (b ≠ 0): 3/4, −2, 0,5'],
      ['İrrasyonel sayılar', 'ℚ′', '√2, π, e'],
      ['Gerçek sayılar', 'ℝ', 'Rasyonel ∪ İrrasyonel'],
    ),
    TIP('0 bir doğal sayıdır ve çift sayıdır. 1 asal değildir. En küçük asal sayı 2\'dir ve tek çift asal da odur.', 'warn'),
    H('Tek ve çift sayılar'),
    F('İşlem kuralları', 'Ç ± Ç = Ç    T ± T = Ç    T ± Ç = T', 'Ç · (herhangi) = Ç    T · T = T', 'Tⁿ = T    Çⁿ = Ç (n pozitif tam sayı)'),
    H('Asal sayılar'),
    P('1 ve kendisinden başka pozitif böleni olmayan, 1\'den büyük doğal sayılara asal sayı denir. 30\'a kadar olan asallar: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.'),
    H('Ardışık sayılar'),
    F('Formüller', 'Ardışık tam sayılar: n, n+1, n+2, …', 'Ardışık çift/tek sayılar: n, n+2, n+4, …', '1 + 2 + … + n = n(n+1)/2', 'Terim sayısı = (Son − İlk) / Artış + 1'),
    EX('Ardışık üç tek sayının toplamı 63 ise en büyüğü kaçtır?', ['Ortadakini x alalım: (x−2) + x + (x+2) = 63', '3x = 63 → x = 21', 'En büyüğü x + 2 = 23'], '23'),
    TIP('Ardışık sayılarda ortadaki terimi bilinmeyen seçmek işlemi kısaltır: toplam = terim sayısı × ortanca.'),
  ],
  [
    card('En küçük asal', '2 — tek çift asal sayı. 1 asal değildir.'),
    card('1 + 2 + … + n', 'n(n+1) / 2'),
    card('Terim sayısı', '(Son − İlk) / Artış + 1'),
  ],
);

b.q('temel-kavramlar', 'a, b ve c birbirinden farklı rakamlar olmak üzere a + b + c toplamının alabileceği en büyük değer kaçtır?', ['22', '23', '24', '25', '27'], 'C', 'En büyük üç farklı rakam 9, 8 ve 7\'dir: 9 + 8 + 7 = 24.', 1);
b.q('temel-kavramlar', 'Ardışık üç tek sayının toplamı 63 olduğuna göre en büyüğü kaçtır?', ['19', '21', '23', '25', '27'], 'C', '(x − 2) + x + (x + 2) = 3x = 63 → x = 21. En büyüğü 21 + 2 = 23.', 1);
b.q('temel-kavramlar', '1\'den 30\'a kadar (30 dahil) kaç tane asal sayı vardır?', ['8', '9', '10', '11', '12'], 'C', '2, 3, 5, 7, 11, 13, 17, 19, 23, 29 → toplam 10 asal sayı.', 1);
b.q('temel-kavramlar', 'x ve y pozitif tam sayılar ve x · y = 12 olduğuna göre x + y toplamının alabileceği en küçük değer kaçtır?', ['5', '6', '7', '8', '13'], 'C', 'Çarpanlar birbirine ne kadar yakınsa toplam o kadar küçük olur: 3 · 4 = 12 → 3 + 4 = 7. (2 + 6 = 8, 1 + 12 = 13)', 2);
b.q('temel-kavramlar', 'a ve b tam sayılar olmak üzere a + b tek sayı ise aşağıdakilerden hangisi kesinlikle çift sayıdır?', ['a', 'b', 'a · b', 'a + 2b', '2a + b'], 'C', 'a + b tek ise biri tek, diğeri çifttir. Çarpımda bir çift çarpan olduğu için a · b her zaman çifttir.', 2);

// ── Üslü Sayılar ────────────────────────────────────────────────
b.lesson(
  'uslu',
  9,
  'Üslü ifadelerde çarpma, bölme, kuvvetin kuvveti ve negatif tabanlarla ilgili kuralları kavrıyoruz.',
  [
    H('Tanım'),
    P('aⁿ, a sayısının n kez kendisiyle çarpımıdır. a taban, n üs (kuvvet) olarak adlandırılır.'),
    F('Temel kurallar', 'aᵐ · aⁿ = aᵐ⁺ⁿ', 'aᵐ / aⁿ = aᵐ⁻ⁿ', '(aᵐ)ⁿ = aᵐ·ⁿ', '(a · b)ⁿ = aⁿ · bⁿ', 'a⁰ = 1 (a ≠ 0)', 'a⁻ⁿ = 1 / aⁿ'),
    H('Negatif taban'),
    UL('(−a)ⁿ: n çift ise pozitif, n tek ise negatiftir.', '−aⁿ ile (−a)ⁿ farklıdır: −2⁴ = −16, (−2)⁴ = 16.', '(−1)ⁿ: n çiftse 1, tekse −1.'),
    TIP('Parantez tuzağı sınavın klasiğidir: üs yalnızca hemen önündeki sayıya ya da paranteze aittir.', 'warn'),
    H('Üslü denklemler'),
    P('Tabanlar eşitlenebiliyorsa üsler eşitlenir: aˣ = aʸ ⇒ x = y (a ≠ 0, 1, −1).'),
    EX('5²ˣ⁻¹ = 125 ise x kaçtır?', ['125 = 5³ olduğundan 5²ˣ⁻¹ = 5³', '2x − 1 = 3', 'x = 2'], 'x = 2'),
    H('Sıralama'),
    P('Üsleri eşitlemek ya da tabanları eşitlemek sıralamayı kolaylaştırır: 2³⁰ = 8¹⁰, 3²⁰ = 9¹⁰, 5¹⁰ → 5¹⁰ < 8¹⁰ < 9¹⁰.'),
    PLOT('Üstel büyüme: y = 2ˣ ile y = 3ˣ. Taban büyüdükçe eğri daha hızlı yükselir; ikisi de (0, 1) noktasından geçer.', [-2, 2.5], [0, 9],
      { label: 'y = 2ˣ', f: (x) => 2 ** x },
      { label: 'y = 3ˣ', f: (x) => 3 ** x },
    ),
  ],
  [
    card('aᵐ · aⁿ', 'aᵐ⁺ⁿ'),
    card('(aᵐ)ⁿ', 'aᵐ·ⁿ'),
    card('−2⁴ ile (−2)⁴', '−16 ve 16 — parantez fark yaratır.'),
  ],
);

b.q('uslu', '(2⁵ · 2³) / 2⁶ işleminin sonucu kaçtır?', ['2', '4', '8', '16', '32'], 'B', '2⁵ · 2³ = 2⁸; 2⁸ / 2⁶ = 2² = 4.', 1);
b.q('uslu', '(−2)⁴ − 2⁴ işleminin sonucu kaçtır?', ['−32', '−16', '0', '16', '32'], 'C', '(−2)⁴ = 16 (çift kuvvet) ve 2⁴ = 16; fark 0\'dır.', 1);
b.q('uslu', '5²ˣ⁻¹ = 125 olduğuna göre x kaçtır?', ['1', '2', '3', '4', '5'], 'B', '125 = 5³ → 2x − 1 = 3 → x = 2.', 1);
b.q('uslu', '8⁴ / 4⁵ işleminin sonucu kaçtır?', ['1/2', '1', '2', '4', '8'], 'D', '8⁴ = 2¹², 4⁵ = 2¹⁰ → 2¹² / 2¹⁰ = 2² = 4.', 2);
b.q('uslu', 'a = 2³⁰, b = 3²⁰, c = 5¹⁰ olduğuna göre aşağıdaki sıralamalardan hangisi doğrudur?', ['a < b < c', 'c < a < b', 'b < a < c', 'c < b < a', 'a < c < b'], 'B', 'Üsleri 10\'da eşitleyelim: a = 8¹⁰, b = 9¹⁰, c = 5¹⁰. Tabanlar sıralanır: c < a < b.', 3);

// ── Yüzde, Kâr – Zarar ──────────────────────────────────────────
b.lesson(
  'yuzde-kar-zarar',
  9,
  'Yüzde hesabı, art arda zam-indirim ve kâr-zarar problemlerini tek bir yöntemle çözeceğiz.',
  [
    H('Yüzde'),
    F('Temel', 'x\'in %a\'sı = x · a / 100', '%a zam → yeni fiyat = x · (100 + a) / 100', '%a indirim → yeni fiyat = x · (100 − a) / 100'),
    TIP('Ürünün fiyatını 100 kabul etmek, yüzde sorularında en hızlı çözüm yoludur.'),
    H('Art arda zam ve indirim'),
    P('Önce %20 zam sonra %20 indirim yapılırsa fiyat eski hâline dönmez: 100 → 120 → 96. Son fiyat ilk fiyattan %4 azdır, çünkü ikinci yüzde daha büyük bir sayı üzerinden hesaplanır.'),
    FLOW('100 TL\'lik ürün', '100 TL', '%20 zam → 120 TL', '%20 indirim → 96 TL', 'Sonuç: %4 ucuzladı'),
    H('Kâr ve zarar'),
    F('Kâr – zarar', 'Kâr = Satış − Maliyet', 'Kâr yüzdesi = Kâr / Maliyet · 100', 'Satış = Maliyet · (100 + kâr%) / 100'),
    TIP('Aksi belirtilmedikçe kâr ve zarar yüzdesi her zaman MALİYET (alış fiyatı) üzerinden hesaplanır.', 'warn'),
    EX('Maliyeti 400 TL olan bir ürün %25 kârla satılırsa satış fiyatı kaç TL olur?', ['Kâr = 400 · 25 / 100 = 100 TL', 'Satış = 400 + 100 = 500 TL'], '500 TL'),
  ],
  [
    card('%20 zam + %20 indirim', '100 → 120 → 96: net %4 azalma'),
    card('Kâr yüzdesi', 'Kâr / Maliyet × 100 (maliyet üzerinden)'),
  ],
);

b.q('yuzde-kar-zarar', 'Maliyeti 400 TL olan bir ürün %25 kârla satılırsa satış fiyatı kaç TL olur?', ['425', '450', '475', '500', '525'], 'D', '400 · 125 / 100 = 500 TL.', 1);
b.q('yuzde-kar-zarar', 'Bir ürünün fiyatına önce %20 zam, ardından %20 indirim yapılıyor. Ürünün son fiyatı ilk fiyatına göre nasıl değişmiştir?', ['Değişmemiştir.', '%4 ucuzlamıştır.', '%4 pahalanmıştır.', '%2 ucuzlamıştır.', '%20 ucuzlamıştır.'], 'B', '100 → 120 → 120 · 0,8 = 96. Son fiyat 100\'den 4 eksik: %4 ucuzlama.', 2);
b.q('yuzde-kar-zarar', 'Bir sayının %30\'u 45 olduğuna göre bu sayının %50\'si kaçtır?', ['60', '65', '70', '75', '90'], 'D', 'Sayı = 45 · 100 / 30 = 150. %50\'si = 75.', 1);
b.q('yuzde-kar-zarar', 'Bir satıcı 240 TL\'ye aldığı malı 180 TL\'ye satarsa yüzde kaç zarar etmiş olur?', ['15', '20', '25', '30', '33'], 'C', 'Zarar = 60 TL. Zarar yüzdesi = 60 / 240 · 100 = 25.', 1);
b.q('yuzde-kar-zarar', 'Bir mağaza, etiket fiyatı üzerinden %30 indirim yaptığında bir üründen yine de %5 kâr ediyor. Bu ürünün maliyeti 400 TL ise etiket fiyatı kaç TL\'dir?', ['560', '580', '600', '620', '640'], 'C', 'Satış = 400 · 1,05 = 420 TL. Bu tutar etiketin %70\'idir: etiket = 420 / 0,7 = 600 TL.', 3);

// ── Olasılık ────────────────────────────────────────────────────
b.lesson(
  'olasilik',
  8,
  'Bir olayın olma şansını 0 ile 1 arasında bir sayıyla ifade etmeyi öğreneceğiz.',
  [
    H('Temel kavramlar'),
    UL('Deney: Sonucu önceden kesin bilinmeyen işlem (zar atmak).', 'Örnek uzay (E): Tüm olası sonuçların kümesi.', 'Olay (A): Örnek uzayın bir alt kümesi.'),
    F('Olasılık', 'P(A) = s(A) / s(E)', '0 ≤ P(A) ≤ 1', 'P(A′) = 1 − P(A)  (tümleyen)'),
    H('Bileşik olaylar'),
    UL('Ayrık olaylar (aynı anda olamaz): P(A ∪ B) = P(A) + P(B)', 'Genel: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', 'Bağımsız olaylar: P(A ∩ B) = P(A) · P(B)'),
    TIP('"En az bir" ifadesi gördüğünüzde tümleyenle çalışın: P(en az bir) = 1 − P(hiç).'),
    EX('İki madenî para atılıyor. En az birinin tura gelme olasılığı nedir?', ['Hiç tura gelmemesi: YY → 1/4', 'P(en az bir T) = 1 − 1/4'], '3/4'),
    TABLE(['İki zar: toplam', 'Durum sayısı'], ['2 veya 12', '1'], ['3 veya 11', '2'], ['4 veya 10', '3'], ['5 veya 9', '4'], ['6 veya 8', '5'], ['7', '6']),
  ],
  [card('"En az bir"', '1 − P(hiç)'), card('İki zarda toplam 7', '6/36 = 1/6 (en olası toplam)')],
);

b.q('olasilik', 'Bir zar atıldığında üst yüze asal sayı gelme olasılığı kaçtır?', ['1/6', '1/3', '1/2', '2/3', '5/6'], 'C', 'Asal sayılar 2, 3, 5 → 3 durum. 3/6 = 1/2.', 1);
b.q('olasilik', 'İki madenî para birlikte atılıyor. En az birinin tura gelme olasılığı kaçtır?', ['1/4', '1/3', '1/2', '2/3', '3/4'], 'E', 'Hiç tura gelmeme (YY) olasılığı 1/4; tümleyeni 1 − 1/4 = 3/4.', 1);
b.q('olasilik', 'Bir torbada 3 kırmızı ve 5 mavi top vardır. Rastgele çekilen bir topun kırmızı olma olasılığı kaçtır?', ['1/8', '3/8', '1/2', '5/8', '3/5'], 'B', 'Toplam 8 top, 3\'ü kırmızı: 3/8.', 1);
b.q('olasilik', 'İki zar birlikte atılıyor. Üst yüzlerdeki sayıların toplamının 7 olma olasılığı kaçtır?', ['1/12', '1/9', '1/6', '7/36', '1/4'], 'C', '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) → 6 durum. 6/36 = 1/6.', 2);
b.q('olasilik', 'Bir torbada 2 beyaz ve 3 siyah top vardır. Torbadan geri bırakılmadan art arda iki top çekiliyor. İkisinin de siyah olma olasılığı kaçtır?', ['3/10', '9/25', '2/5', '3/5', '1/5'], 'A', 'İlk çekiliş 3/5, ikincisi (geriye 2 siyah, 4 top) 2/4. Çarpım: 3/5 · 1/2 = 3/10.', 3);

export default b.done();
