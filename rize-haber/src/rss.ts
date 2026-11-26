/**
 * RSS 2.0 besleme okuyucu.
 * Google Haberler'e göre ayarlıdır ama genel RSS beslemeleriyle de çalışır
 * (yerel haber sitelerinin beslemeleri ileride eklenebilsin diye).
 *
 * Bu dosya yalnızca fast-xml-parser'a bağımlıdır; böylece Node ile doğrudan test edilebilir.
 */
import { XMLParser } from 'fast-xml-parser';

import { requestText, type RequestOptions } from './net.ts';

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: Date | null;
  summary: string;
  imageUrl: string | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name) => name === 'item',
  // Başlıkların "123" gibi sayıya dönüşmesini engelle.
  parseTagValue: false,
  trimValues: true,
});

/** Düğüm düz metin ya da {#text, @_attr} nesnesi olabilir; ikisinden de metni çıkarır. */
function text(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number' || typeof node === 'boolean') return String(node);
  if (typeof node === 'object' && '#text' in (node as Record<string, unknown>)) {
    return text((node as Record<string, unknown>)['#text']);
  }
  return '';
}

function attr(node: unknown, name: string): string | null {
  if (node && typeof node === 'object') {
    const value = (node as Record<string, unknown>)[`@_${name}`];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** HTML etiketlerini atar ve yaygın varlıkları çözer. Çift kodlanmış metin (`&amp;quot;`) de düzelir. */
export function stripHtml(html: string): string {
  const once = stripOnce(html);
  return /&(#x?[0-9a-f]+|[a-z]+);/i.test(once) ? stripOnce(once) : once;
}

function stripOnce(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === '#') {
        const code =
          entity[1] === 'x' || entity[1] === 'X'
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Yayın saati ileri tarihli görünen haberler (saat dilimi hatası) listenin tepesine çakılı kalmasın. */
const FUTURE_TOLERANCE_MS = 10 * 60_000;

function parseDate(value: string, now: number): Date | null {
  if (!value) return null;
  const date = new Date(value);
  const t = date.getTime();
  if (Number.isNaN(t) || t < Date.UTC(2000, 0, 1)) return null;
  return t > now + FUTURE_TOLERANCE_MS ? new Date(now) : date;
}

/** Başlık sonundaki " - Kaynak" / " | Kaynak" ekini atar (büyük-küçük harf ve boşluk farkına dayanıklı). */
function stripSourceSuffix(title: string, source: string): string {
  if (!source) return title;
  const want = foldTr(source);
  const m = /\s+[-–—|]\s+([^-–—|]+)$/.exec(title);
  if (m && foldTr(m[1]) === want) return title.slice(0, m.index).trim();
  return title;
}

/** Karşılaştırma için: küçük harf, Türkçe harfler sadeleşir, noktalama atılır. */
export function foldTr(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' })[c] ?? c)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const STOP_WORDS = new Set(['ve', 'ile', 'bir', 'bu', 'da', 'de', 'icin', 'mi', 'ne', 'son', 'dakika', 'rize', 'rizede']);

function titleTokens(title: string): Set<string> {
  return new Set(foldTr(title).split(' ').filter((w) => w.length >= 3 && !STOP_WORDS.has(w)));
}

/**
 * İki başlık aynı haberi mi anlatıyor? Farklı sitelerin aynı haberi az farkla yazdığı başlıklar
 * ("Rize'de heyelan: yol kapandı" / "Rize'de heyelan nedeniyle yol kapandı") kelime örtüşmesiyle yakalanır.
 */
export function sameStory(a: string, b: string): boolean {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.size < 3 || tb.size < 3) return foldTr(a) === foldTr(b);
  let common = 0;
  for (const w of ta) if (tb.has(w)) common++;
  // Kısa olan başlığın kelimelerinin çoğu uzun olanda da geçiyorsa aynı haber.
  return common / Math.min(ta.size, tb.size) >= 0.8 && common / Math.max(ta.size, tb.size) >= 0.6;
}

const SUMMARY_MAX = 280;

function findImage(item: Record<string, unknown>, descriptionHtml: string): string | null {
  const media = item['media:content'] ?? item['media:thumbnail'];
  const mediaNode = Array.isArray(media) ? media[0] : media;
  const fromMedia = attr(mediaNode, 'url');
  if (fromMedia) return fromMedia;

  const enclosure = item.enclosure;
  const enclosureNode = Array.isArray(enclosure) ? enclosure[0] : enclosure;
  const type = attr(enclosureNode, 'type');
  const fromEnclosure = attr(enclosureNode, 'url');
  if (fromEnclosure && (!type || type.startsWith('image/'))) return fromEnclosure;

  const imgTag = /<img[^>]+src=["']([^"']+)["']/i.exec(descriptionHtml);
  return imgTag ? imgTag[1] : null;
}

export function parseRss(xml: string, now: number = Date.now()): NewsItem[] {
  const doc = parser.parse(xml) as Record<string, any>;
  const items: Record<string, unknown>[] = doc?.rss?.channel?.item ?? [];
  const channelTitle = text(doc?.rss?.channel?.title);

  const result: NewsItem[] = [];
  for (const item of items) {
    const link = text(item.link);
    let title = stripHtml(text(item.title));
    if (!link || !title) continue;

    const source = stripHtml(text(item.source) || channelTitle);
    // Google Haberler başlıkları "Başlık - Kaynak" biçimindedir; kaynak eki tekrarlanmasın.
    title = stripSourceSuffix(title, source);
    if (!/^https?:\/\//i.test(link)) continue;

    const descriptionHtml = text(item.description);
    let summary = stripHtml(descriptionHtml);
    // Google açıklaması genelde yalnızca başlık + kaynaktan oluşur; o durumda özet göstermeyiz.
    if (foldTr(summary).startsWith(foldTr(title)) || foldTr(summary) === foldTr(source)) summary = '';
    if (summary.length > SUMMARY_MAX) summary = `${summary.slice(0, SUMMARY_MAX).replace(/\s+\S*$/, '')}…`;

    result.push({
      id: text(item.guid) || link,
      title,
      link,
      source,
      publishedAt: parseDate(text(item.pubDate), now),
      summary,
      imageUrl: findImage(item, descriptionHtml),
    });
  }
  return result;
}

/**
 * Aynı haberin tekrarını ayıklar ve yeniden eskiye sıralar: aynı kimlik/bağlantı, aynı başlık ya da
 * farklı sitelerin az farkla yazdığı aynı haber (bkz. `sameStory`). Tekrarlardan ilk yayımlanan değil,
 * en yeni olan kalır; özeti/görseli olmayan kopya, olanla tamamlanır.
 */
export function dedupeAndSort(items: NewsItem[]): NewsItem[] {
  const sorted = [...items].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  const ids = new Set<string>();
  const kept: NewsItem[] = [];
  for (const item of sorted) {
    if (ids.has(item.id) || ids.has(item.link)) continue;
    const twin = kept.find((k) => sameStory(k.title, item.title));
    if (twin) {
      if (!twin.summary && item.summary) twin.summary = item.summary;
      if (!twin.imageUrl && item.imageUrl) twin.imageUrl = item.imageUrl;
      continue;
    }
    ids.add(item.id);
    ids.add(item.link);
    kept.push({ ...item });
  }
  return kept;
}

export async function fetchRss(url: string, signal?: AbortSignal, opts: Omit<RequestOptions, 'signal'> = {}): Promise<NewsItem[]> {
  const xml = await requestText(url, {
    ...opts,
    signal,
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  });
  const items = parseRss(xml);
  if (items.length === 0 && !/<rss[\s>]/i.test(xml)) throw new Error('Haber kaynağı beklenmeyen bir yanıt verdi.');
  return dedupeAndSort(items);
}

/**
 * Başlıkta, özette ya da kaynak adında geçtiğinde haberi Rize ile ilgili sayan sözcükler (sadeleşmiş
 * yazım, sözcük başında aranır). Pazar ilçesi bilerek yok: "pazar günü", "pazartesi" ile karışır.
 */
const RIZE_TERMS = [
  'rize', 'rizespor', 'caykur', 'cayeli', 'ardesen', 'findikli', 'guneysu', 'ikizdere', 'camlihemsin',
  'kalkandere', 'iyidere', 'derepazari', 'hemsin', 'ayder', 'kackar', 'anzer', 'firtina deresi',
  'yas cay', 'cay fiyat', 'cay alim', 'cay hasad', 'cay ureticisi', 'cay toplama', 'iyidere lojistik',
];

/** Haber Rize ile ilgili mi? (Arama motoru sözcüğü yalnızca haberin gövdesinde bulduysa başlıkta iz yoktur.) */
export function isAboutRize(item: Pick<NewsItem, 'title' | 'summary' | 'source'>): boolean {
  const hay = ` ${foldTr(`${item.title} ${item.summary} ${item.source}`)} `;
  return RIZE_TERMS.some((t) => hay.includes(` ${t}`));
}

/**
 * Rize ile ilgisi görünmeyen haberleri ayıklar. Süzgeç listenin çoğunu silecekse (kaynak başlıkları
 * kısaltmışsa) liste olduğu gibi bırakılır; ekran hiçbir zaman süzgeç yüzünden boş kalmaz.
 */
export function keepRelevant(items: NewsItem[]): NewsItem[] {
  const relevant = items.filter(isAboutRize);
  return relevant.length >= Math.max(3, items.length * 0.3) ? relevant : items;
}
