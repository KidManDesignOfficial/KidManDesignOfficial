# Yol Haritası

Her kilometre taşının **kabul ölçütü** vardır. Ölçüt karşılanmadan bir sonraki aşamaya geçilmez.

## M0 — Teknik temel ✅ (bu depo)
- [x] Motordan bağımsız simülasyon çekirdeği ve testleri
- [x] UE5 C++ sistemleri: zaman, hava, gökyüzü, oyuncu, etkileşim, dükkanlar, dolmuş, trafik, araç, NPC, kayıt
- [x] JSON veri altyapısı ve doğrulayıcı
- [x] Gerçek arazi (merkez + Ayder), OSM dönüştürücü, türetilmiş altyapı
- [x] Editör kurulum ve içe aktarım betikleri, Unreal MCP köprüsü, CI

## M1 — İlk derleme ve "gri kutu" Rize (1–2 hafta)
**Kabul:** Editörde derlenir. Oyuncu mahalle evinde başlar, gerçek arazide yürür. Saat akar, güneş doğru konumda doğup batar. Sağanak bastırır ve asfalt ıslanır.
- [ ] İlk UE derlemesindeki API düzeltmeleri
- [ ] `rize_bootstrap.run()`, Landscape içe aktarımı, deniz (Water)
- [ ] OSM indirme ve `layout_merkez.json`, gri kutu binalar ve yollar
- [ ] `MF_RizeIslaklik` malzeme fonksiyonu, `NS_RizeYagmur`
- [ ] Basit HUD (UMG): saat, para, etkileşim ipucu, altyazı

## M2 — Sokak dokusu (3–4 hafta)
**Kabul:** Çarşıda bir sokak "fotoğraf gibi" okunur: bordür, ızgara, direk, tel, tabela, korkuluk eksiksiz.
- [ ] Modüler Rize cephe kiti (5–6 katlı apartman, cumbalı eski ev, dükkan zemin katı, kepenk)
- [ ] Altyapı varlıkları: lamba, ızgara, direk ve sarkık tel (kablo bileşeni), çöp kovası, korkuluk, tabela
- [ ] PCG ile altyapı yerleşimi (aktör yerine HISM)
- [ ] Çay bahçesi teras bitki örtüsü, yamaç ormanı (Nanite foliage)

## M3 — Yaşayan iç mekânlar (3 hafta)
**Kabul:** Bakkaldan alışveriş, kıraathanede çay, lokantada kuru fasulye uçtan uca çalışır. Mekânların sesi ve ışığı vardır.
- [ ] Bakkal, market, fırın, çay ocağı, kıraathane, lokanta iç mekân setleri
- [ ] Ürün mesh'leri (raf ISM), ince belli bardak, semaver, okey masası
- [ ] Ortam ses kümeleri, servis edilen ürün görselleri
- [ ] Oyuncu evleri (sahil dairesi, mahalle evi)

## M4 — Ulaşım (3 hafta)
**Kabul:** Oyuncu duraktan sarı dolmuşa binip yokuşları izleyerek başka mahalleye gider. Kendi aracını galeriden alır, ıslak yokuşta kayma hissini yaşar.
- [ ] Sarı minibüs modeli (iç mekân, cam kenarı koltuk), binek, kamyonet, kurye motoru
- [ ] Hat güzergahlarının saha araştırmasıyla doğrulanması
- [ ] Kavşak ve trafik ışığı mantığı (şu an yalnızca durak duruşu var)
- [ ] Chaos araç ayarları: dik yokuş kalkışı, ıslak fren mesafesi
- [ ] Dolmuş hat işletmeciliği arayüzü (hasılat, yolcu sayısı)

## M5 — İnsanlar (3–4 hafta)
**Kabul:** Sabah esnaf kepenk açar, öğlen çarşı kalabalıktır, akşam sahilde yürüyüş yapılır. Yağmurda insanlar saçak altına kaçar.
- [ ] MetaHuman tabanlı karakter havuzu, gündelik animasyonlar (oturma, çay içme, okey)
- [ ] Mass AI ile kalabalık (yüzlerce yaya), seçili NPC'ler için tam program
- [ ] Seslendirme ve bağlama duyarlı diyalog genişletmesi

## M6 — Yayla ve cila (4 hafta)
**Kabul:** Ayder'de sis altındaki yayla evinde sabah başlanır. Gece-gündüz, mevsim ve performans hedefleri (1440p'de 60 fps, RTX 3070 sınıfı) tutar.
- [ ] Ayder haritası, yayla evleri, toprak yollar
- [ ] Mevsim döngüsü (çay hasadı, kar)
- [ ] Optimizasyon, ses miksajı, erişilebilirlik, kayıt/yükleme arayüzü

## Açık kararlar (yönetmen)
1. Varsayılan zaman ölçeği: 1 gün = 60 dk (şu anki). 90 ya da 120 dk daha mı "soluklu" olur?
2. Ekonomi: oyuncu nasıl para kazanır? Seçenekler: dolmuş işletme (var), çay toplama, esnaflık, kuryelik.
3. Rize merkez ile Ayder tek dünya mı (80 km yol), ayrı haritalar ve geçiş mi? (Öneri: ayrı haritalar.)
4. Gerçek dükkân ve mekân adları kullanılacak mı? (Öneri: hayır, temsilî adlar.)
