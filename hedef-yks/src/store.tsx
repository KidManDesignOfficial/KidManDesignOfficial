/**
 * Uygulama durumu: profil, ayarlar, ilerleme, cevaplar, yanlış defteri, denemeler.
 * Tek bir JSON nesnesi olarak cihazda saklanır (AsyncStorage). Sunucu yoktur; veri telefondan çıkmaz.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { DEFAULT_EXAM_DATE } from './config';
import type { Field } from './data/types';
import { dayKey } from './lib/dates';
import type { TextSize, ThemeMode } from './theme';

const KEY = 'hedefyks:state:v1';

export type Role = 'student' | 'teacher';

export type AnswerRecord = { chosen: number; correct: boolean; at: number; attempts: number; wrongs: number };
export type DayActivity = { questions: number; correct: number; lessons: number };
export type ExamRecord = {
  id: string;
  at: number;
  title: string;
  /** dersId → doğru/yanlış/boş */
  bySubject: Record<string, { correct: number; wrong: number; blank: number }>;
  seconds: number;
};

export type AppState = {
  onboarded: boolean;
  name: string;
  role: Role;
  field: Field;
  dailyGoal: number;
  examDate: string;
  mode: ThemeMode;
  textSize: TextSize;
  haptics: boolean;
  completedLessons: Record<string, number>;
  lastLesson?: string;
  answers: Record<string, AnswerRecord>;
  /** Yanlış yapılan, henüz "öğrendim" denmemiş soru kimlikleri. */
  wrongBook: string[];
  bookmarks: string[];
  activity: Record<string, DayActivity>;
  exams: ExamRecord[];
};

export const INITIAL_STATE: AppState = {
  onboarded: false,
  name: '',
  role: 'student',
  field: 'SAY',
  dailyGoal: 20,
  examDate: DEFAULT_EXAM_DATE,
  mode: 'system',
  textSize: 'normal',
  haptics: true,
  completedLessons: {},
  answers: {},
  wrongBook: [],
  bookmarks: [],
  activity: {},
  exams: [],
};

type Store = {
  state: AppState;
  ready: boolean;
  update: (patch: Partial<AppState>) => void;
  recordAnswer: (questionId: string, chosen: number, correct: boolean) => void;
  completeLesson: (topicId: string) => void;
  openLesson: (topicId: string) => void;
  resolveWrong: (questionId: string) => void;
  toggleBookmark: (topicId: string) => void;
  saveExam: (exam: ExamRecord) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

function bumpActivity(s: AppState, patch: Partial<DayActivity>): Record<string, DayActivity> {
  const k = dayKey();
  const cur = s.activity[k] ?? { questions: 0, correct: 0, lessons: 0 };
  return {
    ...s.activity,
    [k]: {
      questions: cur.questions + (patch.questions ?? 0),
      correct: cur.correct + (patch.correct ?? 0),
      lessons: cur.lessons + (patch.lessons ?? 0),
    },
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<AppState>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  // Yazmalar kısa bir gecikmeyle birleştirilir: test çözerken her dokunuşta disk yazılmaz.
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    }, 400);
  }, [state, ready]);

  const update = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);

  const recordAnswer = useCallback((questionId: string, chosen: number, correct: boolean) => {
    setState((s) => {
      const prev = s.answers[questionId];
      const rec: AnswerRecord = {
        chosen,
        correct,
        at: Date.now(),
        attempts: (prev?.attempts ?? 0) + 1,
        wrongs: (prev?.wrongs ?? 0) + (correct ? 0 : 1),
      };
      const inBook = s.wrongBook.includes(questionId);
      return {
        ...s,
        answers: { ...s.answers, [questionId]: rec },
        wrongBook: !correct && !inBook ? [questionId, ...s.wrongBook] : s.wrongBook,
        activity: bumpActivity(s, { questions: 1, correct: correct ? 1 : 0 }),
      };
    });
  }, []);

  const completeLesson = useCallback((topicId: string) => {
    setState((s) =>
      s.completedLessons[topicId]
        ? s
        : { ...s, completedLessons: { ...s.completedLessons, [topicId]: Date.now() }, activity: bumpActivity(s, { lessons: 1 }) },
    );
  }, []);

  const openLesson = useCallback((topicId: string) => setState((s) => ({ ...s, lastLesson: topicId })), []);

  const resolveWrong = useCallback(
    (questionId: string) => setState((s) => ({ ...s, wrongBook: s.wrongBook.filter((id) => id !== questionId) })),
    [],
  );

  const toggleBookmark = useCallback(
    (topicId: string) =>
      setState((s) => ({
        ...s,
        bookmarks: s.bookmarks.includes(topicId) ? s.bookmarks.filter((t) => t !== topicId) : [topicId, ...s.bookmarks],
      })),
    [],
  );

  const saveExam = useCallback((exam: ExamRecord) => setState((s) => ({ ...s, exams: [exam, ...s.exams].slice(0, 50) })), []);

  const reset = useCallback(
    () =>
      setState((s) => ({
        ...INITIAL_STATE,
        onboarded: true,
        name: s.name,
        role: s.role,
        field: s.field,
        dailyGoal: s.dailyGoal,
        examDate: s.examDate,
        mode: s.mode,
        textSize: s.textSize,
        haptics: s.haptics,
      })),
    [],
  );

  const value = useMemo(
    () => ({ state, ready, update, recordAnswer, completeLesson, openLesson, resolveWrong, toggleBookmark, saveExam, reset }),
    [state, ready, update, recordAnswer, completeLesson, openLesson, resolveWrong, toggleBookmark, saveExam, reset],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore, StoreProvider içinde kullanılmalı.');
  return v;
}
