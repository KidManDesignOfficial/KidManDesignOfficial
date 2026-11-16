import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton, SectionTitle } from '../../components/ui';
import { useReducedMotion } from '../../components/motion';
import { fetchMatchDetail } from '../../rizespor/api';
import { clock, longKickoff } from '../../rizespor/format';
import { CLUB_COLORS, RIZESPOR_ID } from '../../rizespor/names';
import type { Match, MatchDetail, MatchEvent, TeamStat } from '../../rizespor/parse';
import { useTheme } from '../../theme';
import GoalBurst from './GoalBurst';
import Pitch from './Pitch';
import { LivePulse } from './shared';

const LIVE_REFRESH_MS = 30_000;

const EVENT_ICON: Record<MatchEvent['kind'], string> = {
  goal: '⚽',
  'own-goal': '⚽',
  penalty: '⚽',
  yellow: '🟨',
  red: '🟥',
  sub: '🔁',
  other: '•',
};

export default function MatchCenter({ match, onClose }: { match: Match | null; onClose: () => void }) {
  return (
    <Modal visible={match !== null} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {match ? <MatchCenterBody initial={match} onClose={onClose} /> : null}
    </Modal>
  );
}

function MatchCenterBody({ initial, onClose }: { initial: Match; onClose: () => void }) {
  const { colors, fs } = useTheme();
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [burst, setBurst] = useState<{ team: string; us: boolean } | null>(null);
  const lastScore = useRef<{ h: number; a: number } | null>(null);
  const scoreBump = useRef(new Animated.Value(1)).current;

  const match = detail?.match ?? initial;
  const live = match.state === 'in';

  const load = useCallback(async () => {
    try {
      const d = await fetchMatchDetail(initial.id);
      const h = d.match.homeScore ?? 0;
      const a = d.match.awayScore ?? 0;
      const prev = lastScore.current;
      if (prev && (h > prev.h || a > prev.a)) {
        const homeScored = h > prev.h;
        const team = homeScored ? d.match.home : d.match.away;
        setBurst({ team: team.name, us: team.id === RIZESPOR_ID });
        Animated.sequence([
          Animated.spring(scoreBump, { toValue: 1.35, useNativeDriver: true, speed: 20, bounciness: 12 }),
          Animated.spring(scoreBump, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
        ]).start();
      }
      lastScore.current = { h, a };
      setDetail(d);
      setError(null);
      setUpdatedAt(new Date());
    } catch {
      setError('Maç bilgisi alınamadı. İnternet bağlantınızı kontrol edin.');
    }
  }, [initial.id, scoreBump]);

  useEffect(() => {
    load();
  }, [load]);

  // Canlı maçta ve uygulama ön plandayken düzenli yenileme.
  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setInterval> | null = setInterval(load, LIVE_REFRESH_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !timer) {
        load();
        timer = setInterval(load, LIVE_REFRESH_MS);
      } else if (state !== 'active' && timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [live, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        header: { paddingHorizontal: 16, paddingBottom: 18 },
        topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
        close: {
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.18)',
        },
        closeText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
        league: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), fontWeight: '800', letterSpacing: 1 },
        board: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
        team: { flex: 1, alignItems: 'center' },
        teamName: { color: '#FFFFFF', fontSize: fs(15), fontWeight: '800', textAlign: 'center' },
        center: { width: fs(130), alignItems: 'center', gap: 4 },
        score: { color: '#FFFFFF', fontSize: fs(46), fontWeight: '900' },
        vs: { color: '#FFFFFF', fontSize: fs(22), fontWeight: '900' },
        statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        status: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '800' },
        meta: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), textAlign: 'center', marginTop: 10 },
        content: { padding: 16, paddingBottom: 40 },
        muted: { color: colors.textMuted, fontSize: fs(14), textAlign: 'center' },
        error: { color: colors.error, fontSize: fs(14), textAlign: 'center', marginBottom: 10 },
        updated: { color: colors.textMuted, fontSize: fs(12), textAlign: 'center', marginTop: 16 },
        disclaimer: { color: colors.textMuted, fontSize: fs(11), textAlign: 'center', marginTop: 6, lineHeight: fs(16) },
      }),
    [colors, fs],
  );

  const homeGoals = detail?.events.filter((e) => isGoal(e) && scorerTeam(e, match) === match.home.id) ?? [];
  const awayGoals = detail?.events.filter((e) => isGoal(e) && scorerTeam(e, match) === match.away.id) ?? [];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[CLUB_COLORS.greenDark, CLUB_COLORS.blueDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.topBar}>
            <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={10}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
            <Text style={styles.league}>SÜPER LİG</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.board}>
            <View style={styles.team}>
              <Text style={styles.teamName} numberOfLines={2}>
                {match.home.name}
              </Text>
              <GoalList events={homeGoals} align="center" />
            </View>
            <View style={styles.center}>
              {match.state === 'pre' ? (
                <Text style={styles.vs}>{clock(match.date)}</Text>
              ) : (
                <Animated.Text style={[styles.score, { transform: [{ scale: scoreBump }] }]}>
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </Animated.Text>
              )}
              <View style={styles.statusRow}>
                {live ? <LivePulse color="#FFFFFF" size={8} /> : null}
                <Text style={styles.status}>{match.state === 'pre' ? match.status || 'Başlamadı' : match.status}</Text>
              </View>
            </View>
            <View style={styles.team}>
              <Text style={styles.teamName} numberOfLines={2}>
                {match.away.name}
              </Text>
              <GoalList events={awayGoals} align="center" />
            </View>
          </View>
          <Text style={styles.meta}>
            {longKickoff(match.date)}
            {match.venue ? ` · ${match.venue}` : ''}
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[CLUB_COLORS.green]} tintColor={CLUB_COLORS.green} />}
      >
        {error ? (
          <>
            <Text style={styles.error}>{error}</Text>
            {!detail ? <PrimaryButton label="Tekrar dene" onPress={load} /> : null}
          </>
        ) : null}

        {!detail && !error ? <ActivityIndicator color={CLUB_COLORS.green} style={{ marginTop: 32 }} /> : null}

        {detail ? (
          <>
            {detail.events.length > 0 ? (
              <>
                <SectionTitle hint={live ? 'Canlı – her 30 saniyede güncellenir' : undefined}>Maç anları</SectionTitle>
                <Card>
                  <Timeline events={detail.events} match={match} />
                </Card>
              </>
            ) : match.state === 'pre' ? (
              <Card style={{ marginTop: 16 }}>
                <Text style={styles.muted}>
                  Maç henüz başlamadı. Başlama saati {clock(match.date)}; kadrolar genellikle maçtan yaklaşık bir saat
                  önce açıklanır.
                </Text>
              </Card>
            ) : null}

            {detail.lineups.home || detail.lineups.away ? (
              <>
                <SectionTitle hint={`${match.home.name} altta, ${match.away.name} üstte`}>İlk 11’ler</SectionTitle>
                <Pitch home={detail.lineups.home} away={detail.lineups.away} live={live} />
              </>
            ) : null}

            {detail.stats.length > 0 ? (
              <>
                <SectionTitle>İstatistikler</SectionTitle>
                <Card>
                  <StatBars stats={detail.stats} homeIsUs={match.home.id === RIZESPOR_ID} awayIsUs={match.away.id === RIZESPOR_ID} />
                </Card>
              </>
            ) : null}
          </>
        ) : null}

        {updatedAt ? <Text style={styles.updated}>Son güncelleme: {updatedAt.toLocaleTimeString('tr-TR')}</Text> : null}
        <Text style={styles.disclaimer}>
          Veriler ESPN’den alınır; kulübün veya TFF’nin resmî verisi değildir ve gecikmeli olabilir.
        </Text>
      </ScrollView>

      {burst ? <GoalBurst team={burst.team} us={burst.us} onDone={() => setBurst(null)} /> : null}
    </View>
  );
}

const isGoal = (e: MatchEvent) => e.kind === 'goal' || e.kind === 'penalty' || e.kind === 'own-goal';

/** Kendi kalesine gol, golü atan takımın değil rakibin hanesine yazılır. */
function scorerTeam(e: MatchEvent, m: Match): string | null {
  if (e.kind !== 'own-goal') return e.teamId;
  return e.teamId === m.home.id ? m.away.id : e.teamId === m.away.id ? m.home.id : null;
}

function GoalList({ events, align }: { events: MatchEvent[]; align: 'center' }) {
  const { fs } = useTheme();
  if (events.length === 0) return null;
  return (
    <View style={{ marginTop: 6, alignItems: align }}>
      {events.map((e) => (
        <Text key={e.id} style={{ color: 'rgba(255,255,255,0.85)', fontSize: fs(11) }} numberOfLines={1}>
          ⚽ {e.player ?? ''} {e.minute}
          {e.kind === 'penalty' ? ' (P)' : e.kind === 'own-goal' ? ' (K.K.)' : ''}
        </Text>
      ))}
    </View>
  );
}

function Timeline({ events, match }: { events: MatchEvent[]; match: Match }) {
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
        side: { flex: 1 },
        left: { alignItems: 'flex-end', paddingRight: 10 },
        right: { alignItems: 'flex-start', paddingLeft: 10 },
        minuteWrap: { width: 52, alignItems: 'center' },
        minute: {
          minWidth: 46,
          textAlign: 'center',
          paddingVertical: 3,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: colors.primarySoft,
          color: colors.text,
          fontSize: fs(12),
          fontWeight: '800',
        },
        rail: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, backgroundColor: colors.border },
        main: { fontSize: fs(14), color: colors.text, fontWeight: '700' },
        sub: { fontSize: fs(12), color: colors.textMuted },
      }),
    [colors, fs],
  );

  return (
    <View>
      <View style={styles.rail} />
      {events.map((e) => {
        const home = e.teamId === match.home.id;
        const content = (
          <View style={[styles.side, home ? styles.left : styles.right]}>
            <Text style={[styles.main, { textAlign: home ? 'right' : 'left' }]} numberOfLines={2}>
              {home ? `${e.player ?? ''} ${EVENT_ICON[e.kind]}` : `${EVENT_ICON[e.kind]} ${e.player ?? ''}`}
            </Text>
            {e.kind === 'sub' && e.playerOut ? (
              <Text style={[styles.sub, { textAlign: home ? 'right' : 'left' }]} numberOfLines={2}>
                Çıkan: {e.playerOut}
              </Text>
            ) : e.kind === 'penalty' ? (
              <Text style={styles.sub}>Penaltı</Text>
            ) : e.kind === 'own-goal' ? (
              <Text style={styles.sub}>Kendi kalesine</Text>
            ) : null}
          </View>
        );
        return (
          <FadeRow key={e.id}>
            <View style={styles.row}>
              {home ? content : <View style={styles.side} />}
              <View style={styles.minuteWrap}>
                <Text style={styles.minute}>{e.minute}</Text>
              </View>
              {home ? <View style={styles.side} /> : content}
            </View>
          </FadeRow>
        );
      })}
    </View>
  );
}

function FadeRow({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (!reduced) Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduced, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return <Animated.View style={{ opacity: v, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function StatBars({ stats, homeIsUs, awayIsUs }: { stats: TeamStat[]; homeIsUs: boolean; awayIsUs: boolean }) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const grow = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (!reduced) Animated.timing(grow, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [grow, reduced]);

  const homeColor = homeIsUs ? CLUB_COLORS.green : '#8A94A6';
  const awayColor = awayIsUs ? CLUB_COLORS.green : homeIsUs ? '#8A94A6' : CLUB_COLORS.blue;

  return (
    <View style={{ gap: 14 }}>
      {stats.map((s) => {
        const total = s.home + s.away;
        const hp = total > 0 ? s.home / total : 0.5;
        const fmt = (n: number) => (s.percent ? `%${Math.round(n)}` : String(n));
        const hw = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${hp * 100}%`] });
        const aw = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(1 - hp) * 100}%`] });
        return (
          <View key={s.key} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: fs(14), width: 50 }}>{fmt(s.home)}</Text>
              <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: fs(13) }}>{s.label}</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: fs(14), width: 50, textAlign: 'right' }}>{fmt(s.away)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, height: 8 }}>
              <View style={{ flex: 1, alignItems: 'flex-end', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <Animated.View style={{ width: hw, height: '100%', backgroundColor: homeColor, borderRadius: 4 }} />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-start', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <Animated.View style={{ width: aw, height: '100%', backgroundColor: awayColor, borderRadius: 4 }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
