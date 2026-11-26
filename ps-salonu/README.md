# PlayStation Salonu

Türkçe işletme simülasyonu: müşterileri konsollara oturt, ücret topla, büfe aç, konsolları PS3 → PS5 yükselt, günlük kira/elektrik gider hesabını yönet.
Çevrimdışı çalışır, veri toplamaz. Capacitor ile Android'e paketlenir.

## Derleme
GitHub → Actions → **PlayStation Salonu APK** → Run workflow. Çıktılar: `ps-salonu-apk` (test için APK) ve `ps-salonu-aab-google-play` (Play'e yüklenecek AAB).

## Kalıcı imza anahtarı (Play Store için zorunlu)
```bash
keytool -genkeypair -v -keystore release.jks -alias pssalonu -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.jks   # çıktıyı kopyala
```
Depo → Settings → Secrets → Actions: `PS_KEYSTORE_BASE64`, `PS_KEYSTORE_PASSWORD`, `PS_KEY_ALIAS`, `PS_KEY_PASSWORD`.
Anahtar dosyasını ve şifreleri yedekle; kaybedersen güncelleme yükleyemezsin.

## Mağaza
`store/`: 512 ikon, 1024x500 öne çıkan görsel. Gizlilik politikası: `GIZLILIK.md`. Paket adı: `com.kidmandesign.pssalonu`.
Sürüm artırmak için workflow'daki `VERSION_CODE` değerini her yüklemede yükselt.
