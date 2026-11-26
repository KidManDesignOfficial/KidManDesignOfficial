import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { parseTcmb } from '../src/markets.ts';
import { parseSchedule, type Match } from '../src/rizespor/parse.ts';
import type { NewsItem } from '../src/rss.ts';
import { parseTeaData } from '../src/tea.ts';
import { parseWeather } from '../src/weather.ts';
import { parseWidgetLink, widgetLink } from '../src/widgets/links.ts';
import {
  NEWS_LIMIT,
  SNAPSHOT_VERSION,
  WIDGET_KINDS,
  buildSnapshot,
  degrees,
  marketsSnapshot,
  newsSnapshot,
  pickMatch,
  rizesporSnapshot,
  weatherIcon,
  weatherSnapshot,
  widgetTheme,
} from '../src/widgets/snapshot.ts';

const NOW = new Date(2026, 10, 26, 14, 0).getTime();
const HEX = /^#[0-9A-Fa-f]{6}$/;

function weatherJson(code = 61, isDay = 1) {
  const hours = Array.from({ length: 30 }, (_, i) => `2026-11-26T${String(i % 24).padStart(2, '0')}:00`);
  return {
    current: {
      time: '2026-11-26T14:00',
      temperature_2m: 12.4,
      apparent_temperature: 9.6,
      relative_humidity_2m: 88,
      wind_speed_10m: 14,
      precipitation: 0.4,
      weather_code: code,
      is_day: isDay,
    },
    hourly: {
      time: hours,
      temperature_2m: hours.map((_, i) => 8 + (i % 10)),
      weather_code: hours.map(() => 3),
      precipitation_probability: hours.map(() => 70),
      is_day: hours.map((_, i) => (i % 24 >= 7 && i % 24 < 17 ? 1 : 0)),
    },
    daily: {
      time: ['2026-11-26', '2026-11-27'],
      weather_code: [61, 3],
      temperature_2m_max: [14.2, 13],
      temperature_2m_min: [-0.4, 6],
      precipitation_probability_max: [80, 20],
      sunrise: ['2026-11-26T07:12'],
      sunset: ['2026-11-26T16:41'],
    },
  };
}

function news(id: string, minutesAgo: number | null, link = `https://example.com/${id}`): NewsItem {
  return {
    id,
    title: `Haber ${id}`,
    link,
    source: 'Kaynak',
    publishedAt: minutesAgo === null ? null : new Date(NOW - minutesAgo * 60_000),
    summary: '',
    imageUrl: null,
  };
}

const team = (id: string, name: string) => ({ id, name, abbr: name.slice(0, 3).toUpperCase() });
function match(over: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    date: new Date(NOW + 5 * 3600_000),
    home: team('7656', 'Çaykur Rizespor'),
    away: team('1', 'Trabzonspor'),
    homeScore: null,
    awayScore: null,
    state: 'pre',
    status: '19:00',
    venue: 'Çaykur Didi Stadyumu',
    clockSec: null,
    period: null,
    running: false,
    result: null,
    rizesporHome: true,
    ...over,
  };
}

test('weatherIcon: WMO kodları gece/gündüz simgesine eşlenir', () => {
  assert.equal(weatherIcon(0, true), 'sunny');
  assert.equal(weatherIcon(1, false), 'moon');
  assert.equal(weatherIcon(2, true), 'partly');
  assert.equal(weatherIcon(2, false), 'partly_night');
  assert.equal(weatherIcon(45, true), 'cloudy');
  assert.equal(weatherIcon(53, true), 'rain');
  assert.equal(weatherIcon(66, true), 'rain');
  assert.equal(weatherIcon(81, false), 'rain');
  assert.equal(weatherIcon(73, true), 'snow');
  assert.equal(weatherIcon(86, true), 'snow');
  assert.equal(weatherIcon(95, true), 'storm');
  assert.equal(weatherIcon(1234, true), 'cloudy');
});

test('weatherIcon: kullanılan her simgenin Android çizimi var', () => {
  const dir = new URL('../modules/rize-widgets/android/src/main/res/drawable/', import.meta.url);
  for (const code of [0, 1, 2, 3, 45, 51, 61, 71, 80, 85, 95, 999]) {
    for (const day of [true, false]) {
      const icon = weatherIcon(code, day);
      assert.ok(existsSync(new URL(`rw_ic_${icon}.xml`, dir)), `rw_ic_${icon}.xml eksik`);
    }
  }
});

test('degrees: yuvarlar, eksi sıfır göstermez', () => {
  assert.equal(degrees(12.4), '12°');
  assert.equal(degrees(12.5), '13°');
  assert.equal(degrees(-0.4), '0°');
  assert.equal(degrees(-3.6), '-4°');
});

test('weatherSnapshot: sıcaklık, durum, en yüksek/düşük, saatler ve ekran okuyucu metni', () => {
  const w = parseWeather(weatherJson());
  const s = weatherSnapshot('Rize Merkez', w, NOW);
  assert.equal(s.temp, '12°');
  assert.equal(s.label, 'Hafif yağmur');
  assert.equal(s.icon, 'rain');
  assert.equal(s.hiLo, '14° / 0°');
  assert.equal(s.detail, 'Hissedilen 10° · Yağış %70');
  assert.equal(s.hours.length, 4);
  assert.deepEqual(s.hours.map((h) => h.time), ['17:00', '20:00', '23:00', '02:00']);
  assert.ok(s.hours.every((h) => /^-?\d+°$/.test(h.temp)));
  assert.match(s.a11y, /^Rize Merkez hava durumu: 12 derece, hafif yağmur, en yüksek 14, en düşük 0 derece, yağış olasılığı yüzde 70\.$/);
  assert.equal(s.savedAt, NOW);
});

test('newsSnapshot: en fazla 5 haber, geçersiz bağlantılar atlanır, tarih epoch olur', () => {
  const items = [news('a', 5), news('b', null), news('c', 30, 'javascript:alert(1)'), ...['d', 'e', 'f', 'g'].map((id) => news(id, 60))];
  const s = newsSnapshot(items, NOW)!;
  assert.equal(s.items.length, NEWS_LIMIT);
  assert.deepEqual(s.items.map((i) => i.title), ['Haber a', 'Haber b', 'Haber d', 'Haber e', 'Haber f']);
  assert.equal(s.items[0].publishedAt, NOW - 5 * 60_000);
  assert.equal(s.items[1].publishedAt, null);
  assert.equal(newsSnapshot([], NOW), null);
});

test('marketsSnapshot: dolar, euro, gram altın ve yaş çay satırı', () => {
  const xml = readFileSync(new URL('./fixtures/tcmb-today.xml', import.meta.url), 'utf8');
  const { date, rates } = parseTcmb(xml);
  const tea = parseTeaData(JSON.parse(readFileSync(new URL('../data/cay.json', import.meta.url), 'utf8')));
  const s = marketsSnapshot({ date, rates, ounceUsd: 2650, fetchedAt: NOW }, tea, NOW)!;
  assert.deepEqual(s.rows.map((r) => r.label), ['Dolar', 'Euro', 'Gram altın']);
  for (const r of s.rows) assert.match(r.value, /^[\d.]+(,\d+)? ₺$/);
  assert.match(s.tea!, /^\d{4} yaş çay: [\d.]+,\d{2} ₺\/kg$/);
  assert.match(s.date ?? '', /^\d{1,2} (Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)$/);
  assert.match(s.a11y, /^Piyasalar: Dolar [\d.,]+ lira, Euro [\d.,]+ lira, Gram altın [\d.,]+ lira, \d{4} yaş çay: [\d.,]+ lira kilogram\.$/);

  // Altın gelmezse yalnızca kurlar; hiç kur yoksa widget boş kalır.
  const noGold = marketsSnapshot({ date, rates, ounceUsd: null, fetchedAt: NOW }, null, NOW)!;
  assert.deepEqual(noGold.rows.map((r) => r.code), ['USD', 'EUR']);
  assert.equal(noGold.tea, null);
  assert.equal(marketsSnapshot({ date: null, rates: [], ounceUsd: 2650, fetchedAt: NOW }, null, NOW), null);
});

test('rizesporSnapshot: başlamamış maçta skor yok, oynanan maçta "2 – 1"', () => {
  const pre = rizesporSnapshot(match(), NOW);
  assert.equal(pre.score, null);
  assert.equal(pre.kickoff, NOW + 5 * 3600_000);
  assert.equal(pre.home, 'Çaykur Rizespor');
  const post = rizesporSnapshot(match({ state: 'post', homeScore: 2, awayScore: 1, status: 'MS', result: 'G' }), NOW);
  assert.equal(post.score, '2 – 1');
  assert.equal(post.result, 'G');
});

test('rizesporSnapshot: gerçek ESPN fikstürüyle çalışır', () => {
  const json = JSON.parse(readFileSync(new URL('./fixtures/espn/fixtures.json', import.meta.url), 'utf8'));
  const s = rizesporSnapshot(parseSchedule(json)[0], NOW);
  assert.equal(s.state, 'pre');
  assert.ok(s.home && s.away && Number.isFinite(s.kickoff));
});

test('pickMatch: canlı maç > yeni biten maç (18 sa) > sıradaki maç > son sonuç', () => {
  const next = match();
  const live = match({ state: 'in', homeScore: 0, awayScore: 0 });
  const fresh = match({ id: 'old', state: 'post', date: new Date(NOW - 3 * 3600_000), homeScore: 1, awayScore: 1 });
  const stale = match({ id: 'old', state: 'post', date: new Date(NOW - 3 * 86400_000), homeScore: 1, awayScore: 1 });
  assert.equal(pickMatch(live, fresh, NOW), live);
  assert.equal(pickMatch(next, fresh, NOW), fresh);
  assert.equal(pickMatch(next, stale, NOW), next);
  assert.equal(pickMatch(null, stale, NOW), stale);
  assert.equal(pickMatch(null, null, NOW), null);
});

test('widgetTheme: açık ve koyu palet geçerli renkler; tek renk düzeni vurguyu korur', () => {
  for (const monochrome of [false, true]) {
    const t = widgetTheme({ accent: 'deniz', palette: 'klasik', monochrome, mode: 'system' });
    for (const p of [t.light, t.dark]) for (const v of Object.values(p)) assert.match(v, HEX);
    assert.notEqual(t.light.bg, t.dark.bg);
  }
  assert.equal(widgetTheme({ accent: 'cay', palette: 'klasik', monochrome: false, mode: 'light' }).light.accent, '#1B6B3A');
});

test('buildSnapshot: eksik kaynaklar null olur, JSON olarak gidip gelir', () => {
  const theme = widgetTheme({ accent: 'cay', palette: 'klasik', monochrome: false, mode: 'dark' });
  const empty = buildSnapshot({ now: NOW, textScale: 1, theme, weather: null, news: null, markets: null, tea: null, match: null });
  assert.equal(empty.v, SNAPSHOT_VERSION);
  assert.equal(empty.weather, null);
  assert.equal(empty.rizespor, null);

  const full = buildSnapshot({
    now: NOW,
    textScale: 1.15,
    theme,
    weather: { place: 'Ayder Yaylası', weather: parseWeather(weatherJson(0, 0)), savedAt: NOW - 60_000 },
    news: { items: [news('a', 5)], savedAt: NOW },
    markets: null,
    tea: null,
    match: { match: match(), savedAt: NOW },
  });
  const round = JSON.parse(JSON.stringify(full));
  assert.deepEqual(round, full);
  assert.equal(round.weather.icon, 'moon');
  assert.equal(round.textScale, 1.15);
});

test('parseWidgetLink: sekme ve haber adresi okunur; güvensiz adresler reddedilir', () => {
  assert.deepEqual(parseWidgetLink('rizehaber://open?tab=weather'), { tab: 'weather', url: null });
  const url = 'https://www.example.com/haber?id=5&k=çay#üst';
  assert.deepEqual(parseWidgetLink(widgetLink('news', url)), { tab: 'news', url });
  // Android Uri.Builder boşluğu "+" değil "%20" yazar; ikisi de çözülür.
  assert.deepEqual(parseWidgetLink('rizehaber://open?tab=news&url=https%3A%2F%2Fa.com%2Fx'), { tab: 'news', url: 'https://a.com/x' });
  assert.equal(parseWidgetLink('rizehaber://open?tab=news&url=javascript%3Aalert(1)')?.url, null);
  assert.equal(parseWidgetLink('rizehaber://open?tab=weather&url=https%3A%2F%2Fa.com')?.url, null);
  assert.equal(parseWidgetLink('rizehaber://open?tab=rize'), null);
  assert.equal(parseWidgetLink('rizehaber://open?tab=%E0%A4%A'), null);
  assert.equal(parseWidgetLink('https://example.com/?tab=news'), null);
  assert.equal(parseWidgetLink(null), null);
});

// Android tarafıyla sözleşme: JS'teki türler, Kotlin sağlayıcıları ve manifest kayıtları birbirini tutmalı.
const MOD = new URL('../modules/rize-widgets/', import.meta.url);
const read = (p: string) => readFileSync(new URL(p, MOD), 'utf8');

test('Android modülü: her widget türü için sağlayıcı, manifest kaydı, bilgi dosyası ve düzen var', () => {
  const manifest = read('android/src/main/AndroidManifest.xml');
  const kotlin = readdirSync(new URL('android/src/main/java/expo/modules/rizewidgets/', MOD)).join(' ');
  const xml = readdirSync(new URL('android/src/main/res/xml/', MOD));
  const layouts = readdirSync(new URL('android/src/main/res/layout/', MOD));
  for (const kind of WIDGET_KINDS) {
    const cls = `${kind[0].toUpperCase()}${kind.slice(1)}WidgetProvider`;
    assert.ok(kotlin.includes(`${cls}.kt`), `${cls}.kt eksik`);
    assert.ok(manifest.includes(`.${cls}"`), `manifestte ${cls} yok`);
    assert.ok(xml.includes(`rw_info_${kind}.xml`), `rw_info_${kind}.xml eksik`);
    assert.ok(layouts.some((l) => l.startsWith(`rw_${kind}`)), `rw_${kind}*.xml düzeni eksik`);
    assert.ok(manifest.includes(`@xml/rw_info_${kind}"`));
  }
  // Sağlayıcılar dışa açık olmalı (başlatıcı yayınları alır) ama yalnızca APPWIDGET_UPDATE dinlemeli.
  assert.equal((manifest.match(/android:exported="true"/g) ?? []).length, WIDGET_KINDS.length);
});

test('Android modülü: şema sürümü ve Kotlin tür adları JS ile aynı', () => {
  const snapshotKt = read('android/src/main/java/expo/modules/rizewidgets/Snapshot.kt');
  assert.match(snapshotKt, new RegExp(`SNAPSHOT_VERSION = ${SNAPSHOT_VERSION}\\b`));
  for (const kind of WIDGET_KINDS) assert.ok(snapshotKt.includes(`"${kind}"`), `Snapshot.kt'de "${kind}" yok`);
  const linksKt = read('android/src/main/java/expo/modules/rizewidgets/Links.kt');
  assert.ok(linksKt.includes('"rizehaber"') && linksKt.includes('"open"'));
});

test('Android modülü: uygulama hiç açılmadıysa kullanılan varsayılan renkler uygulamanınkiyle aynı', () => {
  const kt = read('android/src/main/java/expo/modules/rizewidgets/WidgetStyle.kt');
  const block = (name: 'light' | 'dark') => {
    const m = kt.match(new RegExp(`${name} = Palette\\(([\\s\\S]*?)\\n      \\),`));
    assert.ok(m, `${name} paleti bulunamadı`);
    const colors: Record<string, string> = {};
    for (const [, key, hex] of m[1].matchAll(/(\w+) = Color\.parseColor\("(#[0-9A-F]{6})"\)/g)) colors[key] = hex;
    if (/onFill = Color\.WHITE/.test(m[1])) colors.onFill = '#FFFFFF';
    return colors;
  };
  const theme = widgetTheme({ accent: 'cay', palette: 'klasik', monochrome: false, mode: 'system' });
  assert.deepEqual(block('light'), theme.light);
  assert.deepEqual(block('dark'), theme.dark);
});

test('Android modülü: düzenlerde yalnızca RemoteViews destekli görünümler ve kodda kullanılan her kimlik var', () => {
  const allowed = new Set(['FrameLayout', 'LinearLayout', 'ImageView', 'TextView']);
  const layoutDir = new URL('android/src/main/res/layout/', MOD);
  const ids = new Set<string>();
  for (const f of readdirSync(layoutDir)) {
    const xml = readFileSync(new URL(f, layoutDir), 'utf8');
    for (const [, tag] of xml.matchAll(/<([A-Za-z.]+)[\s>]/g)) assert.ok(allowed.has(tag), `${f}: <${tag}> widget'ta kullanılamaz`);
    for (const [, id] of xml.matchAll(/@\+id\/(\w+)/g)) ids.add(id);
    // Kök: Android 12+ köşe yuvarlama ve dokunma için sistem kimliği (kodda android.R.id.background).
    assert.match(xml, /<FrameLayout[^>]*android:id="@android:id\/background"/, `${f}: kök @android:id/background değil`);
  }
  const ktDir = new URL('android/src/main/java/expo/modules/rizewidgets/', MOD);
  for (const f of readdirSync(ktDir)) {
    const kt = readFileSync(new URL(f, ktDir), 'utf8');
    for (const [, id] of kt.matchAll(/(?<!android\.)R\.id\.(\w+)/g)) assert.ok(ids.has(id), `${f}: R.id.${id} hiçbir düzende yok`);
    for (const [, d] of kt.matchAll(/R\.drawable\.(\w+)/g)) {
      assert.ok(existsSync(new URL(`android/src/main/res/drawable/${d}.xml`, MOD)), `${f}: R.drawable.${d} yok`);
    }
  }
});
