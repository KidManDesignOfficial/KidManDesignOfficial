import * as THREE from 'three';

const BACK_Z = -5;

/**
 * Konsol masası (istasyon): dolap + tüplü TV + konsol + sehpa + koltuk.
 * Durum: party (oturan grup), loadedGame (takılı disk), trash (çöpler).
 */
export class Station {
  constructor({ id, x }, mats) {
    this.id = id;
    this.x = x;
    this.party = null;
    this.loadedGame = null;
    this.trash = [];
    this.screenMode = 'off';
    this.screenGame = null;
    this._screenTimer = 0;
    this._t = 0;

    this.group = new THREE.Group();
    this.group.name = `station-${id}`;
    this.colliders = [];
    this.surfaces = [];

    this.#build(mats);

    // Yol noktaları (müşteriler için)
    this.approach = [
      new THREE.Vector3(x + 1.25, 0, -1.7),
      new THREE.Vector3(x + 1.25, 0, -3.22),
    ];
    this.seats = [new THREE.Vector3(x - 0.42, 0, -2.62), new THREE.Vector3(x + 0.42, 0, -2.62)];
    this.seatFront = this.seats.map((s) => new THREE.Vector3(s.x, 0, -3.22));
  }

  get isFree() { return !this.party; }
  get isClean() { return this.trash.length === 0; }
  get available() { return this.isFree && this.isClean; }

  #build(mats) {
    const x = this.x;
    const add = (geo, mat, px, py, pz, { cast = true, receive = true } = {}) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz); m.castShadow = cast; m.receiveShadow = receive;
      this.group.add(m); return m;
    };

    // Dolap
    const cab = add(new THREE.BoxGeometry(1.8, 0.6, 0.6), mats.woodDark, x, 0.3, BACK_Z + 0.35);
    this.surfaces.push(cab);
    this.colliders.push({ minX: x - 0.9, maxX: x + 0.9, minZ: BACK_Z, maxZ: BACK_Z + 0.65 });
    // Dolap kapak çizgileri
    add(new THREE.BoxGeometry(0.02, 0.5, 0.01), mats.trim, x, 0.3, BACK_Z + 0.656, { cast: false });

    // Tüplü TV (Seviye 1: köhne)
    add(new THREE.BoxGeometry(0.92, 0.72, 0.62), mats.tvBody, x, 0.6 + 0.36, BACK_Z + 0.36);
    add(new THREE.BoxGeometry(0.6, 0.5, 0.25), mats.tvBody, x, 0.6 + 0.32, BACK_Z + 0.1);
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 320; this.screenCanvas.height = 240;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;
    const screenMat = new THREE.MeshBasicMaterial({ map: this.screenTex, toneMapped: false });
    this.screen = add(new THREE.PlaneGeometry(0.74, 0.55), screenMat, x, 0.6 + 0.37, BACK_Z + 0.672, { cast: false, receive: false });
    // TV ışığı
    this.glow = new THREE.PointLight('#6fb7ff', 0, 3.2, 2);
    this.glow.position.set(x, 1.0, BACK_Z + 1.1);
    this.group.add(this.glow);

    // Konsol (genel, markasız siyah kasa)
    const consoleMesh = add(new THREE.BoxGeometry(0.34, 0.08, 0.28), mats.plasticBlack, x - 0.66, 0.64, BACK_Z + 0.38);
    consoleMesh.rotation.y = 0.05;
    this.led = add(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: '#ff3b3b' }), x - 0.53, 0.645, BACK_Z + 0.525, { cast: false });
    this.caseSlot = new THREE.Vector3(x + 0.66, 0.612, BACK_Z + 0.38);

    // Etkileşim hacmi: dolap+TV+konsol (görünmez ama raycast'e açık)
    const pick = add(new THREE.BoxGeometry(1.86, 1.4, 0.75), mats.pick, x, 0.7, BACK_Z + 0.37, { cast: false, receive: false });
    pick.userData.interact = { kind: 'console', station: this };
    this.pick = pick;

    // Sehpa
    const table = add(new THREE.BoxGeometry(1.2, 0.06, 0.55), mats.wood, x, 0.42, -3.75);
    this.surfaces.push(table);
    for (const [dx, dz] of [[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]]) {
      add(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), mats.woodDark, x + dx, 0.2, -3.75 + dz);
    }
    this.colliders.push({ minX: x - 0.62, maxX: x + 0.62, minZ: -4.03, maxZ: -3.47 });
    this.tableTopY = 0.45;
    // Kollar
    for (const dx of [-0.25, 0.25]) {
      const pad = add(new THREE.BoxGeometry(0.15, 0.035, 0.09), mats.plasticBlack, x + dx, 0.47, -3.7);
      pad.rotation.y = dx * 0.6;
    }

    // Yıpranmış deri koltuk
    add(new THREE.BoxGeometry(1.8, 0.4, 0.8), mats.leather, x, 0.2, -2.6);
    add(new THREE.BoxGeometry(1.74, 0.1, 0.72), mats.leatherLight, x, 0.45, -2.64);
    add(new THREE.BoxGeometry(1.8, 0.75, 0.2), mats.leather, x, 0.6, -2.12);
    for (const dx of [-0.95, 0.95]) add(new THREE.BoxGeometry(0.16, 0.6, 0.86), mats.leather, x + dx, 0.32, -2.58);
    this.colliders.push({ minX: x - 1.04, maxX: x + 1.04, minZ: -3.0, maxZ: -2.02 });

    // Masa numarası tabelası
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.arc(64, 64, 60, 0, 7); ctx.fill();
    ctx.fillStyle = '#2b2118'; ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(this.id), 64, 70);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    add(new THREE.CircleGeometry(0.18, 24), new THREE.MeshBasicMaterial({ map: tex }), x, 2.05, BACK_Z + 0.01, { cast: false });

    this.drawScreen();
  }

  /** Disk yuvası durumu (LED). */
  setLoaded(gameId) {
    this.loadedGame = gameId;
    this.led.material.color.set(gameId ? '#3bff6f' : '#ff3b3b');
  }

  setScreen(mode, game = null) {
    this.screenMode = mode; this.screenGame = game;
    this.drawScreen();
  }

  update(dt) {
    this._t += dt;
    // Animasyonlu ekran sadece oyun/yükleme modunda yeniden çizilir (performans)
    if (this.screenMode === 'playing' || this.screenMode === 'loading' || this.screenMode === 'waiting') {
      this._screenTimer -= dt;
      if (this._screenTimer <= 0) { this._screenTimer = 0.12; this.drawScreen(); }
    }
    const target = { off: 0, waiting: 0.6, loading: 0.9, playing: 1.6, wrong: 1.0 }[this.screenMode] ?? 0;
    this.glow.intensity += (target - this.glow.intensity) * Math.min(1, dt * 4);
  }

  drawScreen() {
    const ctx = this.screenCtx, w = 320, h = 240, t = this._t;
    const g = this.screenGame;
    switch (this.screenMode) {
      case 'off':
        ctx.fillStyle = '#0d1512'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(30, 20, 110, 60);
        break;
      case 'waiting': {
        ctx.fillStyle = '#10204a'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = Math.sin(t * 5) > 0 ? '#fff' : '#9db4ff';
        ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('LÜTFEN DİSK TAKIN', w / 2, h / 2);
        ctx.font = '18px sans-serif'; ctx.fillStyle = '#9db4ff';
        ctx.fillText(g ? `İstenen: ${g.short}` : '', w / 2, h / 2 + 36);
        this.glow.color.set('#6f8fff');
        break;
      }
      case 'loading': {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#4dabf7'; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 40, t * 6, t * 6 + 4); ctx.stroke();
        this.glow.color.set('#4dabf7');
        break;
      }
      case 'playing': {
        ctx.fillStyle = g ? g.color : '#333'; ctx.fillRect(0, 0, w, h);
        // basit "oyun" animasyonu: hareketli şekiller + skor
        ctx.fillStyle = 'rgba(255,255,255,.18)';
        for (let i = 0; i < 6; i++) {
          const px = ((t * 60 * (1 + i * 0.3) + i * 70) % (w + 80)) - 40;
          ctx.fillRect(px, 40 + i * 30, 40, 14);
        }
        ctx.fillStyle = g ? g.accent : '#fff';
        ctx.beginPath(); ctx.arc(w / 2 + Math.sin(t * 2.3) * 90, h / 2 + Math.cos(t * 3.1) * 50, 16, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, w, 30);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(g ? g.title : '', 10, 21);
        this.glow.color.set(g ? g.color : '#fff');
        break;
      }
      case 'wrong': {
        ctx.fillStyle = '#5c0b0b'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(g ? g.title : '???', w / 2, h / 2 - 10);
        ctx.font = '18px sans-serif'; ctx.fillText('(yanlış oyun!)', w / 2, h / 2 + 26);
        this.glow.color.set('#ff6b6b');
        break;
      }
    }
    // CRT tarama çizgileri
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    this.screenTex.needsUpdate = true;
  }
}
