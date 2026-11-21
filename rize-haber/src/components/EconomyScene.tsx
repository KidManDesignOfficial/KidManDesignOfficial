/**
 * Ekonomi ekranının arka planı: gece mavisi bir piyasa ekranı.
 * Soluk ızgara, yeşil / kırmızı mum grafiği, altın sarısı yükselen çizgi ve ucunda nabız gibi atan
 * "canlı" nokta, yukarı süzülen para simgeleri (₺ $ € £) ve ekranı yavaşça tarayan ışık.
 * Grafikler süslemedir; gerçek değerler kartlardadır.
 *
 * Performans: tüm döngüler yerel sürücüde opaklık / kaydırma / ölçek animasyonudur.
 * `active` yanlışsa ya da "Hareketi azalt" açıksa sahne durağandır.
 */
import { useMemo } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { candleSeries, ECON_CHROME, ECON_SKY, ECON_SKY_STOPS, MARKET, segments, trendLine } from '../economyScene';
import { seeded } from '../weatherScene';
import { loopPhase, useLoopClock, useReducedMotion } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

export default function EconomyScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const running = active && !reduced;
  const { width, height } = useWindowDimensions();
  const footer = ECON_CHROME.footer;

  return (
    <View style={[FILL, styles.clip]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={ECON_SKY} locations={ECON_SKY_STOPS} style={FILL} />
      <Glows width={width} height={height} />
      <Grid width={width} height={height} />
      <Candles width={width} height={height} />
      <Trend width={width} height={height} running={running} />
      <Symbols width={width} height={height} running={running} />
      <Scan height={height} running={running} />
      {/* Kartlardaki yazılar okunaklı kalsın: orta kısımda hafif karartma, en altta sekme çubuğuna erime. */}
      <LinearGradient colors={['rgba(2,6,16,0)', 'rgba(2,6,16,0.35)', 'rgba(2,6,16,0)']} locations={[0.1, 0.5, 0.9]} style={FILL} />
      <LinearGradient colors={[`${footer}00`, footer]} start={{ x: 0, y: 0.82 }} end={{ x: 0, y: 1 }} style={FILL} />
    </View>
  );
}

// ——— Işık: sağ üstte altın, sol altta mavi yumuşak parıltı ———

function Glows({ width, height }: { width: number; height: number }) {
  const glow = (cx: number, cy: number, r: number, rgb: string, alpha: number) =>
    [1, 0.66, 0.38].map((k, i) => (
      <View
        key={`${cx}-${k}`}
        style={[
          styles.abs,
          {
            left: cx - r * k,
            top: cy - r * k,
            width: r * k * 2,
            height: r * k * 2,
            borderRadius: r * k,
            backgroundColor: `rgba(${rgb},${alpha * (i + 1)})`,
          },
        ]}
      />
    ));
  return (
    <>
      {glow(width * 0.92, height * 0.12, width * 0.55, '242,199,92', 0.035)}
      {glow(width * 0.05, height * 0.7, width * 0.6, '60,120,255', 0.03)}
    </>
  );
}

// ——— Izgara ———

function Grid({ width, height }: { width: number; height: number }) {
  const rows = Math.ceil(height / 56);
  const cols = 6;
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <View key={`h${i}`} style={[styles.abs, styles.gridLine, { left: 0, right: 0, top: i * 56, height: StyleSheet.hairlineWidth }]} />
      ))}
      {Array.from({ length: cols - 1 }, (_, i) => (
        <View key={`v${i}`} style={[styles.abs, styles.gridLine, { top: 0, bottom: 0, left: ((i + 1) * width) / cols, width: StyleSheet.hairlineWidth }]} />
      ))}
    </>
  );
}

// ——— Mum grafiği ———

function Candles({ width, height }: { width: number; height: number }) {
  const count = 24;
  const top = height * 0.26;
  const band = height * 0.3;
  const step = width / count;
  const series = useMemo(() => candleSeries(count, 3), []);
  const y = (v: number) => top + (1 - v) * band;
  return (
    <View style={[FILL, { opacity: 0.3 }]}>
      {series.map((c, i) => {
        const up = c.close >= c.open;
        const color = up ? MARKET.up : MARKET.down;
        const x = i * step + step / 2;
        const bodyTop = y(Math.max(c.open, c.close));
        const bodyHeight = Math.max(2, Math.abs(c.close - c.open) * band);
        return (
          <View key={i}>
            <View style={[styles.abs, { left: x - 0.75, top: y(c.high), width: 1.5, height: y(c.low) - y(c.high), backgroundColor: color }]} />
            <View style={[styles.abs, { left: x - step * 0.3, top: bodyTop, width: step * 0.6, height: bodyHeight, borderRadius: 1.5, backgroundColor: color }]} />
          </View>
        );
      })}
    </View>
  );
}

// ——— Altın sarısı yükselen çizgi ve canlı nokta ———

function Trend({ width, height, running }: { width: number; height: number; running: boolean }) {
  const top = height * 0.56;
  const band = height * 0.26;
  const pulse = useLoopClock(2400, running);
  const points = useMemo(() => {
    const values = trendLine(22, 1);
    const inset = width * 0.04;
    return values.map((v, i) => ({ x: inset + (i / (values.length - 1)) * (width - inset * 2), y: top + (1 - v) * band }));
  }, [width, top, band]);
  const line = useMemo(() => segments(points, 2), [points]);
  const glow = useMemo(() => segments(points, 8), [points]);
  const last = points[points.length - 1];
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 3.4] });
  const ringOpacity = running ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }) : 0.35;

  return (
    <>
      {/* Çizginin altına düşen hafif ışık */}
      <LinearGradient
        colors={['rgba(242,199,92,0.07)', 'rgba(242,199,92,0)']}
        style={[styles.abs, { left: 0, right: 0, top: top, height: band * 1.2 }]}
      />
      {glow.map((s, i) => (
        <View
          key={`g${i}`}
          style={[styles.abs, { left: s.left, top: s.top, width: s.length + 2, height: 8, borderRadius: 4, backgroundColor: 'rgba(242,199,92,0.12)', transform: [{ rotate: `${s.angle}deg` }] }]}
        />
      ))}
      {line.map((s, i) => (
        <View
          key={`l${i}`}
          style={[styles.abs, { left: s.left, top: s.top, width: s.length + 1, height: 2, borderRadius: 1, backgroundColor: 'rgba(242,199,92,0.55)', transform: [{ rotate: `${s.angle}deg` }] }]}
        />
      ))}
      {/* Son değerden sola uzanan kesik "güncel fiyat" çizgisi */}
      {Array.from({ length: Math.floor(last.x / 14) }, (_, i) => (
        <View key={`d${i}`} style={[styles.abs, { left: last.x - 10 - i * 14, top: last.y - 0.5, width: 6, height: 1, backgroundColor: 'rgba(242,199,92,0.22)' }]} />
      ))}
      <Animated.View
        style={[
          styles.abs,
          { left: last.x - 8, top: last.y - 8, width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: MARKET.gold, opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <View style={[styles.abs, { left: last.x - 4, top: last.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: MARKET.goldSoft }]} />
    </>
  );
}

// ——— Yukarı süzülen para simgeleri ———

const SYMBOLS = ['₺', '$', '€', '£', '₺', '$', '€', '₺', '£', '$'];

function Symbols({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useLoopClock(42000, running);
  const items = useMemo(
    () =>
      SYMBOLS.map((symbol, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, 41) * 2), seeded(i, 42));
        const start = height * (0.95 + seeded(i, 43) * 0.1);
        return {
          symbol,
          left: (i / SYMBOLS.length) * width + seeded(i, 44) * width * 0.08,
          size: 18 + seeded(i, 45) * 26,
          top: start,
          translateY: running ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -start - 60] }) : -seeded(i, 46) * start,
          opacity: running
            ? t.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 0.12, 0.12, 0] })
            : 0.07 + seeded(i, 47) * 0.05,
        };
      }),
    [clock, width, height, running],
  );
  return (
    <>
      {items.map((s, i) => (
        <Animated.Text
          key={i}
          style={[styles.abs, styles.symbol, { left: s.left, top: s.top, fontSize: s.size, opacity: s.opacity, transform: [{ translateY: s.translateY }] }]}
        >
          {s.symbol}
        </Animated.Text>
      ))}
    </>
  );
}

// ——— Ekranı yukarıdan aşağı tarayan ince ışık ———

function Scan({ height, running }: { height: number; running: boolean }) {
  const clock = useLoopClock(9000, running);
  if (!running) return null;
  const translateY = clock.interpolate({ inputRange: [0, 1], outputRange: [-80, height] });
  const opacity = clock.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View style={[styles.abs, { left: 0, right: 0, top: 0, height: 80, opacity, transform: [{ translateY }] }]}>
      <LinearGradient colors={['rgba(120,170,255,0)', 'rgba(120,170,255,0.05)', 'rgba(120,170,255,0)']} style={FILL} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  gridLine: { backgroundColor: 'rgba(140,170,220,0.09)' },
  symbol: { color: '#F7DE9C', fontWeight: '800' },
});

