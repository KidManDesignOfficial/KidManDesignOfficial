/**
 * ÖSYM'nin herkese açık sayfalarını ayrıştırır (www.osym.gov.tr).
 *
 * ÖSYM bu bilgiler için açık bir API sunmaz; uygulama, bir adayın tarayıcıda gördüğü sayfaların
 * aynısını indirip yalnızca başlık, tarih ve bağlantıları okur. Sayfa yapısı değişirse ayrıştırıcı
 * boş liste döner ve uygulama "resmi sayfayı aç" seçeneğine düşer; asla uydurma veri göstermez.
 * Fonksiyonlar saftır (ağ yok); `test/osym.test.ts` gerçek sayfa kopyalarıyla doğrular.
 */

export const OSYM_BASE = 'https://www.osym.gov.tr';

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z#0-9]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
}

export function textOf(fragment: string): string {
  return decodeEntities(fragment.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function absolute(href: string): string {
  const h = decodeEntities(href.trim());
  if (/^https?:\/\//i.test(h)) return h;
  return OSYM_BASE + (h.startsWith('/') ? h : `/${h}`);
}

const MONTHS: Record<string, number> = {
  ocak: 1, şubat: 2, mart: 3, nisan: 4, mayıs: 5, haziran: 6, temmuz: 7, ağustos: 8, eylül: 9, ekim: 10, kasım: 11, aralık: 12,
};

/** "28" + "Eylül 2026" → "2026-09-28" */
function isoFromParts(day: string, monthYear: string): string | null {
  const [m, y] = monthYear.trim().split(/\s+/);
  const month = MONTHS[m?.toLocaleLowerCase('tr-TR') ?? ''];
  if (!month || !/^\d{4}$/.test(y ?? '') || !/^\d{1,2}$/.test(day.trim())) return null;
  return `${y}-${String(month).padStart(2, '0')}-${day.trim().padStart(2, '0')}`;
}

export type Announcement = { title: string; date: string | null; url: string };

/** Duyuru listesi (ör. /SinavGrubu/Index/2 → YKS duyuruları, /SinavGrubu/Menu/323 → soru kitapçıkları). */
export function parseAnnouncements(html: string): Announcement[] {
  const out: Announcement[] = [];
  const re = /<a[^>]*class="duyuru-list-item"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const m of html.matchAll(re)) {
    const body = m[2];
    const title = textOf(/<span class="duyuru-list-title">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '');
    const day = textOf(/<span class="duyuru-list-day">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '');
    const my = textOf(/<span class="duyuru-list-my">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '');
    if (!title) continue;
    out.push({ title, date: isoFromParts(day, my), url: absolute(m[1]) });
  }
  // Aynı duyuru sayfada iki kez yer alabilir.
  return out.filter((a, i) => out.findIndex((b) => b.url === a.url) === i);
}

export type CalendarRow = {
  /** ör. "2026-YKS 1. Oturum (TYT)" */
  name: string;
  year: number;
  session: 'TYT' | 'AYT' | 'YDT' | null;
  examDate: string | null;
  application: string | null;
  lateApplication: string | null;
  result: string | null;
};

/** "20.06.2026" → "2026-06-20" (ilk tarih) */
export function isoFromDotted(s: string | null | undefined): string | null {
  const m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(s ?? '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/**
 * Sınav takvimi (/Sayfa/SinavTakvimi). Sütunları "Sınav Tarihi" başlığı olan tablodaki YKS satırları.
 * Başlık sırası okunarak sütunlar adlarına göre eşlenir; ÖSYM sütun sırasını değiştirse de çalışır.
 */
export function parseCalendar(html: string): CalendarRow[] {
  const rows: CalendarRow[] = [];
  for (const table of html.match(/<table[\s\S]*?<\/table>/g) ?? []) {
    const trs = table.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
    if (trs.length < 2) continue;
    const head = ((trs[0] ?? '').match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/g) ?? []).map(textOf);
    const col = (name: RegExp) => head.findIndex((h) => name.test(h));
    const iExam = col(/^Sınav Tarihi/i);
    const iApp = col(/^Başvuru Tarihi/i);
    const iLate = col(/^Geç Başvuru/i);
    const iRes = col(/^Sonuç Tarihi/i);
    if (iExam < 0) continue;
    for (const tr of trs.slice(1)) {
      const cells = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) ?? []).map((c) => c.replace(/<p[^>]*>[\s\S]*?<\/p>/g, ''));
      const first = cells[0] ?? '';
      if (!/<b>\s*YKS\s*<\/b>/.test(first)) continue;
      const parts = first.split(/<br\s*\/?>/i).map(textOf).filter(Boolean);
      const name = parts[parts.length - 1] ?? textOf(first);
      const year = Number(/data-yil="(\d{4})"/.exec(tr)?.[1] ?? /(\d{4})-YKS/.exec(name)?.[1] ?? 0);
      const session = /\(TYT\)/.test(name) ? 'TYT' : /\(AYT\)/.test(name) ? 'AYT' : /\(YDT\)/.test(name) ? 'YDT' : null;
      const val = (i: number) => (i >= 0 && cells[i] ? textOf(cells[i]) || null : null);
      const v = (s: string | null) => (s && s !== '-' ? s : null);
      rows.push({ name, year, session, examDate: v(val(iExam)), application: v(val(iApp)), lateApplication: v(val(iLate)), result: v(val(iRes)) });
    }
    if (rows.length) break;
  }
  return rows;
}

/** Takvimdeki en yeni yılın TYT tarihini döndürür. Yayımlanmamışsa null. */
export function latestTytDate(rows: CalendarRow[]): { year: number; iso: string } | null {
  const tyt = rows.filter((r) => r.session === 'TYT' && isoFromDotted(r.examDate)).sort((a, b) => b.year - a.year)[0];
  return tyt ? { year: tyt.year, iso: isoFromDotted(tyt.examDate)! } : null;
}

export type PaperYear = { year: number; title: string; url: string };

/** Soru kitapçıkları listesi (/SinavGrubu/Menu/323) → yıl başına YKS duyuru sayfası. */
export function parsePaperYears(html: string): PaperYear[] {
  return parseAnnouncements(html)
    .map((a) => ({ a, m: /(\d{4})-?YKS[^]*Temel Soru Kitap/i.exec(a.title) }))
    .filter((x) => x.m)
    .map(({ a, m }) => ({ year: Number(m![1]), title: a.title, url: a.url }))
    .sort((a, b) => b.year - a.year);
}

export type Paper = { title: string; url: string; kind: 'TYT' | 'AYT' | 'YDT' | 'Diğer' };

/** Bir yılın kitapçık sayfasındaki PDF bağlantıları (dokuman.osym.gov.tr). */
export function parsePapers(html: string): Paper[] {
  const out: Paper[] = [];
  for (const m of html.matchAll(/<a[^>]+href="(https?:\/\/[^"]+?\.pdf)\s*"[^>]*>([\s\S]*?)<\/a>/gi)) {
    // Eski sayfalarda http:// kullanılmış; Android şifresiz bağlantıya izin vermez, aynı belge https ile sunulur.
    const url = decodeEntities(m[1].trim()).replace(/^http:\/\//i, 'https://');
    const title = textOf(m[2]);
    if (!title || /yasakli/i.test(url)) continue;
    const kind = /\(TYT\)/.test(title) ? 'TYT' : /\(AYT\)/.test(title) ? 'AYT' : /\(YDT\)/.test(title) ? 'YDT' : 'Diğer';
    if (!out.some((p) => p.url === url)) out.push({ title, url, kind });
  }
  return out;
}
