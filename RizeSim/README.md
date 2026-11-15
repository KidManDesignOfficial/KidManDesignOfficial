# Rize Yaşam ve Şehir Simülasyonu

Birinci şahıs, açık dünya, **çatışmasız** bir yaşam simülasyonu. Konusu Rize'nin gündelik akışı: yağmur, sis, çay, çarşı, dolmuş ve yokuşlar.
Motor: **Unreal Engine 5.5** · Çekirdek **C++**, görsel bağlama **Blueprint**, veriler **JSON**.
Geliştirme hattı: oyun yönetmeni vizyonu çizer, Claude Code **Unreal MCP köprüsü** üzerinden editöre komut gönderir.

> Vizyon dokümanı: [`Docs/VIZYON.md`](Docs/VIZYON.md)

---

## 1. Durum: ne hazır, ne değil

Bu depo oyunun **teknik temelidir (Milestone 0)**. Henüz oynanabilir, sanat varlıkları eklenmiş bir sürüm değildir. Bu ayrım bilerek açık tutulmuştur.

| Katman | Durum | Doğrulama |
|---|---|---|
| Simülasyon çekirdeği (saat, güneş, hava, sürüş, ekonomi, NPC programı) | ✅ Hazır | 206 C++ birim kontrolü, g++ ve clang |
| UE5 C++ oyun sistemleri (33 sınıf, 12 yapı, 7 enum) | ✅ Yazıldı | Statik tutarlılık denetimi. **Editörde derlenmesi gerekiyor** (bkz. §6) |
| Oyun verisi (37 ürün, 9 dükkan, 3 dolmuş hattı, 6 NPC programı, 33 replik, 6 araç) | ✅ Hazır | `Tools/validate_data.py` |
| Gerçek Rize arazisi (merkez 5,6 km², Ayder 4 km²) | ✅ Üretildi | 16 bit yükseklik haritası + Landscape ölçek değerleri |
| OSM → yerleşim dönüştürücü + türetilmiş altyapı | ✅ Hazır | Birim testleri. Gerçek OSM indirmesi kullanıcı tarafında (§4.2) |
| Editör kurulum ve içe aktarım betikleri | ✅ Yazıldı | Geometri çekirdeği test edildi. Editör adımları UE'de çalıştırılmalı |
| Unreal MCP köprüsü | ✅ Hazır | Protokol ve sahte Remote Control sunucusuyla 7 test |
| 3B modeller, malzemeler, sesler, animasyonlar, UI | ⛔ Yok | Sanat üretimi gerekiyor (bkz. [`Docs/YOL_HARITASI.md`](Docs/YOL_HARITASI.md)) |

## 2. Vizyon → uygulama eşlemesi

| Vizyon maddesi | Karşılığı |
|---|---|
| FPS, çatışmasız, "an"ı soluma | `ARizePlayerCharacter`: sakin yürüyüş, koşu yerine "hızlı adım", yokuşta yavaşlama, yumuşak kafa sallanması |
| Gerçek topoğrafya (NASA/USGS) | `Tools/geo/fetch_dem.py` → `Content/Terrain/*_heightmap.png` |
| Sokaklar, binalar (OSM) | `Tools/geo/osm_to_rize.py` → `Tools/ue_python/rize_import_layout.py` |
| Bordür, ızgara, lamba, tel, korkuluk, kova | OSM'de eksikse otomatik türetilir (`derive_road_infrastructure`) |
| Ani sağanak, inen sis, ıslak asfalt | `FWeatherModel` (Markov, mevsimsel) → `URizeWeatherSubsystem` → MPC `Wetness/Puddles` → Lumen |
| 24 saat döngü, sabah/öğle/akşam/gece | `FClock` + NOAA güneş konumu (`RizeSolar.h`), `ARizeSkyController` |
| Gece yamaçlardaki ışıklar | `URizeNightLightComponent`: lambalar dağınık yanar, evler gece yarısı söner |
| Oyuncunun evi (sahil / mahalle / yayla) | `ERizeHome`, `ARizeGameMode`, `home_spawns.json` (gerçek araziden seçildi) |
| Bakkal: raf → sepet → kasa | `ARizeShop`, `ARizeShelfItem`, `ARizeCashRegister`, `URizeWalletComponent` |
| Kıraathane, çay ocağı, esnaf lokantası | `ARizeServiceCounter` ("E: Bir çay!", "Q: Menü") + `ARizeAmbientZone` |
| Oto galeri, tamirci | `ARizeDealerSpot`, `ARizeRepairBay` (lastik + genel bakım) |
| Akan trafik | `URizeSplineFollowerComponent` + `ARizeTrafficSpawner` (saate göre yoğunluk) |
| Sarı dolmuş: yolcu olarak binmek | `ARizeDolmus`, `ARizeDolmusStop`, `ARizeDolmusLineManager` |
| Dolmuş: hat işletmeciliği | `URizeDolmusOperatorComponent` (durakta dur, yolcu al, hasılat) |
| Yokuş, viraj, ıslak yolda sürüş | `ARizeDrivableVehicle` (Chaos), tekerlek başına zemin × ıslaklık × lastik tutuşu |
| JSON/DataTable altyapısı | `URizeDataSubsystem` + `Content/Data/*.json` |
| Unreal MCP köprüsü | `Tools/mcp/rize_unreal_mcp.py`, depo kökünde `.mcp.json` |

## 3. Klasör yapısı

```
RizeSim/
├─ RizeSim.uproject            UE 5.5 projesi (Lumen, VSM, Nanite, hacimsel sis açık)
├─ Config/                     Motor, oyun ve girdi ayarları; zemin tipleri; MPC yolu
├─ Source/RizeSim/
│  ├─ Public/Sim/              ★ Motordan bağımsız çekirdek (saf C++, test edilir)
│  ├─ Time/ Weather/           Saat, güneş, hava, gökyüzü
│  ├─ Player/ Interaction/     Oyuncu, cüzdan/sepet, etkileşim arayüzü, kapı
│  ├─ Shops/                   Dükkan, raf, kasa, servis tezgahı
│  ├─ Transport/               Yol, trafik, dolmuş, durak, hat yöneticisi
│  ├─ Vehicles/                Sürülebilir araç, galeri, tamirci, dolmuş işletme
│  ├─ NPC/ Audio/              Şehir sakinleri, gece ışıkları, ortam sesi
│  └─ Core/ Data/              Oyun modu, kayıt, yönetmen komutları, JSON verisi
├─ Content/Data/               Tasarımcının düzenlediği JSON veriler
├─ Content/Terrain/            Gerçek arazi: yükseklik haritaları + Landscape değerleri
├─ Tests/Logic/                Çekirdek C++ testleri (make)
├─ Tools/geo/                  DEM indirme, OSM dönüştürme, ev noktaları
├─ Tools/ue_python/            Editör içi kurulum ve içe aktarım betikleri
├─ Tools/mcp/                  Unreal MCP köprüsü
└─ Docs/                       Vizyon, mimari, editör kurulumu, yol haritası
```

## 4. Hızlı başlangıç

### 4.1 Gereksinimler
- Unreal Engine **5.5** (Epic Games Launcher), Visual Studio 2022 (C++ oyun geliştirme iş yükü) ya da Linux'ta clang araç zinciri
- Python 3.10+ ve `pip install numpy pillow` (yalnızca coğrafya araçları için)

### 4.2 Arazi ve harita verisi
```bash
cd RizeSim
python3 Tools/geo/fetch_dem.py merkez          # zaten üretildi; yeniden üretmek için
python3 Tools/geo/fetch_dem.py ayder
# OSM: Tools/geo/rize.overpassql sorgusunu overpass-turbo.eu'da çalıştırıp
#      Tools/cache/rize_merkez.osm olarak kaydedin, sonra:
python3 Tools/geo/osm_to_rize.py Tools/cache/rize_merkez.osm --region merkez \
        --heights Content/Terrain/merkez_heightmap.png --out Content/Data/layout_merkez.json
```

### 4.3 Editör
1. `RizeSim.uproject` → sağ tık → *Generate Visual Studio project files* → açın, derleyin (*Development Editor*).
2. Editör Python konsolunda: `import rize_bootstrap as b; b.run()` komutu girdileri, MPC'yi, Blueprint'leri ve `Rize_Merkez` haritasını kurar.
3. Landscape'i yükseklik haritasıyla ekleyin. Değerler [`Docs/EDITOR_KURULUMU.md`](Docs/EDITOR_KURULUMU.md) dosyasında.
4. `import rize_import_layout as r; r.run("merkez")` komutu yolları, binaları ve altyapıyı kurar.

Ayrıntılı adımlar: [`Docs/EDITOR_KURULUMU.md`](Docs/EDITOR_KURULUMU.md)

## 5. Claude Code ↔ Unreal (MCP)

Depo kökündeki `.mcp.json`, `rize-unreal` sunucusunu Claude Code'a tanıtır. Editör açıkken Remote Control (localhost:30010) üzerinden şu araçlar kullanılabilir:

| Araç | İş |
|---|---|
| `ue_ping` | Bağlantı, motor sürümü, açık harita |
| `ue_run_python` | Editörde Python çalıştır (tam `unreal` API) |
| `ue_console` | Editör ya da PIE konsol komutu |
| `ue_list_actors`, `ue_spawn_actor` | Sahneyi sorgula / aktör yerleştir |
| `rize_import_layout` | OSM yerleşimini sahneye kur |
| `rize_preview_sky` | Editörde saat/gün önizlemesi |
| `rize_set_time`, `rize_set_weather` | Çalışan oyunda saat ve hava (yönetmen komutları) |
| `rize_validate_data`, `rize_fetch_terrain` | Editör gerektirmeyen veri ve arazi işleri |

Oyun içi yönetmen konsolu (`~`): `RizeSaat 18.5`, `RizeHizi 240`, `RizeHava Saganak`, `RizePara 5000`, `RizeDurum`, `RizeKaydet`, `RizeYukle`, `RizeVeriYenile`.

## 6. Testler

```bash
make -C RizeSim/Tests/Logic                         # C++ çekirdek: 206 kontrol
python3 RizeSim/Tools/validate_data.py              # veri tutarlılığı
python3 -m unittest discover -s RizeSim/Tools/tests # 30 test: coğrafya, içe aktarım, MCP
```
`.github/workflows/rizesim.yml` bunları her değişiklikte çalıştırır.

**Önemli:** UE'ye bağımlı C++ sınıfları, bu deponun üretildiği ortamda Unreal Engine bulunmadığı için **derlenmedi**. API kullanımı UE 5.5'e göre yazıldı ve statik olarak denetlendi. İlk editör derlemesinde küçük düzeltmeler gerekebilir. Bunlar MCP köprüsü üzerinden hızla giderilebilir.

## 7. Kurallar

- **Eksen:** +X = Doğu, +Y = Güney, +Z = Yukarı, birim cm. Deniz seviyesi = Z 0.
- **Para:** kuruş cinsinden `int64` (1 TL = 100). Kayan nokta kullanılmaz.
- **Zaman:** varsayılan 1 oyun günü = 60 gerçek dakika. Türkiye sabit UTC+3.
- **Fiyatlar** örnek değerlerdir (2026 için yaklaşık). Dolmuş hatları ve durak adları temsilidir, saha araştırmasıyla güncellenmelidir.

## 8. Lisans ve kaynaklar
- Yükseklik: AWS Open Data Terrain Tiles (SRTM, USGS, ETOPO kökenli)
- Harita: © OpenStreetMap katkıcıları, ODbL 1.0. Oyun içinde atıf gerekir.
