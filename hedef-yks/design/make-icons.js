// Kullanım (proje kökünden): node design/make-icons.js assets
// Playwright (Chromium) ile SVG çizimini tüm simge boyutlarına çevirir.
// Hedef YKS simgesi: hedef tahtası + yükselen ok (başarıya giden yol).
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || 'assets';

function mark(color, accent) {
  return `
  <circle cx="512" cy="540" r="250" fill="none" stroke="${color}" stroke-width="44"/>
  <circle cx="512" cy="540" r="150" fill="none" stroke="${color}" stroke-width="40" opacity="0.85"/>
  <circle cx="512" cy="540" r="58" fill="${accent}"/>
  <path d="M512 540 L760 292" stroke="${color}" stroke-width="40" stroke-linecap="round"/>
  <path d="M700 250 L800 250 L800 350 Z" fill="${color}" stroke="${color}" stroke-width="22" stroke-linejoin="round"/>`;
}

const BG = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#7B6CFF"/><stop offset="1" stop-color="#3A2BC9"/></linearGradient>
  <radialGradient id="glow" cx="0.25" cy="0.15" r="0.9"><stop offset="0" stop-color="rgba(255,255,255,0.22)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#glow)"/>`;

const svg = (body, size, scale = 1) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">${body.bg ?? ''}
   <g transform="translate(512 512) scale(${scale}) translate(-512 -530)">${body.mark ?? ''}</g></svg>`;

const files = [
  { name: 'icon.png', size: 1024, svg: svg({ bg: BG, mark: mark('#FFFFFF', '#FFB547') }, 1024, 0.9) },
  { name: 'android-icon-background.png', size: 1024, svg: svg({ bg: BG }, 1024) },
  { name: 'android-icon-foreground.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF', '#FFB547') }, 1024, 0.62) },
  { name: 'android-icon-monochrome.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF', '#FFFFFF') }, 1024, 0.62) },
  { name: 'splash-icon.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF', '#FFB547') }, 1024, 0.9) },
  { name: 'favicon.png', size: 48, svg: svg({ bg: BG, mark: mark('#FFFFFF', '#FFB547') }, 48, 0.9) },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const f of files) {
    await page.setViewportSize({ width: f.size, height: f.size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${f.svg}</body></html>`);
    await page.screenshot({ path: path.join(out, f.name), omitBackground: !!f.transparent, clip: { x: 0, y: 0, width: f.size, height: f.size } });
    console.log('✓', f.name);
  }
  await browser.close();
})();
