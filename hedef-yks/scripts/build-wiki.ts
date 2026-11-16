/**
 * Vikipedi maddelerini (CC BY-SA 4.0) uygulamaya gömülecek JSON dosyalarına çevirir.
 * Kullanım: node --experimental-strip-types scripts/build-wiki.ts <ham-wikitext-klasörü>
 * Klasörde her madde "<Başlık>.wiki" adıyla bulunur (https://tr.wikipedia.org/w/index.php?title=X&action=raw).
 * Çıktı: src/data/wiki/<ders>.json ve src/data/wiki/index.ts (ders başına tembel yükleme).
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseWikitext } from '../src/lib/wiki.ts';
import { WIKI_ARTICLES } from '../src/data/wikiMap.ts';

const dir = process.argv[2];
if (!dir) throw new Error('Ham wikitext klasörü verilmedi');
const files = fs.readdirSync(dir);
const lower = (s: string) => s.toLocaleLowerCase('tr');
const byLower = new Map(files.map((f) => [lower(f.replace(/\.wiki$/, '')), f]));
const pick = (t: string) => {
  const f = fs.existsSync(path.join(dir, t + '.wiki')) ? t + '.wiki' : byLower.get(lower(t));
  if (!f) throw new Error('Ham metin yok: ' + t);
  return fs.readFileSync(path.join(dir, f), 'utf8');
};

const out = path.join(import.meta.dirname, '../src/data/wiki');
const bySubject: Record<string, Record<string, unknown>> = {};
let total = 0;
for (const [topic, titles] of Object.entries(WIKI_ARTICLES)) {
  const subject = topic.split('.')[0];
  for (const t of titles) {
    const a = parseWikitext(pick(t), t);
    // Kısa biçim: [başlık, düzey, [[tür, metin], ...]]
    (bySubject[subject] ??= {})[t] = a.sections.map((s) => [s.title, s.level, s.blocks.map((b) => [b.t === 'p' ? 0 : b.t === 'li' ? 1 : 2, b.text])]);
    total += a.chars;
  }
}
const subjects = Object.keys(bySubject).sort();
for (const s of subjects) fs.writeFileSync(path.join(out, s + '.json'), JSON.stringify(bySubject[s]));
fs.writeFileSync(
  path.join(out, 'index.ts'),
  `/** Otomatik üretildi (scripts/build-wiki.ts). Vikipedi metni, CC BY-SA 4.0. */\nexport type PackedArticle = [string, number, [0 | 1 | 2, string][]][];\nexport const WIKI_PACKS: Record<string, () => Record<string, PackedArticle>> = {\n${subjects.map((s) => `  '${s}': () => require('./${s}.json'),`).join('\n')}\n};\n`,
);
console.log(subjects.length, 'ders,', Object.values(bySubject).reduce((n, o) => n + Object.keys(o).length, 0), 'madde,', total, 'karakter');
