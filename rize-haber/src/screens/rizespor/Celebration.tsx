/**
 * Canlı maç anlarının ekran efektleri.
 * - Rizespor golü: beyaz flaş, genişleyen şok dalgası, yukarıdan yağan yeşil-mavi konfeti, dört bir
 *   yana saçılan parçalar ve yaylanarak büyüyen "GOOOL!" yazısı; telefon ritmik titrer.
 * - Rakip golü, başlama / devre arası / maç sonu, kırmızı kart: üstten kayan bilgi şeridi.
 * - Galibiyetle biten maç: şerit + konfeti.
 *
 * "Arayüz animasyonları" kapalıysa (ya da sistemde "Hareketi azalt" açıksa) yalnızca sade bir kart
 * kısa süre görünür; titreşim Ayarlar'daki "Titreşim" anahtarına uyar.
 */
import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReducedMotion, useAnimatedValue } from '../../components/motion';
import { alertFeedback, goalFeedback, pressFeedback } from '../../haptics';
import type { LiveMoment } from '../../rizespor/live';
import { CLUB_COLORS } from '../../rizespor/names';
import { tint, useTheme } from '../../theme';
import { seeded } from '../../weatherScene';

export type CelebrationKind = 'goal-us' | 'goal-them' | 'whistle' | 'win' | 'red';

export type CelebrationData = { id: number; kind: CelebrationKind; title: string; body: string; detail?: string };

const CONFETTI = 44;
const BURST = 18;
const PALETTE = [CLUB_COLORS.green, CLUB_COLORS.blue, '#FFFFFF', '#7BE0A6', '#5AA9FF', '#FFD447'];

/** Konfeti renkleri; "Tek renk" düzeninde seçilen rengin tonları (beyaz olduğu gibi kalır). */
function usePalette(): string[] {
  const { colors } = useTheme();
  return useMemo(() => PALETTE.map((c) => tint(colors, c)), [colors]);
}

export default function Celebration({ data, onDone }: { data: CelebrationData; onDone: () => void }) {
  const reduced = useReducedMotion();
  const big = data.kind === 'goal-us';
  const confetti = (data.kind === 'goal-us' || data.kind === 'win') && !reduced;

  useEffect(() => {
    if (data.kind === 'goal-us' || data.kind === 'win') goalFeedback();
    else if (data.kind === 'red') alertFeedback();
    else pressFeedback();
  }, [data.kind, data.id]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.layer]}>
      {confetti ? <ConfettiRain key={`c${data.id}`} /> : null}
      {big ? <GoalSplash key={`g${data.id}`} data={data} reduced={reduced} onDone={onDone} /> : <Banner key={`b${data.id}`} data={data} reduced={reduced} onDone={onDone} />}
    </View>
  );
}

// ——— Rizespor golü ———

function GoalSplash({ data, reduced, onDone }: { data: CelebrationData; reduced: boolean; onDone: () => void }) {
  const { colors } = useTheme();
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const flash = useAnimatedValue(reduced ? 0 : 1);
  const pop = useAnimatedValue(0);
  const ring = useAnimatedValue(0);
  const fly = useAnimatedValue(0);
  const fade = useAnimatedValue(1);
  const shake = useAnimatedValue(0);

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(flash, { toValue: 0, duration: reduced ? 0 : 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 9, bounciness: 16 }),
        Animated.timing(ring, { toValue: 1, duration: reduced ? 0 : 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fly, { toValue: 1, duration: reduced ? 0 : 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        reduced
          ? Animated.delay(0)
          : Animated.sequence(
              [6, -6, 4, -4, 2, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true })),
            ),
      ]),
      Animated.delay(reduced ? 1200 : 1500),
      Animated.timing(fade, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
  }, [fade, flash, fly, onDone, pop, reduced, ring, shake]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.2] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.9, 0.35, 0] });
  const size = Math.min(width * 0.6, 260);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, { opacity: fade }]}>
      <View style={styles.dim} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: flash }]} />
      {!reduced ? (
        <Animated.View
          style={[
            styles.ring,
            { borderColor: tint(colors, '#7BE0A6') },
            { width: size, height: size, borderRadius: size / 2, opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />
      ) : null}
      {!reduced
        ? Array.from({ length: BURST }, (_, i) => {
            const angle = (i / BURST) * Math.PI * 2;
            const dist = 130 + (i % 3) * 45;
            const tx = fly.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
            const ty = fly.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
            const o = fly.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
            const rot = fly.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 ? 1 : -1) * 300}deg`] });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  { backgroundColor: palette[i % palette.length], opacity: o, transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }] },
                ]}
              />
            );
          })
        : null}
      <Animated.View style={[styles.badge, { backgroundColor: tint(colors, CLUB_COLORS.green), transform: [{ translateX: shake }, { scale }] }]}>
        <Text style={styles.ball}>⚽</Text>
        <Text style={styles.goal} adjustsFontSizeToFit numberOfLines={1}>
          {data.title}
        </Text>
        <Text style={styles.score} numberOfLines={2}>
          {data.body}
        </Text>
        {data.detail ? <Text style={styles.detail}>{data.detail}</Text> : null}
      </Animated.View>
    </Animated.View>
  );
}

// ——— Bilgi şeridi (rakip golü, düdük, kırmızı kart, galibiyet) ———

const BANNER_STYLE: Record<Exclude<CelebrationKind, 'goal-us'>, { bg: string; icon: string }> = {
  'goal-them': { bg: '#3B4652', icon: '⚽' },
  whistle: { bg: CLUB_COLORS.blueDark, icon: '⏱️' },
  win: { bg: CLUB_COLORS.green, icon: '🏆' },
  red: { bg: '#B3261E', icon: '🟥' },
};

function Banner({ data, reduced, onDone }: { data: CelebrationData; reduced: boolean; onDone: () => void }) {
  const slide = useAnimatedValue(reduced ? 1 : 0);
  const fade = useAnimatedValue(1);
  useEffect(() => {
    const anim = Animated.sequence([
      reduced ? Animated.delay(0) : Animated.spring(slide, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.delay(2600),
      Animated.timing(fade, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
  }, [fade, onDone, reduced, slide]);
  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [-140, 0] });
  const { colors } = useTheme();
  const base = BANNER_STYLE[data.kind as Exclude<CelebrationKind, 'goal-us'>] ?? BANNER_STYLE.whistle;
  // Kırmızı kart ve rakip golü anlam taşır, olduğu gibi kalır; düdük ve galibiyet şeridi renk düzenine uyar.
  const look = data.kind === 'whistle' || data.kind === 'win' ? { ...base, bg: tint(colors, base.bg) } : base;
  return (
    <SafeAreaView edges={['top']} style={styles.bannerWrap}>
      <Animated.View
        style={[styles.banner, { backgroundColor: look.bg, opacity: fade, transform: [{ translateY }] }]}
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${data.title}. ${data.body}`}
      >
        <Text style={styles.bannerIcon}>{look.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {data.title}
          </Text>
          <Text style={styles.bannerBody} numberOfLines={2}>
            {data.body}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

// ——— Konfeti yağmuru: her parça kendi gecikmesi, salınımı ve dönüşüyle düşer ———

function ConfettiRain() {
  const palette = usePalette();
  const { width, height } = useWindowDimensions();
  const t = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.timing(t, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [t]);
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI }, (_, i) => {
        const start = seeded(i, 61) * 0.35;
        const end = Math.min(1, start + 0.55 + seeded(i, 62) * 0.25);
        const x = seeded(i, 63) * width;
        const sway = 18 + seeded(i, 64) * 30;
        const mid = (start + end) / 2;
        return {
          key: i,
          color: palette[i % palette.length],
          w: 6 + seeded(i, 65) * 6,
          h: 10 + seeded(i, 66) * 8,
          x,
          translateY: t.interpolate({ inputRange: [0, start, end, 1], outputRange: [-40, -40, height + 40, height + 40] }),
          translateX: t.interpolate({ inputRange: [0, start, mid, end, 1], outputRange: [0, 0, sway, -sway / 2, -sway / 2] }),
          rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(seeded(i, 67) > 0.5 ? 1 : -1) * (360 + seeded(i, 68) * 540)}deg`] }),
          opacity: t.interpolate({ inputRange: [0, start, start + 0.02, end - 0.05, end], outputRange: [0, 0, 1, 1, 0] }),
        };
      }),
    [height, palette, t, width],
  );
  return (
    <>
      {pieces.map((p) => (
        <Animated.View
          key={p.key}
          style={{
            position: 'absolute',
            top: 0,
            left: p.x,
            width: p.w,
            height: p.h,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [{ translateY: p.translateY }, { translateX: p.translateX }, { rotate: p.rotate }],
          }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  layer: { zIndex: 60, elevation: 60 },
  center: { alignItems: 'center', justifyContent: 'center' },
  dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.42)' },
  ring: { position: 'absolute', borderWidth: 6 },
  particle: { position: 'absolute', width: 10, height: 16, borderRadius: 3 },
  badge: {
    alignItems: 'center',
    maxWidth: '86%',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 26,
    backgroundColor: CLUB_COLORS.green,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  ball: { fontSize: 44 },
  goal: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', letterSpacing: 2 },
  score: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  detail: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  bannerWrap: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  bannerIcon: { fontSize: 26 },
  bannerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  bannerBody: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', marginTop: 2 },
});

/** Canlı andan (live.ts) kutlama verisi. */
export function celebrationFor(
  moment: LiveMoment,
  text: { title: string; body: string },
  id: number,
  detail?: string,
): CelebrationData {
  if (moment.kind === 'goal') return { id, kind: moment.us ? 'goal-us' : 'goal-them', ...text, detail };
  if (moment.kind === 'fulltime' && moment.match.result === 'G') return { id, kind: 'win', ...text };
  return { id, kind: 'whistle', ...text };
}
