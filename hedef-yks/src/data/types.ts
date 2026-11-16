/**
 * İçerik veri modeli.
 *
 * - Ders (Subject) ve konu (Topic) kataloğu `curriculum.ts` içindedir; ÖSYM YKS kapsamını izler.
 * - Konu anlatımları (Lesson) ve sorular (Question) `subjects/*.ts` dosyalarında, konu kimliğine
 *   (topicId) bağlanarak yazılır. Yeni içerik eklemek için yalnızca bu dosyalara kayıt eklemek yeterlidir.
 */

export type Exam = 'TYT' | 'AYT';
/** Puan türleri: Sayısal, Eşit Ağırlık, Sözel, Dil. */
export type Field = 'SAY' | 'EA' | 'SOZ' | 'DIL';

export type TopicMeta = {
  id: string;
  title: string;
};

export type Subject = {
  id: string;
  exam: Exam;
  name: string;
  /** Kısa ad (sonuç tablolarında). */
  short: string;
  icon: string;
  /** Kart degrade renkleri [açık, koyu]. */
  colors: [string, string];
  /** Sınavda bu dersten gelen yaklaşık soru sayısı. */
  examQuestions: number;
  /** Testin adı (net hesaplamada gruplama için), ör. "Temel Matematik". */
  test: string;
  /** Hangi puan türlerinde etkili olduğu (TYT tüm türlerde etkilidir). */
  fields: Field[];
  topics: TopicMeta[];
};

export type PlotFn = { label: string; color?: string; f: (x: number) => number };

export type Block =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'formula'; title?: string; lines: string[] }
  | { type: 'tip'; tone?: 'info' | 'warn' | 'exam'; text: string }
  | { type: 'example'; question: string; steps: string[]; answer: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'timeline'; items: { date: string; title: string; text?: string }[] }
  | { type: 'flow'; title?: string; items: string[] }
  | {
      type: 'plot';
      caption: string;
      x: [number, number];
      y: [number, number];
      fns: PlotFn[];
    };

export type Flashcard = { front: string; back: string };

export type Lesson = {
  topicId: string;
  /** Tahmini okuma süresi (dakika). */
  minutes: number;
  /** Bir cümlelik özet. */
  intro: string;
  blocks: Block[];
  cards?: Flashcard[];
};

export type Difficulty = 1 | 2 | 3;

export type Question = {
  id: string;
  topicId: string;
  text: string;
  /** ÖSYM biçimi: her zaman beş seçenek (A–E). */
  options: [string, string, string, string, string];
  /** Doğru seçeneğin sırası (0 = A). */
  answer: 0 | 1 | 2 | 3 | 4;
  explanation: string;
  difficulty: Difficulty;
};

export type SubjectContent = {
  subjectId: string;
  lessons: Lesson[];
  questions: Question[];
};
