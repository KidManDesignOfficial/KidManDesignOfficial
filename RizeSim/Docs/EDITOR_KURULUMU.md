# Editör Kurulumu (UE 5.5)

Bu belge, depodaki kodu ve veriyi ilk kez Unreal editöründe ayağa kaldırmak için gereken adımları sırasıyla verir. Adımların çoğu betikle otomatikleştirildi. Elle yapılması gerekenler **[ELLE]** etiketiyle işaretli.

## 1. Derleme
1. `RizeSim.uproject` → sağ tık → **Generate Visual Studio project files**.
2. `RizeSim.sln` → yapılandırma **Development Editor / Win64** → Derle.
3. Derleme hatası çıkarsa (kod UE kurulu olmayan ortamda yazıldı), hata çıktısını Claude Code'a verin. Düzeltmeler genelde başlık dosyası eklemek ya da API adı değiştirmek gibi küçük işlerdir.

## 2. Otomatik varlık kurulumu
Editörde **Window → Output Log → Python** konsolu:
```python
import rize_bootstrap as b; b.run()
```
Oluşanlar:

| Varlık | Yol | Not |
|---|---|---|
| 11 girdi eylemi | `/Game/Rize/Girdi/IA_*` | Hareket, Bakış, Etkileşim (E), İkincil (Q), Hızlı Adım (Shift), Gaz/Fren/Direksiyon, El Freni, Araçtan İn (F) |
| Eşleme bağlamları | `IMC_Yuruyus`, `IMC_Surus` | WASD + fare + gamepad |
| Ortam MPC | `/Game/Rize/Ortam/MPC_RizeOrtam` | `Wetness, Puddles, RainIntensity, FogDensity, Wind, SunElevation` |
| Oyuncu | `/Game/Rize/Blueprint/BP_RizeOyuncu` | Girdiler atanmış |
| Oyun modu | `BP_RizeOyunModu` | Oyuncu = `BP_RizeOyuncu` |
| Harita | `/Game/Maps/Rize_Merkez` | Güneş + ay, atmosfer, gök ışığı, hacimsel sis, bulut, `RizeSkyController` bağlı, 2 ev başlangıç noktası |

Betik mevcut varlıkların üzerine yazmaz. Bir adım başarısız olursa nedeni günlüğe yazılır, diğer adımlar sürer.

## 3. Landscape (gerçek Rize arazisi) [ELLE]
**Landscape Mode → Manage → New → Import from File**

| Alan | Rize Merkez | Ayder Yaylası |
|---|---|---|
| Heightmap File | `Content/Terrain/merkez_heightmap.png` | `Content/Terrain/ayder_heightmap.png` |
| Location (X, Y, Z) | (-280000, -280000, 22300.2) | (-200000, -200000, 171134.25) |
| Scale (X, Y, Z) | (277.7778, 277.7778, 89.0181) | (396.8254, 396.8254, 281.0532) |
| Çözünürlük | 2017 × 2017 | 1009 × 1009 |
| Gerçek yükseklik | -4,9 … 450,9 m | 991,9 … 2430,8 m |

Bu değerlerle dünya Z'si gerçek deniz seviyesine göre mutlak yüksekliği verir (Z 0 = deniz). Kaynak: `Content/Terrain/*_landscape.json`.

- **Deniz:** Water eklentisi → *Water Body Ocean*, Z = 0.
- **World Partition:** Merkez haritası için açın. Ayder ayrı harita olarak kurulur (`Rize_Ayder`).
- Ham veri ~30 m çözünürlükte. Dik yamaç mikro detayı Landscape malzemesi (yükseklik/eğim maskeli katmanlar) ve elle şekillendirmeyle eklenmelidir.

## 4. Şehir yerleşimi
```python
import rize_import_layout as r; r.run("merkez")
```
Önkoşul: `Content/Data/layout_merkez.json` (README §4.2). Betik şunları kurar:
- **Yollar:** sürülebilir her OSM yolu için `RizeRoadPath` (spline, hız sınırı, zemin tipi). Dolmuş hatları `dolmus_lines.json → pathId` ile bu yollara bağlanır. Hat güzergahları için ayrı, kesintisiz `RizeRoadPath` çizilmesi önerilir **[ELLE]**.
- **Binalar:** Geometry Script varsa taban izinden gerçek ekstrüzyon, yoksa yönlü kutu. Yamaçtaki binaların arka kısmı araziye gömülür.
- **Altyapı:** lamba, yağmur ızgarası, elektrik direği, çöp kovası, merdiven korkuluğu dikmeleri, duraklar. `ASSETS` tablosundaki varlıklar yoksa motorun temel şekilleriyle yer tutucu konur.

## 5. Malzemeler [ELLE]
### Islak asfalt / arnavut kaldırımı (ana malzeme fonksiyonu `MF_RizeIslaklik`)
- `CollectionParameter(MPC_RizeOrtam.Wetness)` = W, `Puddles` = P
- **Roughness:** `lerp(Kuru, 0.05, W)`. Islak yüzey Lumen'de aynasal yansıma verir.
- **BaseColor:** `BaseColor * lerp(1, 0.55, W)`. Islak yüzey koyulaşır.
- **Birikinti maskesi:** `saturate((P - (1 - HeightMap)) * 8)`. Çukurlarda Roughness 0, Normal düz.
- **Yağmur halkaları:** `RainIntensity > 0` iken birikinti üzerine kayan normal atlası.

### Gece ışıkları
`URizeNightLightComponent` taşıyan aktörlerin malzemelerinde `Emissive` (skaler) parametresi olmalı.

## 6. Yağmur efekti [ELLE]
- Niagara sistemi `NS_RizeYagmur`: kullanıcı parametreleri `RainIntensity` (0–1) ve `Wind` (0–1).
- Oyuncu kamerasına bağlanır, ~30 m yarıçapta GPU parçacık, yere çarpma sıçraması (Depth Buffer collision).
- **Proje Ayarları → Rize Simülasyonu → Rain System** alanına atayın.

## 7. Fiziksel yüzeyler
`DefaultEngine.ini` içinde tanımlı: SurfaceType1 = Asfalt, 2 = Arnavut Kaldırımı, 3 = Beton, 4 = Toprak.
Her zemin malzemesine uygun *Physical Material* atayın. Araç tekerlek tutuşu buna göre hesaplanır.

## 8. Navigasyon
NPC'ler için haritaya **NavMeshBoundsVolume** ekleyin. Dik merdivenler için *Agent Max Step Height* 30 ve *Agent Max Slope* 50 olmalı.

## 9. MCP ile çalışma
Editör açıkken Claude Code, depo kökündeki `.mcp.json` üzerinden bağlanır. Bağlantıyı sınamak için Claude'a "ue_ping çalıştır" deyin.
Remote Control sunucusu kapalıysa editör konsolunda: `WebControl.StartServer`.
