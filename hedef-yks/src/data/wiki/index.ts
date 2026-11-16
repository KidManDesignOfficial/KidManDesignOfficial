/** Otomatik üretildi (scripts/build-wiki.ts). Vikipedi metni, CC BY-SA 4.0. */
export type PackedArticle = [string, number, [0 | 1 | 2, string][]][];
export const WIKI_PACKS: Record<string, () => Record<string, PackedArticle>> = {
  'ayt-biyo': () => require('./ayt-biyo.json'),
  'ayt-cog': () => require('./ayt-cog.json'),
  'ayt-din': () => require('./ayt-din.json'),
  'ayt-edebiyat': () => require('./ayt-edebiyat.json'),
  'ayt-felsefe': () => require('./ayt-felsefe.json'),
  'ayt-fizik': () => require('./ayt-fizik.json'),
  'ayt-geo': () => require('./ayt-geo.json'),
  'ayt-kimya': () => require('./ayt-kimya.json'),
  'ayt-mat': () => require('./ayt-mat.json'),
  'ayt-tarih': () => require('./ayt-tarih.json'),
  'tyt-biyo': () => require('./tyt-biyo.json'),
  'tyt-cog': () => require('./tyt-cog.json'),
  'tyt-din': () => require('./tyt-din.json'),
  'tyt-felsefe': () => require('./tyt-felsefe.json'),
  'tyt-fizik': () => require('./tyt-fizik.json'),
  'tyt-geo': () => require('./tyt-geo.json'),
  'tyt-kimya': () => require('./tyt-kimya.json'),
  'tyt-mat': () => require('./tyt-mat.json'),
  'tyt-tarih': () => require('./tyt-tarih.json'),
  'tyt-turkce': () => require('./tyt-turkce.json'),
};
