/**
 * Soru çözme ekranı.
 * - Alıştırma modu: her sorudan hemen sonra doğru/yanlış ve ayrıntılı çözüm gösterilir.
 * - Deneme modu: cevaplar sonda değerlendirilir, sorular arasında serbestçe gezilebilir, süre işler.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon } from '../components/Icon';
import { EASE_OUT, PressableScale, useAnimatedValue, useReducedMotion } from '../components/motion';
import { Button, ProgressBar, T } from '../components/ui';
import { QUESTION_BY_ID, subjectOfTopic, topicTitle } from '../data';
import type { Question } from '../data';
import { errorFeedback, pressFeedback, successFeedback, tapFeedback } from '../lib/haptics';
import { letter } from '../lib/quiz';
import { useNav } from '../nav';
import type { QuizConfig } from '../nav';
import { useStore } from '../store';
import { alpha, useTheme } from '../theme';

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function confirm(title: string, message: string, ok: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`) ?? true) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: ok, style: 'destructive', onPress: onOk },
  ]);
}

export default function QuizScreen({ config }: { config: QuizConfig }) {
  const { c } = useTheme();
  const nav = useNav();
  const { recordAnswer } = useStore();
  const insets = useSafeAreaInsets();
  const questions = useMemo(() => config.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) as Question[], [config.questionIds]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [seconds, setSeconds] = useState(0);
  const exam = config.mode === 'exam';
  const q = questions[index];
  const chosen = answers[index];
  const locked = !exam && chosen !== null;
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = config.timeLimit ? config.timeLimit - seconds : null;

  const finish = (final = answers) => {
    if (exam) final.forEach((a, i) => a !== null && recordAnswer(questions[i].id, a, a === questions[i].answer));
    nav.replace({ name: 'result', result: { config, answers: final, seconds } });
  };

  useEffect(() => {
    if (remaining !== null && remaining <= 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  if (!q) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <T>Bu testte soru bulunamadı.</T>
        <Button label="Geri dön" onPress={nav.pop} variant="secondary" />
      </View>
    );
  }

  const choose = (i: number) => {
    if (locked) return;
    const next = [...answers];
    next[index] = exam && chosen === i ? null : i;
    setAnswers(next);
    if (exam) {
      tapFeedback();
      return;
    }
    const ok = i === q.answer;
    if (ok) successFeedback();
    else errorFeedback();
    recordAnswer(q.id, i, ok);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const go = (to: number) => {
    pressFeedback();
    setIndex(to);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const isLast = index === questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null).length;
  const s = subjectOfTopic(q.topicId)!;

  const close = () => {
    if (answeredCount === 0 || !exam) return nav.pop();
    confirm('Denemeden çıkılsın mı?', 'Verdiğin cevaplar kaydedilmeyecek.', 'Çık', nav.pop);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topRow}>
          <PressableScale onPress={close} accessibilityRole="button" accessibilityLabel="Testi kapat" hitSlop={8} style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="close" size={22} color={c.text} />
          </PressableScale>
          <View style={{ flex: 1 }}>
            <T size={15} weight="800" lines={1}>
              {config.title}
            </T>
            <T size={12.5} muted>
              Soru {index + 1} / {questions.length}
              {exam ? ` · ${answeredCount} cevaplandı` : ''}
            </T>
          </View>
          <View style={[styles.timer, { backgroundColor: remaining !== null && remaining < 60 ? c.dangerSoft : c.card, borderColor: c.border }]}>
            <Icon name="time-outline" size={16} color={remaining !== null && remaining < 60 ? c.danger : c.textMuted} />
            <T size={14} weight="800" color={remaining !== null && remaining < 60 ? c.danger : c.text} style={{ fontVariant: ['tabular-nums'] }}>
              {fmtTime(Math.max(0, remaining ?? seconds))}
            </T>
          </View>
        </View>
        <ProgressBar value={(exam ? answeredCount : index + (locked ? 1 : 0)) / questions.length} color={s.colors[0]} height={6} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <QuestionCard key={index} q={q} chosen={chosen} reveal={locked} onChoose={choose} />
        {locked ? (
          <Appear from={12}>
            <View style={[styles.explain, { backgroundColor: chosen === q.answer ? c.successSoft : c.dangerSoft }]}>
              <View style={styles.explainHead}>
                <Icon name={chosen === q.answer ? 'checkmark-circle' : 'close-circle'} size={22} color={chosen === q.answer ? c.success : c.danger} />
                <T size={16} weight="800" color={chosen === q.answer ? c.success : c.danger}>
                  {chosen === q.answer ? 'Doğru! Harika gidiyorsun.' : `Yanlış. Doğru cevap ${letter(q.answer)}`}
                </T>
              </View>
              <T size={13} weight="800" muted>
                ÇÖZÜM
              </T>
              <T size={15} style={{ lineHeight: 23 }}>
                {q.explanation}
              </T>
              {chosen !== q.answer ? (
                <T size={12.5} muted>
                  Bu soru Yanlış Defteri’ne eklendi.
                </T>
              ) : null}
            </View>
          </Appear>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, borderTopColor: c.border, backgroundColor: c.bg }]}>
        {exam ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dots}>
              {questions.map((_, i) => (
                <PressableScale
                  key={i}
                  onPress={() => go(i)}
                  accessibilityRole="button"
                  accessibilityLabel={`Soru ${i + 1}${answers[i] !== null ? ', cevaplandı' : ''}`}
                  style={[
                    styles.dot,
                    { borderColor: i === index ? c.primary : c.border, backgroundColor: answers[i] !== null ? c.primary : c.card },
                  ]}
                >
                  <T size={12} weight="800" color={answers[i] !== null ? '#FFFFFF' : c.textMuted}>
                    {i + 1}
                  </T>
                </PressableScale>
              ))}
            </ScrollView>
            <View style={styles.footerRow}>
              <Button label="Önceki" icon="chevron-back" variant="secondary" disabled={index === 0} onPress={() => go(index - 1)} style={{ flex: 1 }} />
              {isLast ? (
                <Button
                  label="Bitir"
                  icon="flag"
                  style={{ flex: 1 }}
                  onPress={() => {
                    const blank = questions.length - answeredCount;
                    if (blank === 0) finish();
                    else confirm('Denemeyi bitir', `${blank} soru boş. Yine de bitirmek istiyor musun?`, 'Bitir', () => finish());
                  }}
                />
              ) : (
                <Button label="Sonraki" icon="chevron-forward" style={{ flex: 1 }} onPress={() => go(index + 1)} />
              )}
            </View>
          </>
        ) : (
          <Button
            label={!locked ? 'Bir seçenek işaretle' : isLast ? 'Sonuçları gör' : 'Sonraki soru'}
            icon={isLast && locked ? 'trophy' : 'arrow-forward'}
            disabled={!locked}
            gradient={s.colors}
            onPress={() => (isLast ? finish() : go(index + 1))}
          />
        )}
      </View>
    </View>
  );
}

function QuestionCard({ q, chosen, reveal, onChoose }: { q: Question; chosen: number | null; reveal: boolean; onChoose: (i: number) => void }) {
  const { c, dark } = useTheme();
  const reduced = useReducedMotion();
  const enter = useAnimatedValue(0);
  const s = subjectOfTopic(q.topicId)!;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: reduced ? 0 : 360, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [enter, reduced]);
  return (
    <Animated.View style={{ opacity: enter, transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }], gap: 14 }}>
      <View style={[styles.qCard, { backgroundColor: c.card, borderColor: c.border }, !dark && styles.shadow]}>
        <View style={styles.qMeta}>
          <View style={[styles.tag, { backgroundColor: alpha(s.colors[0], 0.15) }]}>
            <T size={11.5} weight="800" color={s.colors[1]}>
              {s.exam} · {s.name}
            </T>
          </View>
          <T size={11.5} muted lines={1} style={{ flex: 1 }}>
            {topicTitle(q.topicId)}
          </T>
          <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`Zorluk ${q.difficulty} / 3`}>
            {[1, 2, 3].map((d) => (
              <View key={d} style={{ width: 6, height: 12, borderRadius: 2, backgroundColor: d <= q.difficulty ? s.colors[0] : c.border }} />
            ))}
          </View>
        </View>
        <T size={16.5} weight="600" style={{ lineHeight: 26 }}>
          {q.text}
        </T>
      </View>
      {q.options.map((o, i) => (
        <Option key={i} i={i} text={o} chosen={chosen === i} correct={q.answer === i} reveal={reveal} onPress={() => onChoose(i)} />
      ))}
    </Animated.View>
  );
}

function Option({ i, text, chosen, correct, reveal, onPress }: { i: number; text: string; chosen: boolean; correct: boolean; reveal: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const shake = useAnimatedValue(0);
  const pop = useAnimatedValue(1);

  useEffect(() => {
    if (!reveal || reduced) return;
    if (chosen && !correct) {
      Animated.sequence([-1, 1, -1, 1, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true }))).start();
    }
    if (correct) {
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.04, duration: 140, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, useNativeDriver: true, bounciness: 12 }),
      ]).start();
    }
  }, [reveal, chosen, correct, shake, pop, reduced]);

  let bg = c.card;
  let border = c.border;
  let badgeBg = c.cardAlt;
  let badgeFg = c.textMuted;
  let icon: 'checkmark' | 'close' | null = null;
  if (reveal && correct) {
    bg = c.successSoft;
    border = c.success;
    badgeBg = c.success;
    badgeFg = '#FFFFFF';
    icon = 'checkmark';
  } else if (reveal && chosen) {
    bg = c.dangerSoft;
    border = c.danger;
    badgeBg = c.danger;
    badgeFg = '#FFFFFF';
    icon = 'close';
  } else if (chosen) {
    bg = c.primarySoft;
    border = c.primary;
    badgeBg = c.primary;
    badgeFg = '#FFFFFF';
  }

  return (
    <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }, { scale: pop }] }}>
      <PressableScale
        onPress={onPress}
        disabled={reveal}
        accessibilityRole="radio"
        accessibilityState={{ checked: chosen, disabled: reveal }}
        accessibilityLabel={`${letter(i)} seçeneği: ${text}`}
        style={[styles.option, { backgroundColor: bg, borderColor: border }]}
      >
        <View style={[styles.letter, { backgroundColor: badgeBg }]}>
          {icon ? (
            <Icon name={icon} size={18} color="#FFFFFF" />
          ) : (
            <T size={14} weight="900" color={badgeFg}>
              {letter(i)}
            </T>
          )}
        </View>
        <T size={15.5} style={{ flex: 1, lineHeight: 23 }}>
          {text}
        </T>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  top: { paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  body: { padding: 16, paddingTop: 4, gap: 14, paddingBottom: 24 },
  qCard: { borderRadius: 22, padding: 18, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  shadow: { shadowColor: '#1B1F5C', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  qMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1.5 },
  letter: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  explain: { borderRadius: 20, padding: 16, gap: 8 },
  explainHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  footerRow: { flexDirection: 'row', gap: 10 },
  dots: { gap: 6 },
  dot: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
