/**
 * Canlı ÖSYM sayfalarını indirip uygulamadaki ayrıştırıcılarla okur (internet gerekir).
 *   node --experimental-strip-types scripts/check-live.ts
 */
import { latestTytDate, parseAnnouncements, parseCalendar, parsePapers, parsePaperYears } from '../src/lib/osym.ts';
import { OSYM_PAGES } from '../src/data/sources.ts';

const get = async (u: string) => {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`${u}: ${r.status}`);
  return r.text();
};
let fail = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) fail++;
  console.log(ok ? '✓' : '✗', msg);
};

const ann = parseAnnouncements(await get(OSYM_PAGES.yksAnnouncements));
check(ann.length > 5, `YKS duyuruları: ${ann.length} (en yeni: ${ann[0]?.date} ${ann[0]?.title})`);
const cal = parseCalendar(await get(OSYM_PAGES.calendar));
const tyt = latestTytDate(cal);
check(!!tyt, `Takvim: ${cal.length} YKS satırı, en yeni TYT: ${tyt ? `${tyt.year} → ${tyt.iso}` : 'yok'}`);
for (const r of cal.filter((r) => r.session)) console.log('   ', r.name, '| sınav', r.examDate, '| başvuru', r.application, '| sonuç', r.result);
const years = parsePaperYears(await get(OSYM_PAGES.pastPapers));
check(years.length >= 9, `Soru kitapçığı yılları: ${years.map((y) => y.year).join(', ')}`);
for (const y of years) {
  const p = parsePapers(await get(y.url));
  const ok = p.some((x) => x.kind === 'TYT') && p.some((x) => x.kind === 'AYT');
  check(ok, `${y.year}: ${p.length} PDF (TYT ${p.find((x) => x.kind === 'TYT')?.url.split('/').pop()})`);
}
process.exit(fail ? 1 : 0);
