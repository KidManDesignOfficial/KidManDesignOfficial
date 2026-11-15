import * as THREE from 'three';
import { PLAYER } from '../config.js';

const HOLD_OFFSET = new THREE.Vector3(0.27, -0.25, -0.52);
const HOLD_ROT = new THREE.Euler(-0.15, -0.45, 0.05);

/**
 * Fiziksel FPS etkileşimi (GDD §2): ekran ortasından ışın atar, hedefe göre
 * bağlamsal eylem sunar. E = etkileşim, Q = elindekini bırak.
 */
export class Interaction {
  constructor({ camera, scene, bus, inventory, manager, world, player, dialog }) {
    Object.assign(this, { camera, scene, bus, inventory, manager, world, player, dialog });
    this.raycaster = new THREE.Raycaster();
    this.raycaster.camera = camera;
    this.raycaster.far = PLAYER.reach;
    this.held = null;          // gameId
    this.trashBag = 0;
    this.target = null;
    this._center = new THREE.Vector2(0, 0);
  }

  // ------------------------------------------------------------------ hedef
  update() {
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this._center, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    this.target = null;
    for (const h of hits) {
      if (h.object.isSprite || this.#isHeld(h.object)) continue;
      const data = this.#interactData(h.object);
      if (data) this.target = { object: h.object, data, point: h.point, distance: h.distance };
      break; // ilk katı nesne belirleyicidir (duvar arkası seçilmez)
    }
    return this.prompt();
  }

  #isHeld(obj) {
    if (!this.held) return false;
    return obj === this.inventory.get(this.held).mesh;
  }

  #interactData(obj) {
    for (let o = obj; o; o = o.parent) if (o.userData?.interact) return o.userData.interact;
    return null;
  }

  /** HUD'da gösterilecek bağlamsal ipucu. */
  prompt() {
    const t = this.target?.data;
    if (!t) return null;
    const heldGame = this.held && this.inventory.game(this.held);
    switch (t.kind) {
      case 'discBox': {
        const g = this.inventory.game(t.gameId);
        if (this.held) return { text: `${heldGame.short} kutusunu rafa koy`, key: 'E', ok: this.inventory.get(t.gameId).location === 'rack' };
        return { text: `${g.short} kutusunu al`, key: 'E', ok: true };
      }
      case 'rack':
        return this.held ? { text: `${heldGame.short} kutusunu rafa koy`, key: 'E', ok: true } : { text: 'Oyun arşivi — bir kutu seç', ok: false };
      case 'console': {
        const st = t.station;
        const loaded = st.loadedGame && this.inventory.game(st.loadedGame);
        if (this.held && !loaded) return { text: `${heldGame.short} diskini Masa ${st.id} konsoluna tak`, key: 'E', ok: true };
        if (this.held && loaded) return { text: `Konsolda ${loaded.short} takılı — önce elin boşken çıkar`, ok: false };
        if (loaded) return { text: `${loaded.short} diskini çıkar`, key: 'E', ok: true };
        return { text: `Masa ${st.id} konsolu boş — raftan disk getir`, ok: false };
      }
      case 'customer': {
        const p = t.party;
        if (this.manager.canTalk(p)) return { text: `${p.profile.label} ile konuş`, key: 'E', ok: true };
        if (p.state === 'REQUEST') return { text: `${p.profile.label} — ${p.game.short} istiyor`, key: 'E', ok: true };
        return { text: p.profile.label, ok: false };
      }
      case 'trash':
        return this.trashBag < PLAYER.trashCapacity
          ? { text: `Çöpü topla (${this.trashBag}/${PLAYER.trashCapacity})`, key: 'E', ok: true }
          : { text: 'Çöp poşeti dolu — kovaya boşalt', ok: false };
      case 'bin':
        return this.trashBag ? { text: `Çöpleri kovaya at (${this.trashBag})`, key: 'E', ok: true } : { text: 'Çöp kovası', ok: false };
    }
    return null;
  }

  // ------------------------------------------------------------------ eylemler
  primary() {
    this.update(); // düşük FPS'te bile tuşa basıldığı andaki hedef kullanılır
    const t = this.target?.data;
    if (!t) return false;
    switch (t.kind) {
      case 'discBox':
        if (!this.held) return this.pickUp(t.gameId);
        if (this.inventory.get(t.gameId).location === 'rack') return this.returnToRack();
        return false;
      case 'rack': return this.held ? this.returnToRack() : false;
      case 'console': {
        const st = t.station;
        if (this.held && !st.loadedGame) return this.insert(st);
        if (!this.held && st.loadedGame) return this.eject(st);
        this.bus.emit('sfx', 'deny');
        return false;
      }
      case 'customer': {
        const p = t.party;
        if (this.manager.canTalk(p)) { this.dialog.open(p); return true; }
        if (p.state === 'REQUEST') { p.members[0].say(`Abi ${p.game.short} dedik ya!`, 'normal', 2.5); return true; }
        return false;
      }
      case 'trash': return this.collectTrash(this.target.object, t.station);
      case 'bin': return this.emptyBag();
    }
    return false;
  }

  pickUp(gameId) {
    const d = this.inventory.get(gameId);
    if (this.held || !d) return false;
    const m = d.mesh;
    this.camera.add(m);
    m.position.copy(HOLD_OFFSET);
    m.rotation.copy(HOLD_ROT);
    m.castShadow = false;
    this.held = gameId;
    this.inventory.setLocation(gameId, 'hand');
    this.bus.emit('sfx', 'pick');
    return true;
  }

  #placeInWorld(gameId, pos, rot) {
    const m = this.inventory.get(gameId).mesh;
    this.scene.add(m);
    m.position.copy(pos);
    m.rotation.copy(rot);
    m.castShadow = true;
  }

  returnToRack() {
    if (!this.held) return false;
    const slot = this.world.slots.get(this.held);
    this.#placeInWorld(this.held, slot.pos, new THREE.Euler(0, slot.rotY, 0));
    this.inventory.setLocation(this.held, 'rack');
    this.held = null;
    this.bus.emit('sfx', 'place');
    return true;
  }

  insert(station) {
    const gameId = this.held;
    // Kutu konsolun yanına yatık konur; disk konsolda
    this.#placeInWorld(gameId, station.caseSlot, new THREE.Euler(-Math.PI / 2, 0, 0.3));
    this.inventory.setLocation(gameId, `console:${station.id}`);
    this.held = null;
    station.setLoaded(gameId);
    this.bus.emit('sfx', 'disc');
    this.manager.onDiscInserted(station, gameId);
    return true;
  }

  eject(station) {
    const gameId = station.loadedGame;
    station.setLoaded(null);
    this.pickUp(gameId);
    this.bus.emit('sfx', 'eject');
    this.manager.onDiscEjected(station);
    return true;
  }

  /** Q: elindeki kutuyu baktığın yüzeye (tezgah, sehpa, zemin) bırak. */
  drop() {
    if (!this.held) return false;
    this.raycaster.setFromCamera(this._center, this.camera);
    this.raycaster.far = PLAYER.reach + 0.5;
    const hit = this.raycaster.intersectObjects(this.world.surfaces, false)[0];
    this.raycaster.far = PLAYER.reach;
    let pos;
    const flatTop = hit && (hit.object.name === 'floor' || (hit.face && hit.face.normal.y > 0.5));
    if (flatTop) {
      pos = hit.point.clone();
    } else {
      const dir = new THREE.Vector3(); this.camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
      pos = this.player.position.clone().addScaledVector(dir, 0.6);
      pos.y = 0;
    }
    pos.y += 0.012;
    this.#placeInWorld(this.held, pos, new THREE.Euler(-Math.PI / 2, 0, this.player.yaw + Math.random() * 0.4));
    this.inventory.setLocation(this.held, 'world');
    this.held = null;
    this.bus.emit('sfx', 'place');
    return true;
  }

  collectTrash(mesh, station) {
    if (this.trashBag >= PLAYER.trashCapacity) { this.bus.emit('sfx', 'deny'); return false; }
    this.scene.remove(mesh);
    mesh.geometry.dispose(); mesh.material.dispose();
    station.trash = station.trash.filter((t) => t !== mesh);
    this.trashBag++;
    this.bus.emit('sfx', 'trash');
    if (station.isClean) this.bus.emit('toast', { text: `Masa ${station.id} temizlendi`, tone: 'good' });
    return true;
  }

  emptyBag() {
    if (!this.trashBag) return false;
    this.trashBag = 0;
    this.bus.emit('sfx', 'bin');
    return true;
  }
}
