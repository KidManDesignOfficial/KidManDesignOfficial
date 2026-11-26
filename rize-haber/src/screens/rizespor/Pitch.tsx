/**
 * İki takımın ilk 11'ini dizilişlerine göre gösteren saha.
 * Ev sahibi alttan yukarı, deplasman üstten aşağı hücum eder. Oyuncular kaleden ileriye doğru
 * sırayla sahaya "çıkar"; canlı maçta orta noktada nabız atar. Gol atan oyuncunun yanında top,
 * kart görenin yanında sarı/kırmızı kart işareti görünür.
 */
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion, useAnimatedValue } from '../../components/motion';
import { shortName } from '../../rizespor/format';
import { lineupRows } from '../../rizespor/formation';
import { CLUB_COLORS, RIZESPOR_ID } from '../../rizespor/names';
import type { Lineup, LineupPlayer } from '../../rizespor/parse';
import { useTheme, tint } from '../../theme';

const GRASS_A = '#2F8F46';
const GRASS_B = '#2A8340';
const LINE = 'rgba(255,255,255,0.75)';
const DOT = 30;

type Placed = { key: string; player: LineupPlayer; x: number; y: number; delay: number; us: boolean; home: boolean };

function place(lineup: Lineup, home: boolean): Placed[] {
  const rows = lineupRows(lineup.starters, lineup.formation);
  const n = rows.length;
  const out: Placed[] = [];
  rows.forEach((row, i) => {
    // Kaleci kendi kalesine yakın, en ileri satır orta çizgiye yakın.
    const depth = n > 1 ? i / (n - 1) : 0;
    // İki takımın en ileri satırları arasında ~%16 boşluk kalır (forvetler üst üste binmez).
    const y = home ? 93 - depth * 35 : 7 + depth * 35;
    row.forEach((p, j) => {
      const xRaw = ((j + 1) / (row.length + 1)) * 100;
      out.push({
        key: `${home ? 'h' : 'a'}-${i}-${j}-${p.name}`,
        player: p,
        // Deplasman takımı karşıdan baktığı için sol-sağ aynalanır.
        x: home ? xRaw : 100 - xRaw,
        y,
        delay: i * 90 + j * 25,
        us: lineup.teamId === RIZESPOR_ID,
        home,
      });
    });
  });
  return out;
}

export default function Pitch({ home, away, live }: { home: Lineup | null; away: Lineup | null; live: boolean }) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const height = width * 1.42;
  const players = useMemo(
    () => [...(home ? place(home, true) : []), ...(away ? place(away, false) : [])],
    [home, away],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pitch: { width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: tint(colors, GRASS_A) },
        stripe: { position: 'absolute', left: 0, right: 0 },
        line: { position: 'absolute', borderColor: LINE },
        label: {
          position: 'absolute',
          left: 10,
          color: 'rgba(255,255,255,0.9)',
          fontSize: fs(11),
          fontWeight: '800',
          letterSpacing: 0.5,
        },
      }),
    [colors, fs],
  );

  const inset = 0.04;
  const L = width * inset;
  const T = height * 0.025;
  const W = width - 2 * L;
  const H = height - 2 * T;
  const box = (topSide: boolean, wRatio: number, hRatio: number) => ({
    left: L + (W * (1 - wRatio)) / 2,
    width: W * wRatio,
    height: H * hRatio,
    ...(topSide ? { top: T, borderTopWidth: 0 } : { top: T + H - H * hRatio, borderBottomWidth: 0 }),
    borderWidth: 2,
  });
  const circle = W * 0.26;

  return (
    <View
      style={[styles.pitch, { height: height || undefined, aspectRatio: width ? undefined : 1 / 1.42 }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={`Saha dizilişi: ${home?.formation ?? ''} ve ${away?.formation ?? ''}`}
    >
      {width > 0 ? (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <View
              key={i}
              style={[styles.stripe, { top: (height / 10) * i, height: height / 10, backgroundColor: tint(colors, i % 2 ? GRASS_B : GRASS_A) }]}
            />
          ))}
          <View style={[styles.line, { left: L, top: T, width: W, height: H, borderWidth: 2 }]} />
          <View style={[styles.line, { left: L, top: T + H / 2 - 1, width: W, borderTopWidth: 2 }]} />
          <View
            style={[
              styles.line,
              { left: width / 2 - circle / 2, top: height / 2 - circle / 2, width: circle, height: circle, borderRadius: circle / 2, borderWidth: 2 },
            ]}
          />
          <View style={[styles.line, box(true, 0.56, 0.15)]} />
          <View style={[styles.line, box(false, 0.56, 0.15)]} />
          <View style={[styles.line, box(true, 0.26, 0.055)]} />
          <View style={[styles.line, box(false, 0.26, 0.055)]} />
          <CenterSpot x={width / 2} y={height / 2} live={live && !reduced} />

          {away?.formation ? <Text style={[styles.label, { top: T + 6 }]}>{away.formation}</Text> : null}
          {home?.formation ? <Text style={[styles.label, { bottom: T + 6 }]}>{home.formation}</Text> : null}

          {players.map((p) => (
            <PlayerDot key={p.key} p={p} pitchW={width} pitchH={height} reduced={reduced} />
          ))}
        </>
      ) : null}
    </View>
  );
}

function CenterSpot({ x, y, live }: { x: number; y: number; live: boolean }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [live, v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 5] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  return (
    <>
      {live ? (
        <Animated.View
          style={{ position: 'absolute', left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF', opacity, transform: [{ scale }] }}
        />
      ) : null}
      <View style={{ position: 'absolute', left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: LINE }} />
    </>
  );
}

function PlayerDot({ p, pitchW, pitchH, reduced }: { p: Placed; pitchW: number; pitchH: number; reduced: boolean }) {
  const { colors, fs } = useTheme();
  const v = useAnimatedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    Animated.spring(v, { toValue: 1, delay: p.delay, useNativeDriver: true, speed: 12, bounciness: 8 }).start();
  }, [p.delay, reduced, v]);

  const fill = p.us ? tint(colors, CLUB_COLORS.blue) : '#F4F4F4';
  const ring = p.us ? tint(colors, CLUB_COLORS.green) : '#9AA3AD';
  const text = p.us ? '#FFFFFF' : '#1E2228';
  const boxW = 70;
  const left = (p.x / 100) * pitchW - boxW / 2;
  const top = (p.y / 100) * pitchH - DOT / 2;
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [p.home ? 18 : -18, 0] });

  return (
    <Animated.View
      style={{ position: 'absolute', left, top, width: boxW, alignItems: 'center', opacity: v, transform: [{ translateY }, { scale }] }}
      accessibilityLabel={`${p.player.jersey ?? ''} ${p.player.name}`}
    >
      <View
        style={{
          width: DOT,
          height: DOT,
          borderRadius: DOT / 2,
          backgroundColor: fill,
          borderWidth: 2.5,
          borderColor: ring,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <Text style={{ color: text, fontSize: 12, fontWeight: '900' }}>{p.player.jersey ?? ''}</Text>
        {p.player.subbedOut ? (
          <View style={{ position: 'absolute', right: -6, top: -6, width: 15, height: 15, borderRadius: 8, backgroundColor: '#D64545', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '900' }}>↓</Text>
          </View>
        ) : null}
        {p.player.goals > 0 ? (
          <View style={[badge.base, badge.goal]} accessibilityLabel={`${p.player.goals} gol`}>
            <Text style={badge.goalText}>⚽{p.player.goals > 1 ? `×${p.player.goals}` : ''}</Text>
          </View>
        ) : null}
        {p.player.red > 0 || p.player.yellow > 0 ? (
          <View
            style={[badge.card, { backgroundColor: p.player.red > 0 ? '#E53935' : '#FDD835' }]}
            accessibilityLabel={p.player.red > 0 ? 'Kırmızı kart' : 'Sarı kart'}
          />
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 2,
          color: '#FFFFFF',
          fontSize: fs(10),
          fontWeight: '700',
          textShadowColor: 'rgba(0,0,0,0.7)',
          textShadowRadius: 3,
          textShadowOffset: { width: 0, height: 1 },
          maxWidth: boxW,
        }}
      >
        {shortName(p.player.name)}
      </Text>
    </Animated.View>
  );
}

/** Oyuncu noktasının köşelerindeki gol ve kart işaretleri. */
const badge = StyleSheet.create({
  base: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  goal: {
    left: -10,
    top: -7,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 2,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  goalText: { fontSize: 9, fontWeight: '900', color: '#1E2228' },
  card: { position: 'absolute', left: -6, bottom: -5, width: 9, height: 12, borderRadius: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.3)' },
});
