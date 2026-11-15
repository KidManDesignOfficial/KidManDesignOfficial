# Rize Haber

Rize'deki günlük haberleri ve hava durumunu gösteren Android uygulaması (React Native + Expo SDK 58).

## Özellikler

| Sekme | İçerik |
|---|---|
| **Haberler** | Google Haberler üzerinden son 7 günün Rize haberleri · kategoriler · arama · Kaydet / Paylaş · başlıktaki **★ Kaydedilenler** |
| **Çay** | Güncel yaş çay alım fiyatı (resmî kaynak + ilan tarihi) · önceki yıla göre değişim · **tutar hesaplayıcı** · yıllara göre fiyat grafiği · çay gündemi haberleri · kaynak bağlantıları |
| **Hava** | Anlık durum · 24 saatlik ve 7 günlük tahmin · 9 konum |
| **Rize** | Bir bakışta Rize · 12 ilçe · adın kökeni · tarihçe zaman çizelgesi · Rize’de çayın hikâyesi · resmî kaynaklar |
| **Ayarlar** | Tema (Sistem/Açık/Koyu) · 5 renk · yazı boyutu (Normal/Büyük/Çok büyük) · varsayılan hava konumu · bildirimler · kaydedilenleri temizle · hakkında ve veri kaynakları |

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
> Google Play'e yüklemek için kalıcı bir yükleme anahtarı (keystore) gerekir (bkz. “Sonraki adımlar”).

## Geliştirme

```bash
cd rize-haber
npm install
npm test            # ayrıştırıcı ve yardımcı fonksiyon testleri
npm run typecheck   # TypeScript kontrolü
npx expo start      # telefonda Expo Go ile anlık önizleme
```

## Proje yapısı

```
App.tsx                     Ana yerleşim: başlık + alt sekme çubuğu
src/config.ts               Haber kategorileri (arama sorguları), ilçe koordinatları
src/colors.ts, src/theme.tsx Renk paletleri, tema ve kullanıcı ayarları
src/tea.ts, src/teaData.ts  Çay fiyatı verisi: doğrulama, hesaplama, uzaktan güncelleme
data/cay.json               Güncel çay fiyatı (uygulama buradan okur)
src/data/rize.ts            Rize tarihçesi ve çayın hikâyesi (kaynaklarıyla)
src/components/ui.tsx       Ortak arayüz parçaları
src/rss.ts                  RSS okuyucu (Google Haberler + genel RSS beslemeleri)
src/notifications.ts        Arka plan haber kontrolü ve bildirimler
src/newsDiff.ts             "Hangi haberler yeni?" hesabı
src/storage.ts              Telefonda kalıcı veri (favoriler, ayarlar)
src/favorites.tsx           Favori durumu
src/components/NewsCard.tsx Haber kartı (kaydet / paylaş)
src/screens/SavedScreen.tsx Kaydedilenler
src/screens/TeaScreen.tsx   Çay fiyatları
src/screens/RizeScreen.tsx  Rize’yi tanı
src/screens/SettingsScreen.tsx Ayarlar
src/weather.ts              Open-Meteo istemcisi, hava kodu → Türkçe açıklama
src/time.ts                 "5 dk önce", gün adları vb.
src/screens/NewsScreen.tsx  Haber listesi
src/screens/WeatherScreen.tsx Hava durumu
test/*.test.ts              Birim testleri
```

**Kategori veya ilçe eklemek** için yalnızca `src/config.ts` dosyasını düzenlemek yeterlidir.

## Sonraki adımlar (öneri)

- Uygulama simgesi ve açılış ekranı (şu an Expo'nun varsayılanı)
- Yerel haber sitelerinin RSS beslemelerini eklemek (`src/rss.ts` genel RSS'i destekler)
- Anında bildirim (Firebase + küçük sunucu ile; şu anki sistem ~30 dk gecikmeli)
- Google Play yayını: keystore oluşturma, gizlilik politikası, mağaza görselleri
