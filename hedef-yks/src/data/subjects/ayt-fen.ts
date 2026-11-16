/** AYT Fen Bilimleri: Fizik, Kimya, Biyoloji. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../build.ts';

// ═════════════════════════════ FİZİK ═════════════════════════════
const fz = builder('ayt-fizik');

fz.lesson(
  'sabit-ivme',
  12,
  'Sabit ivmeli hareket denklemleri, serbest düşme, düşey-yatay-eğik atış (g = 10 m/s²).',
  [
    F('Hareket denklemleri', 'v = v₀ + a·t', 'x = v₀·t + ½·a·t²', 'v² = v₀² + 2·a·x'),
    H('Serbest düşme ve düşey atış'),
    UL('Serbest düşme: v₀ = 0, a = g → h = ½·g·t²', 'Yukarı atış: çıkış süresi t = v₀ / g, en büyük yükseklik h = v₀² / (2g)', 'Hava direnci yoksa cisim atıldığı hızla atıldığı noktaya geri döner.'),
    PLOT('Yukarı atılan cisim (v₀ = 20 m/s): yükseklik-zaman grafiği bir paraboldür. 2 s\'de 20 m tepeye çıkar, 4 s\'de geri döner.', [0, 4], [0, 25],
      { label: 'h(t) = 20t − 5t²', f: (t) => 20 * t - 5 * t * t },
    ),
    H('Yatay atış'),
    P('Yatayda sabit hızlı (vₓ = v₀), düşeyde serbest düşme hareketi yapar. Uçuş süresi yalnızca yüksekliğe bağlıdır: t = √(2h/g). Menzil = v₀ · t.'),
    H('Eğik atış'),
    F(undefined, 'vₓ = v₀·cos θ (sabit)     v_y = v₀·sin θ', 'Uçuş süresi = 2·v₀·sin θ / g', 'Menzil = v₀²·sin 2θ / g  → en büyük menzil θ = 45°'),
    TIP('Toplamı 90° olan iki açıyla (ör. 30° ve 60°) aynı hızla atılan cisimlerin menzilleri eşittir.'),
    EX('80 m yükseklikten 15 m/s yatay hızla atılan cisim yere hangi yatay uzaklıkta düşer?', ['t = √(2 · 80 / 10) = 4 s', 'Menzil = 15 · 4'], '60 m'),
  ],
  [card('En büyük yükseklik', 'v₀² / 2g'), card('Yatay atış uçuş süresi', '√(2h/g) — yatay hıza bağlı değil'), card('En büyük menzil açısı', '45°')],
);

fz.q('sabit-ivme', 'Serbest bırakılan bir cisim 3 saniyede kaç metre düşer? (g = 10 m/s², hava direnci önemsiz)', ['15', '30', '45', '60', '90'], 'C', 'h = ½ · 10 · 3² = 45 m.', 1);
fz.q('sabit-ivme', '20 m/s hızla düşey yukarı atılan bir cismin çıkabileceği en büyük yükseklik kaç metredir? (g = 10 m/s²)', ['10', '20', '30', '40', '80'], 'B', 'h = v₀² / (2g) = 400 / 20 = 20 m.', 1);
fz.q('sabit-ivme', '80 m yükseklikten 15 m/s hızla yatay atılan bir cisim, atıldığı noktanın düşeyinden kaç m uzağa düşer? (g = 10 m/s²)', ['30', '45', '60', '75', '120'], 'C', 't = √(2h/g) = √16 = 4 s. Yatay yol = 15 · 4 = 60 m.', 2);
fz.q('sabit-ivme', 'Durgun hâlden sabit ivmeyle harekete başlayan bir araç 4 saniyede 32 m yol alıyor. Aracın ivmesi kaç m/s²\'dir?', ['2', '4', '6', '8', '16'], 'B', 'x = ½·a·t² → 32 = ½ · a · 16 → a = 4 m/s².', 1);

fz.lesson(
  'momentum',
  10,
  'Momentum, itme (impuls), momentumun korunumu ve çarpışmalar.',
  [
    F('Tanımlar', 'Momentum: p = m · v  (vektörel)', 'İtme: I = F · Δt = Δp'),
    P('Bir cisme etki eden net kuvvetin uygulandığı süreyle çarpımı, cismin momentumundaki değişime eşittir.'),
    H('Momentumun korunumu'),
    P('Dış kuvvetlerin etkisinde olmayan sistemde toplam momentum sabittir: çarpışma ve patlamadan önceki toplam momentum, sonrakine eşittir.'),
    TABLE(['Çarpışma', 'Momentum', 'Kinetik enerji'], ['Esnek', 'Korunur', 'Korunur'], ['Esnek olmayan', 'Korunur', 'Korunmaz'], ['Tam esnek olmayan (yapışma)', 'Korunur', 'Korunmaz; en fazla kayıp']),
    EX('4 kg kütleli ve 6 m/s hızla giden cisim, duran 2 kg\'lık cisme çarpıp yapışıyor. Ortak hızları nedir?', ['Önce: 4 · 6 + 2 · 0 = 24 kg·m/s', 'Sonra: (4 + 2) · v = 24'], 'v = 4 m/s'),
    TIP('Duran bir cismin patlamasında parçaların momentumları eşit büyüklükte ve zıt yönlüdür (toplam sıfır).'),
  ],
  [card('İtme', 'F · Δt = Δp'), card('Yapışan çarpışma', 'Momentum korunur, kinetik enerji korunmaz')],
);

fz.q('momentum', '2 kg kütleli ve 5 m/s hızla hareket eden bir cismin momentumunun büyüklüğü kaç kg·m/s\'dir?', ['2,5', '5', '7', '10', '25'], 'D', 'p = m · v = 2 · 5 = 10 kg·m/s.', 1);
fz.q('momentum', 'Durmakta olan 3 kg kütleli bir cisme 0,2 s boyunca 30 N\'luk sabit kuvvet uygulanıyor. Cismin kazandığı hız kaç m/s\'dir?', ['1', '2', '3', '6', '10'], 'B', 'İtme = 30 · 0,2 = 6 N·s = Δp → v = 6 / 3 = 2 m/s.', 2);
fz.q('momentum', '4 kg kütleli ve 6 m/s hızla giden bir cisim, durmakta olan 2 kg\'lık cisme çarpıp yapışıyor. Ortak hız kaç m/s olur?', ['2', '3', '4', '6', '12'], 'C', '24 = 6 · v → v = 4 m/s.', 1);
fz.q('momentum', 'Durmakta olan 5 kg kütleli bir cisim iç patlamayla 2 kg ve 3 kg\'lık iki parçaya ayrılıyor. 2 kg\'lık parça 9 m/s hızla gittiğine göre 3 kg\'lık parçanın hızı nedir?', ['3 m/s, aynı yönde', '6 m/s, aynı yönde', '6 m/s, zıt yönde', '9 m/s, zıt yönde', '4,5 m/s, zıt yönde'], 'C', 'Toplam momentum sıfır kalır: 2 · 9 = 3 · v → v = 6 m/s ve zıt yönde.', 2);

fz.lesson(
  'modern-fizik',
  10,
  'Fotoelektrik olay, foton enerjisi, de Broglie dalga boyu ve ışığın ikili doğası.',
  [
    H('Foton'),
    F('Enerji', 'E = h · f = h · c / λ', 'h: Planck sabiti, f: frekans, λ: dalga boyu'),
    H('Fotoelektrik olay'),
    P('Metal yüzeye yeterli enerjide ışık düşürüldüğünde yüzeyden elektron sökülür. Einstein bu olayı ışığın tanecikli (foton) yapısıyla açıklamıştır.'),
    F('Einstein bağıntısı', 'E(foton) = W₀ (bağlanma enerjisi) + Ek(max)', 'Ek(max) = h·f − h·f₀'),
    TABLE(['Değişiklik', 'Sökülen elektron sayısı', 'Ek(max)'], ['Işık şiddeti artar (f sabit)', 'Artar', 'Değişmez'], ['Frekans artar', 'Değişmeyebilir', 'Artar'], ['f < f₀ (eşik altı)', 'Elektron sökülmez', '—']),
    TIP('Eşik frekansının altındaki ışık ne kadar şiddetli olursa olsun elektron sökemez. Bu, dalga modelinin açıklayamadığı sonuçtur.', 'warn'),
    H('Madde dalgaları'),
    F('de Broglie', 'λ = h / p = h / (m · v)'),
    P('Hızı artan parçacığın momentumu artar, dalga boyu kısalır. Elektron mikroskopları bu ilkeden yararlanır.'),
  ],
  [card('Fotoelektrik: şiddet artarsa', 'Elektron sayısı artar, Ek(max) değişmez'), card('de Broglie', 'λ = h / mv')],
);

fz.q('modern-fizik', 'Fotoelektrik olayda frekans sabit tutulup (eşik frekansının üstünde) ışığın şiddeti artırılırsa aşağıdakilerden hangisi gerçekleşir?', ['Sökülen elektronların maksimum kinetik enerjisi artar.', 'Sökülen elektron sayısı artar, maksimum kinetik enerji değişmez.', 'Elektron sökülmesi durur.', 'Metalin bağlanma enerjisi azalır.', 'Sökülen elektron sayısı azalır.'], 'B', 'Şiddet, birim zamanda gelen foton sayısıdır. Daha çok foton daha çok elektron söker; ama her fotonun enerjisi aynı kaldığı için Ek(max) değişmez.', 2);
fz.q('modern-fizik', 'Bağlanma enerjisi 2 eV olan bir metale 5 eV enerjili fotonlar düşürülüyor. Sökülen elektronların maksimum kinetik enerjisi kaç eV\'tur?', ['2', '3', '5', '7', '10'], 'B', 'Ek(max) = E − W₀ = 5 − 2 = 3 eV.', 1);
fz.q('modern-fizik', 'Bir parçacığın hızı iki katına çıkarılırsa de Broglie dalga boyu nasıl değişir?', ['Dört katına çıkar.', 'İki katına çıkar.', 'Değişmez.', 'Yarıya iner.', 'Dörtte birine iner.'], 'D', 'λ = h / (m·v); hız iki katına çıkınca dalga boyu yarıya iner.', 1);
fz.q('modern-fizik', 'Fotoelektrik olay ışığın hangi modeliyle açıklanabilir?', ['Dalga modeli', 'Tanecik (foton) modeli', 'Kırınım modeli', 'Girişim modeli', 'Kutuplanma modeli'], 'B', 'Elektron sökülmesinin şiddete değil frekansa bağlı olması, ışığın enerji paketleri (fotonlar) hâlinde yayıldığını gösterir.', 1);

// ═════════════════════════════ KİMYA ═════════════════════════════
const km = builder('ayt-kimya');

km.lesson(
  'gazlar',
  11,
  'İdeal gaz yasası, Boyle-Charles-Gay-Lussac bağıntıları, kısmi basınçlar ve Graham yasası.',
  [
    F('İdeal gaz denklemi', 'P · V = n · R · T', 'R = 0,082 L·atm / (mol·K) = 22,4 / 273', 'T (K) = t (°C) + 273'),
    TABLE(['Yasa', 'Sabit tutulan', 'Bağıntı'], ['Boyle', 'n, T', 'P₁V₁ = P₂V₂'], ['Charles', 'n, P', 'V₁/T₁ = V₂/T₂'], ['Gay-Lussac', 'n, V', 'P₁/T₁ = P₂/T₂'], ['Avogadro', 'P, T', 'V₁/n₁ = V₂/n₂']),
    TIP('Sıcaklık her zaman KELVİN cinsinden kullanılır. 27 °C → 300 K, 327 °C → 600 K.', 'warn'),
    H('Kısmi basınç (Dalton)'),
    F(undefined, 'P(toplam) = P₁ + P₂ + …', 'Pᵢ = Xᵢ · P(toplam)   (Xᵢ: mol kesri)'),
    H('Difüzyon (Graham)'),
    F(undefined, 'v₁ / v₂ = √(M₂ / M₁)'),
    P('Hafif gazlar daha hızlı yayılır. Gazlar yüksek sıcaklık ve düşük basınçta ideal davranışa yaklaşır, çünkü tanecikler arası etkileşim azalır.'),
    EX('Sabit basınçta 27 °C\'deki 10 L gaz 327 °C\'ye ısıtılırsa hacmi ne olur?', ['T₁ = 300 K, T₂ = 600 K', 'V₂ = V₁ · T₂ / T₁ = 10 · 2'], '20 L'),
  ],
  [card('PV = nRT', 'R = 0,082'), card('Graham', 'v₁/v₂ = √(M₂/M₁)'), card('İdeale yaklaşma', 'Yüksek T, düşük P')],
);

km.q('gazlar', 'Sabit sıcaklıkta 2 atm basınç altında 6 L hacim kaplayan bir gazın basıncı 3 atm\'ye çıkarılırsa hacmi kaç L olur?', ['2', '3', '4', '9', '12'], 'C', 'Boyle: 2 · 6 = 3 · V → V = 4 L.', 1);
km.q('gazlar', 'Sabit basınçta 27 °C\'de 10 L hacim kaplayan bir gaz 327 °C\'ye ısıtılırsa hacmi kaç L olur?', ['5', '10', '15', '20', '30'], 'D', 'Charles: 10/300 = V/600 → V = 20 L.', 2);
km.q('gazlar', 'Aynı koşullarda H₂ gazının difüzyon hızının O₂ gazının difüzyon hızına oranı kaçtır? (H: 1, O: 16)', ['1/4', '1/2', '2', '4', '16'], 'D', 'v(H₂)/v(O₂) = √(32/2) = √16 = 4.', 2);
km.q('gazlar', 'Gerçek gazlar hangi koşullarda ideal gaz davranışına en çok yaklaşır?', ['Düşük sıcaklık, yüksek basınç', 'Yüksek sıcaklık, düşük basınç', 'Düşük sıcaklık, düşük basınç', 'Yüksek sıcaklık, yüksek basınç', 'Yoğuşma noktasına yakın sıcaklıkta'], 'B', 'Yüksek sıcaklıkta tanecikler hızlı, düşük basınçta birbirinden uzaktır; etkileşimler ihmal edilecek kadar azalır.', 1);
km.q('gazlar', 'Bir kapta 0,2 mol He ve 0,3 mol Ne gazı bulunmaktadır. Toplam basınç 5 atm olduğuna göre He\'nin kısmi basıncı kaç atm\'dir?', ['1', '2', '2,5', '3', '5'], 'B', 'X(He) = 0,2 / 0,5 = 0,4 → P(He) = 0,4 · 5 = 2 atm.', 1);

km.lesson(
  'denge',
  11,
  'Denge sabiti ifadesi, Le Chatelier ilkesi ve dengeye etki eden faktörler.',
  [
    H('Denge sabiti'),
    P('aA + bB ⇌ cC + dD tepkimesi için Kc = [C]ᶜ[D]ᵈ / ([A]ᵃ[B]ᵇ). Katılar ve saf sıvılar denge ifadesine yazılmaz.'),
    EX('CaCO₃(k) ⇌ CaO(k) + CO₂(g) için Kc nedir?', ['Katı maddeler ifadeye girmez.'], 'Kc = [CO₂]'),
    H('Le Chatelier ilkesi'),
    P('Dengedeki bir sisteme dış etki yapılırsa sistem bu etkiyi azaltacak yönde kayar.'),
    TABLE(['Etki', 'Dengenin kayma yönü', 'Kc'], ['Madde eklemek', 'Eklenen maddeyi harcayan yöne', 'Değişmez'], ['Hacmi küçültmek (P↑)', 'Gaz mol sayısı az olan yöne', 'Değişmez'], ['Sıcaklık artışı (ekzotermik)', 'Girenler yönüne', 'Azalır'], ['Sıcaklık artışı (endotermik)', 'Ürünler yönüne', 'Artar'], ['Katalizör', 'Kaymaz; dengeye daha hızlı ulaşılır', 'Değişmez']),
    TIP('Kc\'yi değiştiren TEK etken sıcaklıktır.'),
    FLOW('Q ile K karşılaştırması', 'Q < K → tepkime ileri yönde ilerler', 'Q = K → sistem dengededir', 'Q > K → tepkime geri yönde ilerler'),
  ],
  [card('Kc\'yi değiştiren tek etken', 'Sıcaklık'), card('Katalizör', 'Dengeyi kaydırmaz, hızlandırır')],
);

km.q('denge', 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) tepkimesinin denge sabiti (Kc) ifadesi aşağıdakilerden hangisidir?', ['[NH₃] / ([N₂][H₂])', '[NH₃]² / ([N₂][H₂]³)', '([N₂][H₂]³) / [NH₃]²', '2[NH₃] / (3[H₂][N₂])', '[NH₃]² / [H₂]³'], 'B', 'Ürün derişimleri katsayı kuvvetinde paya, girenler paydaya yazılır.', 1);
km.q('denge', 'Dengedeki bir sisteme katalizör eklenirse aşağıdakilerden hangisi gerçekleşir?', ['Denge ürünler yönüne kayar.', 'Denge girenler yönüne kayar.', 'Kc değeri artar.', 'Denge konumu değişmez; dengeye ulaşma süresi kısalır.', 'Tepkime ısısı azalır.'], 'D', 'Katalizör ileri ve geri tepkimeleri eşit oranda hızlandırır; denge konumu ve Kc değişmez.', 1);
km.q('denge', 'Ekzotermik bir tepkimede sıcaklık artırılırsa denge sabiti Kc için ne söylenebilir?', ['Artar.', 'Azalır.', 'Değişmez.', 'Önce artar sonra azalır.', 'Sıfır olur.'], 'B', 'Ekzotermik tepkimede ısı ürün gibidir; sıcaklık artınca denge girenlere kayar ve Kc azalır.', 2);
km.q('denge', 'CaCO₃(k) ⇌ CaO(k) + CO₂(g) tepkimesinin denge sabiti ifadesi aşağıdakilerden hangisidir?', ['[CaO][CO₂] / [CaCO₃]', '[CaCO₃] / [CaO]', '[CO₂]', '1 / [CO₂]', '[CaO]'], 'C', 'Katılar denge ifadesine yazılmaz; yalnızca gaz olan CO₂ kalır.', 2);
km.q('denge', '2SO₂(g) + O₂(g) ⇌ 2SO₃(g) dengesinde sabit sıcaklıkta kabın hacmi küçültülürse ne olur?', ['Denge girenler yönüne kayar.', 'Denge ürünler yönüne kayar.', 'Denge etkilenmez.', 'Kc artar.', 'Kc azalır.'], 'B', 'Basınç artar; sistem gaz mol sayısının az olduğu yöne (3 mol → 2 mol, ürünler) kayar. Sıcaklık sabit olduğu için Kc değişmez.', 2);

km.lesson(
  'asit-baz-denge',
  10,
  'pH ve pOH hesabı, suyun iyonlaşması, kuvvetli asit-baz çözeltileri ve tuzların hidrolizi.',
  [
    F('Suyun iyonlaşması (25 °C)', 'Ksu = [H⁺][OH⁻] = 1 · 10⁻¹⁴', 'pH = −log[H⁺]     pOH = −log[OH⁻]', 'pH + pOH = 14'),
    TABLE(['pH', 'Ortam'], ['< 7', 'Asidik'], ['= 7', 'Nötr'], ['> 7', 'Bazik']),
    H('Kuvvetli asit ve bazlar'),
    P('HCl, HNO₃, H₂SO₄ gibi kuvvetli asitler ile NaOH, KOH gibi kuvvetli bazlar suda tamamen iyonlaşır. 0,01 M NaOH → [OH⁻] = 10⁻² → pOH = 2 → pH = 12.'),
    H('Tuzların hidrolizi'),
    TABLE(['Tuzun kaynağı', 'Çözelti', 'Örnek'], ['Kuvvetli asit + kuvvetli baz', 'Nötr', 'NaCl, KNO₃'], ['Zayıf asit + kuvvetli baz', 'Bazik', 'CH₃COONa'], ['Kuvvetli asit + zayıf baz', 'Asidik', 'NH₄Cl']),
    TIP('Tuzun karakterini "kuvvetli olan baskındır" kuralıyla hızlıca bulun.'),
    H('Tampon çözelti'),
    P('Zayıf bir asit ile onun tuzunun (ya da zayıf baz ile tuzunun) karışımıdır; az miktarda asit veya baz eklendiğinde pH\'ı fazla değişmez.'),
  ],
  [card('pH + pOH', '14 (25 °C)'), card('CH₃COONa çözeltisi', 'Bazik (zayıf asit + kuvvetli baz)')],
);

km.q('asit-baz-denge', '[H⁺] = 1 · 10⁻³ M olan bir çözeltinin pH değeri kaçtır?', ['1', '3', '7', '11', '14'], 'B', 'pH = −log(10⁻³) = 3.', 1);
km.q('asit-baz-denge', '25 °C\'de 0,01 M NaOH çözeltisinin pH değeri kaçtır?', ['2', '7', '10', '12', '14'], 'D', '[OH⁻] = 10⁻² → pOH = 2 → pH = 14 − 2 = 12.', 1);
km.q('asit-baz-denge', '25 °C\'de pH değeri 4 olan bir çözeltide [OH⁻] kaç M\'dir?', ['1 · 10⁻⁴', '1 · 10⁻⁷', '1 · 10⁻¹⁰', '1 · 10⁻¹⁴', '4 · 10⁻¹⁰'], 'C', 'pOH = 14 − 4 = 10 → [OH⁻] = 10⁻¹⁰ M.', 2);
km.q('asit-baz-denge', 'Aşağıdaki tuzlardan hangisinin sulu çözeltisi bazik özellik gösterir?', ['NaCl', 'KNO₃', 'CH₃COONa', 'NH₄Cl', 'KCl'], 'C', 'CH₃COONa zayıf asit (CH₃COOH) ile kuvvetli bazdan (NaOH) oluşur; asetat iyonu hidroliz olarak OH⁻ üretir.', 2);

// ═════════════════════════════ BİYOLOJİ ═════════════════════════════
const bi = builder('ayt-biyo');

bi.lesson(
  'sinir',
  12,
  'Nöronun yapısı, impuls iletimi, sinaps, merkezi ve çevresel sinir sistemi.',
  [
    H('Nöron'),
    UL('Dendrit: Uyarıyı alır.', 'Hücre gövdesi: Çekirdek ve organeller.', 'Akson: Uyarıyı iletir; miyelin kılıfla sarılı olabilir.', 'Ranvier boğumları: Miyelinsiz bölgeler; impuls bu boğumlar arasında sıçrayarak hızla iletilir.'),
    H('İmpuls iletimi'),
    FLOW('Aksiyon potansiyeli', 'Dinlenme (−70 mV): Na⁺ dışarıda, K⁺ içeride yoğun', 'Depolarizasyon: Na⁺ kanalları açılır, Na⁺ hücreye girer', 'Repolarizasyon: K⁺ hücre dışına çıkar', 'Na⁺-K⁺ pompası (ATP ile) 3 Na⁺ dışarı, 2 K⁺ içeri taşıyarak dengeyi yeniler'),
    TIP('Uyartı "ya hep ya hiç" kuralına uyar: eşik değeri aşan her uyarı aynı büyüklükte impuls oluşturur.'),
    H('Sinaps'),
    P('İki nöron arasındaki bağlantı noktasıdır. Akson ucundan salgılanan nörotransmitterler (ör. asetilkolin) sinaps boşluğuna geçer; iletim tek yönlüdür.'),
    H('Beynin bölümleri'),
    TABLE(['Bölüm', 'Görev'], ['Uç beyin (serebrum)', 'Düşünme, öğrenme, bellek, istemli hareketler'], ['Talamus', 'Duyuları (koku hariç) ilgili merkezlere yönlendirir'], ['Hipotalamus', 'Vücut sıcaklığı, açlık-tokluk, su dengesi; hipofizi denetler'], ['Beyincik', 'Denge ve kas koordinasyonu'], ['Omurilik soğanı', 'Solunum, kalp atışı, yutkunma, öksürme gibi yaşamsal refleksler']),
    H('Otonom sinir sistemi'),
    TABLE(['', 'Sempatik', 'Parasempatik'], ['Kalp atışı', 'Hızlanır', 'Yavaşlar'], ['Göz bebeği', 'Büyür', 'Küçülür'], ['Sindirim', 'Yavaşlar', 'Hızlanır'], ['Bronşlar', 'Genişler', 'Daralır']),
  ],
  [card('Denge merkezi', 'Beyincik'), card('Depolarizasyon', 'Na⁺ hücre içine girer'), card('Sempatik', 'Stres hâli: kalp hızlanır, sindirim yavaşlar')],
);

bi.q('sinir', 'Vücudun denge ve kas koordinasyonundan sorumlu olan beyin bölümü aşağıdakilerden hangisidir?', ['Uç beyin', 'Talamus', 'Beyincik', 'Omurilik soğanı', 'Hipotalamus'], 'C', 'Beyincik (serebellum) dengeyi ve kas hareketlerinin uyumunu sağlar.', 1);
bi.q('sinir', 'Akson boyunca impulsun sıçrayarak daha hızlı iletilmesini sağlayan yapı aşağıdakilerden hangisidir?', ['Dendrit', 'Sinaps boşluğu', 'Miyelin kılıf ve Ranvier boğumları', 'Hücre gövdesi', 'Nörotransmitter'], 'C', 'Miyelin yalıtkandır; impuls yalnızca Ranvier boğumlarında oluşarak boğumdan boğuma sıçrar.', 1);
bi.q('sinir', 'Bir nöronda depolarizasyon sırasında aşağıdakilerden hangisi gerçekleşir?', ['K⁺ iyonlarının hücre içine girmesi', 'Na⁺ iyonlarının hücre içine girmesi', 'Na⁺-K⁺ pompasının durması', 'Hücre içinin daha negatif olması', 'Nörotransmitterin geri alınması'], 'B', 'Na⁺ kanalları açılır, Na⁺ iyonları hücreye girer ve zarın iç yüzü pozitifleşir.', 2);
bi.q('sinir', 'Aşağıdakilerden hangisi sempatik sinir sisteminin etkilerinden biridir?', ['Sindirimi hızlandırması', 'Göz bebeğini küçültmesi', 'Kalp atış hızını artırması', 'Bronşları daraltması', 'Tükürük salgısını artırması'], 'C', 'Sempatik sistem vücudu stres ve tehlikeye hazırlar: kalp hızlanır, bronşlar ve göz bebeği genişler, sindirim yavaşlar.', 2);
bi.q('sinir', 'Vücut sıcaklığı, açlık-tokluk ve su dengesinin düzenlenmesinde görev yapan beyin bölümü aşağıdakilerden hangisidir?', ['Hipotalamus', 'Beyincik', 'Pons', 'Orta beyin', 'Omurilik soğanı'], 'A', 'Hipotalamus homeostazın merkezidir ve hipofiz bezini de denetler.', 1);

bi.lesson(
  'nukleik-asit',
  12,
  'DNA ve RNA\'nın yapısı, DNA eşlenmesi, transkripsiyon ve translasyon.',
  [
    TABLE(['Özellik', 'DNA', 'RNA'], ['Şeker', 'Deoksiriboz', 'Riboz'], ['Bazlar', 'A, T, G, C', 'A, U, G, C'], ['Zincir', 'Çift (sarmal)', 'Tek'], ['Görev', 'Kalıtsal bilgiyi saklar', 'Protein sentezinde görev alır']),
    H('Baz eşleşmesi (Chargaff)'),
    UL('A = T (2 hidrojen bağı), G ≡ C (3 hidrojen bağı)', 'Çift zincirli DNA\'da A = T, G = C ve pürin sayısı = pirimidin sayısı.'),
    EX('Bir DNA molekülündeki bazların %20\'si adenin ise sitozin yüzdesi kaçtır?', ['A = T = %20 → A + T = %40', 'G + C = %60 → C = %30'], '%30'),
    H('DNA eşlenmesi'),
    P('Yarı korunumludur: her yeni DNA\'da bir eski, bir yeni zincir bulunur (Meselson-Stahl deneyi). DNA polimeraz yeni zinciri 5′ → 3′ yönünde sentezler.'),
    H('Protein sentezi'),
    FLOW('Genden proteine', 'Transkripsiyon (ökaryotta çekirdekte): DNA kalıbından mRNA', 'mRNA ribozoma gider', 'Translasyon: tRNA\'lar kodonlara uygun amino asitleri getirir', 'Peptit bağlarıyla polipeptit oluşur'),
    UL('Kodon: mRNA üzerindeki 3 nükleotitlik dizi; bir amino asidi şifreler.', 'Başlama kodonu: AUG. Durdurma kodonları: UAA, UAG, UGA (amino asit şifrelemez).'),
    TIP('n amino asitli polipeptit için mRNA\'da durdurma kodonu dahil en az 3n + 3 nükleotit gerekir.'),
  ],
  [card('DNA\'ya özgü baz', 'Timin'), card('RNA\'ya özgü baz', 'Urasil'), card('Yarı korunumlu eşlenme', 'Meselson-Stahl deneyi')],
);

bi.q('nukleik-asit', 'Çift zincirli bir DNA molekülündeki nükleotitlerin %20\'si adenin içerdiğine göre sitozin içeren nükleotitlerin oranı yüzde kaçtır?', ['20', '30', '40', '60', '80'], 'B', 'A = T = 20 → A + T = 40. G + C = 60 ve G = C → C = %30.', 1);
bi.q('nukleik-asit', 'Kalıp DNA zincirinin bir bölümü 3′-TAC GGA-5′ ise bu bölgeden sentezlenen mRNA dizisi aşağıdakilerden hangisidir?', ['5′-AUG CCU-3′', '5′-ATG CCT-3′', '5′-UAC GGA-3′', '5′-TAC GGA-3′', '5′-AUG GGU-3′'], 'A', 'Eşleşme kuralı: T→A, A→U, C→G, G→C. TAC GGA → AUG CCU (mRNA\'da T yerine U).', 2);
bi.q('nukleik-asit', '100 amino asitten oluşan bir polipeptidi şifreleyen mRNA\'da, durdurma kodonu dahil en az kaç nükleotit bulunur?', ['100', '200', '300', '303', '600'], 'D', 'Her amino asit 3 nükleotit: 300. Durdurma kodonu (3 nükleotit) eklenince 303.', 2);
bi.q('nukleik-asit', 'Aşağıdakilerden hangisi DNA\'nın yapısında bulunup RNA\'nın yapısında bulunmaz?', ['Adenin', 'Guanin', 'Sitozin', 'Timin', 'Fosfat'], 'D', 'Timin yalnızca DNA\'da, urasil yalnızca RNA\'da bulunur.', 1);
bi.q('nukleik-asit', 'DNA eşlenmesinin yarı korunumlu olduğunu deneysel olarak gösteren bilim insanları kimlerdir?', ['Watson ve Crick', 'Meselson ve Stahl', 'Hershey ve Chase', 'Griffith ve Avery', 'Mendel ve Morgan'], 'B', 'Meselson ve Stahl, ağır azot (¹⁵N) izotopu kullanarak eşlenmenin yarı korunumlu olduğunu kanıtladı.', 2);

bi.lesson(
  'enerji',
  12,
  'ATP, fotosentezin evreleri, oksijenli solunum ve fermantasyon.',
  [
    H('Fotosentez'),
    F(undefined, '6CO₂ + 6H₂O  →(ışık, klorofil)→  C₆H₁₂O₆ + 6O₂'),
    TABLE(['Evre', 'Yeri', 'Olaylar'], ['Işığa bağlı tepkimeler', 'Tilakoit zar', 'Suyun fotolizi, O₂ çıkışı, ATP ve NADPH üretimi'], ['Işıktan bağımsız (Calvin)', 'Stroma', 'CO₂ tutulur, ATP ve NADPH kullanılarak glikoz üretilir']),
    TIP('Fotosentezde açığa çıkan O₂\'nin kaynağı CO₂ değil, SUdur.', 'warn'),
    H('Oksijenli solunum'),
    FLOW('Glikozdan ATP\'ye', 'Glikoliz (sitoplazma): glikoz → 2 pirüvat, net 2 ATP', 'Krebs döngüsü (mitokondri matriksi): CO₂ açığa çıkar', 'Elektron taşıma sistemi (mitokondri iç zarı): son elektron alıcısı O₂, su oluşur, ATP\'nin çoğu üretilir'),
    H('Fermantasyon'),
    TABLE(['Tür', 'Ürün', 'CO₂', 'Örnek'], ['Etil alkol', 'Etil alkol + CO₂', 'Çıkar', 'Maya (ekmek mayalanması)'], ['Laktik asit', 'Laktik asit', 'Çıkmaz', 'Yoğurt bakterileri, yorgun kas hücresi']),
    P('Fermantasyonda ATP yalnızca glikoliz evresinde üretilir (net 2 ATP); oksijen kullanılmaz.'),
  ],
  [card('Fotosentezde O₂ kaynağı', 'Su (fotoliz)'), card('Calvin döngüsü', 'Stroma'), card('Son elektron alıcısı', 'O₂')],
);

bi.q('enerji', 'Fotosentez sırasında açığa çıkan oksijen gazının kaynağı aşağıdakilerden hangisidir?', ['Karbondioksit', 'Su', 'Glikoz', 'Klorofil', 'ATP'], 'B', 'Işığa bağlı tepkimelerde su molekülleri parçalanır (fotoliz) ve O₂ açığa çıkar.', 1);
bi.q('enerji', 'Glikoliz evresi hücrenin hangi bölümünde gerçekleşir?', ['Mitokondri matriksi', 'Mitokondri iç zarı', 'Sitoplazma', 'Kloroplast stroması', 'Çekirdek'], 'C', 'Glikoliz tüm canlılarda ortaktır ve sitoplazmada gerçekleşir.', 1);
bi.q('enerji', 'Oksijenli solunumda elektron taşıma sisteminin son elektron alıcısı aşağıdakilerden hangisidir?', ['NAD⁺', 'FAD', 'O₂', 'CO₂', 'Pirüvat'], 'C', 'Elektronlar en sonunda O₂\'ye aktarılır ve hidrojen iyonlarıyla birleşerek su oluşur.', 1);
bi.q('enerji', 'Laktik asit fermantasyonu ile ilgili aşağıdakilerden hangisi doğrudur?', ['CO₂ açığa çıkar.', 'Mitokondride gerçekleşir.', 'Oksijen kullanılır.', 'CO₂ açığa çıkmaz.', 'Glikoz başına 36 ATP üretilir.'], 'D', 'Laktik asit fermantasyonunda pirüvat laktik aside dönüşür; CO₂ çıkışı olmaz. Sitoplazmada ve oksijensiz gerçekleşir.', 2);
bi.q('enerji', 'Fotosentezin ışıktan bağımsız tepkimeleri (Calvin döngüsü) kloroplastın hangi bölümünde gerçekleşir?', ['Tilakoit zar', 'Stroma', 'Dış zar', 'Granum boşluğu', 'Zarlar arası boşluk'], 'B', 'Calvin döngüsü stromada gerçekleşir; ışığa bağlı tepkimeler tilakoit zarda olur.', 1);

export default [fz.done(), km.done(), bi.done()];
