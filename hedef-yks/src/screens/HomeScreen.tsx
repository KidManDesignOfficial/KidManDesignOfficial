import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon, type IconName } from '../components/Icon';
import { PressableScale } from '../components/motion';
import { ProgressRing } from '../components/ProgressRing';
import { Card, IconBadge, SectionTitle, T } from '../components/ui';
import { LESSON_BY_TOPIC, SUBJECT_BY_ID, subjectOfTopic, topicTitle } from '../data';
import { daysUntil, longTrDate, parseTrDate } from '../lib/dates';
import { tapFeedback } from '../lib/haptics';
import { dailyQuestion, randomMix, subjectsForField, totals, weakTopics } from '../lib/progress';
import { letter } from '../lib/quiz';
import { useNav } from '../nav';
import { useStore } from '../store';
import { GRADIENT, alpha, useTheme } from '../theme';
import { DEFAULT_EXAM_DATE } from '../config';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function HomeScreen() {
  const { c, dark } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const t = totals(state);
  const exam = parseTrDate(state.examDate) ?? parseTrDate(DEFAULT_EXAM_DATE)!;
  const left = daysUntil(exam);
  const goal = Math.min(1, t.today.questions / Math.max(1, state.dailyGoal));
  const daily = useMemo(() => dailyQuestion(state.field), [state.field]);
  const dailyDone = state.answers[daily.id];
  const weak = weakTopics(state, 3);
  const last = state.lastLesson && LESSON_BY_TOPIC[state.lastLesson] ? state.lastLesson : undefined;
  const lastSubject = last ? subjectOfTopic(last) : undefined;

  const quick: { icon: IconName; label: string; color: string; onPress: () => void }[] = [
    {
      icon: 'flash',
      label: 'Hızlı 10',
      color: c.accent,
      onPress: () =>
        nav.push({
          name: 'quiz',
          config: { title: 'Hızlı 10 soru', mode: 'practice', kind: 'mixed', questionIds: randomMix(subjectsForField(state.field).map((s) => s.id), 10, Date.now()).map((q) => q.id) },
        }),
    },
    { icon: 'bookmarks', label: 'Yanlışlarım', color: c.danger, onPress: () => nav.push({ name: 'wrongbook' }) },
    { icon: 'albums', label: 'Kartlar', color: c.success, onPress: () => nav.push({ name: 'flashcards' }) },
    { icon: 'calculator', label: 'Net hesapla', color: c.info, onPress: () => nav.push({ name: 'netcalc' }) },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={dark ? GRADIENT.heroDark : GRADIENT.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <Appear>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <T size={14} color="rgba(255,255,255,0.8)">
                {greeting()}
                {state.name ? `, ${state.name}` : ''} 👋
              </T>
              <T size={24} weight="800" color="#FFFFFF">
                Hedefe bir adım daha
              </T>
            </View>
            <View style={styles.streak} accessibilityLabel={`${t.streak} günlük seri`}>
              <Icon name="flame" size={18} color="#FFB547" />
              <T size={16} weight="800" color="#FFFFFF">
                {t.streak}
              </T>
            </View>
          </View>
        </Appear>
        <Appear delay={80}>
          <View style={styles.countdown}>
            <View style={{ flex: 1, gap: 4 }}>
              <T size={12.5} weight="700" color="rgba(255,255,255,0.75)">
                YKS 2027’YE KALAN
              </T>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
                <T size={44} weight="900" color="#FFFFFF" style={{ lineHeight: 50 }}>
                  {Math.max(0, left)}
                </T>
                <T size={17} weight="700" color="rgba(255,255,255,0.85)" style={{ marginBottom: 8 }}>
                  gün
                </T>
              </View>
              <T size={12.5} color="rgba(255,255,255,0.75)">
                TYT: {longTrDate(exam)}
              </T>
            </View>
            <ProgressRing value={goal} size={96} stroke={10} colors={['#FFD27A', '#FF7A45']} track="rgba(255,255,255,0.18)">
              <T size={20} weight="900" color="#FFFFFF">
                {t.today.questions}
              </T>
              <T size={11} color="rgba(255,255,255,0.8)">
                / {state.dailyGoal} soru
              </T>
            </ProgressRing>
          </View>
        </Appear>
      </LinearGradient>

      <View style={styles.body}>
        <Appear delay={140}>
          <View style={styles.quickRow}>
            {quick.map((q) => (
              <PressableScale
                key={q.label}
                onPress={() => {
                  tapFeedback();
                  q.onPress();
                }}
                accessibilityRole="button"
                accessibilityLabel={q.label}
                containerStyle={{ flex: 1 }}
                style={[styles.quick, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <IconBadge name={q.icon} color={q.color} size={42} />
                <T size={12} weight="700" center lines={1}>
                  {q.label}
                </T>
              </PressableScale>
            ))}
          </View>
        </Appear>

        {last && lastSubject ? (
          <Appear delay={200}>
            <Card onPress={() => nav.push({ name: 'lesson', topicId: last })} accessibilityLabel="Kaldığın yerden devam et">
              <View style={styles.row}>
                <LinearGradient colors={lastSubject.colors} style={styles.continueIcon}>
                  <Icon name={lastSubject.icon as IconName} size={22} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <T size={12} weight="700" color={c.primary}>
                    KALDIĞIN YERDEN DEVAM ET
                  </T>
                  <T size={15.5} weight="700" lines={1}>
                    {topicTitle(last)}
                  </T>
                  <T size={12.5} muted>
                    {lastSubject.exam} {lastSubject.name}
                  </T>
                </View>
                <Icon name="play-circle" size={34} color={c.primary} />
              </View>
            </Card>
          </Appear>
        ) : null}

        <Appear delay={260}>
          <SectionTitle title="Günün sorusu" />
          <Card style={{ marginTop: 10 }}>
            <View style={[styles.row, { marginBottom: 10 }]}>
              <View style={[styles.pill, { backgroundColor: alpha(SUBJECT_BY_ID[daily.topicId.split('.')[0]].colors[0], 0.15) }]}>
                <T size={12} weight="800" color={SUBJECT_BY_ID[daily.topicId.split('.')[0]].colors[1]}>
                  {SUBJECT_BY_ID[daily.topicId.split('.')[0]].exam} · {SUBJECT_BY_ID[daily.topicId.split('.')[0]].name}
                </T>
              </View>
              {dailyDone ? (
                <View style={[styles.pill, { backgroundColor: dailyDone.correct ? c.successSoft : c.dangerSoft }]}>
                  <T size={12} weight="800" color={dailyDone.correct ? c.success : c.danger}>
                    {dailyDone.correct ? 'Doğru çözdün' : `Cevap: ${letter(daily.answer)}`}
                  </T>
                </View>
              ) : null}
            </View>
            <T size={15} lines={4}>
              {daily.text}
            </T>
            <PressableScale
              onPress={() => {
                tapFeedback();
                nav.push({ name: 'quiz', config: { title: 'Günün sorusu', mode: 'practice', kind: 'daily', questionIds: [daily.id] } });
              }}
              accessibilityRole="button"
              style={[styles.dailyBtn, { backgroundColor: c.primarySoft }]}
            >
              <T size={14.5} weight="800" color={c.primary}>
                {dailyDone ? 'Tekrar çöz' : 'Çöz'}
              </T>
              <Icon name="arrow-forward" size={18} color={c.primary} />
            </PressableScale>
          </Card>
        </Appear>

        {weak.length ? (
          <Appear delay={320}>
            <SectionTitle title="Tekrar etmen gerekenler" />
            <View style={{ gap: 10, marginTop: 10 }}>
              {weak.map((w) => {
                const s = subjectOfTopic(w.topicId)!;
                return (
                  <Card key={w.topicId} onPress={() => nav.push(LESSON_BY_TOPIC[w.topicId] ? { name: 'lesson', topicId: w.topicId } : { name: 'subject', subjectId: s.id })}>
                    <View style={styles.row}>
                      <IconBadge name="trending-down" color={c.danger} size={38} />
                      <View style={{ flex: 1 }}>
                        <T size={15} weight="700" lines={1}>
                          {topicTitle(w.topicId)}
                        </T>
                        <T size={12.5} muted>
                          {s.exam} {s.name} · %{Math.round(w.accuracy * 100)} başarı
                        </T>
                      </View>
                      <Icon name="chevron-forward" size={18} color={c.textFaint} />
                    </View>
                  </Card>
                );
              })}
            </View>
          </Appear>
        ) : null}

        <Appear delay={380}>
          <SectionTitle title="Derslerin" action="Tümü" onAction={() => nav.setTab('subjects')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 10, paddingRight: 8 }}>
            {subjectsForField(state.field).map((s) => (
              <PressableScale
                key={s.id}
                onPress={() => {
                  tapFeedback();
                  nav.push({ name: 'subject', subjectId: s.id });
                }}
                accessibilityRole="button"
                accessibilityLabel={`${s.exam} ${s.name}`}
              >
                <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.subjectMini}>
                  <Icon name={s.icon as IconName} size={26} color="#FFFFFF" />
                  <View>
                    <T size={11} weight="800" color="rgba(255,255,255,0.8)">
                      {s.exam}
                    </T>
                    <T size={14.5} weight="800" color="#FFFFFF" lines={1}>
                      {s.name}
                    </T>
                  </View>
                </LinearGradient>
              </PressableScale>
            ))}
          </ScrollView>
        </Appear>

        <Appear delay={440}>
          <Card>
            <View style={styles.statsRow}>
              <MiniStat value={String(t.answered)} label="Çözülen soru" />
              <View style={[styles.vr, { backgroundColor: c.border }]} />
              <MiniStat value={`%${Math.round(t.accuracy * 100)}`} label="Başarı" />
              <View style={[styles.vr, { backgroundColor: c.border }]} />
              <MiniStat value={String(t.lessons)} label="Biten konu" />
            </View>
          </Card>
        </Appear>
      </View>
    </ScrollView>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <T size={20} weight="900">
        {value}
      </T>
      <T size={12} muted>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60 },
  blob2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: -30 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  countdown: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)', gap: 12 },
  body: { padding: 16, gap: 16 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: -2 },
  quick: { alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  continueIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  dailyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingVertical: 12, borderRadius: 14 },
  subjectMini: { width: 128, height: 112, borderRadius: 22, padding: 14, justifyContent: 'space-between' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  vr: { width: 1, height: 32 },
});
