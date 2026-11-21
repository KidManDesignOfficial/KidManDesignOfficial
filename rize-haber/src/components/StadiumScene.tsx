/**
 * Rizespor ekranının arka planı: maç gecesi stadyumu.
 * Gece göğü, iki projektör kulesi (nefes alan ışık ve süzülen ışık hüzmeleri), tribünlerde parlayan
 * fotoğraf flaşları ve perspektifle uzanan, biçilmiş çim şeritli bir saha.
 *
 * Performans: tüm döngüler yerel sürücüde (native driver) yalnızca opaklık / dönüş animasyonudur.
 * `active` yanlışsa (sekme açık değil) ya da "Hareketi azalt" açıksa sahne durağandır.
 */
import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FLOODLIGHT, GRASS, STADIUM_CHROME, STADIUM_SKY, STADIUM_SKY_STOPS } from '../rizespor/stadium';
import { seeded } from '../weatherScene';
import { useAnimatedValue, useSceneStill } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
const LINE = 'rgba(255,255,255,0.30)';

function useClock(duration: number, running: boolean): Animated.Value {
  const clock = useAnimatedValue(0);
  useEffect(() => {
    if (!running) return;
    clock.setValue(0);
    const loop = Animated.loop(Animated.timing(clock, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [clock, duration, running]);
  return clock;
}

function cycle(clock: Animated.Value, speed: number, phase: number) {
  return Animated.modulo(Animated.add(Animated.multiply(clock, speed), phase), 1);
}

export default function StadiumScene({ active }: { active: boolean }) {
  const reduced = useSceneStill();
  const running = active && !reduced;
  const { width, height } = useWindowDimensions();
  const footer = STADIUM_CHROME.footer;

  return (
    <View style={[FILL, styles.clip]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={STADIUM_SKY} locations={STADIUM_SKY_STOPS} style={FILL} />
      <Stars width={width} height={height} />
      <Stands width={width} height={height} running={running} />
      <Field width={width} height={height} />
      <Floodlight side="left" width={width} height={height} running={running} />
      <Floodlight side="right" width={width} height={height} running={running} />
      {/* Kartlardaki yazılar okunaklı kalsın: orta kısımda hafif karartma, en altta sekme çubuğuna erime. */}
      <LinearGradient colors={['rgba(3,10,20,0)', 'rgba(3,10,20,0.35)', 'rgba(3,10,20,0)']} locations={[0.15, 0.5, 0.85]} style={FILL} />
      <LinearGradient colors={[`${footer}00`, footer]} start={{ x: 0, y: 0.8 }} end={{ x: 0, y: 1 }} style={FILL} />
    </View>
  );
}

// ——— Gece göğü: seyrek, sabit yıldızlar (projektör ışığında sönükleşir) ———

function Stars({ width, height }: { width: number; height: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: seeded(i, 11) * width,
        top: seeded(i, 12) * height * 0.16,
        size: 1 + seeded(i, 13) * 1.6,
        opacity: 0.25 + seeded(i, 14) * 0.45,
      })),
    [width, height],
  );
  return (
    <>
      {stars.map((s, i) => (
        <View
          key={i}
          style={[styles.abs, { left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: '#FFFFFF', opacity: s.opacity }]}
        />
      ))}
    </>
  );
}

// ——— Tribünler: kademeli sıralar ve yer yer patlayan fotoğraf flaşları ———

function Stands({ width, height, running }: { width: number; height: number; running: boolean }) {
  const top = height * 0.17;
  const bandHeight = height * 0.2;
  const clock = useClock(7000, running);
  const flashes = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const t = cycle(clock, 1 + Math.floor(seeded(i, 21) * 3), seeded(i, 22));
        // Kısa, keskin bir parlama; döngünün geri kalanında söner.
        const peak = 0.1 + seeded(i, 23) * 0.8;
        return {
          left: seeded(i, 24) * width,
          top: top + seeded(i, 25) * bandHeight * 0.9,
          size: 2 + seeded(i, 26) * 2.2,
          opacity: running
            ? t.interpolate({ inputRange: [0, peak - 0.03, peak, peak + 0.05, 1], outputRange: [0.08, 0.08, 1, 0.08, 0.08] })
            : 0.15 + seeded(i, 27) * 0.4,
        };
      }),
    [clock, width, top, bandHeight, running],
  );
  return (
    <View style={[styles.abs, { left: 0, right: 0, top, height: bandHeight }]}>
      <LinearGradient colors={['rgba(4,10,22,0)', 'rgba(4,10,22,0.75)', 'rgba(6,18,26,0.9)']} style={FILL} />
      {[0.28, 0.5, 0.72].map((y) => (
        <View key={y} style={[styles.abs, { left: 0, right: 0, top: bandHeight * y, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      ))}
      {flashes.map((f, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            { left: f.left, top: f.top - top, width: f.size, height: f.size, borderRadius: f.size, backgroundColor: '#FFFFFF', opacity: f.opacity },
          ]}
        />
      ))}
    </View>
  );
}

// ——— Saha: perspektifle yatırılmış, biçme şeritli çim ve beyaz çizgiler ———

function Field({ width, height }: { width: number; height: number }) {
  const w = width * 1.5;
  const h = height * 0.95;
  const stripes = 12;
  const box = { width: w * 0.5, height: h * 0.14 };
  const circle = w * 0.26;
  return (
    <View style={[styles.abs, { left: (width - w) / 2, top: height * 0.24, width: w, height: h, transform: [{ perspective: 900 }, { rotateX: '62deg' }] }]}>
      {Array.from({ length: stripes }, (_, i) => (
        <View key={i} style={{ height: h / stripes, backgroundColor: GRASS[i % 2] }} />
      ))}
      {/* Projektörlerin çimde bıraktığı aydınlık */}
      <LinearGradient colors={['rgba(255,246,216,0.10)', 'rgba(255,246,216,0)']} style={FILL} />
      <View style={[styles.abs, { left: w * 0.06, right: w * 0.06, top: h * 0.04, bottom: h * 0.04, borderWidth: 2, borderColor: LINE }]} />
      <View style={[styles.abs, { left: w * 0.06, right: w * 0.06, top: h / 2 - 1, height: 2, backgroundColor: LINE }]} />
      <View
        style={[
          styles.abs,
          { left: w / 2 - circle / 2, top: h / 2 - circle / 2, width: circle, height: circle, borderRadius: circle / 2, borderWidth: 2, borderColor: LINE },
        ]}
      />
      <View style={[styles.abs, { left: w / 2 - 4, top: h / 2 - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: LINE }]} />
      {/* Ceza sahaları */}
      <View style={[styles.abs, { left: (w - box.width) / 2, top: h * 0.04, width: box.width, height: box.height, borderWidth: 2, borderTopWidth: 0, borderColor: LINE }]} />
      <View style={[styles.abs, { left: (w - box.width) / 2, bottom: h * 0.04, width: box.width, height: box.height, borderWidth: 2, borderBottomWidth: 0, borderColor: LINE }]} />
    </View>
  );
}

// ——— Projektör kulesi: lamba paneli, nefes alan parıltı ve sahaya inen hüzme ———

function Floodlight({ side, width, height, running }: { side: 'left' | 'right'; width: number; height: number; running: boolean }) {
  const pulse = useClock(side === 'left' ? 5200 : 6100, running);
  const sway = useClock(side === 'left' ? 14000 : 17000, running);
  const glow = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.7] });
  const sign = side === 'left' ? 1 : -1;
  const rotate = sway.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [`${sign * -28}deg`, `${sign * -36}deg`, `${sign * -28}deg`],
  });
  const panel = { width: 42, height: 22 };
  // Kuleler köşelerde durur: bölüm seçicinin yazılarının arkasına düşmez.
  const x = side === 'left' ? width * 0.06 : width * 0.94;
  const y = height * 0.02;
  const beamLength = height * 0.75;

  return (
    <>
      {/* Hüzme: üstte parlak, aşağı doğru sönen geniş ışık */}
      <Animated.View
        style={[
          styles.abs,
          {
            left: x - width * 0.22,
            top: y,
            width: width * 0.44,
            height: beamLength,
            opacity: glow,
            transformOrigin: 'top',
            transform: [{ rotate }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,246,216,0.16)', 'rgba(255,246,216,0.05)', 'rgba(255,246,216,0)']}
          locations={[0, 0.45, 1]}
          style={[FILL, { borderTopLeftRadius: 8, borderTopRightRadius: 8 }]}
        />
      </Animated.View>

      {/* Direk */}
      <View style={[styles.abs, { left: x - 1.5, top: y + panel.height / 2, width: 3, height: height * 0.16, backgroundColor: 'rgba(160,175,195,0.22)' }]} />

      {/* Parıltı halkaları */}
      <Animated.View style={[styles.abs, styles.center, { left: x - 90, top: y + panel.height / 2 - 90, width: 180, height: 180, opacity: glow }]}>
        {[180, 120, 72].map((d, i) => (
          <View key={d} style={[styles.circle, { width: d, height: d, borderRadius: d / 2, backgroundColor: `rgba(255,246,216,${0.05 + i * 0.06})` }]} />
        ))}
      </Animated.View>

      {/* Lamba paneli: 2 × 4 lamba */}
      <View
        style={[
          styles.abs,
          styles.panel,
          { left: x - panel.width / 2, top: y, width: panel.width, height: panel.height, transform: [{ rotate: `${sign * 8}deg` }] },
        ]}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <View key={i} style={styles.lamp} />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute' },
  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    padding: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(30,40,55,0.9)',
  },
  lamp: { width: 8, height: 7, borderRadius: 2, backgroundColor: FLOODLIGHT },
});
