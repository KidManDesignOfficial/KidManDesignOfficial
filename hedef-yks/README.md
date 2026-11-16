# Hedef YKS

TYT ve AYT'ye hazırlanan öğrenciler ve öğretmenler için mobil uygulama (Android ve iOS, Expo / React Native).
Resmî ÖSYM ve MEB kaynaklarına internet üzerinden canlı bağlanır; konu anlatımları ve sorular internetsiz de çalışır. Hesap gerekmez.

## Canlı resmî veriler

| Kaynak | Ne çekiliyor | Nasıl |
| --- | --- | --- |
| ÖSYM — `osym.gov.tr/Sayfa/SinavTakvimi` | YKS oturum tarihleri, başvuru, sonuç | Sayfa canlı indirilip ayrıştırılır; geri sayım gelecekteki resmî TYT tarihine kendiliğinden geçer |
| ÖSYM — `osym.gov.tr/SinavGrubu/Index/2` | YKS duyuruları (tarih, başlık, bağlantı) | Canlı; ana sayfada son duyuru, aranabilir liste |
| ÖSYM — `osym.gov.tr/SinavGrubu/Menu/323` + `dokuman.osym.gov.tr` | 2018–2026 TYT/AYT/YDT soru kitapçıkları ve cevap anahtarları | Yıllar ve PDF bağlantıları canlı okunur, PDF ÖSYM sunucusundan açılır |
| MEB OGM Materyal — `ogmmateryal.eba.gov.tr` | Sınıf/ders bazında konu özetleri, video konu anlatımları, MEBİ denemeleri, çıkmış soru çözümleri, puan hesaplama motoru | Her ders ve konu ekranından resmî sayfa uygulama içi tarayıcıda açılır |

- Son başarılı veri cihazda saklanır; internet yoksa "Önbellek · x dk önce" etiketiyle gösterilir, hiç veri yoksa resmî sayfayı açma seçeneği çıkar. Uydurma veri gösterilmez.
- ÖSYM açık API sunmadığı için yalnızca herkese açık sayfalar okunur. Ayrıştırıcılar gerçek sayfa kopyalarıyla test edilir (`test/osym.test.ts`).
- Canlı doğrulama: `NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/check-live.ts` (ÖSYM) ve `node --experimental-strip-types scripts/verify-sources.ts` (40 MEB bağlantısı, Playwright).
- MEB ve ÖSYM içerikleri kopyalanmaz; yayın hakları kurumlarına aittir (MEB içerikleri ticari amaçla kullanılamaz).
- Vikipedi metinleri (CC BY-SA 4.0) uygulamanın içine gömülüdür (`src/data/wiki/*.json`, `scripts/build-wiki.ts` ile üretilir; internetsiz okunur). CC BY-SA 4.0 gereği her maddede madde adı, yazarlar (geçmiş sayfası), lisans bağlantısı ve "biçim sadeleştirildi" notu gösterilir.
- Konu → madde eşlemesi (`src/data/wikiMap.ts`) tek tek doğrulandı: madde var, anlam ayrımı değil, yönlendirmeler çözüldü, konuyla ilgili. Uygun madde olmayan konu (Sayı Basamakları) boş bırakıldı.

## Özellikler

| Bölüm | İçerik |
| --- | --- |
| **Ana Sayfa** | ÖSYM takvimine bağlı geri sayım, son ÖSYM YKS duyurusu, günlük hedef halkası, seri (streak), günün sorusu, kaldığın yerden devam, zayıf konular |
| **Dersler** | TYT 10 ders + AYT 10 ders, 235 konu başlığı (ÖSYM kapsamı). Konu anlatımı → konu testi akışı |
| **Konu anlatımı** | Sınav odaklı özgün anlatım + altında uygulamaya gömülü Türkçe Vikipedi maddelerinden (CC BY-SA 4.0, 234/235 konu, 760 madde) bölüm bölüm açılan kapsamlı anlatım. Kademeli beliren bloklar, adım adım açılan örnek çözümler, çizilerek beliren fonksiyon grafikleri, zaman çizelgeleri, akış şemaları, formül kartları, sınav taktikleri, okuma ilerleme çubuğu |
| **Soru çözme** | ÖSYM biçimi (A–E), alıştırma modunda anında çözüm; yanlışta sallanma, doğruda yaylanma animasyonu |
| **Deneme** | Gerçek ders oranlarını ve soru başına süreyi koruyan mini TYT/AYT denemeleri, ders bazında net, geçmiş denemeler |
| **Sonuç** | Animasyonlu başarı halkası, D/Y/B/net, ders bazında dağılım, soru soru inceleme, başarıda konfeti |
| **Resmî Kaynaklar** | Canlı ÖSYM takvimi ve duyuruları, çıkmış soru kitapçıkları, MEB YKS hazırlık kaynakları, ÖSYM AİS/Sonuç bağlantıları |
| **Öğretmen paneli** | Ders/konu/zorluk/soru sayısı seçerek çalışma kâğıdı; cevap anahtarıyla paylaşma (WhatsApp, e-posta, yazdırma); sınıfta birlikte çözme |
| **Profil** | Haftalık soru grafiği, ders ilerlemesi, Yanlış Defteri, kaydedilen konular, 3B çevrilen bilgi kartları, net hesaplama, ayarlar |
| **Ayarlar** | Açık/koyu/sistem tema, yazı boyutu, puan türü (SAY/EA/SÖZ/DİL), günlük hedef, sınav tarihi, titreşim |

Erişilebilirlik: tüm dokunma alanlarında ekran okuyucu etiketleri; telefonda "Hareketi azalt" açıksa animasyonlar kapanır.

## İçerik durumu (v1.0.0)

- **20 ders, 235 konu — 235 konunun tamamında anlatım** (tablolar, formüller, adım adım örnekler, grafikler, zaman çizelgeleri, sınav taktikleri).
- **799 özgün, çözümlü soru** (her konuda en az 3), bilgi kartları.
- Sorular özgündür; ÖSYM çıkmış soruları ise uygulamadan ÖSYM'nin kendi PDF'leri olarak açılır.
- 16.11.2026 itibarıyla ÖSYM takviminde yalnızca 2026 yılı var; geri sayım 2027 için **tahmini** tarih (19.06.2027) kullanır ve ekranda "tahmini" yazar. ÖSYM 2027 takvimini yayımlayınca resmî tarihe kendiliğinden geçer.

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
