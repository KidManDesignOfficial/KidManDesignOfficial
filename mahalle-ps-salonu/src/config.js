// ---------------------------------------------------------------------------
// Mahalle PlayStation Salonu — merkezi ayar dosyası (data-driven tasarım)
// Oyun dengesi, içerik ve yerleşim burada tutulur; sistemler bu veriyi okur.
// ---------------------------------------------------------------------------

/** Saat sistemi. Tüm saatler "gün başından itibaren dakika" cinsindendir. */
export const CLOCK = {
  realSecondsPerGameMinute: 0.5, // 1 oyun dakikası = 0.5 gerçek saniye (16 saatlik gün ≈ 8 dk)
  openMinute: 10 * 60,           // 10:00 dükkan açılır
  lastEntryMinute: 25 * 60,      // 01:00'den sonra yeni müşteri gelmez
  closeMinute: 26 * 60,          // 02:00 kepenk
  phases: [
    { id: 'SABAH', label: 'Sabah · Açılış', from: 10 * 60, to: 13 * 60 },
    { id: 'YOGUN', label: 'Öğlen/Akşamüstü · Yoğun Saatler', from: 13 * 60, to: 20 * 60 },
    { id: 'GECE', label: 'Gece · Müdavimler', from: 20 * 60, to: 26 * 60 },
  ],
};

/** Ekonomi (Seviye 1 değerleri). */
export const ECONOMY = {
  startMoney: 500,
  hourlyRate: 40,          // ₺ / masa-saati
  minChargeMinutes: 30,    // en az yarım saat ücret
  rentPerDay: 250,
  electricityBase: 30,
  electricityPerStationHour: 6,
};

/** Seviye hedefleri (MVP'de yalnızca gösterilir, kilit açma sonraki aşama). */
export const LEVELS = [
  { level: 1, name: 'Köhne Mahalle Salonu' },
  { level: 2, name: 'Yenilenme Dönemi', needMoney: 2500, needRep: 25 },
  { level: 3, name: 'Modern Merkez & VIP Loca', needMoney: 8000, needRep: 70 },
  { level: 4, name: 'Mahallenin Oyun Üssü', needMoney: 20000, needRep: 150 },
];

/**
 * Oyun arşivi. İsimler bilinçli olarak kurgusaldır (lisans/marka riski yok).
 * color: kapak rengi, accent: yazı/şerit rengi.
 */
export const GAMES = [
  { id: 'gol',    title: 'SÜPER GOL 05',   short: 'Süper Gol',    genre: 'Futbol',  color: '#2f9e44', accent: '#ffe066' },
  { id: 'efsane', title: 'FUTBOL EFSANE',  short: 'Futbol Efsane',genre: 'Futbol',  color: '#1c7ed6', accent: '#ffffff' },
  { id: 'sokak',  title: 'SOKAK KRALI',    short: 'Sokak Kralı',  genre: 'Açık dünya', color: '#e8590c', accent: '#fff3bf' },
  { id: 'yumruk', title: 'DEMİR YUMRUK 3', short: 'Demir Yumruk', genre: 'Dövüş',   color: '#c92a2a', accent: '#ffd43b' },
  { id: 'ralli',  title: 'RALLİ ATEŞİ',    short: 'Ralli Ateşi',  genre: 'Yarış',   color: '#f59f00', accent: '#212529' },
  { id: 'tapinak',title: 'KAYIP TAPINAK',  short: 'Kayıp Tapınak',genre: 'Macera',  color: '#5f3dc4', accent: '#e5dbff' },
];

/**
 * Müşteri profilleri (GDD §2.1).
 * patience*: gerçek saniye. playMinutes: oyun dakikası.
 * weights: faza göre gelme ağırlığı.
 */
export const PROFILES = [
  {
    id: 'cocuk', label: 'Aceleci Çocuklar', groupSize: [1, 2], scale: 0.82,
    patienceCounter: 30, patienceGame: 40, playMinutes: [40, 75], tipMult: 0.2,
    likes: ['gol', 'efsane', 'yumruk'],
    shirt: ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b'],
    intro: (n) => n > 1 ? 'Abi selam! İki kişiyiz, maç atacağız, boş masa var mı?' : 'Abi selam! Tek kişiyim, hızlıca bir el atabilir miyim?',
    weights: { SABAH: 1, YOGUN: 5, GECE: 0.5 },
  },
  {
    id: 'gececi', label: 'Gececi', groupSize: [1, 1], scale: 1,
    patienceCounter: 60, patienceGame: 70, playMinutes: [150, 300], tipMult: 0.6,
    likes: ['tapinak', 'sokak'],
    shirt: ['#495057', '#364fc7', '#5c940d'],
    intro: () => 'Selamünaleyküm abi, uzun takılacağım, sakin bir masa var mı?',
    weights: { SABAH: 0.4, YOGUN: 1, GECE: 4 },
  },
  {
    id: 'turnuva', label: 'Turnuvacı', groupSize: [2, 2], scale: 1,
    patienceCounter: 40, patienceGame: 45, playMinutes: [80, 120], tipMult: 0.5,
    likes: ['yumruk', 'gol', 'efsane', 'ralli'],
    shirt: ['#e64980', '#f76707', '#1098ad'],
    intro: () => 'Abi bugün rövanş var, hemen bir masa lazım!',
    weights: { SABAH: 0.3, YOGUN: 2.5, GECE: 1.5 },
  },
  {
    id: 'vip', label: 'VIP Müşteri', groupSize: [1, 2], scale: 1,
    patienceCounter: 35, patienceGame: 50, playMinutes: [90, 150], tipMult: 2.5,
    likes: ['ralli', 'sokak', 'tapinak'],
    shirt: ['#212529', '#862e9c'],
    intro: () => 'İyi akşamlar şef, en iyi masan hangisi?',
    weights: { SABAH: 0.2, YOGUN: 0.8, GECE: 1.2 },
  },
];

/** Ortalama gelişler arası süre (gerçek saniye) — faza göre. */
export const SPAWN = {
  meanIntervalByPhase: { SABAH: 38, YOGUN: 17, GECE: 30 },
  firstArrivalDelay: 6,
  maxQueue: 3,
};

/** Dükkan yerleşimi (metre). x: sol(-)/sağ(+), z: arka(-)/ön(+). */
export const LAYOUT = {
  room: { minX: -6, maxX: 6, minZ: -5, maxZ: 5, height: 3.1 },
  door: { x: 4.0, width: 1.3 },
  window: { minX: -5.4, maxX: 1.6, bottom: 0.9, top: 2.5 },
  counter: { x: -2.2, z: 2.9, w: 2.8, d: 0.6, h: 1.05 },
  rack: { x: -5.75, z: -2.0, length: 3.2 },
  bin: { x: -4.4, z: 2.3 },
  playerSpawn: { x: -2.2, z: 1.7, yaw: Math.PI }, // tezgah arkası, müşteriye (+z) bakar
  stations: [
    { id: 1, x: -0.4 },
    { id: 2, x: 3.4 },
  ],
  // Müşteri yol noktaları
  nodes: {
    outside: { x: 4.0, z: 6.6 },
    doorIn: { x: 4.0, z: 4.2 },
    aisle: { x: 1.5, z: 1.0 },
  },
  queueSlots: [
    { x: -2.2, z: 3.65 },
    { x: -0.9, z: 3.85 },
    { x: 0.4, z: 4.0 },
  ],
};

export const PLAYER = {
  eyeHeight: 1.65,
  radius: 0.28,
  walkSpeed: 3.0,
  runSpeed: 5.2,
  reach: 2.7,
  trashCapacity: 6,
};
