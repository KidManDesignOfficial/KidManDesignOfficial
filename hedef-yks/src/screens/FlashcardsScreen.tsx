/** Formül ve bilgi kartları: dokununca 3B çevrilen kartlar. */
import { useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '../components/Icon';
import { EASE_OUT, PressableScale, useAnimatedValue, useReducedMotion } from '../components/motion';
import { Button, Chip, Empty, Screen, T } from '../components/ui';
import { LESSONS, SUBJECTS, subjectOfTopic, topicTitle } from '../data';
import { tapFeedback } from '../lib/haptics';
import { shuffle } from '../lib/quiz';
import { useTheme } from '../theme';

export default function FlashcardsScreen({ subjectId: initial }: { subjectId?: string }) {
  const { c } = useTheme();
  const [subjectId, setSubjectId] = useState<string | undefined>(initial);
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => {
    const all = LESSONS.filter((l) => !subjectId || l.topicId.startsWith(`${subjectId}.`)).flatMap((l) => (l.cards ?? []).map((card) => ({ ...card, topicId: l.topicId })));
    return seed ? shuffle(all, seed) : all;
  }, [subjectId, seed]);
  const [i, setI] = useState(0);
  const idx = Math.min(i, Math.max(0, cards.length - 1));
  const card = cards[idx];
  const withCards = SUBJECTS.filter((s) => LESSONS.some((l) => l.topicId.startsWith(`${s.id}.`) && l.cards?.length));

  return (
    <Screen title="Bilgi kartları" subtitle={cards.length ? `${idx + 1} / ${cards.length}` : undefined}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ marginHorizontal: -16 }}>
        <Chip label="Tümü" selected={!subjectId} onPress={() => { setSubjectId(undefined); setI(0); }} />
        {withCards.map((s) => (
          <Chip key={s.id} label={`${s.exam} ${s.short}`} color={s.colors[1]} selected={subjectId === s.id} onPress={() => { setSubjectId(s.id); setI(0); }} />
        ))}
      </ScrollView>
      {card ? (
        <>
          <FlipCard key={`${subjectId}-${seed}-${idx}`} front={card.front} back={card.back} topicId={card.topicId} />
          <T size={12.5} muted center>
            Kartı çevirmek için dokun
          </T>
          <View style={styles.row}>
            <Button label="Önceki" icon="chevron-back" variant="secondary" disabled={idx === 0} onPress={() => setI(idx - 1)} style={{ flex: 1 }} />
            <Button label="Sonraki" icon="chevron-forward" disabled={idx >= cards.length - 1} onPress={() => setI(idx + 1)} style={{ flex: 1 }} />
          </View>
          <Button label="Karıştır" icon="shuffle" variant="ghost" onPress={() => { setSeed(Date.now()); setI(0); }} />
        </>
      ) : (
        <Empty icon="albums-outline" title="Kart yok" text="Bu ders için henüz kart eklenmedi." />
      )}
      <View style={{ height: 8, backgroundColor: c.bg }} />
    </Screen>
  );
}

function FlipCard({ front, back, topicId }: { front: string; back: string; topicId: string }) {
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  const [flipped, setFlipped] = useState(false);
  const s = subjectOfTopic(topicId)!;
  const flip = () => {
    tapFeedback();
    const to = flipped ? 0 : 1;
    setFlipped(!flipped);
    Animated.timing(p, { toValue: to, duration: reduced ? 0 : 520, easing: EASE_OUT, useNativeDriver: true }).start();
  };
  const frontRot = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRot = p.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = p.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = p.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [0, 0, 1, 1] });

  return (
    <PressableScale onPress={flip} accessibilityRole="button" accessibilityLabel={flipped ? `Cevap: ${back}` : `Soru: ${front}. Çevirmek için dokun.`} scaleTo={0.98}>
      <View style={styles.cardWrap}>
        <Animated.View style={[styles.face, { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
          <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inner}>
            <T size={12} weight="800" color="rgba(255,255,255,0.8)">
              {s.exam} {s.name} · {topicTitle(topicId)}
            </T>
            <T size={24} weight="900" color="#FFFFFF" center>
              {front}
            </T>
            <Icon name="sync" size={22} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </Animated.View>
        <Animated.View style={[styles.face, styles.back, { opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
          <BackFace text={back} color={s.colors[1]} />
        </Animated.View>
      </View>
    </PressableScale>
  );
}

function BackFace({ text, color }: { text: string; color: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.inner, { backgroundColor: c.card, borderColor: color, borderWidth: 2 }]}>
      <Icon name="bulb" size={26} color={color} />
      <T size={19} weight="800" center>
        {text}
      </T>
      <View />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 10 },
  cardWrap: { height: 300 },
  face: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backfaceVisibility: 'hidden' },
  back: {},
  inner: { flex: 1, borderRadius: 28, padding: 24, alignItems: 'center', justifyContent: 'space-between' },
});
