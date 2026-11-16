/** Değeri dolarak çizilen dairesel ilerleme halkası (0–1). */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { EASE_OUT, useAnimatedValue, useReducedMotion } from './motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  value,
  size = 120,
  stroke = 12,
  colors,
  track,
  children,
  duration = 1000,
}: {
  value: number;
  size?: number;
  stroke?: number;
  colors: [string, string];
  track: string;
  children?: ReactNode;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    Animated.timing(p, { toValue: Math.max(0, Math.min(1, value)), duration: reduced ? 0 : duration, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [value, p, reduced, duration]);
  const dashOffset = p.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });
  const id = `rg${colors[0].replace('#', '')}${size}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={dashOffset}
        />
      </Svg>
      {children}
    </View>
  );
}
