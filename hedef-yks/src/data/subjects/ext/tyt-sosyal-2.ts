/** TYT Sosyal Bilimler: Tarih, Coğrafya, Felsefe ve Din Kültürü'nün kalan konuları. */
import { F, FLOW, H, P, TABLE, TIMELINE, TIP, UL, builder, card } from '../../build.ts';

// ═════════════════════════════ TARİH ═════════════════════════════
const tr = builder('tyt-tarih', 'b');

tr.lesson('tarih-zaman', 8, 'Tarih biliminin yöntemi, yardımcı bilimler, takvimler ve çağların sınıflandırılması.', [
  UL('Tarih; geçmişteki olayları yer ve zaman göstererek, neden-sonuç ilişkisi içinde, belgelere dayanarak inceler.', 'Tarihçi tarafsız olmalı; olayları kendi dönemin koşullarıyla değerlendirmelidir.'),
  TABLE(['Yardımcı bilim', 'İnceler'], ['Arkeoloji', 'Kazılarla ortaya çıkan kalıntılar'], ['Epigrafi', 'Taş, metal üzerindeki yazılar (kitabeler)'], ['Paleografi', 'Eski yazılar ve belgeleri okuma'], ['Nümismatik', 'Paralar ve madalyalar'], ['Diplomatik', 'Resmî belgelerin biçimi ve doğruluğu'], ['Heraldik', 'Arma, mühür, bayrak'], ['Kronoloji', 'Zamanı ölçme ve takvimler']),
  TABLE(['Takvim', 'Özellik'], ['On İki Hayvanlı Türk Takvimi', 'Güneş yılı esaslı, 12 yıllık devreler'], ['Hicri', 'Ay yılı (354 gün); başlangıç 622 Hicret'], ['Celali', 'Melikşah döneminde Ömer Hayyam\'ın da katıldığı heyetle hazırlandı; güneş yılı'], ['Rumi', 'Osmanlı\'da mali işler için (1789); güneş yılı']),
  TIMELINE(['MÖ 3200', 'Yazının icadı (Sümerler)', 'İlk Çağ başlar'], ['375', 'Kavimler Göçü', 'Orta Çağ başlar'], ['1453', 'İstanbul\'un fethi', 'Yeni Çağ başlar'], ['1789', 'Fransız İhtilali', 'Yakın Çağ başlar']),
], [card('Nümismatik', 'Paraları inceler'), card('Orta Çağ\'ın başlangıcı', 'Kavimler Göçü (375)')]);
tr.q('tarih-zaman', 'Geçmiş dönemlere ait paraları inceleyen tarihe yardımcı bilim aşağıdakilerden hangisidir?', ['Epigrafi', 'Paleografi', 'Nümismatik', 'Heraldik', 'Diplomatik'], 'C', 'Nümismatik, paraları ve madalyaları inceler; ekonomik ve siyasi bilgi sağlar.', 1);
tr.q('tarih-zaman', 'Orta Çağ\'ın başlangıcı olarak kabul edilen olay aşağıdakilerden hangisidir?', ['Yazının icadı', 'Kavimler Göçü', 'İstanbul\'un fethi', 'Fransız İhtilali', 'Coğrafi keşifler'], 'B', '375\'te başlayan Kavimler Göçü, Avrupa\'nın siyasi ve etnik yapısını değiştirdi ve Orta Çağ\'ın başlangıcı kabul edilir.', 1);
tr.q('tarih-zaman', 'Büyük Selçuklu Sultanı Melikşah döneminde hazırlanan güneş yılı esaslı takvim aşağıdakilerden hangisidir?', ['Hicri takvim', 'Rumi takvim', 'Celali takvimi', 'Miladi takvim', 'On İki Hayvanlı Türk Takvimi'], 'C', 'Celali takvimi, Melikşah\'ın emriyle Ömer Hayyam\'ın da bulunduğu bir heyet tarafından hazırlanmıştır.', 1);

tr.lesson('ilk-cag', 10, 'Mezopotamya, Mısır, Anadolu ve diğer İlk Çağ uygarlıklarının başlıca katkıları.', [
  TABLE(['Uygarlık', 'Öne çıkan katkı'], ['Sümerler', 'Yazıyı (çivi yazısı) ilk kullandılar; ziggurat, Gılgamış Destanı, tekerlek'], ['Babil', 'Hammurabi Kanunları (kısasa kısas)'], ['Asurlar', 'Ticaret kolonileriyle Anadolu\'ya yazıyı getirdiler; Ninova Kütüphanesi'], ['Mısır', 'Hiyeroglif, güneş takvimi, piramitler, geometri ve tıp'], ['Hititler', 'Mısır ile Kadeş Antlaşması (bilinen ilk yazılı antlaşma); başkent Hattuşaş'], ['Frigler', 'Tarım ve dokumacılık; başkent Gordion'], ['Lidyalılar', 'Parayı ilk kullandılar; ticaret'], ['Urartular', 'Sulama kanalları, kaya mezarları, maden işçiliği'], ['Fenikeliler', '22 harfli alfabe; deniz ticareti'], ['Çin', 'Kâğıt, pusula, barut']),
  TIP('"İlk" ifadeleri sınavın klasiğidir: ilk yazı Sümer, ilk para Lidya, ilk yazılı antlaşma Kadeş (Hitit–Mısır), ilk yazılı kanunlar Sümer (Urukagina), en ünlü kanunlar Babil (Hammurabi).'),
  P('İlk Çağ\'da Anadolu, Mezopotamya ile Avrupa arasında köprü olduğu için birçok uygarlığın buluştuğu bir merkez oldu. Hitit tabletleri ve Asur ticaret belgeleri Anadolu tarihinin ilk yazılı kaynaklarıdır.'),
], [card('İlk para', 'Lidyalılar'), card('Kadeş Antlaşması', 'Hititler – Mısır')]);
tr.q('ilk-cag', 'Tarihte parayı ilk kez kullanan Anadolu uygarlığı aşağıdakilerden hangisidir?', ['Hititler', 'Frigler', 'Lidyalılar', 'Urartular', 'İyonlar'], 'C', 'Lidyalılar ticareti kolaylaştırmak amacıyla parayı ilk kullanan uygarlıktır.', 1);
tr.q('ilk-cag', 'Bilinen ilk yazılı antlaşma olan Kadeş Antlaşması hangi iki devlet arasında imzalanmıştır?', ['Sümerler ve Akadlar', 'Hititler ve Mısırlılar', 'Asurlar ve Babilliler', 'Frigler ve Lidyalılar', 'Persler ve Yunanlar'], 'B', 'Kadeş Savaşı\'nın ardından Hitit ve Mısır arasında imzalanmıştır.', 1);
tr.q('ilk-cag', 'Anadolu\'ya yazıyı getiren topluluk aşağıdakilerden hangisidir?', ['Sümerler', 'Fenikeliler', 'Asurlu tüccarlar', 'Mısırlılar', 'Persler'], 'C', 'Asurlu tüccarların kurduğu ticaret kolonileri (Kültepe-Kaniş) ile Anadolu tarih çağlarına girmiştir.', 2);

tr.lesson('orta-cag', 8, 'Orta Çağ Avrupası: feodalite, Kilise, skolastik düşünce, Haçlı Seferleri ve Magna Carta.', [
  UL('Batı Roma 476\'da yıkıldı; Doğu Roma (Bizans) 1453\'e kadar sürdü.', 'Feodalite: Merkezî otoritenin zayıfladığı, toprağın senyörlere ait olduğu düzen. Senyör → vassal → toprağa bağlı köylü (serf).', 'Kilise ve papalık siyasi ve toplumsal hayatta belirleyiciydi.', 'Skolastik düşünce: Dinî inançları akıl yoluyla kanıtlamaya çalışan, deney ve eleştiriye kapalı sistem.'),
  TIMELINE(['1096–1270', 'Haçlı Seferleri', 'Doğu ile Batı arasında ticaret ve kültür alışverişi arttı.'], ['1215', 'Magna Carta (İngiltere)', 'Kralın yetkileri soylular lehine sınırlandı.']),
  TIP('Haçlı Seferleri dinî görünümlü olsa da ekonomik ve siyasi nedenleri vardı. Sonuçta feodalite ve Kilise zayıfladı, burjuva sınıfı güçlendi; bu gelişmeler Rönesans\'a zemin hazırladı.'),
], [card('Serf', 'Toprağa bağlı köylü'), card('Magna Carta', '1215 — kralın yetkileri sınırlandı')]);
tr.q('orta-cag', '1215\'te İngiltere\'de kralın yetkilerini sınırlandıran belge aşağıdakilerden hangisidir?', ['İnsan Hakları Bildirisi', 'Magna Carta', 'Haklar Bildirgesi', 'Augsburg Barışı', 'Westfalya Antlaşması'], 'B', 'Magna Carta, soyluların baskısıyla kralın keyfî yönetimini sınırlayan ilk belgelerdendir.', 1);
tr.q('orta-cag', 'Orta Çağ Avrupası\'nda toprağa bağlı olarak yaşayan ve toprakla birlikte alınıp satılabilen köylülere ne ad verilir?', ['Senyör', 'Vassal', 'Serf', 'Burjuva', 'Şövalye'], 'C', 'Serfler toprağa bağlıydı; senyörün izni olmadan toprağı terk edemezdi.', 1);
tr.q('orta-cag', 'Dinî inançları akılla kanıtlamaya çalışan, deney ve gözleme kapalı Orta Çağ düşünce sistemi aşağıdakilerden hangisidir?', ['Hümanizm', 'Rönesans', 'Skolastik düşünce', 'Rasyonalizm', 'Pozitivizm'], 'C', 'Skolastik düşünce Kilise öğretisini sorgulamadan kabul eder ve akılla desteklemeye çalışır.', 1);

tr.lesson('ilk-turk', 10, 'Asya Hun, Kök Türk ve Uygur devletleri; Türk devlet yönetimi ve kültürü.', [
  TABLE(['Devlet', 'Öne çıkan bilgi'], ['Asya Hun', 'Mete Han orduda onlu sistemi kurdu; Çin Seddi Hun akınlarına karşı yapıldı.'], ['Avrupa Hun', 'Kavimler Göçü sonrası; Attila döneminde en güçlü dönem'], ['Kök Türk (552)', 'Bumin Kağan; "Türk" adını resmî devlet adı olarak ilk kullanan devlet; Orhun Yazıtları'], ['Uygur', 'Yerleşik hayata geçen ilk Türk devleti; Mani dini, matbaa, kâğıt'], ['Hazar', 'Yönetici kesim Musevîliği benimsedi; ticaret']),
  H('Türk devlet anlayışı'),
  UL('Kut: Yönetme yetkisinin Tanrı tarafından verildiğine inanılması.', 'Kurultay (toy): Devlet işlerinin görüşüldüğü meclis.', 'Töre: Yazısız hukuk kuralları; hükümdar da uymak zorundadır.', 'İkili teşkilat: Devletin doğu ve batı olarak yönetilmesi.'),
  TIP('Orhun Yazıtları (Kül Tigin, Bilge Kağan, Tonyukuk) Türk adının geçtiği ve Türkçenin bilinen ilk yazılı belgeleridir.', 'info'),
], [card('Türk adını resmî ilk kullanan', 'Kök Türkler'), card('Yerleşik hayata geçen ilk Türk devleti', 'Uygurlar')]);
tr.q('ilk-turk', '"Türk" adını resmî devlet adı olarak ilk kullanan Türk devleti aşağıdakilerden hangisidir?', ['Asya Hun Devleti', 'Kök Türk Devleti', 'Uygur Devleti', 'Avrupa Hun Devleti', 'Hazar Kağanlığı'], 'B', '552\'de Bumin Kağan\'ın kurduğu Kök Türk Devleti, Türk adını devletin adı olarak kullanan ilk devlettir.', 1);
tr.q('ilk-turk', 'Orduda onlu sistemi kurarak düzenli ordunun temelini atan Türk hükümdarı aşağıdakilerden hangisidir?', ['Bumin Kağan', 'Attila', 'Mete Han', 'Bilge Kağan', 'Tonyukuk'], 'C', 'Asya Hun hükümdarı Mete Han\'ın kurduğu onlu sistem birçok Türk devletince sürdürülmüştür.', 1);
tr.q('ilk-turk', 'Eski Türklerde hükümdarlık yetkisinin Tanrı tarafından verildiğine inanılmasını ifade eden kavram aşağıdakilerden hangisidir?', ['Töre', 'Kurultay', 'Kut', 'Yabgu', 'Ordu'], 'C', 'Kut anlayışına göre yönetme yetkisi Tanrı\'nın lütfudur; kut kaybedilebilir.', 1);

tr.lesson('islam', 9, 'Dört Halife, Emeviler ve Abbasiler dönemlerinde İslam devletinin gelişimi.', [
  TABLE(['Dönem', 'Öne çıkan gelişmeler'], ['Dört Halife (632–661)', 'Hz. Ebubekir: Kur\'an kitap hâline getirildi. Hz. Ömer: İran, Suriye, Mısır fethedildi; Hicri takvim. Hz. Osman: Kur\'an çoğaltıldı. Hz. Ali: iç karışıklıklar'], ['Emeviler (661–750)', 'Halifelik saltanata dönüştü; Arap milliyetçiliği (mevaliye ikinci sınıf muamele); Kerbela Olayı (680); Endülüs\'e kadar fetihler'], ['Abbasiler (750–1258)', 'Talas Savaşı (751): Türklerin desteğiyle Çin\'e karşı zafer; Beytü\'l-Hikme\'de bilim ve çeviri; 1258\'de Moğollar Bağdat\'ı aldı']),
  TIP('Talas Savaşı sonrası Türkler arasında İslamiyet yayılmaya başladı ve kâğıt yapımı İslam dünyasına geçti.', 'info'),
  TIP('Emeviler ile Abbasileri karşılaştıran sorularda anahtar kavramlar: Emeviler → Arap milliyetçiliği, mevali; Abbasiler → İslam birliği, Türklerin yönetimde etkin olması, bilim ve çeviri faaliyetleri.'),
], [card('Kur\'an\'ın çoğaltılması', 'Hz. Osman'), card('Talas Savaşı (751)', 'Abbasiler – Çin')]);
tr.q('islam', 'Türklerin İslamiyet\'le yakınlaşmasına zemin hazırlayan Talas Savaşı (751) hangi iki devlet arasında yapılmıştır?', ['Emeviler ve Bizans', 'Abbasiler ve Çin', 'Abbasiler ve Bizans', 'Emeviler ve Sasaniler', 'Kök Türkler ve Çin'], 'B', 'Abbasiler, Karluk Türklerinin desteğiyle Çin\'i yenmiştir.', 1);
tr.q('islam', 'Kur\'an-ı Kerim\'in çoğaltılarak önemli merkezlere gönderildiği dönem aşağıdakilerden hangisidir?', ['Hz. Ebubekir', 'Hz. Ömer', 'Hz. Osman', 'Hz. Ali', 'Emeviler'], 'C', 'Hz. Ebubekir döneminde kitap hâline getirilen Kur\'an, Hz. Osman döneminde çoğaltılmıştır.', 1);
tr.q('islam', 'Arap olmayan Müslümanlara (mevali) ikinci sınıf vatandaş muamelesi yapan İslam devleti aşağıdakilerden hangisidir?', ['Abbasiler', 'Emeviler', 'Endülüs Emevileri', 'Fatımiler', 'Dört Halife Devri'], 'B', 'Emeviler Arap milliyetçiliğine dayalı bir politika izlemiştir.', 1);

tr.lesson('turk-islam', 10, 'Karahanlılar, Gazneliler ve Büyük Selçuklu Devleti; Türk-İslam kültürünün ilk eserleri.', [
  TABLE(['Devlet', 'Öne çıkan bilgi'], ['Karahanlılar', 'İlk Müslüman Türk devleti (Satuk Buğra Han); resmî dil Türkçe'], ['Gazneliler', 'Sultan Mahmut "sultan" unvanını kullanan ilk Türk hükümdarı; Hindistan seferleri'], ['Büyük Selçuklu', 'Tuğrul Bey; Dandanakan (1040) ile Gaznelileri yendi; Malazgirt (1071) Alparslan; Melikşah ve vezir Nizamülmülk (Nizamiye medreseleri, Siyasetname)']),
  TABLE(['Eser', 'Yazar'], ['Kutadgu Bilig', 'Yusuf Has Hacip'], ['Divânü Lügati\'t-Türk', 'Kaşgarlı Mahmut'], ['Atabetü\'l-Hakayık', 'Edip Ahmet Yükneki'], ['Divân-ı Hikmet', 'Ahmet Yesevi']),
  TIP('Malazgirt Savaşı (1071) "Anadolu\'nun kapılarını Türklere açan" savaştır; Miryokefalon (1176) ise Anadolu\'nun Türk yurdu olduğunu kesinleştirmiştir.'),
], [card('İlk Müslüman Türk devleti', 'Karahanlılar'), card('Kutadgu Bilig', 'Yusuf Has Hacip')]);
tr.q('turk-islam', 'İlk Müslüman Türk devleti aşağıdakilerden hangisidir?', ['Gazneliler', 'Karahanlılar', 'Büyük Selçuklular', 'Tolunoğulları', 'Harzemşahlar'], 'B', 'Satuk Buğra Han\'ın İslamiyet\'i kabulüyle Karahanlılar ilk Müslüman Türk devleti olmuştur.', 1);
tr.q('turk-islam', 'Kutadgu Bilig adlı eserin yazarı aşağıdakilerden hangisidir?', ['Kaşgarlı Mahmut', 'Yusuf Has Hacip', 'Edip Ahmet Yükneki', 'Ahmet Yesevi', 'Nizamülmülk'], 'B', 'Yusuf Has Hacip\'in eseri "mutluluk veren bilgi" anlamına gelir; devlet yönetimini anlatır.', 1);
tr.q('turk-islam', 'Dandanakan Savaşı (1040) hangi iki devlet arasında yapılmıştır?', ['Selçuklular ve Bizans', 'Selçuklular ve Gazneliler', 'Gazneliler ve Karahanlılar', 'Selçuklular ve Abbasiler', 'Karahanlılar ve Çin'], 'B', 'Selçuklular Gaznelileri yenerek Büyük Selçuklu Devleti\'ni resmen kurmuştur.', 2);

tr.lesson('selcuklu', 10, 'Malazgirt sonrası Anadolu: ilk beylikler, Türkiye Selçuklu Devleti ve Ahilik.', [
  TABLE(['İlk beylikler', 'Merkez / özellik'], ['Saltuklular', 'Erzurum'], ['Mengücekliler', 'Erzincan, Divriği (Divriği Ulu Camii)'], ['Danişmentliler', 'Sivas, Tokat, Amasya'], ['Artuklular', 'Diyarbakır, Mardin, Harput'], ['Çaka Beyliği', 'İzmir; ilk Türk donanması']),
  TIMELINE(['1077', 'Türkiye Selçuklu Devleti kuruldu', 'Kurucusu Süleyman Şah; ilk başkent İznik.'], ['1176', 'Miryokefalon Savaşı', 'II. Kılıç Arslan Bizans\'ı yendi; Anadolu\'nun Türk yurdu olduğu kesinleşti.'], ['1220–1237', 'I. Alaaddin Keykubat', 'Alanya alındı; Kırım\'daki Sudak\'a deniz aşırı sefer.'], ['1243', 'Kösedağ Savaşı', 'Moğollara yenilgi; yıkılış süreci başladı.']),
  P('Ahilik, Ahi Evran öncülüğünde esnaf ve sanatkârları örgütleyen; mesleki, ahlaki ve toplumsal kuralları olan bir teşkilattır.'),
], [card('Miryokefalon (1176)', 'Anadolu\'nun Türk yurdu olduğu kesinleşti'), card('İlk Türk donanması', 'Çaka Bey')]);
tr.q('selcuklu', 'Anadolu\'nun Türk yurdu olduğunu kesinleştiren savaş aşağıdakilerden hangisidir?', ['Malazgirt', 'Miryokefalon', 'Kösedağ', 'Dandanakan', 'Pasinler'], 'B', '1176 Miryokefalon zaferiyle Bizans, Anadolu\'yu Türklerden geri alma umudunu yitirdi.', 1);
tr.q('selcuklu', 'Türkiye Selçuklu Devleti\'nin Moğollara yenilerek yıkılış sürecine girdiği savaş aşağıdakilerden hangisidir?', ['Miryokefalon', 'Malazgirt', 'Kösedağ', 'Yassıçemen', 'Ankara'], 'C', '1243 Kösedağ Savaşı\'ndan sonra devlet Moğol (İlhanlı) egemenliğine girdi.', 1);
tr.q('selcuklu', 'Ahi Evran öncülüğünde esnaf ve sanatkârları örgütleyen teşkilat aşağıdakilerden hangisidir?', ['Lonca', 'Ahilik', 'Gedik', 'Vakıf', 'Divan'], 'B', 'Ahilik; meslek eğitimi, kalite denetimi ve ahlaki kurallarıyla Anadolu\'da ekonomik ve toplumsal düzeni sağlamıştır.', 1);

tr.lesson('osmanli-kurulus', 10, 'Osmanlı Beyliği\'nin kuruluşu, Rumeli\'ye geçiş ve Fetret Devri.', [
  TIMELINE(['1302', 'Koyunhisar (Bafeus) Savaşı', 'Bizans ile yapılan ilk savaş.'], ['1326', 'Bursa\'nın fethi (Orhan Bey)', 'Başkent oldu; ilk Osmanlı parası (akçe), ilk düzenli ordu.'], ['1353', 'Çimpe Kalesi', 'Rumeli\'ye geçişte alınan ilk toprak.'], ['1364', 'Sırpsındığı Savaşı', 'Osmanlı ile Haçlılar arasında ilk savaş.'], ['1389', 'I. Kosova Savaşı', 'I. Murat şehit oldu.'], ['1396', 'Niğbolu Savaşı', 'Yıldırım Bayezid Haçlıları yendi.'], ['1402', 'Ankara Savaşı', 'Timur\'a yenilgi; Fetret Devri (1402–1413) başladı.'], ['1444 / 1448', 'Varna ve II. Kosova', 'Balkanlarda Osmanlı egemenliği güçlendi.']),
  UL('I. Murat döneminde Yeniçeri Ocağı (pençik sistemi) ve Divan-ı Hümayun kuruldu.', 'Fetret Devri\'nde Yıldırım\'ın oğulları arasında taht kavgası yaşandı; Çelebi Mehmet birliği yeniden sağladı.'),
  TIP('Kuruluş dönemi sorularında "ilk"lere dikkat: ilk başkent Söğüt, ilk para ve ilk düzenli ordu Orhan Bey, ilk Haçlı savaşı Sırpsındığı, Rumeli\'deki ilk toprak Çimpe.'),
], [card('Bizans ile ilk savaş', 'Koyunhisar (1302)'), card('Fetret Devri', 'Ankara Savaşı (1402) sonrası')]);
tr.q('osmanli-kurulus', 'Osmanlı Devleti\'nin Bizans ile yaptığı ilk savaş aşağıdakilerden hangisidir?', ['Maltepe (Palekanon)', 'Koyunhisar (Bafeus)', 'Sırpsındığı', 'Niğbolu', 'Varna'], 'B', '1302 Koyunhisar Savaşı Osmanlı\'nın Bizans\'a karşı ilk zaferidir.', 1);
tr.q('osmanli-kurulus', 'Ankara Savaşı\'ndan (1402) sonra başlayan ve taht kavgalarıyla geçen döneme ne ad verilir?', ['Lale Devri', 'Fetret Devri', 'Tanzimat Dönemi', 'Duraklama Dönemi', 'Meşrutiyet Dönemi'], 'B', 'Timur\'a yenilen Yıldırım Bayezid\'in ölümünden sonra şehzadeler arasında 11 yıl süren taht mücadelesi yaşandı.', 1);
tr.q('osmanli-kurulus', 'Osmanlılar ile Haçlılar arasındaki ilk savaş aşağıdakilerden hangisidir?', ['Sırpsındığı', 'I. Kosova', 'Niğbolu', 'Varna', 'II. Kosova'], 'A', '1364 Sırpsındığı Savaşı, Osmanlılara karşı düzenlenen ilk Haçlı ittifakıyla yapılmıştır.', 2);

tr.lesson('osmanli-dunya', 10, 'İstanbul\'un fethinden Kanuni dönemine Osmanlı\'nın dünya gücü hâline gelişi.', [
  TIMELINE(['1453', 'İstanbul\'un fethi (II. Mehmet)', 'Yeni Çağ başladı; Bizans sona erdi.'], ['1514', 'Çaldıran Savaşı (Yavuz)', 'Safevilere karşı zafer.'], ['1516–1517', 'Mercidabık ve Ridaniye', 'Memlükler yıkıldı; halifelik Osmanlılara geçti.'], ['1526', 'Mohaç Meydan Muharebesi (Kanuni)', 'Macaristan alındı.'], ['1529', 'I. Viyana Kuşatması'], ['1538', 'Preveze Deniz Savaşı (Barbaros)', 'Akdeniz\'de Osmanlı üstünlüğü.']),
  UL('Klasik Dönem kurumları: Divan-ı Hümayun, tımar sistemi, devşirme, kanunnameler (Fatih ve Kanuni).', 'Kanuni döneminde kanunlarla yönetim ön plana çıktı; "Muhteşem" ve "Kanuni" unvanları.'),
  TIP('Yavuz döneminde halifeliğin geçmesiyle Osmanlı, İslam dünyasının lideri oldu; kutsal emanetler İstanbul\'a getirildi ve baharat yolunun önemli kesimleri Osmanlı denetimine girdi.'),
], [card('Halifeliğin Osmanlı\'ya geçmesi', 'Mısır Seferi (1517)'), card('Preveze (1538)', 'Akdeniz\'de Osmanlı üstünlüğü')]);
tr.q('osmanli-dunya', 'İstanbul\'un fethi (1453) hangi çağın başlangıcı olarak kabul edilir?', ['İlk Çağ', 'Orta Çağ', 'Yeni Çağ', 'Yakın Çağ', 'Cilalı Taş Devri'], 'C', 'İstanbul\'un fethiyle Orta Çağ sona ermiş, Yeni Çağ başlamıştır.', 1);
tr.q('osmanli-dunya', 'Halifeliğin Osmanlı Devleti\'ne geçmesini sağlayan sefer aşağıdakilerden hangisidir?', ['İran Seferi', 'Mısır Seferi', 'Belgrad Seferi', 'Rodos Seferi', 'Viyana Seferi'], 'B', 'Yavuz Sultan Selim\'in Mısır Seferi (Ridaniye, 1517) sonunda halifelik Osmanlılara geçti.', 1);
tr.q('osmanli-dunya', 'Akdeniz\'de Osmanlı deniz üstünlüğünü sağlayan savaş aşağıdakilerden hangisidir?', ['Mohaç', 'Çaldıran', 'Preveze', 'İnebahtı', 'Mercidabık'], 'C', '1538\'de Barbaros Hayreddin Paşa komutasındaki donanma Haçlı donanmasını yendi.', 1);

tr.lesson('degisim-cagi', 10, 'Coğrafi keşifler, Rönesans ve Reform; Osmanlı\'da XVII-XVIII. yüzyıl ıslahatları.', [
  TABLE(['Gelişme', 'Sonuçları'], ['Coğrafi keşifler', 'Yeni ticaret yolları bulundu; İpek ve Baharat yolları ile Akdeniz limanları önemini yitirdi; sömürgecilik başladı'], ['Rönesans', 'İtalya\'da başladı; skolastik düşünce sarsıldı, bilim ve sanat gelişti; matbaa (Gutenberg) yayılmayı hızlandırdı'], ['Reform (1517)', 'Martin Luther başlattı; Protestanlık doğdu; Kilise\'nin otoritesi zayıfladı']),
  TIMELINE(['1699', 'Karlofça Antlaşması', 'Osmanlı ilk kez büyük toprak kaybetti.'], ['1718', 'Pasarofça Antlaşması', 'Lale Devri başladı.'], ['1727', 'İbrahim Müteferrika matbaası', 'Lale Devri\'nde ilk Türk matbaası.']),
  TIP('Coğrafi keşiflerin sonucu sorularında "Akdeniz\'in önem kazanması" bir çeldiricidir; tersine Akdeniz önemini yitirmiş, Atlas Okyanusu kıyıları önem kazanmıştır.', 'warn'),
], [card('Reform', 'Martin Luther (1517)'), card('Karlofça (1699)', 'İlk büyük toprak kaybı')]);
tr.q('degisim-cagi', 'Avrupa\'da Reform hareketini başlatan kişi aşağıdakilerden hangisidir?', ['Galileo', 'Martin Luther', 'Kolomb', 'Gutenberg', 'Leonardo da Vinci'], 'B', '1517\'de Martin Luther\'in Kilise\'yi eleştiren 95 maddesiyle Reform başladı.', 1);
tr.q('degisim-cagi', 'Osmanlı Devleti\'nin ilk kez büyük çapta toprak kaybettiği antlaşma aşağıdakilerden hangisidir?', ['Zitvatorok', 'Karlofça', 'Pasarofça', 'Küçük Kaynarca', 'Prut'], 'B', '1699 Karlofça Antlaşması ile Macaristan ve başka topraklar kaybedildi.', 1);
tr.q('degisim-cagi', 'Aşağıdakilerden hangisi coğrafi keşiflerin sonuçlarından biri değildir?', ['Sömürgeciliğin başlaması', 'Yeni ticaret yollarının bulunması', 'Akdeniz limanlarının önem kazanması', 'Avrupa\'ya değerli maden akışı', 'İpek ve Baharat yollarının önemini yitirmesi'], 'C', 'Ticaret Atlas Okyanusu\'na kaydığı için Akdeniz limanları önemini yitirmiştir.', 2);

tr.lesson('denge', 11, 'Küçük Kaynarca\'dan Berlin\'e (1774–1914): ıslahatlar, Tanzimat, Meşrutiyet ve denge politikası.', [
  TIMELINE(['1774', 'Küçük Kaynarca Antlaşması', 'Kırım bağımsız oldu; ilk savaş tazminatı.'], ['1826', 'Yeniçeri Ocağı kaldırıldı (II. Mahmut)', 'Vaka-i Hayriye.'], ['1838', 'Balta Limanı Ticaret Antlaşması', 'İngiltere\'ye geniş ticari ayrıcalık.'], ['1839', 'Tanzimat Fermanı', 'Can, mal, namus güvencesi; kanun üstünlüğü.'], ['1856', 'Islahat Fermanı ve Paris Antlaşması', 'Osmanlı Avrupa devleti sayıldı.'], ['1876', 'I. Meşrutiyet, Kanun-ı Esasi', 'İlk anayasa ve meclis.'], ['1877–1878', '93 Harbi', 'Ayastefanos ve Berlin antlaşmaları.'], ['1881', 'Düyun-ı Umumiye', 'Dış borçlar için kurulan idare.']),
  P('Bu dönemde Osmanlı, büyük devletlerin çıkar çatışmalarından yararlanarak toprak bütünlüğünü korumaya çalıştı (denge politikası).'),
  TIP('Tanzimat (1839) ve Islahat (1856) fermanları padişahın yetkilerini sınırlayan ve hukuk önünde eşitliği öne çıkaran belgelerdir; Kanun-ı Esasi ise halkın yönetime katıldığı ilk anayasal düzendir.'),
], [card('Kırım bağımsız', 'Küçük Kaynarca (1774)'), card('İlk anayasa', 'Kanun-ı Esasi (1876)')]);
tr.q('denge', 'Kırım\'ın bağımsızlığını kazandığı antlaşma aşağıdakilerden hangisidir?', ['Küçük Kaynarca', 'Yaş', 'Bükreş', 'Edirne', 'Paris'], 'A', '1774 Küçük Kaynarca Antlaşması ile Kırım bağımsız oldu; 1783\'te Rusya tarafından ilhak edildi.', 1);
tr.q('denge', 'Yeniçeri Ocağı hangi padişah döneminde kaldırılmıştır?', ['III. Selim', 'II. Mahmut', 'Abdülmecit', 'Abdülaziz', 'II. Abdülhamit'], 'B', '1826\'da II. Mahmut döneminde Yeniçeri Ocağı kaldırıldı (Vaka-i Hayriye).', 1);
tr.q('denge', 'Osmanlı Devleti\'nin ilk anayasası aşağıdakilerden hangisidir?', ['Sened-i İttifak', 'Tanzimat Fermanı', 'Islahat Fermanı', 'Kanun-ı Esasi', 'Teşkilat-ı Esasiye'], 'D', '1876\'da I. Meşrutiyet\'in ilanıyla yürürlüğe giren Kanun-ı Esasi ilk Osmanlı anayasasıdır.', 1);

tr.lesson('xx-yuzyil', 9, 'II. Meşrutiyet, Trablusgarp ve Balkan Savaşları; dönemin fikir akımları.', [
  TIMELINE(['1908', 'II. Meşrutiyet', 'Kanun-ı Esasi yeniden yürürlüğe girdi.'], ['1909', '31 Mart Vakası', 'Hareket Ordusu ayaklanmayı bastırdı.'], ['1911–1912', 'Trablusgarp Savaşı', 'İtalya ile Uşi Antlaşması; Kuzey Afrika\'daki son toprak kaybedildi.'], ['1912–1913', 'Balkan Savaşları', 'Rumeli\'nin büyük bölümü kaybedildi; II. Balkan Savaşı\'nda Edirne geri alındı.']),
  TABLE(['Fikir akımı', 'Amacı'], ['Osmanlıcılık', 'Din ve ırk ayrımı gözetmeden tüm unsurları Osmanlı kimliğinde birleştirmek'], ['İslamcılık', 'Müslüman unsurları halifelik etrafında birleştirmek'], ['Türkçülük', 'Türk milletinin birliği; Balkan Savaşları sonrası güç kazandı'], ['Batıcılık', 'Batı\'nın bilim ve tekniğini örnek alarak kalkınmak']),
  TIP('Trablusgarp Savaşı\'nda Mustafa Kemal Derne ve Tobruk\'ta görev yaptı. Balkan Savaşları\'ndan sonra Türkçülük akımı güç kazandı ve Osmanlıcılık önemini yitirdi.'),
], [card('Uşi Antlaşması', 'Trablusgarp Savaşı (1912)'), card('Edirne\'nin geri alınması', 'II. Balkan Savaşı')]);
tr.q('xx-yuzyil', 'Trablusgarp Savaşı\'nın sonunda İtalya ile imzalanan antlaşma aşağıdakilerden hangisidir?', ['Londra', 'Bükreş', 'Uşi', 'Atina', 'İstanbul'], 'C', '1912 Uşi Antlaşması ile Trablusgarp ve Bingazi İtalya\'ya bırakıldı.', 1);
tr.q('xx-yuzyil', 'II. Balkan Savaşı sırasında Osmanlı Devleti\'nin geri aldığı şehir aşağıdakilerden hangisidir?', ['Selanik', 'Edirne', 'Manastır', 'Üsküp', 'Yanya'], 'B', 'Balkan devletlerinin kendi aralarında savaşmasından yararlanılarak Edirne geri alındı.', 1);
tr.q('xx-yuzyil', 'Osmanlı Devleti\'ndeki tüm unsurları din ve ırk ayrımı gözetmeden ortak bir kimlik etrafında birleştirmeyi amaçlayan fikir akımı aşağıdakilerden hangisidir?', ['İslamcılık', 'Türkçülük', 'Batıcılık', 'Osmanlıcılık', 'Adem-i merkeziyetçilik'], 'D', 'Osmanlıcılık, Tanzimat\'tan itibaren dağılmayı önlemek için savunulmuştur.', 1);

// ═════════════════════════════ COĞRAFYA ═════════════════════════════
const cg = builder('tyt-cog', 'b');

cg.lesson('doga-insan', 7, 'Coğrafyanın konusu, doğal ve beşerî sistemler ve coğrafya bilimine katkı yapanlar.', [
  UL('Doğal sistemler: atmosfer (hava), hidrosfer (su), litosfer (taş küre), biyosfer (canlılar).', 'Beşerî unsurlar insan eliyle oluşturulur: yerleşme, yol, baraj, tarım alanı, fabrika.'),
  TABLE(['Bilgin', 'Katkı'], ['Eratosthenes', '"Coğrafya" terimini ilk kullandı; Dünya\'nın çevresini hesapladı'], ['Strabon', 'Geographica adlı eser'], ['Kaşgarlı Mahmut', 'İlk Türk dünya haritası (Divânü Lügati\'t-Türk)'], ['Piri Reis', 'Kitab-ı Bahriye ve 1513 dünya haritası'], ['Evliya Çelebi', 'Seyahatname'], ['Kâtip Çelebi', 'Cihannüma']),
  TIP('Doğal ve beşerî unsurlar sürekli etkileşim hâlindedir: İnsan baraj yaparak akarsuyu değiştirir; doğa da deprem ve sel gibi olaylarla yerleşmeyi etkiler.', 'info'),
], [card('İlk Türk dünya haritası', 'Kaşgarlı Mahmut'), card('Kitab-ı Bahriye', 'Piri Reis')]);
cg.q('doga-insan', 'İlk Türk dünya haritasını çizen bilgin aşağıdakilerden hangisidir?', ['Piri Reis', 'Kâtip Çelebi', 'Kaşgarlı Mahmut', 'Evliya Çelebi', 'Biruni'], 'C', 'Kaşgarlı Mahmut, Divânü Lügati\'t-Türk adlı eserinde ilk Türk dünya haritasını çizmiştir.', 1);
cg.q('doga-insan', 'Denizcilik bilgilerini içeren Kitab-ı Bahriye adlı eserin yazarı aşağıdakilerden hangisidir?', ['Kâtip Çelebi', 'Piri Reis', 'Seydi Ali Reis', 'Evliya Çelebi', 'Barbaros Hayreddin'], 'B', 'Kitab-ı Bahriye, Piri Reis\'in Akdeniz kıyılarını ayrıntılı anlatan eseridir.', 1);
cg.q('doga-insan', 'Aşağıdakilerden hangisi beşerî bir unsurdur?', ['Akarsu', 'Dağ', 'Baraj', 'Göl', 'Orman'], 'C', 'Baraj insan eliyle yapılmıştır; diğerleri doğal unsurlardır.', 1);

cg.lesson('konum', 8, 'Matematik ve özel konum; Türkiye\'nin konumunun sonuçları.', [
  UL('Paraleller: Ekvatora paralel daireler; 0°–90° kuzey ve güney (toplam 180 paralel). Ekvatordan uzaklaştıkça sıcaklık azalır, gece-gündüz süre farkı artar, çizgisel hız azalır.', 'Meridyenler: Kutuplarda birleşen yarım daireler; başlangıç Greenwich (0°); toplam 360 meridyen. Ardışık iki meridyen arası 4 dakika.'),
  TABLE(['Türkiye', 'Değer'], ['Enlem', '36°–42° Kuzey'], ['Boylam', '26°–45° Doğu'], ['Doğu-batı yerel saat farkı', '19° · 4 dk = 76 dk'], ['Saat dilimi', 'UTC+3 (2016\'dan beri yıl boyu)']),
  P('Özel konum; bir yerin kara-deniz dağılımı, yer şekilleri, komşuları ve ulaşım yollarına göre konumudur. Türkiye\'nin Asya ile Avrupa arasında köprü olması ve Boğazlar özel konum özelliğidir.'),
], [card('Türkiye doğu-batı saat farkı', '76 dakika'), card('Ekvatordan uzaklaştıkça', 'Gece-gündüz farkı artar')]);
cg.q('konum', 'Türkiye\'nin en doğusu ile en batısı arasındaki yerel saat farkı yaklaşık kaç dakikadır?', ['19', '36', '60', '76', '96'], 'D', 'Türkiye 26°–45° D boylamları arasındadır: 19° · 4 dk = 76 dk.', 1);
cg.q('konum', 'Ekvatordan kutuplara doğru gidildikçe aşağıdakilerden hangisi artar?', ['Ortalama sıcaklık', 'Çizgisel hız', 'Gece ile gündüz süreleri arasındaki fark', 'Güneş ışınlarının geliş açısı', 'Bitki çeşitliliği'], 'C', 'Ekvatorda gece-gündüz yıl boyu yaklaşık eşittir; kutuplara doğru fark artar ve kutuplarda 6 ay gece, 6 ay gündüz yaşanır.', 2);
cg.q('konum', 'Türkiye\'nin Asya ile Avrupa arasında köprü konumunda olması hangi konum özelliğidir?', ['Matematik konum', 'Mutlak konum', 'Özel konum', 'Astronomik konum', 'Kutup konumu'], 'C', 'Kıtalar, denizler ve ulaşım yollarına göre belirlenen konum özel konumdur.', 1);

cg.lesson('harita', 9, 'Ölçek türleri ve hesapları, izohipsler ve yer şekillerini gösterme yöntemleri.', [
  F('Ölçek', 'Ölçek = Harita uzaklığı / Gerçek uzaklık', '1 km = 100 000 cm'),
  TABLE(['', 'Büyük ölçek (1/25 000)', 'Küçük ölçek (1/1 000 000)'], ['Paydası', 'Küçük', 'Büyük'], ['Ayrıntı', 'Fazla', 'Az'], ['Gösterilen alan', 'Dar', 'Geniş'], ['Bozulma', 'Az', 'Fazla']),
  UL('İzohips (eş yükselti eğrisi): Aynı yükseltideki noktaları birleştirir. Eğriler sıklaştıkça eğim artar.', 'Tabakalı renklendirme: Yükselti basamakları renklerle gösterilir (alçak yerler yeşil, yüksek yerler kahverengi).'),
], [card('Büyük ölçek', 'Paydası küçük, ayrıntı fazla'), card('İzohips sık', 'Eğim fazla')]);
cg.q('harita', 'Aşağıdaki ölçeklerden hangisi en büyük ölçektir?', ['1/25 000', '1/100 000', '1/500 000', '1/1 000 000', '1/5 000 000'], 'A', 'Paydası en küçük olan ölçek en büyük ölçektir ve en fazla ayrıntıyı gösterir.', 1);
cg.q('harita', 'Ölçeği 1/500 000 olan bir haritada 4 cm olarak ölçülen uzaklık gerçekte kaç km\'dir?', ['2', '5', '20', '50', '200'], 'C', '4 · 500 000 = 2 000 000 cm = 20 km.', 1);
cg.q('harita', 'Eş yükselti eğrilerinin (izohips) sıklaştığı yerler için aşağıdakilerden hangisi söylenebilir?', ['Eğim azdır.', 'Eğim fazladır.', 'Yükselti azdır.', 'Arazi düzdür.', 'Akarsular yavaş akar.'], 'B', 'Kısa yatay mesafede çok yükselti değişimi olduğu için eğim fazladır.', 1);

cg.lesson('yer-sekilleri', 11, 'Yer şekillerini oluşturan iç ve dış kuvvetler; akarsu, rüzgâr, buzul, dalga ve karstik şekiller.', [
  TABLE(['İç kuvvetler', 'Açıklama'], ['Orojenez', 'Dağ oluşumu: kıvrılma ve kırılma'], ['Epirojenez', 'Geniş alanların yükselip alçalması (kıta oluşumu)'], ['Volkanizma', 'Magmanın yer kabuğuna ya da yüzeye çıkması'], ['Deprem', 'Yer kabuğunun ani kırılmasıyla oluşan sarsıntılar']),
  TABLE(['Dış kuvvet', 'Aşındırma şekli', 'Biriktirme şekli'], ['Akarsu', 'Vadi, kanyon, peri bacası', 'Delta, birikinti konisi, taşkın ovası'], ['Rüzgâr', 'Mantar kaya', 'Kumul'], ['Buzul', 'Sirk, hörgüç kaya', 'Moren'], ['Dalga', 'Falez', 'Kıyı oku, tombolo, lagün'], ['Karstik (yer altı suyu)', 'Lapya, dolin, polye, mağara', 'Traverten, sarkıt, dikit']),
  TIP('Pamukkale travertenleri, kalsiyum bikarbonatlı yer altı sularının yüzeye çıkıp CO₂ kaybederek kalsiyum karbonat çökeltmesiyle oluşur (karstik biriktirme).', 'info'),
], [card('Delta', 'Akarsu biriktirmesi'), card('Traverten', 'Karstik biriktirme (Pamukkale)')]);
cg.q('yer-sekilleri', 'Pamukkale travertenlerinin oluşumunda etkili olan dış kuvvet aşağıdakilerden hangisidir?', ['Rüzgârlar', 'Buzullar', 'Dalgalar', 'Yer altı suları (karstik süreçler)', 'Akarsuların aşındırması'], 'D', 'Kireçli yer altı sularının yüzeyde kalsiyum karbonat çökeltmesiyle travertenler oluşur.', 2);
cg.q('yer-sekilleri', 'Aşağıdakilerden hangisi akarsuların biriktirme şeklidir?', ['Delta', 'Falez', 'Moren', 'Lapya', 'Mantar kaya'], 'A', 'Delta, akarsuyun denize döküldüğü yerde taşıdığı malzemeyi biriktirmesiyle oluşur.', 1);
cg.q('yer-sekilleri', 'Aşağıdakilerden hangisi iç kuvvetlerdendir?', ['Rüzgâr', 'Buzul', 'Volkanizma', 'Akarsu', 'Dalga'], 'C', 'Volkanizma, kaynağını yer içindeki magmadan alan bir iç kuvvettir.', 1);

cg.lesson('su-toprak-bitki', 10, 'Türkiye\'de akarsular, göller, toprak türleri ve doğal bitki örtüsü.', [
  UL('Türkiye sınırları içindeki en uzun akarsu Kızılırmak\'tır. Fırat ve Dicle Basra Körfezi\'ne dökülür.', 'En büyük göl Van Gölü\'dür (sodalı, volkanik set gölü). Tuz Gölü tektonik çukurda oluşmuştur.', 'Göl oluşumları: tektonik (Tuz, Burdur), volkanik (Nemrut krater), karstik (Salda), set (Tortum heyelan seti), buzul (Kaçkar\'daki göller).'),
  TABLE(['Toprak', 'Oluşumu', 'Örnek'], ['Zonal', 'İklim ve bitki örtüsünün etkisiyle', 'Çernozyom (bozkır), podzol (tayga), laterit (tropikal)'], ['İntrazonal', 'Ana kayanın etkisiyle', 'Terra rossa (kırmızı Akdeniz toprağı), rendzina'], ['Azonal (taşınmış)', 'Akarsu, rüzgâr, buzul taşımasıyla', 'Alüvyal (akarsu), lös (rüzgâr), moren']),
  TABLE(['Bitki örtüsü', 'İklim'], ['Orman', 'Karadeniz (nemli)'], ['Maki', 'Akdeniz; ormanların tahribiyle oluşur'], ['Bozkır (step)', 'Karasal iklim'], ['Alpin çayır', 'Yüksek dağlar']),
], [card('En uzun akarsu (Türkiye içi)', 'Kızılırmak'), card('Alüvyal toprak', 'Akarsuların taşıdığı malzeme')]);
cg.q('su-toprak-bitki', 'Tamamı Türkiye sınırları içinde bulunan en uzun akarsu aşağıdakilerden hangisidir?', ['Fırat', 'Sakarya', 'Kızılırmak', 'Yeşilırmak', 'Dicle'], 'C', 'Kızılırmak Türkiye sınırları içinde doğup Karadeniz\'e dökülen en uzun akarsudur.', 1);
cg.q('su-toprak-bitki', 'Akdeniz ikliminin görüldüğü yerlerde ormanların tahrip edilmesiyle oluşan bitki örtüsü aşağıdakilerden hangisidir?', ['Bozkır', 'Maki', 'Tundra', 'Savan', 'Alpin çayır'], 'B', 'Maki; kızılçam ormanlarının tahrip edildiği yerlerde gelişen, yaz kuraklığına dayanıklı çalı topluluğudur.', 1);
cg.q('su-toprak-bitki', 'Akarsuların taşıyıp ova ve deltalarda biriktirdiği malzemeden oluşan verimli toprak türü aşağıdakilerden hangisidir?', ['Podzol', 'Terra rossa', 'Alüvyal', 'Laterit', 'Çernozyom'], 'C', 'Alüvyal topraklar azonal (taşınmış) topraklardır ve tarım için çok verimlidir.', 1);

cg.lesson('nufus', 9, 'Nüfusun belirlenmesi, nüfus yoğunluğu çeşitleri ve Türkiye\'de nüfus dağılımı.', [
  UL('Türkiye\'de 2007\'den beri nüfus Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) ile her yıl belirlenir (TÜİK).', 'TÜİK\'e göre 31 Aralık 2024 itibarıyla Türkiye nüfusu yaklaşık 85,7 milyondur; en kalabalık il İstanbul\'dur.'),
  F('Nüfus yoğunluğu', 'Aritmetik yoğunluk = Toplam nüfus / Yüzölçümü', 'Tarımsal yoğunluk = Tarımla geçinen nüfus / Tarım alanı', 'Fizyolojik yoğunluk = Toplam nüfus / Tarım alanı'),
  TABLE(['Nüfusun yoğun olduğu yerler', 'Seyrek olduğu yerler'], ['Marmara, Ege ve Akdeniz kıyıları, Çukurova', 'Doğu Anadolu\'nun yüksek kesimleri, Tuz Gölü çevresi, Toroslar']),
], [card('ADNKS', '2007\'den beri her yıl'), card('Aritmetik yoğunluk', 'Nüfus / yüzölçümü')]);
cg.q('nufus', 'Aritmetik nüfus yoğunluğu nasıl hesaplanır?', ['Tarımla geçinen nüfus / tarım alanı', 'Toplam nüfus / yüzölçümü', 'Toplam nüfus / tarım alanı', 'Kentli nüfus / toplam nüfus', 'Doğum sayısı / toplam nüfus'], 'B', 'Aritmetik yoğunluk, km² başına düşen kişi sayısıdır.', 1);
cg.q('nufus', 'Türkiye\'de nüfusu en kalabalık il aşağıdakilerden hangisidir?', ['Ankara', 'İzmir', 'İstanbul', 'Bursa', 'Antalya'], 'C', 'TÜİK ADNKS verilerine göre İstanbul en kalabalık ildir.', 1);
cg.q('nufus', 'Türkiye\'de 2007 yılından beri nüfus aşağıdaki yöntemlerden hangisiyle belirlenmektedir?', ['Beş yılda bir yapılan genel nüfus sayımı', 'Adrese Dayalı Nüfus Kayıt Sistemi', 'Örnekleme anketleri', 'Seçmen kütükleri', 'Muhtarlık bildirimleri'], 'B', 'ADNKS ile nüfus her yıl kayıtlardan hesaplanır ve TÜİK tarafından açıklanır.', 1);

cg.lesson('goc', 8, 'Göç türleri, itici ve çekici faktörler; Türkiye\'deki göç hareketleri.', [
  TABLE(['Göç türü', 'Örnek'], ['İç göç', 'Kırdan kente göç'], ['Dış göç', '1961\'den sonra Almanya\'ya işçi göçü'], ['Mevsimlik göç', 'Tarım işçileri, yaylacılık'], ['Beyin göçü', 'Nitelikli insan gücünün başka ülkelere gitmesi'], ['Zorunlu göç', 'Savaş ve afet nedeniyle (mülteciler)']),
  TABLE(['İtici faktörler', 'Çekici faktörler'], ['İşsizlik, toprağın yetersizliği, afetler', 'İş olanakları, eğitim ve sağlık hizmetleri']),
  TIP('Türkiye ile Almanya arasındaki işgücü anlaşması 1961\'de imzalanmıştır.', 'info'),
], [card('Beyin göçü', 'Nitelikli insan gücünün yurt dışına gitmesi'), card('Almanya işçi anlaşması', '1961')]);
cg.q('goc', 'Aşağıdakilerden hangisi göç veren yerler için itici bir faktördür?', ['Sanayi kuruluşlarının fazla olması', 'İşsizlik', 'Eğitim olanaklarının fazla olması', 'Sağlık hizmetlerinin gelişmiş olması', 'Ulaşım olanaklarının iyi olması'], 'B', 'İşsizlik insanları yaşadıkları yerden göç etmeye zorlar; diğerleri çekici faktörlerdir.', 1);
cg.q('goc', 'Nitelikli ve eğitimli insan gücünün başka ülkelere göç etmesine ne ad verilir?', ['Mevsimlik göç', 'Zorunlu göç', 'Beyin göçü', 'İç göç', 'Yaylacılık'], 'C', 'Beyin göçü, ülkenin yetişmiş insan kaynağını kaybetmesine yol açar.', 1);
cg.q('goc', 'Türkiye ile Almanya arasında işgücü göçüne ilişkin anlaşma hangi yıl imzalanmıştır?', ['1950', '1961', '1974', '1980', '1990'], 'B', '1961\'deki anlaşmayla Türkiye\'den Almanya\'ya yoğun işçi göçü başladı.', 1);

cg.lesson('yerlesme', 8, 'Kır ve kent yerleşmeleri, toplu-dağınık yerleşme ve şehirlerin fonksiyonları.', [
  UL('Kırsal yerleşmeler: köy, mezra (köye bağlı küçük yerleşme), kom (Doğu Karadeniz\'de hayvancılık yerleşmesi), yayla (yazın hayvancılık için çıkılan geçici yerleşme), oba (göçebe çadırları).', 'Dağınık yerleşme: Engebeli arazinin, her mevsim yağışın ve su kaynaklarının bol olduğu yerlerde (Doğu Karadeniz).', 'Toplu yerleşme: Su kaynaklarının sınırlı olduğu düz alanlarda (İç Anadolu).'),
  TABLE(['Şehir fonksiyonu', 'Örnek'], ['Yönetim', 'Ankara'], ['Sanayi', 'Kocaeli, Bursa'], ['Turizm', 'Antalya, Muğla'], ['Liman', 'Mersin, İzmir'], ['Maden', 'Zonguldak, Soma']),
  TIP('Kentlerde nüfusun hızla artması plansız yapılaşma (gecekondu), trafik, hava kirliliği ve altyapı sorunlarına yol açar.', 'info'),
], [card('Mezra', 'Köye bağlı küçük yerleşme'), card('Dağınık yerleşme', 'Doğu Karadeniz')]);
cg.q('yerlesme', 'Doğu Karadeniz\'de kırsal yerleşmelerin dağınık olmasının temel nedeni aşağıdakilerden hangisidir?', ['Nüfusun az olması', 'Arazinin engebeli olması ve su kaynaklarının her yerde bulunması', 'Kuraklık', 'Tarım alanlarının geniş olması', 'Ulaşımın kolay olması'], 'B', 'Engebeli arazi tarım alanlarını parçalar; her mevsim yağış alındığı için konutlar su kaynağına bağlı kalmaz.', 2);
cg.q('yerlesme', 'Yaz aylarında hayvanları otlatmak için çıkılan, geçici olarak kullanılan kırsal yerleşme aşağıdakilerden hangisidir?', ['Mezra', 'Yayla', 'Kasaba', 'Çiftlik', 'Divan'], 'B', 'Yaylalar yüksek kesimlerde yazın kullanılan geçici yerleşmelerdir.', 1);
cg.q('yerlesme', 'Aşağıdaki şehirlerden hangisinin öne çıkan fonksiyonu turizmdir?', ['Zonguldak', 'Kocaeli', 'Antalya', 'Ankara', 'Mersin'], 'C', 'Antalya, deniz-kum-güneş ve tarihî değerleriyle Türkiye\'nin önde gelen turizm şehridir.', 1);

cg.lesson('ekonomik', 7, 'Ekonomik faaliyetlerin sınıflandırılması ve gelişmişlikle ilişkisi.', [
  TABLE(['Faaliyet', 'Kapsam'], ['Birincil', 'Doğadan doğrudan yararlanma: tarım, hayvancılık, balıkçılık, ormancılık, madencilik'], ['İkincil', 'Hammaddeyi işleme: sanayi, enerji üretimi'], ['Üçüncül', 'Hizmet: ticaret, ulaşım, turizm, eğitim, sağlık'], ['Dördüncül', 'Bilgi ve teknoloji üretimi: Ar-Ge, yazılım']),
  P('Gelişmiş ülkelerde çalışan nüfusun büyük kısmı hizmet sektöründedir; az gelişmiş ülkelerde ise tarım sektörünün payı yüksektir.'),
  TIP('Birincil faaliyetlerde doğal koşullar (iklim, yer şekilleri, toprak) belirleyicidir; üçüncül faaliyetlerde ise nüfus, sermaye ve teknoloji öne çıkar.'),
], [card('Birincil faaliyet', 'Tarım, balıkçılık, madencilik'), card('Gelişmiş ülkeler', 'Hizmet sektörü ağırlıklı')]);
cg.q('ekonomik', 'Aşağıdakilerden hangisi birincil ekonomik faaliyettir?', ['Otomobil üretimi', 'Balıkçılık', 'Turizm', 'Bankacılık', 'Yazılım geliştirme'], 'B', 'Balıkçılık doğadan doğrudan ürün elde etmeye dayanır.', 1);
cg.q('ekonomik', 'Aşağıdakilerden hangisi üçüncül (hizmet) ekonomik faaliyettir?', ['Madencilik', 'Ormancılık', 'Turizm', 'Tekstil sanayii', 'Hayvancılık'], 'C', 'Turizm bir hizmet faaliyetidir.', 1);
cg.q('ekonomik', 'Gelişmiş ülkelerde çalışan nüfusun en büyük bölümü hangi sektörde yer alır?', ['Tarım', 'Madencilik', 'Hizmet', 'Ormancılık', 'Balıkçılık'], 'C', 'Gelişmiş ekonomilerde hizmet sektörünün istihdamdaki payı en yüksektir.', 1);

cg.lesson('bolgeler', 8, 'Bölge kavramı ve türleri, Türkiye\'nin coğrafi bölgeleri ve uluslararası ulaşım hatları.', [
  UL('Doğal (formal) bölgeler: Benzer doğal özelliklere göre belirlenir (iklim bölgeleri, bitki örtüsü alanları).', 'Beşerî bölgeler: Nüfus, ekonomi, kültür gibi özelliklere göre.', 'Fonksiyonel (işlevsel) bölgeler: Bir merkezin çevresiyle kurduğu ilişkiye göre (bir limanın hinterlandı, bir şehrin etki alanı).', 'Türkiye\'nin 7 coğrafi bölgesi 1941\'de Ankara\'da toplanan Birinci Coğrafya Kongresi\'nde belirlendi.'),
  TABLE(['Ulaşım hattı', 'Bağladığı yerler'], ['Süveyş Kanalı', 'Akdeniz – Kızıldeniz'], ['Panama Kanalı', 'Atlas – Büyük Okyanus'], ['Türk Boğazları', 'Karadeniz – Akdeniz'], ['Orta Koridor', 'Çin – Orta Asya – Hazar – Türkiye – Avrupa']),
  TIP('Bir alanı tek bir ölçüte (iklim, yükselti, tarım ürünü) göre belirliyorsak formal bölgeden; bir merkezin çevresine verdiği hizmete göre belirliyorsak fonksiyonel bölgeden söz ederiz.'),
], [card('Coğrafi bölgeler', '1941 — Birinci Coğrafya Kongresi'), card('Süveyş Kanalı', 'Akdeniz – Kızıldeniz')]);
cg.q('bolgeler', 'Türkiye\'nin coğrafi bölgeleri hangi yıl toplanan Birinci Coğrafya Kongresi\'nde belirlenmiştir?', ['1923', '1935', '1941', '1950', '1960'], 'C', '1941\'de Ankara\'da toplanan kongrede Türkiye yedi coğrafi bölgeye ayrıldı.', 1);
cg.q('bolgeler', 'Akdeniz\'i Kızıldeniz\'e bağlayan yapay su yolu aşağıdakilerden hangisidir?', ['Panama Kanalı', 'Süveyş Kanalı', 'Cebelitarık Boğazı', 'İstanbul Boğazı', 'Hürmüz Boğazı'], 'B', 'Süveyş Kanalı Avrupa ile Asya arasındaki deniz yolunu kısaltır.', 1);
cg.q('bolgeler', 'Aşağıdakilerden hangisi fonksiyonel (işlevsel) bölgeye örnektir?', ['Akdeniz iklim bölgesi', 'Bozkır alanı', 'Bir limanın hizmet verdiği hinterland alanı', 'Karstik arazi', 'Volkanik plato'], 'C', 'Fonksiyonel bölge bir merkezin çevresiyle kurduğu ilişkiye göre belirlenir.', 2);

cg.lesson('afetler', 9, 'Deprem, sel, heyelan, çığ ve orman yangınları; Türkiye\'de afet riski ve korunma.', [
  TABLE(['Afet', 'Türkiye\'de en sık görüldüğü yer'], ['Deprem', 'Kuzey ve Doğu Anadolu fay hatları, Ege'], ['Heyelan', 'Karadeniz'], ['Çığ', 'Doğu Anadolu ve Doğu Karadeniz\'in yüksek kesimleri'], ['Orman yangını', 'Akdeniz ve Ege kıyıları'], ['Kuraklık', 'İç Anadolu, Güneydoğu Anadolu']),
  UL('Türkiye Alp-Himalaya deprem kuşağındadır.', '6 Şubat 2023\'te merkez üsleri Kahramanmaraş\'ın Pazarcık ve Elbistan ilçeleri olan iki büyük deprem 11 ilde büyük yıkıma yol açtı.', 'Afet ve acil durum yönetimini AFAD (Afet ve Acil Durum Yönetimi Başkanlığı) yürütür.'),
  TIP('Depremde "çök, kapan, tutun" kuralını uygulayın; deprem çantası ve aile afet planı hazırlayın.', 'info'),
], [card('Heyelan', 'En çok Karadeniz'), card('Afet kurumu', 'AFAD')]);
cg.q('afetler', 'Türkiye\'de heyelan olaylarının en sık görüldüğü bölge aşağıdakilerden hangisidir?', ['İç Anadolu', 'Karadeniz', 'Güneydoğu Anadolu', 'Ege', 'Marmara'], 'B', 'Eğimin fazla, yağışın bol ve killi toprakların yaygın olması Karadeniz\'de heyelan riskini artırır.', 1);
cg.q('afetler', '6 Şubat 2023 depremlerinin merkez üssü olan il aşağıdakilerden hangisidir?', ['Hatay', 'Malatya', 'Kahramanmaraş', 'Gaziantep', 'Adıyaman'], 'C', 'İki büyük depremin merkez üsleri Kahramanmaraş\'ın Pazarcık ve Elbistan ilçeleridir.', 1);
cg.q('afetler', 'Türkiye\'de afet ve acil durumlarla ilgili çalışmaları yürüten resmî kurum aşağıdakilerden hangisidir?', ['TÜİK', 'AFAD', 'MTA', 'DSİ', 'TÜBİTAK'], 'B', 'AFAD, afet öncesi hazırlık, müdahale ve iyileştirme çalışmalarını koordine eder.', 1);

// ═════════════════════════════ FELSEFE ═════════════════════════════
const fl = builder('tyt-felsefe', 'b');

fl.lesson('varlik', 9, 'Varlık felsefesinin temel soruları ve varlığı açıklayan görüşler.', [
  UL('Varlık var mıdır? Nihilizm: "Hiçbir şey yoktur; olsa bile bilinemez" (Gorgias).', 'Varlık nedir?'),
  TABLE(['Görüş', 'Varlığın özü', 'Temsilci'], ['İdealizm', 'Düşünce, idea, ruh', 'Platon, Hegel, Berkeley'], ['Materyalizm', 'Madde', 'Demokritos, Marx'], ['Düalizm', 'Madde ve ruh (iki ayrı töz)', 'Descartes'], ['Oluş', 'Sürekli değişim', 'Herakleitos'], ['Olmak (değişmezlik)', 'Değişim bir yanılsamadır', 'Parmenides']),
  TIP('"Aynı nehirde iki kez yıkanılmaz." sözü Herakleitos\'a aittir ve varlığın sürekli değiştiğini (oluş) anlatır.'),
], [card('Oluş görüşü', 'Herakleitos'), card('Düalizm', 'Descartes — ruh ve madde')]);
fl.q('varlik', '"Aynı nehirde iki kez yıkanılmaz." sözüyle varlığın sürekli değiştiğini savunan filozof aşağıdakilerden hangisidir?', ['Parmenides', 'Herakleitos', 'Platon', 'Demokritos', 'Thales'], 'B', 'Herakleitos\'a göre evrendeki her şey sürekli değişim (oluş) içindedir.', 1);
fl.q('varlik', 'Varlığın özünü yalnızca madde olarak gören felsefi görüş aşağıdakilerden hangisidir?', ['İdealizm', 'Materyalizm', 'Düalizm', 'Nihilizm', 'Fenomenoloji'], 'B', 'Materyalizme göre gerçek varlık maddedir; ruh ve düşünce de maddenin ürünüdür.', 1);
fl.q('varlik', 'Varlığı birbirinden bağımsız iki töz olan ruh ve maddeyle açıklayan filozof aşağıdakilerden hangisidir?', ['Descartes', 'Hegel', 'Marx', 'Herakleitos', 'Berkeley'], 'A', 'Descartes\'ın düalizmine göre düşünen töz (ruh) ile yer kaplayan töz (madde) ayrıdır.', 2);

fl.lesson('ahlak', 9, 'Ahlak felsefesinin kavramları ve evrensel bir ahlak yasası olup olmadığına ilişkin görüşler.', [
  UL('Temel kavramlar: iyi, kötü, erdem, özgürlük, sorumluluk, vicdan, ahlak yasası.'),
  TABLE(['Görüş', 'Ahlaki eylemin ölçütü', 'Temsilci'], ['Ödev ahlakı', 'İyi niyet ve ödev; "Eyleminin ilkesi evrensel bir yasa olabilsin."', 'Kant'], ['Hedonizm', 'Haz', 'Aristippos, Epikuros'], ['Faydacılık (utilitarizm)', 'En çok sayıda insana en büyük mutluluk', 'Bentham, J. S. Mill'], ['Erdem ahlakı / erdemli toplum', 'Mutluluğa erdemle ulaşma', 'Aristoteles, Farabi'], ['Egoizm', 'Kişisel çıkar', 'Hobbes']),
  TIP('Sofistler ve nihilistler evrensel bir ahlak yasasının olmadığını savunur; Kant ise aklın evrensel ahlak yasasını koyduğunu söyler.'),
], [card('Ödev ahlakı', 'Kant'), card('Faydacılık', 'En çok sayıda insana en büyük fayda')]);
fl.q('ahlak', 'Ahlaki eylemin değerini sonuçlarında değil, iyi niyet ve ödev bilincinde arayan filozof aşağıdakilerden hangisidir?', ['Epikuros', 'Kant', 'J. S. Mill', 'Hobbes', 'Aristippos'], 'B', 'Kant\'a göre bir eylemi ahlaki kılan, ödevden dolayı ve iyi niyetle yapılmasıdır.', 1);
fl.q('ahlak', '"Doğru eylem, en çok sayıda insana en büyük mutluluğu sağlayandır." görüşü hangi ahlak anlayışına aittir?', ['Hedonizm', 'Ödev ahlakı', 'Faydacılık', 'Egoizm', 'Nihilizm'], 'C', 'Faydacılık (utilitarizm) eylemleri toplumsal faydaya göre değerlendirir.', 1);
fl.q('ahlak', 'Ahlaki davranışın amacının haz olduğunu savunan görüş aşağıdakilerden hangisidir?', ['Hedonizm', 'Faydacılık', 'Ödev ahlakı', 'Sezgicilik', 'Varoluşçuluk'], 'A', 'Hedonizme göre iyi olan hazdır; kötü olan acıdır.', 1);

fl.lesson('sanat', 8, 'Estetik kavramı, güzellik ve sanatın ne olduğuna ilişkin görüşler.', [
  UL('"Estetik" terimini felsefi bir disiplin adı olarak ilk kullanan Alexander Baumgarten\'dır.', 'Sanat felsefesi; sanat eserini, sanatçıyı, güzelliği ve sanatın işlevini inceler.'),
  TABLE(['Görüş', 'Sanat nedir?', 'Temsilci'], ['Taklit (mimesis)', 'Doğanın ve gerçekliğin taklidi', 'Platon, Aristoteles'], ['Yaratma / sezgi', 'Sanatçının iç dünyasının sezgiyle dışavurumu', 'Benedetto Croce'], ['Oyun', 'Özgür bir oyun etkinliği', 'Friedrich Schiller'], ['Mutlak ruh', 'Mutlak ruhun duyusal görünüşü', 'Hegel']),
  TIP('Kant\'a göre güzel, çıkar gözetmeden hoşa gidendir; beğeni yargısı öznel olsa da evrensellik iddiası taşır.', 'info'),
], [card('Estetik terimi', 'Baumgarten'), card('Sanat bir oyundur', 'Schiller')]);
fl.q('sanat', '"Estetik" terimini felsefi bir disiplin adı olarak ilk kullanan düşünür aşağıdakilerden hangisidir?', ['Kant', 'Baumgarten', 'Hegel', 'Croce', 'Platon'], 'B', 'Baumgarten, 18. yüzyılda duyusal bilgi ve güzellik üzerine çalışmaya "estetik" adını vermiştir.', 1);
fl.q('sanat', 'Sanatı doğanın taklidi (mimesis) olarak gören filozof aşağıdakilerden hangisidir?', ['Croce', 'Aristoteles', 'Schiller', 'Hegel', 'Baumgarten'], 'B', 'Platon ve Aristoteles sanatı taklit olarak açıklar.', 1);
fl.q('sanat', '"Sanat, insanın özgürce gerçekleştirdiği bir oyundur." görüşü aşağıdaki düşünürlerden hangisine aittir?', ['Schiller', 'Croce', 'Platon', 'Hegel', 'Aristoteles'], 'A', 'Schiller sanatı insanın özgürlüğünü yaşadığı oyun etkinliği olarak görür.', 1);

fl.lesson('din-felsefesi', 8, 'Tanrı\'nın varlığı ve evrenle ilişkisi üzerine felsefi görüşler.', [
  TABLE(['Görüş', 'Temel iddia'], ['Teizm', 'Tanrı vardır, evreni yaratmış ve yönetmektedir; vahiy vardır.'], ['Deizm', 'Tanrı evreni yaratmıştır ama işleyişine karışmaz; vahyi kabul etmez (Voltaire, Rousseau).'], ['Panteizm', 'Tanrı ile evren aynıdır (Spinoza).'], ['Ateizm', 'Tanrı yoktur.'], ['Agnostisizm', 'Tanrı\'nın varlığı da yokluğu da bilinemez.']),
  UL('Tanrı\'nın varlığına ilişkin kanıtlar: ontolojik (en yetkin varlık düşüncesi — Anselmus), kozmolojik (ilk neden), teleolojik (evrendeki düzen ve amaç).'),
  TIP('Deizm ile teizm arasındaki fark vahiy ve Tanrı\'nın evrene müdahalesidir: Teizm ikisini de kabul eder, deizm reddeder.'),
], [card('Deizm', 'Yaratır ama müdahale etmez'), card('Panteizm', 'Tanrı = evren (Spinoza)')]);
fl.q('din-felsefesi', '"Tanrı evreni yaratmıştır ama evrenin işleyişine müdahale etmez." görüşü aşağıdakilerden hangisidir?', ['Teizm', 'Deizm', 'Panteizm', 'Ateizm', 'Agnostisizm'], 'B', 'Deizm Tanrı\'yı ilk yaratıcı olarak kabul eder; vahyi ve mucizeyi reddeder.', 1);
fl.q('din-felsefesi', 'Tanrı ile evrenin bir ve aynı olduğunu savunan görüş aşağıdakilerden hangisidir?', ['Panteizm', 'Deizm', 'Teizm', 'Agnostisizm', 'Düalizm'], 'A', 'Panteizme göre Tanrı evrenin dışında değil, evrenin kendisidir (Spinoza).', 1);
fl.q('din-felsefesi', 'Tanrı\'nın varlığının da yokluğunun da bilinemeyeceğini savunan görüş aşağıdakilerden hangisidir?', ['Ateizm', 'Teizm', 'Agnostisizm', 'Deizm', 'Panteizm'], 'C', 'Agnostisizm, bu konuda kesin bilgiye ulaşılamayacağını savunur.', 1);

fl.lesson('siyaset', 9, 'Devlet, iktidar, meşruiyet ve ideal düzen üzerine siyaset felsefesi görüşleri.', [
  TABLE(['Filozof', 'Eser / görüş'], ['Platon', 'Devlet: filozof kralların yönettiği ideal devlet'], ['Farabi', 'El-Medinetü\'l-Fazıla: erdemli şehir'], ['Thomas More', 'Ütopya'], ['Machiavelli', 'Prens: devletin devamı için her yol meşrudur'], ['Hobbes', 'Leviathan: "İnsan insanın kurdudur"; güçlü mutlak devlet'], ['Locke', 'Doğal haklar (yaşam, özgürlük, mülkiyet); liberalizm'], ['Montesquieu', 'Kanunların Ruhu: kuvvetler ayrılığı'], ['Rousseau', 'Toplum Sözleşmesi: genel irade']),
  TIP('Ütopyacılar (Platon, Farabi, More, Campanella, Bacon) "olması gereken" ideal düzeni anlatır; Machiavelli ve Hobbes "olanı" gerçekçi biçimde ele alır.'),
  TIP('Siyaset felsefesinde "meşruiyet" kavramı, iktidarın yönetme hakkını nereden aldığını sorgular: Tanrı, gelenek, güç ya da halkın rızası.', 'info'),
], [card('Kuvvetler ayrılığı', 'Montesquieu'), card('El-Medinetü\'l-Fazıla', 'Farabi')]);
fl.q('siyaset', 'Yasama, yürütme ve yargı güçlerinin birbirinden ayrılması gerektiğini (kuvvetler ayrılığı) savunan düşünür aşağıdakilerden hangisidir?', ['Hobbes', 'Montesquieu', 'Machiavelli', 'Platon', 'Farabi'], 'B', 'Montesquieu, Kanunların Ruhu adlı eserinde özgürlüğün güvencesi olarak kuvvetler ayrılığını önerir.', 1);
fl.q('siyaset', 'El-Medinetü\'l-Fazıla (Erdemli Şehir) adlı eserin yazarı aşağıdakilerden hangisidir?', ['İbn Sina', 'Farabi', 'Gazali', 'İbn Rüşd', 'Kindi'], 'B', 'Farabi bu eserinde erdemli insanların oluşturduğu ideal toplumu anlatır.', 1);
fl.q('siyaset', '"İnsan insanın kurdudur." diyerek düzenin ancak güçlü ve mutlak bir devletle sağlanabileceğini savunan filozof aşağıdakilerden hangisidir?', ['Locke', 'Rousseau', 'Hobbes', 'Montesquieu', 'Thomas More'], 'C', 'Hobbes\'a göre doğa durumu herkesin herkese karşı savaşıdır; insanlar güvenlik için yetkilerini mutlak egemene devreder.', 1);

fl.lesson('bilim', 8, 'Bilim felsefesinin soruları: bilimsel yöntem, doğrulama, yanlışlama ve paradigma.', [
  UL('Bilimsel bilgi; olgusal, nesnel, eleştirel, birikimli, genellenebilir ve sınanabilirdir. Kesin ve değişmez değildir; yeni bulgularla düzeltilebilir.'),
  TABLE(['Düşünür / akım', 'Görüş'], ['Francis Bacon', 'Tümevarım ve deney; bilgiyi engelleyen "idoller"'], ['Viyana Çevresi (mantıkçı pozitivizm)', 'Doğrulanabilir önermeler anlamlıdır'], ['Karl Popper', 'Yanlışlanabilirlik: Bilimsel bir kuram yanlışlanabilir olmalıdır'], ['Thomas Kuhn', 'Paradigma ve bilimsel devrimler']),
  TIP('Bilim felsefesinin temel soruları: Bilimsel yöntem nedir? Bilimsel bilginin değeri nedir? Bilim ile bilim olmayan nasıl ayrılır?', 'info'),
], [card('Yanlışlanabilirlik', 'Karl Popper'), card('Paradigma', 'Thomas Kuhn')]);
fl.q('bilim', '"Bir kuramın bilimsel sayılabilmesi için yanlışlanabilir olması gerekir." görüşü aşağıdaki düşünürlerden hangisine aittir?', ['Thomas Kuhn', 'Karl Popper', 'Francis Bacon', 'Auguste Comte', 'Descartes'], 'B', 'Popper\'a göre bilim, yanlışlanabilir hipotezler ortaya koyup onları sınayarak ilerler.', 1);
fl.q('bilim', 'Bilimin belirli dönemlerde bilim insanlarınca benimsenen "paradigma"lar ve bunların değişmesiyle (bilimsel devrimler) ilerlediğini savunan düşünür aşağıdakilerden hangisidir?', ['Karl Popper', 'Thomas Kuhn', 'Francis Bacon', 'John Locke', 'Hume'], 'B', 'Kuhn, Bilimsel Devrimlerin Yapısı adlı eserinde paradigma kavramını geliştirmiştir.', 1);
fl.q('bilim', 'Aşağıdakilerden hangisi bilimsel bilginin özelliklerinden biri değildir?', ['Olgusal olması', 'Nesnel olması', 'Kesin ve değişmez olması', 'Birikimli olması', 'Sınanabilir olması'], 'C', 'Bilimsel bilgi yeni bulgularla düzeltilebilir ve değişebilir; kesin ve değişmez değildir.', 1);

// ═════════════════════════════ DİN KÜLTÜRÜ ═════════════════════════════
const dn = builder('tyt-din', 'b');

dn.lesson('bilgi-inanc', 8, 'İslam\'da bilginin kaynakları, iman ve Allah\'ın sıfatları.', [
  UL('Bilginin kaynakları: duyular, akıl, sezgi, doğru haber ve vahiy.', 'İman: Hz. Muhammed\'in Allah\'tan getirdiklerini kalp ile tasdik ve dil ile ikrar etmektir.'),
  TABLE(['Zati sıfat', 'Anlamı'], ['Vücud', 'Var olmak'], ['Kıdem', 'Varlığının başlangıcı olmamak'], ['Beka', 'Varlığının sonu olmamak'], ['Vahdaniyet', 'Bir ve tek olmak'], ['Muhalefetün li\'l-havadis', 'Yaratılmışlara benzememek'], ['Kıyam bi-nefsihi', 'Var olmak için hiçbir şeye muhtaç olmamak']),
  P('Subuti sıfatlar: hayat, ilim, semi (işitme), basar (görme), irade, kudret, kelam, tekvin (yaratma).'),
], [card('Kıdem', 'Varlığının başlangıcı olmaması'), card('Vahdaniyet', 'Allah\'ın bir ve tek olması')]);
dn.q('bilgi-inanc', 'Allah\'ın varlığının bir başlangıcı olmamasını ifade eden sıfat aşağıdakilerden hangisidir?', ['Beka', 'Kıdem', 'Vahdaniyet', 'Vücud', 'Tekvin'], 'B', 'Kıdem, Allah\'ın ezelî olması, yani varlığının başlangıcı olmaması demektir. Beka ise sonunun olmamasıdır.', 1);
dn.q('bilgi-inanc', 'Allah\'ın bir ve tek olmasını ifade eden sıfat aşağıdakilerden hangisidir?', ['Vahdaniyet', 'Kıdem', 'Beka', 'İlim', 'Kudret'], 'A', 'Vahdaniyet, Allah\'ın zatında, sıfatlarında ve fiillerinde eşi ve benzeri olmamasıdır.', 1);
dn.q('bilgi-inanc', 'Aşağıdakilerden hangisi İslam\'a göre doğru bilginin kaynaklarından biri değildir?', ['Duyular', 'Akıl', 'Vahiy', 'Fal ve büyü', 'Doğru haber'], 'D', 'Fal ve büyü İslam\'da batıl kabul edilir ve bilgi kaynağı değildir.', 1);

dn.lesson('din-islam', 7, 'Dinin tanımı, İslam\'ın anlamı ve İslam\'ın şartları.', [
  P('"İslam" sözcüğü barış, esenlik, kurtuluş ve Allah\'a teslim olma anlamlarına gelir.'),
  TABLE(['İslam\'ın şartları'], ['Kelime-i şehadet getirmek'], ['Namaz kılmak'], ['Oruç tutmak'], ['Zekât vermek'], ['Hacca gitmek (gücü yetene)']),
  P('Kelime-i şehadet: Allah\'tan başka ilah olmadığına ve Hz. Muhammed\'in O\'nun kulu ve elçisi olduğuna şahitlik etmektir.'),
  TIP('İslam\'ın şartları (5) ibadetle, imanın şartları (6) inançla ilgilidir. "Meleklere iman" imanın şartıdır.', 'warn'),
], [card('İslam\'ın şartları', '5: şehadet, namaz, oruç, zekât, hac'), card('"İslam" sözcüğü', 'Barış, esenlik, teslimiyet')]);
dn.q('din-islam', 'Aşağıdakilerden hangisi İslam\'ın şartlarından biri değildir?', ['Namaz kılmak', 'Oruç tutmak', 'Meleklere iman etmek', 'Zekât vermek', 'Hacca gitmek'], 'C', 'Meleklere iman imanın şartlarındandır; İslam\'ın şartları ibadetlerle ilgilidir.', 1);
dn.q('din-islam', '"İslam" sözcüğünün anlamları arasında aşağıdakilerden hangisi yer alır?', ['Savaş', 'Barış ve teslimiyet', 'Yolculuk', 'Bilgi', 'Kanun'], 'B', 'İslam sözcüğü "silm" kökünden gelir; barış, esenlik ve Allah\'a teslim olma anlamı taşır.', 1);
dn.q('din-islam', 'Allah\'tan başka ilah olmadığına ve Hz. Muhammed\'in O\'nun kulu ve elçisi olduğuna şahitlik etmeye ne ad verilir?', ['Kelime-i tevhid', 'Kelime-i şehadet', 'Besmele', 'Tekbir', 'İstiaze'], 'B', 'Kelime-i şehadet, İslam\'ın ilk şartıdır.', 1);

dn.lesson('ahlak', 7, 'İslam ahlakının temel değerleri ve kul hakkı.', [
  UL('İslam ahlakının kaynağı Kur\'an ve sünnettir; Hz. Muhammed en güzel örnektir (üsve-i hasene).', 'Temel değerler: adalet, doğruluk, güvenilirlik (emanet), merhamet, sabır, tevazu, yardımlaşma, cömertlik, israftan kaçınma.', 'Kul hakkı: Başkalarının maddi ya da manevi hakkının çiğnenmesidir; affı hak sahibinin rızasına bağlıdır.'),
  TABLE(['Davranış', 'Karşılığı'], ['Malı gereksiz yere harcamak', 'İsraf (yasaklanmıştır)'], ['Söz ve davranışta doğruluk', 'Sıdk'], ['Kendini büyük görmemek', 'Tevazu']),
  TIP('İslam ahlakı yalnızca bireysel değil, toplumsal sorumluluğu da kapsar: komşu hakkı, kamu malını koruma ve çevreye karşı sorumluluk da ahlaki yükümlülüktür.', 'info'),
], [card('Kul hakkı', 'Affı hak sahibinin rızasına bağlıdır'), card('"el-Emin"', 'Güvenilir')]);
dn.q('ahlak', 'Başkalarının hakkını çiğneme sonucu oluşan ve affı hak sahibinin rızasına bağlı olan kavram aşağıdakilerden hangisidir?', ['Kul hakkı', 'Tövbe', 'Kefaret', 'Sadaka', 'Fitre'], 'A', 'Kul hakkının affı için hak sahibiyle helalleşmek gerekir.', 1);
dn.q('ahlak', 'Hz. Muhammed\'in peygamberliğinden önce "el-Emin" olarak anılması onun hangi özelliğini öne çıkarır?', ['Cömertliğini', 'Güvenilirliğini', 'Cesaretini', 'Bilgisini', 'Sabrını'], 'B', '"el-Emin" güvenilir kişi demektir.', 1);
dn.q('ahlak', 'Malı ve nimetleri gereksiz yere harcamaya ne ad verilir?', ['Cimrilik', 'İsraf', 'Tasarruf', 'Kanaat', 'İnfak'], 'B', 'İsraf, Kur\'an\'da yasaklanan bir davranıştır.', 1);

dn.lesson('vahiy-akil', 8, 'Vahiy, peygamberlerin sıfatları, kutsal kitaplar ve akıl-vahiy ilişkisi.', [
  UL('Vahiy, Allah\'ın emir ve yasaklarını peygamberlerine bildirmesidir; çoğunlukla Cebrail aracılığıyla gelir.', 'Kur\'an, 610 yılında Kadir Gecesi indirilmeye başlandı ve yaklaşık 23 yılda tamamlandı. İlk inen ayetler Alak suresinin başıdır.'),
  TABLE(['Kutsal kitap', 'Peygamber'], ['Tevrat', 'Hz. Musa'], ['Zebur', 'Hz. Davud'], ['İncil', 'Hz. İsa'], ['Kur\'an-ı Kerim', 'Hz. Muhammed']),
  TABLE(['Peygamberlerin sıfatı', 'Anlamı'], ['Sıdk', 'Doğruluk'], ['Emanet', 'Güvenilirlik'], ['Tebliğ', 'Allah\'ın emirlerini eksiksiz iletme'], ['İsmet', 'Günah işlemekten korunmuşluk'], ['Fetanet', 'Üstün akıl ve zekâ']),
  P('İslam\'a göre akıl, dinî sorumluluğun ön şartıdır; akıl sağlığı yerinde olmayan kişi dinen sorumlu tutulmaz.'),
], [card('Zebur', 'Hz. Davud'), card('İsmet', 'Günahtan korunmuşluk')]);
dn.q('vahiy-akil', 'Zebur hangi peygambere indirilmiştir?', ['Hz. Musa', 'Hz. İsa', 'Hz. Davud', 'Hz. İbrahim', 'Hz. Süleyman'], 'C', 'Zebur Hz. Davud\'a, Tevrat Hz. Musa\'ya, İncil Hz. İsa\'ya indirilmiştir.', 1);
dn.q('vahiy-akil', 'Peygamberlerin günah işlemekten korunmuş olmalarını ifade eden sıfat aşağıdakilerden hangisidir?', ['Sıdk', 'Emanet', 'Tebliğ', 'İsmet', 'Fetanet'], 'D', 'İsmet, peygamberlerin günahtan uzak olmasıdır.', 1);
dn.q('vahiy-akil', 'Kur\'an-ı Kerim\'in indirilmeye başlandığı gece aşağıdakilerden hangisidir?', ['Miraç Gecesi', 'Berat Gecesi', 'Kadir Gecesi', 'Regaip Gecesi', 'Arefe Gecesi'], 'C', 'Kadir suresinde Kur\'an\'ın Kadir Gecesi indirildiği bildirilir.', 1);

dn.lesson('yorumlar', 8, 'İslam düşüncesinde itikadi, fıkhi ve tasavvufi yorumlar; yorum farklılıklarının nedenleri.', [
  TABLE(['Yorum', 'Örnekler'], ['İtikadi (inanç)', 'Maturidilik, Eş\'arilik (Ehl-i Sünnet); Mutezile'], ['Fıkhi (amelî)', 'Hanefilik (Ebu Hanife), Şafiilik, Malikilik, Hanbelilik, Caferilik'], ['Tasavvufi', 'Yesevilik, Mevlevilik, Nakşibendilik gibi tarikatlar']),
  UL('Yorum farklılıklarının nedenleri: siyasi olaylar, farklı coğrafya ve kültürler, Kur\'an\'ın dil ve anlam zenginliği, hadislere ulaşma imkânı.', 'Türkiye\'de inançta Maturidilik, fıkıhta Hanefilik yaygındır.'),
  TIP('Eş\'arilik ve Maturidilik itikadi (inançla ilgili) mezheplerdir; Hanefilik, Şafiilik gibi mezhepler fıkhi (ibadet ve hukukla ilgili) mezheplerdir.', 'warn'),
], [card('Hanefi mezhebinin kurucusu', 'Ebu Hanife'), card('Türkiye\'de yaygın', 'İtikatta Maturidi, fıkıhta Hanefi')]);
dn.q('yorumlar', 'Hanefi mezhebinin kurucusu aşağıdakilerden hangisidir?', ['İmam Şafii', 'Ebu Hanife', 'İmam Malik', 'Ahmed bin Hanbel', 'İmam Maturidi'], 'B', 'Hanefi mezhebi adını kurucusu Ebu Hanife\'den alır.', 1);
dn.q('yorumlar', 'Türkiye\'de inanç (itikat) konusunda en yaygın mezhep aşağıdakilerden hangisidir?', ['Eş\'arilik', 'Maturidilik', 'Mutezile', 'Şafiilik', 'Hanbelilik'], 'B', 'Türkiye\'de itikatta Maturidilik, fıkıhta Hanefilik yaygındır.', 1);
dn.q('yorumlar', 'Aşağıdakilerden hangisi fıkhi (amelî) bir mezhep değildir?', ['Hanefilik', 'Şafiilik', 'Malikilik', 'Eş\'arilik', 'Hanbelilik'], 'D', 'Eş\'arilik itikadi (inançla ilgili) bir mezheptir.', 2);

export default [tr.done(), cg.done(), fl.done(), dn.done()];
