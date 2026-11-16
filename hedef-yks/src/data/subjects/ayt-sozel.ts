/** AYT Sözel: Edebiyat, Tarih, Coğrafya, Felsefe Grubu, Din Kültürü. */
import { EX, FLOW, H, P, TABLE, TIMELINE, TIP, UL, builder, card } from '../build.ts';

// ═════════════════════════════ EDEBİYAT ═════════════════════════════
const ed = builder('ayt-edebiyat');

ed.lesson(
  'siir-bilgisi',
  11,
  'Nazım birimi, hece ve aruz ölçüsü, uyak türleri, redif ve uyak düzenleri.',
  [
    H('Nazım birimi'),
    UL('Beyit: İki dizelik birim (divan şiiri).', 'Dörtlük: Dört dizelik birim (halk şiiri).', 'Bent: Üç ya da daha fazla dizeden oluşan birim.'),
    H('Ölçü'),
    TABLE(['Ölçü', 'Esası', 'Kullanıldığı yer'], ['Hece ölçüsü', 'Dizelerdeki hece sayısının eşitliği', 'Halk şiiri, Millî Edebiyat'], ['Aruz ölçüsü', 'Hecelerin açıklık-kapalılığı (uzunluk-kısalık)', 'Divan şiiri, Tanzimat, Servet-i Fünun'], ['Serbest ölçü', 'Belirli bir kalıp yok', 'Cumhuriyet dönemi, Garip, İkinci Yeni']),
    EX('"Gelin tanış olalım / İşi kolay kılalım" (Yunus Emre) dizeleri hangi kalıptadır?', ['Ge-lin-ta-nış-o-la-lım → 7 hece', 'İ-şi-ko-lay-kı-la-lım → 7 hece'], 'Hece ölçüsünün 7\'li kalıbı'),
    H('Uyak (kafiye) türleri'),
    TABLE(['Tür', 'Ortak ses', 'Örnek'], ['Yarım uyak', 'Tek ses', '"taş – kış" (ş)'], ['Tam uyak', 'İki ses', '"dal – bal" (al)'], ['Zengin uyak', 'Üç ve daha fazla ses', '"kara – yara" (ara)'], ['Cinaslı uyak', 'Yazılışı aynı, anlamı farklı sözcükler', '"yüz (sayı) – yüz (çehre)"']),
    P('Redif: Dize sonlarında tekrarlanan, aynı görevdeki ek ya da sözcüklerdir. Uyak redifin hemen önünde aranır.'),
    TIP('Önce redifi ayırın (aynı görevli ekler), sonra kalan sözcük sonlarındaki ortak sesleri sayarak uyak türünü belirleyin.'),
    H('Uyak düzenleri'),
    TABLE(['Düzen', 'Şema'], ['Düz uyak', 'aaab cccb'], ['Çapraz uyak', 'abab'], ['Sarma uyak', 'abba'], ['Mani tipi', 'aaxa']),
  ],
  [card('Zengin uyak', 'Üç ve daha fazla ortak ses'), card('Çapraz uyak', 'abab'), card('Redif', 'Aynı görevli ek veya sözcük tekrarı')],
);

ed.q('siir-bilgisi', '"Gelin tanış olalım / İşi kolay kılalım" dizeleri hece ölçüsünün kaçlı kalıbıyla yazılmıştır?', ['6', '7', '8', '11', '14'], 'B', 'Her dize 7 hecedir: Ge-lin-ta-nış-o-la-lım.', 1);
ed.q('siir-bilgisi', '"kara" ve "yara" sözcükleri arasındaki uyak türü aşağıdakilerden hangisidir?', ['Yarım uyak', 'Tam uyak', 'Zengin uyak', 'Cinaslı uyak', 'Redif'], 'C', 'Ortak ses grubu "-ara" üç sestir; üç ve daha fazla ses benzerliği zengin uyaktır.', 2);
ed.q('siir-bilgisi', 'Dizelerin "abab" biçiminde uyaklandığı düzene ne ad verilir?', ['Düz uyak', 'Çapraz uyak', 'Sarma uyak', 'Örüşük uyak', 'Mani tipi uyak'], 'B', 'Birinci dize üçüncüyle, ikinci dize dördüncüyle uyaklanırsa çapraz uyak oluşur.', 1);
ed.q('siir-bilgisi', 'Dize sonlarında tekrarlanan, yazılışı ve görevi aynı olan ek ya da sözcüklere ne ad verilir?', ['Uyak', 'Redif', 'Ölçü', 'Nakarat', 'Durak'], 'B', 'Redif, aynı görevdeki ek veya sözcüklerin tekrarıdır; uyak redifin önündeki ses benzerliğidir.', 1);

ed.lesson(
  'soz-sanatlari',
  12,
  'Teşbihten telmihe, sınavda en sık karşılaşılan söz sanatları ve ayırt edici özellikleri.',
  [
    H('Benzetmeye dayalı sanatlar'),
    TABLE(['Sanat', 'Tanım', 'Örnek'], ['Teşbih (benzetme)', 'Bir varlığı nitelikçe güçlü bir başkasına benzetmek', '"Aslan gibi çocuk"'], ['İstiare (eğretileme)', 'Benzetmenin yalnızca bir temel öğesiyle yapılması', '"Aslanım geldi." (açık istiare)'], ['Teşhis (kişileştirme)', 'İnsana ait özellikleri başka varlığa vermek', '"Rüzgâr ağladı."'], ['İntak (konuşturma)', 'İnsan dışı varlığı konuşturmak', 'Fabllarda konuşan hayvanlar']),
    H('Anlama dayalı sanatlar'),
    TABLE(['Sanat', 'Tanım'], ['Tecahül-i arif', 'Bildiği hâlde bilmezlikten gelmek'], ['Hüsn-i talil', 'Bir olayı gerçek nedeni dışında güzel bir nedene bağlamak'], ['Mübalağa', 'Abartma'], ['Tezat', 'Karşıt kavramları bir arada kullanmak'], ['Tenasüp', 'Birbiriyle ilgili kavramları bir arada kullanmak'], ['Telmih', 'Bilinen bir olaya, kişiye ya da hikâyeye gönderme yapmak'], ['Kinaye', 'Sözü hem gerçek hem mecaz anlamı düşündürecek biçimde söyleyip mecazı kastetmek'], ['Tevriye', 'Birden çok anlamı olan sözcüğün uzak anlamını kastetmek'], ['İrsal-i mesel', 'Bir düşünceyi kanıtlamak için atasözü ya da özdeyiş kullanmak']),
    TIP('Teşhis ile intakı karıştırmayın: konuşturma varsa intak, yalnızca insana özgü özellik verilmişse teşhistir. Her intak aynı zamanda teşhistir.', 'warn'),
    EX('"Güneş seni görünce utancından bulutlara saklandı." dizesinde hangi sanatlar vardır?', ['Güneşe "utanmak" gibi insani bir özellik verilmiş → teşhis.', 'Güneşin bulutlar arkasında kalması güzel bir nedene bağlanmış → hüsn-i talil.'], 'Teşhis ve hüsn-i talil'),
  ],
  [card('Tecahül-i arif', 'Bilmezlikten gelme'), card('Hüsn-i talil', 'Güzel neden bulma'), card('Telmih', 'Bilinen bir olaya gönderme')],
);

ed.q('soz-sanatlari', '"Aslan gibi çocuk" ifadesinde hangi söz sanatı vardır?', ['İstiare', 'Teşbih', 'Kinaye', 'Tezat', 'Telmih'], 'B', 'Çocuk (benzeyen), aslana (benzetilen) "gibi" edatıyla benzetilmiştir: teşbih.', 1);
ed.q('soz-sanatlari', 'Şairin bildiği bir şeyi bilmiyormuş gibi davranarak söylemesine ne ad verilir?', ['Hüsn-i talil', 'Mübalağa', 'Tecahül-i arif', 'Tevriye', 'Tenasüp'], 'C', 'Tecahül-i arif "bilmezlikten gelme" sanatıdır ve çoğunlukla soru biçiminde kurulur.', 1);
ed.q('soz-sanatlari', 'Bir olayın gerçek nedeni bir yana bırakılarak ona güzel ve hayalî bir neden bulunmasına ne ad verilir?', ['Hüsn-i talil', 'Teşhis', 'Kinaye', 'İstiare', 'İrsal-i mesel'], 'A', 'Hüsn-i talil "güzel neden gösterme" demektir.', 1);
ed.q('soz-sanatlari', 'Aralarında anlam ilgisi bulunan kavramların bir arada kullanılmasına ne ad verilir?', ['Tezat', 'Tenasüp', 'Telmih', 'Tecahül-i arif', 'Cinas'], 'B', 'Örneğin "gül, bülbül, bahar" gibi ilgili kavramların birlikte kullanılması tenasüptür.', 1);
ed.q('soz-sanatlari', 'Geçmişte yaşanmış bir olaya, kişiye ya da bilinen bir hikâyeye gönderme yapılmasına ne ad verilir?', ['Telmih', 'Tevriye', 'İntak', 'Mübalağa', 'İstifham'], 'A', '"Ferhat\'ın dağı delmesi"ne gönderme gibi kullanımlar telmihtir.', 1);

ed.lesson(
  'tanzimat',
  11,
  'Tanzimat edebiyatının iki kuşağı, temsilcileri ve edebiyatımızdaki "ilk"ler.',
  [
    P('Tanzimat Fermanı 1839\'da ilan edilmiş olsa da Tanzimat edebiyatı 1860\'ta Şinasi ve Agâh Efendi\'nin çıkardığı Tercüman-ı Ahvâl gazetesiyle başlar.'),
    TABLE(['', 'I. Kuşak', 'II. Kuşak'], ['Sanat anlayışı', 'Toplum için sanat', 'Sanat için sanat'], ['Temalar', 'Vatan, millet, hürriyet, adalet', 'Aşk, ölüm, doğa, karamsarlık'], ['Temsilciler', 'Şinasi, Namık Kemal, Ziya Paşa, Ahmet Mithat', 'Recaizade Mahmut Ekrem, Abdülhak Hâmit, Sami Paşazade Sezai']),
    H('Tanzimat\'ın "ilk"leri'),
    TABLE(['İlk', 'Eser', 'Yazar'], ['İlk özel gazete', 'Tercüman-ı Ahvâl (1860)', 'Şinasi – Agâh Efendi'], ['İlk yerli tiyatro', 'Şair Evlenmesi (1860)', 'Şinasi'], ['İlk çeviri roman', 'Telemak (1862)', 'Yusuf Kâmil Paşa'], ['İlk yerli roman', 'Taaşşuk-ı Talat ve Fitnat (1872)', 'Şemsettin Sami'], ['İlk sahnelenen oyun', 'Vatan yahut Silistre (1873)', 'Namık Kemal'], ['İlk edebî roman', 'İntibah (1876)', 'Namık Kemal'], ['İlk realist roman', 'Araba Sevdası', 'Recaizade Mahmut Ekrem'], ['İlk köy romanı (uzun hikâye)', 'Karabibik', 'Nabizade Nâzım']),
    TIP('Resmî ilk gazete Takvim-i Vekayi (1831), yarı resmî ilk gazete Ceride-i Havadis (1840), ilk özel gazete Tercüman-ı Ahvâl\'dir (1860). Sınavda bu üçü sıkça karıştırılır.', 'warn'),
  ],
  [card('Tanzimat edebiyatının başlangıcı', 'Tercüman-ı Ahvâl (1860)'), card('İlk realist roman', 'Araba Sevdası — Recaizade'), card('İntibah', 'Namık Kemal — ilk edebî roman')],
);

ed.q('tanzimat', 'Tanzimat edebiyatının başlangıcı kabul edilen gazete aşağıdakilerden hangisidir?', ['Takvim-i Vekayi', 'Ceride-i Havadis', 'Tercüman-ı Ahvâl', 'Tasvir-i Efkâr', 'Hürriyet'], 'C', '1860\'ta Şinasi ve Agâh Efendi\'nin çıkardığı Tercüman-ı Ahvâl, ilk özel Türkçe gazetedir ve dönemin başlangıcı kabul edilir.', 1);
ed.q('tanzimat', 'Türk edebiyatının ilk yerli tiyatro eseri olan "Şair Evlenmesi" kime aittir?', ['Namık Kemal', 'Şinasi', 'Ziya Paşa', 'Ahmet Mithat Efendi', 'Abdülhak Hâmit'], 'B', 'Şinasi\'nin 1860\'ta yazdığı tek perdelik komedi, ilk yerli tiyatro eseridir.', 1);
ed.q('tanzimat', 'Türk edebiyatında ilk realist roman kabul edilen "Araba Sevdası"nın yazarı kimdir?', ['Namık Kemal', 'Recaizade Mahmut Ekrem', 'Sami Paşazade Sezai', 'Nabizade Nâzım', 'Şemsettin Sami'], 'B', 'Araba Sevdası, yanlış Batılılaşmayı Bihruz Bey karakteriyle eleştiren realist bir romandır.', 1);
ed.q('tanzimat', 'Tanzimat edebiyatının II. kuşağının genel sanat anlayışı aşağıdakilerden hangisidir?', ['Toplum için sanat', 'Sanat için sanat', 'Halk için sanat', 'Millî edebiyat', 'Mistik sanat'], 'B', 'II. kuşak siyasi baskı ortamında bireysel temalara yönelmiş, "sanat için sanat" anlayışını benimsemiştir.', 2);

// ═════════════════════════════ TARİH ═════════════════════════════
const tr = builder('ayt-tarih');

tr.lesson(
  'birinci-dunya',
  12,
  'I. Dünya Savaşı\'nın nedenleri, blokları, Osmanlı cepheleri ve savaş sonrası antlaşmalar.',
  [
    H('Nedenler'),
    UL('Sömürgecilik rekabeti ve hammadde-pazar arayışı', 'Milliyetçilik akımının çok uluslu devletleri sarsması', 'Silahlanma yarışı ve bloklaşma', 'Kıvılcım: 28 Haziran 1914 Saraybosna suikastı (Avusturya veliahtı Franz Ferdinand)'),
    TABLE(['İtilaf Devletleri', 'İttifak Devletleri'], ['İngiltere, Fransa, Rusya (sonradan İtalya ve ABD katıldı)', 'Almanya, Avusturya-Macaristan; sonradan Osmanlı ve Bulgaristan']),
    TIP('İtalya başlangıçta İttifak bloğundaydı; 1915\'te İtilaf Devletleri safında savaşa girdi.', 'warn'),
    H('Osmanlı cepheleri'),
    TABLE(['Cephe', 'Öne çıkan bilgi'], ['Kafkas', 'Sarıkamış Harekâtı (1914–1915) ağır kayıpla sonuçlandı.'], ['Kanal', 'Süveyş\'i ele geçirme amaçlı; başarısız.'], ['Çanakkale', '18 Mart 1915 deniz zaferi; Anafartalar\'da Mustafa Kemal öne çıktı.'], ['Irak', 'Kutülamare (1916) zaferi; sonra Bağdat kaybedildi.'], ['Hicaz-Yemen, Suriye-Filistin', 'Arap isyanları ve İngiliz ilerleyişi']),
    TIMELINE(['1917', 'Rusya savaştan çekildi', 'Bolşevik İhtilali sonrası.'], ['1917', 'ABD savaşa girdi'], ['Ocak 1918', 'Wilson İlkeleri'], ['30 Ekim 1918', 'Mondros Ateşkesi'], ['1919 – 1920', 'Paris Barış Konferansı antlaşmaları']),
    TABLE(['Devlet', 'Antlaşma'], ['Almanya', 'Versay'], ['Avusturya', 'Saint-Germain'], ['Macaristan', 'Trianon'], ['Bulgaristan', 'Nöyyi'], ['Osmanlı', 'Sevr (uygulanmadı)']),
  ],
  [card('Savaşın kıvılcımı', 'Saraybosna suikastı (1914)'), card('Almanya ile barış', 'Versay'), card('18 Mart 1915', 'Çanakkale deniz zaferi')],
);

tr.q('birinci-dunya', 'I. Dünya Savaşı\'nı başlatan olay aşağıdakilerden hangisidir?', ['Bolşevik İhtilali', 'Saraybosna suikastı', 'Balkan Savaşları', 'Wilson İlkeleri\'nin yayımlanması', 'Almanya\'nın Polonya\'yı işgali'], 'B', '28 Haziran 1914\'te Avusturya-Macaristan veliahtının öldürülmesi savaşın kıvılcımı oldu. Polonya\'nın işgali II. Dünya Savaşı\'nı başlatmıştır.', 1);
tr.q('birinci-dunya', '18 Mart 1915\'te Osmanlı Devleti\'nin büyük bir deniz zaferi kazandığı cephe aşağıdakilerden hangisidir?', ['Kafkas', 'Kanal', 'Çanakkale', 'Irak', 'Galiçya'], 'C', 'İtilaf donanması 18 Mart 1915\'te Çanakkale Boğazı\'nı geçemedi; ardından kara savaşları başladı.', 1);
tr.q('birinci-dunya', 'Rusya\'nın I. Dünya Savaşı\'ndan çekilmesine neden olan gelişme aşağıdakilerden hangisidir?', ['Çanakkale yenilgisi', '1917 Bolşevik İhtilali', 'ABD\'nin savaşa girmesi', 'Mondros Ateşkesi', 'Wilson İlkeleri'], 'B', 'Ekim 1917\'deki Bolşevik İhtilali sonrası Rusya, Brest-Litovsk Antlaşması ile savaştan çekildi.', 2);
tr.q('birinci-dunya', 'I. Dünya Savaşı sonunda Almanya ile imzalanan barış antlaşması aşağıdakilerden hangisidir?', ['Sevr', 'Nöyyi', 'Trianon', 'Saint-Germain', 'Versay'], 'E', 'Almanya ile 1919\'da Versay Antlaşması imzalandı.', 1);
tr.q('birinci-dunya', 'Osmanlı ordusunun Irak Cephesi\'nde İngilizlere karşı kazandığı zafer aşağıdakilerden hangisidir?', ['Sarıkamış', 'Kutülamare', 'Anafartalar', 'Conkbayırı', 'Kanal Harekâtı'], 'B', '1916\'daki Kutülamare zaferinde İngiliz kuvvetleri teslim alınmıştır.', 1);

tr.lesson(
  'soguk-savas',
  11,
  'İki kutuplu dünya, bloklar, krizler, yumuşama dönemi ve Türkiye\'nin dış politikası.',
  [
    P('II. Dünya Savaşı\'ndan sonra ABD liderliğindeki Batı Bloku ile SSCB liderliğindeki Doğu Bloku arasında doğrudan savaşa dönüşmeyen ideolojik, siyasi, ekonomik ve askerî rekabete Soğuk Savaş denir.'),
    TIMELINE(
      ['1947', 'Truman Doktrini', 'ABD\'nin Türkiye ve Yunanistan\'a askerî-ekonomik yardımı.'],
      ['1947 – 1948', 'Marshall Planı', 'Avrupa\'nın ekonomik kalkınması için ABD yardımı.'],
      ['1949', 'NATO kuruldu'],
      ['1950 – 1953', 'Kore Savaşı', 'Türkiye BM kararıyla asker gönderdi.'],
      ['1952', 'Türkiye NATO\'ya katıldı'],
      ['1955', 'Varşova Paktı kuruldu', 'Doğu Bloku\'nun askerî örgütü.'],
      ['1961', 'Berlin Duvarı inşa edildi'],
      ['1962', 'Küba Füze Krizi', 'Nükleer savaşın eşiğine gelindi; ardından Türkiye\'deki Jüpiter füzeleri söküldü.'],
      ['20 Temmuz 1974', 'Kıbrıs Barış Harekâtı'],
      ['1975', 'Helsinki Nihai Senedi', 'Yumuşama (detant) döneminin simgesi.'],
      ['1989', 'Berlin Duvarı yıkıldı'],
      ['1991', 'SSCB dağıldı; Soğuk Savaş sona erdi'],
    ),
    TIP('Türkiye\'nin NATO\'ya girişinde Kore Savaşı\'na asker göndermesi etkili olmuştur.', 'info'),
  ],
  [card('Türkiye NATO üyeliği', '1952'), card('Truman Doktrini', '1947 — Türkiye ve Yunanistan\'a yardım'), card('Küba Füze Krizi', '1962')],
);

tr.q('soguk-savas', 'Türkiye NATO\'ya hangi yıl üye olmuştur?', ['1947', '1949', '1950', '1952', '1955'], 'D', 'Türkiye, Kore Savaşı\'ndaki katkısının da etkisiyle 1952\'de NATO\'ya katıldı.', 1);
tr.q('soguk-savas', 'ABD\'nin 1947\'de Türkiye ve Yunanistan\'a askerî ve ekonomik yardım yapılmasını öngören politikası aşağıdakilerden hangisidir?', ['Marshall Planı', 'Truman Doktrini', 'Eisenhower Doktrini', 'Monroe Doktrini', 'Wilson İlkeleri'], 'B', 'Truman Doktrini, Sovyet yayılmacılığına karşı Türkiye ve Yunanistan\'ı desteklemeyi amaçladı. Marshall Planı ise Avrupa\'nın genel ekonomik kalkınmasına yönelikti.', 1);
tr.q('soguk-savas', 'Soğuk Savaş döneminde ABD ve SSCB\'nin nükleer savaşın eşiğine geldiği 1962 tarihli olay aşağıdakilerden hangisidir?', ['Kore Savaşı', 'Berlin Ablukası', 'Küba Füze Krizi', 'Vietnam Savaşı', 'Süveyş Krizi'], 'C', 'SSCB\'nin Küba\'ya füze yerleştirmesiyle başlayan kriz, karşılıklı uzlaşıyla çözüldü.', 1);
tr.q('soguk-savas', 'Doğu Bloku ülkelerinin NATO\'ya karşı 1955\'te kurduğu askerî örgüt aşağıdakilerden hangisidir?', ['COMECON', 'Varşova Paktı', 'Bağdat Paktı', 'SEATO', 'Balkan Paktı'], 'B', 'Varşova Paktı SSCB öncülüğünde kuruldu ve 1991\'de dağıldı. COMECON ekonomik bir örgüttü.', 1);

// ═════════════════════════════ COĞRAFYA ═════════════════════════════
const cg = builder('ayt-cog');

cg.lesson(
  'enerji-sanayi',
  11,
  'Türkiye\'nin başlıca maden yatakları, enerji kaynakları ve sanayi ile ilişkisi.',
  [
    H('Başlıca madenler'),
    TABLE(['Maden', 'Başlıca çıkarıldığı yerler', 'Not'], ['Bor', 'Eskişehir, Kütahya, Balıkesir, Bursa', 'Dünya rezervlerinin en büyük bölümü Türkiye\'de'], ['Taş kömürü', 'Zonguldak (Bartın)', 'Demir-çelik sanayisinin enerji kaynağı'], ['Linyit', 'Kahramanmaraş (Afşin-Elbistan), Manisa (Soma), Kütahya (Tunçbilek)', 'Termik santrallerde'], ['Demir', 'Sivas (Divriği), Malatya (Hekimhan)', 'Karabük, Ereğli, İskenderun demir-çelik'], ['Bakır', 'Artvin (Murgul), Kastamonu (Küre), Elazığ (Maden)', ''], ['Krom', 'Elazığ (Guleman), Muğla, Bursa', ''], ['Boksit', 'Konya (Seydişehir)', 'Alüminyum üretimi']),
    H('Enerji kaynakları'),
    UL('Petrol: Batman, Adıyaman, Diyarbakır; son yıllarda Şırnak-Gabar sahası.', 'Doğal gaz: Karadeniz\'de Sakarya Gaz Sahası (2020\'de keşfedildi, 2023\'te üretime başlandı).', 'Hidroelektrik: Fırat (Keban, Karakaya, Atatürk) ve Dicle (Ilısu) üzerindeki barajlar.', 'Jeotermal: Ege Bölgesi (Denizli, Aydın, Manisa) fay hatları boyunca.', 'Rüzgâr: Ege ve Marmara kıyıları. Güneş: İç ve Güney Anadolu (ör. Konya Karapınar).', 'Nükleer: Akkuyu Nükleer Güç Santrali (Mersin) devreye alma sürecinde.'),
    TIP('Jeotermal kaynaklar fay hatlarıyla, taş kömürü ise karbonifer dönemi tortullarıyla (Zonguldak) ilişkilidir.'),
    FLOW('Sanayi kuruluş etmenleri', 'Hammadde', 'Enerji', 'Ulaşım', 'Pazar', 'İş gücü ve sermaye'),
  ],
  [card('Seydişehir', 'Boksit → alüminyum'), card('Divriği', 'Demir'), card('Jeotermal', 'Ege — fay hatları')],
);

cg.q('enerji-sanayi', 'Türkiye\'de taş kömürü yatakları en çok hangi ilde bulunur?', ['Kütahya', 'Manisa', 'Zonguldak', 'Kahramanmaraş', 'Sivas'], 'C', 'Türkiye\'nin taş kömürü üretiminin neredeyse tamamı Zonguldak havzasından sağlanır.', 1);
cg.q('enerji-sanayi', 'Konya\'nın Seydişehir ilçesinde alüminyum tesisinin kurulmasında etkili olan maden aşağıdakilerden hangisidir?', ['Krom', 'Boksit', 'Bakır', 'Bor', 'Demir'], 'B', 'Alüminyumun hammaddesi boksittir ve Seydişehir çevresinde yatakları bulunur.', 1);
cg.q('enerji-sanayi', 'Türkiye\'nin dünya rezervleri içinde en büyük paya sahip olduğu maden aşağıdakilerden hangisidir?', ['Krom', 'Bakır', 'Bor', 'Demir', 'Linyit'], 'C', 'Dünya bor rezervlerinin en büyük bölümü Türkiye\'dedir.', 1);
cg.q('enerji-sanayi', 'Türkiye\'de jeotermal enerji santralleri en çok hangi bölgede yoğunlaşmıştır?', ['Karadeniz', 'İç Anadolu', 'Ege', 'Doğu Anadolu', 'Güneydoğu Anadolu'], 'C', 'Ege\'deki çöküntü alanlarını sınırlayan fay hatları boyunca sıcak su kaynakları yoğundur (Denizli, Aydın, Manisa).', 1);
cg.q('enerji-sanayi', 'Sivas\'ın Divriği ilçesi aşağıdaki madenlerden hangisinin çıkarılmasıyla tanınır?', ['Bakır', 'Demir', 'Krom', 'Bor', 'Boksit'], 'B', 'Divriği, Türkiye\'nin önemli demir yataklarındandır.', 1);

cg.lesson(
  'nufus-politikalari',
  10,
  'Demografik dönüşüm evreleri, nüfus piramitleri ve ülkelerin nüfus politikaları.',
  [
    H('Demografik dönüşüm'),
    TABLE(['Evre', 'Doğum', 'Ölüm', 'Nüfus artışı'], ['1', 'Yüksek', 'Yüksek', 'Yavaş'], ['2', 'Yüksek', 'Hızla azalır', 'Çok hızlı'], ['3', 'Azalır', 'Düşük', 'Yavaşlar'], ['4', 'Düşük', 'Düşük', 'Çok yavaş / durağan']),
    H('Nüfus piramitleri'),
    UL('Tabanı geniş, tepesi dar: Doğum oranı yüksek, genç nüfus fazla, ortalama yaşam süresi kısa (az gelişmiş ülkeler).', 'Tabanı dar, gövdesi geniş: Doğum oranı düşük, yaşlı nüfus fazla (gelişmiş ülkeler).'),
    H('Nüfus politikaları'),
    TABLE(['Politika', 'Amaç', 'Örnek'], ['Artırıcı', 'Doğumları teşvik etmek', 'Japonya, Almanya, Fransa'], ['Azaltıcı', 'Hızlı nüfus artışını yavaşlatmak', 'Çin (geçmişte tek çocuk politikası), Hindistan'], ['Nitelik artırıcı', 'Eğitim ve sağlık düzeyini yükseltmek', 'Birçok ülke']),
    H('Türkiye'),
    P('1923–1965 arasında savaş kayıpları nedeniyle artırıcı, 1965 sonrasında azaltıcı politika izlendi. TÜİK verilerine göre 2024\'te toplam doğurganlık hızı 1,48\'e geriledi; bu değer nüfusun kendini yenileme düzeyi olan 2,1\'in altındadır. Bu nedenle günümüzde aileyi ve doğurganlığı destekleyen politikalar öne çıkmıştır (2025 "Aile Yılı" ilan edilmiştir).'),
    TIP('Toplam doğurganlık hızı 2,1\'in altına düşerse uzun vadede nüfus yaşlanır ve azalmaya başlar.', 'info'),
  ],
  [card('Yenilenme düzeyi', 'Toplam doğurganlık hızı 2,1'), card('Türkiye 2024 TDH', '1,48 (TÜİK)')],
);

cg.q('nufus-politikalari', 'Bir ülkede nüfusun kendini yenileyebilmesi için gereken toplam doğurganlık hızı yaklaşık kaçtır?', ['1,0', '1,5', '2,1', '3,0', '4,2'], 'C', 'Kadın başına ortalama 2,1 çocuk, ölümler de hesaba katıldığında nüfusun yerini koruyacağı düzeydir.', 1);
cg.q('nufus-politikalari', 'Japonya ve Almanya gibi yaşlı nüfusun fazla olduğu ülkelerde genellikle hangi nüfus politikası uygulanır?', ['Nüfus artışını azaltıcı', 'Nüfus artışını teşvik edici', 'Göçü yasaklayıcı', 'Kentleşmeyi durdurucu', 'Tek çocuk politikası'], 'B', 'Düşük doğum oranı ve yaşlanan nüfus nedeniyle doğumları teşvik eden politikalar uygulanır.', 1);
cg.q('nufus-politikalari', 'Demografik dönüşümün birinci evresinin özelliği aşağıdakilerden hangisidir?', ['Doğum ve ölüm oranları düşüktür.', 'Doğum oranı yüksek, ölüm oranı hızla düşer.', 'Doğum ve ölüm oranları yüksektir; nüfus yavaş artar.', 'Nüfus hızla azalır.', 'Doğum oranı düşer, ölüm oranı artar.'], 'C', 'İlk evrede sağlık koşulları yetersizdir; yüksek doğum, yüksek ölümle dengelenir.', 2);
cg.q('nufus-politikalari', 'Tabanı geniş, tepesi dar bir nüfus piramidine sahip ülke için aşağıdakilerden hangisi söylenebilir?', ['Yaşlı nüfus oranı yüksektir.', 'Doğum oranı düşüktür.', 'Genç nüfus oranı yüksektir.', 'Ortalama yaşam süresi uzundur.', 'Nüfus artış hızı düşüktür.'], 'C', 'Geniş taban yüksek doğum oranını ve genç nüfusu; dar tepe kısa yaşam süresini gösterir.', 1);

// ═════════════════════════════ FELSEFE GRUBU ═════════════════════════════
const fg = builder('ayt-felsefe');

fg.lesson(
  'mantik-klasik',
  11,
  'Önerme türleri, karşı olma karesi, kıyas ve akıl yürütme çeşitleri.',
  [
    H('Önerme türleri'),
    TABLE(['Simge', 'Tür', 'Örnek'], ['A', 'Tümel olumlu', 'Bütün insanlar ölümlüdür.'], ['E', 'Tümel olumsuz', 'Hiçbir insan ölümsüz değildir.'], ['I', 'Tikel olumlu', 'Bazı insanlar öğretmendir.'], ['O', 'Tikel olumsuz', 'Bazı insanlar öğretmen değildir.']),
    H('Karşı olma karesi'),
    TABLE(['İlişki', 'Önermeler', 'Kural'], ['Çelişik', 'A – O, E – I', 'Biri doğruysa diğeri kesin yanlış; ikisi birden doğru ya da yanlış olamaz.'], ['Karşıt', 'A – E', 'İkisi birlikte doğru olamaz; ikisi birlikte yanlış olabilir.'], ['Alt karşıt', 'I – O', 'İkisi birlikte yanlış olamaz; ikisi birlikte doğru olabilir.'], ['Alt içerme', 'A → I, E → O', 'Tümel doğruysa tikel de doğrudur.']),
    H('Kıyas'),
    P('İki öncülden (büyük ve küçük önerme) zorunlu bir sonuç çıkarılmasıdır. İki öncülde bulunup sonuçta bulunmayan terime orta terim denir.'),
    EX('Bütün metaller iletkendir. Bakır bir metaldir. O hâlde…', ['Orta terim: "metal"', 'Sonuç öncüllerden zorunlu olarak çıkar.'], 'Bakır iletkendir.'),
    H('Akıl yürütme çeşitleri'),
    UL('Tümdengelim: Genelden özele; sonuç zorunludur.', 'Tümevarım: Özelden genele; sonuç olasılıklıdır.', 'Analoji: Benzerlikten hareketle özelden özele.'),
  ],
  [card('A önermesinin çelişiği', 'O: Bazı S, P değildir.'), card('Karşıt (A–E)', 'Birlikte doğru olamaz, birlikte yanlış olabilir'), card('Orta terim', 'Öncüllerde var, sonuçta yok')],
);

fg.q('mantik-klasik', '"Bütün insanlar ölümlüdür." önermesinin çelişiği aşağıdakilerden hangisidir?', ['Hiçbir insan ölümlü değildir.', 'Bazı insanlar ölümlüdür.', 'Bazı insanlar ölümlü değildir.', 'Bütün ölümlüler insandır.', 'Hiçbir ölümlü insan değildir.'], 'C', 'Tümel olumlu (A) önermenin çelişiği tikel olumsuz (O) önermedir.', 1);
fg.q('mantik-klasik', 'Karşıt önermeler (A ve E) için aşağıdakilerden hangisi doğrudur?', ['İkisi birlikte doğru olabilir.', 'İkisi birlikte doğru olamaz ama birlikte yanlış olabilir.', 'Biri doğruysa diğeri de doğrudur.', 'İkisi birlikte yanlış olamaz.', 'Biri yanlışsa diğeri kesinlikle doğrudur.'], 'B', '"Bütün öğrenciler çalışkandır" ve "Hiçbir öğrenci çalışkan değildir" birlikte doğru olamaz; ama bazı öğrenciler çalışkansa ikisi birden yanlıştır.', 2);
fg.q('mantik-klasik', 'Tek tek olgulardan hareketle genel bir sonuca ulaşılan akıl yürütme türü aşağıdakilerden hangisidir?', ['Tümdengelim', 'Tümevarım', 'Analoji', 'Kıyas', 'Dolaysız çıkarım'], 'B', 'Tümevarım özelden genele gider; sonucu olasılık bildirir.', 1);
fg.q('mantik-klasik', 'Bir kıyasta iki öncülde bulunup sonuçta bulunmayan terime ne ad verilir?', ['Büyük terim', 'Küçük terim', 'Orta terim', 'Konu', 'Yüklem'], 'C', 'Orta terim, büyük ve küçük terimi birbirine bağlar; sonuçta yer almaz.', 1);

fg.lesson(
  'psikoloji',
  11,
  'Psikolojinin temel yaklaşımları, öğrenme kuramları, bellek ve güdülenme.',
  [
    H('Temel yaklaşımlar'),
    TABLE(['Yaklaşım', 'Odak', 'Temsilci'], ['Psikanalitik', 'Bilinçdışı, çocukluk yaşantıları', 'Sigmund Freud'], ['Davranışçı', 'Gözlenebilir davranış, koşullanma', 'Watson, Skinner'], ['Hümanist', 'Kendini gerçekleştirme, özgür irade', 'Maslow, Rogers'], ['Bilişsel', 'Düşünme, algı, bellek süreçleri', 'Piaget'], ['Gestalt', 'Bütün parçaların toplamından fazladır', 'Wertheimer, Köhler']),
    H('Öğrenme kuramları'),
    TABLE(['Kuram', 'Özü', 'Deney'], ['Klasik koşullanma', 'Nötr uyarıcının koşullu uyarıcıya dönüşmesi', 'Pavlov\'un köpekleri (zil – salya)'], ['Edimsel koşullanma', 'Davranışın sonucu (pekiştirme/ceza) ile öğrenme', 'Skinner kutusu'], ['Gözlem yoluyla öğrenme', 'Model alma', 'Bandura (Bobo bebek)'], ['Kavrayış yoluyla öğrenme', 'Ani çözüm bulma ("aha!")', 'Köhler\'in şempanzeleri']),
    H('Bellek'),
    FLOW('Bellek aşamaları', 'Duyusal bellek: Çok kısa süreli (saniyeler)', 'Kısa süreli bellek: Yaklaşık 7 ± 2 birim, 15–30 saniye', 'Uzun süreli bellek: Sınırsız kapasite, kalıcı'),
    H('Maslow\'un ihtiyaçlar hiyerarşisi'),
    FLOW(undefined, 'Fizyolojik ihtiyaçlar', 'Güvenlik', 'Ait olma ve sevgi', 'Saygınlık', 'Kendini gerçekleştirme'),
    TIP('Maslow\'a göre alt basamaktaki ihtiyaç karşılanmadan üst basamaktaki ihtiyaç güdüleyici olmaz.'),
  ],
  [card('Klasik koşullanma', 'Pavlov — zil ve salya'), card('Kısa süreli bellek kapasitesi', '7 ± 2 birim'), card('Maslow\'da ilk basamak', 'Fizyolojik ihtiyaçlar')],
);

fg.q('psikoloji', 'Zil sesinin ardından düzenli olarak yemek verilen bir köpeğin bir süre sonra yalnızca zil sesiyle salya salgılaması hangi öğrenme türüne örnektir?', ['Edimsel koşullanma', 'Klasik koşullanma', 'Gözlem yoluyla öğrenme', 'Kavrayış yoluyla öğrenme', 'Deneme-yanılma'], 'B', 'Pavlov\'un deneyinde nötr uyarıcı (zil), koşulsuz uyarıcıyla (yemek) eşleşerek koşullu uyarıcıya dönüşmüştür.', 1);
fg.q('psikoloji', 'Kısa süreli belleğin kapasitesi yaklaşık kaç birimdir?', ['3 ± 1', '5 ± 1', '7 ± 2', '12 ± 2', 'Sınırsız'], 'C', 'George Miller\'ın çalışmalarına göre kısa süreli bellek yaklaşık 7 ± 2 bilgi birimi tutabilir.', 1);
fg.q('psikoloji', 'Maslow\'un ihtiyaçlar hiyerarşisinde en temel (ilk basamaktaki) ihtiyaçlar aşağıdakilerden hangisidir?', ['Güvenlik', 'Saygınlık', 'Fizyolojik ihtiyaçlar', 'Ait olma', 'Kendini gerçekleştirme'], 'C', 'Yeme, içme, uyku gibi fizyolojik ihtiyaçlar piramidin tabanını oluşturur.', 1);
fg.q('psikoloji', 'Davranışları açıklarken bilinçdışı süreçleri ve çocukluk yaşantılarını ön plana çıkaran yaklaşım aşağıdakilerden hangisidir?', ['Davranışçı', 'Bilişsel', 'Hümanist', 'Psikanalitik', 'Gestalt'], 'D', 'Freud\'un kurduğu psikanalitik yaklaşım bilinçdışını temel alır.', 1);

fg.lesson(
  'sosyoloji',
  10,
  'Sosyolojinin kurucuları, statü ve rol, toplumsal hareketlilik ve kültür kavramları.',
  [
    H('Sosyolojinin öncüleri'),
    TABLE(['Düşünür', 'Katkısı'], ['İbn Haldun', 'Umran ilmi, asabiyet kavramı; toplumsal olayları nedenleriyle açıklama'], ['Auguste Comte', '"Sosyoloji" kavramını ilk kullandı; üç hâl yasası'], ['Émile Durkheim', 'Toplumsal olgu; mekanik ve organik dayanışma'], ['Max Weber', 'Anlayıcı sosyoloji; bürokrasi'], ['Karl Marx', 'Çatışmacı yaklaşım; sınıf mücadelesi']),
    H('Statü ve rol'),
    UL('Verilmiş (atfedilmiş) statü: Doğuştan elde edilir — cinsiyet, yaş, akrabalık.', 'Kazanılmış statü: Bireyin çabasıyla elde edilir — doktor, öğretmen, şampiyon.', 'Rol: Statünün gerektirdiği davranışlar bütünü.'),
    H('Toplumsal hareketlilik'),
    UL('Dikey hareketlilik: Statünün yükselmesi ya da düşmesi (öğretmenin müdür olması).', 'Yatay hareketlilik: Aynı düzeydeki statüler arası geçiş (bir okuldan başka bir okula öğretmen olarak atanma).'),
    H('Kültür'),
    P('Maddi kültür (araç, gereç, teknoloji) genellikle manevi kültürden (değer, inanç, norm) daha hızlı değişir. Manevi kültürün bu değişime geç uyum sağlamasına kültürel gecikme denir (W. F. Ogburn).'),
  ],
  [card('"Sosyoloji" kavramı', 'Auguste Comte'), card('Kültürel gecikme', 'Manevi kültürün maddi kültüre geç uyumu (Ogburn)')],
);

fg.q('sosyoloji', '"Sosyoloji" kavramını ilk kez kullanan düşünür aşağıdakilerden hangisidir?', ['İbn Haldun', 'Émile Durkheim', 'Auguste Comte', 'Max Weber', 'Karl Marx'], 'C', 'Auguste Comte bu kavramı 19. yüzyılda ilk kez kullandı ve pozitivist yaklaşımı geliştirdi.', 1);
fg.q('sosyoloji', 'Aşağıdakilerden hangisi verilmiş (atfedilmiş) statüye örnektir?', ['Doktor olmak', 'Belediye başkanı seçilmek', 'Kız kardeş olmak', 'Olimpiyat şampiyonu olmak', 'Avukat olmak'], 'C', 'Kardeşlik akrabalığa bağlı, doğuştan gelen bir statüdür. Diğerleri bireyin çabasıyla kazanılır.', 1);
fg.q('sosyoloji', 'Teknolojideki hızlı değişime toplumun değer ve normlarının geç uyum sağlaması hangi kavramla açıklanır?', ['Kültürel yayılma', 'Kültürel gecikme', 'Kültürleşme', 'Asimilasyon', 'Sosyalleşme'], 'B', 'Ogburn\'un kültürel gecikme kavramı, maddi kültür ile manevi kültürün değişim hızları arasındaki farkı anlatır.', 2);
fg.q('sosyoloji', 'Bir öğretmenin okul müdürlüğüne atanması hangi toplumsal hareketlilik türüne örnektir?', ['Yatay hareketlilik', 'Dikey hareketlilik', 'Coğrafi hareketlilik', 'Kuşaklar arası hareketlilik', 'Kültürel hareketlilik'], 'B', 'Statüde yükselme söz konusu olduğu için dikey hareketliliktir.', 1);

// ═════════════════════════════ DİN KÜLTÜRÜ ═════════════════════════════
const dn = builder('ayt-din');

dn.lesson(
  'diger-dinler',
  10,
  'Yahudilik, Hristiyanlık, Hint ve Çin dinlerinin temel kavramları ve kutsal metinleri.',
  [
    TABLE(
      ['Din', 'Kutsal metin', 'İbadethane / temel kavram'],
      ['Yahudilik', 'Tanah (Tevrat dahil), Talmud', 'Sinagog (havra); Şabat (cumartesi)'],
      ['Hristiyanlık', 'Kitab-ı Mukaddes (Eski ve Yeni Ahit, İnciller)', 'Kilise; teslis, vaftiz'],
      ['Hinduizm', 'Vedalar', 'Kast sistemi, karma, samsara (reenkarnasyon), mokşa'],
      ['Budizm', 'Tripitaka', 'Dört Yüce Gerçek, Sekiz Dilimli Yol, nirvana'],
      ['Konfüçyüsçülük', 'Konfüçyüs\'ün öğretileri (Analektler)', 'Aile, ahlak, atalara saygı'],
      ['Taoizm', 'Tao Te Ching', 'Tao (yol), yin-yang uyumu'],
      ['Şintoizm', '—', 'Japonya\'da kami (kutsal güçler) inancı'],
    ),
    H('Hristiyanlıkta mezhepler'),
    UL('Katoliklik: Merkezi Vatikan, papalık kurumu.', 'Ortodoksluk: Doğu kiliseleri; Fener Rum Patrikhanesi.', 'Protestanlık: 16. yüzyılda Martin Luther\'in reform hareketiyle doğdu.'),
    TIP('"Teslis" (baba-oğul-kutsal ruh) Hristiyanlığa, "kast" ve "karma" Hinduizme, "nirvana" Budizme özgü anahtar kavramlardır.'),
  ],
  [card('Sinagog', 'Yahudilerin ibadethanesi'), card('Teslis', 'Hristiyanlık'), card('Dört Yüce Gerçek', 'Budizm')],
);

dn.q('diger-dinler', 'Yahudilerin ibadet ettikleri yere ne ad verilir?', ['Kilise', 'Sinagog', 'Pagoda', 'Tapınak (Mandir)', 'Katedral'], 'B', 'Yahudilikte ibadethane sinagog ya da havra olarak adlandırılır.', 1);
dn.q('diger-dinler', '"Teslis" (üçleme) inancı aşağıdaki dinlerden hangisine aittir?', ['Yahudilik', 'Hristiyanlık', 'Budizm', 'Hinduizm', 'Taoizm'], 'B', 'Teslis, baba-oğul-kutsal ruh üçlemesini ifade eden Hristiyan inancıdır.', 1);
dn.q('diger-dinler', '"Dört Yüce Gerçek" ve "Sekiz Dilimli Yol" öğretileri hangi dine aittir?', ['Hinduizm', 'Konfüçyüsçülük', 'Budizm', 'Şintoizm', 'Sihizm'], 'C', 'Bu öğretiler Buda\'nın (Siddhartha Gautama) acıdan kurtuluş yolunu anlatır.', 1);
dn.q('diger-dinler', 'Kast sistemi ve reenkarnasyon (samsara) inancı aşağıdaki dinlerden hangisinin temel özelliklerindendir?', ['Hinduizm', 'Yahudilik', 'Taoizm', 'Hristiyanlık', 'Konfüçyüsçülük'], 'A', 'Hinduizmde toplum kastlara ayrılır; ruhun yeniden doğuşu karma yasasına bağlıdır.', 1);

dn.lesson(
  'dunya-ahiret',
  8,
  'Ahiret inancının aşamaları: ölüm, berzah, kıyamet, diriliş, haşir, mizan ve hesap.',
  [
    FLOW('Ahiret hayatının aşamaları', 'Ölüm', 'Berzah: Ölümden kıyamete kadar geçen âlem', 'Kıyamet: Evrendeki düzenin sona ermesi', 'Ba\'s: Yeniden diriliş', 'Haşir: Hesap için toplanma', 'Mizan: Amellerin tartılması', 'Hesap ve sırat', 'Cennet ya da cehennem'),
    H('Ahiret inancının bireye ve topluma etkileri'),
    UL('Sorumluluk bilinci kazandırır.', 'Hayata anlam katar, ümit verir.', 'Adalet duygusunu güçlendirir: hiçbir iyilik ya da kötülük karşılıksız kalmaz.', 'Toplumsal huzur ve güvene katkı sağlar.'),
    TIP('Kur\'an\'da dünya hayatı geçici, ahiret hayatı kalıcı olarak tanıtılır; dünya ise ahiretin "tarlası" olarak görülür.', 'info'),
  ],
  [card('Berzah', 'Ölümden kıyamete kadar olan âlem'), card('Mizan', 'Amellerin tartılması'), card('Haşir', 'Hesap için toplanma')],
);

dn.q('dunya-ahiret', 'Ölümden sonra kıyametin kopmasına kadar geçen süreye (âleme) ne ad verilir?', ['Haşir', 'Berzah', 'Mizan', 'Sırat', 'Ba\'s'], 'B', 'Berzah, dünya ile ahiret arasındaki ara âlemdir.', 1);
dn.q('dunya-ahiret', 'Kıyametten sonra bütün insanların yeniden diriltilmesine ne ad verilir?', ['Ba\'s', 'Haşir', 'Mizan', 'Hesap', 'Berzah'], 'A', 'Ba\'s, ölülerin yeniden diriltilmesidir; ardından haşir (toplanma) gelir.', 1);
dn.q('dunya-ahiret', 'Ahirette insanların dünyada yaptıkları iyilik ve kötülüklerin tartılmasına ne ad verilir?', ['Sırat', 'Haşir', 'Mizan', 'Berzah', 'Ba\'s'], 'C', 'Mizan, amellerin ilahi adaletle tartılmasıdır.', 1);
dn.q('dunya-ahiret', 'Yeniden diriltilen insanların hesap vermek üzere bir araya toplanmasına ne ad verilir?', ['Haşir', 'Mizan', 'Kıyamet', 'Sırat', 'Berzah'], 'A', 'Haşir, insanların mahşer yerinde toplanmasıdır.', 1);

export default [ed.done(), tr.done(), cg.done(), fg.done(), dn.done()];
