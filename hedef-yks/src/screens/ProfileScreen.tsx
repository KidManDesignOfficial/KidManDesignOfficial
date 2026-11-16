import { useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../components/Icon';
import { EASE_OUT, useAnimatedValue, useReducedMotion } from '../components/motion';
import { Card, IconBadge, ProgressBar, SectionTitle, Stat, T } from '../components/ui';
import { FIELD_LABELS } from '../data';
import { lastWeek, subjectProgress, subjectsForField, totals } from '../lib/progress';
import { useNav } from '../nav';
import type { Route } from '../nav';
import { useStore } from '../store';
import { useTheme } from '../theme';

export default function ProfileScreen() {
  const { c } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const t = totals(state);
  const week = lastWeek(state);
  const max = Math.max(state.dailyGoal, ...week.map((d) => d.questions));

  const links: { icon: IconName; label: string; color: string; route: Route; badge?: number }[] = [
    { icon: 'easel', label: 'Öğretmen paneli', color: c.info, route: { name: 'teacher' } },
    { icon: 'documents', label: 'ÖSYM çıkmış sorular', color: '#1E4FA0', route: { name: 'papers' } },
    { icon: 'bookmarks', label: 'Yanlış Defteri', color: c.danger, route: { name: 'wrongbook' }, badge: state.wrongBook.length },
    { icon: 'bookmark', label: 'Kaydedilen konular', color: c.warning, route: { name: 'bookmarks' }, badge: state.bookmarks.length },
    { icon: 'albums', label: 'Formül ve bilgi kartları', color: c.success, route: { name: 'flashcards' } },
    { icon: 'calculator', label: 'Net hesaplama', color: c.info, route: { name: 'netcalc' } },
    { icon: 'settings', label: 'Ayarlar', color: c.textMuted, route: { name: 'settings' } },
    { icon: 'information-circle', label: 'Hakkında ve gizlilik', color: c.primary, route: { name: 'about' } },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <T size={24} weight="900" color="#FFFFFF">
            {(state.name || 'Ö').slice(0, 1).toLocaleUpperCase('tr-TR')}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T size={22} weight="900">
            {state.name || (state.role === 'teacher' ? 'Öğretmen' : 'Öğrenci')}
          </T>
          <T muted>
            {state.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'} · {FIELD_LABELS[state.field]} · Günlük hedef {state.dailyGoal} soru
          </T>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="Günlük seri" value={`${t.streak} gün`} icon="flame" color={c.accent} />
        <Stat label="Çözülen" value={String(t.answered)} icon="checkmark-done" color={c.primary} />
        <Stat label="Başarı" value={`%${Math.round(t.accuracy * 100)}`} icon="trending-up" color={c.success} />
      </View>

      <Card style={{ gap: 14 }}>
        <T weight="800">Son 7 gün</T>
        <View style={styles.chart}>
          {week.map((d, i) => (
            <Bar key={d.key} value={d.questions / Math.max(1, max)} label={d.label} count={d.questions} delay={i * 60} today={i === 6} goal={d.questions >= state.dailyGoal} />
          ))}
        </View>
      </Card>

      <SectionTitle title="Ders ilerlemesi" />
      <Card style={{ gap: 14 }}>
        {subjectsForField(state.field).map((s) => {
          const p = subjectProgress(s, state);
          return (
            <View key={s.id} style={{ gap: 6 }}>
              <View style={styles.row}>
                <T size={14} weight="700" style={{ flex: 1 }}>
                  {s.exam} {s.name}
                </T>
                <T size={12.5} muted>
                  {p.answered ? `%${Math.round(p.accuracy * 100)} doğru · ` : ''}%{Math.round(p.overall * 100)}
                </T>
              </View>
              <ProgressBar value={p.overall} color={s.colors[0]} height={7} />
            </View>
          );
        })}
      </Card>

      <Card style={{ padding: 6 }}>
        {links.map((l, i) => (
          <View key={l.label}>
            {i > 0 ? <View style={[styles.sep, { backgroundColor: c.border }]} /> : null}
            <Card onPress={() => nav.push(l.route)} style={styles.link} accessibilityLabel={l.label}>
              <IconBadge name={l.icon} color={l.color} size={36} />
              <T weight="700" style={{ flex: 1 }}>
                {l.label}
              </T>
              {l.badge ? (
                <View style={[styles.badge, { backgroundColor: l.color }]}>
                  <T size={12} weight="800" color="#FFFFFF">
                    {l.badge}
                  </T>
                </View>
              ) : null}
              <Icon name="chevron-forward" size={18} color={c.textFaint} />
            </Card>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function Bar({ value, label, count, delay, today, goal }: { value: number; label: string; count: number; delay: number; today: boolean; goal: boolean }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(p, { toValue: value, duration: reduced ? 0 : 700, delay, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [value, p, delay, reduced]);
  const height = p.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] });
  return (
    <View style={styles.barCol} accessibilityLabel={`${label}: ${count} soru`}>
      <T size={11} weight="700" muted>
        {count || ''}
      </T>
      <View style={styles.barTrack}>
        <Animated.View style={{ height, width: '100%', borderRadius: 8, backgroundColor: goal ? c.success : today ? c.primary : c.primarySoft }} />
      </View>
      <T size={11.5} weight={today ? '800' : '500'} color={today ? c.primary : c.textMuted}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
  chart: { flexDirection: 'row', height: 140, gap: 8, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  barTrack: { flex: 1, width: '72%', justifyContent: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0, shadowOpacity: 0, elevation: 0, paddingVertical: 12 },
  sep: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  badge: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
});
