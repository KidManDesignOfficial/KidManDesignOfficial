/**
 * Haberler ekranının arka planı: Rize manzarası.
 * Arkada karlı Kaçkar sırtları, önünde ışıldayan Karadeniz, ön planda teraslı çay tepeleri.
 * Sırtların üstünde sis süzülür; gündüz ve akşam martılar geçer, gece yıldızlar göz kırpar.
 * Renkler günün saatine göre değişir (bkz. rizeScene.ts).
 *
 * Performans: döngüler yalnızca opaklık / kaydırma animasyonudur ve yerel sürücüde çalışır.
 * `active` yanlışsa ya da "Hareketi azalt" açıksa sahne durağandır.
 */
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { rizeSkyFor, type RizeSky } from '../rizeScene';
import { seeded } from '../weatherScene';
import { useAnimatedValue, useSceneStill, useSceneFilter } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Günün saatine göre palet; 5 dakikada bir yeniden bakılır (akşam olunca sahne de kararır). */
export function useRizeSky(): RizeSky {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const t = setInterval(() => setHour(new Date().getHours()), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => rizeSkyFor(hour), [hour]);
}

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

/** Sırt çizgisi: 45° döndürülmüş kareler. `x` tepe noktasının yatay konumu, `peakY` yüksekliği. */
type Peak = { x: number; peakY: number; size: number; snow?: boolean };

export default function RizeScene({ sky, active }: { sky: RizeSky; active: boolean }) {
  const tone = useSceneFilter();
  const reduced = useSceneStill();
  const running = active && !reduced;
  const { width, height } = useWindowDimensions();
  const horizon = height * 0.4;
  const seaTop = height * 0.47;
  const seaBottom = height * 0.55;
  const footer = sky.chrome.footer;

  const far: Peak[] = useMemo(
    () => [
      { x: width * 0.05, peakY: horizon - height * 0.1, size: width * 0.42 },
      { x: width * 0.3, peakY: horizon - height * 0.17, size: width * 0.55, snow: true },
      { x: width * 0.58, peakY: horizon - height * 0.12, size: width * 0.45, snow: true },
      { x: width * 0.85, peakY: horizon - height * 0.15, size: width * 0.5, snow: true },
      { x: width * 1.08, peakY: horizon - height * 0.08, size: width * 0.4 },
    ],
    [width, height, horizon],
  );
  const near: Peak[] = useMemo(
    () => [
      { x: -width * 0.05, peakY: seaTop - height * 0.07, size: width * 0.45 },
      { x: width * 0.22, peakY: seaTop - height * 0.045, size: width * 0.38 },
      { x: width * 0.48, peakY: seaTop - height * 0.08, size: width * 0.5 },
      { x: width * 0.78, peakY: seaTop - height * 0.05, size: width * 0.4 },
      { x: width * 1.02, peakY: seaTop - height * 0.075, size: width * 0.45 },
    ],
    [width, height, seaTop],
  );

  return (
    <View style={[FILL, styles.clip, tone]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={sky.sky} locations={[0, 0.55, 1]} end={{ x: 0, y: 0.5 }} style={FILL} />
      {sky.phase === 'night' ? <Stars width={width} height={horizon} running={running} /> : null}
      <Glow sky={sky} width={width} horizon={horizon} />

      {/* Sırtlar kıyı çizgisinde kesilir: döndürülmüş karelerin alt yarıları görünmez. */}
      <View style={[styles.abs, styles.clip, { left: 0, right: 0, top: 0, height: seaTop }]}>
        <Ridge peaks={far} color={sky.farMountains} bottom={seaTop} snow />
        <Mist width={width} top={horizon - height * 0.08} running={running} night={sky.phase === 'night'} />
        <Ridge peaks={near} color={sky.nearMountains} bottom={seaTop} />
      </View>

      <Sea sky={sky} width={width} top={seaTop} bottom={seaBottom} running={running} />
      <TeaHills sky={sky} width={width} height={height} top={seaBottom} />
      {sky.phase !== 'night' ? <Gulls width={width} height={height} running={running} /> : null}

      {/* Kartlardaki yazılar okunaklı kalsın: orta kısımda hafif karartma, en altta sekme çubuğuna erime. */}
      <LinearGradient colors={['rgba(3,10,18,0)', 'rgba(3,10,18,0.32)', 'rgba(3,10,18,0.1)']} locations={[0.2, 0.55, 0.85]} style={FILL} />
      <LinearGradient colors={[`${footer}00`, footer]} start={{ x: 0, y: 0.82 }} end={{ x: 0, y: 1 }} style={FILL} />
    </View>
  );
}

// ——— Güneş / ay parıltısı ———

function Glow({ sky, width, horizon }: { sky: RizeSky; width: number; horizon: number }) {
  const evening = sky.phase === 'evening';
  const night = sky.phase === 'night';
  // Akşam güneşi ufka yakın ve turuncu; gündüz sağ üstte; gece ay.
  const color = evening ? '255,170,110' : night ? '220,228,255' : '255,236,180';
  const cx = evening ? width * 0.32 : width * 0.8;
  // Gündüz/gece arama kutusunun sağ üstünde durur; kategori düğmelerinin arkasına düşmez.
  const cy = evening ? horizon - 30 : 26;
  return (
    <View style={[styles.abs, styles.center, { left: cx - 130, top: cy - 130, width: 260, height: 260 }]}>
      {[260, 180, 110].map((d, i) => (
        <View key={d} style={[styles.abs, { width: d, height: d, borderRadius: d / 2, backgroundColor: `rgba(${color},${0.05 + i * 0.05})` }]} />
      ))}
      <View
        style={{
          width: night ? 34 : 46,
          height: night ? 34 : 46,
          borderRadius: 23,
          backgroundColor: night ? '#EEF0E6' : evening ? '#FFC58A' : '#FFF1C4',
          opacity: night ? 0.95 : 0.9,
        }}
      />
    </View>
  );
}

function Stars({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useClock(6000, running);
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const t = cycle(clock, 1 + Math.floor(seeded(i, 31) * 2), seeded(i, 32));
        return {
          left: seeded(i, 33) * width,
          top: seeded(i, 34) * height * 0.8,
          size: 1.2 + seeded(i, 35) * 1.8,
          opacity: running ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.95, 0.25] }) : 0.6,
        };
      }),
    [clock, width, height, running],
  );
  return (
    <>
      {stars.map((s, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, { left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: '#FFFFFF', opacity: s.opacity }]}
        />
      ))}
    </>
  );
}

// ——— Dağ sırtları ———

function Ridge({ peaks, color, bottom, snow = false }: { peaks: Peak[]; color: string; bottom: number; snow?: boolean }) {
  const half = Math.SQRT1_2;
  return (
    <>
      {peaks.map((p, i) => {
        // Döndürülmüş karenin üst köşesi tepe noktası olur: merkez = tepe + köşegenin yarısı.
        const cy = p.peakY + p.size * half;
        const cap = p.size * 0.26;
        return (
          <View key={i}>
            <View
              style={[
                styles.abs,
                styles.peak,
                { left: p.x - p.size / 2, top: cy - p.size / 2, width: p.size, height: p.size, backgroundColor: color },
              ]}
            />
            {snow && p.snow ? (
              // Kar örtüsü: zirvedeki küçük karenin yalnızca üst üçgeni görünür (alt yarısı kırpılır).
              <View style={[styles.abs, styles.clip, { left: p.x - cap, top: p.peakY, width: cap * 2, height: cap * half }]}>
                <View
                  style={[
                    styles.abs,
                    styles.peak,
                    { left: cap / 2, top: cap * half - cap / 2, width: cap, height: cap, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)' },
                  ]}
                />
              </View>
            ) : null}
          </View>
        );
      })}
      {/* Sırtların altı denize kadar dolu kalsın. */}
      <View style={[styles.abs, { left: 0, right: 0, top: bottom - 2, height: 4, backgroundColor: color }]} />
    </>
  );
}

// ——— Sırtlarda süzülen sis ———

function Mist({ width, top, running, night }: { width: number; top: number; running: boolean; night: boolean }) {
  const clock = useClock(60000, running);
  const bands = [
    { y: 0, h: 38, speed: 1, phase: 0, alpha: night ? 0.06 : 0.12 },
    { y: 46, h: 30, speed: 2, phase: 0.5, alpha: night ? 0.05 : 0.1 },
  ];
  return (
    <>
      {bands.map((b, i) => {
        const x = cycle(clock, b.speed, b.phase).interpolate({ inputRange: [0, 1], outputRange: [-width * 1.2, width] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.abs,
              {
                top: top + b.y,
                left: 0,
                width: width * 1.2,
                height: b.h,
                borderRadius: b.h,
                backgroundColor: `rgba(255,255,255,${b.alpha})`,
                transform: [{ translateX: running ? x : -width * 0.1 }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

// ——— Karadeniz: ışıldayan dalga çizgileri ———

function Sea({ sky, width, top, bottom, running }: { sky: RizeSky; width: number; top: number; bottom: number; running: boolean }) {
  const clock = useClock(4200, running);
  const h = bottom - top;
  const glints = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const t = cycle(clock, 1, seeded(i, 41));
        return {
          left: seeded(i, 42) * width * 0.92,
          top: 4 + seeded(i, 43) * (h - 10),
          width: 10 + seeded(i, 44) * 26,
          opacity: running ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.08, 0.6, 0.08] }) : 0.3,
        };
      }),
    [clock, width, h, running],
  );
  return (
    <View style={[styles.abs, { left: 0, right: 0, top, height: h }]}>
      <LinearGradient colors={sky.sea} style={FILL} />
      {glints.map((g, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, { left: g.left, top: g.top, width: g.width, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF', opacity: g.opacity }]}
        />
      ))}
    </View>
  );
}

// ——— Ön planda teraslı çay tepeleri ———

function TeaHills({ sky, width, height, top }: { sky: RizeSky; width: number; height: number; top: number }) {
  // Tepelerin arasında boşluk kalmasın diye zemin koyu tepe rengiyle doldurulur.
  const base = <View style={[styles.abs, { left: 0, right: 0, top: top + height * 0.05, bottom: 0, backgroundColor: sky.hills[1] }]} />;
  const hills = [
    { left: -width * 0.45, top: top + height * 0.02, w: width * 1.3, color: sky.hills[0] },
    { left: width * 0.25, top: top + height * 0.06, w: width * 1.2, color: sky.hills[1] },
  ];
  return (
    <>
      {base}
      {hills.map((hill, i) => (
        <View
          key={i}
          style={[
            styles.abs,
            {
              left: hill.left,
              top: hill.top,
              width: hill.w,
              height: height,
              borderTopLeftRadius: hill.w / 2,
              borderTopRightRadius: hill.w / 2,
              backgroundColor: hill.color,
              overflow: 'hidden',
            },
          ]}
        >
          {/* Tepenin kıvrımını izleyen çay sıraları (iç içe yaylar). */}
          {Array.from({ length: 7 }, (_, r) => {
            const inset = 14 + r * 22;
            const w = hill.w - inset * 2;
            return (
              <View
                key={r}
                style={[
                  styles.abs,
                  {
                    left: inset,
                    top: inset,
                    width: w,
                    height: w,
                    borderRadius: w / 2,
                    borderTopWidth: 5,
                    borderColor: sky.rows,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </>
  );
}

// ——— Martılar ———

function Gulls({ width, height, running }: { width: number; height: number; running: boolean }) {
  const clock = useClock(38000, running);
  const flap = useClock(900, running);
  const birds = [
    { y: height * 0.2, speed: 1, phase: 0.1, scale: 1 },
    { y: height * 0.25, speed: 1, phase: 0.16, scale: 0.75 },
  ];
  const wing = flap.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['18deg', '6deg', '18deg'] });
  const wingBack = flap.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-18deg', '-6deg', '-18deg'] });
  return (
    <>
      {birds.map((b, i) => {
        const x = cycle(clock, b.speed, b.phase).interpolate({ inputRange: [0, 1], outputRange: [-40, width + 40] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.abs,
              styles.gull,
              { top: b.y, transform: [{ translateX: running ? x : width * (0.3 + i * 0.12) }, { scale: b.scale }] },
            ]}
          >
            <Animated.View style={[styles.wing, { transformOrigin: 'right', transform: [{ rotate: wing }] }]} />
            <Animated.View style={[styles.wing, { transformOrigin: 'left', transform: [{ rotate: wingBack }] }]} />
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  peak: { transform: [{ rotate: '45deg' }], borderRadius: 6 },
  gull: { left: 0, flexDirection: 'row', width: 22, height: 8 },
  wing: { width: 11, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
});
