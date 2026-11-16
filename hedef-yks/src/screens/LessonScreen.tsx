import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BlockView } from '../components/Blocks';
import { Icon } from '../components/Icon';
import { PressableScale, useAnimatedValue } from '../components/motion';
import { Button, Card, Screen, T } from '../components/ui';
import { LESSON_BY_TOPIC, questionsOfTopic, subjectOfTopic, topicTitle } from '../data';
import { successFeedback, tapFeedback } from '../lib/haptics';
import { byDifficulty } from '../lib/quiz';
import { useNav } from '../nav';
import { useStore } from '../store';
import { useTheme } from '../theme';

export default function LessonScreen({ topicId }: { topicId: string }) {
  const { c } = useTheme();
  const { state, completeLesson, openLesson, toggleBookmark } = useStore();
  const nav = useNav();
  const lesson = LESSON_BY_TOPIC[topicId];
  const s = subjectOfTopic(topicId)!;
  const qs = questionsOfTopic(topicId);
  const done = !!state.completedLessons[topicId];
  const saved = state.bookmarks.includes(topicId);
  const scrollY = useAnimatedValue(0);
  const [contentH, setContentH] = useState(1);
  const [viewH, setViewH] = useState(1);

  useEffect(() => {
    openLesson(topicId);
  }, [openLesson, topicId]);

  const progress = scrollY.interpolate({ inputRange: [0, Math.max(1, contentH - viewH)], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={topicTitle(topicId)}
        subtitle={`${s.exam} ${s.name} · ${lesson.minutes} dk`}
        headerColor={s.colors}
        right={
          <PressableScale
            onPress={() => {
              tapFeedback();
              toggleBookmark(topicId);
            }}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Konuyu kaydet'}
            style={styles.save}
          >
            <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color="#FFFFFF" />
          </PressableScale>
        }
        scrollProps={{
          onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false }),
          scrollEventThrottle: 16,
          onContentSizeChange: (_w, h) => setContentH(h),
          onLayout: (e) => setViewH(e.nativeEvent.layout.height),
        }}
        contentStyle={{ gap: 18 }}
      >
        <LinearGradient colors={[s.colors[0] + '26', s.colors[1] + '0D']} style={styles.intro}>
          <Icon name="bulb" size={22} color={s.colors[1]} />
          <T size={15} weight="600" style={{ flex: 1, lineHeight: 23 }}>
            {lesson.intro}
          </T>
        </LinearGradient>
        {lesson.blocks.map((b, i) => (
          <BlockView key={i} block={b} accent={s.colors[1]} index={i} />
        ))}
        {lesson.cards?.length ? (
          <Card onPress={() => nav.push({ name: 'flashcards', subjectId: s.id })}>
            <View style={styles.row}>
              <Icon name="albums" size={22} color={c.success} />
              <T weight="700" style={{ flex: 1 }}>
                Bu konunun {lesson.cards.length} formül/bilgi kartını çalış
              </T>
              <Icon name="chevron-forward" size={18} color={c.textFaint} />
            </View>
          </Card>
        ) : null}
        <Card style={{ gap: 12 }}>
          <T size={17} weight="800">
            Konuyu pekiştir
          </T>
          <T muted>
            {qs.length} soruluk konu testiyle öğrendiklerini ölç. Her sorunun ayrıntılı çözümü var.
          </T>
          {qs.length ? (
            <Button
              label="Konu testini başlat"
              icon="play"
              gradient={s.colors}
              onPress={() => {
                completeLesson(topicId);
                nav.push({ name: 'quiz', config: { title: topicTitle(topicId), mode: 'practice', kind: 'topic', questionIds: byDifficulty(qs, Date.now()).map((q) => q.id) } });
              }}
            />
          ) : null}
          <Button
            label={done ? 'Konu tamamlandı' : 'Konuyu tamamladım'}
            icon={done ? 'checkmark-circle' : 'checkmark'}
            variant="secondary"
            disabled={done}
            onPress={() => {
              successFeedback();
              completeLesson(topicId);
            }}
          />
        </Card>
      </Screen>
      <View pointerEvents="none" style={[styles.progressTrack]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: s.colors[0], transform: [{ scaleX: progress }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  save: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  intro: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 },
  progressFill: { height: 4, width: '100%', transformOrigin: 'left' },
});
