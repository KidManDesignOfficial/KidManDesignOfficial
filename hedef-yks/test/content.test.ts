import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SUBJECTS } from '../src/data/curriculum.ts';
import { CONTENT, LESSONS, QUESTIONS } from '../src/data/index.ts';

const topicIds = new Set(SUBJECTS.flatMap((s) => s.topics.map((t) => t.id)));

test('ders ve konu kimlikleri benzersiz', () => {
  assert.equal(new Set(SUBJECTS.map((s) => s.id)).size, SUBJECTS.length);
  const all = SUBJECTS.flatMap((s) => s.topics.map((t) => t.id));
  assert.equal(new Set(all).size, all.length);
});

test('TYT ve AYT dersleri ÖSYM soru sayılarıyla uyumlu', () => {
  const sum = (exam: string) => SUBJECTS.filter((s) => s.exam === exam).reduce((n, s) => n + s.examQuestions, 0);
  assert.equal(sum('TYT'), 120);
  assert.equal(sum('AYT'), 160);
});

test('her içerik kaydı mevcut bir konuya bağlı', () => {
  for (const l of LESSONS) assert.ok(topicIds.has(l.topicId), `bilinmeyen konu: ${l.topicId}`);
  for (const q of QUESTIONS) assert.ok(topicIds.has(q.topicId), `bilinmeyen konu: ${q.topicId}`);
});

test('her konu için en fazla bir anlatım var', () => {
  const ids = LESSONS.map((l) => l.topicId);
  assert.equal(new Set(ids).size, ids.length);
});

test('her dersin en az iki konu anlatımı ve sekiz sorusu var', () => {
  for (const s of SUBJECTS) {
    const lessons = LESSONS.filter((l) => l.topicId.startsWith(`${s.id}.`));
    const qs = QUESTIONS.filter((q) => q.topicId.startsWith(`${s.id}.`));
    assert.ok(lessons.length >= 2, `${s.id}: ${lessons.length} anlatım`);
    assert.ok(qs.length >= 8, `${s.id}: ${qs.length} soru`);
  }
});

test('anlatımı olan her konunun en az üç sorusu var', () => {
  for (const l of LESSONS) {
    const n = QUESTIONS.filter((q) => q.topicId === l.topicId).length;
    assert.ok(n >= 3, `${l.topicId}: ${n} soru`);
  }
});

test('sorular ÖSYM biçiminde: 5 farklı, boş olmayan seçenek ve geçerli cevap', () => {
  const ids = new Set<string>();
  for (const q of QUESTIONS) {
    assert.ok(!ids.has(q.id), `yinelenen soru kimliği ${q.id}`);
    ids.add(q.id);
    assert.equal(q.options.length, 5, q.id);
    assert.equal(new Set(q.options.map((o) => o.trim())).size, 5, `${q.id}: aynı seçenek iki kez`);
    for (const o of q.options) assert.ok(o.trim().length > 0, q.id);
    assert.ok(q.answer >= 0 && q.answer <= 4, q.id);
    assert.ok(q.text.trim().length > 10, q.id);
    assert.ok(q.explanation.trim().length > 10, `${q.id}: açıklama eksik`);
    assert.ok([1, 2, 3].includes(q.difficulty), q.id);
  }
});

test('açıklamalar seçenek harfine dayanmıyor (karıştırmaya dayanıklı)', () => {
  for (const q of QUESTIONS) {
    assert.ok(!/(^|[.:;]\s)[A-E]\)\s|seçenek [A-E]\b|\b[A-E] seçeneği|cevap [A-E]\b/i.test(q.explanation), `${q.id}: açıklamada harf var`);
  }
});

test('anlatım blokları dolu ve grafik fonksiyonları sayı üretiyor', () => {
  for (const l of LESSONS) {
    assert.ok(l.blocks.length >= 3, l.topicId);
    assert.ok(l.intro.length > 20, l.topicId);
    for (const b of l.blocks) {
      if (b.type === 'plot') {
        for (const fn of b.fns) {
          const mid = (b.x[0] + b.x[1]) / 2;
          assert.equal(typeof fn.f(mid), 'number', l.topicId);
        }
      }
      if (b.type === 'table') for (const r of b.rows) assert.equal(r.length, b.head.length, `${l.topicId}: tablo sütun sayısı`);
    }
  }
});

test('içerik özeti', () => {
  console.log(`  ${SUBJECTS.length} ders, ${topicIds.size} konu, ${LESSONS.length} anlatım, ${QUESTIONS.length} soru, ${CONTENT.length} içerik dosyası`);
});

test('katalogdaki her konunun anlatımı var', () => {
  const missing = SUBJECTS.flatMap((s) => s.topics).filter((t) => !LESSONS.some((l) => l.topicId === t.id)).map((t) => t.id);
  assert.deepEqual(missing, [], `${missing.length} konunun anlatımı eksik`);
});
