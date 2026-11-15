# Mahalle PlayStation Salonu — MVP Prototip

Birinci şahıs (FPS) işletme ve kaos simülasyonu. Bu klasör, GDD'deki **"Öncelikli Hedef (MVP)"** maddesinin oynanabilir prototipidir.

## Çalıştırma

Kurulum ya da internet gerekmez. Three.js `vendor/` klasöründe hazır gelir.

```bash
cd mahalle-ps-salonu
python3 -m http.server 8000
# tarayıcıda: http://localhost:8000
```

> ES modülleri `file://` üzerinden yüklenmediği için yerel bir sunucu gerekir.
> Test için zamanı hızlandırmak isterseniz adrese `?hiz=4` ekleyin (en fazla 20).
> Oyun klavye ve fare ister. Telefonda oynanmaz.

| Tuş | Eylem |
|---|---|
| `W A S D` / ok tuşları | Yürü (`Shift` ile koş) |
| Fare | Bak (tıklayınca imleç kilitlenir) |
| `E` | Bağlama göre: konuş, kutu al, rafa koy, disk tak/çıkar, çöp topla, kovaya at |
| `Q` | Elindeki kutuyu baktığın yüzeye bırak (tezgah, sehpa, zemin) |
| `1`–`4` / `X` | Tezgah diyaloğunda seçim yap / diyaloğu kapat |
| `Esc` | Duraklat |

**Temel döngü:** Müşteri gelir ve tezgahta konuşur. Onu boş ve temiz bir masaya yönlendirirsin. Müşteri bir oyun ister. Kutuyu raftan alıp o masanın konsoluna takarsın. Oyun bitince ücret ve bahşiş kasaya girer. Masada kalan çöpleri toplayıp kovaya atarsın. Saat 02:00'de kepenk iner ve gün sonu bilançosu çıkar.

---

## 1. GDD kapsam analizi

GDD'deki her madde üç sınıftan birine ayrıldı.

### A. MVP'de var (GDD'nin açıkça istediği)
| GDD maddesi | Uygulama |
|---|---|
| Kapalı dükkan sahnesi (§1) | 12×10 m dükkan. Oyuncu dışarı çıkamaz. Dış dünya yalnızca vitrin camından görünür. |
| FPS kontrolcüsü: yürüme, nesne tutma/bırakma | `PlayerController` + `Interaction` |
| Konsol masası | Data-driven. Ayrıntısı aşağıda (bilinçli sapma). |
| CD rafı (§2.2) | 6 oyunluk raf. Kutu alınır, konsola takılır, çıkarılır, rafa geri konur. |
| Müşteri döngüsü: Giriş → Bekleme → Oturma → Sipariş → Çıkış | `CustomerManager` durum makinesi |
| Modüler yapı: saat, müşteri yapay zekası, ekonomi ve envanter ayrı modüller | Ayrıntısı aşağıda (§2). Modüller yalnızca `EventBus` üzerinden konuşur. |

### B. MVP'ye eklenen hafif katmanlar
Bunlar ucuzdu ve çekirdek döngüyü anlamlı kılıyor.
- **Diyalog sistemi (§2.1):** Seçenekler dükkanın durumuna göre değişir. Dolu ya da kirli masa seçilemez.
- **4 müşteri profili (§2.1):** Aceleci çocuklar, gececi, turnuvacı ve VIP. Her birinin sabrı, oyun süresi, bahşiş çarpanı, oyun zevki ve günün fazına göre gelme olasılığı farklıdır.
- **Gün döngüsü (§4):** Sabah, yoğun saatler, gece ve kapanış. Işık saate göre değişir: vitrinden giren güneş kayar, gece sokak lambası yanar.
- **Gün sonu bilançosu (§4.4):** Ciro ve bahşişten kira ile elektrik düşülür. Kayıt `localStorage`'da tutulur.
- **Çöp kuralı (§2.4):** Masa temizlenmeden ona yeni müşteri oturtulamaz.
- **Yanlış CD krizi (§6):** Yanlış oyun takılırsa müşterinin ruh hali düşer. Oyun sürerken disk çıkarılırsa müşteri tepki verir.
- **Unutulan CD takibi (§2.2):** Raf dışında kalan kutular gün sonunda bildirilir.
- **İlerleme ipuçları (§5):** Seviye 2 arcade kabini örtülü durur, Seviye 3 VIP depo kapısı kilitlidir. Bir sonraki seviyenin hedefi bilançoda gösterilir.

### C. Bilinçli olarak ertelenenler (yol haritası)
| GDD maddesi | Neden ertelendi |
|---|---|
| Büfe ve tost makinesi (§2.3) | GDD'ye göre Seviye 2'de açılıyor. Ayrı bir zamanlayıcı ve envanter modülü olacak. |
| Arıza ve bakım: kol, batarya, kablo (§2.4) | Rastgele olay sistemi gerektiriyor. MVP döngüsü oturduktan sonra eklenecek. |
| Arcade ve direksiyon seti (§3) | Seviye 2 ve 4 içerikleri |
| Seviye yükseltme ve kilit açma (§5) | Hedefler veride ve arayüzde hazır. Satın alma akışı henüz yok. |
| Sigorta atması, turnuva, veresiye (§6) | Olay sistemiyle birlikte gelecek. |
| Sabah toptancı siparişi (§4.1) | Büfe envanterine bağlı |

### Bilinçli sapmalar
1. **İki konsol masası var, GDD'de bir.** Tek masayla diyalogdaki "hangi masaya" seçimi anlamsız kalıyordu, çoklu iş yükü de test edilemiyordu. Masa sayısı `config.js > LAYOUT.stations` dizisinden değişir.
2. **Oyun adları kurgusaldır** (Süper Gol, Sokak Kralı, Demir Yumruk…). Gerçek marka adları lisans riski taşıdığı için kullanılmadı.
3. **Motor olarak tarayıcı ve Three.js seçildi.** Kurulum gerektirmiyor ve hızlı yineleme sağlıyor. Mimari motordan bağımsız tutuldu (bkz. §3).

---

## 2. Mimari

```
index.html              HUD/menü DOM'u + importmap (three → vendor/)
src/
├─ config.js            Tüm denge, içerik ve yerleşim verisi (tek kaynak)
├─ main.js              Başlatma, oyun durumu (menu/running/paused/summary), döngü
├─ core/EventBus.js     Modüller arası olay yolu
├─ systems/             ── 3D'den bağımsız oyun mantığı ──
│  ├─ GameClock.js      Saat, fazlar, son giriş ve kapanış olayları
│  ├─ Economy.js        Para, itibar, günlük defter, bilanço, kayıt
│  ├─ Inventory.js      Her oyun kutusunun konumu (raf/el/konsol/dünya)
│  └─ CustomerManager.js Grup durum makinesi, kuyruk, diyalog seçenekleri, ödeme
├─ entities/Customer.js Müşteri görseli: yürüme, oturma, konuşma balonu, sabır çubuğu
├─ world/               ── sahne ──
│  ├─ ShopBuilder.js    Dükkan, raf, tezgah, kova, ışıklar, çarpışma kutuları
│  ├─ Station.js        Masa: TV ekranı (canvas), konsol LED'i, koltuk, oturma noktaları
│  ├─ Props.js          Oyun kutusu ve çöp nesneleri
│  ├─ DayNightLighting.js Saate göre ışık
│  └─ Textures.js       Prosedürel dokular (harici görsel dosyası yok)
├─ player/
│  ├─ PlayerController.js Pointer-lock bakış, WASD, daire–AABB çarpışma
│  └─ Interaction.js    Ekran ortasından ışın, bağlamsal eylem, elde tutma
├─ ui/HUD.js            HUD, tezgah diyaloğu, gün sonu ekranı
└─ audio/Sfx.js         WebAudio ile üretilen sesler (zil, disk, bozuk para, çöp…)
```

### Müşteri durum makinesi
```
ENTERING → QUEUE ─(masa ata)→ TO_TABLE → REQUEST ─(doğru disk)→ LOADING → PLAYING → LEAVING → GONE
             │ ├─(bekleyin: +sabır, bir kez)                │ └─(yanlış disk: ruh hali −0.25)
             │ └─(yer yok) → LEAVING (nötr)                 └─(sabır biter) → LEAVING (itibar −2)
             └─(sabır biter) → LEAVING (itibar −2)
```

### Ekonomi formülü
- Ücret = `saatlik 40₺ × oynanan dakika / 60`. En az 30 dakika ücretlendirilir.
- Bahşiş yalnızca ruh hali 0.55'in üzerindeyse verilir: `ücret × 0.15 × profil çarpanı × ruh hali`.
- Gün sonu gideri = kira 250₺ + elektrik (30₺ + 6₺ × masa-saati).

## 3. Motor geçişi notu
Asıl hedef bir oyun motoru (Unity, Unreal ya da Godot) ise `systems/` klasörü olduğu gibi taşınabilir. Bu modüller Three.js kullanmaz. Taşınması gerekenler şunlardır:
- `world/*` → motor sahnesi
- `entities/Customer.js` → animasyonlu karakter
- `player/*` → motorun FPS kontrolcüsü

Durum makinesi, ekonomi formülleri ve `config.js` verisi doğrudan port edilir.

## 4. Test
Oyun, `window.__game` üzerinden test edilebilir. Headless Chromium'da şu senaryo uçtan uca doğrulandı:
1. Müşteri tezgaha gelir, diyalog açılır ve müşteri Masa 1'e atanır.
2. Önce yanlış oyun takılır: ruh hali 0.80'den 0.55'e düşer.
3. Disk çıkarılır, kutu rafa iade edilir, doğru oyun takılır ve oyun başlar.
4. Oyun biter, ücret tahsil edilir ve masaya 3 çöp düşer.
5. Çöpler toplanır, masa temizlenir, poşet kovaya boşaltılır.
6. Sırada bekletilen iki grup sinirlenip gider: itibar −4, kayıp 2.
7. 02:00'de kepenk iner, bilanço çıkar ve ertesi gün başlar.

Konsolda hata yok.
