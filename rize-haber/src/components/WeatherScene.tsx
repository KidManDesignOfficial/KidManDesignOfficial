/**
 * Hava durumuna göre canlanan arka plan: güneş, ay ve yıldızlar, süzülen bulutlar, yağmur,
 * camdan süzülen damlalar, şimşek, kar ve sis.
 *
 * Performans:
 * - Her katman tek bir "saat" (0→1 döngüsü) kullanır; parçacıklar bu saatten kendi hız ve evreleriyle
 *   türetilir (Animated.modulo). Animasyonlar yerel sürücüde (native driver) çalışır, JS iş parçacığını
 *   meşgul etmez.
 * - `active` yanlışsa (başka sekme açık) tüm döngüler durur; "Hareketi azalt" açıksa sahne durağandır.
 * - Parçacık sayıları weatherScene.ts'de sınırlandırılmıştır (en fazla 120).
 */
import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { seeded, skyChrome, type Scene } from '../weatherScene';
import { useAnimatedValue, useReducedMotion } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** 0→1 arası sürekli dönen saat. Çalışmıyorsa olduğu yerde durur. */
function useClock(duration: number, running: boolean): Animated.Value {
  const clock = useAnimatedValue(0);
  useEffect(() => {
    if (!running) return;
    clock.setValue(0);
    const loop = Animated.loop(
      Animated.timing(clock, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [clock, duration, running]);
  return clock;
}

/** Saati `speed` kat hızla ve `phase` kaymasıyla döndürür: her parçacık kendi döngüsünde ilerler. */
function cycle(clock: Animated.Value, speed: number, phase: number) {
  return Animated.modulo(Animated.add(Animated.multiply(clock, speed), phase), 1);
}

export default function WeatherScene({ scene, active }: { scene: Scene; active: boolean }) {
  const reduced = useReducedMotion();
  const running = active && !reduced;
  const { width, height } = useWindowDimensions();
  const fade = useAnimatedValue(0);
  const sceneKey = `${scene.kind}-${scene.isDay}-${scene.particles}-${scene.clouds}`;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade, sceneKey]);

  const night = !scene.isDay;
  const footer = skyChrome(scene).footer;
  return (
    <View
      style={[FILL, styles.clip]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient colors={scene.sky} style={FILL} />
      <Animated.View style={[FILL, { opacity: fade }]}>
        {scene.showSun && night ? <Stars width={width} height={height} running={running} /> : null}
        {scene.showSun ? night ? <Moon width={width} /> : <Sun width={width} running={running} /> : null}
        {scene.clouds > 0 ? (
          <Clouds count={scene.clouds} shade={scene.cloudShade} night={night} width={width} height={height} running={running} />
        ) : null}
        {scene.kind === 'fog' ? <Fog width={width} height={height} running={running} /> : null}
        {scene.kind === 'rain' || scene.kind === 'storm' ? (
          <>
            <Rain count={scene.particles} width={width} height={height} running={running} />
            <GlassDrops count={scene.particles > 80 ? 14 : 9} width={width} running={running} />
          </>
        ) : null}
        {scene.kind === 'snow' ? <Snow count={scene.particles} width={width} height={height} running={running} /> : null}
        {scene.kind === 'storm' ? <Lightning running={running} /> : null}
      </Animated.View>
      {/* Alt kısımda hafif koyulaşma: kartlardaki beyaz yazılar her gökyüzünde okunur kalır. */}
      <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.28)']} start={{ x: 0, y: 0.35 }} end={{ x: 0, y: 1 }} style={FILL} />
      {/* En altta sekme çubuğunun rengine erir: ekran ile alt çubuk arasında çizgi ya da şerit kalmaz. */}
      <LinearGradient
        colors={[`${footer}00`, footer]}
        start={{ x: 0, y: 0.82 }}
        end={{ x: 0, y: 1 }}
        style={FILL}
      />
    </View>
  );
}

// ——— Güneş: dönen ışınlar ve nefes alan parıltı ———

function Sun({ width, running }: { width: number; running: boolean }) {
  const spin = useClock(60000, running);
  const pulse = useClock(5000, running);
  const size = 76;
  const box = 240;
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glow = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.14, 1] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 0.9, 0.55] });
  return (
    <View style={[styles.abs, { width: box, height: box, left: width - box / 2 - 70, top: -40 }]}>
      <Animated.View style={[styles.center, FILL, { opacity: glowOpacity, transform: [{ scale: glow }] }]}>
        {[230, 190, 150, 116].map((d, i) => (
          <View key={d} style={[styles.circle, { width: d, height: d, borderRadius: d / 2, backgroundColor: `rgba(255,222,130,${0.06 + i * 0.05})` }]} />
        ))}
      </Animated.View>
      <Animated.View style={[FILL, { transform: [{ rotate }] }]}>
        {Array.from({ length: 12 }, (_, i) => (
          <View key={i} style={[styles.center, FILL, { transform: [{ rotate: `${i * 30}deg` }] }]}>
            <View
              style={{
                width: 4,
                height: i % 2 ? 18 : 28,
                borderRadius: 2,
                backgroundColor: 'rgba(255,230,150,0.75)',
                transform: [{ translateY: -(size / 2 + 22) }],
              }}
            />
          </View>
        ))}
      </Animated.View>
      <View style={[styles.center, FILL]}>
        <LinearGradient
          colors={['#FFF3B8', '#FFC94A']}
          start={{ x: 0.3, y: 0.2 }}
          end={{ x: 0.8, y: 1 }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      </View>
    </View>
  );
}

// ——— Gece: ay ve göz kırpan yıldızlar ———

function Moon({ width }: { width: number }) {
  const size = 58;
  return (
    <View style={[styles.abs, styles.center, { width: 160, height: 160, left: width - 160 - 20, top: 0 }]}>
      <View style={[styles.circle, { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(220,228,255,0.07)' }]} />
      <View style={[styles.circle, { width: 104, height: 104, borderRadius: 52, backgroundColor: 'rgba(220,228,255,0.10)' }]} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F3F0E2', overflow: 'hidden' }}>
        <View style={[styles.crater, { width: 14, height: 14, left: 12, top: 14 }]} />
        <View style={[styles.crater, { width: 9, height: 9, left: 34, top: 30 }]} />
        <View style={[styles.crater, { width: 6, height: 6, left: 22, top: 40 }]} />
      </View>
    </View>
  );
}

function Stars({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useClock(6000, running);
  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const t = cycle(clock, 1 + Math.floor(seeded(i, 3) * 2), seeded(i, 4));
        return {
          left: seeded(i, 1) * width,
          top: seeded(i, 2) * height * 0.55,
          size: 1.5 + seeded(i, 5) * 2,
          opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 1, 0.25] }),
        };
      }),
    [clock, width, height],
  );
  return (
    <>
      {stars.map((s, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            { left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: '#FFFFFF', opacity: s.opacity },
          ]}
        />
      ))}
    </>
  );
}

// ——— Bulutlar: farklı hız ve boyutta katmanlar (derinlik hissi) ———

function cloudLook(shade: number, night: boolean, depth: number) {
  // Beyazdan koyu griye; gece bulutları daha koyu, arka katmanlar daha saydam.
  const light = night ? [120, 132, 150] : [255, 255, 255];
  const dark = night ? [38, 44, 54] : [72, 80, 92];
  const c = light.map((l, i) => Math.round(l + (dark[i] - l) * shade));
  return { color: `rgb(${c[0]},${c[1]},${c[2]})`, opacity: (night ? 0.8 : 0.86) - depth * 0.3 };
}

function Clouds({
  count,
  shade,
  night,
  width,
  height,
  running,
}: {
  count: number;
  shade: number;
  night: boolean;
  width: number;
  height: number;
  running: boolean;
}) {
  const clock = useClock(140000, running);
  const clouds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const depth = i % 2 === 0 ? 1 : 0; // 1 = arkada (küçük, yavaş, soluk)
        const w = (depth ? 150 : 210) + seeded(i, 1) * 90;
        const t = cycle(clock, depth ? 1 : 2, seeded(i, 2));
        return {
          w,
          depth,
          top: height * (0.02 + seeded(i, 3) * (count > 3 ? 0.3 : 0.22)),
          ...cloudLook(shade, night, depth),
          translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-w - 20, width + 20] }),
        };
      }).sort((a, b) => b.depth - a.depth), // arka katman önce çizilir
    [clock, count, shade, night, width, height],
  );
  return (
    <>
      {clouds.map((c, i) => (
        <Animated.View
          key={i}
          // Bulut tek parça olarak saydamlaşır (üst üste binen daireler ayrı ayrı görünmez);
          // doku olarak önbelleğe alınır, kayarken yeniden çizilmez.
          needsOffscreenAlphaCompositing
          renderToHardwareTextureAndroid
          style={[styles.abs, { top: c.top, left: 0, opacity: c.opacity, transform: [{ translateX: c.translateX }] }]}
        >
          <Cloud width={c.w} color={c.color} />
        </Animated.View>
      ))}
    </>
  );
}

function Cloud({ width, color }: { width: number; color: string }) {
  const h = width * 0.42;
  const bump = (size: number, left: number, bottom: number) => (
    <View style={[styles.abs, { width: size, height: size, borderRadius: size / 2, left, bottom, backgroundColor: color }]} />
  );
  return (
    <View style={{ width, height: h }}>
      {bump(width * 0.42, width * 0.12, h * 0.18)}
      {bump(width * 0.5, width * 0.34, h * 0.28)}
      {bump(width * 0.34, width * 0.6, h * 0.12)}
      <View style={[styles.abs, { left: 0, right: 0, bottom: 0, height: h * 0.42, borderRadius: h * 0.21, backgroundColor: color }]} />
    </View>
  );
}

// ——— Yağmur: rüzgârla hafif eğik düşen damlalar ———

function Rain({ count, width, height, running }: { count: number; width: number; height: number; running: boolean }) {
  const clock = useClock(3000, running);
  const drift = height * 0.12; // düşerken sağa kayma (rüzgâr)
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = cycle(clock, 3 + Math.floor(seeded(i, 3) * 3), seeded(i, 4));
        return {
          left: seeded(i, 1) * (width + drift) - drift,
          length: 12 + seeded(i, 2) * 14,
          opacity: 0.22 + seeded(i, 5) * 0.38,
          translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }),
          translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }),
        };
      }),
    [clock, count, width, height, drift],
  );
  return (
    <>
      {drops.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            {
              left: d.left,
              top: 0,
              width: 1.6,
              height: d.length,
              borderRadius: 1,
              backgroundColor: '#DDEBFA',
              opacity: d.opacity,
              transform: [{ translateX: d.translateX }, { translateY: d.translateY }, { rotate: '-7deg' }],
            },
          ]}
        />
      ))}
    </>
  );
}

/** Ekranın üst kısmında, camdan aşağı süzülüp kaybolan iri damlalar. */
function GlassDrops({ count, width, running }: { count: number; width: number; running: boolean }) {
  const clock = useClock(16000, running);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = cycle(clock, 1 + Math.floor(seeded(i, 3) * 2), seeded(i, 4));
        const size = 7 + seeded(i, 2) * 9;
        return {
          left: 12 + seeded(i, 1) * (width - 30),
          top: 30 + seeded(i, 5) * 260,
          size,
          translateY: t.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 6, 40 + seeded(i, 6) * 90] }),
          opacity: t.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 0.9, 0.8, 0] }),
        };
      }),
    [clock, count, width],
  );
  return (
    <>
      {drops.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            styles.glassDrop,
            {
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size * 1.18,
              borderRadius: d.size / 2,
              opacity: d.opacity,
              transform: [{ translateY: d.translateY }],
            },
          ]}
        >
          <View style={[styles.glassShine, { width: d.size * 0.32, height: d.size * 0.32, borderRadius: d.size }]} />
        </Animated.View>
      ))}
    </>
  );
}

// ——— Fırtına: ara sıra çakan şimşek ———

function Lightning({ running }: { running: boolean }) {
  const flash = useAnimatedValue(0);
  useEffect(() => {
    if (!running) return;
    const to = (toValue: number, duration: number) =>
      Animated.timing(flash, { toValue, duration, easing: Easing.out(Easing.quad), useNativeDriver: true });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3800),
        to(0.55, 60),
        to(0, 110),
        Animated.delay(90),
        to(0.4, 50),
        to(0, 380),
        Animated.delay(6200),
        to(0.35, 70),
        to(0, 420),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      flash.setValue(0);
    };
  }, [flash, running]);
  return <Animated.View style={[FILL, { backgroundColor: '#EEF3FF', opacity: flash }]} />;
}

// ——— Kar: sallanarak süzülen taneler ———

function Snow({ count, width, height, running }: { count: number; width: number; height: number; running: boolean }) {
  const clock = useClock(16000, running);
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const speed = 1 + Math.floor(seeded(i, 3) * 3);
        const fall = cycle(clock, speed, seeded(i, 4));
        const sway = cycle(clock, speed * 4, seeded(i, 6));
        const amp = 8 + seeded(i, 7) * 14;
        const size = 3 + seeded(i, 2) * 4.5;
        return {
          left: seeded(i, 1) * width,
          size,
          opacity: 0.55 + seeded(i, 5) * 0.4,
          translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] }),
          translateX: sway.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, amp, 0, -amp, 0] }),
        };
      }),
    [clock, count, width, height],
  );
  return (
    <>
      {flakes.map((f, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            {
              left: f.left,
              top: 0,
              width: f.size,
              height: f.size,
              borderRadius: f.size / 2,
              backgroundColor: '#FFFFFF',
              opacity: f.opacity,
              transform: [{ translateX: f.translateX }, { translateY: f.translateY }],
            },
          ]}
        />
      ))}
    </>
  );
}

// ——— Sis: yavaşça kayan katmanlar ———

function Fog({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useClock(36000, running);
  const bands = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const t = cycle(clock, 1, i / 5);
        const shift = width * (0.18 + seeded(i, 1) * 0.15);
        return {
          top: height * (0.08 + i * 0.17),
          h: 70 + seeded(i, 2) * 70,
          opacity: 0.12 + seeded(i, 3) * 0.12,
          translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-shift, 0, -shift] }),
        };
      }),
    [clock, width, height],
  );
  return (
    <>
      {bands.map((b, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            {
              top: b.top,
              left: -width * 0.3,
              width: width * 1.6,
              height: b.h,
              borderRadius: b.h / 2,
              backgroundColor: '#FFFFFF',
              opacity: b.opacity,
              transform: [{ translateX: b.translateX }],
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute' },
  crater: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(120,110,90,0.16)' },
  glassDrop: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  glassShine: { position: 'absolute', top: 2, left: 2, backgroundColor: 'rgba(255,255,255,0.8)' },
});
