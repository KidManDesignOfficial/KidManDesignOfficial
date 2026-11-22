// Google Play kiti: mağaza metinleri, görseller ve paket izinleri uygulamanın gerçek durumuyla tutarlı mı?
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const app = JSON.parse(read('app.json')).expo;
const blocked: string[] = app.android.blockedPermissions;
const discoverEnabled = /export const DISCOVER_ENABLED = true;/.test(read('src/theme.tsx'));
const guide = read('store/MAGAZA.md');
const description = read('store/ACIKLAMA.txt');
const notes = read('store/SURUM-NOTLARI.txt');
const privacy = read('GIZLILIK.md');

/** PNG genişlik × yükseklik (IHDR). */
function pngSize(path: string): [number, number] {
  const b = readFileSync(new URL(path, root));
  assert.equal(b.toString('latin1', 1, 4), 'PNG', `${path}: PNG`);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('konum izni yalnızca Keşfet açıkken pakette; reklam kimliği her zaman engelli', () => {
  const coarse = 'android.permission.ACCESS_COARSE_LOCATION';
  assert.equal(blocked.includes(coarse), !discoverEnabled, 'Keşfet kapalıysa konum izni engellenir, açıksa engellenmez');
  for (const p of ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_BACKGROUND_LOCATION', 'android.permission.RECORD_AUDIO', 'com.google.android.gms.permission.AD_ID']) {
    assert.ok(blocked.includes(p), `${p} engelli (mağaza beyanları buna göre)`);
  }
});

test('mağaza metinleri Play sınırları içinde ve uygulamada olmayan bölümden söz etmiyor', () => {
  const short = guide.match(/Kısa açıklama \(en fazla 80\) \| `([^`]+)`/)?.[1];
  assert.ok(short, 'kısa açıklama rehberde');
  assert.ok([...short].length <= 80, 'kısa açıklama ≤ 80');
  assert.ok([...description].length <= 4000, 'tam açıklama ≤ 4000');
  const tr = notes.match(/<tr-TR>\n([\s\S]*?)\n<\/tr-TR>/)?.[1];
  assert.ok(tr && [...tr].length <= 500, 'sürüm notları ≤ 500');
  if (!discoverEnabled) {
    for (const [name, text] of [['ACIKLAMA', description], ['SURUM-NOTLARI', notes]] as const) {
      assert.ok(!/keşfet|gezi rehberi/i.test(text), `${name}: kapalı Keşfet bölümünden söz etmez`);
    }
  }
  assert.ok(guide.includes(`Sürüm adı \`${app.version}\``), 'rehberdeki sürüm adı app.json ile aynı');
  assert.ok(guide.includes(`sürüm kodu **${app.android.versionCode}**`), 'rehberdeki sürüm kodu app.json ile aynı');
});

test('gizlilik politikası uygulamanın bağlandığı her veri servisini listeler', () => {
  const src = (dir: string): string =>
    readdirSync(new URL(dir, root), { withFileTypes: true })
      .map((e) => (e.isDirectory() ? src(`${dir}${e.name}/`) : /\.tsx?$/.test(e.name) ? read(`${dir}${e.name}`) : ''))
      .join('\n');
  const code = src('src/');
  for (const host of ['news.google.com', 'api.open-meteo.com', 'site.web.api.espn.com', 'raw.githubusercontent.com', 'www.tcmb.gov.tr', 'api.gold-api.com']) {
    assert.ok(code.includes(`https://${host}`), `${host} kodda kullanılıyor`);
    assert.ok(privacy.includes(host), `GIZLILIK.md ${host} servisini listeler`);
  }
  if (!discoverEnabled) assert.ok(!/Keşfet/.test(privacy), 'kapalı Keşfet bölümü politikada yok');
});

test('mağaza görselleri Play ölçülerinde', () => {
  assert.deepEqual(pngSize('store/uygulama-simgesi-512.png'), [512, 512]);
  assert.deepEqual(pngSize('store/one-cikan-gorsel-1024x500.png'), [1024, 500]);
  const shots = readdirSync(new URL('store/ekran-goruntuleri/', root)).filter((f) => f.endsWith('.png'));
  assert.ok(shots.length >= 2 && shots.length <= 8, 'telefon için 2–8 ekran görüntüsü');
  for (const f of shots) assert.deepEqual(pngSize(`store/ekran-goruntuleri/${f}`), [1080, 1920], f);
});
