import { test } from 'node:test';
import assert from 'node:assert/strict';

import { net, clampTally } from '../src/lib/net.ts';
import { streak, dayKey, daysUntil, parseTrDate, addDays } from '../src/lib/dates.ts';
import { shuffle, pick, worksheetText } from '../src/lib/quiz.ts';
import { QUESTIONS } from '../src/data/index.ts';

test('net: 4 yanlış 1 doğruyu götürür', () => {
  assert.equal(net(40, 0), 40);
  assert.equal(net(30, 8), 28);
  assert.equal(net(10, 3), 9.25);
  assert.equal(net(0, 4), -1);
});

test('clampTally soru sayısını aşmaz', () => {
  assert.deepEqual(clampTally({ correct: 35, wrong: 10, blank: 0 }, 40), { correct: 35, wrong: 5, blank: 0 });
  assert.deepEqual(clampTally({ correct: -2, wrong: 3.7, blank: 0 }, 40), { correct: 0, wrong: 3, blank: 37 });
});

test('seri: bugün çalışılmadıysa dünden sayılır, boşlukta kırılır', () => {
  const today = new Date(2026, 10, 16);
  const k = (n: number) => dayKey(addDays(today, n));
  assert.equal(streak([k(0), k(-1), k(-2)], today), 3);
  assert.equal(streak([k(-1), k(-2)], today), 2);
  assert.equal(streak([k(0), k(-2)], today), 1);
  assert.equal(streak([k(-2)], today), 0);
  assert.equal(streak([], today), 0);
});

test('seri ay ve yıl geçişlerinde doğru sayar', () => {
  const today = new Date(2027, 0, 1);
  assert.equal(streak(['2026-12-30', '2026-12-31', '2027-01-01'], today), 3);
});

test('sınava kalan gün', () => {
  assert.equal(daysUntil(new Date(2027, 5, 19), new Date(2027, 5, 18, 23, 59)), 1);
  assert.equal(daysUntil(new Date(2027, 5, 19), new Date(2027, 5, 19, 8)), 0);
});

test('GG.AA.YYYY ayrıştırma', () => {
  assert.equal(parseTrDate('19.06.2027')?.getMonth(), 5);
  assert.equal(parseTrDate('31.02.2027'), null);
  assert.equal(parseTrDate('2027-06-19'), null);
});

test('tohumlu karıştırma tekrarlanabilir ve elemanları korur', () => {
  const a = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.deepEqual(shuffle(a, 42), shuffle(a, 42));
  assert.deepEqual([...shuffle(a, 7)].sort(), a);
  assert.equal(pick(a, 3, 1).length, 3);
});

test('çalışma kâğıdı cevap anahtarı doğru harfleri içerir', () => {
  const qs = QUESTIONS.slice(0, 3);
  const text = worksheetText('Deneme', qs);
  const key = qs.map((q, i) => `${i + 1}-${'ABCDE'[q.answer]}`).join('  ');
  assert.ok(text.includes(key));
});
