/**
 * Kayıtlı cevaplardan ve tamamlanan konulardan istatistik üretir.
 */
import { LESSON_BY_TOPIC, QUESTIONS, SUBJECTS, questionsOfSubject } from '../data';
import type { Exam, Field, Question, Subject } from '../data';
import type { AppState } from '../store';
import { addDays, dayKey, daySeed, streak } from './dates';
import { pick, shuffle } from './quiz';

export function subjectProgress(s: Subject, state: AppState) {
  const lessonTopics = s.topics.filter((t) => LESSON_BY_TOPIC[t.id]);
  const done = lessonTopics.filter((t) => state.completedLessons[t.id]).length;
  const qs = questionsOfSubject(s.id);
  const answered = qs.filter((q) => state.answers[q.id]);
  const correct = answered.filter((q) => state.answers[q.id].correct).length;
  return {
    lessons: lessonTopics.length,
    lessonsDone: done,
    questions: qs.length,
    answered: answered.length,
    correct,
    accuracy: answered.length ? correct / answered.length : 0,
    /** Konu + soru ilerlemesinin ortalaması (0–1). */
    overall: ((lessonTopics.length ? done / lessonTopics.length : 0) + (qs.length ? answered.length / qs.length : 0)) / 2,
  };
}

export function totals(state: AppState) {
  const answers = Object.values(state.answers);
  const correct = answers.filter((a) => a.correct).length;
  return {
    answered: answers.length,
    correct,
    accuracy: answers.length ? correct / answers.length : 0,
    lessons: Object.keys(state.completedLessons).length,
    streak: streak(Object.keys(state.activity).filter((k) => (state.activity[k].questions + state.activity[k].lessons) > 0)),
    today: state.activity[dayKey()] ?? { questions: 0, correct: 0, lessons: 0 },
  };
}

/** Son 7 günün soru sayıları (eskiden yeniye). */
export function lastWeek(state: AppState): { key: string; label: string; questions: number }[] {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const k = dayKey(d);
    return { key: k, label: days[d.getDay()], questions: state.activity[k]?.questions ?? 0 };
  });
}

/** Seçilen alana göre önerilen dersler: TYT hepsi + AYT'de alanın dersleri. */
export function subjectsForField(field: Field, exam?: Exam): Subject[] {
  return SUBJECTS.filter((s) => (exam ? s.exam === exam : true) && s.fields.includes(field));
}

/** Günün sorusu: her gün herkes için aynı, alana uygun bir soru. */
export function dailyQuestion(field: Field): Question {
  const allowed = new Set(subjectsForField(field).map((s) => s.id));
  const pool = QUESTIONS.filter((q) => allowed.has(q.topicId.split('.')[0]));
  return pool[daySeed(dayKey()) % pool.length];
}

/**
 * Mini deneme: gerçek sınavın ders oranlarını koruyarak her dersten soru seçer.
 * `scale` = gerçek soru sayısının kaçta kaçı (ör. 0.25 → TYT için ~30 soru).
 */
export function buildDeneme(exam: Exam, field: Field, scale: number, seed: number): Question[] {
  const subjects = SUBJECTS.filter((s) => s.exam === exam && (exam === 'TYT' || s.fields.includes(field)));
  const out: Question[] = [];
  for (const s of subjects) {
    const want = Math.max(1, Math.round(s.examQuestions * scale));
    out.push(...pick(questionsOfSubject(s.id), want, seed + s.id.length * 31));
  }
  return out;
}

/** Zayıf konular: en az 2 cevaplı ve doğruluk oranı %60'ın altında olanlar. */
export function weakTopics(state: AppState, limit = 5): { topicId: string; accuracy: number; answered: number }[] {
  const by: Record<string, { c: number; n: number }> = {};
  for (const q of QUESTIONS) {
    const a = state.answers[q.id];
    if (!a) continue;
    by[q.topicId] ??= { c: 0, n: 0 };
    by[q.topicId].n += 1;
    if (a.correct) by[q.topicId].c += 1;
  }
  return Object.entries(by)
    .filter(([, v]) => v.n >= 2 && v.c / v.n < 0.6)
    .map(([topicId, v]) => ({ topicId, accuracy: v.c / v.n, answered: v.n }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

export function randomMix(subjectIds: string[], count: number, seed: number): Question[] {
  const pool = QUESTIONS.filter((q) => subjectIds.includes(q.topicId.split('.')[0]));
  return shuffle(pool, seed).slice(0, count);
}
