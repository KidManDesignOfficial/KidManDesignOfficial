import * as THREE from 'three';

/** Prosedürel (canvas) doku yardımcıları — harici görsel dosyası gerektirmez. */
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Oyun kutusu kapağı. */
export function coverTexture(game) {
  return canvasTexture(256, 340, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, game.color);
    g.addColorStop(1, shade(game.color, -0.35));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // üst şerit
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, 38);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PS', w / 2, 27);
    // ikonik şekil
    ctx.globalAlpha = 0.35; ctx.fillStyle = game.accent;
    ctx.beginPath(); ctx.arc(w / 2, h * 0.5, 70, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    // başlık
    ctx.fillStyle = game.accent; ctx.font = 'bold 30px sans-serif';
    wrapText(ctx, game.title, w / 2, h * 0.78, w - 24, 34);
    ctx.font = '18px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(game.genre, w / 2, h - 16);
  });
}

/** Sıcak tonlu karo zemin. */
export function floorTexture() {
  const tex = canvasTexture(512, 512, (ctx, w, h) => {
    const n = 8, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#c98f5a' : '#e8c28d';
      ctx.fillRect(i * s, j * s, s, s);
      // hafif kir/leke — el yapımı his
      ctx.fillStyle = `rgba(80,40,10,${Math.random() * 0.06})`;
      ctx.beginPath(); ctx.arc(i * s + Math.random() * s, j * s + Math.random() * s, 6 + Math.random() * 18, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(90,50,20,.35)'; ctx.lineWidth = 3;
    for (let i = 0; i <= n; i++) { ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke(); }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2.5);
  return tex;
}

/** Duvar: üstte boya, altta lambri. */
export function wallTexture(top = '#f3d9b1', bottom = '#8a5a3b') {
  const tex = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = top; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(120,80,40,${Math.random() * 0.04})`; ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    ctx.fillStyle = bottom; ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    for (let x = 0; x < w; x += 32) ctx.fillRect(x, h * 0.68, 3, h * 0.32);
    ctx.fillStyle = '#5c3a24'; ctx.fillRect(0, h * 0.66, w, 8);
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Duvar posteri / tabela. */
export function signTexture(lines, { bg = '#222', fg = '#fff', w = 512, h = 256, font = 'bold 56px sans-serif', border } = {}) {
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 12; ctx.strokeRect(6, 6, w - 12, h - 12); }
    ctx.fillStyle = fg; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = h / (lines.length + 1);
    lines.forEach((l, i) => ctx.fillText(l, w / 2, lh * (i + 1)));
  });
}

/** Konuşma balonu dokusu (sprite için). Canvas'ı yeniden çizilebilir döndürür. */
export function drawBubble(ctx, w, h, text, tone = 'normal') {
  ctx.clearRect(0, 0, w, h);
  const colors = { normal: ['#fffdf5', '#2b2118'], angry: ['#ffe3e3', '#a61e1e'], happy: ['#ebfbee', '#1b5e20'] }[tone] || ['#fff', '#000'];
  ctx.fillStyle = colors[0];
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 6;
  roundRect(ctx, 6, 6, w - 12, h - 40, 34); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w / 2 - 22, h - 36); ctx.lineTo(w / 2, h - 6); ctx.lineTo(w / 2 + 22, h - 36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = colors[1]; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  wrapText(ctx, text, w / 2, (h - 34) / 2 - 18, w - 50, 40);
}

export function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const t = line ? line + ' ' + word : word;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = word; } else line = t;
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lh));
}

export function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amt)));
  return '#' + c.getHexString();
}
