import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon, type IconName } from '../components/Icon';
import { PressableScale } from '../components/motion';
import { Chip, ProgressBar, T } from '../components/ui';
import { FIELD_LABELS, SUBJECTS } from '../data';
import type { Exam } from '../data';
import { tapFeedback } from '../lib/haptics';
import { subjectProgress } from '../lib/progress';
import { useNav } from '../nav';
import { useStore } from '../store';
import { useTheme } from '../theme';

export default function SubjectsScreen() {
  const { c } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [exam, setExam] = useState<Exam>('TYT');
  const [mine, setMine] = useState(true);
  const list = SUBJECTS.filter((s) => s.exam === exam && (!mine || s.fields.includes(state.field)));

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <T size={28} weight="900">
        Dersler
      </T>
      <T muted>Konu anlatımları, formüller ve konu testleri</T>
      <View style={[styles.segment, { backgroundColor: c.cardAlt }]}>
        {(['TYT', 'AYT'] as Exam[]).map((e) => (
          <PressableScale
            key={e}
            onPress={() => {
              tapFeedback();
              setExam(e);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: exam === e }}
            containerStyle={{ flex: 1 }}
            style={[styles.segBtn, exam === e && { backgroundColor: c.card }]}
          >
            <T weight="800" color={exam === e ? c.primary : c.textMuted} center>
              {e === 'TYT' ? 'TYT · Temel Yeterlilik' : 'AYT · Alan Yeterlilik'}
            </T>
          </PressableScale>
        ))}
      </View>
      {exam === 'AYT' ? (
        <View style={styles.chips}>
          <Chip label={`Alanım (${FIELD_LABELS[state.field]})`} selected={mine} onPress={() => setMine(true)} />
          <Chip label="Tüm AYT dersleri" selected={!mine} onPress={() => setMine(false)} />
        </View>
      ) : null}
      <View style={styles.grid}>
        {list.map((s, i) => {
          const p = subjectProgress(s, state);
          return (
            <View key={`${exam}-${s.id}`} style={styles.cell}>
              <Appear delay={i * 50}>
                <PressableScale
                  onPress={() => {
                    tapFeedback();
                    nav.push({ name: 'subject', subjectId: s.id });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.exam} ${s.name}, ${s.topics.length} konu`}
                >
                  <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardBlob} />
                    <View style={styles.cardTop}>
                      <View style={styles.iconWrap}>
                        <Icon name={s.icon as IconName} size={24} color="#FFFFFF" />
                      </View>
                      <T size={12} weight="800" color="rgba(255,255,255,0.85)">
                        {s.examQuestions} soru
                      </T>
                    </View>
                    <View style={{ gap: 6 }}>
                      <T size={16.5} weight="800" color="#FFFFFF" lines={2}>
                        {s.name}
                      </T>
                      <T size={12} color="rgba(255,255,255,0.85)">
                        {s.topics.length} konu · {p.lessons} anlatım
                      </T>
                      <ProgressBar value={p.overall} color="#FFFFFF" track="rgba(255,255,255,0.25)" height={6} />
                    </View>
                  </LinearGradient>
                </PressableScale>
              </Appear>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 8 },
  segment: { flexDirection: 'row', borderRadius: 16, padding: 4, marginTop: 10 },
  segBtn: { paddingVertical: 11, borderRadius: 12 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginTop: 8 },
  cell: { width: '50%', padding: 6 },
  card: { height: 170, borderRadius: 24, padding: 14, justifyContent: 'space-between', overflow: 'hidden' },
  cardBlob: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.12)', right: -30, top: -30 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
