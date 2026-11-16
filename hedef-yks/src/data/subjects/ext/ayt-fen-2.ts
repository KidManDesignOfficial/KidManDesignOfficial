/** AYT Fen Bilimleri: Fizik, Kimya, Biyoloji'nin kalan konuları. */
import { EX, F, FLOW, H, P, PLOT, TABLE, TIP, UL, builder, card } from '../../build.ts';

// ═════════════════════════════ FİZİK ═════════════════════════════
const fz = builder('ayt-fizik', 'b');

fz.lesson('vektorler', 9, 'Vektörlerin toplanması, bileşenler ve bağıl hareket.', [
  F('Bileşke', 'Aynı yönlü: R = A + B', 'Zıt yönlü: R = |A − B|', 'Dik: R = √(A² + B²)', 'Genel: R² = A² + B² + 2AB · cos θ', 'Sınır: |A − B| ≤ R ≤ A + B'),
  H('Bağıl hareket'),
  P('Gözlemcinin gördüğü (bağıl) hız: v_bağıl = v_cisim − v_gözlemci. Aynı yönde 60 ve 80 km/sa giden araçlardan yavaş olandaki yolcu, hızlı aracı 20 km/sa ile ileri gidiyor görür.'),
  EX('Akıntı hızı 3 m/s olan nehirde yüzücü akıntıya dik doğrultuda suya göre 4 m/s hızla yüzüyor. Yere göre hızı nedir?', ['Hızlar dik: √(3² + 4²)'], '5 m/s'),
], [card('Dik vektörler', 'R = √(A² + B²)'), card('Bağıl hız', 'v_cisim − v_gözlemci')]);
fz.q('vektorler', 'Büyüklükleri 3 N ve 4 N olan birbirine dik iki kuvvetin bileşkesi kaç N\'dir?', ['1', '√7', '5', '7', '12'], 'C', 'Dik kuvvetlerde R = √(9 + 16) = 5 N.', 1);
fz.q('vektorler', 'Düz bir yolda aynı yönde 60 km/sa ve 80 km/sa sabit hızlarla giden iki araçtan yavaş olanındaki gözlemci, hızlı aracı nasıl görür?', ['20 km/sa hızla ileri gidiyor', '20 km/sa hızla geri gidiyor', '140 km/sa hızla ileri gidiyor', 'Duruyor', '80 km/sa hızla ileri gidiyor'], 'A', 'v_bağıl = 80 − 60 = 20 km/sa, hareket yönünde.', 1);
fz.q('vektorler', 'Akıntı hızı 3 m/s olan bir nehirde yüzücü, akıntıya dik doğrultuda suya göre 4 m/s hızla yüzmektedir. Yüzücünün yere göre hızı kaç m/s\'dir?', ['1', '3', '4', '5', '7'], 'D', 'Hızlar birbirine diktir: √(3² + 4²) = 5 m/s.', 1);

fz.lesson('newton', 10, 'Newton yasalarının uygulamaları: bağlı cisimler, sürtünme ve eğik düzlem.', [
  F('Dinamik', 'F_net = m · a', 'Kinetik sürtünme: f = k · N  (yatayda N = m · g)', 'Eğik düzlemde eğim yönündeki bileşen: m · g · sin θ'),
  FLOW('Bağlı cisimler', 'Sistemi tek cisim gibi düşün: a = F_net / (m₁ + m₂)', 'İp gerilmesi için ipin çektiği cisme F = m · a uygula'),
  EX('Sürtünmesiz yatayda iple bağlı 2 kg ve 3 kg cisimlerden 3 kg olana 20 N kuvvet uygulanıyor. İvme ve ip gerilmesi nedir?', ['a = 20 / 5 = 4 m/s²', 'İp 2 kg\'lık cismi çeker: T = 2 · 4'], 'a = 4 m/s², T = 8 N'),
], [card('Kinetik sürtünme', 'f = k · N'), card('Bağlı cisimler', 'a = F / toplam kütle')]);
fz.q('newton', 'Sürtünmesiz yatay düzlemde iple birbirine bağlı 2 kg ve 3 kg kütleli cisimlerden 3 kg\'lık olanına 20 N yatay kuvvet uygulanıyor. Sistemin ivmesi kaç m/s²\'dir?', ['2', '4', '5', '6,7', '10'], 'B', 'a = F / (m₁ + m₂) = 20 / 5 = 4 m/s².', 1);
fz.q('newton', 'Aynı sistemde (2 kg ve 3 kg bağlı cisimler, 3 kg\'a 20 N) iki cismi bağlayan ipteki gerilme kuvveti kaç N\'dir?', ['4', '8', '12', '16', '20'], 'B', 'İp yalnızca 2 kg\'lık cismi hızlandırır: T = 2 · 4 = 8 N.', 2);
fz.q('newton', 'Kütlesi 5 kg olan bir cisim, kinetik sürtünme katsayısı 0,2 olan yatay bir yüzeyde kaymaktadır. Cisme etki eden sürtünme kuvveti kaç N\'dir? (g = 10 m/s²)', ['1', '5', '10', '25', '50'], 'C', 'f = k · m · g = 0,2 · 5 · 10 = 10 N.', 1);

fz.lesson('enerji-hareket', 10, 'İş-enerji teoremi, sürtünmeli ortamda enerji ve yay potansiyel enerjisi.', [
  F('Bağıntılar', 'İş-enerji teoremi: W_net = ΔEk', 'Yay potansiyel enerjisi: Ep = ½ · k · x²', 'Serbest düşmede çarpma hızı: v = √(2gh)'),
  UL('Sürtünme kuvvetinin yaptığı iş negatiftir; mekanik enerjinin bir kısmı ısıya dönüşür.', 'Sürtünmesiz sistemde mekanik enerji korunur.'),
  EX('5 m yükseklikten serbest bırakılan cisim yere hangi hızla çarpar? (g = 10 m/s²)', ['mgh = ½mv² → v = √(2gh)', '√(2 · 10 · 5) = √100'], '10 m/s'),
], [card('W_net', 'ΔEk'), card('Yay enerjisi', '½kx²')]);
fz.q('enerji-hareket', '10 m/s hızla hareket eden 4 kg kütleli bir cisim, sürtünmeli yatay yolda bir süre sonra duruyor. Sürtünme kuvvetinin yaptığı işin büyüklüğü kaç J\'dür?', ['40', '100', '200', '400', '800'], 'C', 'Kinetik enerjinin tamamı harcanır: ½ · 4 · 10² = 200 J.', 1);
fz.q('enerji-hareket', 'Yay sabiti 200 N/m olan bir yay 0,1 m sıkıştırılıyor. Yayda depolanan potansiyel enerji kaç J\'dür?', ['0,5', '1', '2', '10', '20'], 'B', 'Ep = ½ · 200 · 0,1² = 100 · 0,01 = 1 J.', 1);
fz.q('enerji-hareket', '5 m yükseklikten serbest bırakılan bir cisim yere kaç m/s hızla çarpar? (g = 10 m/s², sürtünme yok)', ['5', '7', '10', '20', '50'], 'C', 'v = √(2gh) = √100 = 10 m/s.', 1);

fz.lesson('tork-denge', 10, 'Tork (kuvvet momenti), denge koşulları ve kütle merkezi.', [
  F('Tork', 'τ = F · d  (d: dönme noktasından kuvvetin doğrultusuna dik uzaklık)', 'Denge: ΣF = 0 ve Στ = 0'),
  UL('Saat yönündeki torklar toplamı, saat yönünün tersindeki torklar toplamına eşitse cisim dönme dengesindedir.', 'Kütle merkezi: Cismin tüm kütlesinin toplandığı kabul edilen nokta; düzgün çubukta orta noktadır.', 'Kapı kolunun menteşeden uzağa konması, aynı kuvvetle daha büyük tork sağlar.'),
  EX('Ağırlıksız çubukta destekten 2 m solda 30 N asılı. Dengede kalması için destekten 3 m sağa kaç N asılmalı?', ['30 · 2 = F · 3', 'F = 20'], '20 N'),
], [card('Tork', 'τ = F · d'), card('Denge', 'ΣF = 0, Στ = 0')]);
fz.q('tork-denge', 'Bir kapıya menteşeden 0,5 m uzaklıkta, kapı düzlemine dik 20 N\'luk kuvvet uygulanıyor. Kuvvetin menteşeye göre torku kaç N·m\'dir?', ['5', '10', '20', '40', '100'], 'B', 'τ = F · d = 20 · 0,5 = 10 N·m.', 1);
fz.q('tork-denge', 'Ağırlığı önemsiz bir çubuk ortasından desteklenmiştir. Destekten 2 m sola 30 N\'luk yük asılıyor. Çubuğun yatay dengede kalması için destekten 3 m sağa kaç N\'luk yük asılmalıdır?', ['10', '15', '20', '30', '45'], 'C', 'Torklar eşit olmalı: 30 · 2 = F · 3 → F = 20 N.', 1);
fz.q('tork-denge', 'Bir cismin tam dengede olabilmesi için aşağıdakilerden hangisi gerekir?', ['Yalnızca net kuvvetin sıfır olması', 'Yalnızca net torkun sıfır olması', 'Net kuvvetin ve net torkun sıfır olması', 'Hızının artması', 'Kütle merkezinin yere değmesi'], 'C', 'Öteleme dengesi için ΣF = 0, dönme dengesi için Στ = 0 olmalıdır.', 1);

fz.lesson('basit-makineler', 9, 'Kaldıraç, makara, eğik düzlem, çıkrık ve vida; kuvvet kazancı ve iş ilkesi.', [
  TABLE(['Makine', 'Denge bağıntısı (ideal)'], ['Kaldıraç', 'F · kuvvet kolu = Y · yük kolu'], ['Sabit makara', 'F = Y (yalnızca kuvvetin yönünü değiştirir)'], ['Hareketli makara', 'F = Y / 2'], ['Eğik düzlem', 'F · L = Y · h'], ['Çıkrık', 'F · R = Y · r']),
  TIP('Basit makineler kuvvetten kazanç sağlarsa yoldan kaybettirir; ideal durumda bile işten kazanç sağlamaz.'),
  EX('Uzunluğu 5 m, yüksekliği 1 m olan sürtünmesiz eğik düzlemde 500 N yük kaç N kuvvetle çıkarılır?', ['F · L = Y · h', 'F · 5 = 500 · 1'], '100 N'),
], [card('Hareketli makara', 'F = Y / 2'), card('İş ilkesi', 'Basit makine işten kazandırmaz')]);
fz.q('basit-makineler', 'Ağırlığı ve sürtünmesi önemsiz tek bir hareketli makara ile 200 N\'luk yük dengede tutulmaktadır. Uygulanan kuvvet kaç N\'dir?', ['50', '100', '150', '200', '400'], 'B', 'Hareketli makarada yük iki ip koluna eşit dağılır: F = 200 / 2 = 100 N.', 1);
fz.q('basit-makineler', 'Uzunluğu 5 m, yüksekliği 1 m olan sürtünmesiz eğik düzlemde 500 N ağırlığındaki yük, eğik düzleme paralel kuvvetle sabit hızla çıkarılıyor. Uygulanan kuvvet kaç N\'dir?', ['50', '100', '250', '500', '2500'], 'B', 'F · L = Y · h → F · 5 = 500 → F = 100 N.', 1);
fz.q('basit-makineler', 'Basit makinelerle ilgili aşağıdaki ifadelerden hangisi doğrudur?', ['İşten kazanç sağlarlar.', 'Kuvvetten kazanç sağlandığında yoldan kaybedilir.', 'Sabit makara kuvvetten kazanç sağlar.', 'Verimleri her zaman %100\'den büyüktür.', 'Yoldan ve kuvvetten aynı anda kazanç sağlarlar.'], 'B', 'İş = kuvvet · yol sabit kaldığından kuvvet azalırsa yol artar.', 1);

fz.lesson('elektrik-alan', 11, 'Elektrik alan, elektriksel potansiyel, potansiyel enerji ve paralel levhalar.', [
  F('Noktasal yük', 'E = k · q / d²  (vektörel)', 'V = k · q / d  (skaler)', 'F = q · E', 'İş: W = q · ΔV'),
  F('Paralel levhalar', 'E = V / d  (düzgün alan)'),
  UL('Elektrik alan çizgileri pozitif yükten çıkar, negatif yüke girer; çizgilerin sıklığı alanın şiddetini gösterir.', 'Uzaklık 2 katına çıkarsa alan 1/4\'üne, potansiyel 1/2\'sine iner.'),
], [card('E ve V', 'E ∝ 1/d², V ∝ 1/d'), card('Paralel levhalar', 'E = V / d')]);
fz.q('elektrik-alan', 'Aralarındaki uzaklık 0,02 m olan paralel iki levha arasındaki potansiyel farkı 100 V\'tur. Levhalar arasındaki elektrik alanın büyüklüğü kaç V/m\'dir?', ['2', '50', '500', '2000', '5000'], 'E', 'E = V / d = 100 / 0,02 = 5000 V/m.', 2);
fz.q('elektrik-alan', 'Elektrik alan çizgileri için aşağıdakilerden hangisi doğrudur?', ['Negatif yükten çıkıp pozitif yüke girer.', 'Pozitif yükten çıkıp negatif yüke girer.', 'Birbirini keser.', 'Kapalı halkalar oluşturur.', 'Alan şiddetinden bağımsızdır.'], 'B', 'Çizgiler pozitif yükten başlar, negatif yükte biter ve birbirini kesmez.', 1);
fz.q('elektrik-alan', 'Noktasal bir yükten uzaklık iki katına çıkarılırsa o noktadaki elektriksel potansiyel nasıl değişir?', ['Değişmez.', 'İki katına çıkar.', 'Yarıya iner.', 'Dörtte birine iner.', 'Dört katına çıkar.'], 'C', 'V = kq/d; potansiyel uzaklıkla ters orantılıdır.', 2);

fz.lesson('kondansator', 9, 'Sığa, yük ve enerji; kondansatörlerin seri ve paralel bağlanması.', [
  F('Kondansatör', 'C = Q / V', 'Düzlem kondansatör: C = ε · A / d', 'Enerji: E = ½ · C · V² = ½ · Q · V'),
  TABLE(['Bağlama', 'Eşdeğer sığa', 'Ortak olan'], ['Paralel', 'C = C₁ + C₂', 'Gerilim (V)'], ['Seri', '1/C = 1/C₁ + 1/C₂', 'Yük (Q)']),
  TIP('Kondansatörlerde seri-paralel formülleri dirençlerin tam tersidir. Levhalar arasına yalıtkan (dielektrik) konulursa sığa artar.', 'warn'),
], [card('C = Q / V', 'Sığa birimi farad (F)'), card('Seri kondansatör', '1/C = 1/C₁ + 1/C₂')]);
fz.q('kondansator', 'Sığası 4 μF olan bir kondansatör 10 V\'luk üretece bağlanıyor. Kondansatörde biriken yük kaç μC\'dir?', ['0,4', '2,5', '14', '40', '400'], 'D', 'Q = C · V = 4 · 10 = 40 μC.', 1);
fz.q('kondansator', 'Düzlem bir kondansatörün levhaları arasındaki uzaklık iki katına çıkarılırsa sığası nasıl değişir?', ['İki katına çıkar.', 'Yarıya iner.', 'Değişmez.', 'Dört katına çıkar.', 'Dörtte birine iner.'], 'B', 'C = εA/d; uzaklık arttıkça sığa ters orantılı olarak azalır.', 1);
fz.q('kondansator', 'Sığaları 3 μF ve 6 μF olan iki kondansatör seri bağlanırsa eşdeğer sığa kaç μF olur?', ['1', '2', '4,5', '9', '18'], 'B', '1/C = 1/3 + 1/6 = 1/2 → C = 2 μF.', 1);

fz.lesson('induksiyon', 11, 'Manyetik kuvvet, manyetik akı, Faraday ve Lenz yasaları.', [
  F('Manyetik kuvvet', 'Akım geçen tele: F = B · I · L · sin θ', 'Hareketli yüke: F = q · v · B · sin θ'),
  F('İndüksiyon', 'Manyetik akı: Φ = B · A · cos θ', 'Faraday: ε = −ΔΦ / Δt'),
  UL('Lenz yasası: İndüksiyon akımı, kendisini oluşturan akı değişimine karşı koyacak yöndedir (eksi işaretin anlamı).', 'Uygulamalar: Jeneratör (hareket → elektrik), elektrik motoru (elektrik → hareket), indüksiyon ocağı, transformatör.'),
], [card('Faraday', 'ε = ΔΦ / Δt'), card('Lenz', 'Akım, değişime karşı koyar')]);
fz.q('induksiyon', '0,5 T büyüklüğündeki düzgün manyetik alana dik yerleştirilmiş 2 m uzunluğundaki telden 4 A akım geçiyor. Tele etki eden manyetik kuvvet kaç N\'dir?', ['1', '2', '4', '8', '16'], 'C', 'F = B · I · L = 0,5 · 4 · 2 = 4 N.', 1);
fz.q('induksiyon', 'Bir bobinden geçen manyetik akı 0,2 saniyede 0,6 Wb değişiyor. Bobinde oluşan indüksiyon emk\'sının büyüklüğü kaç V\'tur?', ['0,12', '0,3', '1,2', '3', '30'], 'D', 'ε = ΔΦ / Δt = 0,6 / 0,2 = 3 V.', 1);
fz.q('induksiyon', 'İndüksiyon akımının yönünü belirleyen yasa aşağıdakilerden hangisidir?', ['Ohm yasası', 'Coulomb yasası', 'Lenz yasası', 'Hooke yasası', 'Snell yasası'], 'C', 'Lenz yasasına göre indüksiyon akımı akı değişimine karşı koyacak yöndedir.', 1);

fz.lesson('alternatif-akim', 9, 'Alternatif akımın etkin değerleri, transformatörler ve enerji iletimi.', [
  F('Alternatif akım', 'V_etkin = V_max / √2', 'I_etkin = I_max / √2'),
  F('Transformatör (ideal)', 'Vp / Vs = Np / Ns = Is / Ip'),
  UL('Türkiye\'de şebeke gerilimi 220–230 V, frekansı 50 Hz\'dir; prizdeki değer etkin değerdir.', 'Elektrik uzak mesafeye yüksek gerilimle iletilir: Aynı güçte akım küçülür, hatlardaki ısı kaybı (I²R) azalır.', 'Transformatörler yalnızca alternatif akımla çalışır.'),
], [card('Transformatör', 'Vp/Vs = Np/Ns'), card('Yüksek gerilimle iletim', 'Akım ve ısı kaybı azalır')]);
fz.q('alternatif-akim', 'İdeal bir transformatörün birincil sargısında 200, ikincil sargısında 50 sarım vardır. Birincil gerilim 220 V ise ikincil gerilim kaç V\'tur?', ['22', '44', '55', '110', '880'], 'C', 'Vs = Vp · Ns / Np = 220 · 50 / 200 = 55 V.', 1);
fz.q('alternatif-akim', 'Etkin değeri 220 V olan alternatif gerilimin maksimum değeri kaç V\'tur?', ['110', '220', '220√2', '440', '220/√2'], 'C', 'V_max = V_etkin · √2 = 220√2 V.', 1);
fz.q('alternatif-akim', 'Elektrik enerjisinin santrallerden şehirlere yüksek gerilimle iletilmesinin temel nedeni aşağıdakilerden hangisidir?', ['Akımı artırmak', 'Hatlardaki ısı kaybını azaltmak', 'Frekansı yükseltmek', 'Daha ince tel kullanabilmek için direnci artırmak', 'Doğru akıma çevirmek'], 'B', 'Aynı güç yüksek gerilimde küçük akımla iletilir; ısı kaybı I²R ile orantılı olduğundan azalır.', 2);

fz.lesson('cembersel', 9, 'Düzgün çembersel harekette periyot, hız, merkezcil ivme ve kuvvet.', [
  F('Çembersel hareket', 'v = 2πr / T', 'ω = 2π / T = v / r', 'Merkezcil ivme: a = v² / r', 'Merkezcil kuvvet: F = m · v² / r'),
  UL('Düzgün çembersel harekette hızın büyüklüğü sabit, yönü sürekli değişir; ivme her zaman merkeze doğrudur.', 'Virajda merkezcil kuvveti sürtünme sağlar; uyduda ise kütle çekim kuvveti sağlar.'),
  EX('Yarıçapı 2 m olan yörüngede 4 m/s süratle dolanan 3 kg\'lık cisme etki eden merkezcil kuvvet nedir?', ['a = v²/r = 16/2 = 8 m/s²', 'F = m · a = 3 · 8'], '24 N'),
], [card('Merkezcil ivme', 'v² / r'), card('Hız 2 kat', 'Merkezcil kuvvet 4 kat')]);
fz.q('cembersel', 'Yarıçapı 2 m olan çembersel yörüngede 4 m/s sabit süratle dolanan cismin merkezcil ivmesi kaç m/s²\'dir?', ['2', '4', '8', '16', '32'], 'C', 'a = v² / r = 16 / 2 = 8 m/s².', 1);
fz.q('cembersel', 'Kütlesi 2 kg olan bir cisim 0,5 m yarıçaplı çembersel yörüngede 3 m/s süratle dolanıyor. Merkezcil kuvvet kaç N\'dir?', ['6', '9', '18', '36', '72'], 'D', 'F = m · v² / r = 2 · 9 / 0,5 = 36 N.', 2);
fz.q('cembersel', 'Yarıçap sabit kalmak koşuluyla düzgün çembersel hareket yapan cismin hızı iki katına çıkarılırsa merkezcil kuvvet nasıl değişir?', ['Değişmez.', 'İki katına çıkar.', 'Dört katına çıkar.', 'Yarıya iner.', 'Sekiz katına çıkar.'], 'C', 'F ∝ v²; hız 2 kat olunca kuvvet 4 kat olur.', 1);

fz.lesson('bhh', 9, 'Yay ve basit sarkaçta basit harmonik hareket; periyodu etkileyen etkenler.', [
  F('Periyot', 'Yay-kütle sistemi: T = 2π√(m / k)', 'Basit sarkaç: T = 2π√(L / g)'),
  TABLE(['Konum', 'Hız', 'İvme / geri çağırıcı kuvvet'], ['Denge noktası', 'En büyük', 'Sıfır'], ['Uç noktalar (genlik)', 'Sıfır', 'En büyük']),
  TIP('Basit sarkacın periyodu kütleye ve (küçük açılarda) genliğe bağlı değildir; yalnızca ip boyu ve yer çekimi ivmesine bağlıdır.'),
  PLOT('Basit harmonik harekette konum zamanla sinüs biçiminde değişir.', [0, 7], [-1.5, 1.5], { label: 'x(t) = A · sin(ωt)', f: (t) => Math.sin(t) }),
], [card('Sarkaç periyodu', '2π√(L/g) — kütleden bağımsız'), card('Denge noktası', 'Hız en büyük, ivme sıfır')]);
fz.q('bhh', 'Basit sarkacın periyodu aşağıdakilerden hangisine bağlı değildir?', ['İp uzunluğu', 'Yer çekimi ivmesi', 'Sarkaç kütlesi', 'Bulunduğu gezegen', 'Sarkacın boyu'], 'C', 'T = 2π√(L/g); kütle formülde yer almaz.', 1);
fz.q('bhh', 'Bir basit sarkacın ip uzunluğu dört katına çıkarılırsa periyodu nasıl değişir?', ['Değişmez.', 'İki katına çıkar.', 'Dört katına çıkar.', 'Yarıya iner.', 'On altı katına çıkar.'], 'B', 'T ∝ √L; √4 = 2 kat.', 1);
fz.q('bhh', 'Basit harmonik hareket yapan bir cismin hızının en büyük olduğu konum aşağıdakilerden hangisidir?', ['Uç noktalar', 'Denge noktası', 'Genliğin yarısı', 'Her noktada eşittir', 'Hareketin başladığı uç nokta'], 'B', 'Denge noktasında potansiyel enerji en az, kinetik enerji ve hız en büyüktür.', 1);

fz.lesson('dalga-mekanigi', 10, 'Su dalgalarında kırılma ve kırınım, girişim (Young deneyi) ve Doppler olayı.', [
  UL('Su dalgaları derin ortamdan sığ ortama geçerken yavaşlar, dalga boyu kısalır; frekans değişmez.', 'Kırınım: Dalganın engel kenarından ya da aralıktan bükülerek yayılması. Aralık genişliği dalga boyuna yakın ya da küçükse belirgindir.', 'Girişim: İki dalganın üst üste binmesi; tepe-tepe karşılaşırsa güçlenme, tepe-çukur karşılaşırsa sönümlenme.'),
  F('Young çift yarık deneyi', 'Saçak aralığı: Δx = λ · L / d', 'λ: dalga boyu, L: perde uzaklığı, d: yarıklar arası uzaklık'),
  P('Doppler olayı: Kaynak ile gözlemci birbirine yaklaşırken algılanan frekans artar (ses tizleşir), uzaklaşırken azalır. Ambulans sireni ve radar hız ölçümü örnektir.'),
], [card('Saçak aralığı', 'Δx = λL / d'), card('Doppler (yaklaşma)', 'Algılanan frekans artar')]);
fz.q('dalga-mekanigi', 'Bir dalganın bir aralıktan geçerken belirgin biçimde kırınıma uğraması için aşağıdakilerden hangisi gerekir?', ['Aralık genişliğinin dalga boyundan çok büyük olması', 'Aralık genişliğinin dalga boyuna yakın ya da ondan küçük olması', 'Dalga frekansının sıfır olması', 'Ortamın değişmesi', 'Dalganın genliğinin büyük olması'], 'B', 'Kırınım, aralık dalga boyu mertebesindeyken belirgin olur.', 2);
fz.q('dalga-mekanigi', 'Young çift yarık deneyinde kullanılan ışığın dalga boyu artırılırsa saçak aralığı nasıl değişir?', ['Artar.', 'Azalır.', 'Değişmez.', 'Sıfır olur.', 'Önce azalır sonra artar.'], 'A', 'Δx = λL/d; dalga boyu ile doğru orantılıdır.', 1);
fz.q('dalga-mekanigi', 'Siren çalarak gözlemciye yaklaşan bir ambulansın sesi gözlemciye nasıl gelir?', ['Daha pes (düşük frekanslı)', 'Daha tiz (yüksek frekanslı)', 'Frekansı değişmeden', 'Hiç duyulmaz', 'Önce tiz sonra pes, yaklaşırken değişmez'], 'B', 'Doppler olayı: Kaynak yaklaşırken dalga tepeleri sıklaşır, algılanan frekans artar.', 1);

fz.lesson('atom-fizigi', 11, 'Bohr atom modeli, radyoaktif ışımalar, yarılanma süresi, fisyon ve füzyon.', [
  UL('Bohr modeli: Elektronlar belirli enerji düzeylerinde bulunur; üst düzeyden alt düzeye geçen elektron aradaki enerji farkı kadar foton yayar.'),
  TABLE(['Işıma', 'Yapısı', 'Çekirdekteki değişim'], ['Alfa (α)', '⁴₂He çekirdeği', 'Kütle no 4, atom no 2 azalır'], ['Beta eksi (β⁻)', 'Elektron', 'Atom no 1 artar, kütle no değişmez'], ['Gama (γ)', 'Yüksek enerjili foton', 'Kütle ve atom no değişmez']),
  F('Yarılanma', 'n yarılanma sonra kalan = İlk miktar / 2ⁿ'),
  UL('Fisyon: Ağır çekirdeğin bölünmesi (nükleer santraller, ör. uranyum-235).', 'Füzyon: Hafif çekirdeklerin birleşmesi (Güneş\'te hidrojenden helyum oluşumu).'),
], [card('Alfa ışıması', 'A − 4, Z − 2'), card('Güneş\'in enerjisi', 'Füzyon')]);
fz.q('atom-fizigi', 'Alfa ışıması yapan bir çekirdeğin kütle ve atom numarasında nasıl bir değişim olur?', ['Kütle no 4, atom no 2 azalır.', 'Kütle no değişmez, atom no 1 artar.', 'Kütle no 2, atom no 4 azalır.', 'İkisi de değişmez.', 'Kütle no 4 artar.'], 'A', 'Alfa parçacığı ⁴₂He çekirdeğidir; çekirdek 2 proton ve 2 nötron kaybeder.', 1);
fz.q('atom-fizigi', 'Yarılanma süresi 5 gün olan radyoaktif bir maddenin 80 gramından 15 gün sonra kaç gram kalır?', ['5', '10', '20', '40', '60'], 'B', '15 gün = 3 yarılanma: 80 / 2³ = 10 g.', 2);
fz.q('atom-fizigi', 'Güneş\'in enerjisini üreten nükleer tepkime türü aşağıdakilerden hangisidir?', ['Fisyon', 'Füzyon', 'Alfa bozunması', 'Beta bozunması', 'Fotoelektrik olay'], 'B', 'Güneş\'te hidrojen çekirdekleri birleşerek helyum oluşturur ve büyük enerji açığa çıkar.', 1);

// ═════════════════════════════ KİMYA ═════════════════════════════
const km = builder('ayt-kimya', 'b');

km.lesson('modern-atom', 11, 'Kuantum sayıları, orbitaller ve elektron dizilimi kuralları.', [
  TABLE(['Kuantum sayısı', 'Belirlediği'], ['Baş (n)', 'Enerji düzeyi (katman)'], ['Açısal momentum (ℓ)', 'Orbital türü: s, p, d, f'], ['Manyetik (mℓ)', 'Orbitalin uzaydaki yönelimi'], ['Spin (mₛ)', '+½ veya −½']),
  TABLE(['Alt kabuk', 'Orbital sayısı', 'En fazla elektron'], ['s', '1', '2'], ['p', '3', '6'], ['d', '5', '10'], ['f', '7', '14']),
  UL('Aufbau: Elektronlar düşük enerjili orbitalden başlayarak yerleşir: 1s 2s 2p 3s 3p 4s 3d 4p…', 'Pauli: Bir orbitalde zıt spinli en fazla iki elektron bulunur.', 'Hund: Eş enerjili orbitallere elektronlar önce tek tek, aynı spinle yerleşir.'),
  EX('₂₆Fe\'nin elektron dizilimi nedir?', ['1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶', 'Kısaca [Ar] 4s² 3d⁶'], 'Son elektron 3d orbitalinde'),
], [card('d alt kabuğu', 'En fazla 10 elektron'), card('Pauli ilkesi', 'Orbitalde en fazla 2 zıt spinli elektron')]);
km.q('modern-atom', '₁₇Cl atomunun elektron dizilimi aşağıdakilerden hangisidir?', ['1s² 2s² 2p⁶ 3s² 3p⁵', '1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁵ 3s² 3p⁶', '1s² 2s² 2p⁶ 3s¹ 3p⁶', '1s² 2s² 2p⁶ 3p⁷'], 'A', '2 + 2 + 6 + 2 + 5 = 17 elektron; son elektron 3p orbitalindedir.', 1);
km.q('modern-atom', 'Bir d alt kabuğunda en fazla kaç elektron bulunabilir?', ['2', '6', '8', '10', '14'], 'D', 'd alt kabuğunda 5 orbital vardır; her biri 2 elektron alır: 10.', 1);
km.q('modern-atom', '"Bir orbitalde zıt spinli en fazla iki elektron bulunabilir." ifadesi aşağıdakilerden hangisidir?', ['Aufbau ilkesi', 'Hund kuralı', 'Pauli dışlama ilkesi', 'Heisenberg belirsizlik ilkesi', 'Bohr postulatı'], 'C', 'Pauli ilkesine göre bir atomda dört kuantum sayısı aynı olan iki elektron bulunamaz.', 1);

km.lesson('cozeltiler', 11, 'Derişim birimleri, seyreltme, çözünürlüğe etki eden faktörler ve koligatif özellikler.', [
  F('Derişim', 'Molarite: M = n / V (L)', 'Seyreltme: M₁ · V₁ = M₂ · V₂'),
  UL('Katıların sudaki çözünürlüğü genellikle sıcaklıkla artar; gazların çözünürlüğü sıcaklık artınca azalır, basınç artınca artar (gazoz kapağı açılınca gaz çıkması).', 'Koligatif özellikler (donma noktası alçalması, kaynama noktası yükselmesi, buhar basıncı düşmesi) çözünen taneciklerin cinsine değil SAYISINA bağlıdır.'),
  TABLE(['0,1 M çözelti', 'Tanecik sayısı (iyon)', 'Donma noktası'], ['Şeker', '1', 'En yüksek'], ['NaCl', '2 (Na⁺, Cl⁻)', '↓'], ['CaCl₂', '3 (Ca²⁺, 2Cl⁻)', 'En düşük']),
], [card('Seyreltme', 'M₁V₁ = M₂V₂'), card('Koligatif özellik', 'Tanecik sayısına bağlı')]);
km.q('cozeltiler', '0,5 mol NaOH ile hazırlanan 250 mL çözeltinin molar derişimi kaçtır?', ['0,125', '0,5', '1', '2', '4'], 'D', 'M = n / V = 0,5 / 0,25 = 2 M.', 1);
km.q('cozeltiler', '2 M derişimli 100 mL çözeltiye su eklenerek hacmi 400 mL\'ye tamamlanıyor. Yeni derişim kaç M olur?', ['0,25', '0,5', '1', '4', '8'], 'B', 'M₁V₁ = M₂V₂ → 2 · 100 = M₂ · 400 → M₂ = 0,5 M.', 1);
km.q('cozeltiler', 'Aynı molar derişimdeki sulu çözeltilerden hangisinin donmaya başlama sıcaklığı en düşüktür?', ['Şeker', 'Etil alkol', 'NaCl', 'KNO₃', 'CaCl₂'], 'E', 'CaCl₂ suda 3 tanecik (Ca²⁺ + 2Cl⁻) verir; tanecik sayısı en fazla olduğu için donma noktası en çok düşer.', 2);

km.lesson('enerji', 10, 'Tepkime entalpisi, ekzotermik ve endotermik tepkimeler, Hess yasası ve oluşum entalpisi.', [
  TABLE(['', 'Ekzotermik', 'Endotermik'], ['ΔH', '< 0', '> 0'], ['Isı', 'Dışarı verir', 'Dışarıdan alır'], ['Örnek', 'Yanma, nötralleşme, donma', 'Erime, buharlaşma, suyun elektrolizi']),
  UL('Hess yasası: Bir tepkimenin ΔH değeri, izlenen yoldan bağımsızdır; ara basamakların ΔH değerleri toplanır.', 'Tepkime ters çevrilirse ΔH\'nin işareti, katsayılar n ile çarpılırsa ΔH de n ile çarpılır.', 'Elementlerin standart hâllerinin (O₂(g), C(grafit), H₂(g)) oluşum entalpisi sıfırdır.'),
  EX('C + O₂ → CO₂, ΔH = −394 kJ. 24 g karbon yanınca kaç kJ ısı açığa çıkar? (C: 12)', ['24 g C = 2 mol', '2 · 394'], '788 kJ'),
], [card('ΔH < 0', 'Ekzotermik'), card('Hess', 'ΔH yoldan bağımsız; basamaklar toplanır')]);
km.q('enerji', 'ΔH değeri negatif olan bir tepkime için aşağıdakilerden hangisi doğrudur?', ['Endotermiktir.', 'Ekzotermiktir; ortama ısı verir.', 'Ortamdan ısı alır.', 'Ürünlerin enerjisi girenlerden yüksektir.', 'Gerçekleşmesi için sürekli ısıtma gerekir.'], 'B', 'ΔH < 0 ise ürünlerin enerjisi daha düşüktür; fark ısı olarak açığa çıkar.', 1);
km.q('enerji', 'A → B ΔH₁ = −100 kJ ve B → C ΔH₂ = +40 kJ ise A → C tepkimesinin ΔH değeri kaç kJ\'dür?', ['−140', '−60', '+60', '+140', '−40'], 'B', 'Hess yasası: ΔH = −100 + 40 = −60 kJ.', 1);
km.q('enerji', 'C(k) + O₂(g) → CO₂(g) ΔH = −394 kJ tepkimesine göre 24 g karbonun yanmasıyla kaç kJ ısı açığa çıkar? (C: 12)', ['197', '394', '588', '788', '9456'], 'D', '24 g C = 2 mol; 2 · 394 = 788 kJ ısı açığa çıkar.', 2);

km.lesson('hiz', 10, 'Tepkime hızı, çarpışma teorisi, hız denklemi ve hıza etki eden faktörler.', [
  UL('Çarpışma teorisi: Tepkime için taneciklerin uygun yönelimle ve yeterli enerjiyle (aktivasyon enerjisi) çarpışması gerekir.'),
  F('Hız denklemi', 'r = k · [A]ᵐ · [B]ⁿ  (mekanizmalı tepkimede en yavaş adıma göre)', 'Katı ve saf sıvılar hız denklemine yazılmaz'),
  TABLE(['Etken', 'Etkisi'], ['Derişim artışı', 'Çarpışma sayısı artar → hız artar'], ['Sıcaklık artışı', 'Aktivasyon enerjisini aşan tanecik sayısı artar → hız artar'], ['Katalizör', 'Aktivasyon enerjisini düşürür → hız artar; ΔH değişmez'], ['Temas yüzeyi', 'Toz hâlindeki katı daha hızlı tepkir']),
], [card('Katalizör', 'Aktivasyon enerjisini düşürür'), card('r = k[A]²', '[A] 2 kat → hız 4 kat')]);
km.q('hiz', 'Katalizörün bir tepkimeye etkisi aşağıdakilerden hangisidir?', ['Tepkime entalpisini değiştirir.', 'Aktivasyon enerjisini düşürerek tepkimeyi hızlandırır.', 'Ürün miktarını artırır.', 'Denge sabitini değiştirir.', 'Tepkimede tükenir.'], 'B', 'Katalizör daha düşük aktivasyon enerjili bir yol sunar; ΔH ve denge değişmez.', 1);
km.q('hiz', 'Hız denklemi r = k[A]²[B] olan bir tepkimede yalnızca A\'nın derişimi iki katına çıkarılırsa tepkime hızı kaç katına çıkar?', ['2', '3', '4', '6', '8'], 'C', 'Hız [A]² ile orantılıdır: 2² = 4 kat.', 1);
km.q('hiz', 'Toz şekerin suda kesme şekerden daha hızlı çözünmesinin nedeni aşağıdakilerden hangisidir?', ['Sıcaklığın daha yüksek olması', 'Temas yüzeyinin daha büyük olması', 'Katalizör içermesi', 'Derişiminin farklı olması', 'Kimyasal yapısının farklı olması'], 'B', 'Tanecikler küçüldükçe suyla temas eden toplam yüzey alanı artar.', 1);

km.lesson('elektrokimya', 11, 'Yükseltgenme-indirgenme, galvanik piller, elektroliz ve korozyon.', [
  TABLE(['Kavram', 'Anlamı'], ['Yükseltgenme', 'Elektron verme; yükseltgenme basamağı artar'], ['İndirgenme', 'Elektron alma; yükseltgenme basamağı azalır'], ['Anot', 'Yükseltgenmenin olduğu elektrot'], ['Katot', 'İndirgenmenin olduğu elektrot']),
  P('Galvanik pillerde kendiliğinden gerçekleşen redoks tepkimesinden elektrik enerjisi elde edilir (Zn + Cu²⁺ → Zn²⁺ + Cu). Elektrolizde ise elektrik enerjisiyle istemsiz bir tepkime gerçekleştirilir (suyun elektrolizi, metal kaplama).'),
  UL('Korozyon: Metallerin çevreyle tepkimeye girerek aşınması (demirin paslanması).', 'Katodik koruma: Demir boru, daha aktif bir metale (magnezyum, çinko) bağlanır; bu "kurban metal" demirin yerine yükseltgenir.'),
], [card('Anot', 'Yükseltgenme'), card('Kurban metal', 'Magnezyum, çinko')]);
km.q('elektrokimya', 'Bir redoks tepkimesinde elektron veren tür için aşağıdakilerden hangisi doğrudur?', ['İndirgenir.', 'Yükseltgenir.', 'Yükseltgenme basamağı azalır.', 'Katotta bulunur.', 'Yükseltgen olarak davranır.'], 'B', 'Elektron veren tür yükseltgenir ve indirgen olarak davranır.', 1);
km.q('elektrokimya', 'Zn(k) + Cu²⁺(suda) → Zn²⁺(suda) + Cu(k) tepkimesinde indirgenen tür aşağıdakilerden hangisidir?', ['Zn', 'Cu²⁺', 'Zn²⁺', 'Cu', 'Su'], 'B', 'Cu²⁺ iki elektron alarak Cu\'ya indirgenir; Zn ise yükseltgenir.', 2);
km.q('elektrokimya', 'Toprak altındaki demir boruları korozyondan korumak için borulara bağlanan kurban metal aşağıdakilerden hangisi olabilir?', ['Bakır', 'Gümüş', 'Magnezyum', 'Altın', 'Platin'], 'C', 'Magnezyum demirden daha aktif olduğu için önce o yükseltgenir ve demiri korur.', 2);

km.lesson('karbon', 10, 'Karbonun bağ yapma özelliği, hibritleşme, karbon allotropları ve kaba-molekül formülü.', [
  TABLE(['Hibritleşme', 'Bağ', 'Geometri', 'Örnek'], ['sp³', 'Tekli', 'Düzgün dörtyüzlü, 109,5°', 'CH₄'], ['sp²', 'İkili', 'Düzlem üçgen, 120°', 'C₂H₄'], ['sp', 'Üçlü', 'Doğrusal, 180°', 'C₂H₂']),
  TABLE(['Allotrop', 'Özellik'], ['Elmas', 'En sert doğal madde; elektriği iletmez'], ['Grafit', 'Katmanlı, yumuşak; elektriği iletir (kalem ucu, elektrot)'], ['Fulleren, nanotüp, grafen', 'Nanoteknolojide kullanılan dayanıklı yapılar']),
  F('Formüller', 'Kaba formül: Atomların en basit tam sayılı oranı', 'Molekül formülü = (kaba formül)ₙ', 'C₆H₁₂O₆ → kaba formül CH₂O'),
], [card('CH₄', 'sp³, 109,5°'), card('Elektriği ileten allotrop', 'Grafit')]);
km.q('karbon', 'CH₄ molekülündeki karbon atomunun hibritleşme türü aşağıdakilerden hangisidir?', ['s', 'sp', 'sp²', 'sp³', 'sp³d'], 'D', 'Karbon dört tekli bağ yapar; düzgün dörtyüzlü geometride sp³ hibritleşmesi vardır.', 1);
km.q('karbon', 'Karbonun allotroplarından hangisi elektriği iletir?', ['Elmas', 'Grafit', 'Hiçbiri', 'Yalnızca kömür', 'Kuvars'], 'B', 'Grafitte her karbon üç bağ yapar; katmanlar arasındaki serbest elektronlar akımı iletir.', 1);
km.q('karbon', 'Molekül formülü C₆H₁₂O₆ olan glikozun kaba formülü aşağıdakilerden hangisidir?', ['C₆H₁₂O₆', 'C₃H₆O₃', 'CH₂O', 'CHO', 'C₂H₄O₂'], 'C', 'Atom sayıları 6\'ya bölünür: CH₂O.', 1);

km.lesson('organik', 11, 'Hidrokarbonlar, fonksiyonel gruplar ve günlük hayattaki organik bileşikler.', [
  TABLE(['Sınıf', 'Genel formül', 'Örnek'], ['Alkan', 'CₙH₂ₙ₊₂', 'Metan CH₄, propan C₃H₈'], ['Alken', 'CₙH₂ₙ', 'Eten C₂H₄'], ['Alkin', 'CₙH₂ₙ₋₂', 'Etin (asetilen) C₂H₂'], ['Aromatik', '—', 'Benzen C₆H₆']),
  TABLE(['Fonksiyonel grup', 'Sınıf', 'Örnek'], ['—OH', 'Alkol', 'Etanol C₂H₅OH'], ['—COOH', 'Karboksilik asit', 'Asetik asit (sirke)'], ['—CHO', 'Aldehit', 'Formaldehit'], ['—CO—', 'Keton', 'Aseton'], ['—COO—', 'Ester', 'Meyve kokuları'], ['—NH₂', 'Amin', 'Metil amin']),
  UL('Adlandırmada karbon sayısı önekleri: met (1), et (2), prop (3), büt (4), pent (5).', 'İzomerler: Molekül formülü aynı, yapısı farklı bileşikler.'),
], [card('Alken genel formülü', 'CₙH₂ₙ'), card('—COOH', 'Karboksilik asit')]);
km.q('organik', 'C₃H₈ formüllü bileşik hangi organik bileşik sınıfındandır?', ['Alken', 'Alkin', 'Alkan', 'Alkol', 'Aromatik'], 'C', 'CₙH₂ₙ₊₂ formülüne uyar (n = 3): propan, bir alkandır.', 1);
km.q('organik', '—COOH fonksiyonel grubu taşıyan bileşikler aşağıdakilerden hangisidir?', ['Alkoller', 'Aldehitler', 'Ketonlar', 'Karboksilik asitler', 'Eterler'], 'D', 'Karboksil grubu (—COOH) karboksilik asitlerin fonksiyonel grubudur; sirkedeki asetik asit buna örnektir.', 1);
km.q('organik', 'Alkenlerin genel formülü aşağıdakilerden hangisidir?', ['CₙH₂ₙ₊₂', 'CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙHₙ', 'CₙH₂ₙ₊₁OH'], 'B', 'Alkenlerde bir ikili bağ bulunur; genel formül CₙH₂ₙ\'dir.', 1);

km.lesson('enerji-kaynaklari', 8, 'Fosil yakıtlar, yenilenebilir enerji, hidrojen ve kimyadaki güncel gelişmeler.', [
  TABLE(['Kaynak', 'Özellik'], ['Kömür, petrol, doğal gaz', 'Fosil yakıt; yanınca CO₂ verir; doğal gazın ana bileşeni metan (CH₄)'], ['Güneş, rüzgâr, hidroelektrik, jeotermal, biyokütle', 'Yenilenebilir'], ['Hidrojen', 'Yandığında yalnızca su oluşur; yakıt hücrelerinde kullanılır'], ['Nükleer', 'Fisyonla büyük enerji; radyoaktif atık sorunu']),
  UL('Lityum iyon piller cep telefonu ve elektrikli araçlarda kullanılır.', 'Türkiye dünya bor rezervlerinin en büyük bölümüne sahiptir; bor bileşikleri enerji depolama ve hidrojen teknolojilerinde araştırılmaktadır.', 'Nanoteknoloji: 1–100 nm boyutundaki maddelerle yeni özellikli malzemeler üretilir.'),
  TIP('Yeşil kimya: Atık oluşturmayan, zararsız çözücüler kullanan ve enerji verimli süreçleri hedefler.', 'info'),
], [card('Doğal gaz', 'Metan (CH₄)'), card('Hidrojen yakıt', 'Ürün yalnızca su')]);
km.q('enerji-kaynaklari', 'Doğal gazın ana bileşeni aşağıdakilerden hangisidir?', ['Bütan', 'Propan', 'Metan', 'Etanol', 'Hidrojen'], 'C', 'Doğal gaz büyük oranda metandan (CH₄) oluşur.', 1);
km.q('enerji-kaynaklari', 'Yandığında ürün olarak yalnızca su oluşturan yakıt aşağıdakilerden hangisidir?', ['Metan', 'Hidrojen', 'Kömür', 'Benzin', 'Etanol'], 'B', '2H₂ + O₂ → 2H₂O; karbon içermediği için CO₂ oluşmaz.', 1);
km.q('enerji-kaynaklari', 'Aşağıdakilerden hangisi yenilenebilir bir enerji kaynağıdır?', ['Petrol', 'Kömür', 'Doğal gaz', 'Rüzgâr', 'Linyit'], 'D', 'Rüzgâr tükenmeyen, sürekli yenilenen bir kaynaktır.', 1);

// ═════════════════════════════ BİYOLOJİ ═════════════════════════════
const bi = builder('ayt-biyo', 'b');

bi.lesson('endokrin', 11, 'Hormonlar ve salgı bezleri; kan şekeri, kalsiyum ve su dengesinin düzenlenmesi.', [
  TABLE(['Bez', 'Hormon', 'Görevi'], ['Hipofiz (ön lob)', 'Büyüme hormonu, TSH, ACTH, FSH, LH, prolaktin', 'Büyüme; diğer bezleri yönetme'], ['Hipofiz (arka lob)', 'ADH, oksitosin (hipotalamusta üretilir)', 'ADH böbrekten su geri emilimini artırır'], ['Tiroit', 'Tiroksin, kalsitonin', 'Metabolizma hızı; kalsitonin kan Ca²⁺\'unu azaltır'], ['Paratiroit', 'Parathormon', 'Kan Ca²⁺ düzeyini artırır'], ['Pankreas', 'İnsülin, glukagon', 'İnsülin kan şekerini düşürür, glukagon yükseltir'], ['Böbrek üstü', 'Adrenalin, kortizol, aldosteron', 'Stres tepkisi; Na⁺ ve su dengesi']),
  TIP('Tiroksin üretimi için iyot gerekir; iyot eksikliği guatra yol açar. Bu nedenle sofra tuzu iyotlanır.', 'info'),
  P('Hormonlar kan yoluyla taşınır, hedef hücrelerdeki reseptörlere bağlanır; etkileri sinirsel iletime göre daha yavaş ama uzun sürelidir.'),
], [card('Kan şekerini düşüren', 'İnsülin'), card('ADH', 'Böbrekten su geri emilimini artırır')]);
bi.q('endokrin', 'Kandaki glikoz düzeyini düşüren hormon aşağıdakilerden hangisidir?', ['Glukagon', 'Adrenalin', 'İnsülin', 'Tiroksin', 'Kortizol'], 'C', 'İnsülin, glikozun hücrelere alınmasını ve karaciğerde glikojen olarak depolanmasını sağlar.', 1);
bi.q('endokrin', 'Kandaki kalsiyum düzeyini artıran hormon aşağıdakilerden hangisidir?', ['Kalsitonin', 'Parathormon', 'İnsülin', 'ADH', 'Oksitosin'], 'B', 'Parathormon kemiklerden kana kalsiyum geçişini artırır; kalsitonin ise tersi yönde etkilidir.', 1);
bi.q('endokrin', 'Böbreklerden suyun geri emilimini artırarak idrar miktarını azaltan hormon aşağıdakilerden hangisidir?', ['ADH', 'Glukagon', 'Tiroksin', 'Büyüme hormonu', 'Prolaktin'], 'A', 'ADH (antidiüretik hormon) toplama kanallarının suya geçirgenliğini artırır.', 1);
bi.q('endokrin', 'Tiroksin hormonunun yapısına katılan ve eksikliğinde guatra neden olan mineral aşağıdakilerden hangisidir?', ['Demir', 'Kalsiyum', 'İyot', 'Sodyum', 'Potasyum'], 'C', 'Tiroksin iyot içerir; iyot eksikliğinde tiroit bezi büyür (guatr).', 1);

bi.lesson('duyu', 10, 'Göz, kulak, deri, dil ve burunda duyu almaçları ve işleyiş.', [
  TABLE(['Göz yapısı', 'Görev'], ['Kornea', 'Işığı kırar, gözü korur'], ['İris', 'Göz bebeğinin çapını ayarlar'], ['Lens', 'Işığı retinaya odaklar (uyum)'], ['Retina', 'Çubuk hücreleri: loş ışık, siyah-beyaz; koni hücreleri: renkli ve net görme'], ['Sarı benek', 'Koni yoğun; en net görüntü'], ['Kör nokta', 'Görme siniri çıkışı; almaç yok']),
  TABLE(['Kulak', 'Yapılar', 'Görev'], ['Dış kulak', 'Kulak kepçesi, kulak yolu', 'Sesi toplar'], ['Orta kulak', 'Çekiç, örs, üzengi; östaki borusu', 'Titreşimi iletir; östaki borusu basıncı dengeler'], ['İç kulak', 'Salyangoz (Corti organı); yarım daire kanalları', 'İşitme; denge']),
  TIP('Miyop ve hipermetrop gözün odaklama kusurlarıdır; astigmatta kornea yüzeyi düzgün olmadığından görüntü bulanıklaşır. Renk körlüğü ise koni hücrelerindeki kalıtsal bir bozukluktur.', 'info'),
], [card('Renkli görme', 'Koni hücreleri'), card('Denge', 'Yarım daire kanalları')]);
bi.q('duyu', 'Gözde renkli görmeyi sağlayan almaç hücreleri aşağıdakilerden hangisidir?', ['Çubuk hücreleri', 'Koni hücreleri', 'Kornea hücreleri', 'İris hücreleri', 'Lens hücreleri'], 'B', 'Koni hücreleri parlak ışıkta çalışır ve renkleri algılar.', 1);
bi.q('duyu', 'Orta kulak ile dış ortam arasındaki basınç farkını dengeleyen yapı aşağıdakilerden hangisidir?', ['Salyangoz', 'Kulak zarı', 'Östaki borusu', 'Yarım daire kanalları', 'Üzengi kemiği'], 'C', 'Östaki borusu orta kulağı yutağa bağlar ve basıncı dengeler.', 1);
bi.q('duyu', 'Vücudun dengesini sağlamada görev yapan iç kulak yapısı aşağıdakilerden hangisidir?', ['Salyangoz', 'Corti organı', 'Yarım daire kanalları', 'Kulak kepçesi', 'Örs kemiği'], 'C', 'Yarım daire kanallarındaki sıvı hareketi baş hareketlerini algılar ve dengeyi sağlar.', 1);

bi.lesson('destek-hareket', 10, 'Kemik ve kıkırdak doku, eklemler, kas çeşitleri ve kas kasılması.', [
  UL('Kemik doku: Kemik hücreleri (osteosit), Havers kanalları; kırmızı kemik iliğinde kan hücreleri üretilir.', 'Kıkırdak doku kan damarı içermez; besinleri difüzyonla alır.', 'Eklemler: oynar (diz, omuz), yarı oynar (omurlar), oynamaz (kafatası).'),
  TABLE(['Kas', 'Görünüm', 'Denetim', 'Yeri'], ['Düz kas', 'Çizgisiz', 'İstemsiz', 'İç organlar, damarlar'], ['İskelet kası', 'Çizgili', 'İstemli', 'Kemiklere bağlı'], ['Kalp kası', 'Çizgili', 'İstemsiz', 'Kalp']),
  P('Kasılma, sarkomerlerde aktin ipliklerinin miyozin üzerinde kaymasıyla gerçekleşir; ATP ve Ca²⁺ iyonları gereklidir.'),
], [card('Kalp kası', 'Çizgili ve istemsiz'), card('Kasılma için gerekli', 'ATP ve Ca²⁺')]);
bi.q('destek-hareket', 'Kan hücrelerinin üretildiği yer aşağıdakilerden hangisidir?', ['Sarı kemik iliği', 'Kırmızı kemik iliği', 'Kıkırdak doku', 'Kemik zarı', 'Havers kanalı'], 'B', 'Alyuvar, akyuvar ve trombositler kırmızı kemik iliğinde üretilir.', 1);
bi.q('destek-hareket', 'Kalp kasının özellikleri aşağıdakilerden hangisinde doğru verilmiştir?', ['Çizgisiz ve istemli', 'Çizgisiz ve istemsiz', 'Çizgili ve istemli', 'Çizgili ve istemsiz', 'Kemiklere bağlı ve istemli'], 'D', 'Kalp kası mikroskopta çizgili görünür ama irademiz dışında çalışır.', 1);
bi.q('destek-hareket', 'Kas kasılmasında aktin ve miyozin ipliklerinin birbiri üzerinde kayabilmesi için ATP\'nin yanında gerekli olan iyon aşağıdakilerden hangisidir?', ['Na⁺', 'K⁺', 'Ca²⁺', 'Cl⁻', 'Fe²⁺'], 'C', 'Kalsiyum iyonları aktin üzerindeki bağlanma bölgelerini açarak kasılmayı başlatır.', 2);

bi.lesson('sindirim', 10, 'Sindirim kanalında kimyasal ve mekanik sindirim, yardımcı organlar ve emilim.', [
  TABLE(['Bölüm', 'Olay'], ['Ağız', 'Tükürük amilazı nişastayı maltoza parçalamaya başlar'], ['Mide', 'Pepsin ile protein sindirimi başlar; HCl ortamı asitleştirir'], ['İnce bağırsak', 'Pankreas enzimleri (tripsin, lipaz, amilaz) ve bağırsak enzimleriyle sindirim tamamlanır; villuslarla emilim'], ['Kalın bağırsak', 'Su ve mineral emilimi; bakteriler K vitamini üretir']),
  UL('Safra karaciğerde üretilir, safra kesesinde depolanır; enzim içermez, yağları küçük damlacıklara ayırır (mekanik sindirim).', 'Karbonhidrat sindirimi ağızda, protein sindirimi midede, yağ sindirimi ince bağırsakta başlar.'),
  TIP('Sindirim enzimleri hidroliz tepkimeleriyle çalışır: Büyük moleküller su kullanılarak yapı birimlerine (glikoz, amino asit, yağ asidi ve gliserol) ayrılır.'),
], [card('Protein sindirimi başlar', 'Mide (pepsin)'), card('Safra', 'Karaciğerde üretilir, enzim içermez')]);
bi.q('sindirim', 'Proteinlerin kimyasal sindirimi ilk olarak sindirim kanalının hangi bölümünde başlar?', ['Ağız', 'Yemek borusu', 'Mide', 'İnce bağırsak', 'Kalın bağırsak'], 'C', 'Midede pepsin enzimi proteinleri daha küçük peptitlere parçalar.', 1);
bi.q('sindirim', 'Safra salgısı için aşağıdakilerden hangisi doğrudur?', ['Pankreasta üretilir.', 'Proteinleri kimyasal olarak sindirir.', 'Karaciğerde üretilir ve yağları küçük damlacıklara ayırır.', 'Mide asidini artırır.', 'Nişastayı maltoza parçalar.'], 'C', 'Safra enzim içermez; yağları emülsiyon hâline getirerek lipazın etkinliğini artırır.', 2);
bi.q('sindirim', 'Sindirilmiş besinlerin büyük bölümü sindirim kanalının hangi bölümünde emilir?', ['Mide', 'Yemek borusu', 'İnce bağırsak', 'Kalın bağırsak', 'Ağız'], 'C', 'İnce bağırsaktaki villus ve mikrovillus yapıları emilim yüzeyini çok genişletir.', 1);

bi.lesson('dolasim', 12, 'Kalbin yapısı, büyük ve küçük dolaşım, kan hücreleri ve bağışıklık.', [
  FLOW('Dolaşım yolu', 'Vücut → üst ve alt ana toplardamar → sağ kulakçık', 'Sağ karıncık → akciğer atardamarı → akciğerler (küçük dolaşım)', 'Akciğer toplardamarı → sol kulakçık', 'Sol karıncık → aort → vücut (büyük dolaşım)'),
  TIP('Akciğer atardamarı kirli (CO₂\'ce zengin) kan, akciğer toplardamarı temiz (O₂\'ce zengin) kan taşır. Atardamar kalpten çıkan damardır; taşıdığı kanın temizliğiyle tanımlanmaz.', 'warn'),
  TABLE(['Kan hücresi', 'Görevi'], ['Alyuvar', 'Hemoglobinle O₂ taşır'], ['Akyuvar', 'Savunma (fagositoz, antikor)'], ['Trombosit', 'Kanın pıhtılaşması']),
  TABLE(['Bağışıklık', 'Örnek'], ['Aktif', 'Hastalığı geçirme, aşı; kalıcıdır'], ['Pasif', 'Serum, anne sütüyle antikor; geçicidir']),
], [card('Oksijenli kanı vücuda pompalayan', 'Sol karıncık'), card('Aşı', 'Aktif bağışıklık')]);
bi.q('dolasim', 'Oksijence zengin kanı aort yoluyla vücuda pompalayan kalp odacığı aşağıdakilerden hangisidir?', ['Sağ kulakçık', 'Sağ karıncık', 'Sol kulakçık', 'Sol karıncık', 'Kalp kapakçığı'], 'D', 'Sol karıncık en kalın duvarlı odacıktır ve kanı büyük dolaşıma gönderir.', 1);
bi.q('dolasim', 'Aşı ile kazanılan bağışıklık türü aşağıdakilerden hangisidir?', ['Doğal pasif', 'Yapay pasif', 'Aktif', 'Kalıtsal', 'Geçici serum bağışıklığı'], 'C', 'Aşı vücudun kendi antikorlarını üretmesini sağlar; bu aktif bağışıklıktır.', 1);
bi.q('dolasim', 'Akciğer atardamarı ile ilgili aşağıdakilerden hangisi doğrudur?', ['Oksijence zengin kan taşır.', 'Sol karıncıktan çıkar.', 'Karbondioksitçe zengin kanı akciğerlere taşır.', 'Kanı sol kulakçığa getirir.', 'Vücuda temiz kan dağıtır.'], 'C', 'Akciğer atardamarı sağ karıncıktan çıkar ve kirli kanı akciğerlere götürür.', 2);
bi.q('dolasim', 'Kanın pıhtılaşmasında görev yapan kan hücresi aşağıdakilerden hangisidir?', ['Alyuvar', 'Akyuvar', 'Trombosit', 'Lenfosit', 'Plazma'], 'C', 'Trombositler damar yaralandığında pıhtılaşma sürecini başlatır.', 1);

bi.lesson('solunum', 9, 'Soluk alıp verme mekanizması, gaz alışverişi ve gazların taşınması.', [
  TABLE(['', 'Soluk alma (inspirasyon)', 'Soluk verme (ekspirasyon)'], ['Diyafram', 'Kasılır, düzleşir', 'Gevşer, kubbeleşir'], ['Kaburgalar arası kaslar', 'Kasılır, kaburgalar yükselir', 'Gevşer'], ['Göğüs boşluğu hacmi', 'Artar', 'Azalır'], ['Akciğer basıncı', 'Atmosferden düşük', 'Atmosferden yüksek']),
  UL('Gaz alışverişi alveollerde difüzyonla olur.', 'O₂ kanda büyük oranda hemoglobine bağlı taşınır; CO₂ ise en çok bikarbonat (HCO₃⁻) iyonu olarak plazmada taşınır.', 'Solunum merkezi omurilik soğanıdır; kandaki CO₂ artışı soluk alma hızını artırır.'),
  EX('Kandaki CO₂ miktarı arttığında solunum nasıl değişir?', ['CO₂ artışı kanın pH\'sını düşürür', 'Omurilik soğanı bunu algılar', 'Soluk alıp verme hızı ve derinliği artar'], 'Solunum hızlanır'),
], [card('Soluk alma', 'Diyafram kasılır, düzleşir'), card('CO₂ taşınması', 'Çoğunlukla HCO₃⁻ olarak plazmada')]);
bi.q('solunum', 'Soluk alma sırasında diyafram kası için aşağıdakilerden hangisi doğrudur?', ['Gevşer ve kubbeleşir.', 'Kasılır ve düzleşir.', 'Hiç hareket etmez.', 'Göğüs boşluğu hacmini azaltır.', 'Akciğer basıncını artırır.'], 'B', 'Diyaframın kasılıp düzleşmesi göğüs boşluğunu genişletir, basınç düşer ve hava akciğere girer.', 1);
bi.q('solunum', 'Karbondioksit kanda en çok hangi biçimde taşınır?', ['Hemoglobine bağlı olarak', 'Plazmada çözünmüş gaz olarak', 'Bikarbonat iyonu olarak plazmada', 'Trombositlere bağlı olarak', 'Alyuvar zarında'], 'C', 'CO₂\'nin büyük kısmı alyuvarlardaki karbonik anhidraz enzimiyle bikarbonata dönüşür ve plazmada taşınır.', 2);
bi.q('solunum', 'Soluk alıp vermenin hızını düzenleyen merkez aşağıdakilerden hangisidir?', ['Beyincik', 'Omurilik soğanı', 'Uç beyin', 'Hipofiz', 'Talamus'], 'B', 'Omurilik soğanı kandaki CO₂ ve H⁺ değişimlerine göre solunum hızını ayarlar.', 1);

bi.lesson('bosaltim', 9, 'Böbreğin yapısı, nefronda idrar oluşumu ve boşaltım maddeleri.', [
  UL('Böbreğin yapısal ve işlevsel birimi nefrondur.', 'Üre, karaciğerde amonyaktan üretilir ve böbreklerle atılır.'),
  FLOW('İdrar oluşumu', 'Süzülme: Glomerulustan Bowman kapsülüne kan plazmasının süzülmesi (kan hücreleri ve büyük proteinler süzülmez)', 'Geri emilim: Glikoz, amino asit, su ve iyonların kana geri alınması (kıvrımlı kanallar, Henle kulpu)', 'Salgılama: Bazı maddelerin kandan kanala aktarılması', 'Toplama kanalı → böbrek havuzu → üreter → idrar kesesi'),
  TIP('Sağlıklı bir insanın idrarında glikoz bulunmaz; çünkü süzülen glikozun tamamı geri emilir. İdrarda glikoz görülmesi şeker hastalığının belirtisi olabilir.', 'info'),
], [card('Nefron', 'Böbreğin işlevsel birimi'), card('Üre', 'Karaciğerde üretilir')]);
bi.q('bosaltim', 'Üre aşağıdaki organlardan hangisinde üretilir?', ['Böbrek', 'Karaciğer', 'Pankreas', 'Dalak', 'İdrar kesesi'], 'B', 'Protein yıkımından oluşan zehirli amonyak karaciğerde daha az zehirli üreye dönüştürülür.', 1);
bi.q('bosaltim', 'Böbreğin yapısal ve işlevsel birimi aşağıdakilerden hangisidir?', ['Nöron', 'Alveol', 'Nefron', 'Villus', 'Sarkomer'], 'C', 'Her böbrekte yaklaşık bir milyon nefron bulunur.', 1);
bi.q('bosaltim', 'Nefronda süzülme olayı aşağıdaki yapıların hangisinde gerçekleşir?', ['Henle kulpu', 'Toplama kanalı', 'Glomerulus ile Bowman kapsülü arasında', 'Üreter', 'Böbrek havuzu'], 'C', 'Kan basıncının etkisiyle glomerulustaki kan plazması Bowman kapsülüne süzülür.', 1);

bi.lesson('ureme-sistemi', 11, 'Erkek ve dişi üreme sistemi, menstrual döngü, döllenme ve embriyonik gelişim.', [
  UL('Erkek: Testislerde sperm ve testosteron üretilir.', 'Dişi: Yumurtalıklarda (ovaryum) yumurta, östrojen ve progesteron üretilir.', 'Döllenme yumurta kanalında (fallop tüpü) gerçekleşir; zigot rahim duvarına tutunur.'),
  TABLE(['Hormon', 'Menstrual döngüdeki görevi'], ['FSH', 'Folikülün gelişmesini sağlar'], ['LH', 'Ovulasyonu (yumurtlama) başlatır; korpus luteum oluşur'], ['Östrojen', 'Rahim duvarını kalınlaştırır'], ['Progesteron', 'Rahim duvarını gebeliğe hazır tutar']),
  TABLE(['Embriyonik tabaka', 'Oluşturduğu yapılar'], ['Ektoderm', 'Sinir sistemi, deri, duyu organları'], ['Mezoderm', 'Kas, kemik, dolaşım ve boşaltım sistemi'], ['Endoderm', 'Sindirim ve solunum kanalının iç yüzeyi, karaciğer, pankreas']),
], [card('Döllenme yeri', 'Fallop tüpü (yumurta kanalı)'), card('Sinir sistemi', 'Ektoderm')]);
bi.q('ureme-sistemi', 'İnsanda döllenme genellikle nerede gerçekleşir?', ['Rahim', 'Yumurtalık', 'Fallop tüpü (yumurta kanalı)', 'Vajina', 'Plasenta'], 'C', 'Sperm ile yumurta, yumurta kanalının üst kısmında birleşir.', 1);
bi.q('ureme-sistemi', 'Menstrual döngüde ovulasyonu (yumurtlamayı) tetikleyen hormon aşağıdakilerden hangisidir?', ['FSH', 'LH', 'Progesteron', 'Oksitosin', 'Prolaktin'], 'B', 'LH miktarının ani yükselmesi olgun folikülün çatlayıp yumurtayı bırakmasını sağlar.', 1);
bi.q('ureme-sistemi', 'Embriyonik gelişimde sinir sistemi hangi tabakadan oluşur?', ['Endoderm', 'Mezoderm', 'Ektoderm', 'Plasenta', 'Amniyon'], 'C', 'Ektoderm deri, sinir sistemi ve duyu organlarını oluşturur.', 1);

bi.lesson('komunite', 10, 'Popülasyon ve komünite kavramları, türler arası ilişkiler, süksesyon ve taşıma kapasitesi.', [
  UL('Popülasyon: Belirli bir alanda yaşayan aynı tür bireylerin oluşturduğu topluluk.', 'Komünite: Aynı alanda yaşayan farklı tür popülasyonlarının bütünü.', 'Taşıma kapasitesi: Ortamın uzun süre destekleyebileceği en fazla birey sayısı.'),
  TABLE(['İlişki', 'Tür 1 / Tür 2', 'Örnek'], ['Mutualizm', '+ / +', 'Liken (mantar + alg), baklagil + azot bakterisi'], ['Kommensalizm', '+ / 0', 'Köpek balığı + vantuz balığı'], ['Parazitlik', '+ / −', 'Bit, tenya, küsküt otu'], ['Av-avcı', '+ / −', 'Tilki – tavşan'], ['Rekabet', '− / −', 'Aynı besin için yarışan türler']),
  P('Süksesyon: Bir alandaki komünitenin zamanla değişerek kararlı bir yapıya (klimaks) ulaşması. Çıplak kayada başlayan birincil süksesyonda öncü canlılar likenlerdir.'),
], [card('Mutualizm', 'İki tür de yararlanır (+/+)'), card('Birincil süksesyonda öncü', 'Liken')]);
bi.q('komunite', 'İki türün de yarar sağladığı türler arası ilişki aşağıdakilerden hangisidir?', ['Parazitlik', 'Kommensalizm', 'Mutualizm', 'Rekabet', 'Av-avcı'], 'C', 'Mutualizmde her iki tür de ilişkiden kazançlıdır (ör. liken).', 1);
bi.q('komunite', 'Çıplak kaya üzerinde başlayan birincil süksesyonda öncü canlılar aşağıdakilerden hangisidir?', ['Eğrelti otları', 'Likenler', 'Çam ağaçları', 'Otsu bitkiler', 'Böcekler'], 'B', 'Likenler kayayı aşındırarak ilk toprağı oluşturur ve diğer canlılara ortam hazırlar.', 1);
bi.q('komunite', 'Bir ortamın kaynaklarının uzun süre destekleyebileceği en fazla birey sayısına ne ad verilir?', ['Popülasyon yoğunluğu', 'Taşıma kapasitesi', 'Biyotik potansiyel', 'Süksesyon', 'Göç'], 'B', 'Taşıma kapasitesi besin, su ve yaşam alanı gibi sınırlayıcı etkenlerle belirlenir.', 1);

bi.lesson('biyoteknoloji', 10, 'Rekombinant DNA teknolojisi, PCR, DNA parmak izi, GDO ve gen tedavisi.', [
  FLOW('Rekombinant DNA ile insülin üretimi', 'İnsan insülin geni restriksiyon enzimiyle kesilir', 'Bakteri plazmiti aynı enzimle açılır', 'Gen ile plazmit DNA ligaz ile birleştirilir', 'Rekombinant plazmit bakteriye aktarılır; bakteri insülin üretir'),
  TABLE(['Uygulama', 'Açıklama'], ['PCR', 'DNA\'yı laboratuvarda kısa sürede milyonlarca kez çoğaltma'], ['DNA parmak izi', 'Adli tıp ve babalık testlerinde kimlik belirleme'], ['GDO', 'Genetiği değiştirilmiş organizma (ör. zararlıya dayanıklı bitki)'], ['Gen tedavisi', 'Kusurlu genin işlevini düzeltmeye yönelik tedavi'], ['Klonlama', 'Genetik olarak özdeş birey elde etme (Dolly koyunu, 1996)'], ['CRISPR', 'DNA\'da hedefli düzenleme yapan gen düzenleme yöntemi']),
  TIP('Biyoteknolojinin biyogüvenlik ve etik boyutları vardır: Türkiye\'de GDO\'lu ürünlerin üretimi ve ithalatı Biyogüvenlik Kanunu (2010) ile denetlenir.', 'info'),
], [card('Restriksiyon enzimi', 'DNA\'yı belirli dizilerden keser'), card('PCR', 'DNA çoğaltma')]);
bi.q('biyoteknoloji', 'DNA\'yı belirli nükleotit dizilerinden kesen enzimlere ne ad verilir?', ['Ligaz', 'Restriksiyon enzimleri', 'DNA polimeraz', 'Amilaz', 'Helikaz'], 'B', 'Restriksiyon (kesim) enzimleri genetik mühendisliğinin "makaslarıdır".', 1);
bi.q('biyoteknoloji', 'Rekombinant DNA oluşturulurken kesilen DNA parçalarını birbirine bağlayan enzim aşağıdakilerden hangisidir?', ['DNA ligaz', 'Restriksiyon enzimi', 'Pepsin', 'Lipaz', 'RNA polimeraz'], 'A', 'DNA ligaz, DNA parçaları arasında bağ kurarak onları birleştirir.', 1);
bi.q('biyoteknoloji', 'Az miktardaki DNA\'nın laboratuvarda kısa sürede çok sayıda kopyasının elde edilmesini sağlayan teknik aşağıdakilerden hangisidir?', ['Klonlama', 'PCR', 'Elektroforez', 'Aşılama', 'Fermantasyon'], 'B', 'PCR (polimeraz zincir tepkimesi) DNA\'yı döngüler hâlinde katlanarak çoğaltır.', 1);

bi.lesson('bitki', 11, 'Bitki dokuları, su ve madde taşınması, bitki hormonları ve çiçekli bitkilerde üreme.', [
  TABLE(['Doku', 'Görev'], ['Meristem', 'Bölünerek büyümeyi sağlar (kök ve gövde uçları, kambiyum)'], ['Ksilem (odun boruları)', 'Su ve mineralleri kökten yapraklara tek yönlü taşır'], ['Floem (soymuk boruları)', 'Organik maddeleri iki yönlü taşır'], ['Stoma', 'Gaz alışverişi ve terleme']),
  TABLE(['Hormon', 'Etkisi'], ['Oksin', 'Hücre uzaması, ışığa yönelim (fototropizma)'], ['Giberellin', 'Gövde uzaması, tohum çimlenmesi'], ['Sitokinin', 'Hücre bölünmesi'], ['Absisik asit', 'Kuraklıkta stomaları kapatır, tohum dormansisi'], ['Etilen', 'Meyve olgunlaşması']),
  UL('Suyun yukarı taşınmasında terleme çekimi, kohezyon-adezyon ve kök basıncı etkilidir.', 'Çiçekli bitkilerde çift döllenme: Bir sperm yumurtayı döller (zigot 2n), diğeri iki kutup çekirdeğiyle birleşir (endosperm 3n).'),
], [card('Ksilem', 'Su ve mineral, tek yönlü'), card('Etilen', 'Meyve olgunlaşması')]);
bi.q('bitki', 'Suyun ve minerallerin kökten yapraklara taşındığı iletim dokusu aşağıdakilerden hangisidir?', ['Floem', 'Ksilem', 'Meristem', 'Epidermis', 'Parankima'], 'B', 'Ksilem (odun boruları) suyu ve mineralleri tek yönlü olarak yukarı taşır.', 1);
bi.q('bitki', 'Meyvelerin olgunlaşmasını hızlandıran bitki hormonu aşağıdakilerden hangisidir?', ['Oksin', 'Giberellin', 'Sitokinin', 'Etilen', 'Absisik asit'], 'D', 'Etilen gaz hâlinde bir hormondur ve meyve olgunlaşmasını hızlandırır.', 1);
bi.q('bitki', 'Kuraklık durumunda stomaların kapanmasını sağlayan bitki hormonu aşağıdakilerden hangisidir?', ['Absisik asit', 'Oksin', 'Etilen', 'Giberellin', 'Sitokinin'], 'A', 'Absisik asit su kaybını azaltmak için stomaları kapatır.', 2);
bi.q('bitki', 'Çiçekli bitkilerde çift döllenme sonucu oluşan besin dokusunun (endosperm) kromozom sayısı aşağıdakilerden hangisidir?', ['n', '2n', '3n', '4n', '5n'], 'C', 'Bir sperm (n) ile iki kutup çekirdeği (n + n) birleşerek 3n endospermi oluşturur.', 2);

export default [fz.done(), km.done(), bi.done()];
