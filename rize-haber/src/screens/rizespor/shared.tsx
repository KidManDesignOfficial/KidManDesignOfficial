/** Rizespor ekranlarında ortak parçalar: maç satırı, sonuç rozeti, canlı nabız. */
import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { PressableScale, useReducedMotion, useAnimatedValue } from '../../components/motion';
import { clock, dayLabel } from '../../rizespor/format';
import { RIZESPOR_ID } from '../../rizespor/names';
import { GLASS } from '../../rizespor/stadium';
import type { Match } from '../../rizespor/parse';
import { useTheme } from '../../theme';

export const RESULT_COLORS = { G: '#1E9E57', B: '#8A94A6', M: '#D64545' } as const;
export const RESULT_LABELS = { G: 'Galibiyet', B: 'Beraberlik', M: 'Mağlubiyet' } as const;

export function ResultPill({ result, size = 22 }: { result: 'G' | 'B' | 'M'; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: RESULT_COLORS[result],
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel={RESULT_LABELS[result]}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: size * 0.5 }}>{result}</Text>
    </View>
  );
}

/** Canlı maçlarda yanıp sönen kırmızı nokta. */
export function LivePulse({ size = 10, color = '#FF3B30' }: { size?: number; color?: string }) {
  const reduced = useReducedMotion();
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  const ringScale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const ringOpacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

/** Maç satırı: stadyum sahnesinin üstünde cam kart. */
export function MatchRow({ match, onPress }: { match: Match; onPress: () => void }) {
  const { fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: GLASS.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: GLASS.border,
          paddingVertical: 12,
          paddingHorizontal: 14,
        },
        when: { width: fs(64), alignItems: 'center', gap: 2, paddingRight: 10, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: GLASS.border },
        day: { fontSize: fs(12), color: GLASS.soft, fontWeight: '600', textAlign: 'center' },
        time: { fontSize: fs(14), color: GLASS.text, fontWeight: '800' },
        teams: { flex: 1, gap: 6 },
        teamLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
        team: { flex: 1, fontSize: fs(15), color: GLASS.text, fontWeight: '500' },
        us: { fontWeight: '800', color: GLASS.accent },
        score: { fontSize: fs(16), fontWeight: '800', color: GLASS.text, minWidth: 18, textAlign: 'right' },
        winner: { color: GLASS.text },
        loser: { color: GLASS.faint, fontWeight: '600' },
        right: { width: 28, alignItems: 'center' },
        live: { fontSize: fs(11), fontWeight: '800', color: '#FF6B61' },
        venue: { fontSize: fs(12), color: GLASS.soft },
      }),
    [fs],
  );

  const isLive = match.state === 'in';
  const done = match.state === 'post';
  const line = (side: 'home' | 'away') => {
    const team = side === 'home' ? match.home : match.away;
    const score = side === 'home' ? match.homeScore : match.awayScore;
    const other = side === 'home' ? match.awayScore : match.homeScore;
    const lost = done && score !== null && other !== null && score < other;
    return (
      <View style={styles.teamLine}>
        <Text style={[styles.team, team.id === RIZESPOR_ID && styles.us]} numberOfLines={1}>
          {team.name}
        </Text>
        {score !== null ? <Text style={[styles.score, lost ? styles.loser : styles.winner]}>{score}</Text> : null}
      </View>
    );
  };

  return (
    <PressableScale
      onPress={onPress}
      style={styles.row}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${match.home.name} ${match.homeScore ?? ''} – ${match.awayScore ?? ''} ${match.away.name}, ${dayLabel(match.date)} ${clock(match.date)}`}
    >
      <View style={styles.when}>
        {isLive ? (
          <>
            <LivePulse />
            <Text style={styles.live}>{match.status || 'CANLI'}</Text>
          </>
        ) : (
          <>
            <Text style={styles.day}>{dayLabel(match.date).replace(' ', '\n')}</Text>
            <Text style={styles.time}>{done ? match.status : clock(match.date)}</Text>
          </>
        )}
      </View>
      <View style={styles.teams}>
        {line('home')}
        {line('away')}
        {!done && !isLive && match.venue ? (
          <Text style={styles.venue} numberOfLines={1}>
            📍 {match.venue}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{match.result ? <ResultPill result={match.result} /> : <Text style={styles.venue}>›</Text>}</View>
    </PressableScale>
  );
}
