import * as THREE from 'three';
import { PLAYER } from '../config.js';

/**
 * FPS karakter kontrolcüsü: pointer-lock fare bakışı, WASD yürüme,
 * Shift koşma, XZ düzleminde daire–AABB çarpışma, hafif kafa sallanması.
 */
export class PlayerController {
  constructor(camera, dom, colliders) {
    this.camera = camera;
    this.dom = dom;
    this.colliders = colliders;
    this.position = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.keys = new Set();
    this.enabled = true;
    this._bob = 0;
    this.sensitivity = 0.0022;

    addEventListener('keydown', (e) => { this.keys.add(e.code); });
    addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    addEventListener('blur', () => this.keys.clear());
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      // İmleç kilitlenemezse (gömülü sayfa vb.) sol tuşu basılı tutarak sürükle-bak
      const dragging = e.target === this.dom && (e.buttons & 1);
      if (document.pointerLockElement !== this.dom && !dragging) return;
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = THREE.MathUtils.clamp(this.pitch, -1.45, 1.45);
    });
  }

  get locked() { return document.pointerLockElement === this.dom; }

  lock() {
    try {
      const r = this.dom.requestPointerLock?.();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch { /* desteklenmiyor */ }
  }

  spawn({ x, z, yaw }) {
    this.position.set(x, 0, z);
    this.yaw = yaw; this.pitch = 0;
    this.#apply();
  }

  /** Belirli bir noktaya bakacak şekilde yönlendir (test/debug yardımcısı). */
  lookAt(target) {
    const eye = new THREE.Vector3(this.position.x, PLAYER.eyeHeight, this.position.z);
    const d = new THREE.Vector3().subVectors(target, eye);
    this.yaw = Math.atan2(-d.x, -d.z);
    this.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    this.#apply();
  }

  update(dt) {
    if (this.enabled) {
      const f = (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) - (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
      const s = (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
      if (f || s) {
        const speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? PLAYER.runSpeed : PLAYER.walkSpeed;
        const len = Math.hypot(f, s);
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        // ileri = −z (yaw=0)
        const dx = ((-sin * f) + (cos * s)) / len * speed * dt;
        const dz = ((-cos * f) - (sin * s)) / len * speed * dt;
        this.#move(dx, dz);
        this._bob += dt * speed * 2.6;
      } else {
        this._bob *= 0.9;
      }
    }
    this.#apply();
  }

  /** Eksen ayrık hareket + itme ile duvar boyunca kayma. */
  #move(dx, dz) {
    const r = PLAYER.radius;
    this.position.x += dx;
    this.#resolve(r);
    this.position.z += dz;
    this.#resolve(r);
  }

  #resolve(r) {
    const p = this.position;
    for (const c of this.colliders) {
      const cx = THREE.MathUtils.clamp(p.x, c.minX, c.maxX);
      const cz = THREE.MathUtils.clamp(p.z, c.minZ, c.maxZ);
      const dx = p.x - cx, dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2), push = r - d;
          p.x += (dx / d) * push; p.z += (dz / d) * push;
        } else {
          // Merkez kutunun içinde: en yakın kenara it
          const opts = [[c.minX - r - p.x, 0], [c.maxX + r - p.x, 0], [0, c.minZ - r - p.z], [0, c.maxZ + r - p.z]];
          opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
          p.x += opts[0][0]; p.z += opts[0][1];
        }
      }
    }
  }

  #apply() {
    const bob = Math.sin(this._bob) * 0.035;
    this.camera.position.set(this.position.x, PLAYER.eyeHeight + bob, this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
