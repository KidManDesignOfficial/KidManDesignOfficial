// Kullanım (proje kökünden): node design/make-icons.js assets
// Playwright (Chromium) ile SVG çizimini tüm simge boyutlarına çevirir; ardından PNG sıkıştırması önerilir.
// Rize Haber simgesi: "iki yaprak bir tomurcuk" + Karadeniz dalgaları.
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2];

// İşaret (mark) 1024'lük koordinatta, merkez (512, 512) çevresinde ~600px alana çizilir.
function mark(color, waveOpacity = 0.55) {
  const leaf = 'M0,-150 C88,-104 100,46 0,150 C-100,46 -88,-104 0,-150 Z';
  const vein = (len) => `M0,${-len} Q6,0 0,${len}`;
  return `
  <g fill="${color}" stroke="none">
    <!-- tomurcuk (ortada, dik) -->
    <g transform="translate(512 300) scale(0.58 0.78)"><path d="${leaf}"/></g>
    <!-- sol yaprak -->
    <g transform="translate(408 452) rotate(-42) scale(0.86)"><path d="${leaf}"/></g>
    <!-- sağ yaprak -->
    <g transform="translate(616 452) rotate(42) scale(0.86)"><path d="${leaf}"/></g>
  </g>
  <g fill="none" stroke-linecap="round" stroke="rgba(0,0,0,0.0)">
  </g>
  <!-- yaprak damarları: zemin rengiyle oyulur -->
  <g fill="none" stroke="var(--cut)" stroke-width="10" stroke-linecap="round">
    <g transform="translate(408 452) rotate(-42) scale(0.86)"><path d="${vein(120)}"/></g>
    <g transform="translate(616 452) rotate(42) scale(0.86)"><path d="${vein(120)}"/></g>
    <g transform="translate(512 300) scale(0.58 0.78)"><path d="${vein(110)}" stroke-width="12"/></g>
  </g>
  <!-- sap -->
  <path d="M512 410 L512 600" stroke="${color}" stroke-width="22" stroke-linecap="round" fill="none"/>
  <!-- Karadeniz dalgaları -->
  <path d="M262 680 q62 -46 125 0 t125 0 t125 0 t125 0" stroke="${color}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M322 760 q48 -36 95 0 t95 0 t95 0 t95 0" stroke="${color}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${waveOpacity}"/>`;
}

const BG = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#23854A"/><stop offset="1" stop-color="#0E4D2A"/></linearGradient>
  <radialGradient id="glow" cx="0.3" cy="0.2" r="0.8"><stop offset="0" stop-color="rgba(255,255,255,0.18)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#glow)"/>`;

const svg = (body, cut, size = 1024, scale = 1) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" style="--cut:${cut}">
   ${body.bg ?? ''}<g transform="translate(512 512) scale(${scale}) translate(-512 -540)">${body.mark ?? ''}</g></svg>`;

const files = [
  // Tam simge (eski Android, mağaza, web): yeşil zemin + beyaz işaret
  { name: 'icon.png', size: 1024, svg: svg({ bg: BG, mark: mark('#FFFFFF') }, '#1A6E3E', 1024, 0.92) },
  // Uyarlanabilir simge: zemin ve ön plan ayrı (ön plan güvenli alanda, %66)
  { name: 'android-icon-background.png', size: 1024, svg: svg({ bg: BG }, '#1A6E3E') },
  { name: 'android-icon-foreground.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF') }, '#1A6E3E', 1024, 0.72) },
  { name: 'android-icon-monochrome.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF', 1) }, 'transparent', 1024, 0.72) },
  // Açılış ekranı işareti (zemin rengi app.json'da)
  { name: 'splash-icon.png', size: 1024, transparent: true, svg: svg({ mark: mark('#FFFFFF') }, '#1B6B3A', 1024, 0.9) },
  { name: 'favicon.png', size: 48, svg: svg({ bg: BG, mark: mark('#FFFFFF') }, '#1A6E3E', 48, 0.92) },
  // Önizleme (yalnızca kontrol için)
  { name: 'preview.png', size: 1024, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 2048 1024">
     <rect width="2048" height="1024" fill="#EEF2EF"/>
     <g transform="translate(60 60) scale(0.88)"><clipPath id="c"><rect width="1024" height="1024" rx="230"/></clipPath><g clip-path="url(#c)">${svg({ bg: BG, mark: mark('#FFFFFF') }, '#1A6E3E', 1024, 0.92)}</g></g>
     <g transform="translate(1060 60) scale(0.88)"><clipPath id="c2"><circle cx="512" cy="512" r="512"/></clipPath><g clip-path="url(#c2)">${svg({ bg: BG, mark: mark('#FFFFFF') }, '#1A6E3E', 1024, 0.72)}</g></g>
   </svg>`, w: 1024, h: 512 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const f of files) {
    const w = f.w ?? f.size, h = f.h ?? f.size;
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${f.svg.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`)}</body></html>`);
    await page.screenshot({ path: path.join(out, f.name), omitBackground: !!f.transparent, clip: { x: 0, y: 0, width: w, height: h } });
  }
  await browser.close();
  console.log('ok');
})();
