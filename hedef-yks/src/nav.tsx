/**
 * Hafif gezinme katmanı: alt sekmeler + üstte yığın (stack) ekranlar.
 *
 * Sekmeler bir kez bağlanır ve bağlı kalır (kaydırma konumu korunur). Yığına eklenen ekranlar
 * sağdan kayarak gelir, geri dönüşte kayarak çıkar. Android geri tuşu önce yığını boşaltır.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet } from 'react-native';

import { EASE_OUT, useAnimatedValue, useReducedMotion } from './components/motion';
import { useTheme } from './theme';

export type Tab = 'home' | 'subjects' | 'exam' | 'official' | 'profile';

export type QuizMode = 'practice' | 'exam';
export type QuizConfig = {
  title: string;
  questionIds: string[];
  mode: QuizMode;
  /** Saniye; verilmezse süre sınırı yok (yalnızca geçen süre gösterilir). */
  timeLimit?: number;
  /** Sonuç ekranında "tekrar çöz" için kaynak. */
  kind?: 'topic' | 'subject' | 'mixed' | 'wrongbook' | 'daily' | 'deneme' | 'teacher';
};
export type QuizResult = { config: QuizConfig; answers: (number | null)[]; seconds: number };

export type Route =
  | { name: 'subject'; subjectId: string }
  | { name: 'lesson'; topicId: string }
  | { name: 'quiz'; config: QuizConfig }
  | { name: 'result'; result: QuizResult }
  | { name: 'wrongbook' }
  | { name: 'bookmarks' }
  | { name: 'flashcards'; subjectId?: string }
  | { name: 'netcalc' }
  | { name: 'settings' }
  | { name: 'about' }
  | { name: 'announcements' }
  | { name: 'papers' }
  | { name: 'teacher' };

type Entry = { key: number; route: Route; leaving: boolean };

type Nav = {
  tab: Tab;
  setTab: (t: Tab) => void;
  push: (r: Route) => void;
  /** Üstteki ekranı yenisiyle değiştirir (ör. testten sonuca geçiş). */
  replace: (r: Route) => void;
  pop: () => void;
  popToRoot: () => void;
  depth: number;
};

const Ctx = createContext<Nav | null>(null);

export function useNav(): Nav {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav, NavProvider içinde kullanılmalı.');
  return v;
}

export function NavProvider({
  renderTab,
  renderRoute,
  tabBar,
}: {
  renderTab: (t: Tab, active: boolean) => ReactNode;
  renderRoute: (r: Route) => ReactNode;
  tabBar: (tab: Tab, setTab: (t: Tab) => void) => ReactNode;
}) {
  const [tab, setTabState] = useState<Tab>('home');
  const [mounted, setMounted] = useState<Set<Tab>>(() => new Set(['home']));
  const [stack, setStack] = useState<Entry[]>([]);
  const nextKey = useRef(1);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    setMounted((m) => (m.has(t) ? m : new Set(m).add(t)));
  }, []);
  const push = useCallback((route: Route) => setStack((s) => [...s, { key: nextKey.current++, route, leaving: false }]), []);
  const replace = useCallback(
    (route: Route) =>
      setStack((s) => {
        const live = s.filter((e) => !e.leaving);
        return [...live.slice(0, -1), { key: nextKey.current++, route, leaving: false }];
      }),
    [],
  );
  const pop = useCallback(
    () =>
      setStack((s) => {
        const idx = s.map((e) => e.leaving).lastIndexOf(false);
        if (idx < 0) return s;
        return s.map((e, i) => (i === idx ? { ...e, leaving: true } : e));
      }),
    [],
  );
  const popToRoot = useCallback(() => setStack((s) => s.map((e) => ({ ...e, leaving: true }))), []);
  const remove = useCallback((key: number) => setStack((s) => s.filter((e) => e.key !== key)), []);

  const depth = stack.filter((e) => !e.leaving).length;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (depth > 0) {
        pop();
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [depth, pop, tab, setTab]);

  const value = useMemo(() => ({ tab, setTab, push, replace, pop, popToRoot, depth }), [tab, setTab, push, replace, pop, popToRoot, depth]);
  const { c } = useTheme();

  return (
    <Ctx.Provider value={value}>
      <Animated.View style={[styles.fill, { backgroundColor: c.bg }]}>
        {(['home', 'subjects', 'exam', 'official', 'profile'] as Tab[]).map((t) =>
          mounted.has(t) ? (
            <Animated.View key={t} style={[styles.fill, t !== tab && styles.hidden]}>
              {renderTab(t, t === tab)}
            </Animated.View>
          ) : null,
        )}
      </Animated.View>
      {tabBar(tab, setTab)}
      {stack.map((e) => (
        <StackLayer key={e.key} leaving={e.leaving} onGone={() => remove(e.key)}>
          {renderRoute(e.route)}
        </StackLayer>
      ))}
    </Ctx.Provider>
  );
}

function StackLayer({ children, leaving, onGone }: { children: ReactNode; leaving: boolean; onGone: () => void }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  const width = Dimensions.get('window').width;

  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration: reduced ? 0 : 320, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [p, reduced]);

  useEffect(() => {
    if (!leaving) return;
    Animated.timing(p, { toValue: 0, duration: reduced ? 0 : 240, easing: EASE_OUT, useNativeDriver: true }).start(() => onGone());
  }, [leaving, p, reduced, onGone]);

  const translateX = p.interpolate({ inputRange: [0, 1], outputRange: [width * 0.6, 0] });
  return (
    <Animated.View
      pointerEvents={leaving ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, opacity: p, transform: [{ translateX }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
});
