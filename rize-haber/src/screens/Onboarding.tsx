/**
 * İlk açılış tanıtımı: 1) hoş geldin, 2) ilçe ve yazı boyutu, 3) bildirimler.
 * Sayfalar yana kayarak geçer; her adımda "Geç" ile atlanabilir. Bir kez gösterilir.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, BackHandler, Easing, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TEXT_SCALES, type TextSize } from '../colors';
import { Icon, type IconName } from '../components/Icon';
import { PressableScale, useReducedMotion, useAnimatedValue } from '../components/motion';
import { WEATHER_LOCATIONS } from '../config';
import { pressFeedback, successFeedback, tapFeedback } from '../haptics';
import { enableNewsNotifications, setMatchFeature } from '../notifications';
import { useTheme } from '../theme';

const KEY = 'rizehaber:onboarded:v1';

export async function hasOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return true; // depolama okunamıyorsa kullanıcıyı tanıtımda bekletme
  }
}

async function markOnboarded() {
  try {
    await AsyncStorage.setItem(KEY, 'true');
  } catch {
    // yok say
  }
}

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'newspaper-outline', title: 'Rize’nin gündemi', text: 'İlçe ilçe güncel haberler, bildirimlerle.' },
  { icon: 'football-outline', title: 'Çaykur Rizespor', text: 'Fikstür, canlı skor, puan durumu ve kadro.' },
  { icon: 'leaf-outline', title: 'Çay ve ekonomi', text: 'Yaş çay fiyatı, döviz kurları ve altın.' },
  { icon: 'compass-outline', title: 'Rize’yi keşfet', text: 'Yaylalar, lezzetler, kültür ve tarih.' },
];

const PAGES = 3;
const GREEN = '#1B6B3A';

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { settings, updateSettings, fs } = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [page, setPage] = useState(0);
  const [matchReminders, setMatchReminders] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const x = useAnimatedValue(0);
  const enter = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: reduced ? 0 : 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [enter, reduced]);

  const go = useCallback(
    (next: number) => {
      tapFeedback();
      setPage(next);
      Animated.spring(x, { toValue: -next * width, useNativeDriver: true, speed: 14, bounciness: 0 }).start();
    },
    [width, x],
  );

  // Android geri tuşu bir önceki adıma döner.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 0) return false;
      go(page - 1);
      return true;
    });
    return () => sub.remove();
  }, [page, go]);

  const finish = async (applyChoices: boolean) => {
    if (finishing) return;
    setFinishing(true);
    if (applyChoices) {
      try {
        if (matchReminders) await setMatchFeature('reminders', true);
        if (newsAlerts) await enableNewsNotifications();
        successFeedback();
      } catch {
        // izin reddedilse de uygulamaya devam edilir; Ayarlar'dan sonra açılabilir
      }
    }
    await markOnboarded();
    onDone();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1 },
        safe: { flex: 1 },
        top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 8, height: 44 },
        skip: { color: 'rgba(255,255,255,0.85)', fontSize: fs(15), fontWeight: '700' },
        track: { flex: 1, flexDirection: 'row' },
        page: { paddingHorizontal: 24 },
        logo: { width: 132, height: 132, alignSelf: 'center', marginTop: 12 },
        h1: { color: '#FFFFFF', fontSize: fs(30), fontWeight: '900', textAlign: 'center', marginTop: 12 },
        h2: { color: '#FFFFFF', fontSize: fs(26), fontWeight: '900', marginTop: 8 },
        lead: { color: 'rgba(255,255,255,0.88)', fontSize: fs(16), lineHeight: fs(23), textAlign: 'center', marginTop: 8 },
        sub: { color: 'rgba(255,255,255,0.85)', fontSize: fs(15), lineHeight: fs(22), marginTop: 6 },
        features: { marginTop: 24, gap: 12 },
        feature: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 14,
          borderRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.12)',
        },
        featureIcon: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        },
        featureTitle: { color: '#FFFFFF', fontSize: fs(16), fontWeight: '800' },
        featureText: { color: 'rgba(255,255,255,0.85)', fontSize: fs(13), marginTop: 2 },
        label: { color: '#FFFFFF', fontSize: fs(15), fontWeight: '800', marginTop: 24, marginBottom: 10 },
        chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        place: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.25)',
        },
        placeActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
        placeText: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '700' },
        placeTextActive: { color: GREEN },
        sizes: { flexDirection: 'row', gap: 8 },
        size: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderWidth: 2,
          borderColor: 'transparent',
        },
        sizeActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
        sizeA: { color: '#FFFFFF', fontWeight: '900' },
        sizeAActive: { color: GREEN },
        sizeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), marginTop: 2, fontWeight: '600' },
        sizeLabelActive: { color: GREEN },
        toggle: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.12)',
          marginTop: 12,
        },
        toggleTitle: { color: '#FFFFFF', fontSize: fs(16), fontWeight: '800' },
        toggleText: { color: 'rgba(255,255,255,0.85)', fontSize: fs(13), marginTop: 2, lineHeight: fs(18) },
        footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
        dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
        dot: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
        button: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
        buttonText: { color: GREEN, fontSize: fs(17), fontWeight: '900' },
        note: { color: 'rgba(255,255,255,0.75)', fontSize: fs(12), textAlign: 'center', lineHeight: fs(17) },
      }),
    [fs],
  );

  const opacity = enter;
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <LinearGradient colors={['#23854A', '#0E4D2A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          {page < PAGES - 1 ? (
            <Pressable onPress={() => finish(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Tanıtımı geç">
              <Text style={styles.skip}>Geç</Text>
            </Pressable>
          ) : null}
        </View>

        <Animated.View style={[styles.track, { width: width * PAGES, transform: [{ translateX: x }] }]}>
          {/* 1 — Hoş geldin */}
          <ScrollView style={{ width }} contentContainerStyle={styles.page}>
            <Animated.View style={{ opacity, transform: [{ translateY: rise }] }}>
              <Image source={require('../../assets/splash-icon.png')} style={styles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
              <Text style={styles.h1}>Rize Haber’e{'\n'}hoş geldin</Text>
              <Text style={styles.lead}>Rize’ye dair her şey tek yerde.</Text>
              <View style={styles.features}>
                {FEATURES.map((f) => (
                  <View key={f.title} style={styles.feature}>
                    <View style={styles.featureIcon}>
                      <Icon name={f.icon} size={22} color={GREEN} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureTitle}>{f.title}</Text>
                      <Text style={styles.featureText}>{f.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </ScrollView>

          {/* 2 — İlçe ve yazı boyutu */}
          <ScrollView style={{ width }} contentContainerStyle={styles.page}>
            <Text style={styles.h2}>Sana göre ayarlayalım</Text>
            <Text style={styles.sub}>Bunları daha sonra Ayarlar’dan değiştirebilirsin.</Text>

            <Text style={styles.label}>Hava durumu için ilçen</Text>
            <View style={styles.chips}>
              {WEATHER_LOCATIONS.map((l) => {
                const active = settings.weatherLocationId === l.id;
                return (
                  <PressableScale
                    key={l.id}
                    onPress={() => {
                      tapFeedback();
                      updateSettings({ weatherLocationId: l.id });
                    }}
                    style={[styles.place, active && styles.placeActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={l.name}
                  >
                    {active ? <Icon name="checkmark" size={15} color={GREEN} /> : null}
                    <Text style={[styles.placeText, active && styles.placeTextActive]}>{l.name}</Text>
                  </PressableScale>
                );
              })}
            </View>

            <Text style={styles.label}>Yazı boyutu</Text>
            <View style={styles.sizes}>
              {(Object.keys(TEXT_SCALES) as TextSize[]).map((id) => {
                const active = settings.textSize === id;
                return (
                  <PressableScale
                    key={id}
                    onPress={() => { tapFeedback(); updateSettings({ textSize: id }); }}
                    style={[styles.size, active && styles.sizeActive]}
                    containerStyle={{ flex: 1 }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={TEXT_SCALES[id].name}
                  >
                    <Text style={[styles.sizeA, active && styles.sizeAActive, { fontSize: 18 * TEXT_SCALES[id].scale }]}>Aa</Text>
                    <Text style={[styles.sizeLabel, active && styles.sizeLabelActive]}>{TEXT_SCALES[id].name}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </ScrollView>

          {/* 3 — Bildirimler */}
          <ScrollView style={{ width }} contentContainerStyle={styles.page}>
            <Text style={styles.h2}>Haberdar ol</Text>
            <Text style={styles.sub}>Yalnızca seçtiklerin için bildirim gelir.</Text>

            <View style={styles.toggle}>
              <Icon name="football-outline" size={26} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Rizespor maç hatırlatması</Text>
                <Text style={styles.toggleText}>Maçtan 30 dk önce: “🍵 Çayını demle, maç başlıyor!”</Text>
              </View>
              <Switch value={matchReminders} onValueChange={(v) => { pressFeedback(); setMatchReminders(v); }} trackColor={{ true: '#7FD3A0', false: 'rgba(255,255,255,0.3)' }} thumbColor="#FFFFFF" accessibilityLabel="Rizespor maç hatırlatması" />
            </View>
            <View style={styles.toggle}>
              <Icon name="newspaper-outline" size={26} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Yeni haber bildirimleri</Text>
                <Text style={styles.toggleText}>Rize’de yeni bir haber çıktığında (~30 dk aralıkla).</Text>
              </View>
              <Switch value={newsAlerts} onValueChange={(v) => { pressFeedback(); setNewsAlerts(v); }} trackColor={{ true: '#7FD3A0', false: 'rgba(255,255,255,0.3)' }} thumbColor="#FFFFFF" accessibilityLabel="Yeni haber bildirimleri" />
            </View>
          </ScrollView>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.dots} accessibilityLabel={`Adım ${page + 1} / ${PAGES}`}>
            {Array.from({ length: PAGES }, (_, i) => (
              <View key={i} style={[styles.dot, { width: i === page ? 22 : 8, backgroundColor: i === page ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }]} />
            ))}
          </View>
          <PressableScale
            onPress={() => (page < PAGES - 1 ? go(page + 1) : finish(true))}
            style={styles.button}
            accessibilityRole="button"
            disabled={finishing}
          >
            <Text style={styles.buttonText}>{page < PAGES - 1 ? 'Devam' : finishing ? 'Hazırlanıyor…' : 'Başlayalım'}</Text>
          </PressableScale>
          {page === PAGES - 1 ? <Text style={styles.note}>Bildirim izni istenebilir. İstediğin zaman Ayarlar’dan kapatabilirsin.</Text> : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
