import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Appear } from '../components/Blocks';
import { Confetti } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Collapsible, PressableScale } from '../components/motion';
import { ProgressRing } from '../components/ProgressRing';
import { Button, Card, Screen, T } from '../components/ui';
import { QUESTION_BY_ID, SUBJECT_BY_ID, topicTitle } from '../data';
import type { Question } from '../data';
import { successFeedback, tapFeedback } from '../lib/haptics';
import { formatNet, net } from '../lib/net';
import { letter } from '../lib/quiz';
import { useNav } from '../nav';
import type { QuizResult } from '../nav';
import { useStore } from '../store';
import { GRADIENT, useTheme } from '../theme';

export default function ResultScreen({ result }: { result: QuizResult }) {
  const { c } = useTheme();
  const nav = useNav();
  const { saveExam } = useStore();
  const qs = useMemo(() => result.config.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) as Question[], [result.config.questionIds]);
  const correct = qs.filter((q, i) => result.answers[i] === q.answer).length;
  const blank = result.answers.filter((a) => a === null).length;
  const wrong = qs.length - correct - blank;
  const ratio = qs.length ? correct / qs.length : 0;
  const saved = useRef(false);

  const bySubject = useMemo(() => {
    const m: Record<string, { correct: number; wrong: number; blank: number }> = {};
    qs.forEach((q, i) => {
      const sid = q.topicId.split('.')[0];
      m[sid] ??= { correct: 0, wrong: 0, blank: 0 };
      const a = result.answers[i];
      if (a === null) m[sid].blank++;
      else if (a === q.answer) m[sid].correct++;
      else m[sid].wrong++;
    });
    return m;
  }, [qs, result.answers]);

  useEffect(() => {
    if (ratio >= 0.7) successFeedback();
    if (result.config.kind === 'deneme' && !saved.current) {
      saved.current = true;
      saveExam({ id: String(Date.now()), at: Date.now(), title: result.config.title, bySubject, seconds: result.seconds });
    }
  }, [ratio, result, bySubject, saveExam]);

  const msg = ratio >= 0.9 ? 'Mükemmel!' : ratio >= 0.7 ? 'Çok iyi!' : ratio >= 0.5 ? 'İyi gidiyorsun' : 'Tekrar zamanı';
  const sub = ratio >= 0.7 ? 'Bu konuya hâkimsin. Bir sonrakine geçebilirsin.' : 'Yanlışlarının çözümlerini incele, konu anlatımına tekrar göz at.';
  const wrongIds = qs.filter((q, i) => result.answers[i] !== null && result.answers[i] !== q.answer).map((q) => q.id);
  const mins = Math.floor(result.seconds / 60);

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Sonuç" subtitle={result.config.title}>
        <Appear>
          <Card style={styles.hero}>
            <ProgressRing value={ratio} size={150} stroke={14} colors={ratio >= 0.5 ? GRADIENT.success : GRADIENT.warm} track={c.cardAlt} duration={1300}>
              <T size={34} weight="900">
                %{Math.round(ratio * 100)}
              </T>
              <T size={12} muted>
                başarı
              </T>
            </ProgressRing>
            <T size={22} weight="900" style={{ marginTop: 14 }}>
              {msg}
            </T>
            <T muted center>
              {sub}
            </T>
            <View style={styles.tally}>
              <Tally label="Doğru" value={correct} color={c.success} />
              <Tally label="Yanlış" value={wrong} color={c.danger} />
              <Tally label="Boş" value={blank} color={c.textFaint} />
              <Tally label="Net" value={formatNet(net(correct, wrong))} color={c.primary} />
            </View>
            <T size={12.5} muted>
              Süre: {mins} dk {result.seconds % 60} sn · Soru başına ort. {qs.length ? Math.round(result.seconds / qs.length) : 0} sn
            </T>
          </Card>
        </Appear>

        {Object.keys(bySubject).length > 1 ? (
          <Appear delay={120}>
            <Card style={{ gap: 12 }}>
              <T size={16} weight="800">
                Ders bazında netler
              </T>
              {Object.entries(bySubject).map(([sid, t]) => {
                const s = SUBJECT_BY_ID[sid];
                const total = t.correct + t.wrong + t.blank;
                return (
                  <View key={sid} style={{ gap: 6 }}>
                    <View style={styles.row}>
                      <View style={[styles.dot, { backgroundColor: s.colors[0] }]} />
                      <T weight="700" style={{ flex: 1 }}>
                        {s.exam} {s.name}
                      </T>
                      <T size={13} muted>
                        {t.correct}D {t.wrong}Y {t.blank}B
                      </T>
                      <T weight="900" color={c.primary} style={{ width: 52, textAlign: 'right' }}>
                        {formatNet(net(t.correct, t.wrong))}
                      </T>
                    </View>
                    <View style={[styles.stack, { backgroundColor: c.cardAlt }]}>
                      <View style={{ flex: t.correct, backgroundColor: c.success }} />
                      <View style={{ flex: t.wrong, backgroundColor: c.danger }} />
                      <View style={{ flex: t.blank + (total ? 0 : 1) }} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </Appear>
        ) : null}

        <View style={{ gap: 10 }}>
          {wrongIds.length ? (
            <Button
              label={`Yanlışları tekrar çöz (${wrongIds.length})`}
              icon="refresh"
              gradient={GRADIENT.warm}
              onPress={() => nav.replace({ name: 'quiz', config: { title: 'Yanlışlarım', mode: 'practice', kind: 'wrongbook', questionIds: wrongIds } })}
            />
          ) : null}
          <Button label="Tamam" icon="checkmark" variant="secondary" onPress={nav.pop} />
        </View>

        <T size={17} weight="800" style={{ marginTop: 8 }}>
          Soru soru inceleme
        </T>
        {qs.map((q, i) => (
          <Review key={q.id} q={q} n={i + 1} answer={result.answers[i]} />
        ))}
      </Screen>
      {ratio >= 0.7 ? <Confetti /> : null}
    </View>
  );
}

function Tally({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <T size={22} weight="900" color={color}>
        {value}
      </T>
      <T size={12} muted>
        {label}
      </T>
    </View>
  );
}

function Review({ q, n, answer }: { q: Question; n: number; answer: number | null }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const ok = answer === q.answer;
  const color = answer === null ? c.textFaint : ok ? c.success : c.danger;
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <PressableScale
        onPress={() => {
          tapFeedback();
          setOpen((v) => !v);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.reviewHead}
      >
        <View style={[styles.reviewNum, { backgroundColor: color }]}>
          <Icon name={answer === null ? 'remove' : ok ? 'checkmark' : 'close'} size={16} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <T size={14.5} weight="700" lines={open ? undefined : 2}>
            {n}. {q.text}
          </T>
          <T size={12} muted>
            {topicTitle(q.topicId)} · Senin: {answer === null ? 'boş' : letter(answer)} · Doğru: {letter(q.answer)}
          </T>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.textFaint} />
      </PressableScale>
      <Collapsible open={open}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 6 }}>
          {q.options.map((o, i) => (
            <T key={i} size={14} color={i === q.answer ? c.success : i === answer ? c.danger : c.textMuted} weight={i === q.answer ? '800' : '400'}>
              {letter(i)}) {o}
            </T>
          ))}
          <View style={[styles.sol, { backgroundColor: c.cardAlt }]}>
            <T size={14} style={{ lineHeight: 21 }}>
              {q.explanation}
            </T>
          </View>
        </View>
      </Collapsible>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  tally: { flexDirection: 'row', alignSelf: 'stretch', marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stack: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  reviewNum: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sol: { borderRadius: 12, padding: 12, marginTop: 6 },
});
