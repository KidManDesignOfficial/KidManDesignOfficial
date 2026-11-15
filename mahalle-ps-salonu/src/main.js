import * as THREE from 'three';
import { LAYOUT } from './config.js';
import { EventBus } from './core/EventBus.js';
import { GameClock } from './systems/GameClock.js';
import { Economy } from './systems/Economy.js';
import { Inventory } from './systems/Inventory.js';
import { CustomerManager } from './systems/CustomerManager.js';
import { buildShop } from './world/ShopBuilder.js';
import { DayNightLighting } from './world/DayNightLighting.js';
import { PlayerController } from './player/PlayerController.js';
import { Interaction } from './player/Interaction.js';
import { HUD, DialogUI, showSummary } from './ui/HUD.js';
import { Sfx } from './audio/Sfx.js';

// ---------------------------------------------------------------- render
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#1a1410');
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 60);
scene.add(camera); // elde tutulan nesneler kameranın çocuğu olarak çizilir

// ---------------------------------------------------------------- modüller
const bus = new EventBus();
const clock = new GameClock(bus);
const economy = new Economy(bus);
if (economy.savedDay) clock.day = economy.savedDay;
const inventory = new Inventory(bus);
const world = buildShop(scene, inventory);
const lighting = new DayNightLighting(world.lights);
const manager = new CustomerManager({ scene, bus, clock, economy, inventory, stations: world.stations, doorPivot: world.doorPivot });
const player = new PlayerController(camera, renderer.domElement, world.colliders);
player.spawn(LAYOUT.playerSpawn);
const dialog = new DialogUI(bus, manager, player);
const interaction = new Interaction({ camera, scene, bus, inventory, manager, world, player, dialog });
const hud = new HUD(bus);
const sfx = new Sfx(bus);

// ---------------------------------------------------------------- oyun durumu
const params = new URLSearchParams(location.search);
let simSpeed = Math.max(0.25, Math.min(20, Number(params.get('hiz')) || 1));
let state = 'menu'; // menu | running | paused | summary
let closing = false;
const $ = (id) => document.getElementById(id);

function start() {
  sfx.unlock();
  $('start').classList.remove('open');
  $('pause').classList.remove('open');
  state = 'running';
  player.lock();
}
$('start-btn').addEventListener('click', start);
$('pause').addEventListener('click', start);
$('reset-btn')?.addEventListener('click', () => { Economy.clearSave(); location.reload(); });
renderer.domElement.addEventListener('click', () => { if (state === 'running' && !player.locked) player.lock(); });

let wasLocked = false;
document.addEventListener('pointerlockchange', () => {
  const locked = player.locked;
  if (!locked && wasLocked && state === 'running') { state = 'paused'; $('pause').classList.add('open'); }
  wasLocked = locked;
});

addEventListener('keydown', (e) => {
  if (state !== 'running') return;
  if (e.code === 'KeyE') interaction.primary();
  if (e.code === 'KeyQ') interaction.drop();
});

bus.on('clock:close', () => {
  closing = true;
  bus.emit('sfx', 'shutter');
  bus.emit('toast', { text: 'Saat 02:00 — kepenk iniyor, son müşteriler hesabı ödüyor', tone: 'info' });
});
bus.on('clock:phase', ({ phase }) => {
  const label = clock.phase?.label;
  if (label) bus.emit('toast', { text: label, tone: 'info' });
  if (phase === 'SABAH') bus.emit('toast', { text: 'Dükkan açıldı — dünden kalan çöpleri unutma', tone: 'info' });
});

function endDay() {
  closing = false;
  state = 'summary';
  if (document.pointerLockElement) document.exitPointerLock();
  // Raf dışında unutulan kutular uyarısı (GDD §2.2)
  const lost = inventory.misplaced().length;
  if (lost) hud.toast(`${lost} oyun kutusu rafın dışında unutuldu`, 'warn');
  const report = economy.closeDay(clock.day);
  showSummary(report, () => {
    clock.nextDay();
    manager.spawnTimer = 6;
    start();
  });
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- döngü
const timer = new THREE.Clock();
function frame() {
  const dt = Math.min(timer.getDelta(), 0.05);
  if (state === 'running') {
    const sdt = dt * simSpeed;
    clock.update(sdt);
    manager.update(sdt);
    player.update(dt);
    dialog.update();
    if (closing && manager.isEmpty) endDay();
  }
  for (const st of world.stations) st.update(dt);
  lighting.apply(clock.minutes);
  const prompt = state === 'running' ? interaction.update() : null;
  hud.update({ clock, economy, stations: world.stations, manager, interaction, inventory, prompt });
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
lighting.apply(clock.minutes);
requestAnimationFrame(frame);

// ---------------------------------------------------------------- debug/test API
window.__game = {
  THREE, scene, camera, renderer, bus, clock, economy, inventory, world, manager, player, interaction, dialog,
  get state() { return state; },
  start,
  setSpeed(v) { simSpeed = v; },
};
