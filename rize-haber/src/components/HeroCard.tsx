/**
 * Ekranların üstündeki vitrin kartı: çapraz renk geçişi, cam etiket, köşede büyük filigran simge
 * ve isteğe bağlı Kaçkar dağ silueti. Hava ekranındaki görsel dili diğer ekranlara taşır.
 *
 * Kart açıldığında filigran ve dağlar yumuşakça yerine kayar (tek seferlik, yerel sürücüyle).
 * "Hareketi azalt" açıksa animasyon yapılmaz.
 */
import { useEffect, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mix, type Colors } from '../colors';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { EASE_OUT, useAnimatedValue, useReducedMotion } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Temanın vurgu renginden kart geçişi üretir: üst-sol biraz açık, alt-sağ derin. */
export function heroGradient(colors: Colors): readonly [string, string] {
  return [
    mix(colors.header, '#FFFFFF', colors.isDark ? 0.04 : 0.1),
    mix(colors.header, '#000000', colors.isDark ? 0.5 : 0.42),
  ];
}

/** Dağ silueti: 45° döndürülmüş kareler (sol, orta, sağ) ve ortadaki zirvede karlı tepe. */
const PEAKS = [
  { left: -40, bottom: -78, size: 150, alpha: 0.09 },
  { left: 70, bottom: -96, size: 190, alpha: 0.12 },
  { left: 250, bottom: -84, size: 160, alpha: 0.08 },
  { left: 146, bottom: 89, size: 38, alpha: 0.2 },
] as const;

type Props = {
  /** Verilmezse temanın vurgu renginden üretilir. */
  gradient?: readonly [string, string];
  /** Sağ alttaki büyük, soluk filigran simge. */
  watermark: IconName;
  /** Üstteki küçük cam etiket (ör. "ÇAYKUR · 2026"). */
  eyebrow?: string;
  eyebrowIcon?: IconName;
  /** Altta katmanlı dağ silueti (Kaçkarlar). */
  mountains?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function HeroCard({
  gradient,
  watermark,
  eyebrow,
  eyebrowIcon,
  mountains,
  accessibilityLabel,
  style,
  children,
}: Props) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const enter = useAnimatedValue(0);

  useEffect(() => {
    if (reduced) {
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, { toValue: 1, duration: 900, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [enter, reduced]);

  const drift = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const tilt = enter.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '-14deg'] });
  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View
      style={[styles.shell, style]}
      accessible={accessibilityLabel ? true : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <LinearGradient colors={gradient ?? heroGradient(colors)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={FILL} />

      {/* Işık halkaları: üst sağdan düşen yumuşak parıltı. */}
      <View pointerEvents="none" style={[styles.ring, { width: 220, height: 220, top: -110, right: -70 }]} />
      <View pointerEvents="none" style={[styles.ring, { width: 140, height: 140, top: -60, right: -20, opacity: 0.7 }]} />

      {mountains ? (
        <Animated.View pointerEvents="none" style={[styles.mountains, { opacity: enter, transform: [{ translateY: rise }] }]}>
          {PEAKS.map((p) => (
            <View
              key={p.left}
              style={[
                styles.peak,
                { left: p.left, bottom: p.bottom, width: p.size, height: p.size, backgroundColor: `rgba(255,255,255,${p.alpha})` },
              ]}
            />
          ))}
        </Animated.View>
      ) : null}

      <Animated.View
        pointerEvents="none"
        style={[styles.watermark, { opacity: enter, transform: [{ translateY: drift }, { rotate: tilt }] }]}
      >
        <Icon name={watermark} size={150} color="rgba(255,255,255,0.13)" />
      </Animated.View>

      <View style={styles.body}>
        {eyebrow ? (
          <View style={styles.eyebrow}>
            {eyebrowIcon ? <Icon name={eyebrowIcon} size={fs(13)} color="#FFFFFF" /> : null}
            <Text style={[styles.eyebrowText, { fontSize: fs(12) }]} numberOfLines={1}>
              {eyebrow}
            </Text>
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { borderRadius: 22, overflow: 'hidden', minHeight: 150 },
  body: { padding: 20, gap: 4 },
  ring: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  mountains: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 120 },
  peak: { position: 'absolute', transform: [{ rotate: '45deg' }], borderRadius: 14 },
  watermark: { position: 'absolute', right: -22, bottom: -30 },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  eyebrowText: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.6 },
});
