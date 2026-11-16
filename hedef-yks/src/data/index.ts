/**
 * Tüm içeriğin tek giriş noktası. Ekranlar içeriğe yalnızca buradan erişir.
 */
import { SUBJECTS, SUBJECT_BY_ID, subjectOfTopic, topicTitle, FIELD_LABELS } from './curriculum.ts';
import type { Lesson, Question, SubjectContent } from './types.ts';
import tytTurkce from './subjects/tyt-turkce.ts';
import tytMat from './subjects/tyt-mat.ts';
import tytGeo from './subjects/tyt-geo.ts';
import tytFen from './subjects/tyt-fen.ts';
import tytSosyal from './subjects/tyt-sosyal.ts';
import aytMat from './subjects/ayt-mat.ts';
import aytFen from './subjects/ayt-fen.ts';
import aytSozel from './subjects/ayt-sozel.ts';
import { EXTRA } from './subjects/ext/index.ts';

export const CONTENT: SubjectContent[] = [tytTurkce, tytMat, tytGeo, ...tytFen, ...tytSosyal, ...aytMat, ...aytFen, ...aytSozel, ...EXTRA];

export const LESSONS: Lesson[] = CONTENT.flatMap((c) => c.lessons);
export const QUESTIONS: Question[] = CONTENT.flatMap((c) => c.questions);

export const LESSON_BY_TOPIC: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.topicId, l]));
export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export function questionsOfTopic(topicId: string): Question[] {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

export function questionsOfSubject(subjectId: string): Question[] {
  return QUESTIONS.filter((q) => q.topicId.startsWith(`${subjectId}.`));
}

export function lessonsOfSubject(subjectId: string): Lesson[] {
  return LESSONS.filter((l) => l.topicId.startsWith(`${subjectId}.`));
}

export { SUBJECTS, SUBJECT_BY_ID, subjectOfTopic, topicTitle, FIELD_LABELS };
export type * from './types.ts';
