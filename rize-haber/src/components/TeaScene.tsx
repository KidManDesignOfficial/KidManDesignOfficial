/**
 * Çay ekranının arka planı: sabah çay bahçesi.
 * Şafak ışığında doğan güneş ve hafif ışık hüzmeleri; uzaktan yakına kat kat yükselen, eğimi izleyen
 * çay sıralarıyla bezeli tepeler; aralarında süzülen sabah sisi ve rüzgârda savrulan çay yaprakları.
 *
 * Performans: tüm döngüler yerel sürücüde opaklık / kaydırma / dönüş animasyonudur.
 * `active` yanlışsa ya da "Hareketi azalt" açıksa sahne durağandır.
 */
import { useMemo } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { DAWN_SUN, TEA_CHROME, TEA_LAYERS, TEA_SKY, TEA_SKY_STOPS } from '../teaScene';
import { seeded } from '../weatherScene';
import { Icon } from './Icon';
import { loopPhase, useLoopClock, useReducedMotion } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Tepe: `cx` merkez, `w` genişlik (ekran genişliğine oranla), `rise` katman üstünden yükseklik (ekran yüksekliğine oranla). */
type Hump = { cx: number; w: number; rise: number };

const LAYOUT: { top: number; humps: Hump[] }[] = [
  { top: 0.4, humps: [{ cx: 0.1, w: 0.9, rise: 0.05 }, { cx: 0.62, w: 1.1, rise: 0.07 }] },
  { top: 0.49, humps: [{ cx: -0.05, w: 1.2, rise: 0.08 }, { cx: 0.85, w: 1.0, rise: 0.06 }] },
  { top: 0.6, humps: [{ cx: 0.3, w: 1.4, rise: 0.09 }, { cx: 1.05, w: 0.9, rise: 0.05 }] },
  { top: 0.74, humps: [{ cx: -0.1, w: 1.3, rise: 0.07 }, { cx: 0.7, w: 1.5, rise: 0.1 }] },
];

export default function TeaScene({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const running = active && !reduced;
  const { width, height } = useWindowDimensions();
  const footer = TEA_CHROME.footer;

  return (
    <View style={[FILL, styles.clip]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={TEA_SKY} locations={TEA_SKY_STOPS} style={FILL} />
      <Sun width={width} height={height} running={running} />
      {LAYOUT.map((layer, i) => (
        <View key={i} style={FILL}>
          <Terrace layer={layer} palette={TEA_LAYERS[i]} width={width} height={height} />
          {i < 2 ? <Mist width={width} top={height * (layer.top + 0.02)} running={running} speed={i === 0 ? 1 : 2} /> : null}
        </View>
      ))}
      <Leaves width={width} height={height} running={running} />
      {/* Kartlardaki yazılar okunaklı kalsın: orta kısımda hafif karartma, en altta sekme çubuğuna erime. */}
      <LinearGradient colors={['rgba(2,14,8,0)', 'rgba(2,14,8,0.32)', 'rgba(2,14,8,0)']} locations={[0.12, 0.5, 0.88]} style={FILL} />
      <LinearGradient colors={[`${footer}00`, footer]} start={{ x: 0, y: 0.84 }} end={{ x: 0, y: 1 }} style={FILL} />
    </View>
  );
}

// ——— Şafak güneşi ve ışık hüzmeleri ———

function Sun({ width, height, running }: { width: number; height: number; running: boolean }) {
  const breath = useLoopClock(7000, running);
  const glow = running ? breath.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] }) : 0.9;
  const cx = width * 0.74;
  const cy = height * 0.41;
  const rays = [-62, -38, -14, 10, 34];
  return (
    <>
      <Animated.View style={[FILL, { opacity: glow }]}>
        {rays.map((deg, i) => (
          <View
            key={deg}
            style={[
              styles.abs,
              {
                left: cx - 14,
                top: cy - height * 0.42,
                width: 28,
                height: height * 0.42,
                transformOrigin: 'bottom',
                transform: [{ rotate: `${deg}deg` }],
                opacity: 0.5 + seeded(i, 61) * 0.5,
              },
            ]}
          >
            <LinearGradient colors={['rgba(255,219,143,0)', 'rgba(255,219,143,0.07)']} style={[FILL, { borderRadius: 14 }]} />
          </View>
        ))}
        {[210, 140, 88].map((d, i) => (
          <View
            key={d}
            style={[styles.abs, { left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: `rgba(255,219,143,${0.06 + i * 0.07})` }]}
          />
        ))}
      </Animated.View>
      <View style={[styles.abs, { left: cx - 22, top: cy - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: DAWN_SUN, opacity: 0.92 }]} />
    </>
  );
}

// ——— Çay tepeleri: basık (elips) tepeler, eğimi izleyen sıralar ve altında düz teraslar ———

function Terrace({
  layer,
  palette,
  width,
  height,
}: {
  layer: (typeof LAYOUT)[number];
  palette: (typeof TEA_LAYERS)[number];
  width: number;
  height: number;
}) {
  const top = height * layer.top;
  return (
    <>
      <View style={[styles.abs, { left: 0, right: 0, top, bottom: 0, backgroundColor: palette.color }]}>
        {/* Düz teraslar: tepelerin önündeki yamaçta yatay çay sıraları */}
        {Array.from({ length: 8 }, (_, r) => (
          <View key={r} style={[styles.abs, { left: 0, right: 0, top: 10 + r * 14, height: 3, borderRadius: 2, backgroundColor: palette.rows }]} />
        ))}
      </View>
      {layer.humps.map((h, i) => {
        const w = width * h.w;
        const k = Math.min(1, (height * h.rise * 2) / w);
        // Ölçekleme ortadan yapılır: görünen üst kenar `top - rise` olsun diye kutu yukarı kaydırılır.
        const visualTop = top - height * h.rise;
        const boxTop = visualTop + (w * k) / 2 - w / 2;
        return (
          <View
            key={i}
            style={[
              styles.abs,
              {
                left: width * h.cx - w / 2,
                top: boxTop,
                width: w,
                height: w,
                borderRadius: w / 2,
                backgroundColor: palette.color,
                overflow: 'hidden',
                transform: [{ scaleY: k }],
              },
            ]}
          >
            {Array.from({ length: 9 }, (_, r) => {
              const inset = 10 + r * (16 / k) * 0.5;
              const d = w - inset * 2;
              if (d <= 0) return null;
              return (
                <View
                  key={r}
                  style={[styles.abs, { left: inset, top: inset, width: d, height: d, borderRadius: d / 2, borderTopWidth: 3 / k, borderColor: palette.rows }]}
                />
              );
            })}
          </View>
        );
      })}
    </>
  );
}

// ——— Sabah sisi: tepelerin arasında yavaşça kayan bantlar ———

function Mist({ width, top, running, speed }: { width: number; top: number; running: boolean; speed: number }) {
  const clock = useLoopClock(60000, running);
  const t = loopPhase(clock, speed, 0);
  const translateX = running ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -width] }) : 0;
  return (
    <Animated.View style={[styles.abs, { left: 0, top, width: width * 2, height: 34, flexDirection: 'row', transform: [{ translateX }] }]}>
      {[0, 1].map((k) => (
        <LinearGradient
          key={k}
          colors={['rgba(230,240,225,0)', 'rgba(230,240,225,0.16)', 'rgba(230,240,225,0.05)', 'rgba(230,240,225,0.14)', 'rgba(230,240,225,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width, height: 34, borderRadius: 17 }}
        />
      ))}
    </Animated.View>
  );
}

// ——— Rüzgârda savrulan çay yaprakları ———

function Leaves({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useLoopClock(30000, running);
  const leaves = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, 71) * 2), seeded(i, 72));
        const drift = width * (0.18 + seeded(i, 73) * 0.2);
        const startX = seeded(i, 74) * width;
        const spin = 180 + seeded(i, 75) * 360;
        return {
          left: startX,
          size: 12 + seeded(i, 76) * 12,
          color: seeded(i, 77) > 0.5 ? '#8FD9A4' : '#C9E59A',
          translateY: running ? t.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }) : seeded(i, 78) * height,
          translateX: running
            ? t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, drift * 0.35, -drift * 0.1, drift * 0.6, drift] })
            : 0,
          rotate: running ? t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) : `${spin}deg`,
          opacity: running ? t.interpolate({ inputRange: [0, 0.08, 0.9, 1], outputRange: [0, 0.45, 0.45, 0] }) : 0.3,
        };
      }),
    [clock, width, height, running],
  );
  return (
    <>
      {leaves.map((l, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, { left: l.left, top: 0, opacity: l.opacity, transform: [{ translateY: l.translateY }, { translateX: l.translateX }, { rotate: l.rotate }] }]}
        >
          <Icon name="leaf" size={l.size} color={l.color} />
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
});
