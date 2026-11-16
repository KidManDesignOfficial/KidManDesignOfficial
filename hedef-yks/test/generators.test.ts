import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GENERATORS, generatedQuestion, generatedSet, questionFromGenId } from '../src/data/generators.ts';
import { SUBJECTS } from '../src/data/curriculum.ts';

const TOPICS = new Set(SUBJECTS.flatMap((s) => s.topics.map((t) => t.id)));
const SEEDS = 400;

test('üreticiler yalnızca katalogdaki konulara bağlı', () => {
  for (const id of Object.keys(GENERATORS)) assert.ok(TOPICS.has(id), id);
});

test('her üretici geçerli ÖSYM biçiminde soru üretir', () => {
  const bad: string[] = [];
  for (const topic of Object.keys(GENERATORS)) {
    for (let s = 1; s <= SEEDS; s++) {
      const q = generatedQuestion(topic, s)!;
      const all = [q.text, q.explanation, ...q.options].join(' ');
      if (q.options.length !== 5) bad.push(`${topic}#${s}: seçenek sayısı`);
      else if (new Set(q.options).size !== 5) bad.push(`${topic}#${s}: tekrarlı seçenek ${q.options}`);
      else if (!(q.answer >= 0 && q.answer <= 4)) bad.push(`${topic}#${s}: cevap`);
      else if (/NaN|undefined|Infinity|\[object/.test(all)) bad.push(`${topic}#${s}: bozuk metin ${all.slice(0, 80)}`);
      else if (q.options.some((o) => o.trim() === '')) bad.push(`${topic}#${s}: boş seçenek`);
    }
  }
  assert.deepEqual(bad.slice(0, 10), []);
});

test('çözüm açıklaması doğru seçeneğin değerini içerir (tutarlılık)', () => {
  const bad: string[] = [];
  for (const topic of Object.keys(GENERATORS)) {
    for (let s = 1; s <= SEEDS; s++) {
      const q = generatedQuestion(topic, s)!;
      const right = q.options[q.answer];
      const core = right.replace(/ (cm²|cm³|cm|kJ|mol|gram|g|m\/s²|m\/s|Pa|cal|kat|birim|TL|Ω|V|A|J|N|M|L|eV|μF|μC|m|°)$/u, '').replace(/^\s+|\s+$/g, '');
      const coreNoDeg = core.replace('°', '');
      if (!q.explanation.includes(core) && !q.explanation.includes(coreNoDeg)) bad.push(`${topic}#${s}: "${right}" açıklamada yok → ${q.explanation}`);
    }
  }
  assert.deepEqual(bad.slice(0, 10), []);
});

test('aynı tohum aynı soruyu verir; kimlik geri çözülür', () => {
  const a = generatedQuestion('tyt-mat.ebob-ekok', 42)!;
  assert.deepEqual(a, generatedQuestion('tyt-mat.ebob-ekok', 42));
  assert.deepEqual(a, questionFromGenId(a.id));
  assert.equal(questionFromGenId('tyt-mat.ebob-ekok#1'), null);
});

test('bir konudan yüzlerce farklı soru çıkar', () => {
  for (const topic of ['tyt-mat.denklem', 'tyt-fizik.enerji', 'tyt-kimya.mol', 'ayt-mat.turev']) {
    const set = generatedSet(topic, 100, 1);
    assert.ok(set.length >= 60, `${topic}: ${set.length}`);
  }
});

// Bağımsız doğrulama: üretici formülünden bağımsız elle kurulmuş kontroller
test('bağımsız kontrol: EBOB/EKOK, bölünebilme, permütasyon, kombinasyon', () => {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  for (let s = 1; s <= 300; s++) {
    const q = generatedQuestion('tyt-mat.ebob-ekok', s)!;
    const m = q.text.match(/^(\d+) ve (\d+) sayılarının (EBOB|EKOK)/)!;
    const [a, b] = [Number(m[1]), Number(m[2])];
    const want = m[3] === 'EBOB' ? gcd(a, b) : (a * b) / gcd(a, b);
    assert.equal(q.options[q.answer], String(want), q.text);
  }
  for (let s = 1; s <= 300; s++) {
    const q = generatedQuestion('tyt-mat.bolunebilme', s)!;
    const m = q.text.match(/^Üç basamaklı (\d)A(\d) sayısı (\d) ile/)!;
    let sum = 0;
    for (let A = 0; A <= 9; A++) if (Number(`${m[1]}${A}${m[2]}`) % Number(m[3]) === 0) sum += A;
    assert.equal(q.options[q.answer], String(sum).replace('-', '−'), q.text);
  }
  for (let s = 1; s <= 300; s++) {
    const q = generatedQuestion('ayt-mat.kombinasyon', s)!;
    const m = q.text.match(/^(\d+) kişilik bir gruptan (\d+) kişilik/);
    if (!m) continue;
    const [n, k] = [Number(m[1]), Number(m[2])];
    const row = [1];
    for (let i = 1; i <= n; i++) for (let j = i; j >= 1; j--) row[j] = (row[j] ?? 0) + row[j - 1];
    assert.equal(q.options[q.answer], String(row[k]), q.text);
  }
});
