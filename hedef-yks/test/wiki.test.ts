import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { latexToText, parseWikiResponse, parseWikitext, redirectTarget, wikiApiUrl, wikiRawUrl } from '../src/lib/wiki.ts';
import { WIKI_ARTICLES } from '../src/data/wikiMap.ts';
import { SUBJECTS } from '../src/data/curriculum.ts';

const fx = (n: string) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');
const JUNK = /\{\{|\}\}|\[\[|\]\]|<\/?[a-z]+[\s>/]|\{\||\|\}|\u0001|&[a-z]+;|<ref/;

test('LaTeX okunur metne çevrilir', () => {
  assert.equal(latexToText('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'), 'x = (-b ± √(b²-4ac))/(2a)');
  assert.equal(latexToText('\\int_a^b f(x)\\,dx = F(b)-F(a)'), '∫ₐᵇ f(x) dx = F(b)-F(a)');
  assert.equal(latexToText('\\sqrt[3]{x^{2}}'), '³√x²');
  assert.equal(latexToText('\\lim_{h\\rightarrow 0}\\frac{f(a+h)-f(a)}{h}'), 'lim(h → 0) (f(a + h)-f(a))/h');
  assert.equal(latexToText('a \\leq b \\neq c, \\alpha + \\pi'), 'a ≤ b ≠ c, α + π');
  assert.equal(latexToText('\\binom{n}{r}'), 'C(n, r)');
  assert.equal(latexToText('\\frac {a}{b}'), 'a/b');
});

test('Türev maddesi: bölümler, formüller, temiz metin', () => {
  const a = parseWikitext(fx('wiki-turev.wiki'), 'Türev');
  const titles = a.sections.map((s) => s.title);
  assert.equal(titles[0], 'Giriş');
  assert.ok(titles.includes('Limit üzerinden tanım'));
  assert.ok(!titles.some((t) => /kaynak|dış bağlantı/i.test(t)), 'kaynakça bölümü atlanmalı');
  assert.ok(a.sections[0].blocks[0].text.startsWith('Matematikte türev, bir fonksiyonun'));
  const maths = a.sections.flatMap((s) => s.blocks).filter((b) => b.t === 'math').map((b) => b.text);
  assert.ok(maths.includes("f'(a) = L veya df/dx(a) = L"), maths.slice(0, 5).join(' | '));
  for (const s of a.sections) for (const b of s.blocks) assert.doesNotMatch(b.text, JUNK, b.text.slice(0, 120));
  assert.ok(a.chars > 10000);
});

test('Ünlü düşmesi: örnek kutusu atılır, listeler korunur', () => {
  const a = parseWikitext(fx('wiki-unlu-dusmesi.wiki'), 'Ünlü düşmesi');
  assert.equal(a.sections[0].blocks[0].text, 'Ünlü düşmesi, Türkçede görülen bir ses olayıdır. Genellikle ikinci hecesinde dar bir ünlü (ı, i, u, ü) bulunan sözcüklerde görülür ancak istisnaları mevcuttur.');
  const iki = a.sections.find((s) => s.title === 'İki heceli sözcüklerde')!;
  assert.ok(iki.blocks.some((b) => b.t === 'li' && b.text === 'burun-um = burnum (aradaki u harfi düşmüştür)'));
});

test('Tarih maddesi: bilgi kutusu, görseller ve dipnotlar çıkarılır', () => {
  const a = parseWikitext(fx('wiki-sakarya.wiki'), 'Sakarya Meydan Muharebesi');
  assert.deepEqual(a.sections.slice(0, 4).map((s) => s.title), ['Giriş', 'Arka plan', 'Muharebe', 'Muharebe sonrası']);
  const all = a.sections.flatMap((s) => s.blocks).map((b) => b.text).join('\n');
  assert.match(all, /Hatt-ı müdafaa yoktur; sath-ı müdafaa vardır/);
  assert.doesNotMatch(all, JUNK);
  assert.doesNotMatch(all, /küçükresim|Dosya:/);
});

test('api.php (web) yanıtı ve yönlendirme', () => {
  const body = JSON.stringify({ query: { pages: [{ pageid: 1, title: 'Ünlü düşmesi', revisions: [{ slots: { main: { contentmodel: 'wikitext', content: fx('wiki-unlu-dusmesi.wiki') } } }] }] } });
  const a = parseWikiResponse(body, 'Ünlü düşmesi');
  assert.equal(a.title, 'Ünlü düşmesi');
  assert.ok(a.sections.length >= 4);
  assert.equal(redirectTarget('#YÖNLENDİRME [[Orantı]]'), 'Orantı');
  assert.throws(() => parseWikiResponse('#YÖNLENDİRME [[Orantı]]', 'Doğru orantı'), /taşınmış/);
  assert.throws(() => parseWikiResponse(JSON.stringify({ query: { pages: [{ title: 'Yok', missing: true }] } }), 'Yok'), /bulunamadı/);
  assert.equal(wikiRawUrl("Kur'an"), 'https://tr.wikipedia.org/w/index.php?title=Kur\'an&action=raw');
  assert.match(wikiApiUrl('İsim tamlaması'), /origin=\*&titles=%C4%B0sim%20tamlamas%C4%B1$/);
});

test('Vikipedi eşlemesi katalogla birebir; tekrar yok', () => {
  const ids = SUBJECTS.flatMap((s) => s.topics.map((t) => t.id));
  assert.deepEqual(Object.keys(WIKI_ARTICLES).sort(), [...ids].sort());
  const covered = ids.filter((id) => WIKI_ARTICLES[id].length > 0);
  assert.ok(covered.length >= 234, `yalnızca ${covered.length} konu kapsandı`);
  for (const [id, list] of Object.entries(WIKI_ARTICLES)) {
    assert.equal(new Set(list).size, list.length, `${id} içinde tekrar`);
    for (const t of list) assert.match(t, /^[A-ZÇĞİÖŞÜÂÎÛ0-9]/, `${id}: "${t}" büyük harfle başlamalı`);
  }
});
