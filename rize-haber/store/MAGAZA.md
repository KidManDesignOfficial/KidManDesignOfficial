# Rize Haber – Google Play Yayın Rehberi

Bu klasör Play Console’a girilecek her şeyi içerir. Sırayla ilerleyin; her adımda ne yazacağınız hazır.

| Dosya | Ne için |
|---|---|
| `uygulama-simgesi-512.png` | Mağaza simgesi (512×512) |
| `one-cikan-gorsel-1024x500.png` | Öne çıkan görsel |
| `ekran-goruntuleri/01…08.png` | Telefon ekran görüntüleri (1080×1920, 8 adet) |
| `ACIKLAMA.txt` | Tam açıklama (kopyala-yapıştır) |
| `SURUM-NOTLARI.txt` | “Bu sürümdeki yenilikler” |

Yüklenecek paket: GitHub → Actions → son başarılı **Rize Haber APK** çalışması → Artifacts →
**`rize-haber-aab-google-play`** (içinden çıkan `.aab` dosyası). APK değil, **AAB** yüklenir.

---

## 0. Önemli: kapalı test zorunluluğu (en uzun adım)

13 Kasım 2023’ten sonra açılan **kişisel** geliştirici hesapları, uygulamayı herkese açmadan önce
**en az 12 test kullanıcısıyla, 14 gün kesintisiz kapalı test** yapmak zorundadır. Testçilerin 14 gün
boyunca testte kalması gerekir; erken ayrılan sayılmaz. Bu yüzden ilk iş kapalı testi başlatmaktır.
Tavsiye: güvenlik payı için **15–20 kişi** davet edin.

---

## 1. Geliştirici hesabı

1. <https://play.google.com/console> → Google hesabınızla kaydolun → **Kişisel** hesap.
2. Tek seferlik **25 ABD doları** kayıt ücreti, kimlik doğrulama ve telefon doğrulaması.
3. Geliştirici adı: **KIDMAN** · İletişim e-postası: **cikskral03@gmail.com**

## 2. Uygulama oluştur

**Tüm uygulamalar → Uygulama oluştur**

| Alan | Değer |
|---|---|
| Uygulama adı | `Rize Haber` |
| Varsayılan dil | Türkçe – tr-TR |
| Uygulama mı, oyun mu? | Uygulama |
| Ücretsiz mi, ücretli mi? | Ücretsiz |
| Beyanlar | Geliştirici Programı Politikaları ve ABD ihracat yasaları kutularını işaretleyin |

## 3. Mağaza girişi (Büyüme → Mağaza varlığı → Ana mağaza girişi)

| Alan | Değer |
|---|---|
| Uygulama adı (en fazla 30) | `Rize Haber` |
| Kısa açıklama (en fazla 80) | `Rize’nin haberleri, yaş çay fiyatı, Rizespor, hava durumu ve gezi rehberi.` (74 karakter) |
| Tam açıklama (en fazla 4000) | `ACIKLAMA.txt` dosyasının tamamı (2.300 karakter) |
| Uygulama simgesi | `uygulama-simgesi-512.png` |
| Öne çıkan görsel | `one-cikan-gorsel-1024x500.png` |
| Telefon ekran görüntüleri | `ekran-goruntuleri/` içindeki 8 dosya, numara sırasıyla |

**Mağaza ayarları:** Uygulama kategorisi **Haberler ve Dergiler** · E-posta **cikskral03@gmail.com** ·
Web sitesi (isteğe bağlı) `https://github.com/KidManDesignOfficial/KidManDesignOfficial/tree/HEAD/rize-haber`

## 4. Uygulama içeriği (Politika → Uygulama içeriği)

### Gizlilik politikası
`https://github.com/KidManDesignOfficial/KidManDesignOfficial/blob/HEAD/rize-haber/GIZLILIK.md`

### Reklamlar
**Hayır**, uygulamam reklam içermiyor.

### Uygulama erişimi
**Tüm işlevler özel erişim gerektirmeden kullanılabilir** (hesap/giriş yok).

### İçerik derecelendirmesi (IARC anketi)
- E-posta: cikskral03@gmail.com · Kategori: **Referans, Haber veya Eğitim**
- Sorulara uygulamaya göre dürüstçe yanıt verin. Uygulamanın gerçek durumu:
  - Kullanıcılar birbirleriyle **iletişim kuramaz**, içerik **paylaşamaz/yükleyemez** (paylaş düğmesi yalnızca telefonun paylaşım menüsünü açar).
  - **Konum paylaşımı yok**, **uygulama içi satın alma yok**, **kumar yok**, **reklam yok**.
  - Uygulama kendi şiddet/cinsellik içeriği üretmez; üçüncü taraf haber başlıkları gösterir (asayiş haberleri olabilir).

### Hedef kitle ve içerik
- Hedef yaş grubu: **18 ve üzeri** (haber uygulaması; çocuklara yönelik değil).
- Uygulama çocukların ilgisini çekecek şekilde tasarlanmadı: **Hayır**.

### Haber uygulamaları beyanı (zorunlu)
| Soru | Yanıt |
|---|---|
| Haber/dergi uygulaması mı? | **Evet** |
| İçeriğin tamamı/çoğu üçüncü taraflardan mı? (toplayıcı) | **Evet** – başlıklar Google Haberler üzerinden, kaynakları belirtilerek |
| Ana kuruluş türü | **Bireysel geliştirici** |
| İletişim | KIDMAN · cikskral03@gmail.com (uygulama içinde: Ayarlar → İletişim) |

Not: Google 29 Ekim 2026’da bu beyana yeni sorular ekledi; formda ek soru çıkarsa yukarıdaki gerçek
durumla yanıtlayın. Uygulama zaten kurallara uyuyor: her haberde kaynak var, içerik günceldir
(son 7–30 gün), iletişim bilgisi uygulama içinde kolay bulunur.

### Veri güvenliği
| Soru | Yanıt |
|---|---|
| Uygulama gerekli kullanıcı veri türlerinden herhangi birini topluyor ya da paylaşıyor mu? | **Hayır** |

Gerekçe (form açıklaması isterse): Uygulamada hesap, analitik veya reklam yoktur. Ayarlar, kaydedilen
haberler ve gezi listesi yalnızca cihazda saklanır. İçerik (haber, hava, maç, çay fiyatı) herkese açık
servislerden okunur; bu isteklerde kullanıcıya ait veri gönderilmez. Tüm bağlantılar HTTPS’tir.

### Diğer beyanlar
Devlet uygulaması: **Hayır** · Finansal özellikler: **Yok** · Sağlık: **Hayır** ·
COVID-19 izleme: **Hayır** · Fotoğraf/video izni: **Kullanılmıyor**

## 5. Kapalı test (Test → Kapalı test)

1. **Yeni kanal oluştur** (adı: `Kapalı test`) → **Testçiler**: e-posta listesi oluşturun, test
   kullanıcılarının Gmail adreslerini ekleyin (en az 12, öneri 15–20).
2. **Ülkeler/bölgeler:** Türkiye (isterseniz tümü).
3. **Yeni sürüm oluştur** → Play Uygulama İmzalama’yı kabul edin → `.aab` dosyasını yükleyin →
   Sürüm adı `1.7.0` · Sürüm notları: `SURUM-NOTLARI.txt`.
4. **İncelemeye gönder.** Onaylanınca “Katılım bağlantısı”nı testçilere gönderin (aşağıdaki mesaj).
5. Testçiler bağlantıdan **teste katılmalı ve uygulamayı Play Store’dan indirmeli**. 14 gün boyunca
   testten ayrılmamalılar; arada uygulamayı açıp kullanmaları yeterli.

### Testçi davet mesajı (WhatsApp vb. için)

> Merhaba! Rize için bir uygulama hazırladım: **Rize Haber** 🍃
> Rize’nin haberleri, yaş çay fiyatı, Rizespor maçları ve hava durumu tek yerde.
> Google Play’de yayınlayabilmem için 14 gün test etmen gerekiyor. 2 dakikalık iş:
> 1) Şu bağlantıdan teste katıl: [KATILIM BAĞLANTISI]
> 2) Aynı sayfadaki “Google Play’den indir” ile uygulamayı yükle
> 3) 14 gün boyunca uygulamayı silme, ara ara aç 🙏
> Gördüğün hata ya da önerin olursa uygulamada Ayarlar → Görüş bildir’den yazabilirsin. Teşekkürler!

## 6. Üretime (herkese açık) geçiş

14 gün dolunca Play Console’da **Kontrol paneli → Üretim erişimine başvur**. Kısa bir anket gelir
(testçilerin geri bildirimi, uygulamanın hazır olduğu vb.). Onay genellikle **7 gün içinde** gelir.
Ardından **Üretim → Yeni sürüm** → aynı AAB’yi seçin → yayınlayın.

## 7. Sonraki güncellemeler

1. Kodda değişiklik → GitHub derlemesi otomatik çalışır → yeni `rize-haber-aab-google-play`.
2. Her güncellemede `app.json` içindeki `version` (ör. 1.5.2) ve `android.versionCode` (bir öncekinden
   büyük tam sayı) artırılmalıdır.
3. Play Console → Üretim → Yeni sürüm → AAB’yi yükleyin → sürüm notları → yayınlayın.

**İmza anahtarını kaybetmeyin.** Play Uygulama İmzalama, ilk yüklediğiniz AAB’yi imzalayan anahtarı
“yükleme anahtarı” olarak kaydeder; sonraki tüm sürümler aynı anahtarla imzalanmalıdır.
