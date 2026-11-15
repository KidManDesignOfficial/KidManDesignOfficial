import * as THREE from 'three';
import { PROFILES, SPAWN, LAYOUT } from '../config.js';
import { Customer } from '../entities/Customer.js';
import { createTrash } from '../world/Props.js';

/**
 * Müşteri yapay zekası (GDD Geliştirme Notları: State Machine).
 *
 *   ENTERING → QUEUE ──(diyalog: masa ata)──→ TO_TABLE → REQUEST ──(doğru disk)──→ LOADING → PLAYING → LEAVING → GONE
 *                 │  ├─(bekleyin)→ QUEUE              │ └─(yanlış disk: ruh hali↓)→ REQUEST
 *                 │  └─(yer yok)→ LEAVING              └─(sabır biter)→ LEAVING (öfkeli)
 *                 └─(sabır biter)→ LEAVING (öfkeli)
 *
 * Grup (Party) = 1–2 kişi; lider konuşur, tüm grup aynı masayı kullanır.
 */
export const S = {
  ENTERING: 'ENTERING', QUEUE: 'QUEUE', TO_TABLE: 'TO_TABLE', REQUEST: 'REQUEST',
  LOADING: 'LOADING', PLAYING: 'PLAYING', LEAVING: 'LEAVING', GONE: 'GONE',
};

const N = LAYOUT.nodes;
const LANE_Z = 4.55;
const DOOR_POS = new THREE.Vector3(LAYOUT.door.x, 0, LAYOUT.room.maxZ);
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const randRange = ([a, b]) => a + Math.random() * (b - a);
let partySeq = 0;

export class CustomerManager {
  constructor({ scene, bus, clock, economy, inventory, stations, doorPivot }) {
    Object.assign(this, { scene, bus, clock, economy, inventory, stations, doorPivot });
    this.parties = [];
    this.queue = [];             // sıradaki gruplar (index 0 = tezgah önü)
    this.dialogParty = null;     // diyalog açıkken o grubun sabrı durur
    this.spawnTimer = SPAWN.firstArrivalDelay;
    this.doorAngle = 0;

    bus.on('clock:close', () => this.#closeShop());
  }

  // ------------------------------------------------------------------ spawn
  update(dt) {
    if (this.clock.acceptingCustomers) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const mean = SPAWN.meanIntervalByPhase[this.clock.phaseId] ?? 30;
        this.spawnTimer = mean * (0.5 + Math.random());
        if (this.queue.length < SPAWN.maxQueue) this.spawnParty();
      }
    }

    for (const p of this.parties) this.#updateParty(p, dt);
    for (const p of this.parties) for (const m of p.members) m.update(dt);
    this.parties = this.parties.filter((p) => p.state !== S.GONE);
    this.#updateDoor(dt);
    this.#updateStationsIdle(dt);
  }

  get isEmpty() { return this.parties.length === 0; }

  spawnParty(profileId) {
    const profile = profileId ? PROFILES.find((p) => p.id === profileId) : this.#pickProfile();
    const size = randInt(profile.groupSize[0], profile.groupSize[1]);
    const party = {
      id: ++partySeq, profile, state: S.ENTERING, members: [],
      patience: 1, mood: 0.8, station: null, game: null,
      playTarget: randRange(profile.playMinutes), played: 0,
      waitAsked: false, seatedCount: 0, loadTimer: 0,
    };
    for (let i = 0; i < size; i++) {
      const c = new Customer(profile, this.scene);
      c.teleport({ x: N.outside.x + i * 0.4, z: N.outside.z + i * 0.3 });
      c.setInteract({ kind: 'customer', party });
      party.members.push(c);
    }
    this.parties.push(party);
    this.queue.push(party);
    this.#walkToQueueSlot(party, true);
    this.bus.emit('sfx', 'bell');
    return party;
  }

  #pickProfile() {
    const phase = this.clock.phaseId;
    const total = PROFILES.reduce((s, p) => s + (p.weights[phase] || 0), 0);
    let r = Math.random() * total;
    for (const p of PROFILES) { r -= p.weights[phase] || 0; if (r <= 0) return p; }
    return PROFILES[0];
  }

  // ------------------------------------------------------------------ kuyruk
  #slotFor(party) {
    const idx = this.queue.indexOf(party);
    return LAYOUT.queueSlots[Math.min(idx, LAYOUT.queueSlots.length - 1)];
  }

  #walkToQueueSlot(party, fromDoor) {
    const slot = this.#slotFor(party);
    party.members.forEach((m, i) => {
      const target = { x: slot.x + i * 0.45, z: slot.z + i * 0.08 };
      const pts = fromDoor
        ? [N.doorIn, { x: target.x, z: LANE_Z }, target]
        : [target];
      m.walk(pts, () => {
        m.faceYaw = Math.PI; // tezgaha (−z) bak
        if (i === 0) this.#arrivedAtQueue(party);
      }, i * 0.45);
    });
  }

  #arrivedAtQueue(party) {
    if (party.state !== S.ENTERING && party.state !== S.QUEUE) return;
    // Yürürken sıra değiştiyse doğru slota yeniden yönlen
    const slot = this.#slotFor(party);
    if (Math.hypot(party.members[0].position.x - slot.x, party.members[0].position.z - slot.z) > 0.15) {
      party.state = S.QUEUE;
      this.#walkToQueueSlot(party, false);
      return;
    }
    party.state = S.QUEUE;
    if (party.state === S.QUEUE && this.queue[0] === party && !party.introduced) {
      party.introduced = true;
      party.members[0].say(party.profile.intro(party.members.length), 'normal', Infinity);
      this.bus.emit('toast', { text: `${party.profile.label} tezgahta bekliyor`, tone: 'info' });
    }
  }

  #removeFromQueue(party) {
    const i = this.queue.indexOf(party);
    if (i === -1) return;
    this.queue.splice(i, 1);
    // Arkadakiler bir slot öne geçer
    for (const p of this.queue) if (p.state === S.QUEUE || p.state === S.ENTERING) this.#advance(p);
  }

  #advance(party) {
    if (party.state === S.ENTERING) return; // hâlâ kapıdan geliyor; varışta doğru slota yönlenir
    this.#walkToQueueSlot(party, false);
  }

  // ------------------------------------------------------------- diyalog
  /** Tezgah diyaloğu: dinamik seçenek listesi (GDD §2.1). */
  dialogOptions(party) {
    const opts = this.stations.map((st) => {
      const why = !st.isFree ? 'dolu' : !st.isClean ? 'kirli' : null;
      return {
        label: `Masa ${st.id}'e geçin${why ? ` (${why})` : ''}`,
        enabled: !why, action: () => this.assign(party, st),
      };
    });
    opts.push({ label: 'Biraz bekleyin, birazdan boşalır', enabled: !party.waitAsked, action: () => this.askWait(party) });
    opts.push({ label: 'Kusura bakma, yer yok', enabled: true, action: () => this.refuse(party) });
    return opts;
  }

  canTalk(party) { return party.state === S.QUEUE && this.queue[0] === party; }

  assign(party, station) {
    if (!station.available || !this.canTalk(party)) return false;
    party.station = station;
    station.party = party;
    party.state = S.TO_TABLE;
    party.members[0].say(`Eyvallah abi, Masa ${station.id}!`, 'happy', 2);
    party.members.forEach((m) => m.setPatience(null));
    this.#removeFromQueue(party);

    party.seatedCount = 0;
    party.members.forEach((m, i) => {
      const pts = [{ x: 0.0, z: 3.5 }, N.aisle, ...station.approach, station.seatFront[i], station.seats[i]];
      m.walk(pts, () => {
        m.sit(station.seats[i], Math.PI);
        if (++party.seatedCount === party.members.length) this.#seated(party);
      }, i * 0.6);
    });
    this.bus.emit('sfx', 'click');
    return true;
  }

  askWait(party) {
    party.waitAsked = true;
    party.patience = Math.min(1, party.patience + 0.45);
    party.members[0].say('Tamam abi, bekliyoruz ama çok sürmesin.', 'normal', 3);
  }

  refuse(party) {
    party.members[0].say('Peki abi, başka zaman.', 'normal', 2.5);
    this.#leave(party, 'neutral');
  }

  // ------------------------------------------------------------- masa/disk
  #seated(party) {
    const likes = party.profile.likes;
    party.game = this.inventory.game(likes[Math.floor(Math.random() * likes.length)]);
    party.state = S.REQUEST;
    party.patience = 1;
    if (party.station.loadedGame === party.game.id) {
      party.members[0].say(`Ooo ${party.game.short} zaten takılı, süpersin abi!`, 'happy', 3);
      party.mood = Math.min(1, party.mood + 0.1);
      this.#startLoading(party);
    } else {
      party.station.setScreen('waiting', party.game);
      party.members[0].say(`${party.game.short} açar mısın abi?`, 'normal', Infinity);
      this.bus.emit('toast', { text: `Masa ${party.station.id}: ${party.game.short} istiyor`, tone: 'info' });
    }
  }

  /** Interaction modülü konsola disk takınca çağırır. */
  onDiscInserted(station, gameId) {
    const party = station.party;
    const game = this.inventory.game(gameId);
    if (!party || party.state !== S.REQUEST) {
      station.setScreen('loading', game);
      station._idleBootTimer = 1.2;
      return;
    }
    if (gameId === party.game.id) {
      party.members[0].say('İşte bu!', 'happy', 2);
      this.#startLoading(party);
    } else {
      party.mood = Math.max(0, party.mood - 0.25);
      party.patience = Math.max(0, party.patience - 0.15);
      station.setScreen('wrong', game);
      party.members[0].say(`Abi bu ${game.short}! Biz ${party.game.short} istedik.`, 'angry', Infinity);
      this.bus.emit('sfx', 'buzz');
      this.bus.emit('toast', { text: `Yanlış oyun! Masa ${station.id} ${party.game.short} istiyor`, tone: 'bad' });
    }
  }

  /** Interaction modülü diski çıkarınca çağırır. */
  onDiscEjected(station) {
    const party = station.party;
    if (!party) { station.setScreen('off'); return; }
    if (party.state === S.PLAYING || party.state === S.LOADING) {
      party.mood = Math.max(0, party.mood - 0.4);
      party.state = S.REQUEST;
      party.patience = Math.max(party.patience, 0.6);
      party.members[0].say('Abi oyunun ortasında ne yapıyorsun?!', 'angry', 3);
      this.bus.emit('sfx', 'buzz');
    } else if (party.state === S.REQUEST) {
      party.members[0].say(`${party.game.short} açar mısın abi?`, 'normal', Infinity);
    }
    station.setScreen('waiting', party.game);
  }

  #startLoading(party) {
    party.state = S.LOADING;
    party.loadTimer = 1.6;
    party.station.setScreen('loading', party.game);
    party.members.forEach((m) => m.setPatience(null));
  }

  // ------------------------------------------------------------- ayrılış
  #finishPlaying(party) {
    const { fee, tip } = this.economy.chargeSession({ minutesPlayed: party.played, mood: party.mood, tipMult: party.profile.tipMult });
    const repGain = party.mood > 0.6 ? (party.profile.id === 'vip' ? 2 : 1) : 0;
    if (repGain) this.economy.addReputation(repGain);
    party.members[0].say(tip ? `Eyvallah abi! Üstü kalsın.` : 'Eyvallah abi, kolay gelsin.', 'happy', 3);
    this.bus.emit('sfx', 'coin');
    this.bus.emit('toast', { text: `Masa ${party.station.id}: +₺${fee}${tip ? ` (+₺${tip} bahşiş)` : ''}`, tone: 'good' });
    this.#spawnTrash(party.station, randInt(2, 3));
    this.#leave(party, 'paid');
  }

  #spawnTrash(station, n) {
    for (let i = 0; i < n; i++) {
      const t = createTrash(station);
      this.scene.add(t);
      station.trash.push(t);
    }
  }

  #leave(party, reason) {
    if (party.state === S.LEAVING || party.state === S.GONE) return;
    const prev = party.state;
    party.state = S.LEAVING;
    party.leaveReason = reason;
    if (this.dialogParty === party) this.dialogParty = null;
    this.#removeFromQueue(party);
    party.members.forEach((m) => { m.setPatience(null); m.setInteract(null); m.faceYaw = null; });

    if (reason === 'angry') {
      this.economy.addReputation(-2, 'lost');
      this.bus.emit('toast', { text: `${party.profile.label} sinirlenip gitti (itibar −2)`, tone: 'bad' });
    }

    const st = party.station;
    let done = 0;
    const exit = [{ x: 2.6, z: 3.0 }, N.doorIn, N.outside];
    party.members.forEach((m, i) => {
      let pts;
      if (st && prev !== S.TO_TABLE) {
        pts = [st.seatFront[i], ...[...st.approach].reverse(), N.aisle, ...exit];
      } else if (st) {
        pts = [N.aisle, ...exit];
      } else {
        pts = [{ x: m.position.x, z: LANE_Z }, N.doorIn, N.outside];
      }
      m.walk(pts, () => {
        if (++done === party.members.length) {
          party.state = S.GONE;
          party.members.forEach((c) => c.dispose());
        }
      }, i * 0.5);
    });
    if (st) {
      st.party = null;
      st.setScreen('off');
      party.station = null;
    }
  }

  #closeShop() {
    for (const p of [...this.parties]) {
      if (p.state === S.PLAYING) this.#finishPlaying(p);
      else if (p.state !== S.LEAVING && p.state !== S.GONE) {
        p.members[0].say('Kapanıyormuşuz, iyi geceler abi.', 'normal', 2.5);
        this.#leave(p, 'neutral');
      }
    }
  }

  // ------------------------------------------------------------- tick
  #updateParty(p, dt) {
    switch (p.state) {
      case S.QUEUE: {
        if (this.dialogParty === p) break;
        p.patience -= dt / p.profile.patienceCounter;
        p.members[0].setPatience(p.patience);
        if (p.patience <= 0) { p.members[0].say('Ya yeter, gidiyoruz!', 'angry', 3); this.#leave(p, 'angry'); this.bus.emit('sfx', 'buzz'); }
        break;
      }
      case S.REQUEST: {
        p.patience -= dt / p.profile.patienceGame;
        p.members[0].setPatience(p.patience);
        if (p.patience < 0.3) p.mood = Math.max(0, p.mood - dt * 0.02);
        if (p.patience <= 0) { p.members[0].say('Burası olmuyor abi, kalkıyoruz!', 'angry', 3); this.#leave(p, 'angry'); this.bus.emit('sfx', 'buzz'); }
        break;
      }
      case S.LOADING: {
        p.loadTimer -= dt;
        if (p.loadTimer <= 0) {
          p.state = S.PLAYING;
          p.station.setScreen('playing', p.game);
          p.members[0].hideBubble();
          this.bus.emit('sfx', 'boot');
        }
        break;
      }
      case S.PLAYING: {
        p.played += this.clock.gameMinutes(dt);
        if (p.played >= p.playTarget) this.#finishPlaying(p);
        break;
      }
    }
  }

  /** Kapı: yakında müşteri varsa açılır; açılış anında zil çalar. */
  #updateDoor(dt) {
    let near = false;
    for (const p of this.parties) for (const m of p.members) {
      if (Math.hypot(m.position.x - DOOR_POS.x, m.position.z - DOOR_POS.z) < 1.4) near = true;
    }
    const target = near ? 1.35 : 0;
    this.doorAngle += (target - this.doorAngle) * Math.min(1, dt * 6);
    this.doorPivot.rotation.y = this.doorAngle;
  }

  /** Masaların boşta yüklenen diskleri için ekran sıfırlama. */
  #updateStationsIdle(dt) {
    for (const st of this.stations) {
      if (st._idleBootTimer > 0) {
        st._idleBootTimer -= dt;
        if (st._idleBootTimer <= 0 && !st.party) st.setScreen('off');
      }
    }
  }

  /** HUD için masa durum özeti. */
  stationStatus(st) {
    const p = st.party;
    if (!p) return { text: st.isClean ? 'Boş' : `Kirli (${st.trash.length} çöp)`, tone: st.isClean ? 'idle' : 'warn' };
    switch (p.state) {
      case S.TO_TABLE: return { text: 'Oturuyorlar…', tone: 'idle' };
      case S.REQUEST: return { text: `${p.game.short} bekleniyor`, tone: 'warn', patience: p.patience };
      case S.LOADING: return { text: 'Yükleniyor…', tone: 'idle' };
      case S.PLAYING: return { text: `${p.game.short} oynanıyor`, tone: 'good', progress: p.played / p.playTarget };
      default: return { text: '—', tone: 'idle' };
    }
  }
}

