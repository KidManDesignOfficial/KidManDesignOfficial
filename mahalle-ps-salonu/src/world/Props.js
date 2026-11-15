import * as THREE from 'three';
import { coverTexture } from './Textures.js';

const coverCache = new Map();

/** Oyun kutusu (kutu + disk). Etkileşim: kind 'discBox'. */
export function createDiscBox(game) {
  if (!coverCache.has(game.id)) coverCache.set(game.id, coverTexture(game));
  const side = new THREE.MeshStandardMaterial({ color: '#1b1b1f', roughness: 0.4 });
  const spine = new THREE.MeshStandardMaterial({ color: game.color, roughness: 0.5 });
  const cover = new THREE.MeshStandardMaterial({ map: coverCache.get(game.id), roughness: 0.35 });
  const back = new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: 0.5 });
  // Malzeme sırası: +x, -x, +y, -y, +z(kapak), -z
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.21, 0.022), [spine, spine, side, side, cover, back]);
  mesh.castShadow = true;
  mesh.name = `disc-${game.id}`;
  mesh.userData.interact = { kind: 'discBox', gameId: game.id };
  return mesh;
}

const TRASH_TYPES = [
  () => new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 14), new THREE.MeshStandardMaterial({ color: '#e03131', roughness: 0.3, metalness: 0.6 })),
  () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.13), new THREE.MeshStandardMaterial({ color: '#fcc419', roughness: 0.6 })); m.rotation.y = Math.random() * 3; return m; },
  () => new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.1, 12), new THREE.MeshStandardMaterial({ color: '#f8f9fa', roughness: 0.8 })),
  () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.09), new THREE.MeshStandardMaterial({ color: '#c08457', roughness: 0.9 })); m.rotation.y = Math.random() * 3; return m; },
];

/** Çöp: boş kutu, kola kutusu, cips paketi, bardak. Etkileşim: kind 'trash'. */
export function createTrash(station) {
  const make = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
  const mesh = make();
  mesh.geometry.computeBoundingBox();
  const halfH = (mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y) / 2;
  mesh.position.set(station.x + (Math.random() - 0.5) * 1.0, station.tableTopY + halfH, -3.75 + (Math.random() - 0.5) * 0.35);
  // Kola kutularının bazıları devrik
  if (Math.random() < 0.3 && mesh.geometry.type === 'CylinderGeometry') { mesh.rotation.z = Math.PI / 2; mesh.position.y = station.tableTopY + 0.035; }
  mesh.castShadow = true;
  mesh.userData.interact = { kind: 'trash', station };
  return mesh;
}
