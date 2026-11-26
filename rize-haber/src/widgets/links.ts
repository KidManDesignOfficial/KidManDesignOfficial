/**
 * Widget ve kısayol bağlantıları: `rizehaber://open?tab=weather` ya da
 * `rizehaber://open?tab=news&url=<haber adresi>`.
 *
 * Android tarafı bu adresi açık (explicit) bir Intent'in verisi olarak uygulamaya verir; uygulama da
 * buradan hangi sekmenin ve gerekirse hangi haberin açılacağını okur. Saf modüldür; Node ile test edilir.
 * React Native'in `URL` desteği sınırlı olduğundan sorgu elle çözülür.
 */
import { TAB_LINK_IDS, type LinkTab } from './tabs.ts';

export const LINK_SCHEME = 'rizehaber';

export type WidgetLink = { tab: LinkTab; url: string | null };

function decode(value: string): string | null {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

export function parseWidgetLink(link: string | null | undefined): WidgetLink | null {
  if (!link) return null;
  const m = link.match(/^rizehaber:\/\/open\/?\?(.*)$/i);
  if (!m) return null;
  const params = new Map<string, string>();
  for (const part of m[1].split('&')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const value = decode(part.slice(eq + 1));
    if (value !== null) params.set(part.slice(0, eq), value);
  }
  const tab = params.get('tab') as LinkTab | undefined;
  if (!tab || !TAB_LINK_IDS.includes(tab)) return null;
  const url = params.get('url') ?? null;
  // Yalnızca https haber adresleri açılır; başka şema (javascript:, intent:, file:) yok sayılır.
  return { tab, url: tab === 'news' && url && /^https:\/\/[^\s]+$/i.test(url) ? url : null };
}

export function widgetLink(tab: LinkTab, url?: string): string {
  return `${LINK_SCHEME}://open?tab=${tab}${url ? `&url=${encodeURIComponent(url)}` : ''}`;
}
