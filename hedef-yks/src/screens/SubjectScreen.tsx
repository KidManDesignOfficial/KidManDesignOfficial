import { StyleSheet, View } from 'react-native';

import { Appear } from '../components/Blocks';
import { Icon } from '../components/Icon';
import { ProgressRing } from '../components/ProgressRing';
import { Button, Card, Screen, T } from '../components/ui';
import { LESSON_BY_TOPIC, SUBJECT_BY_ID, questionsOfSubject, questionsOfTopic } from '../data';
import { subjectProgress } from '../lib/progress';
import { byDifficulty } from '../lib/quiz';
import { useNav } from '../nav';
import { useStore } from '../store';
import { alpha, useTheme } from '../theme';

export default function SubjectScreen({ subjectId }: { subjectId: string }) {
  const { c } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const s = SUBJECT_BY_ID[subjectId];
  const p = subjectProgress(s, state);
  const all = questionsOfSubject(s.id);

  return (
    <Screen title={s.name} subtitle={`${s.exam} · ${s.test} · ${s.examQuestions} soru`} headerColor={s.colors}>
      <Appear>
        <Card>
          <View style={styles.summary}>
            <ProgressRing value={p.overall} size={92} stroke={10} colors={s.colors} track={c.cardAlt}>
              <T size={20} weight="900">
                %{Math.round(p.overall * 100)}
              </T>
            </ProgressRing>
            <View style={{ flex: 1, gap: 6 }}>
              <Row icon="book" text={`${p.lessonsDone} / ${p.lessons} konu anlatımı tamamlandı`} color={s.colors[1]} />
              <Row icon="checkmark-done" text={`${p.answered} / ${p.questions} soru çözüldü`} color={s.colors[1]} />
              <Row icon="analytics" text={p.answered ? `%${Math.round(p.accuracy * 100)} doğruluk` : 'Henüz soru çözülmedi'} color={s.colors[1]} />
            </View>
          </View>
          <Button
            label={`Ders testi (${Math.min(15, all.length)} soru)`}
            icon="play"
            gradient={s.colors}
            style={{ marginTop: 14 }}
            onPress={() =>
              nav.push({
                name: 'quiz',
                config: { title: `${s.exam} ${s.name} testi`, mode: 'practice', kind: 'subject', questionIds: byDifficulty(all, Date.now()).slice(0, 15).map((q) => q.id) },
              })
            }
          />
        </Card>
      </Appear>

      <T size={17} weight="800" style={{ marginTop: 6 }}>
        Konular
      </T>
      {s.topics.map((t, i) => {
        const lesson = LESSON_BY_TOPIC[t.id];
        const qs = questionsOfTopic(t.id);
        const done = !!state.completedLessons[t.id];
        const solved = qs.filter((q) => state.answers[q.id]).length;
        const available = !!lesson || qs.length > 0;
        return (
          <Appear key={t.id} delay={Math.min(i, 10) * 40}>
            <Card
              onPress={available ? () => (lesson ? nav.push({ name: 'lesson', topicId: t.id }) : nav.push({ name: 'quiz', config: { title: t.title, mode: 'practice', kind: 'topic', questionIds: qs.map((q) => q.id) } })) : undefined}
              accessibilityLabel={t.title}
              style={[styles.topic, !available && { opacity: 0.6 }]}
            >
              <View style={[styles.num, { backgroundColor: done ? c.success : alpha(s.colors[0], 0.15) }]}>
                {done ? (
                  <Icon name="checkmark" size={18} color="#FFFFFF" />
                ) : (
                  <T size={14} weight="800" color={s.colors[1]}>
                    {i + 1}
                  </T>
                )}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T size={15} weight="700">
                  {t.title}
                </T>
                <T size={12.5} muted>
                  {lesson ? `${lesson.minutes} dk anlatım` : 'Anlatım hazırlanıyor'}
                  {qs.length ? ` · ${solved}/${qs.length} soru` : ''}
                </T>
              </View>
              {available ? <Icon name={lesson ? 'chevron-forward' : 'help-circle'} size={20} color={c.textFaint} /> : <Icon name="time-outline" size={18} color={c.textFaint} />}
            </Card>
          </Appear>
        );
      })}
      <T size={12} muted center style={{ marginTop: 8 }}>
        Konu başlıkları ÖSYM YKS kapsamı ve MEB öğretim programıyla uyumludur. Yeni anlatımlar güncellemelerle eklenir.
      </T>
    </Screen>
  );
}

function Row({ icon, text, color }: { icon: 'book' | 'checkmark-done' | 'analytics'; text: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={16} color={color} />
      <T size={13.5} style={{ flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  num: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
