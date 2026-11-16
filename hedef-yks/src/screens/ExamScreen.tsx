import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon, type IconName } from '../components/Icon';
import { PressableScale } from '../components/motion';
import { Card, IconBadge, SectionTitle, T } from '../components/ui';
import { FIELD_LABELS, SUBJECT_BY_ID } from '../data';
import { tapFeedback } from '../lib/haptics';
import { formatNet, net } from '../lib/net';
import { buildDeneme, randomMix, subjectsForField } from '../lib/progress';
import { useNav } from '../nav';
import type { QuizConfig } from '../nav';
import { useStore } from '../store';
import { GRADIENT, useTheme } from '../theme';

export default function ExamScreen() {
  const { c } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const start = (config: QuizConfig) => nav.push({ name: 'quiz', config });

  // Gerçek sınavda TYT 165 dk / 120 soru, AYT 180 dk / 160 soru: soru başına süre korunur.
  const tyt = () => {
    const qs = buildDeneme('TYT', state.field, 0.25, Date.now());
    start({ title: 'Mini TYT Denemesi', mode: 'exam', kind: 'deneme', questionIds: qs.map((q) => q.id), timeLimit: Math.round((165 * 60 * qs.length) / 120) });
  };
  const ayt = () => {
    const qs = buildDeneme('AYT', state.field, state.field === 'SAY' ? 0.25 : 0.2, Date.now());
    start({ title: `Mini AYT Denemesi (${FIELD_LABELS[state.field]})`, mode: 'exam', kind: 'deneme', questionIds: qs.map((q) => q.id), timeLimit: Math.round((180 * 60 * qs.length) / 160) });
  };

  const modes: { title: string; text: string; icon: IconName; colors: [string, string]; onPress: () => void }[] = [
    { title: 'Mini TYT Denemesi', text: 'Gerçek ders oranlarıyla ~30 soru · süreli · net hesabı', icon: 'document-text', colors: GRADIENT.hero, onPress: tyt },
    ...(state.field === 'DIL' ? [] : [{ title: 'Mini AYT Denemesi', text: `${FIELD_LABELS[state.field]} alanına göre · süreli · ders bazında net`, icon: 'ribbon' as IconName, colors: GRADIENT.warm, onPress: ayt }]),
    {
      title: 'Karma 20 soru',
      text: 'Alanındaki tüm derslerden karışık, anında çözümlü',
      icon: 'shuffle',
      colors: GRADIENT.success,
      onPress: () => start({ title: 'Karma 20 soru', mode: 'practice', kind: 'mixed', questionIds: randomMix(subjectsForField(state.field).map((s) => s.id), 20, Date.now()).map((q) => q.id) }),
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <T size={28} weight="900">
        Deneme
      </T>
      <T muted>Sınav provası yap, netini takip et</T>
      {modes.map((m, i) => (
        <Appear key={m.title} delay={i * 80}>
          <PressableScale
            onPress={() => {
              tapFeedback();
              m.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={m.title}
          >
            <LinearGradient colors={m.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mode}>
              <View style={styles.modeBlob} />
              <View style={styles.modeIcon}>
                <Icon name={m.icon} size={26} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <T size={17} weight="800" color="#FFFFFF">
                  {m.title}
                </T>
                <T size={13} color="rgba(255,255,255,0.85)">
                  {m.text}
                </T>
              </View>
              <Icon name="arrow-forward-circle" size={30} color="#FFFFFF" />
            </LinearGradient>
          </PressableScale>
        </Appear>
      ))}

      <Card onPress={() => nav.push({ name: 'netcalc' })}>
        <View style={styles.row}>
          <IconBadge name="calculator" color={c.info} />
          <View style={{ flex: 1 }}>
            <T weight="800">Net hesaplama</T>
            <T size={13} muted>
              Dış denemelerinin doğru-yanlışlarını gir, netini gör
            </T>
          </View>
          <Icon name="chevron-forward" size={18} color={c.textFaint} />
        </View>
      </Card>

      <SectionTitle title="Geçmiş denemeler" />
      {state.exams.length === 0 ? (
        <Card>
          <T muted center>
            Henüz deneme çözmedin. İlk mini denemeni başlat; sonuçların burada listelenir.
          </T>
        </Card>
      ) : (
        state.exams.slice(0, 10).map((e) => {
          const tot = Object.values(e.bySubject).reduce((a, t) => ({ c: a.c + t.correct, w: a.w + t.wrong }), { c: 0, w: 0 });
          return (
            <Card key={e.id}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <T weight="800">{e.title}</T>
                  <T size={12.5} muted>
                    {new Date(e.at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} · {Math.round(e.seconds / 60)} dk
                  </T>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T size={22} weight="900" color={c.primary}>
                    {formatNet(net(tot.c, tot.w))}
                  </T>
                  <T size={11.5} muted>
                    net
                  </T>
                </View>
              </View>
              <View style={styles.chips}>
                {Object.entries(e.bySubject).map(([sid, t]) => (
                  <View key={sid} style={[styles.netChip, { backgroundColor: c.cardAlt }]}>
                    <T size={12} weight="700">
                      {SUBJECT_BY_ID[sid]?.short ?? sid} {formatNet(net(t.correct, t.wrong))}
                    </T>
                  </View>
                ))}
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  mode: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 24, overflow: 'hidden' },
  modeBlob: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.1)', right: -40, bottom: -60 },
  modeIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  netChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
});
