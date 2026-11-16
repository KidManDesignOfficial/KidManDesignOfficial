/** Canlı veri kartları için ortak durum göstergeleri: canlı rozet, yükleniyor, hata. */
import { useEffect } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';

import { agoText } from '../lib/live';
import type { LiveState } from '../lib/live';
import { alpha, useTheme } from '../theme';
import { Icon } from './Icon';
import { PressableScale, useAnimatedValue, useReducedMotion } from './motion';
import { T } from './ui';

/** "● Canlı · ÖSYM · 3 dk önce" + yenile düğmesi */
export function LiveBadge({ state, source }: { state: LiveState<unknown>; source: string }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useAnimatedValue(0);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);
  const live = !!state.data && !state.error;
  const color = state.error ? c.warning : live ? c.success : c.textFaint;
  const label = state.loading && !state.data ? 'Bağlanıyor…' : state.error ? (state.data ? `Önbellek · ${agoText(state.fetchedAt)}` : 'Bağlantı yok') : `Canlı · ${agoText(state.fetchedAt)}`;
  return (
    <View style={styles.badgeRow}>
      <View style={[styles.badge, { backgroundColor: alpha(color, 0.12) }]} accessibilityLabel={`${source} verisi: ${label}`}>
        <View style={styles.dotWrap}>
          {live ? (
            <Animated.View style={[styles.ping, { backgroundColor: color, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }] }]} />
          ) : null}
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
        <T size={11.5} weight="800" color={color}>
          {source} · {label}
        </T>
      </View>
      <PressableScale onPress={state.refresh} accessibilityRole="button" accessibilityLabel="Yenile" hitSlop={8} style={[styles.refresh, { backgroundColor: c.cardAlt }]}>
        {state.loading ? <ActivityIndicator size="small" color={c.primary} /> : <Icon name="refresh" size={16} color={c.primary} />}
      </PressableScale>
    </View>
  );
}

export function LiveError({ state, onOpen }: { state: LiveState<unknown>; onOpen: () => void }) {
  const { c } = useTheme();
  if (state.data || state.loading || !state.error) return null;
  return (
    <View style={[styles.err, { backgroundColor: c.warningSoft }]}>
      <Icon name="cloud-offline" size={20} color={c.warning} />
      <View style={{ flex: 1, gap: 4 }}>
        <T size={13.5} weight="700">
          Resmî siteye ulaşılamadı
        </T>
        <T size={12.5} muted>
          {state.error}. İnternet bağlantını kontrol edip yenile ya da sayfayı doğrudan aç.
        </T>
        <PressableScale onPress={onOpen} accessibilityRole="link">
          <T size={13} weight="800" color={c.primary}>
            Resmî sayfayı aç →
          </T>
        </PressableScale>
      </View>
    </View>
  );
}

export function LiveSkeleton({ rows = 3 }: { rows?: number }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0.4);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(p, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(p, { toValue: 0.4, duration: 700, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [p, reduced]);
  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: rows }, (_, i) => (
        <Animated.View key={i} style={{ opacity: p, gap: 6 }}>
          <View style={{ height: 12, width: '30%', borderRadius: 6, backgroundColor: c.cardAlt }} />
          <View style={{ height: 14, width: `${90 - i * 12}%`, borderRadius: 7, backgroundColor: c.cardAlt }} />
        </Animated.View>
      ))}
    </View>
  );
}

export function trDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, flexShrink: 1 },
  dotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  ping: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  refresh: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  err: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, alignItems: 'flex-start' },
});
