// Veri toplama kalitesi: ağ katmanı (zaman aşımı, yeniden deneme), haber tekilleştirme, hava doğrulaması.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HttpError, TimeoutError, friendlyError, isRetryableStatus, request } from '../src/net.ts';
import { dedupeAndSort, foldTr, parseRss, sameStory, stripHtml, type NewsItem } from '../src/rss.ts';
import { parseTcmb } from '../src/markets.ts';
import { parseWeather } from '../src/weather.ts';

const ok = (body: string) => new Response(body, { status: 200 });

test('ağ: geçici hata (503) bir kez yeniden denenir, ikinci denemede gelen yanıt döner', async () => {
  let calls = 0;
  const fetchImpl = (async () => (++calls === 1 ? new Response('', { status: 503 }) : ok('tamam'))) as typeof fetch;
  const res = await request('https://x.example', { fetchImpl, backoffMs: 1 });
  assert.equal(await res.text(), 'tamam');
  assert.equal(calls, 2);
});

test('ağ: 404 yeniden denenmez; 408/429/5xx denenir', async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls++;
    return new Response('', { status: 404 });
  }) as typeof fetch;
  await assert.rejects(request('https://x.example', { fetchImpl, retries: 3, backoffMs: 1 }), (e) => e instanceof HttpError && e.status === 404);
  assert.equal(calls, 1);
  for (const s of [408, 429, 500, 502, 503]) assert.ok(isRetryableStatus(s), String(s));
  for (const s of [400, 401, 403, 404]) assert.ok(!isRetryableStatus(s), String(s));
});

test('ağ: asılı kalan istek süre sınırında TimeoutError ile biter', async () => {
  const fetchImpl = ((_url: string, init?: RequestInit) =>
    new Promise((_, reject) => {
      init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })) as typeof fetch;
  const started = Date.now();
  await assert.rejects(request('https://x.example', { fetchImpl, timeoutMs: 40, retries: 0 }), TimeoutError);
  assert.ok(Date.now() - started < 1000);
});

test('ağ: çağıranın iptali yeniden denenmez ve AbortError olarak döner', async () => {
  const controller = new AbortController();
  let calls = 0;
  const fetchImpl = ((_url: string, init?: RequestInit) =>
    new Promise((_, reject) => {
      calls++;
      init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    })) as typeof fetch;
  setTimeout(() => controller.abort(), 10);
  await assert.rejects(request('https://x.example', { fetchImpl, signal: controller.signal, retries: 3 }), (e) => (e as Error).name === 'AbortError');
  assert.equal(calls, 1);
});

test('ağ: hata metinleri kullanıcıya anlaşılır', () => {
  assert.match(friendlyError(new TimeoutError(), 'Haberler'), /zamanında gelmedi/);
  assert.match(friendlyError(new HttpError(503), 'Haberler'), /geçici olarak/);
  assert.match(friendlyError(new TypeError('Network request failed'), 'Haberler'), /İnternet bağlantınızı/);
});

const item = (id: string, title: string, hoursAgo: number, extra: Partial<NewsItem> = {}): NewsItem => ({
  id,
  title,
  link: `https://n.example/${id}`,
  source: 'Kaynak',
  publishedAt: new Date(Date.UTC(2026, 10, 20, 12) - hoursAgo * 3600_000),
  summary: '',
  imageUrl: null,
  ...extra,
});

test('haber: farklı sitelerin az farkla yazdığı aynı haber tek kez görünür, eksik özet tamamlanır', () => {
  const list = dedupeAndSort([
    item('a', "Rize'de heyelan: Çayeli yolu ulaşıma kapandı", 1),
    item('b', "Rize'de heyelan nedeniyle Çayeli yolu ulaşıma kapandı", 3, { summary: 'Ekipler çalışıyor.' }),
    item('c', 'Rizespor Galatasaray maçı ne zaman?', 2),
    item('d', 'Rizespor Galatasaray maçı kaç kaç bitti?', 0.5),
  ]);
  assert.deepEqual(list.map((i) => i.id), ['d', 'a', 'c']);
  assert.equal(list[1].summary, 'Ekipler çalışıyor.');
});

test('haber: sameStory Türkçe harf ve noktalama farkını yok sayar, kısa başlıkta yalnızca birebir eşleşir', () => {
  assert.ok(sameStory('Çaykur Rizespor’dan transfer açıklaması', 'CAYKUR RIZESPOR DAN TRANSFER ACIKLAMASI'));
  assert.ok(!sameStory('Rize hava', 'Rize hava durumu'));
  assert.equal(foldTr('Şehir İçi Ulaşım!'), 'sehir ici ulasim');
});

test('haber: ileri tarihli yayın saati şimdiye çekilir; kaynak eki büyük-küçük harften bağımsız atılır; çift kodlama çözülür', () => {
  const now = Date.UTC(2026, 10, 20, 12);
  const xml = `<rss><channel><title>K</title>
  <item><title>Valilikten &amp;quot;turuncu&amp;quot; uyarı - RİZE GÜNDEM</title><link>https://n.example/1</link>
  <pubDate>Sat, 21 Nov 2026 12:00:00 GMT</pubDate><source url="https://r.example">Rize Gündem</source></item>
  <item><title>Göreceli bağlantı</title><link>/goreceli</link></item>
  </channel></rss>`;
  const [only, ...rest] = parseRss(xml, now);
  assert.equal(rest.length, 0, 'http(s) olmayan bağlantı atlanır');
  assert.equal(only.title, 'Valilikten "turuncu" uyarı');
  assert.equal(only.publishedAt?.getTime(), now);
  assert.equal(stripHtml('&amp;amp;'), '&');
});

test('kur: alış satıştan büyük ya da makası anormal satır gösterilmez', () => {
  const xml = `<Tarih_Date Date="11/20/2026">
    <Currency CurrencyCode="USD"><Unit>1</Unit><ForexBuying>42.10</ForexBuying><ForexSelling>42.18</ForexSelling></Currency>
    <Currency CurrencyCode="EUR"><Unit>1</Unit><ForexBuying>49.00</ForexBuying><ForexSelling>48.00</ForexSelling></Currency>
    <Currency CurrencyCode="GBP"><Unit>1</Unit><ForexBuying>10</ForexBuying><ForexSelling>56</ForexSelling></Currency>
  </Tarih_Date>`;
  assert.deepEqual(parseTcmb(xml).rates.map((r) => r.code), ['USD']);
});

test('hava: bozuk saatlik/günlük değerler atlanır, yüzdeler 0–100 aralığına sıkışır, zorunlu alan yoksa hata', () => {
  const w = parseWeather({
    current: { time: '2026-11-20T10:15', temperature_2m: 12.3, weather_code: 61, is_day: 1, relative_humidity_2m: 140, wind_speed_10m: null },
    hourly: {
      time: ['2026-11-20T10:00', '2026-11-20T11:00', '2026-11-20T12:00'],
      temperature_2m: [12, null, 13],
      weather_code: [61, 61, 3],
      precipitation_probability: [120, 50, -5],
      is_day: [1, 1, 1],
    },
    daily: { time: ['2026-11-20', '2026-11-21'], weather_code: [61, 3], temperature_2m_max: [14, 'x'], temperature_2m_min: [8, 7], sunrise: ['2026-11-20T07:20'] },
  });
  assert.deepEqual(w.hourly.map((h) => h.time), ['2026-11-20T10:00', '2026-11-20T12:00']);
  assert.deepEqual(w.hourly.map((h) => h.precipitationProbability), [100, 0]);
  assert.equal(w.daily.length, 1);
  assert.equal(w.current.humidity, 100);
  assert.equal(w.current.windSpeed, 0);
  assert.equal(w.current.apparentTemperature, 12.3);
  assert.equal(w.sunset, null);
  assert.throws(() => parseWeather({ current: {} }), /eksik/);
  assert.throws(() => parseWeather(null), /eksik/);
});

test('haber: Rize ile ilgisi görünmeyen haber ayıklanır; süzgeç listeyi boşaltacaksa liste korunur', async () => {
  const { isAboutRize, keepRelevant } = await import('../src/rss.ts');
  assert.ok(isAboutRize({ title: "Çayeli'de sahil yolu çalışması", summary: '', source: 'Karadeniz Haber' }));
  assert.ok(isAboutRize({ title: 'Vali açıklama yaptı', summary: '', source: 'Rize Gündem' }));
  assert.ok(isAboutRize({ title: 'Yaş çay fiyatı açıklandı', summary: '', source: 'AA' }));
  assert.ok(!isAboutRize({ title: 'Ankara’da metro seferleri uzatıldı', summary: '', source: 'Ulusal Gazete' }));
  // Sözcük başında aranır; Pazar ilçesi "pazartesi" / "pazar günü" ile karışmasın diye listede yok.
  assert.ok(!isAboutRize({ title: 'Pazartesi günü okullar tatil', summary: '', source: 'X' }));
  assert.ok(!isAboutRize({ title: 'Karize gezisi', summary: '', source: 'X' }));
  const off = item('x', 'İstanbul’da trafik yoğunluğu', 1);
  const on = [item('a', 'Rize valiliği uyardı', 1), item('b', 'Rizespor kazandı', 2), item('c', 'Ardeşen’de sel', 3)];
  assert.deepEqual(keepRelevant([...on, off]).map((i) => i.id), ['a', 'b', 'c']);
  const mostlyOff = [off, item('y', 'Hava soğuyor', 1), item('z', 'Akaryakıta zam', 1), on[0]];
  assert.equal(keepRelevant(mostlyOff).length, 4);
});
