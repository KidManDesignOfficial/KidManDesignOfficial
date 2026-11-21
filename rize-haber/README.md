# Rize Haber

Rize'deki günlük haberleri ve hava durumunu gösteren Android uygulaması (React Native + Expo SDK 58).

## Özellikler

| Sekme | İçerik |
|---|---|
| **Haberler** | Saate göre değişen Rize manzarası (Kaçkarlar, Karadeniz, çay tepeleri) ve cam kartlar · Google Haberler üzerinden son 7 günün Rize haberleri · ekran açıkken 5 dk'da bir otomatik yenileme · manşet ve gün başlıkları · kategoriler · arama · Kaydet / Paylaş · başlıktaki **★ Kaydedilenler** |
| **Rizespor** | Maç gecesi stadyum sahnesi (projektörler, tribün flaşları, saha; canlı maçta daha hareketli, Rizespor golünde havai fişek) ve cam kartlar · sıradaki maç kartı (saniye saniye geri sayım, “🍵 Çayını demle” hatırlatması) · **canlı takip:** başlama saatinden 15 dk önce açılan maç penceresinde 20 sn’de bir güncelleme, telefonda saniye saniye ilerleyen dakika ve ilerleme çubuğu · gol, devre arası, maç sonu ve kırmızı kartta ekran efekti (konfeti, flaş, bilgi şeridi) · Süper Lig’de günün skorları · son 5 maç formu, sıra ve puan · sezon özeti (iç saha / deplasman, gol ortalaması, gol yemeden biten maçlar, seri) · fikstür ve sonuçlar · Süper Lig puan durumu · kadro (mevki, yaş, uyruk, sakatlık, maç / gol / asist) ve takım liderleri · **Maç Merkezi:** Özet (maç akışı şeridi, asistli maç anları ve devre ayraçları, hakem ve seyirci), Kadro (sahada gol ve kart işaretli ilk 11’ler, öne çıkanlar, yedekler), İstatistik (hücum, pas, savunma, disiplin) ve Rekabet (puan durumu, iki takımın son 5 maçı, önceki karşılaşmalar) |
| **Çay** | Sabah çay bahçesi sahnesi (kat kat çay tepeleri, şafak güneşi, sis, savrulan yapraklar) ve cam kartlar · buharı tüten ince belli bardak · güncel yaş çay alım fiyatı (resmî kaynak + ilan tarihi) · önceki yıla göre değişim · **tutar hesaplayıcı** · yıllara göre fiyat grafiği · kaynak bağlantıları |
| **Ekonomi** | Piyasa ekranı sahnesi (ızgara, mum grafiği, canlı nokta, süzülen ₺ $ € £) ve cam kartlar · **kayan kur bandı** · TCMB döviz kurları (bayraklı) (USD, EUR, GBP, CHF, SAR, RUB, GEL; alış/satış) · gram ve ons altın · döviz çevirici · yaş çay fiyatı · çevrimdışı son veri · 10 dk'da bir otomatik yenileme |
| **Hava** | Anlık durum · 24 saatlik ve 7 günlük tahmin · 12 ilçe, Ayder ve ~480 köy, belde, yayla (eski adlarıyla aranabilir, çevrimdışı) · havaya göre canlanan sahne (güneş, ay/yıldız, bulut, yağmur, şimşek, kar, sis) · isteğe bağlı yağmur sesi |
| **Keşfet** | **Gezi:** 15 yer (yayla, doğa, tarih, müze), haritada aç, gezi listem, paylaş · **Lezzet:** 14 coğrafi işaretli ürün ve yöresel tatlar · **Kültür:** Rize bezi, horon, kemençe, tulum, şenlikler, pratik bilgiler · **Tarihçe** |
| **Ayarlar** (⚙️) | Tema (Sistem/Açık/Koyu) · 5 renk · yazı boyutu (Normal/Büyük/Çok büyük) · özelleştirme (arayüz animasyonları, hareketli arka planlar, titreşim, yağmur sesi, açılış ekranı) · varsayılan hava konumu (ilçe veya köy) · bildirimler · kaydedilenleri temizle · hakkında ve veri kaynakları |

Ayarlar başlıktaki ⚙️ düğmesindedir.

### Rizespor verisi hakkında
Maç, puan durumu ve kadro verisi ESPN’in herkese açık ama **belgelenmemiş** veri adreslerinden alınır
(`src/rizespor/api.ts`). Kaynak değişirse yalnızca `src/rizespor/api.ts` ve `src/rizespor/parse.ts` güncellenir;
gerçek yanıt örnekleriyle yazılmış testler (`test/fixtures/espn`) biçim değişikliğini hemen yakalar.
Veri resmî kulüp/TFF verisi değildir ve gecikmeli olabilir. Canlı maçta uygulama açıkken ligin günlük skor
tablosu 20 saniyede bir okunur (`src/rizespor/live.ts`); dakika iki okuma arasında telefonda ilerletilir.
Maç hatırlatmaları telefonda zamanlanır; uygulama kapalıyken gelen skor bildirimleri arka plan görevine bağlı
olduğundan (Android en sık 15 dakikada bir çalıştırır) gecikmeli gelebilir.

Haber metinleri kopyalanmaz; yalnızca başlık, kaynak ve bağlantı gösterilir.

## Çay fiyatını güncelleme (APK gerekmez)

Yaş çay alım fiyatı yılda bir kez (genellikle Mayıs’ta) açıklanır. Yeni fiyat açıklandığında:

1. `rize-haber/data/cay.json` dosyasında `current`, `history`, `updatedAt`, `notes` ve `links` alanlarını güncelleyin.
   Kaynak (`sourceUrl`) mutlaka resmî bir duyuru olmalı (Tarım ve Orman Bakanlığı / ÇAYKUR).
2. `npm test` çalıştırın (dosyanın biçimi test edilir).
3. Değişikliği deponun **varsayılan dalına** birleştirin.

Uygulama açılışta bu dosyayı `raw.githubusercontent.com/.../HEAD/rize-haber/data/cay.json` adresinden okur ve
doğrular; dosyaya ulaşamazsa son indirdiği ya da APK’ya gömülü kopyayı gösterir. Biçimi bozuk bir dosya asla
gösterilmez.

## APK'yı indirme

1. GitHub'da depoya gidin → **Actions** sekmesi → **Rize Haber APK**.
2. `rize-haber/` klasörüne yapılan her gönderimde otomatik çalışır; elle çalıştırmak için **Run workflow**.
3. Tamamlanan çalışmanın altındaki **Artifacts** bölümünden `rize-haber-apk` dosyasını indirin, zip'i açın.
4. APK'yı telefona atıp kurun (Android "bilinmeyen kaynaklardan yükleme" izni ister).

> Bu APK, Expo'nun hata ayıklama anahtarıyla imzalanır: kendi telefonunuzda denemek için uygundur.
> Kalıcı imza anahtarı tanımlanana kadar APK hata ayıklama anahtarıyla imzalanır (bkz. “İmza anahtarı”).

## İmza anahtarı (Google Play için zorunlu)

Yayın APK'sı, depo **Secrets** bölümünde tanımlı kalıcı anahtarla imzalanır (`plugins/withReleaseSigning.js`).
Tanımlı değilse derleme yine çalışır ama hata ayıklama anahtarı kullanılır ve sayfada uyarı çıkar.

GitHub → depo → **Settings → Secrets and variables → Actions → New repository secret**:

| Ad | Değer |
|---|---|
| `RIZE_KEYSTORE_BASE64` | `rize-haber-release.jks.base64` dosyasının tüm içeriği |
| `RIZE_KEYSTORE_PASSWORD` | `sifreler.txt` içindeki şifre |
| `RIZE_KEY_PASSWORD` | `sifreler.txt` içindeki şifre |
| `RIZE_KEY_ALIAS` | `rizehaber` |

> **Anahtar dosyasını ve şifreyi kaybetmeyin; depoya asla eklemeyin.** Kaybedilirse Play Store'daki
> uygulama bir daha güncellenemez. En az iki ayrı yerde (ör. şifre yöneticisi + harici disk) yedekleyin.

Her derlemede "İmzayı doğrula" adımı APK'nın hangi anahtarla imzalandığını kayda yazar.
Kalıcı anahtara geçildikten sonra telefondaki eski (hata ayıklama imzalı) sürüm **bir kez kaldırılıp**
yenisi kurulmalıdır; Android farklı imzalı sürümün üzerine kurulumu reddeder.

## Gizlilik

[GIZLILIK.md](GIZLILIK.md) – uygulama içinde Ayarlar → Gizlilik politikası.

## Geliştirme

```bash
cd rize-haber
npm install
npm test            # ayrıştırıcı ve yardımcı fonksiyon testleri
npm run typecheck   # TypeScript kontrolü
npm run lint        # ESLint (Expo kuralları)
npx expo start      # telefonda Expo Go ile anlık önizleme
```

## Proje yapısı

```
App.tsx                     Ana yerleşim: başlık + alt sekme çubuğu
src/config.ts               Haber kategorileri (arama sorguları), ilçe koordinatları
src/places.ts               İlçe + köy/belde/yayla listesi, Türkçe duyarsız arama (saf, test edilir)
src/data/rizePlaces.ts      Köy ve yayla konumları — GeoNames (CC BY 4.0), scripts/rize-places.py üretir
src/components/LocationPicker.tsx Konum seçici (arama, ilçeye göre köyler)
src/colors.ts, src/theme.tsx Renk paletleri, tema ve kullanıcı ayarları
src/tea.ts, src/teaData.ts  Çay fiyatı verisi: doğrulama, hesaplama, uzaktan güncelleme
data/cay.json               Güncel çay fiyatı (uygulama buradan okur)
src/data/rize.ts            Rize tarihçesi ve çayın hikâyesi (kaynaklarıyla)
src/data/discover.ts        Gezilecek yerler, lezzetler, kültür (kaynaklarıyla)
src/rizespor/                Rizespor: veri okuma (api, parse), canlı takip (live), sezon özeti (season), diziliş, hatırlatmalar
src/screens/rizespor/       Rizespor ekranları: maçlar, puan, kadro, Maç Merkezi, saha, kutlama efektleri
src/components/ui.tsx       Ortak arayüz parçaları
src/rss.ts                  RSS okuyucu (Google Haberler + genel RSS beslemeleri)
src/notifications.ts        Arka plan haber kontrolü ve bildirimler
src/newsDiff.ts             "Hangi haberler yeni?" hesabı
src/newsFeed.ts             Haber akışı: otomatik yenileme, manşet, gün bölümleri, kaynak rozeti
src/storage.ts              Telefonda kalıcı veri (favoriler, ayarlar)
src/favorites.tsx           Favori durumu
src/components/NewsCard.tsx Haber kartı (kaydet / paylaş)
src/screens/SavedScreen.tsx Kaydedilenler
src/screens/TeaScreen.tsx   Çay fiyatları
src/screens/EconomyScreen.tsx Ekonomi: döviz, altın, çevirici
src/markets.ts              TCMB kur ve altın verisi (ayrıştırma, hesap; saf, test edilir)
src/appState.ts             Uygulama ön planda mı? (otomatik yenilemeler için)
src/screens/RizeScreen.tsx  Rize’yi tanı
src/screens/SettingsScreen.tsx Ayarlar
src/weather.ts              Open-Meteo istemcisi, hava kodu → Türkçe açıklama
src/time.ts                 "5 dk önce", gün adları vb.
src/screens/NewsScreen.tsx  Haber listesi
src/screens/WeatherScreen.tsx Hava durumu (cam kartlar)
src/components/WeatherScene.tsx Canlı hava sahnesi (yerel sürücüde animasyon)
src/components/RizeScene.tsx Haberler arka planı: Rize manzarası, saate göre renk (src/rizeScene.ts)
src/components/StadiumScene.tsx Rizespor maç gecesi sahnesi (renkler: src/rizespor/stadium.ts)
src/components/TeaScene.tsx  Çay arka planı: sabah çay bahçesi (renkler: src/teaScene.ts)
src/components/EconomyScene.tsx Ekonomi arka planı: piyasa ekranı (renkler ve grafikler: src/economyScene.ts)
src/components/HeroCard.tsx  Ekran vitrin kartı (geçiş, filigran, dağ silueti)
src/weatherScene.ts          Hava kodu → sahne (saf, test edilir)
src/rainSound.ts             İsteğe bağlı yağmur sesi (varsayılan kapalı)
design/make-rain-sound.py    Özgün yağmur sesi sentezleyici → assets/sounds/rain.m4a
test/*.test.ts              Birim testleri
```

**Kategori veya ilçe eklemek** için yalnızca `src/config.ts` dosyasını düzenlemek yeterlidir.

## Sonraki adımlar (öneri)

- Yerel haber sitelerinin RSS beslemelerini eklemek (`src/rss.ts` genel RSS'i destekler)
- Anında bildirim (Firebase + küçük sunucu ile; şu anki sistem ~30 dk gecikmeli)
- Google Play yayını: mağaza görselleri ve açıklama metni (imza anahtarı ve gizlilik politikası hazır)
- Hata izleme (ör. Sentry) – kullanıcı cihazlarındaki çökmeleri görmek için
