// Node'un yerleşik test çalıştırıcısıyla çalışır: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dedupeAndSort, parseRss, stripHtml } from '../src/rss.ts';
import { clockTime, dayLabel, timeAgo } from '../src/time.ts';
import { describeWeatherCode } from '../src/weather.ts';

// Google Haberler RSS çıktısının gerçek yapısına göre hazırlanmış örnek.
const GOOGLE_NEWS_SAMPLE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel>
<title>"Rize when:7d" - Google Haberler</title>
<item>
  <title>Rize'de heyelan: yol ulaşıma kapandı - Rize Gündem</title>
  <link>https://news.google.com/rss/articles/AAA?oc=5</link>
  <guid isPermaLink="false">AAA</guid>
  <pubDate>Sat, 14 Nov 2026 09:30:00 GMT</pubDate>
  <description>&lt;a href="https://news.google.com/rss/articles/AAA?oc=5" target="_blank"&gt;Rize'de heyelan: yol ulaşıma kapandı&lt;/a&gt;&amp;nbsp;&amp;nbsp;&lt;font color="#6f6f6f"&gt;Rize Gündem&lt;/font&gt;</description>
  <source url="https://www.rizegundem.example">Rize Gündem</source>
</item>
<item>
  <title>Çaykur Rizespor &amp; Trabzonspor derbisi - Spor Haber</title>
  <link>https://news.google.com/rss/articles/BBB?oc=5</link>
  <guid isPermaLink="false">BBB</guid>
  <pubDate>Sun, 15 Nov 2026 18:00:00 GMT</pubDate>
  <description>Derbi öncesi son durum</description>
  <source url="https://spor.example">Spor Haber</source>
</item>
</channel></rss>`;

const GENERIC_SAMPLE = `<?xml version="1.0"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel>
<title>Yerel Gazete</title>
<item>
  <title>2026</title>
  <link>https://yerel.example/1</link>
  <pubDate>gecersiz-tarih</pubDate>
  <description>&lt;p&gt;&lt;img src="https://yerel.example/a.jpg"/&gt;Çay hasadı &amp;#252;çüncü s&amp;#x00FC;rgün&lt;/p&gt;</description>
</item>
<item>
  <title>Medya görselli haber</title>
  <link>https://yerel.example/2</link>
  <media:content url="https://yerel.example/m.jpg" medium="image"/>
</item>
<item><title>Bağlantısız haber atlanmalı</title></item>
</channel></rss>`;

test('Google Haberler beslemesini ayrıştırır ve kaynak ekini başlıktan çıkarır', () => {
  const items = parseRss(GOOGLE_NEWS_SAMPLE);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "Rize'de heyelan: yol ulaşıma kapandı");
  assert.equal(items[0].source, 'Rize Gündem');
  assert.equal(items[0].id, 'AAA');
  assert.equal(items[0].summary, '', 'yalnızca başlığı tekrarlayan açıklama gizlenmeli');
  assert.equal(items[0].publishedAt?.toISOString(), '2026-11-14T09:30:00.000Z');
  assert.equal(items[1].title, 'Çaykur Rizespor & Trabzonspor derbisi');
  assert.equal(items[1].summary, 'Derbi öncesi son durum');
});

test('Genel RSS: sayısal başlık, geçersiz tarih, görseller, eksik bağlantı', () => {
  const items = parseRss(GENERIC_SAMPLE);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, '2026');
  assert.equal(items[0].source, 'Yerel Gazete');
  assert.equal(items[0].publishedAt, null);
  assert.equal(items[0].imageUrl, 'https://yerel.example/a.jpg');
  assert.equal(items[0].summary, 'Çay hasadı üçüncü sürgün');
  assert.equal(items[1].imageUrl, 'https://yerel.example/m.jpg');
});

test('Boş veya bozuk belgede hata vermeden boş liste döner', () => {
  assert.deepEqual(parseRss('<rss><channel></channel></rss>'), []);
  assert.deepEqual(parseRss('<html>hata</html>'), []);
});

test('dedupeAndSort: tekrarları atar, yeniden eskiye sıralar', () => {
  const items = parseRss(GOOGLE_NEWS_SAMPLE);
  const result = dedupeAndSort([...items, { ...items[0], id: 'baska-id' }]);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, 'BBB');
});

test('stripHtml etiketleri ve varlıkları temizler', () => {
  assert.equal(stripHtml('<b>Rize</b>&nbsp;&amp;&nbsp;Artvin'), 'Rize & Artvin');
});

test('timeAgo Türkçe göreli zaman üretir', () => {
  const now = new Date('2026-11-15T12:00:00Z');
  assert.equal(timeAgo(new Date('2026-11-15T11:59:30Z'), now), 'az önce');
  assert.equal(timeAgo(new Date('2026-11-15T11:45:00Z'), now), '15 dk önce');
  assert.equal(timeAgo(new Date('2026-11-15T09:00:00Z'), now), '3 sa önce');
  assert.equal(timeAgo(new Date('2026-11-13T12:00:00Z'), now), '2 gün önce');
  assert.equal(timeAgo(null, now), '');
});

test('Hava durumu yardımcıları', () => {
  assert.equal(dayLabel('2026-11-15', 0), 'Bugün');
  assert.equal(dayLabel('2026-11-16', 1), 'Yarın');
  assert.equal(dayLabel('2026-11-18', 3), 'Çarşamba');
  assert.equal(clockTime('2026-11-15T07:12'), '07:12');
  assert.equal(clockTime(null), '–');
  assert.equal(describeWeatherCode(63).label, 'Yağmurlu');
  assert.equal(describeWeatherCode(0, false).icon, '🌙');
  assert.equal(describeWeatherCode(999).label, 'Bilinmiyor');
});
