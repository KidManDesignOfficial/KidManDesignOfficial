/**
 * RSS 2.0 besleme okuyucu.
 * Google Haberler'e göre ayarlıdır ama genel RSS beslemeleriyle de çalışır
 * (yerel haber sitelerinin beslemeleri ileride eklenebilsin diye).
 *
 * Bu dosya yalnızca fast-xml-parser'a bağımlıdır; böylece Node ile doğrudan test edilebilir.
 */
import { XMLParser } from 'fast-xml-parser';

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

/** HTML etiketlerini atar ve yaygın varlıkları çözer (açıklama alanı için). */
export function stripHtml(html: string): string {
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

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

export function parseRss(xml: string): NewsItem[] {
  const doc = parser.parse(xml) as Record<string, any>;
  const items: Record<string, unknown>[] = doc?.rss?.channel?.item ?? [];
  const channelTitle = text(doc?.rss?.channel?.title);

  const result: NewsItem[] = [];
  for (const item of items) {
    const link = text(item.link);
    let title = stripHtml(text(item.title));
    if (!link || !title) continue;

    let source = text(item.source) || channelTitle;
    // Google Haberler başlıkları "Başlık - Kaynak" biçimindedir; kaynak eki tekrarlanmasın.
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3)).trim();
    }

    const descriptionHtml = text(item.description);
    let summary = stripHtml(descriptionHtml);
    // Google açıklaması genelde yalnızca başlık + kaynaktan oluşur; o durumda özet göstermeyiz.
    if (summary.startsWith(title)) summary = '';

    result.push({
      id: text(item.guid) || link,
      title,
      link,
      source,
      publishedAt: parseDate(text(item.pubDate)),
      summary,
      imageUrl: findImage(item, descriptionHtml),
    });
  }
  return result;
}

/** Aynı haberin farklı sorgulardan iki kez gelmesini engeller ve yeniden eskiye sıralar. */
export function dedupeAndSort(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const unique = items.filter((item) => {
    const key = item.title.toLocaleLowerCase('tr-TR');
    if (seen.has(key) || seen.has(item.id)) return false;
    seen.add(key);
    seen.add(item.id);
    return true;
  });
  return unique.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
  );
}

export async function fetchRss(url: string, signal?: AbortSignal): Promise<NewsItem[]> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  });
  if (!response.ok) {
    throw new Error(`Haber kaynağı yanıt vermedi (HTTP ${response.status}).`);
  }
  return dedupeAndSort(parseRss(await response.text()));
}
