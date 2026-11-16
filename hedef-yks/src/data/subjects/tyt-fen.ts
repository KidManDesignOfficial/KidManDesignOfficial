/** TYT Fen Bilimleri: Fizik, Kimya, Biyoloji. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../build.ts';

// ═════════════════════════════ FİZİK ═════════════════════════════
const fz = builder('tyt-fizik');

fz.lesson(
  'hareket-kuvvet',
  10,
  'Konum, hız, ivme kavramları ve Newton\'un üç hareket yasasıyla kuvvet-hareket ilişkisi.',
  [
    H('Temel kavramlar'),
    TABLE(
      ['Büyüklük', 'Tür', 'Birim'],
      ['Alınan yol', 'Skaler', 'm'],
      ['Yer değiştirme', 'Vektörel', 'm'],
      ['Sürat = yol / zaman', 'Skaler', 'm/s'],
      ['Hız = yer değiştirme / zaman', 'Vektörel', 'm/s'],
      ['İvme = Δv / Δt', 'Vektörel', 'm/s²'],
    ),
    TIP('Başladığı noktaya geri dönen bir cismin yer değiştirmesi ve ortalama hızı sıfırdır; ama aldığı yol ve ortalama sürati sıfır değildir.', 'warn'),
    H('Grafikler'),
    P('Konum-zaman grafiğinin eğimi hızı, hız-zaman grafiğinin eğimi ivmeyi, hız-zaman grafiğinin altındaki alan ise yer değiştirmeyi verir.'),
    PLOT('Konum-zaman grafiği: eğim ne kadar dikse hız o kadar büyüktür. Turuncu cisim maviden iki kat hızlıdır.', [0, 5], [0, 10],
      { label: 'v = 1 m/s', f: (t) => t },
      { label: 'v = 2 m/s', f: (t) => 2 * t },
    ),
    H('Newton\'un hareket yasaları'),
    UL(
      '1. Eylemsizlik: Net kuvvet sıfırsa cisim durumunu korur (durur ya da sabit hızla gider).',
      '2. Temel yasa: F(net) = m · a',
      '3. Etki-tepki: A, B\'ye kuvvet uygularsa B de A\'ya eşit büyüklükte ve zıt yönde kuvvet uygular. Bu kuvvetler FARKLI cisimlere etki eder.',
    ),
    F('Formüller', 'x = v · t (sabit hız)', 'v = v₀ + a · t', 'F = m · a', 'Ağırlık G = m · g'),
    EX('Kütlesi 4 kg olan bir cisme 20 N net kuvvet etki ediyor. İvmesi kaç m/s² olur?', ['F = m · a → 20 = 4 · a', 'a = 5'], '5 m/s²'),
  ],
  [card('Etki-tepki çifti', 'Farklı cisimlere etki eder; birbirini dengelemez.'), card('v-t grafiği altındaki alan', 'Yer değiştirme')],
);

fz.q('hareket-kuvvet', 'Doğrusal bir yolda 20 m/s sabit hızla giden bir araç 3 dakikada kaç km yol alır?', ['0,6', '1,2', '3,6', '6', '60'], 'C', '3 dk = 180 s. Yol = 20 · 180 = 3600 m = 3,6 km.', 1);
fz.q('hareket-kuvvet', 'Durgun hâlden 2 m/s² sabit ivmeyle hızlanan bir cismin 5. saniyenin sonundaki hızı kaç m/s olur?', ['2', '5', '7', '10', '25'], 'D', 'v = v₀ + a · t = 0 + 2 · 5 = 10 m/s.', 1);
fz.q('hareket-kuvvet', 'Kütlesi 4 kg olan bir cisme 20 N büyüklüğünde net kuvvet etki etmektedir. Cismin ivmesi kaç m/s²\'dir?', ['0,2', '4', '5', '16', '80'], 'C', 'a = F / m = 20 / 4 = 5 m/s².', 1);
fz.q('hareket-kuvvet', 'Yatay bir masa üzerinde duran kitaba etki eden yer çekimi kuvvetinin (ağırlığın) tepki kuvveti aşağıdakilerden hangisidir?', [
  'Masanın kitaba uyguladığı tepki kuvveti',
  'Kitabın Dünya\'yı çekme kuvveti',
  'Kitabın masaya uyguladığı kuvvet',
  'Masa ile kitap arasındaki sürtünme kuvveti',
  'Havanın kitaba uyguladığı kaldırma kuvveti',
], 'B', 'Dünya kitabı çekiyorsa, etki-tepki yasasına göre kitap da Dünya\'yı aynı büyüklükte çeker. Masanın tepkisi ağırlığı dengeler ama ağırlığın tepkisi değildir; çünkü ikisi de aynı cisme (kitaba) etki eder.', 3);
fz.q('hareket-kuvvet', '400 m\'lik dairesel bir pistte bir tur atarak başladığı noktaya 80 saniyede dönen koşucunun yer değiştirmesi ve ortalama sürati nedir?', ['0 m — 0 m/s', '0 m — 5 m/s', '400 m — 5 m/s', '400 m — 0 m/s', '200 m — 2,5 m/s'], 'B', 'Başladığı noktaya döndüğü için yer değiştirme 0. Ortalama sürat = yol / zaman = 400 / 80 = 5 m/s.', 2);

fz.lesson(
  'elektrik-akimi',
  9,
  'Akım, potansiyel farkı ve direnç arasındaki Ohm bağıntısı; seri-paralel devreler ve elektriksel güç.',
  [
    H('Temel büyüklükler'),
    F('Tanımlar', 'Akım: I = q / t   (amper, A)', 'Ohm yasası: V = I · R', 'Telin direnci: R = ρ · L / A'),
    P('Direnç, telin boyu (L) ile doğru, kesit alanı (A) ile ters orantılıdır; ρ telin cinsine bağlı özdirençtir.'),
    H('Dirençlerin bağlanması'),
    TABLE(['', 'Seri', 'Paralel'], ['Eşdeğer', 'R = R₁ + R₂ + …', '1/R = 1/R₁ + 1/R₂ + …'], ['Akım', 'Her dirençte aynı', 'Dallara bölünür'], ['Gerilim', 'Dirençlere bölünür', 'Her dalda aynı']),
    TIP('İki paralel direnç için kısa yol: R = (R₁ · R₂) / (R₁ + R₂). Eşit n direnç paralel ise R/n.'),
    H('Elektriksel güç ve enerji'),
    F('Güç', 'P = V · I = I² · R = V² / R', 'Enerji: E = P · t'),
    EX('Telin boyu iki katına, kesit alanı yarıya indirilirse direnci kaç katına çıkar?', ['R = ρL/A', 'Yeni: ρ(2L)/(A/2) = 4 · ρL/A'], '4 katına'),
    FLOW('Devre çözme sırası', 'Eşdeğer direnci bul', 'Ana akımı hesapla: I = V / R', 'Seri parçalarda gerilimi, paralel kollarda akımı paylaştır'),
  ],
  [card('Ohm yasası', 'V = I · R'), card('İki paralel direnç', '(R₁·R₂)/(R₁+R₂)'), card('Güç', 'P = I²R = V²/R')],
);

fz.q('elektrik-akimi', 'Potansiyel farkı 12 V olan bir üretece 4 Ω\'luk bir direnç bağlanıyor. Devreden geçen akım kaç A\'dir?', ['0,33', '3', '8', '16', '48'], 'B', 'I = V / R = 12 / 4 = 3 A.', 1);
fz.q('elektrik-akimi', '3 Ω ve 6 Ω\'luk iki direnç paralel bağlanırsa eşdeğer direnç kaç Ω olur?', ['1', '1,5', '2', '4,5', '9'], 'C', 'R = (3 · 6) / (3 + 6) = 18 / 9 = 2 Ω.', 1);
fz.q('elektrik-akimi', '2 Ω, 3 Ω ve 5 Ω\'luk dirençler seri bağlanarak 20 V\'luk üretece bağlanıyor. Devreden geçen akım kaç A\'dir?', ['1', '2', '4', '5', '10'], 'B', 'Eşdeğer direnç 10 Ω. I = 20 / 10 = 2 A.', 1);
fz.q('elektrik-akimi', 'Direnci R olan bir telin boyu iki katına çıkarılıp kesit alanı yarıya indirilirse telin yeni direnci ne olur?', ['R/4', 'R/2', 'R', '2R', '4R'], 'E', 'R = ρL/A. Boy 2 kat (×2), alan yarı (×2) → direnç 4R.', 2);
fz.q('elektrik-akimi', 'Üzerinden 2 A akım geçen 5 Ω\'luk bir direncin harcadığı güç kaç W\'tır?', ['10', '20', '25', '40', '50'], 'B', 'P = I² · R = 4 · 5 = 20 W.', 1);

// ═════════════════════════════ KİMYA ═════════════════════════════
const km = builder('tyt-kimya');

km.lesson(
  'atom-periyodik',
  10,
  'Atomun yapısı, izotop-izoton-izobar kavramları ve periyodik tabloda özelliklerin değişimi.',
  [
    H('Atomun yapısı'),
    TABLE(['Tanecik', 'Yük', 'Yeri'], ['Proton (p)', '+1', 'Çekirdek'], ['Nötron (n)', '0', 'Çekirdek'], ['Elektron (e)', '−1', 'Katmanlar']),
    F('Gösterim  ᴬ_Z X', 'Atom numarası Z = proton sayısı', 'Kütle numarası A = p + n', 'Nötr atomda e = p;  iyonda e = p − yük'),
    H('Benzer atomlar'),
    UL('İzotop: Proton sayısı aynı, nötron sayısı farklı (kimyasal özellik aynı).', 'İzoton: Nötron sayısı aynı.', 'İzobar: Kütle numarası aynı.', 'İzoelektronik: Elektron sayısı ve dizilimi aynı tanecikler.'),
    H('Periyodik tablo'),
    P('Yatay sıralar periyot (katman sayısı), dikey sütunlar grup (değerlik elektron sayısı) olarak adlandırılır. Atom numarası 12 olan elementin dizilimi 2-8-2\'dir: 3 katman → 3. periyot, 2 değerlik elektronu → 2A grubu.'),
    TABLE(['Özellik', 'Periyotta soldan sağa', 'Grupta yukarıdan aşağı'], ['Atom yarıçapı', 'Azalır', 'Artar'], ['İyonlaşma enerjisi', 'Genel olarak artar', 'Azalır'], ['Elektronegatiflik', 'Artar', 'Azalır'], ['Metalik özellik', 'Azalır', 'Artar']),
    TIP('Soy gazlar (8A) kararlıdır; elektronegatiflik değeri genellikle verilmez. Periyot boyunca 2A→3A ve 5A→6A geçişlerinde iyonlaşma enerjisi istisna olarak düşer.', 'info'),
  ],
  [card('İzotop', 'Aynı proton, farklı nötron'), card('Yarıçap eğilimi', 'Sağa doğru azalır, aşağı doğru artar')],
);

km.q('atom-periyodik', '₁₁Na⁺ iyonunun elektron sayısı kaçtır?', ['9', '10', '11', '12', '23'], 'B', 'Na\'nın 11 protonu vardır. +1 yük 1 elektron kaybedildiğini gösterir: 11 − 1 = 10.', 1);
km.q('atom-periyodik', '²³₁₁Na atomunun nötron sayısı kaçtır?', ['10', '11', '12', '23', '34'], 'C', 'n = A − Z = 23 − 11 = 12.', 1);
km.q('atom-periyodik', 'İzotop atomlar için aşağıdakilerden hangisi kesinlikle aynıdır?', ['Kütle numarası', 'Nötron sayısı', 'Fiziksel özellikleri', 'Proton sayısı', 'Nükleon sayısı'], 'D', 'İzotoplar aynı elementin atomlarıdır; proton sayıları aynı, nötron ve kütle numaraları farklıdır.', 1);
km.q('atom-periyodik', 'Atom numarası 12 olan elementin periyodik tablodaki yeri aşağıdakilerden hangisidir?', ['2. periyot 2A', '3. periyot 2A', '2. periyot 3A', '3. periyot 3A', '4. periyot 2A'], 'B', 'Dizilim 2-8-2: üç katman → 3. periyot; değerlik elektronu 2 → 2A grubu.', 2);
km.q('atom-periyodik', 'Periyodik tabloda aynı periyotta soldan sağa doğru gidildikçe aşağıdakilerden hangisi genellikle azalır?', ['İyonlaşma enerjisi', 'Elektronegatiflik', 'Atom yarıçapı', 'Proton sayısı', 'Ametalik özellik'], 'C', 'Proton sayısı arttıkça çekirdek elektronları daha güçlü çeker; katman sayısı değişmediği için yarıçap küçülür.', 1);

km.lesson(
  'mol',
  9,
  'Mol, kütle, tanecik sayısı ve gaz hacmi arasında geçiş yapmayı öğreniyoruz.',
  [
    H('Mol nedir?'),
    P('1 mol, 6,02 · 10²³ (Avogadro sayısı, Nₐ) tane tanecik içeren madde miktarıdır. Bir maddenin 1 molünün gram cinsinden kütlesine mol kütlesi (MA) denir.'),
    F('Dönüşümler', 'n = m / MA', 'n = N / Nₐ', 'n = V / 22,4   (normal koşullarda gaz, L)'),
    FLOW('Hesap köprüsü', 'Kütle (g)', '÷ MA', 'MOL', '× 6,02·10²³ → tanecik  |  × 22,4 → NK hacmi'),
    TIP('Her soruda önce MOL\'e geçin. Mol, kütle-tanecik-hacim arasındaki köprüdür.'),
    H('Mol kütlesi hesaplama'),
    EX('CO₂\'nin mol kütlesi nedir? (C: 12, O: 16)', ['12 + 2 · 16 = 44'], '44 g/mol'),
    H('Molekül ve atom sayısı'),
    P('1 mol NH₃ molekülünde 1 mol N ve 3 mol H, yani toplam 4 mol atom bulunur.'),
  ],
  [card('Avogadro sayısı', '6,02 · 10²³'), card('NK\'da 1 mol gaz', '22,4 L')],
);

km.q('mol', '88 gram CO₂ kaç moldür? (C: 12, O: 16)', ['0,5', '1', '2', '4', '44'], 'C', 'MA = 44 g/mol. n = 88 / 44 = 2 mol.', 1);
km.q('mol', '0,5 mol H₂O kaç gramdır? (H: 1, O: 16)', ['4,5', '9', '16', '18', '36'], 'B', 'MA = 18 g/mol. m = 0,5 · 18 = 9 g.', 1);
km.q('mol', 'Normal koşullarda 11,2 L hacim kaplayan CH₄ gazı kaç gramdır? (C: 12, H: 1)', ['2', '4', '8', '16', '32'], 'C', 'n = 11,2 / 22,4 = 0,5 mol. MA = 16 → m = 8 g.', 2);
km.q('mol', '1 mol NH₃ molekülünde toplam kaç mol atom vardır?', ['1', '2', '3', '4', '6'], 'D', 'Her NH₃ molekülünde 1 N + 3 H = 4 atom vardır; 1 mol molekülde 4 mol atom bulunur.', 1);

// ═════════════════════════════ BİYOLOJİ ═════════════════════════════
const bi = builder('tyt-biyo');

bi.lesson(
  'hucre',
  10,
  'Prokaryot ve ökaryot hücre farkı, organellerin görevleri, bitki ve hayvan hücresi karşılaştırması.',
  [
    H('Hücre çeşitleri'),
    TABLE(['Özellik', 'Prokaryot', 'Ökaryot'], ['Çekirdek zarı', 'Yok', 'Var'], ['Zarlı organel', 'Yok', 'Var'], ['Ribozom', 'Var', 'Var'], ['Örnek', 'Bakteriler, arkeler', 'Bitki, hayvan, mantar, protist']),
    TIP('Ribozom, tüm canlı hücrelerde bulunan tek organeldir ve zarsızdır.'),
    H('Organeller ve görevleri'),
    TABLE(
      ['Organel', 'Görev'],
      ['Ribozom', 'Protein sentezi'],
      ['Mitokondri', 'Oksijenli solunum, ATP üretimi (kendi DNA ve ribozomu var)'],
      ['Kloroplast', 'Fotosentez (bitki ve bazı protistler; kendi DNA\'sı var)'],
      ['Golgi cisimciği', 'Paketleme, salgı, lizozom oluşturma'],
      ['Endoplazmik retikulum', 'Madde taşıma; granüllü ER protein, granülsüz ER lipit sentezi'],
      ['Lizozom', 'Hücre içi sindirim (çoğunlukla hayvan hücresi)'],
      ['Sentrozom', 'Hayvan hücresinde bölünmede iğ ipliklerini oluşturur'],
      ['Koful', 'Depolama; bitkide büyük merkezi koful'],
    ),
    H('Bitki ve hayvan hücresi'),
    UL('Yalnızca bitki hücresinde: hücre duvarı (selüloz), kloroplast, büyük merkezi koful.', 'Yalnızca hayvan hücresinde: sentrozom, (yaygın olarak) lizozom.'),
    TIP('Hücre duvarı yalnızca bitkiye özgü değildir: mantarlarda kitin, bakterilerde peptidoglikan yapılı duvar vardır.', 'warn'),
  ],
  [card('Tüm hücrelerde ortak organel', 'Ribozom'), card('Kendi DNA\'sı olan organeller', 'Mitokondri ve kloroplast')],
);

bi.q('hucre', 'Aşağıdaki organellerden hangisi tüm canlı hücrelerde bulunur?', ['Mitokondri', 'Ribozom', 'Kloroplast', 'Golgi cisimciği', 'Lizozom'], 'B', 'Ribozom, protein sentezi için prokaryot ve ökaryot tüm hücrelerde bulunur.', 1);
bi.q('hucre', 'Aşağıdakilerden hangisi bakteri hücresinde bulunmaz?', ['Ribozom', 'Hücre zarı', 'DNA', 'Çekirdek zarı', 'Sitoplazma'], 'D', 'Bakteriler prokaryottur; genetik materyalleri çekirdek zarıyla çevrili değildir.', 1);
bi.q('hucre', 'Aşağıdakilerden hangisi bitki hücresinde bulunup hayvan hücresinde bulunmaz?', ['Kloroplast', 'Mitokondri', 'Ribozom', 'Golgi cisimciği', 'Endoplazmik retikulum'], 'A', 'Kloroplast fotosentez yapan bitki hücrelerine özgüdür; diğerleri her iki hücrede de bulunur.', 1);
bi.q('hucre', 'Mitokondri ve kloroplast için aşağıdakilerden hangisi ortak özellik değildir?', ['Kendi DNA\'larının bulunması', 'Ribozom içermeleri', 'Çift katlı zarla çevrili olmaları', 'ATP üretebilmeleri', 'Tüm ökaryot hücrelerde bulunmaları'], 'E', 'Kloroplast hayvan ve mantar hücrelerinde bulunmaz. Diğer dört özellik iki organelde de ortaktır.', 2);

bi.lesson(
  'kalitim',
  11,
  'Mendel genetiği, çaprazlamalar, kan grupları ve eşeye bağlı kalıtım.',
  [
    H('Temel kavramlar'),
    UL('Gen: Bir karakteri belirleyen DNA bölgesi. Alel: Bir genin farklı biçimleri (A ve a).', 'Homozigot (AA, aa) — Heterozigot (Aa)', 'Genotip: Genetik yapı. Fenotip: Gözlenen özellik (genotip + çevre).', 'Baskın (dominant) alel heterozigotta etkisini gösterir; çekinik (resesif) alel yalnızca homozigotta görülür.'),
    H('Tek karakter çaprazlaması'),
    EX('Aa × Aa çaprazlamasında oranlar nedir?', ['Gametler: A, a × A, a', 'Genotip: 1 AA : 2 Aa : 1 aa', 'Fenotip: 3 baskın : 1 çekinik'], 'Çekinik fenotip olasılığı 1/4'),
    F('Gamet çeşidi', '2ⁿ   (n = heterozigot gen çifti sayısı)', 'AaBb → 2² = 4 çeşit gamet: AB, Ab, aB, ab'),
    H('Kan grupları (çok alellilik ve eş baskınlık)'),
    TABLE(['Kan grubu', 'Olası genotip'], ['A', 'AA, AO'], ['B', 'BB, BO'], ['AB', 'AB (eş baskın)'], ['0', '00']),
    H('Eşeye bağlı kalıtım'),
    P('Renk körlüğü ve hemofili X kromozomuna bağlı çekinik özelliklerdir. Erkekte tek X olduğu için tek alel yeterlidir; bu yüzden erkeklerde daha sık görülür. Baba X kromozomunu kızlarına aktarır.'),
    TIP('Babası renk körü olan normal görüşlü bir kız kesinlikle taşıyıcıdır (XᴬXᵃ), çünkü babasından Xᵃ almıştır.'),
  ],
  [card('Aa × Aa fenotip oranı', '3 : 1'), card('Gamet çeşidi formülü', '2ⁿ'), card('AB × 00', 'Çocuklar A (A0) veya B (B0)')],
);

bi.q('kalitim', 'Aa genotipli iki bireyin çaprazlanmasından oluşacak bir bireyin çekinik fenotipli olma olasılığı kaçtır?', ['0', '1/4', '1/2', '3/4', '1'], 'B', 'Genotip oranı 1 AA : 2 Aa : 1 aa. Yalnızca aa çekinik fenotip gösterir: 1/4.', 1);
bi.q('kalitim', 'AaBb genotipli bir birey kaç çeşit gamet oluşturabilir? (Genler bağımsız)', ['1', '2', '3', '4', '8'], 'D', 'Heterozigot gen çifti sayısı n = 2 → 2² = 4 çeşit gamet.', 1);
bi.q('kalitim', 'Kan grubu AB olan bir anne ile kan grubu 0 olan bir babanın çocuklarının kan grubu aşağıdakilerden hangisi olabilir?', ['Yalnız AB', 'A ve B', 'A, B ve 0', 'Yalnız 0', 'A, B, AB ve 0'], 'B', 'Anne A ya da B, baba 0 aleli verir: A0 (A grubu) veya B0 (B grubu).', 2);
bi.q('kalitim', 'Renk körlüğü X kromozomuna bağlı çekinik bir özelliktir. Babası renk körü olan normal görüşlü bir kızın taşıyıcı olma olasılığı kaçtır?', ['0', '1/4', '1/2', '3/4', '1'], 'E', 'Baba Xᵃ kromozomunu kızına mutlaka verir. Kız normal gördüğüne göre genotipi XᴬXᵃ\'dır; kesinlikle taşıyıcıdır.', 3);

export default [fz.done(), km.done(), bi.done()];
