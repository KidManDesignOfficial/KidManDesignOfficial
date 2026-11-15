import * as THREE from 'three';
import { drawBubble } from '../world/Textures.js';

const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#ffdbac', '#8d5524'];
const HAIR = ['#2b1d14', '#4a2c17', '#111', '#7a4a1e', '#c9a26b'];
const PANTS = ['#364fc7', '#343a40', '#5c7cfa', '#495057', '#2b2d42'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Müşteri görsel ajanı: yumuşak, yuvarlak hatlı (animasyon filmi tarzı) karakter.
 * Sadece hareket/animasyon/konuşma balonu bilir; karar mantığı CustomerManager'dadır.
 */
export class Customer {
  constructor(profile, scene) {
    this.profile = profile;
    this.scene = scene;
    this.speed = profile.id === 'cocuk' ? 1.9 : 1.45;
    this.path = [];
    this.onArrive = null;
    this.sitting = false;
    this.faceYaw = null;
    this._walkT = Math.random() * 10;
    this._bubbleTimer = 0;
    this.delay = 0;

    this.group = new THREE.Group();
    this.group.scale.setScalar(profile.scale);
    this.#build();
    scene.add(this.group);
  }

  get position() { return this.group.position; }

  #build() {
    const mat = (c, r = 0.6) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    const shirt = mat(pick(this.profile.shirt), 0.75);
    const pants = mat(pick(PANTS), 0.8);
    const skin = mat(pick(SKIN), 0.55);
    const hair = mat(pick(HAIR), 0.9);
    const g = this.group;
    const mesh = (geo, m, parent = g) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; parent.add(o); return o; };

    // Bacaklar: kalça → diz eklemli (oturma pozu için)
    this.legs = [-0.1, 0.1].map((x) => {
      const hip = new THREE.Group(); hip.position.set(x, 0.8, 0); g.add(hip);
      mesh(new THREE.CapsuleGeometry(0.075, 0.28, 4, 10), pants, hip).position.y = -0.2;
      const knee = new THREE.Group(); knee.position.y = -0.42; hip.add(knee);
      mesh(new THREE.CapsuleGeometry(0.065, 0.26, 4, 10), pants, knee).position.y = -0.18;
      const shoe = mesh(new THREE.BoxGeometry(0.12, 0.07, 0.2), mat('#222', 0.5), knee); shoe.position.set(0, -0.38, 0.04);
      return { hip, knee };
    });
    // Gövde
    const torso = mesh(new THREE.CapsuleGeometry(0.21, 0.32, 6, 14), shirt); torso.position.y = 1.1; torso.scale.z = 0.8;
    // Kollar
    this.arms = [-0.27, 0.27].map((x) => {
      const sh = new THREE.Group(); sh.position.set(x, 1.32, 0); g.add(sh);
      mesh(new THREE.CapsuleGeometry(0.06, 0.38, 4, 10), shirt, sh).position.y = -0.24;
      mesh(new THREE.SphereGeometry(0.065, 10, 8), skin, sh).position.y = -0.5;
      return sh;
    });
    // Kafa — büyük ve yuvarlak (sevimli oranlar)
    const head = new THREE.Group(); head.position.y = 1.6; g.add(head); this.head = head;
    mesh(new THREE.SphereGeometry(0.19, 20, 16), skin, head);
    const hairCap = mesh(new THREE.SphereGeometry(0.2, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair, head);
    hairCap.position.set(0, 0.02, -0.015); hairCap.rotation.x = -0.25;
    const eyeW = mat('#fff', 0.3), eyeB = mat('#1a1a1a', 0.2);
    for (const x of [-0.07, 0.07]) {
      const e = mesh(new THREE.SphereGeometry(0.042, 12, 10), eyeW, head); e.position.set(x, 0.02, 0.16);
      const p = mesh(new THREE.SphereGeometry(0.022, 10, 8), eyeB, head); p.position.set(x, 0.02, 0.195);
    }
    mesh(new THREE.SphereGeometry(0.03, 10, 8), skin, head).position.set(0, -0.04, 0.19);
    if (this.profile.id === 'vip') {
      const glasses = mesh(new THREE.BoxGeometry(0.26, 0.06, 0.03), mat('#111', 0.1), head); glasses.position.set(0, 0.025, 0.2);
      const chain = mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 20), new THREE.MeshStandardMaterial({ color: '#ffd43b', metalness: 0.9, roughness: 0.25 }));
      chain.position.set(0, 1.3, 0.08); chain.rotation.x = Math.PI / 2.4;
    }
    if (this.profile.id === 'turnuva') {
      const band = mesh(new THREE.TorusGeometry(0.19, 0.025, 6, 20), mat('#e03131', 0.6), head); band.rotation.x = Math.PI / 2; band.position.y = 0.07;
    }

    // Konuşma balonu
    this.bubbleCanvas = document.createElement('canvas');
    this.bubbleCanvas.width = 512; this.bubbleCanvas.height = 200;
    this.bubbleTex = new THREE.CanvasTexture(this.bubbleCanvas);
    this.bubbleTex.colorSpace = THREE.SRGBColorSpace;
    this.bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.bubbleTex, depthTest: false, transparent: true }));
    this.bubble.scale.set(1.35, 0.53, 1);
    this.bubble.position.y = 2.2;
    this.bubble.renderOrder = 10;
    this.bubble.visible = false;
    g.add(this.bubble);

    // Sabır çubuğu
    this.patienceBg = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#222', depthTest: false, transparent: true, opacity: 0.6 }));
    this.patienceBg.scale.set(0.5, 0.06, 1); this.patienceBg.position.y = 1.95; this.patienceBg.renderOrder = 9;
    this.patienceFill = new THREE.Sprite(new THREE.SpriteMaterial({ color: '#51cf66', depthTest: false }));
    this.patienceFill.center.set(0, 0.5);
    this.patienceFill.scale.set(0.48, 0.045, 1); this.patienceFill.position.set(-0.24, 1.95, 0); this.patienceFill.renderOrder = 10;
    g.add(this.patienceBg, this.patienceFill);
    this.setPatience(null);
  }

  /** Etkileşim için tüm mesh'lere ortak hedef bilgisi atar. */
  setInteract(data) {
    this.group.traverse((o) => { if (o.isMesh) o.userData.interact = data; });
  }

  say(text, tone = 'normal', duration = 4) {
    drawBubble(this.bubbleCanvas.getContext('2d'), 512, 200, text, tone);
    this.bubbleTex.needsUpdate = true;
    this.bubble.visible = true;
    this._bubbleTimer = duration; // null/Infinity => kalıcı
  }

  hideBubble() { this.bubble.visible = false; }

  /** p: 0..1 ya da null (gizle). */
  setPatience(p) {
    const show = p !== null && p !== undefined;
    this.patienceBg.visible = this.patienceFill.visible = show;
    if (!show) return;
    this.patienceFill.scale.x = 0.48 * Math.max(0.001, p);
    this.patienceFill.material.color.set(p > 0.6 ? '#51cf66' : p > 0.3 ? '#fcc419' : '#ff6b6b');
  }

  /** delay: grup üyeleri iç içe yürümesin diye kademeli başlama (sn). */
  walk(points, onArrive, delay = 0) {
    this.stand();
    this.path = points.map((p) => new THREE.Vector3(p.x, 0, p.z));
    this.onArrive = onArrive;
    this.delay = delay;
  }

  teleport(p) { this.group.position.set(p.x, 0, p.z); }

  sit(seat, yaw) {
    this.sitting = true;
    this.path = [];
    this.group.position.set(seat.x, 0.55 - 0.8 * this.profile.scale, seat.z); // kalça oturak hizasında
    this.group.rotation.y = yaw;
    for (const l of this.legs) { l.hip.rotation.x = -Math.PI / 2; l.knee.rotation.x = Math.PI / 2; }
    for (const a of this.arms) a.rotation.x = -0.9; // kol tutuyor
  }

  stand() {
    if (!this.sitting) return;
    this.sitting = false;
    this.group.position.y = 0;
    for (const l of this.legs) { l.hip.rotation.x = 0; l.knee.rotation.x = 0; }
    for (const a of this.arms) a.rotation.x = 0;
  }

  update(dt) {
    if (this._bubbleTimer !== null && Number.isFinite(this._bubbleTimer) && this.bubble.visible) {
      this._bubbleTimer -= dt;
      if (this._bubbleTimer <= 0) this.bubble.visible = false;
    }

    if (this.delay > 0) this.delay -= dt;
    else if (this.path.length) {
      const target = this.path[0];
      const pos = this.group.position;
      const dx = target.x - pos.x, dz = target.z - pos.z;
      const dist = Math.hypot(dx, dz);
      const step = this.speed * dt;
      if (dist <= step) {
        pos.x = target.x; pos.z = target.z; this.path.shift();
        if (!this.path.length) { const cb = this.onArrive; this.onArrive = null; this.#idlePose(); cb?.(); }
      } else {
        pos.x += (dx / dist) * step; pos.z += (dz / dist) * step;
        this.#turnTowards(Math.atan2(dx, dz), dt);
        this._walkT += dt * this.speed * 4.2;
        const s = Math.sin(this._walkT);
        this.legs[0].hip.rotation.x = s * 0.55; this.legs[1].hip.rotation.x = -s * 0.55;
        this.legs[0].knee.rotation.x = Math.max(0, -s) * 0.6; this.legs[1].knee.rotation.x = Math.max(0, s) * 0.6;
        this.arms[0].rotation.x = -s * 0.5; this.arms[1].rotation.x = s * 0.5;
        pos.y = Math.abs(Math.cos(this._walkT)) * 0.04;
      }
    } else if (this.faceYaw !== null && !this.sitting) {
      this.#turnTowards(this.faceYaw, dt);
    }

    // Oturan müşteri: hafif nefes / oyun heyecanı
    if (this.sitting) {
      this._walkT += dt;
      this.head.rotation.z = Math.sin(this._walkT * 1.7) * 0.05;
      this.arms[0].rotation.x = -0.9 + Math.sin(this._walkT * 9) * 0.05;
    } else {
      this.head.rotation.z = 0;
    }
  }

  #idlePose() {
    for (const l of this.legs) { l.hip.rotation.x = 0; l.knee.rotation.x = 0; }
    for (const a of this.arms) a.rotation.x = 0;
    this.group.position.y = 0;
  }

  #turnTowards(yaw, dt) {
    let d = yaw - this.group.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    this.group.rotation.y += d * Math.min(1, dt * 8);
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { o.material.map?.dispose?.(); o.material.dispose(); }
    });
  }
}
