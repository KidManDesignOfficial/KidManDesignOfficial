import * as THREE from 'three';

/**
 * Saat → ışık eşlemesi (GDD §1, §4). Dış dünya yalnızca vitrinden
 * vuran gün ışığı ve gece sokak lambasıyla hissedilir.
 * Anahtar kareler saat (10..26) cinsinden; aralar doğrusal karıştırılır.
 */
const KEYS = [
  { h: 10,   sky: '#cfe6ff', street: '#ffffff', sun: 1.5, sunColor: '#fff4e0', hemi: 0.55, lamps: 0.55, lamp: 0 },
  { h: 13,   sky: '#bfe3ff', street: '#ffffff', sun: 2.4, sunColor: '#fff8ea', hemi: 0.75, lamps: 0.8,  lamp: 0 },
  { h: 17,   sky: '#ffd8a8', street: '#ffe2c2', sun: 2.0, sunColor: '#ffd39a', hemi: 0.7,  lamps: 1.0,  lamp: 0 },
  { h: 19,   sky: '#ff9966', street: '#e09a7a', sun: 0.9, sunColor: '#ff9b5e', hemi: 0.55, lamps: 1.0,  lamp: 0.2 },
  { h: 20.5, sky: '#3b4a7a', street: '#5d6290', sun: 0.0, sunColor: '#8899ff', hemi: 0.3,  lamps: 0.85, lamp: 1 },
  { h: 26,   sky: '#0e1430', street: '#2c3060', sun: 0.0, sunColor: '#8899ff', hemi: 0.18, lamps: 0.6,  lamp: 1 },
];

const ca = new THREE.Color(), cb = new THREE.Color();
const mixColor = (a, b, t, out) => out.copy(ca.set(a)).lerp(cb.set(b), t);

export class DayNightLighting {
  constructor(lights) { this.l = lights; }

  apply(minutes) {
    const h = minutes / 60;
    let i = KEYS.findIndex((k) => k.h > h);
    if (i <= 0) i = i === 0 ? 1 : KEYS.length - 1;
    const a = KEYS[i - 1], b = KEYS[i];
    const t = THREE.MathUtils.clamp((h - a.h) / (b.h - a.h), 0, 1);
    const lerp = (k) => a[k] + (b[k] - a[k]) * t;
    const { hemi, sun, streetLamp, lampLights, skyMat, streetMat } = this.l;

    mixColor(a.sky, b.sky, t, skyMat.color);
    mixColor(a.street, b.street, t, streetMat.color);
    sun.intensity = lerp('sun');
    mixColor(a.sunColor, b.sunColor, t, sun.color);
    sun.visible = sun.intensity > 0.01;
    // Güneş gün içinde vitrin boyunca kayar
    sun.position.x = -3 + (h - 10) * 0.9;
    hemi.intensity = lerp('hemi');
    streetLamp.intensity = lerp('lamp') * 30;
    const lamps = lerp('lamps');
    for (const { light } of lampLights) light.intensity = 6 * lamps;
  }
}
