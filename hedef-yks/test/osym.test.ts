import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { decodeEntities, latestTytDate, parseAnnouncements, parseCalendar, parsePapers, parsePaperYears } from '../src/lib/osym.ts';

const fx = (n: string) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');

test('HTML varlıkları Türkçe karakterlere çözülür', () => {
  assert.equal(decodeEntities('Yerle&#x15F;tirme Sonu&#xE7;lar&#x131;'), 'Yerleştirme Sonuçları');
  assert.equal(decodeEntities('A &amp; B&nbsp;C'), 'A & B C');
});

test('YKS duyuruları: başlık, ISO tarih ve mutlak bağlantı', () => {
  const list = parseAnnouncements(fx('osym-yks.html'));
  assert.ok(list.length >= 20, `yalnızca ${list.length} duyuru`);
  const first = list[0];
  assert.equal(first.title, '2026-YKS: Ek Yerleştirme Sonuçları Açıklandı');
  assert.equal(first.date, '2026-09-28');
  assert.equal(first.url, 'https://www.osym.gov.tr/2026-yks-ek-yerlestirme-sonuclari-aciklandi');
  for (const a of list) {
    assert.match(a.date ?? '', /^\d{4}-\d{2}-\d{2}$/, a.title);
    assert.ok(a.url.startsWith('https://'), a.url);
  }
});

test('sınav takvimi: YKS oturumları ve tarihleri', () => {
  const rows = parseCalendar(fx('osym-takvim.html'));
  const tyt = rows.find((r) => r.session === 'TYT');
  const ayt = rows.find((r) => r.session === 'AYT');
  assert.ok(tyt && ayt, JSON.stringify(rows));
  assert.equal(tyt.year, 2026);
  assert.equal(tyt.examDate, '20.06.2026');
  assert.equal(ayt.examDate, '21.06.2026');
  assert.match(tyt.application ?? '', /06\.02\.2026/);
  assert.match(tyt.result ?? '', /21\.07\.2026/);
  assert.deepEqual(latestTytDate(rows), { year: 2026, iso: '2026-06-20' });
});

test('çıkmış soru kitapçığı yılları 2018–2026', () => {
  const years = parsePaperYears(fx('osym-cikmis.html'));
  assert.deepEqual(years.map((y) => y.year), [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]);
  assert.ok(years.every((y) => y.url.startsWith('https://www.osym.gov.tr/')));
});

test('kitapçık PDF bağlantıları (yeni ve eski sayfa biçimi)', () => {
  for (const [file, tytFile] of [['osym-kitapcik-2026.html', 'yks_tyt_2026_kitapcik_d350.pdf'], ['osym-kitapcik-2019.html', 'tyt_yks_2019_web.pdf']] as const) {
    const papers = parsePapers(fx(file));
    const tyt = papers.find((p) => p.kind === 'TYT');
    const ayt = papers.find((p) => p.kind === 'AYT');
    assert.ok(tyt && ayt, `${file}: ${JSON.stringify(papers)}`);
    assert.ok(tyt.url.endsWith(tytFile), tyt.url);
    assert.ok(tyt.url.startsWith('https://dokuman.osym.gov.tr/'), tyt.url);
    assert.ok(papers.filter((p) => p.kind === 'YDT').length >= 5, file);
  }
});
