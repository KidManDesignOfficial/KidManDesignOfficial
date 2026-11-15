# Rize Haber

Rize'deki günlük haberleri ve hava durumunu gösteren Android uygulaması (React Native + Expo SDK 58).

## Özellikler

| Ekran | İçerik |
|---|---|
| **Haberler** | Google Haberler üzerinden son 7 günün Rize haberleri · kategoriler (Tümü, Gündem, Spor, Ekonomi, Asayiş, İlçeler) · arama · aşağı çekerek yenileme · habere dokununca uygulama içi tarayıcıda kaynağında açılır · **Kaydet** ve **Paylaş** düğmeleri |
| **Kaydedilenler** | Kaydedilen haberler telefonda saklanır, internet yokken de listelenir |
| **Hava Durumu** | Anlık durum · **24 saatlik tahmin** · 7 günlük tahmin · Rize Merkez, Çayeli, Pazar, Ardeşen, Fındıklı, Güneysu, İkizdere, Çamlıhemşin, Ayder |
| **Bildirimler** | Haberler ekranındaki 🔕/🔔 düğmesiyle açılır. Uygulama arka planda ~30 dakikada bir yeni haber kontrol eder (kesin zamanı Android belirler; pil tasarrufu modunda gecikebilir). Bildirime dokununca haber açılır. |

Haber metinleri kopyalanmaz; yalnızca başlık, kaynak ve bağlantı gösterilir (telif açısından güvenli yaklaşım).
Hava durumu verisi: [Open-Meteo](https://open-meteo.com) (ücretsiz, API anahtarı gerektirmez).

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
src/config.ts               Renkler, haber kategorileri (arama sorguları), ilçe koordinatları
src/rss.ts                  RSS okuyucu (Google Haberler + genel RSS beslemeleri)
src/notifications.ts        Arka plan haber kontrolü ve bildirimler
src/newsDiff.ts             "Hangi haberler yeni?" hesabı
src/storage.ts              Telefonda kalıcı veri (favoriler, ayarlar)
src/favorites.tsx           Favori durumu
src/components/NewsCard.tsx Haber kartı (kaydet / paylaş)
src/screens/SavedScreen.tsx Kaydedilenler
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
