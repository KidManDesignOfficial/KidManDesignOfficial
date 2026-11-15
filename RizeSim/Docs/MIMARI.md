# Teknik Mimari

## 1. Katmanlar

```
┌─────────────────────────────────────────────────────────────────────┐
│ Blueprint / UMG / Niagara / Malzemeler   (görsel bağlama, sanat)    │
├─────────────────────────────────────────────────────────────────────┤
│ UE C++ oyun sistemleri                                               │
│   Alt sistemler: Time, Weather, Traffic (World), Data (GameInstance) │
│   Aktörler: Player, Shop/Shelf/Register/Service, Door, Dolmus, Stop, │
│             RoadPath, TrafficSpawner, DrivableVehicle, NPC, Sky…     │
├─────────────────────────────────────────────────────────────────────┤
│ Sim/ — motordan bağımsız çekirdek (saf C++20, test edilir)            │
│   RizeClock · RizeSolar · RizeWeatherModel · RizeDriving ·           │
│   RizeEconomy · RizeSchedule                                         │
├─────────────────────────────────────────────────────────────────────┤
│ Veri: Content/Data/*.json   ·   Arazi: Content/Terrain/*             │
└─────────────────────────────────────────────────────────────────────┘
        ▲                                       ▲
  Tools/geo (DEM, OSM)                   Tools/mcp (Claude Code ↔ editör)
```

**İlke:** oyun kuralları (güneş ne zaman doğar, sağanak ne hızla bastırır, ıslak arnavut kaldırımında tutuş ne olur, kasada ne kadar ödenir) `Sim/` katmanında, Unreal'dan bağımsız yaşar. Böylece:
1. Kurallar editör açılmadan, saniyeler içinde test edilir (CI).
2. Yapay zekâ geliştirici kuralı okuyup değiştirirken motor ayrıntısına takılmaz.
3. UE sınıfları ince sarmalayıcılardır: kuralı çağırır, sonucu ekrana ve sese taşır.

## 2. Zaman ve atmosfer veri akışı

```
URizeTimeSubsystem (FClock, TimeScale)
   ├─ her kare: Solar::Compute(gün, saat, Rize enlem/boylam) → güneş yükseklik/azimut
   ├─ OnHourChanged ─────────► dükkanlar (açık/kapalı, stok), NPC'ler (program), ev ışıkları
   ├─ OnPhaseChanged ────────► ortam sesleri, kalabalık
   └─ OnStreetLightsChanged ─► URizeNightLightComponent (0–8 sn dağınık yanma)

URizeWeatherSubsystem (FWeatherModel; oyun saatiyle ilerler)
   ├─ MPC: Wetness, Puddles, RainIntensity, FogDensity, Wind, SunElevation → tüm malzemeler
   ├─ Niagara yağmur (oyuncu kamerasına bağlı)
   ├─ OnWeatherChanged ──────► NPC (şemsiye, saçak altına kaçış), diyalog bağlamı
   └─ GetSurfaceGrip() ──────► araç tekerlekleri, YZ trafik hız planı

ARizeSkyController: güneş/ay yönü + şiddeti, gök ışığı, sis yoğunluğu/yükseklik sönümü
```

### Hava modeli
- 5 durum: Açık, Bulutlu, Çisenti, Sağanak, Sis. 20 oyun dakikasında bir Markov geçişi.
- Geçiş olasılıkları **mevsime** (Rize aylık yağış oranları; Ekim en yağışlı) ve **saate** göre değişir (sis şafakta 3×, öğlen 0,4×).
- Sağanak "aniden bastırır": yağış yoğunluğu saatte 12 hızla yaklaşır, 10 oyun dakikasında %80'i geçer.
- Islaklık ve birikinti ayrı birikir ve ayrı kurur. Yağmur dinince sokak saatlerce ıslak kalır. Kuruma hızı güneş ve rüzgârla artar.
- Deterministik RNG: kayıt dosyası havayı da sürdürür.

## 3. Etkileşim

`IRizeInteractable` → `GetInteractionPrompt`, `GetSecondaryPrompt`, `CanInteract`, `Interact`, `InteractSecondary`.
Oyuncu 0,1 sn'de bir kameradan 2,5 m ışın atar ve odak değişince `OnFocusChanged(prompt, secondary)` yayınlar. UMG bu olayı dinler.
Oturan oyuncu (dolmuş) için etkileşim, oturduğu aracın sahibine yönlenir ("İnecek var!").

## 4. Alışveriş akışı
```
Raf (E) → Shop.TakeOne → Wallet.AddToCart(shopId)        (Q: rafa geri koy)
Kasa (E) → Wallet.Checkout(shop.IsOpenNow) → FCart::Checkout (kuruş, tam sayı)
         → başarılı: ürünler çantaya, para düşer, esnaf "Hayırlı olsun"
Dükkandan sepetle çıkış → ürünler rafa döner (hırsızlık mekaniği yok)
Servis tezgahı (çay ocağı/lokanta): anında ödeme → gecikmeli masaya servis
```

## 5. Ulaşım

### Yapay zekâ trafiği (kinematik)
`URizeSplineFollowerComponent`, `Driving::PlanTargetSpeed` ile her karede hedef hız hesaplar ve **en küçüğü** seçer:
- hız sınırı × sürücü mizacı × eğim çarpanı (inişte daha yavaş)
- ileri bakıştaki en dar virajın konfor hızı (yanal 0,3 g; ıslakta tutuş sınırı)
- duraksama noktasına durabilme hızı
- öndeki araca güvenli takip: `v² ≤ v_ön² + 2·a·boşluk` ve zaman aralığı kuralı
- yolda yürüyen oyuncu (yaya önceliği)

Fizik yerine kinematik seçilmesinin nedeni yüzlerce aracın ucuz ve kararlı çalışması. Oyuncunun sürdüğü araç ise tam Chaos fiziğidir.

### Dolmuş
`ARizeDolmusLineManager` tur süresini sefer aralığına bölerek araç sayısını hesaplar ve araçları hatta eşit aralıkla dizer.
`ARizeDolmus` durumları: **Yolda → Durakta → Yolda**. Sefer saatleri dışında son durağa gidip garaja çekilir.
Durakta durma koşulu: bekleyen var ve koltuk boş, **ya da** içeride inecek var.

## 6. Veri
`URizeDataSubsystem` açılışta JSON'ları `FJsonObjectConverter` ile USTRUCT'lara okur ve dükkan → ürün çapraz doğrulaması yapar.
Paketli oyunda okunabilmeleri için `DirectoriesToAlwaysStageAsNonUFS=Data` ayarlıdır. Editörde `RizeVeriYenile` komutu verileri yeniden yükler.

| Dosya | İçerik |
|---|---|
| `products.json` | Ürün kimliği, ad, kategori, fiyat (kuruş), servis ürünü mü |
| `shops.json` | Dükkan türü, açılış/kapanış, kapalı günler, stok, dükkana özel fiyat, ortam sesi |
| `dolmus_lines.json` | Hat, güzergah (pathId), ücret, sefer saatleri, sefer aralığı, duraklar |
| `schedules.json` | NPC günlük programı (saat aralığı, etkinlik, konum etiketi, gün maskesi) |
| `dialogue.json` | Bağlama duyarlı replikler (konuşan, faz, hava, mekan, ağırlık) |
| `vehicles.json` | Galeri araçları, fiyat, bakım ücreti, Blueprint sınıfı |
| `home_spawns.json` | Gerçek araziden seçilmiş ev başlangıç noktaları |
| `layout_<bölge>.json` | OSM'den üretilen şehir yerleşimi (araçla üretilir) |

## 7. Koordinat ve birim kuralları
| Konu | Kural |
|---|---|
| Eksen | +X Doğu, +Y Güney, +Z Yukarı (UE sol el), cm |
| Projeksiyon | Bölge merkezli yerel teğet düzlem, WGS84 yay uzunlukları. 5 km'de < 1 m hata |
| Yükseklik | Mutlak. Z 0 = deniz seviyesi |
| Para | `int64` kuruş |
| Saat | `double` 0–24, Türkiye UTC+3 sabit |

## 8. Performans notları
- Trafik lider araması O(n²). Yol başına < 200 araç için yeterli. Ölçeklenirse yol başına sıralı liste tutulmalı.
- İçe aktarılan lamba ve ızgaralar aktör olarak yerleşir. Sayılar on binleri bulursa HISM ya da PCG'ye taşınmalı (yol haritası M2).
- Yağmur yalnızca oyuncu çevresinde simüle edilir. Islaklık küresel MPC ile ucuzdur.
