/** Başarı kutlaması: yukarıdan dönerek düşen renkli kâğıt parçaları. Hareketi azalt açıksa gösterilmez. */
import { useEffect, useMemo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { rng } from '../lib/quiz';
import { useReducedMotion } from './motion';

const COLORS = ['#5B4BF5', '#FF7A45', '#12B76A', '#F5C542', '#E0457B', '#2E90FA'];

export function Confetti({ count = 46 }: { count?: number }) {
  const reduced = useReducedMotion();
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo(() => {
    const r = rng(count * 7919 + Math.round(width));
    return Array.from({ length: count }, (_, i) => ({
        x: r() * width,
        drift: (r() - 0.5) * 120,
        delay: r() * 500,
        dur: 1800 + r() * 1400,
        size: 6 + r() * 7,
        color: COLORS[i % COLORS.length],
        spin: r() > 0.5 ? 1 : -1,
        v: new Animated.Value(0),
      }));
  }, [count, width]);

  useEffect(() => {
    if (reduced) return;
    Animated.parallel(
      pieces.map((p) => Animated.timing(p.v, { toValue: 1, duration: p.dur, delay: p.delay, easing: Easing.out(Easing.quad), useNativeDriver: true })),
    ).start();
  }, [pieces, reduced]);

  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size * 1.6,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.85] }) },
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 720}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
