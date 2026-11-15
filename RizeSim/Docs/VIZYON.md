# Rize Yaşam ve Şehir Simülasyonu — Oyun Vizyonu ve Tasarım Dokümanı

> Oyun yönetmeninin özgün vizyonu. Uygulama kararları için bkz. `MIMARI.md`, aşamalar için `YOL_HARITASI.md`.

## 1. Oyunun Kimliği ve Temel Vizyonu
- **Tür ve bakış açısı:** Birinci şahıs (FPS), açık dünya yaşam ve şehir deneyimi simülasyonu.
- **Temel felsefe:** Oyunda çatışma, aksiyon ya da koşturmaca yok. Amaç Rize'nin saf günlük akışını, sokak dokusunu, yağmurunu, çay kokusunu, insanını ve "an"ı solumayı birinci şahıs gözünden yaşatmak.
- **Yönetim modeli:** Kullanıcı oyun yönetmeni koltuğunda oturup vizyonu çizer. Claude Code baş geliştirici olarak Unreal Engine 5 editörüne doğrudan bağlanıp sistemi inşa eder. Geliştirme hattı yapay zekâ odaklıdır.

## 2. Coğrafya, Harita ve Fiziksel Altyapı
- **Gerçekçi Rize topoğrafyası:** Sahil şeridinden ve çarşıdan başlayıp dik yamaçlara, merdivenli mahalle sokaklarına, çay bahçelerine ve sisli yaylalara uzanan dikey harita yapısı.
- **Veri kaynakları:** Arazi ve yükseklikler için NASA/USGS (DEM/heightmap) gerçek dünya verileri. Sokaklar, binalar, yollar ve cadde izleri için OpenStreetMap (OSM) verileri.
- **Eksiksiz altyapı (gerçek hayatta ne varsa):** Kaldırımlar, bordür taşları, yağmur suyu ızgaraları, sokak lambaları, elektrik telleri, tabelalar, çöp kovaları, dik merdivenli sokaklardaki demir korkuluklar.

## 3. Atmosfer, Hava Durumu ve Zaman Döngüsü
- **Dinamik hava olayları:** Karadeniz'in aniden bastıran sağanakları, dağlardan süzülüp şehre inen yoğun sis katmanları, Lumen ile desteklenen ıslak asfalt yansımaları.
- **24 saatlik dinamik gece-gündüz döngüsü:**
  - *Sabah:* Dağların ardındaki sis dağılır, fırınlardan simit kokusu yükselir, esnaf kepenk açar, insanlar işe yetişir.
  - *Öğle:* Çarşının en canlı, hareketli ve gürültülü anları.
  - *Akşam ve gece:* Sahilde yürüyüşler, kıraathanelerin dolup taşması. Gece çöktüğünde yamaçlardaki evlerin ve sokak lambalarının sarı ışıkları suya ve asfalta vurur.

## 4. Aktif İç Mekânlar ve Yaşam Alanı (sahte cephe yok)
- **Oyuncunun evi:** Oyuna başlanan kişisel yaşam alanı. Sahil dairesi, dik yokuşlu mahalle evi ya da sisler altındaki yayla evi seçilebilir.
- **Mahalle marketleri / bakkallar:** İçeri girip raftan ürün seçme, sepet yapma, kasada ödeme.
- **Kıraathaneler ve çay ocakları:** İnce belli bardakta taze çay, okey ve kâğıt sesleri, esnafın yerel sohbetleri.
- **Esnaf lokantaları:** Kuru fasulye, kavurma, lahana çorbası kokusunun sardığı buluşma noktaları.
- **Oto galerileri ve tamirciler:** Araç satın alma, inceleme ve bakım yaptırma.

## 5. Ulaşım, Akan Trafik ve Dolmuş Sistemi
- **Akan trafik:** Binek otomobiller, hafif ticari kamyonetler, kurye motorları.
- **Rize dolmuş kültürü:** İkonik sarı dolmuşlar. Oyuncu durağa gidip yolcu olarak binebilir ve camdan dik yokuşları, denizi izleyerek seyahat edebilir. Dilerse direksiyona geçip hat işletmeciliği yapabilir.
- **Sürüş fizikleri:** Dik yokuşlara, keskin virajlara ve yağmurla ıslanan kaygan yollara özel gerçekçi sürüş dinamikleri (FPS kokpit kamerası).

## 6. Teknik Mimari ve Geliştirme Altyapısı
- **Oyun motoru:** Unreal Engine 5.
- **Mimari:** Yüksek performans ve yapay zekânın rahat okuyabilmesi için C++ tabanlı çekirdek, görsel bağlama ve arayüzler için Blueprint.
- **Dinamik veriler:** Dükkân envanterleri, dolmuş güzergahları ve diyaloglar için JSON / DataTable.
- **Entegrasyon:** Claude Code'un doğrudan UE5 editörüne komut göndermesini sağlayan Unreal MCP köprüsü.
