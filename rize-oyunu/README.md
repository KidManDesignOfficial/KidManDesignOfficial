# RİZE: Yeşil Sis — Açık Dünya FPS Prototipi

Rize'de geçen, tarayıcıda çalışan açık dünya FPS oyununun ilk oynanabilir prototipi.
Tek dosya: `index.html` (Three.js r128, CDN üzerinden). Kurulum gerektirmez.

## Çalıştırma

`index.html` dosyasını Chrome, Edge veya Firefox ile açın ve **Oyna** düğmesine basın.
Fare imleci kilitlenir; çıkmak için `Esc`.

| Tuş | İşlev |
|---|---|
| `W A S D` / ok tuşları | Yürü |
| `Shift` | Koş |
| `Boşluk` | Zıpla |
| Fare | Nişan al, sol tık ateş (basılı tutunca seri atış) |
| `R` | Şarjör değiştir |
| `Y` | Yağmuru aç/kapat |
| `N` | Gece/gündüz geçişi |
| `M` | Büyük harita |

Dokunmatik cihazlarda sol yarı joystick, sağ yarı bakış, ekranda ATEŞ / ZIPLA / R düğmeleri vardır.

## Dünya (1,6 km × 1,6 km)

| Bölge | İçerik |
|---|---|
| Kuzey | Karadeniz, çakıllı sahil, sahil yolu |
| Kıyı düzlüğü | Apartmanlar ve evlerden oluşan şehir dokusu, merkez camii |
| Liman | İskele, kırmızı-beyaz fener, balıkçı tekneleri, Türk bayrağı |
| Doğu sahil | Çay fabrikası |
| Şehrin arkası | Kale tepesi, surlar, kuleler, bayrak; sahilden kıvrılan kale yolu |
| Yamaçlar | Kontur çizgileri boyunca sıralanmış ~22.000 çay çalısı, ahşap köy evleri |
| Yukarısı | Ladin ormanı, dere vadisi, sis bulutları, yayla zirvesi |

Arazi prosedüreldir ama her açılışta aynı haritayı üretir (sabit tohum).

## Görevler

1. **Çay sepetleri (12):** Turuncu ışık sütunlarıyla işaretli; üzerinden geçince toplanır.
2. **Kaçak dronlar (8):** Bahçelerin ve simge yapıların üzerinde tur atar; vurulunca düşer.
3. **Atış hedefleri (15):** Sahil parkı, kale arkası, çay bahçeleri, yamaç ve doğu sahilinde.
4. **Keşif noktaları (5):** Merkez Camii, Rize Kalesi, Liman, Çay Fabrikası, Yayla Zirvesi.

Hepsi bitince süre gösterilir; en iyi süre tarayıcıda saklanır.

Silah yalnızca hedef tahtalarına ve dronlara karşı kullanılır; oyunda insan düşman yoktur.

## Teknik yapı

- **Arazi:** Değer gürültüsü (fBm) ve sırt gürültüsü; kıyı çizgisi, kale tepesi (Gauss), dere vadisi ve dünya kenarı ayrı ayrı modellenir.
- **Çay sıraları:** Bitkiler yalnızca `yükseklik mod 2,1 m` bandına düşen noktalara konur. Böylece sıralar gerçek bahçelerdeki gibi eş yükselti eğrilerini izler.
- **Performans:** Bina, çatı, çalı ve ağaçlar `InstancedMesh` ile çizilir (birkaç çizim çağrısı). Çarpışmalar 24 m'lik ızgara ile aranır.
- **Atış:** Hedeflere ışın izleme yapılır. Arazi ve binalar engel olarak hesaplanır, yani duvarın arkasındaki hedef vurulamaz.
- **Ses:** Silah, yağmur ve bildirim sesleri WebAudio ile anlık üretilir; harici ses dosyası yoktur.

## Bilinen sınırlar

- Grafikler düşük poligonludur; doku ve gölge yoktur.
- Binaların içine girilmez; araç ve NPC yoktur.
- Haritanın ölçeği sıkıştırılmıştır: gerçek Rize'de kıyıdan yaylaya mesafe kilometrelerce sürer.

## Yol haritası (öneri)

| Aşama | Hedef | Araç |
|---|---|---|
| 0 — Prototip (bu sürüm) | Oynanış döngüsü, atmosfer, harita düzeni | Three.js |
| 1 — Dikey dilim | Tek mahalle, gerçek ölçekli modeller, gölgeler, NPC'ler | Unity veya Unreal Engine 5 |
| 2 — Açık dünya | Uydu yükseklik verisinden (DEM) gerçek Rize arazisi, Ayder/Zilkale gibi bölgeler, araçlar, teleferik | UE5 World Partition |
| 3 — İçerik | Hikâye görevleri, yöresel müzik (kemençe, tulum), Karadeniz ağzıyla seslendirme | — |
