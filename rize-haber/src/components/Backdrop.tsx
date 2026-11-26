/**
 * Seçilebilir sekme arka planlarını çizer (tanımlar: src/backdrops.ts).
 *
 * Sahne, sıradan katmanlardan (`effects`) oluşur: ışık, yıldız, dağ silueti, sis, yağmur, şimşek,
 * deniz, çay tepeleri, ışık lekeleri, konfeti, zerre, yaprak, buğu, şerit, ağ ve şehir silueti.
 * En üste her zaman okunurluk karartması ve alt sekme çubuğuna erime eklenir.
 *
 * Performans: her katman tek bir döngü saati kullanır; tüm animasyonlar yerel sürücüde opaklık /
 * kaydırma / dönüş / ölçektir. `active` yanlışsa ya da hareket kapalıysa sahne durağan çizilir.
 * `width`/`height` verilirse (Ayarlar önizlemesi) pencere boyutu yerine onlar kullanılır.
 */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { backdropFor, type Backdrop, type BackdropScene, type BackdropTab, type Effect } from '../backdrops';
import { useTheme } from '../theme';
import { seeded } from '../weatherScene';
import { Icon } from './Icon';
import { loopPhase, useLoopClock, useSceneFilter, useSceneStill } from './motion';

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Sekmenin seçili arka planı. `scene` yoksa sekme kendi özgün sahnesini çizer. */
export function useBackdrop(tab: BackdropTab): Backdrop {
  const { settings } = useTheme();
  return backdropFor(tab, settings.backdrops);
}

type Box = { width: number; height: number; running: boolean };

export default function BackdropView({
  scene,
  active,
  children,
}: {
  scene: BackdropScene;
  active: boolean;
  /** Sahnenin üstüne, karartmanın altına çizilecek ek katman (ör. gol havai fişekleri). */
  children?: ReactNode;
}) {
  const still = useSceneStill();
  const tone = useSceneFilter();
  const { width, height } = useWindowDimensions();
  const box: Box = { width, height, running: active && !still };
  const footer = scene.chrome.footer;
  return (
    <View style={[FILL, styles.clip, tone]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={scene.sky as [string, string, ...string[]]} locations={scene.stops as [number, number, ...number[]]} style={FILL} />
      {scene.effects.map((e, i) => (
        <Layer key={`${e.type}-${i}`} effect={e} box={box} salt={i * 17} />
      ))}
      {children}
      {scene.veil > 0 ? (
        <LinearGradient
          colors={['rgba(0,0,0,0)', `rgba(0,0,0,${scene.veil})`, 'rgba(0,0,0,0.08)']}
          locations={[0.15, 0.5, 0.85]}
          style={FILL}
        />
      ) : null}
      <LinearGradient colors={[`${footer}00`, footer]} start={{ x: 0, y: 0.82 }} end={{ x: 0, y: 1 }} style={FILL} />
    </View>
  );
}

/** Tek katman. Hava sekmesi de dağ ve deniz katmanlarını buradan kullanır. */
export function Layer({ effect: e, box, salt = 0 }: { effect: Effect; box: Box; salt?: number }) {
  switch (e.type) {
    case 'glow':
      return <Glow e={e} box={box} />;
    case 'stars':
      return <Stars e={e} box={box} salt={salt} />;
    case 'band':
      return <Band e={e} box={box} />;
    case 'ridge':
      return <Ridge e={e} box={box} />;
    case 'fog':
      return <Fog e={e} box={box} salt={salt} />;
    case 'rain':
      return <Rain e={e} box={box} salt={salt} />;
    case 'lightning':
      return <Lightning box={box} />;
    case 'sea':
      return <Sea e={e} box={box} salt={salt} />;
    case 'hills':
      return <Hills e={e} box={box} />;
    case 'bokeh':
      return <Bokeh e={e} box={box} salt={salt} />;
    case 'confetti':
      return <Confetti e={e} box={box} salt={salt} />;
    case 'motes':
      return <Motes e={e} box={box} salt={salt} />;
    case 'leaves':
      return <Leaves e={e} box={box} salt={salt} />;
    case 'steam':
      return <Steam e={e} box={box} salt={salt} />;
    case 'stripes':
      return <Stripes e={e} box={box} />;
    case 'grid':
      return <Grid e={e} box={box} salt={salt} />;
    case 'skyline':
      return <Skyline e={e} box={box} salt={salt} />;
  }
}

type Of<T extends Effect['type']> = Extract<Effect, { type: T }>;

// ——— Güneş / ay / ışık kaynağı ———

function Glow({ e, box }: { e: Of<'glow'>; box: Box }) {
  const breath = useLoopClock(7000, box.running && !!e.core);
  const cx = e.x * box.width;
  const cy = e.y * box.height;
  const s = e.size;
  const scale = box.running && e.core ? breath.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] }) : 1;
  return (
    <Animated.View style={[styles.abs, styles.center, { left: cx - s / 2, top: cy - s / 2, width: s, height: s, transform: [{ scale }] }]}>
      {[1, 0.66, 0.4].map((k, i) => (
        <View key={k} style={[styles.abs, { width: s * k, height: s * k, borderRadius: (s * k) / 2, backgroundColor: `rgba(${e.rgb},${0.05 + i * 0.05})` }]} />
      ))}
      {e.core ? <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: e.core, opacity: 0.92 }} /> : null}
    </Animated.View>
  );
}

// ——— Yıldızlar ———

function Stars({ e, box, salt }: { e: Of<'stars'>; box: Box; salt: number }) {
  const clock = useLoopClock(6000, box.running);
  const stars = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, salt + 1) * 2), seeded(i, salt + 2));
        return {
          left: seeded(i, salt + 3) * box.width,
          top: seeded(i, salt + 4) * box.height * e.bottom,
          size: 1 + seeded(i, salt + 5) * 1.8,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.95, 0.2] }) : 0.2 + seeded(i, salt + 6) * 0.6,
        };
      }),
    [clock, e.count, e.bottom, box.width, box.height, box.running, salt],
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

// ——— Işık kuşağı (Samanyolu) ———

function Band({ e, box }: { e: Of<'band'>; box: Box }) {
  const clock = useLoopClock(24000, box.running);
  const sway = box.running ? clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-box.width * 0.05, box.width * 0.05, -box.width * 0.05] }) : 0;
  const opacity = box.running ? clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] }) : 0.9;
  const h = e.height * box.height;
  return (
    <Animated.View
      style={[
        styles.abs,
        {
          left: -box.width * 0.4,
          top: e.y * box.height - h / 2,
          width: box.width * 1.8,
          height: h,
          opacity,
          transform: [{ translateX: sway }, { rotate: `${e.angle}deg` }],
        },
      ]}
    >
      <LinearGradient colors={e.colors as [string, string, ...string[]]} style={FILL} />
    </Animated.View>
  );
}

// ——— Dağ silueti: 45° döndürülmüş kareler ———

function Ridge({ e, box }: { e: Of<'ridge'>; box: Box }) {
  const half = Math.SQRT1_2;
  const base = e.base * box.height;
  return (
    <>
      <View style={[styles.abs, styles.clip, { left: 0, right: 0, top: 0, height: base }]}>
        {e.peaks.map(([x, rise, w], i) => {
          const size = w * box.width;
          const peakY = base - rise * box.height;
          const cy = peakY + size * half;
          const cap = size * 0.24;
          return (
            <View key={i}>
              <View style={[styles.abs, styles.peak, { left: x * box.width - size / 2, top: cy - size / 2, width: size, height: size, backgroundColor: e.color }]} />
              {e.snow ? (
                <View style={[styles.abs, styles.clip, { left: x * box.width - cap, top: peakY, width: cap * 2, height: cap * half }]}>
                  <View
                    style={[
                      styles.abs,
                      styles.peak,
                      { left: cap / 2, top: cap * half - cap / 2, width: cap, height: cap, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.55)' },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      {e.fill ? <View style={[styles.abs, { left: 0, right: 0, top: base - 1, bottom: 0, backgroundColor: e.color }]} /> : null}
    </>
  );
}

// ——— Sis ———

function Fog({ e, box, salt }: { e: Of<'fog'>; box: Box; salt: number }) {
  const clock = useLoopClock(70000, box.running);
  const w = box.width * 1.3;
  return (
    <>
      {Array.from({ length: e.count }, (_, i) => {
        const phase = seeded(i, salt + 11);
        const x = loopPhase(clock, 1 + (i % 2), phase).interpolate({ inputRange: [0, 1], outputRange: [-w, box.width] });
        const h = 26 + seeded(i, salt + 12) * 20;
        return (
          <Animated.View
            key={i}
            style={[
              styles.abs,
              {
                top: e.y * box.height + i * 34,
                left: 0,
                width: w,
                height: h,
                borderRadius: h,
                backgroundColor: `rgba(255,255,255,${e.alpha})`,
                transform: [{ translateX: box.running ? x : (phase - 0.6) * box.width }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

// ——— Yağmur ———

function Rain({ e, box, salt }: { e: Of<'rain'>; box: Box; salt: number }) {
  const clock = useLoopClock(1100, box.running);
  const drops = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1, seeded(i, salt + 21));
        const len = 12 + seeded(i, salt + 22) * 14;
        const x = seeded(i, salt + 23) * (box.width + 80) - 40;
        return {
          left: x,
          len,
          opacity: 0.18 + seeded(i, salt + 24) * 0.22,
          ty: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [-40, box.height] }) : seeded(i, salt + 25) * box.height,
          tx: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -box.height * 0.2] }) : 0,
        };
      }),
    [clock, e.count, box.width, box.height, box.running, salt],
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
              width: 1.4,
              height: d.len,
              borderRadius: 1,
              backgroundColor: '#C8DCEB',
              opacity: d.opacity,
              transform: [{ translateY: d.ty }, { translateX: d.tx }, { rotate: '11deg' }],
            },
          ]}
        />
      ))}
    </>
  );
}

// ——— Şimşek ———

function Lightning({ box }: { box: Box }) {
  const clock = useLoopClock(9000, box.running);
  if (!box.running) return null;
  const opacity = clock.interpolate({
    inputRange: [0, 0.62, 0.63, 0.645, 0.66, 0.7, 1],
    outputRange: [0, 0, 0.32, 0.04, 0.22, 0, 0],
  });
  return <Animated.View style={[FILL, { backgroundColor: '#DDE8FF', opacity }]} />;
}

// ——— Deniz ———

function Sea({ e, box, salt }: { e: Of<'sea'>; box: Box; salt: number }) {
  const clock = useLoopClock(4200, box.running);
  const top = e.top * box.height;
  const h = (e.bottom - e.top) * box.height;
  const glints = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const t = loopPhase(clock, 1, seeded(i, salt + 31));
        // Ufka yakın parıltılar daha sık ve kısa.
        const depth = seeded(i, salt + 32) ** 1.8;
        return {
          left: seeded(i, salt + 33) * box.width * 0.92,
          top: 3 + depth * Math.min(h - 8, box.height * 0.22),
          width: 8 + depth * 26,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.06, 0.5, 0.06] }) : 0.25,
        };
      }),
    [clock, box.width, box.height, box.running, h, salt],
  );
  return (
    <View style={[styles.abs, { left: 0, right: 0, top, height: h }]}>
      <LinearGradient colors={e.colors} style={FILL} />
      {glints.map((g, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, { left: g.left, top: g.top, width: g.width, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF', opacity: g.opacity }]}
        />
      ))}
    </View>
  );
}

// ——— Çay tepeleri ———

function Hills({ e, box }: { e: Of<'hills'>; box: Box }) {
  const { width, height } = box;
  const top = e.top * height;
  const hills = [
    { left: -width * 0.45, top: top + height * 0.02, w: width * 1.3, color: e.colors[0] },
    { left: width * 0.25, top: top + height * 0.07, w: width * 1.2, color: e.colors[1] },
  ];
  return (
    <>
      <View style={[styles.abs, { left: 0, right: 0, top: top + height * 0.08, bottom: 0, backgroundColor: e.colors[1] }]} />
      {hills.map((hill, i) => (
        <View
          key={i}
          style={[
            styles.abs,
            {
              left: hill.left,
              top: hill.top,
              width: hill.w,
              height,
              borderTopLeftRadius: hill.w / 2,
              borderTopRightRadius: hill.w / 2,
              backgroundColor: hill.color,
              overflow: 'hidden',
            },
          ]}
        >
          {Array.from({ length: 7 }, (_, r) => {
            const inset = 14 + r * 22;
            const w = hill.w - inset * 2;
            return (
              <View
                key={r}
                style={[styles.abs, { left: inset, top: inset, width: w, height: w, borderRadius: w / 2, borderTopWidth: 5, borderColor: e.rows }]}
              />
            );
          })}
        </View>
      ))}
    </>
  );
}

// ——— Işık lekeleri ———

function Bokeh({ e, box, salt }: { e: Of<'bokeh'>; box: Box; salt: number }) {
  const twinkle = e.mode === 'twinkle';
  const clock = useLoopClock(twinkle ? 3200 : 26000, box.running);
  const dots = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, salt + 41) * (twinkle ? 3 : 2)), seeded(i, salt + 42));
        const size = e.size[0] + seeded(i, salt + 43) * (e.size[1] - e.size[0]);
        const top = (e.top + seeded(i, salt + 44) * (e.bottom - e.top)) * box.height;
        return {
          left: seeded(i, salt + 45) * box.width - size / 2,
          top: top - size / 2,
          size,
          color: e.colors[i % e.colors.length],
          opacity: box.running
            ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: twinkle ? [0.05, 1, 0.05] : [0.4, 1, 0.4] })
            : twinkle
              ? 0.2 + seeded(i, salt + 46) * 0.7
              : 0.8,
          ty: box.running && !twinkle ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [16, -16, 16] }) : 0,
        };
      }),
    [clock, e, box.width, box.height, box.running, salt, twinkle],
  );
  return (
    <>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            { left: d.left, top: d.top, width: d.size, height: d.size, borderRadius: d.size / 2, backgroundColor: d.color, opacity: d.opacity, transform: [{ translateY: d.ty }] },
          ]}
        />
      ))}
    </>
  );
}

// ——— Konfeti ———

function Confetti({ e, box, salt }: { e: Of<'confetti'>; box: Box; salt: number }) {
  const clock = useLoopClock(11000, box.running);
  const bits = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, salt + 51) * 2), seeded(i, salt + 52));
        const drift = 20 + seeded(i, salt + 53) * 40;
        const spin = 360 + seeded(i, salt + 54) * 540;
        return {
          left: seeded(i, salt + 55) * box.width,
          w: 5 + seeded(i, salt + 56) * 4,
          h: 9 + seeded(i, salt + 57) * 6,
          color: e.colors[i % e.colors.length],
          ty: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [-30, box.height + 30] }) : seeded(i, salt + 58) * box.height,
          tx: box.running ? t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, drift, 0, -drift, 0] }) : 0,
          rotate: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) : `${spin}deg`,
          // Düşerken dönen kâğıt: genişlik daralıp açılır.
          flip: box.running ? t.interpolate({ inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], outputRange: [1, 0.2, 1, 0.2, 1, 0.2, 1, 0.2, 1] }) : 1,
        };
      }),
    [clock, e, box.width, box.height, box.running, salt],
  );
  return (
    <>
      {bits.map((b, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            {
              left: b.left,
              top: 0,
              width: b.w,
              height: b.h,
              borderRadius: 1.5,
              backgroundColor: b.color,
              opacity: 0.75,
              transform: [{ translateY: b.ty }, { translateX: b.tx }, { rotate: b.rotate }, { scaleX: b.flip }],
            },
          ]}
        />
      ))}
    </>
  );
}

// ——— Yükselen zerreler (altın tozu, ateş böceği, kıvılcım) ———

function Motes({ e, box, salt }: { e: Of<'motes'>; box: Box; salt: number }) {
  const clock = useLoopClock(16000, box.running);
  const motes = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, salt + 61) * 2), seeded(i, salt + 62));
        const top = e.top * box.height;
        const span = (e.bottom - e.top) * box.height;
        const startY = top + span * (0.4 + seeded(i, salt + 63) * 0.6);
        const rise = span * (0.25 + seeded(i, salt + 64) * 0.4);
        const wobble = 8 + seeded(i, salt + 65) * 16;
        const size = e.size * (0.7 + seeded(i, salt + 66) * 0.7);
        return {
          left: seeded(i, salt + 67) * box.width,
          top: startY,
          size,
          ty: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -rise] }) : -rise * seeded(i, salt + 68),
          tx: box.running ? t.interpolate({ inputRange: [0, 0.33, 0.66, 1], outputRange: [0, wobble, -wobble, 0] }) : 0,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.2, 0.5, 0.8, 1], outputRange: [0, 0.9, 0.5, 0.9, 0] }) : 0.5,
        };
      }),
    [clock, e, box.width, box.height, box.running, salt],
  );
  return (
    <>
      {motes.map((m, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, styles.center, { left: m.left, top: m.top, width: 0, height: 0, opacity: m.opacity, transform: [{ translateY: m.ty }, { translateX: m.tx }] }]}
        >
          {e.glow ? (
            <View style={[styles.abs, { width: m.size * 5, height: m.size * 5, borderRadius: m.size * 2.5, backgroundColor: e.color, opacity: 0.14 }]} />
          ) : null}
          <View style={[styles.abs, { width: m.size, height: m.size, borderRadius: m.size / 2, backgroundColor: e.color }]} />
        </Animated.View>
      ))}
    </>
  );
}

// ——— Yapraklar ———

function Leaves({ e, box, salt }: { e: Of<'leaves'>; box: Box; salt: number }) {
  const clock = useLoopClock(30000, box.running);
  const leaves = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1 + Math.floor(seeded(i, salt + 71) * 2), seeded(i, salt + 72));
        const drift = box.width * (0.15 + seeded(i, salt + 73) * 0.2);
        const spin = 180 + seeded(i, salt + 75) * 360;
        return {
          left: seeded(i, salt + 74) * box.width - drift * 0.4,
          size: 12 + seeded(i, salt + 76) * 14,
          color: e.colors[i % e.colors.length],
          ty: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [-40, box.height + 40] }) : seeded(i, salt + 78) * box.height,
          tx: box.running
            ? t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, drift * 0.35, -drift * 0.1, drift * 0.6, drift] })
            : 0,
          rotate: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) : `${spin}deg`,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.08, 0.9, 1], outputRange: [0, 0.5, 0.5, 0] }) : 0.35,
        };
      }),
    [clock, e, box.width, box.height, box.running, salt],
  );
  return (
    <>
      {leaves.map((l, i) => (
        <Animated.View
          key={i}
          style={[styles.abs, { left: l.left, top: 0, opacity: l.opacity, transform: [{ translateY: l.ty }, { translateX: l.tx }, { rotate: l.rotate }] }]}
        >
          <Icon name="leaf" size={l.size} color={l.color} />
        </Animated.View>
      ))}
    </>
  );
}

// ——— Buğu ———

function Steam({ e, box, salt }: { e: Of<'steam'>; box: Box; salt: number }) {
  const clock = useLoopClock(9000, box.running);
  const wisps = useMemo(
    () =>
      Array.from({ length: e.count }, (_, i) => {
        const t = loopPhase(clock, 1, i / e.count + seeded(i, salt + 81) * 0.08);
        const w = 60 + seeded(i, salt + 82) * 50;
        const sway = 20 + seeded(i, salt + 83) * 30;
        const rise = box.height * (0.45 + seeded(i, salt + 84) * 0.2);
        return {
          left: e.x * box.width - w / 2 + (seeded(i, salt + 85) - 0.5) * 60,
          top: e.y * box.height - w,
          w,
          h: w * 1.8,
          ty: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -rise] }) : -rise * (i / e.count),
          tx: box.running ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, sway, -sway * 0.5] }) : 0,
          scale: box.running ? t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }) : 0.6 + (i / e.count) * 1.2,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.2, 0.7, 1], outputRange: [0, 0.11, 0.05, 0] }) : 0.07,
        };
      }),
    [clock, e, box.width, box.height, box.running, salt],
  );
  return (
    <>
      {wisps.map((s, i) => (
        <Animated.View
          key={i}
          style={[
            styles.abs,
            {
              left: s.left,
              top: s.top,
              width: s.w,
              height: s.h,
              borderRadius: s.w / 2,
              backgroundColor: '#FFF1E0',
              opacity: s.opacity,
              transform: [{ translateY: s.ty }, { translateX: s.tx }, { scale: s.scale }],
            },
          ]}
        />
      ))}
    </>
  );
}

// ——— Eğik şeritler ———

function Stripes({ e, box }: { e: Of<'stripes'>; box: Box }) {
  const clock = useLoopClock(14000, box.running);
  const size = Math.hypot(box.width, box.height) * 1.2;
  const period = e.band * 2;
  const count = Math.ceil(size / period) + 2;
  const tx = box.running ? clock.interpolate({ inputRange: [0, 1], outputRange: [0, period] }) : 0;
  return (
    <View
      style={[
        styles.abs,
        { left: (box.width - size) / 2, top: (box.height - size) / 2, width: size, height: size, transform: [{ rotate: `${e.angle}deg` }] },
      ]}
    >
      <Animated.View style={[styles.abs, { left: -period, top: 0, bottom: 0, flexDirection: 'row', transform: [{ translateX: tx }] }]}>
        {Array.from({ length: count }, (_, i) => (
          <View key={i} style={{ flexDirection: 'row' }}>
            <View style={{ width: e.band, height: size, backgroundColor: e.colors[0] }} />
            <View style={{ width: e.band, height: size, backgroundColor: e.colors[1] }} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ——— Veri ağı ———

function Grid({ e, box, salt }: { e: Of<'grid'>; box: Box; salt: number }) {
  const clock = useLoopClock(5200, box.running);
  const cols = Math.ceil(box.width / e.gap) + 1;
  const rows = Math.ceil(box.height / e.gap) + 1;
  const pulses = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const horizontal = i % 2 === 0;
        const line = Math.floor(seeded(i, salt + 91) * (horizontal ? rows : cols));
        const t = loopPhase(clock, 1, seeded(i, salt + 92));
        const span = horizontal ? box.width : box.height;
        const reverse = seeded(i, salt + 93) > 0.5;
        return {
          horizontal,
          pos: line * e.gap,
          move: box.running
            ? t.interpolate({ inputRange: [0, 1], outputRange: reverse ? [span, -80] : [-80, span] })
            : seeded(i, salt + 94) * span,
          opacity: box.running ? t.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }) : 0.6,
          reverse,
        };
      }),
    [clock, e.gap, rows, cols, box.width, box.height, box.running, salt],
  );
  const nodes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: Math.floor(seeded(i, salt + 95) * cols) * e.gap,
        y: Math.floor(seeded(i, salt + 96) * rows) * e.gap,
        t: loopPhase(clock, 1, seeded(i, salt + 97)),
      })),
    [clock, cols, rows, e.gap, salt],
  );
  return (
    <>
      {Array.from({ length: cols }, (_, i) => (
        <View key={`c${i}`} style={[styles.abs, { left: i * e.gap, top: 0, bottom: 0, width: StyleSheet.hairlineWidth * 2, backgroundColor: e.color }]} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View key={`r${i}`} style={[styles.abs, { top: i * e.gap, left: 0, right: 0, height: StyleSheet.hairlineWidth * 2, backgroundColor: e.color }]} />
      ))}
      {nodes.map((n, i) => (
        <Animated.View
          key={`n${i}`}
          style={[
            styles.abs,
            {
              left: n.x - 2.5,
              top: n.y - 2.5,
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: e.pulse,
              opacity: box.running ? n.t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.8, 0.15] }) : 0.4,
            },
          ]}
        />
      ))}
      {pulses.map((p, i) => {
        const colors: [string, string] = p.reverse ? [e.pulse, `${e.pulse}00`] : [`${e.pulse}00`, e.pulse];
        return (
          <Animated.View
            key={`p${i}`}
            style={[
              styles.abs,
              p.horizontal
                ? { top: p.pos - 1, left: 0, width: 80, height: 2, transform: [{ translateX: p.move }] }
                : { left: p.pos - 1, top: 0, width: 2, height: 80, transform: [{ translateY: p.move }] },
              { opacity: p.opacity },
            ]}
          >
            <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={p.horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }} style={FILL} />
          </Animated.View>
        );
      })}
    </>
  );
}

// ——— Şehir silueti ———

function Skyline({ e, box, salt }: { e: Of<'skyline'>; box: Box; salt: number }) {
  const clock = useLoopClock(8000, box.running);
  const base = e.base * box.height;
  const buildings = useMemo(() => {
    const out: { left: number; w: number; h: number; windows: { x: number; y: number; on: number }[] }[] = [];
    let x = -6;
    let i = 0;
    while (x < box.width && i < 40) {
      const w = box.width * (0.07 + seeded(i, salt + 101) * 0.08);
      const h = box.height * (0.08 + seeded(i, salt + 102) * (i % 3 === 1 ? 0.22 : 0.12));
      const windows: { x: number; y: number; on: number }[] = [];
      for (let wy = 8; wy < h - 6 && windows.length < 18; wy += 11) {
        for (let wx = 5; wx < w - 6; wx += 9) {
          const r = seeded(i * 97 + windows.length, salt + 103);
          if (r > 0.55) windows.push({ x: wx, y: wy, on: r });
        }
      }
      out.push({ left: x, w, h, windows });
      x += w + 1;
      i += 1;
    }
    return out;
  }, [box.width, box.height, salt]);
  return (
    <>
      {buildings.map((b, i) => (
        <View key={i} style={[styles.abs, { left: b.left, top: base - b.h, width: b.w, height: b.h, backgroundColor: e.color }]}>
          {b.windows.map((w, j) => {
            // Pencerelerin bir kısmı ağır ağır yanıp söner.
            const blink = box.running && (i + j) % 7 === 0;
            const t = blink ? loopPhase(clock, 1, w.on) : null;
            return (
              <Animated.View
                key={j}
                style={[
                  styles.abs,
                  {
                    left: w.x,
                    top: w.y,
                    width: 4,
                    height: 5,
                    borderRadius: 1,
                    backgroundColor: e.window,
                    opacity: t ? t.interpolate({ inputRange: [0, 0.45, 0.5, 0.95, 1], outputRange: [0.85, 0.85, 0.08, 0.08, 0.85] }) : 0.25 + (w.on - 0.55) * 1.4,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
      <View style={[styles.abs, { left: 0, right: 0, top: base - 1, bottom: 0, backgroundColor: e.color }]} />
    </>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  abs: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  peak: { transform: [{ rotate: '45deg' }], borderRadius: 6 },
});
