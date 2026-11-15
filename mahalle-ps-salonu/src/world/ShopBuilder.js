import * as THREE from 'three';
import { LAYOUT, GAMES } from '../config.js';
import { floorTexture, wallTexture, signTexture, canvasTexture } from './Textures.js';
import { Station } from './Station.js';
import { createDiscBox } from './Props.js';

/**
 * Kapalı dükkan sahnesini kurar (GDD §1 mekan kısıtı).
 * Çıktı: colliders (XZ AABB), surfaces (bırakma yüzeyleri), stations, rack, bin, lights.
 */
export function buildShop(scene, inventory) {
  const { room } = LAYOUT;
  const colliders = [];
  const surfaces = [];
  const W = room.maxX - room.minX, D = room.maxZ - room.minZ, H = room.height;

  const mats = {
    wood: new THREE.MeshStandardMaterial({ color: '#b07a4a', roughness: 0.75 }),
    woodDark: new THREE.MeshStandardMaterial({ color: '#6b4429', roughness: 0.8 }),
    trim: new THREE.MeshStandardMaterial({ color: '#3d2617', roughness: 0.8 }),
    tvBody: new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: 0.55 }),
    plasticBlack: new THREE.MeshStandardMaterial({ color: '#16161a', roughness: 0.35 }),
    leather: new THREE.MeshStandardMaterial({ color: '#7a3b22', roughness: 0.55 }),
    leatherLight: new THREE.MeshStandardMaterial({ color: '#8f4a2c', roughness: 0.5 }),
    counter: new THREE.MeshStandardMaterial({ color: '#2f6f6a', roughness: 0.6 }),
    counterTop: new THREE.MeshStandardMaterial({ color: '#e9d8b6', roughness: 0.45 }),
    metal: new THREE.MeshStandardMaterial({ color: '#8d99a6', roughness: 0.35, metalness: 0.7 }),
    pick: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  };

  const box = (w, h, d, mat, x, y, z, { cast = true, receive = true, parent = scene } = {}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive;
    parent.add(m); return m;
  };
  const collide = (minX, maxX, minZ, maxZ) => colliders.push({ minX, maxX, minZ, maxZ });

  // --- Zemin & tavan -------------------------------------------------------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.7 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.name = 'floor';
  scene.add(floor); surfaces.push(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.4, D + 0.4), new THREE.MeshStandardMaterial({ color: '#e6d3b3', roughness: 0.95, side: THREE.DoubleSide }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; ceil.castShadow = true; scene.add(ceil);

  // --- Duvarlar ------------------------------------------------------------
  const wallMat = (len) => { const t = wallTexture(); t.repeat.set(len / 3, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }); };
  const T = 0.2; // duvar kalınlığı
  box(W, H, T, wallMat(W), 0, H / 2, room.minZ - T / 2);             // arka
  box(T, H, D, wallMat(D), room.minX - T / 2, H / 2, 0).rotation.y = 0; // sol
  box(T, H, D, wallMat(D), room.maxX + T / 2, H / 2, 0);              // sağ
  collide(room.minX - 1, room.maxX + 1, room.minZ - 1, room.minZ);
  collide(room.minX - 1, room.minX, room.minZ - 1, room.maxZ + 1);
  collide(room.maxX, room.maxX + 1, room.minZ - 1, room.maxZ + 1);

  // Ön duvar: vitrin camı ve kapı boşluğu bırakılarak parçalı
  const fz = room.maxZ + T / 2;
  const win = LAYOUT.window;
  const doorMinX = LAYOUT.door.x - LAYOUT.door.width / 2, doorMaxX = LAYOUT.door.x + LAYOUT.door.width / 2;
  const frontMat = new THREE.MeshStandardMaterial({ color: '#d9b98f', roughness: 0.9 });
  const seg = (x0, x1, y0, y1) => box(x1 - x0, y1 - y0, T, frontMat, (x0 + x1) / 2, (y0 + y1) / 2, fz);
  seg(room.minX, win.minX, 0, H);
  seg(win.minX, win.maxX, 0, win.bottom);
  seg(win.minX, win.maxX, win.top, H);
  seg(win.maxX, doorMinX, 0, H);
  seg(doorMinX, doorMaxX, 2.2, H);
  seg(doorMaxX, room.maxX, 0, H);
  collide(room.minX - 1, room.maxX + 1, room.maxZ, room.maxZ + 1); // oyuncu dışarı çıkamaz (kapı dahil)

  // Vitrin çerçevesi
  for (let x = win.minX; x <= win.maxX + 0.01; x += (win.maxX - win.minX) / 3) box(0.08, win.top - win.bottom, 0.12, mats.trim, x, (win.top + win.bottom) / 2, room.maxZ);
  box(win.maxX - win.minX, 0.1, 0.35, mats.woodDark, (win.minX + win.maxX) / 2, win.bottom, room.maxZ - 0.12);
  // Cam (çok hafif yansıma)
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(win.maxX - win.minX, win.top - win.bottom),
    new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.2 }));
  glass.position.set((win.minX + win.maxX) / 2, (win.top + win.bottom) / 2, room.maxZ + 0.02); glass.rotation.y = Math.PI;
  scene.add(glass);
  // Cama ters yazı: dükkan adı
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: signTexture(['PS SALONU · OYUN · TOST · ÇAY'], { bg: 'rgba(0,0,0,0)', fg: '#ffd43b', w: 1024, h: 192, font: 'bold 64px sans-serif' }), transparent: true, side: THREE.DoubleSide }));
  decal.position.set(-1.9, 2.15, room.maxZ - 0.01); decal.rotation.y = Math.PI; decal.scale.x = -1;
  scene.add(decal);

  // Sokak arka planı (dış dünya yalnızca camdan hissedilir)
  const streetTex = canvasTexture(1024, 384, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    const cols = ['#e7b98a', '#d9a273', '#c98e66', '#e2c29b', '#b97a57'];
    let x = 0;
    while (x < w) {
      const bw = 120 + Math.random() * 120, bh = 180 + Math.random() * 150;
      ctx.fillStyle = cols[Math.floor(Math.random() * cols.length)];
      ctx.fillRect(x, h - bh, bw, bh);
      ctx.fillStyle = 'rgba(60,40,30,.55)';
      for (let wy = h - bh + 20; wy < h - 60; wy += 46) for (let wx = x + 14; wx < x + bw - 30; wx += 36) ctx.fillRect(wx, wy, 20, 26);
      x += bw + 6;
    }
    ctx.fillStyle = '#6c6c6c'; ctx.fillRect(0, h - 50, w, 50);
    ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, h - 56, w, 8);
  });
  const streetMat = new THREE.MeshBasicMaterial({ map: streetTex, color: '#ffffff', toneMapped: false });
  const street = new THREE.Mesh(new THREE.PlaneGeometry(18, 6.75), streetMat);
  street.position.set(0, 2.6, 9.5); street.rotation.y = Math.PI; scene.add(street);
  const skyMat = new THREE.MeshBasicMaterial({ color: '#bfe3ff', toneMapped: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), skyMat);
  sky.position.set(0, 6, 10.5); sky.rotation.y = Math.PI; scene.add(sky);
  const sidewalk = new THREE.Mesh(new THREE.PlaneGeometry(18, 5), new THREE.MeshStandardMaterial({ color: '#9b9087', roughness: 1 }));
  sidewalk.rotation.x = -Math.PI / 2; sidewalk.position.set(0, -0.01, 7.6); sidewalk.receiveShadow = true; scene.add(sidewalk);

  // Kapı (menteşe x=doorMinX)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(doorMinX, 0, room.maxZ + 0.02);
  scene.add(doorPivot);
  box(LAYOUT.door.width, 2.18, 0.05, mats.woodDark, LAYOUT.door.width / 2, 1.09, 0, { parent: doorPivot });
  const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), new THREE.MeshStandardMaterial({ color: '#bfe3ff', transparent: true, opacity: 0.35, roughness: 0.1 }));
  doorGlass.position.set(LAYOUT.door.width / 2, 1.35, -0.03); doorGlass.rotation.y = Math.PI; doorPivot.add(doorGlass);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.metal);
  bell.rotation.x = Math.PI; bell.position.set(doorMinX + 0.2, 2.28, room.maxZ - 0.08); scene.add(bell);

  // --- Tezgah (kasa) --------------------------------------------------------
  const c = LAYOUT.counter;
  box(c.w, c.h - 0.05, c.d, mats.counter, c.x, (c.h - 0.05) / 2, c.z);
  const ctop = box(c.w + 0.1, 0.05, c.d + 0.12, mats.counterTop, c.x, c.h - 0.025, c.z);
  surfaces.push(ctop);
  collide(c.x - c.w / 2 - 0.05, c.x + c.w / 2 + 0.05, c.z - c.d / 2 - 0.06, c.z + c.d / 2 + 0.06);
  // Yazar kasa
  box(0.38, 0.16, 0.32, mats.tvBody, c.x - 0.8, c.h + 0.08, c.z - 0.05);
  const scr = box(0.26, 0.12, 0.02, new THREE.MeshBasicMaterial({ color: '#7cff9b' }), c.x - 0.8, c.h + 0.24, c.z - 0.08, { cast: false });
  scr.rotation.x = -0.3;
  // Çay bardağı + şekerlik
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.08, 14), new THREE.MeshStandardMaterial({ color: '#b5651d', transparent: true, opacity: 0.85, roughness: 0.1 }));
  tea.position.set(c.x + 0.9, c.h + 0.04, c.z - 0.1); scene.add(tea);
  // Kasa tabelası
  const kasaSign = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.35), new THREE.MeshBasicMaterial({ map: signTexture(['KASA'], { bg: '#2f6f6a', fg: '#ffe8a3', h: 160, font: 'bold 96px sans-serif' }) }));
  kasaSign.position.set(c.x, 0.7, c.z + c.d / 2 + 0.01); scene.add(kasaSign);

  // --- CD / Oyun rafı -------------------------------------------------------
  const r = LAYOUT.rack;
  const rackGroup = new THREE.Group(); scene.add(rackGroup);
  const z0 = r.z - r.length / 2, z1 = r.z + r.length / 2;
  box(0.4, 2.0, 0.05, mats.woodDark, r.x, 1.0, z0, { parent: rackGroup });
  box(0.4, 2.0, 0.05, mats.woodDark, r.x, 1.0, z1, { parent: rackGroup });
  box(0.04, 2.0, r.length, mats.woodDark, r.x - 0.18, 1.0, r.z, { parent: rackGroup });
  const shelfYs = [0.1, 0.55, 1.0, 1.45, 1.95];
  for (const y of shelfYs) box(0.4, 0.04, r.length, mats.wood, r.x, y, r.z, { parent: rackGroup });
  collide(r.x - 0.25, r.x + 0.25, z0 - 0.05, z1 + 0.05);
  const rackPick = box(0.3, 2.0, r.length, mats.pick, r.x - 0.05, 1.0, r.z, { cast: false, receive: false, parent: rackGroup });
  rackPick.userData.interact = { kind: 'rack' };
  const rackSign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: signTexture(['OYUN ARŞİVİ'], { bg: '#5f3dc4', fg: '#fff', h: 128, font: 'bold 64px sans-serif' }) }));
  rackSign.position.set(r.x - 0.17, 2.35, r.z); rackSign.rotation.y = Math.PI / 2; scene.add(rackSign);

  // Slotlar: 2 raf x 3 oyun, göz hizasında, kapak +x yönüne bakar
  const slots = new Map();
  GAMES.forEach((g, i) => {
    const shelf = i < 3 ? 1.45 : 1.0;
    const zi = (i % 3) - 1;
    const pos = new THREE.Vector3(r.x + 0.15, shelf + 0.02 + 0.105, r.z + zi * 0.75);
    slots.set(g.id, { pos, rotY: Math.PI / 2 });
    const mesh = createDiscBox(g);
    mesh.position.copy(pos); mesh.rotation.set(0, Math.PI / 2, 0);
    scene.add(mesh);
    inventory.get(g.id).mesh = mesh;
  });
  // Dekor: alt raflarda eski/boş kutular (kısıtlı arşiv hissi)
  const decoColors = ['#555', '#6d6875', '#4a4e69', '#7f5539'];
  for (const y of [0.12, 0.57]) for (let k = 0; k < 9; k++) {
    const m = box(0.022, 0.19, 0.15, new THREE.MeshStandardMaterial({ color: decoColors[k % 4], roughness: 0.7 }), r.x + 0.02 - k * 0.0, y + 0.115, z0 + 0.35 + k * 0.28, { parent: rackGroup });
    m.rotation.z = (Math.random() - 0.5) * 0.15;
  }

  // --- Çöp kovası -----------------------------------------------------------
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.6, 18), new THREE.MeshStandardMaterial({ color: '#2b8a3e', roughness: 0.6 }));
  bin.position.set(LAYOUT.bin.x, 0.3, LAYOUT.bin.z); bin.castShadow = true; scene.add(bin);
  bin.userData.interact = { kind: 'bin' };
  collide(LAYOUT.bin.x - 0.25, LAYOUT.bin.x + 0.25, LAYOUT.bin.z - 0.25, LAYOUT.bin.z + 0.25);

  // --- İstasyonlar ----------------------------------------------------------
  const stations = LAYOUT.stations.map((s) => {
    const st = new Station(s, mats);
    scene.add(st.group);
    colliders.push(...st.colliders);
    surfaces.push(...st.surfaces);
    return st;
  });

  // --- Kilitli içerik (ilerleme ipuçları) ----------------------------------
  // Seviye 2: örtülü arcade kabini
  const arcade = new THREE.Group(); arcade.position.set(5.45, 0, 2.6); arcade.rotation.y = -Math.PI / 2; scene.add(arcade);
  box(0.8, 1.8, 0.75, new THREE.MeshStandardMaterial({ color: '#efe6d8', roughness: 1 }), 0, 0.9, 0, { parent: arcade });
  const arcSign = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: signTexture(['ARCADE', 'Seviye 2'], { bg: '#212529', fg: '#ffd43b', w: 256, h: 128, font: 'bold 40px sans-serif' }) }));
  arcSign.position.set(0, 1.3, 0.38); arcade.add(arcSign);
  collide(5.0, 5.9, 2.15, 3.05);
  // Seviye 3: kilitli depo / VIP loca kapısı
  box(1.0, 2.1, 0.06, mats.trim, -4.3, 1.05, room.minZ + 0.03);
  const vip = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: signTexture(['DEPO · KİLİTLİ', 'VIP Loca · Seviye 3'], { bg: '#c92a2a', fg: '#fff', w: 320, h: 160, font: 'bold 30px sans-serif' }) }));
  vip.position.set(-4.3, 1.55, room.minZ + 0.07); scene.add(vip);

  // Posterler
  const poster = (lines, opts, x, y, z, rotY, w = 1.0, h = 0.5) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTexture(lines, opts) }));
    p.position.set(x, y, z); p.rotation.y = rotY; scene.add(p);
  };
  poster(['SAATİ 40 ₺', 'Yarım saat altı yok'], { bg: '#fff3bf', fg: '#c92a2a', border: '#c92a2a', font: 'bold 54px sans-serif' }, room.maxX - 0.01, 1.8, -1.0, -Math.PI / 2, 1.1, 0.55);
  poster(['VERESİYE YOKTUR', 'Allah razı olsun'], { bg: '#e7f5ff', fg: '#1864ab', border: '#1864ab', font: 'bold 48px sans-serif' }, room.minX + 0.01, 1.8, 2.2, Math.PI / 2, 1.0, 0.5);
  poster(['KOLA SERT', 'KULLANILMAZ!'], { bg: '#ffe3e3', fg: '#a61e1e', border: '#a61e1e', font: 'bold 54px sans-serif' }, 1.6, 2.2, room.minZ + 0.01, 0, 0.9, 0.45);

  // --- Neon şeritler (atmosfer) --------------------------------------------
  const neon = (color, w, h, d, x, y, z) => {
    box(w, h, d, new THREE.MeshBasicMaterial({ color, toneMapped: false }), x, y, z, { cast: false, receive: false });
    const l = new THREE.PointLight(color, 0.9, 6, 2); l.position.set(x, y - 0.3, z + (z < 0 ? 0.6 : -0.6)); scene.add(l);
    return l;
  };
  const neonLights = [
    neon('#ff4fa3', 7.0, 0.05, 0.05, 1.5, 2.85, room.minZ + 0.05),
    neon('#3fe0ff', 0.05, 0.05, 6.0, room.maxX - 0.05, 2.85, -1.0),
  ];

  // --- Tavan lambaları ------------------------------------------------------
  const lampLights = [];
  for (const [x, z] of [[-2.5, 1.8], [1.6, -2.0], [-2.8, -2.2], [2.0, 2.4]]) {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#2f6f6a', side: THREE.DoubleSide, roughness: 0.6 }));
    shade.position.set(x, H - 0.45, z); scene.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffe8b0', toneMapped: false }));
    bulb.position.set(x, H - 0.52, z); scene.add(bulb);
    const cord = box(0.01, 0.35, 0.01, mats.trim, x, H - 0.18, z, { cast: false });
    cord.receiveShadow = false;
    const l = new THREE.PointLight('#ffd9a0', 6, 9, 1.6); l.position.set(x, H - 0.62, z); scene.add(l);
    lampLights.push({ light: l, bulb });
  }

  // --- Doğal ışık -----------------------------------------------------------
  const hemi = new THREE.HemisphereLight('#ffe9cc', '#6b4a35', 0.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d6', 2.0);
  sun.position.set(-3, 7, 14); sun.target.position.set(-1.5, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const streetLamp = new THREE.PointLight('#ffb35c', 0, 14, 1.5);
  streetLamp.position.set(-2.0, 3.0, 6.8); scene.add(streetLamp);

  return {
    colliders, surfaces, stations, slots, bin, doorPivot,
    lights: { hemi, sun, streetLamp, lampLights, neonLights, skyMat, streetMat },
  };
}
