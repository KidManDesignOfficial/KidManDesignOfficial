/** İçerik yüklenirken gösterilen, hafifçe "nefes alan" gri taslaklar. Dönen çarktan daha sakin ve hızlı hissettirir. */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { useReducedMotion, useAnimatedValue } from './motion';

function usePulse() {
  const reduced = useReducedMotion();
  const v = useAnimatedValue(0.55);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.55, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  return v;
}

export function Bone({
  width = '100%',
  height = 14,
  radius = 7,
  style,
  glass = false,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Koyu sahne üstünde yarı saydam taslak. */
  glass?: boolean;
}) {
  const { colors } = useTheme();
  const color = glass ? 'rgba(255,255,255,0.14)' : colors.isDark ? '#2A332E' : '#E3E8E5';
  return <View style={[{ width, height, borderRadius: radius, backgroundColor: color }, style]} />;
}

/** Taslakları tek bir nabızla birlikte canlandırır. */
export function SkeletonGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const opacity = usePulse();
  return (
    <Animated.View style={[{ opacity }, style]} accessibilityLabel="Yükleniyor" accessibilityRole="progressbar">
      {children}
    </Animated.View>
  );
}

export function SkeletonCard({ lines = 3, image = false, glass = false }: { lines?: number; image?: boolean; glass?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: glass ? 'rgba(255,255,255,0.08)' : colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: glass ? 'rgba(255,255,255,0.15)' : colors.border,
        padding: 14,
        flexDirection: 'row',
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 9 }}>
        <Bone height={16} width="92%" glass={glass} />
        {lines > 1 ? <Bone height={16} width="70%" glass={glass} /> : null}
        {lines > 2 ? <Bone height={11} width="40%" style={{ marginTop: 4 }} glass={glass} /> : null}
      </View>
      {image ? <Bone width={72} height={72} radius={10} glass={glass} /> : null}
    </View>
  );
}

/** Haber listesi taslağı. */
export function NewsSkeleton({ count = 5, glass = false }: { count?: number; glass?: boolean }) {
  return (
    <SkeletonGroup style={{ gap: 10, paddingHorizontal: 16, paddingTop: 4 }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} image={i % 2 === 1} glass={glass} />
      ))}
    </SkeletonGroup>
  );
}

/** Büyük kart + liste taslağı (hava durumu, Rizespor). */
export function HeroSkeleton({ rows = 4, glass = false }: { rows?: number; glass?: boolean }) {
  return (
    <SkeletonGroup style={{ padding: 16, gap: 12 }}>
      <Bone height={190} radius={20} glass={glass} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Bone height={64} radius={12} width="32%" glass={glass} />
        <Bone height={64} radius={12} width="32%" glass={glass} />
        <Bone height={64} radius={12} width="32%" glass={glass} />
      </View>
      {Array.from({ length: rows }, (_, i) => (
        <Bone key={i} height={58} radius={14} glass={glass} />
      ))}
    </SkeletonGroup>
  );
}
