/**
 * Fonksiyon grafiği: eksenler, ızgara ve eğriler. Eğriler soldan sağa "çizilerek" belirir.
 * Konu anlatımlarındaki `plot` bloklarını çizer.
 */
import { useEffect, useMemo, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';

import type { PlotFn } from '../data/types';
import { useTheme } from '../theme';
import { EASE_OUT, useAnimatedValue, useReducedMotion } from './motion';
import { T } from './ui';

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const PLOT_COLORS = ['#5B4BF5', '#FF7A45', '#12B76A', '#E0457B'];

type Built = { d: string; length: number };

/** Eğriyi örnekleyip SVG yoluna çevirir; tanımsız/aralık dışı noktalarda çizgiyi koparır. */
export function buildPath(f: (x: number) => number, x: [number, number], y: [number, number], w: number, h: number, samples = 160): Built {
  const sx = (v: number) => ((v - x[0]) / (x[1] - x[0])) * w;
  const sy = (v: number) => h - ((v - y[0]) / (y[1] - y[0])) * h;
  const pad = (y[1] - y[0]) * 0.6;
  let d = '';
  let length = 0;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= samples; i++) {
    const xv = x[0] + ((x[1] - x[0]) * i) / samples;
    const yv = f(xv);
    if (!Number.isFinite(yv) || yv < y[0] - pad || yv > y[1] + pad) {
      prev = null;
      continue;
    }
    const pt: [number, number] = [sx(xv), Math.max(-h, Math.min(2 * h, sy(yv)))];
    if (prev) {
      d += ` L${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
      length += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
    } else d += ` M${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
    prev = pt;
  }
  return { d: d.trim(), length };
}

export function Plot({ fns, x, y, caption }: { fns: PlotFn[]; x: [number, number]; y: [number, number]; caption: string }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const h = Math.round(w * 0.62);
  const p = useAnimatedValue(0);
  const paths = useMemo(() => (w ? fns.map((fn) => buildPath(fn.f, x, y, w, h)) : []), [fns, x, y, w, h]);

  useEffect(() => {
    if (!w) return;
    p.setValue(0);
    Animated.timing(p, { toValue: 1, duration: reduced ? 0 : 1600, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [w, p, reduced]);

  const sx = (v: number) => ((v - x[0]) / (x[1] - x[0])) * w;
  const sy = (v: number) => h - ((v - y[0]) / (y[1] - y[0])) * h;
  const gridX: number[] = [];
  for (let i = Math.ceil(x[0]); i <= Math.floor(x[1]); i++) gridX.push(i);
  const gridY: number[] = [];
  const stepY = y[1] - y[0] > 12 ? 5 : 1;
  for (let i = Math.ceil(y[0] / stepY) * stepY; i <= y[1]; i += stepY) gridY.push(i);

  return (
    <View style={{ gap: 10 }}>
      <View
        onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
        style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: c.cardAlt }}
        accessible
        accessibilityLabel={`Grafik: ${caption}`}
      >
        {w ? (
          <Svg width={w} height={h}>
            <G>
              {gridX.map((g) => (
                <Line key={`x${g}`} x1={sx(g)} x2={sx(g)} y1={0} y2={h} stroke={c.border} strokeWidth={g === 0 ? 0 : 1} />
              ))}
              {gridY.map((g) => (
                <Line key={`y${g}`} y1={sy(g)} y2={sy(g)} x1={0} x2={w} stroke={c.border} strokeWidth={g === 0 ? 0 : 1} />
              ))}
              {x[0] <= 0 && x[1] >= 0 ? <Line x1={sx(0)} x2={sx(0)} y1={0} y2={h} stroke={c.textFaint} strokeWidth={1.5} /> : null}
              {y[0] <= 0 && y[1] >= 0 ? <Line y1={sy(0)} y2={sy(0)} x1={0} x2={w} stroke={c.textFaint} strokeWidth={1.5} /> : null}
              {gridX.filter((g) => g !== 0).map((g) => (
                <SvgText key={`lx${g}`} x={sx(g)} y={Math.min(h - 4, Math.max(12, sy(0) + 14))} fontSize={10} fill={c.textFaint} textAnchor="middle">
                  {g}
                </SvgText>
              ))}
              {paths.map((pp, i) => (
                <AnimatedPath
                  key={i}
                  d={pp.d}
                  stroke={fns[i].color ?? PLOT_COLORS[i % PLOT_COLORS.length]}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={`${pp.length + 1} ${pp.length + 1}`}
                  strokeDashoffset={p.interpolate({ inputRange: [0, 1], outputRange: [pp.length + 1, 0] })}
                />
              ))}
            </G>
          </Svg>
        ) : (
          <View style={{ height: 180 }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {fns.map((fn, i) => (
          <View key={fn.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: fn.color ?? PLOT_COLORS[i % PLOT_COLORS.length] }} />
            <T size={13} weight="600">
              {fn.label}
            </T>
          </View>
        ))}
      </View>
      <T size={13.5} muted>
        {caption}
      </T>
    </View>
  );
}
