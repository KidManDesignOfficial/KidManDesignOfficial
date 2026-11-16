/**
 * Resmi bağlantıları gerçek siteye karşı doğrular (internet gerekir; CI'da çalışmaz).
 *   node --experimental-strip-types scripts/verify-sources.ts
 * MEB sayfası JavaScript ile çizildiği için Playwright ile açılır ve ders başlığı aranır.
 */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { MEB_SUMMARIES, MEB_YKS, konuOzetiUrl } from '../src/data/sources.ts';

const require = createRequire(execSync('npm root -g').toString().trim() + '/');
const { chromium } = require('playwright');

const browser = await chromium.launch();
const page = await browser.newPage();
let fail = 0;
const combos = new Map<string, [number, string]>();
for (const list of Object.values(MEB_SUMMARIES)) for (const [s, d] of list) combos.set(`${s}|${d}`, [s, d]);
for (const [s, d] of combos.values()) {
  let text = '';
  for (let attempt = 0; attempt < 3 && !text.includes(`${d} ${s}. Sınıf`); attempt++) {
    await page.goto(konuOzetiUrl(s, d), { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500 + attempt * 1500);
    text = await page.innerText('body', { timeout: 15000 }).catch(() => '');
  }
  const n = (text.match(/Konu Özeti/g) ?? []).length - 2;
  const ok = text.includes(`${d} ${s}. Sınıf`) && n > 0;
  if (!ok) fail++;
  console.log(ok ? '✓' : '✗', `${s}. sınıf ${d}: ${Math.max(0, n)} özet`);
}
for (const r of MEB_YKS) {
  const res = await page.goto(r.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const text = await page.innerText('body', { timeout: 15000 }).catch(() => '');
  const ok = (res?.status() ?? 0) < 400 && text.length > 200 && !/bulunamadı|404/i.test(text.slice(0, 300));
  if (!ok) fail++;
  console.log(ok ? '✓' : '✗', r.title, '→', page.url());
}
await browser.close();
process.exit(fail ? 1 : 0);
