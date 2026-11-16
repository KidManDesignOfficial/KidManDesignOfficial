# Hedef YKS

TYT ve AYT'ye hazırlanan öğrenciler ve öğretmenler için mobil uygulama (Android ve iOS, Expo / React Native).
İnternet ve hesap gerektirmez; tüm ilerleme cihazda saklanır.

## Özellikler

| Bölüm | İçerik |
| --- | --- |
| **Ana Sayfa** | YKS 2027 geri sayımı, günlük hedef halkası, seri (streak), günün sorusu, kaldığın yerden devam, zayıf konular |
| **Dersler** | TYT 10 ders + AYT 10 ders, 235 konu başlığı (ÖSYM kapsamı). Konu anlatımı → konu testi akışı |
| **Konu anlatımı** | Kademeli beliren bloklar, adım adım açılan örnek çözümler, çizilerek beliren fonksiyon grafikleri, zaman çizelgeleri, akış şemaları, formül kartları, sınav taktikleri, okuma ilerleme çubuğu |
| **Soru çözme** | ÖSYM biçimi (A–E), alıştırma modunda anında çözüm; yanlışta sallanma, doğruda yaylanma animasyonu |
| **Deneme** | Gerçek ders oranlarını ve soru başına süreyi koruyan mini TYT/AYT denemeleri, ders bazında net, geçmiş denemeler |
| **Sonuç** | Animasyonlu başarı halkası, D/Y/B/net, ders bazında dağılım, soru soru inceleme, başarıda konfeti |
| **Öğretmen paneli** | Ders/konu/zorluk/soru sayısı seçerek çalışma kâğıdı; cevap anahtarıyla paylaşma (WhatsApp, e-posta, yazdırma); sınıfta birlikte çözme |
| **Profil** | Haftalık soru grafiği, ders ilerlemesi, Yanlış Defteri, kaydedilen konular, 3B çevrilen bilgi kartları, net hesaplama, ayarlar |
| **Ayarlar** | Açık/koyu/sistem tema, yazı boyutu, puan türü (SAY/EA/SÖZ/DİL), günlük hedef, sınav tarihi, titreşim |

Erişilebilirlik: tüm dokunma alanlarında ekran okuyucu etiketleri; telefonda "Hareketi azalt" açıksa animasyonlar kapanır.

## İçerik durumu (v1.0.0)

- **20 ders, 235 konu** başlığının tamamı katalogda.
- **49 konu anlatımı**, **217 özgün, çözümlü soru**, **123 bilgi kartı**. Her dersin en az 2 konusu tam anlatımlı.
- Anlatımı henüz yazılmamış konular listede "Anlatım hazırlanıyor" olarak görünür.
- Sorular özgündür; ÖSYM çıkmış sorusu değildir.
- YKS 2027 tarihi ÖSYM 2027 takviminden: **TYT 19 Haziran 2027**, **AYT ve YDT 20 Haziran 2027**.

### Yeni içerik eklemek

Her şey `src/data/subjects/*.ts` dosyalarındadır. Konu kimlikleri `src/data/curriculum.ts`'teki katalogla eşleşir.

```ts
b.lesson('konu-kisa-adi', 10, 'Bir cümlelik özet', [H('Başlık'), P('Metin'), F('Formül', 'a² + b² = c²'), EX('Soru', ['Adım 1'], 'Cevap')], [card('Ön', 'Arka')]);
b.q('konu-kisa-adi', 'Soru metni', ['A', 'B', 'C', 'D', 'E'], 'C', 'Çözüm açıklaması', 2);
```

`npm test` tüm içeriği doğrular: bilinmeyen konu kimliği, 5 farklı seçenek, geçerli cevap, açıklama, tablo sütunları, ÖSYM soru sayıları (TYT 120, AYT 160).

## Geliştirme

```bash
cd hedef-yks
npm ci
npm test            # içerik ve mantık testleri
npx tsc --noEmit    # tip kontrolü
npm run lint
npx expo start      # Expo Go / geliştirme derlemesi
npx expo start --web
```

Simgeler: `node design/make-icons.js assets` (Playwright gerekir).

## APK / AAB derleme (GitHub Actions)

`hedef-yks/**` altında her push'ta **Hedef YKS APK** iş akışı çalışır: testler → prebuild → imzalı APK + Google Play AAB → emülatörde açılış testi. Dosyalar Actions sayfasında "Artifacts" altındadır.

### İmza anahtarı

Google Play'e yüklemek için kalıcı anahtar gerekir (Rize Haber'den ayrı bir anahtar kullanın):

```bash
keytool -genkeypair -v -keystore hedef-yks.jks -alias hedefyks -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Hedef YKS, O=KidMan Design, C=TR"
base64 -w0 hedef-yks.jks
```

Depo → Settings → Secrets and variables → Actions:
`YKS_KEYSTORE_BASE64`, `YKS_KEYSTORE_PASSWORD`, `YKS_KEY_ALIAS` (hedefyks), `YKS_KEY_PASSWORD`.
Anahtar tanımlı değilse derleme hata ayıklama anahtarıyla devam eder (Play kabul etmez). Sertifikadaki `CN=Hedef YKS` iş akışında doğrulanır.

## Gizlilik

Hesap yok, sunucu yok, analitik yok. İlerleme, cevaplar ve ayarlar yalnızca AsyncStorage'da (cihazda) tutulur.
