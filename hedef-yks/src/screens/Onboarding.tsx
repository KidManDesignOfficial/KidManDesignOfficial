/** İlk açılış: tanıtım, rol ve alan seçimi, ad ve günlük hedef. */
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon, type IconName } from '../components/Icon';
import { PressableScale, useAnimatedValue, useReducedMotion } from '../components/motion';
import { T } from '../components/ui';
import { FIELD_LABELS, LESSONS, QUESTIONS, SUBJECTS } from '../data';
import type { Field } from '../data';
import { successFeedback, tapFeedback } from '../lib/haptics';
import { useStore } from '../store';
import type { Role } from '../store';
import { GRADIENT } from '../theme';

const FIELD_TEXT: Record<Field, string> = {
  SAY: 'Matematik, Fizik, Kimya, Biyoloji',
  EA: 'Matematik, Edebiyat, Tarih-1, Coğrafya-1',
  SOZ: 'Edebiyat, Tarih, Coğrafya, Felsefe Grubu, Din',
  DIL: 'TYT + Yabancı Dil Testi',
};

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>('student');
  const [field, setField] = useState<Field>('SAY');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(20);

  const finish = () => {
    successFeedback();
    update({ onboarded: true, role, field, name: name.trim(), dailyGoal: goal });
  };

  return (
    <LinearGradient colors={GRADIENT.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.root, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Orbs />
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {step === 0 ? (
          <View key="s0" style={styles.center}>
            <Logo />
            <Appear delay={150}>
              <T size={34} weight="900" color="#FFFFFF" center>
                Hedef YKS
              </T>
            </Appear>
            <Appear delay={250}>
              <T size={16} color="rgba(255,255,255,0.88)" center>
                TYT ve AYT’nin tüm dersleri tek uygulamada: animasyonlu konu anlatımları, çözümlü sorular, mini denemeler ve öğretmen paneli.
              </T>
            </Appear>
            <Appear delay={350}>
              <View style={styles.facts}>
                <Fact icon="library" value={String(SUBJECTS.length)} label="ders" />
                <Fact icon="list" value={String(SUBJECTS.reduce((n, s) => n + s.topics.length, 0))} label="konu" />
                <Fact icon="play-circle" value={String(LESSONS.length)} label="anlatım" />
                <Fact icon="help-circle" value={String(QUESTIONS.length)} label="soru" />
              </View>
            </Appear>
          </View>
        ) : step === 1 ? (
          <View key="s1" style={{ gap: 14 }}>
            <Appear>
              <T size={26} weight="900" color="#FFFFFF">
                Seni tanıyalım
              </T>
            </Appear>
            <View style={styles.roleRow}>
              <Choice icon="school" title="Öğrenciyim" selected={role === 'student'} onPress={() => setRole('student')} />
              <Choice icon="easel" title="Öğretmenim" selected={role === 'teacher'} onPress={() => setRole('teacher')} />
            </View>
            <T size={15} weight="700" color="rgba(255,255,255,0.9)" style={{ marginTop: 6 }}>
              {role === 'teacher' ? 'Hangi alanda ders veriyorsun?' : 'Hangi puan türüne hazırlanıyorsun?'}
            </T>
            {(Object.keys(FIELD_LABELS) as Field[]).map((f, i) => (
              <Appear key={f} delay={i * 60}>
                <PressableScale
                  onPress={() => {
                    tapFeedback();
                    setField(f);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: field === f }}
                  style={[styles.field, field === f && styles.fieldActive]}
                >
                  <View style={{ flex: 1 }}>
                    <T weight="800" color={field === f ? '#3A2BC9' : '#FFFFFF'}>
                      {FIELD_LABELS[f]}
                    </T>
                    <T size={12.5} color={field === f ? '#5E6283' : 'rgba(255,255,255,0.8)'}>
                      {FIELD_TEXT[f]}
                    </T>
                  </View>
                  <Icon name={field === f ? 'radio-button-on' : 'radio-button-off'} size={22} color={field === f ? '#5B4BF5' : '#FFFFFF'} />
                </PressableScale>
              </Appear>
            ))}
          </View>
        ) : (
          <View key="s2" style={{ gap: 14 }}>
            <Appear>
              <T size={26} weight="900" color="#FFFFFF">
                Son bir adım
              </T>
            </Appear>
            <TextInput value={name} onChangeText={setName} placeholder="Adın (isteğe bağlı)" placeholderTextColor="rgba(255,255,255,0.6)" style={styles.input} maxLength={24} accessibilityLabel="Adın" />
            <T size={15} weight="700" color="rgba(255,255,255,0.9)">
              Günde kaç soru çözmek istersin?
            </T>
            <View style={styles.goalRow}>
              {[10, 20, 40, 60].map((g) => (
                <PressableScale
                  key={g}
                  onPress={() => {
                    tapFeedback();
                    setGoal(g);
                  }}
                  containerStyle={{ flex: 1 }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: goal === g }}
                  style={[styles.goal, goal === g && styles.fieldActive]}
                >
                  <T size={22} weight="900" color={goal === g ? '#3A2BC9' : '#FFFFFF'} center>
                    {g}
                  </T>
                  <T size={11.5} color={goal === g ? '#5E6283' : 'rgba(255,255,255,0.8)'} center>
                    {g <= 10 ? 'Rahat' : g <= 20 ? 'Düzenli' : g <= 40 ? 'Hırslı' : 'Maraton'}
                  </T>
                </PressableScale>
              ))}
            </View>
            <T size={13} color="rgba(255,255,255,0.75)">
              Hedefini, sınav tarihini ve alanını daha sonra Ayarlar’dan değiştirebilirsin. Verilerin yalnızca bu telefonda saklanır.
            </T>
          </View>
        )}
      </View>
      <View style={styles.footer}>
        {step > 0 ? (
          <PressableScale
            onPress={() => {
              tapFeedback();
              setStep(step - 1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Geri"
            containerStyle={{ flex: 1 }}
            style={styles.back}
          >
            <Icon name="arrow-back" size={20} color="#FFFFFF" />
            <T size={16} weight="800" color="#FFFFFF">
              Geri
            </T>
          </PressableScale>
        ) : null}
        <PressableScale
          onPress={() => {
            tapFeedback();
            if (step < 2) setStep(step + 1);
            else finish();
          }}
          accessibilityRole="button"
          containerStyle={{ flex: 2 }}
          style={styles.next}
        >
          <T size={16.5} weight="900" color="#3A2BC9">
            {step === 0 ? 'Başlayalım' : step === 1 ? 'Devam' : 'Hazırım!'}
          </T>
          <Icon name="arrow-forward" size={20} color="#3A2BC9" />
        </PressableScale>
      </View>
    </LinearGradient>
  );
}

function Logo() {
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  const float = useAnimatedValue(0);
  useEffect(() => {
    Animated.spring(p, { toValue: 1, useNativeDriver: true, bounciness: 14, speed: 6 }).start();
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [p, float, reduced]);
  return (
    <Animated.View style={[styles.logo, { transform: [{ scale: p }, { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }]}>
      <Icon name="rocket" size={58} color="#5B4BF5" />
    </Animated.View>
  );
}

function Orbs() {
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(p, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [p, reduced]);
  const rotate = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
      <View style={[styles.orb, { width: 260, height: 260, top: -80, right: -90 }]} />
      <View style={[styles.orb, { width: 180, height: 180, bottom: 40, left: -70 }]} />
      <View style={[styles.orb, { width: 90, height: 90, top: '40%', right: 20 }]} />
    </Animated.View>
  );
}

function Fact({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={styles.fact}>
      <Icon name={icon} size={20} color="#FFFFFF" />
      <T size={20} weight="900" color="#FFFFFF">
        {value}
      </T>
      <T size={11.5} color="rgba(255,255,255,0.8)">
        {label}
      </T>
    </View>
  );
}

function Choice({ icon, title, selected, onPress }: { icon: IconName; title: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      containerStyle={{ flex: 1 }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.choice, selected && styles.fieldActive]}
    >
      <Icon name={icon} size={30} color={selected ? '#5B4BF5' : '#FFFFFF'} />
      <T weight="800" color={selected ? '#3A2BC9' : '#FFFFFF'}>
        {title}
      </T>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 22 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 26, backgroundColor: '#FFFFFF' },
  center: { alignItems: 'center', gap: 16 },
  logo: { width: 120, height: 120, borderRadius: 38, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10 },
  facts: { flexDirection: 'row', gap: 10, marginTop: 8, alignSelf: 'stretch' },
  fact: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)' },
  roleRow: { flexDirection: 'row', gap: 12 },
  choice: { alignItems: 'center', gap: 8, paddingVertical: 18, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  fieldActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  input: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  goalRow: { flexDirection: 'row', gap: 10 },
  goal: { paddingVertical: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  footer: { flexDirection: 'row', gap: 10 },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 18, backgroundColor: '#FFFFFF' },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)' },
  orb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
});
