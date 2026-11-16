/**
 * İçerik yazımını kısaltan yardımcılar. Her ders dosyası `builder('<ders>')` ile başlar;
 * konu kimlikleri ders kimliğiyle otomatik birleştirilir (`tyt-mat` + `uslu` → `tyt-mat.uslu`).
 */
import type { Block, Difficulty, Flashcard, Lesson, PlotFn, Question, SubjectContent } from './types.ts';

type Letter = 'A' | 'B' | 'C' | 'D' | 'E';
const LETTERS: Letter[] = ['A', 'B', 'C', 'D', 'E'];

/**
 * @param tag Aynı derse ikinci bir dosyadan soru eklenirken kimlik çakışmasını önler (`…#b1`).
 *            Kimlikler cihazdaki ilerlemeyle eşleştiği için sonradan değiştirilmemelidir.
 */
export function builder(subjectId: string, tag = '') {
  const lessons: Lesson[] = [];
  const questions: Question[] = [];
  const counters: Record<string, number> = {};

  return {
    lesson(slug: string, minutes: number, intro: string, blocks: Block[], cards?: Flashcard[]) {
      lessons.push({ topicId: `${subjectId}.${slug}`, minutes, intro, blocks, cards });
    },
    q(
      slug: string,
      text: string,
      options: [string, string, string, string, string],
      answer: Letter,
      explanation: string,
      difficulty: Difficulty = 2,
    ) {
      const topicId = `${subjectId}.${slug}`;
      counters[topicId] = (counters[topicId] ?? 0) + 1;
      questions.push({
        id: `${topicId}#${tag}${counters[topicId]}`,
        topicId,
        text,
        options,
        answer: LETTERS.indexOf(answer) as Question['answer'],
        explanation,
        difficulty,
      });
    },
    done(): SubjectContent {
      return { subjectId, lessons, questions };
    },
  };
}

// Blok kısaltmaları
export const H = (text: string): Block => ({ type: 'heading', text });
export const P = (text: string): Block => ({ type: 'text', text });
export const UL = (...items: string[]): Block => ({ type: 'bullets', items });
export const F = (title: string | undefined, ...lines: string[]): Block => ({ type: 'formula', title, lines });
export const TIP = (text: string, tone: 'info' | 'warn' | 'exam' = 'exam'): Block => ({ type: 'tip', tone, text });
export const EX = (question: string, steps: string[], answer: string): Block => ({ type: 'example', question, steps, answer });
export const TABLE = (head: string[], ...rows: string[][]): Block => ({ type: 'table', head, rows });
export const TIMELINE = (...items: [string, string, string?][]): Block => ({
  type: 'timeline',
  items: items.map(([date, title, text]) => ({ date, title, text })),
});
export const FLOW = (title: string | undefined, ...items: string[]): Block => ({ type: 'flow', title, items });
export const PLOT = (caption: string, x: [number, number], y: [number, number], ...fns: PlotFn[]): Block => ({
  type: 'plot',
  caption,
  x,
  y,
  fns,
});
export const card = (front: string, back: string): Flashcard => ({ front, back });
