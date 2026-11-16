/** Gol anı: "GOOOL!" yazısı yaylanarak belirir, konfeti saçılır, telefon kısa titrer. */
import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, Vibration, View } from 'react-native';

import { useReducedMotion, useAnimatedValue } from '../../components/motion';
import { successFeedback } from '../../haptics';
import { CLUB_COLORS } from '../../rizespor/names';

const PARTICLES = 16;
const COLORS = [CLUB_COLORS.green, CLUB_COLORS.blue, '#FFFFFF', '#FFD447'];

export default function GoalBurst({ team, us, onDone }: { team: string; us: boolean; onDone: () => void }) {
  const reduced = useReducedMotion();
  const pop = useAnimatedValue(0);
  const fly = useAnimatedValue(0);
  const fade = useAnimatedValue(1);

  useEffect(() => {
    if (us) {
      successFeedback();
      Vibration.vibrate([0, 90, 70, 160]);
    }
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 14 }),
        Animated.timing(fly, { toValue: 1, duration: reduced ? 0 : 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(reduced ? 600 : 900),
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => finished && onDone());
    return () => anim.stop();
  }, [fade, fly, onDone, pop, reduced, us]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap, { opacity: fade }]}>
      <View style={styles.dim} />
      {!reduced && us
        ? Array.from({ length: PARTICLES }, (_, i) => {
            const angle = (i / PARTICLES) * Math.PI * 2;
            const dist = 120 + (i % 3) * 40;
            const tx = fly.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] });
            const ty = fly.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist] });
            const o = fly.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
            const rot = fly.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 ? 1 : -1) * 240}deg`] });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  { backgroundColor: COLORS[i % COLORS.length], opacity: o, transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }] },
                ]}
              />
            );
          })
        : null}
      <Animated.View style={[styles.badge, !us && styles.badgeThem, { transform: [{ scale }] }]}>
        <Text style={styles.ball}>⚽</Text>
        <Text style={styles.goal}>{us ? 'GOOOL!' : 'Gol'}</Text>
        <Text style={styles.team}>{team}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  dim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  particle: { position: 'absolute', width: 10, height: 16, borderRadius: 3 },
  badge: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: CLUB_COLORS.green,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  badgeThem: { backgroundColor: '#4A5560' },
  ball: { fontSize: 40 },
  goal: { color: '#FFFFFF', fontSize: 40, fontWeight: '900', letterSpacing: 2 },
  team: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 2 },
});
