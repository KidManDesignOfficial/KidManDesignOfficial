/**
 * Maç merkezi: skor tabelası ve dört bölüm — Özet (maç akışı, anlar, maç bilgileri), Kadrolar (saha,
 * öne çıkanlar, yedekler), İstatistik (hücum / pas / savunma / disiplin) ve Rekabet (puan durumu,
 * iki takımın son 5 maçı, önceki karşılaşmalar).
 *
 * Canlı takip: maç penceresinde (başlamadan 15 dk önce → bitene kadar) 20 saniyede bir yenilenir;
 * arada dakika telefonda saniye saniye ilerletilir. Gol, kırmızı kart, devre arası ve maç sonu
 * ekranda efektle duyurulur.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, Animated, AppState, Easing, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton, SectionTitle } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { SegmentedTabs, type Segment } from '../../components/SegmentedTabs';
import { useReducedMotion, useAnimatedValue } from '../../components/motion';
import { fetchMatchDetail } from '../../rizespor/api';
import { clock, dayLabel, longKickoff, shortName } from '../../rizespor/format';
import { awaitingKickoff, detectMoments, liveMinute, matchProgress, momentText, pollDelay } from '../../rizespor/live';
import { CLUB_COLORS, RIZESPOR_ID, STAT_GROUPS, shortTeamName } from '../../rizespor/names';
import type { FormGame, Lineup, LineupPlayer, Match, MatchDetail, MatchEvent, StandingRow, TeamStat } from '../../rizespor/parse';
import { useTheme } from '../../theme';
import Celebration, { celebrationFor, type CelebrationData } from './Celebration';
import Pitch from './Pitch';
import { LivePulse, ProgressBar, RESULT_COLORS, ResultPill, useNow } from './shared';

type Tab = 'summary' | 'lineups' | 'stats' | 'rivalry';

const TABS: Segment<Tab>[] = [
  { id: 'summary', label: 'Özet', icon: 'pulse-outline' },
  { id: 'lineups', label: 'Kadro', icon: 'shirt-outline' },
  { id: 'stats', label: 'İstatistik', icon: 'stats-chart-outline' },
  { id: 'rivalry', label: 'Rekabet', icon: 'git-compare-outline' },
];

const EVENT_ICON: Record<MatchEvent['kind'], string> = {
  goal: '⚽',
  'own-goal': '⚽',
  penalty: '⚽',
  yellow: '🟨',
  red: '🟥',
  sub: '🔁',
  other: '•',
};

export default function MatchCenter({ match, standings = [], onClose }: { match: Match | null; standings?: StandingRow[]; onClose: () => void }) {
  return (
    <Modal visible={match !== null} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {match ? <MatchCenterBody initial={match} standings={standings} onClose={onClose} /> : null}
    </Modal>
  );
}

const isGoal = (e: MatchEvent) => e.kind === 'goal' || e.kind === 'penalty' || e.kind === 'own-goal';

/** Kendi kalesine gol, golü atan takımın değil rakibin hanesine yazılır. */
function scorerTeam(e: MatchEvent, m: Match): string | null {
  if (e.kind !== 'own-goal') return e.teamId;
  return e.teamId === m.home.id ? m.away.id : e.teamId === m.away.id ? m.home.id : null;
}

function MatchCenterBody({ initial, standings, onClose }: { initial: Match; standings: StandingRow[]; onClose: () => void }) {
  const { colors, fs } = useTheme();
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number>(() => Date.now());
  const [tab, setTab] = useState<Tab>(initial.state === 'pre' ? 'rivalry' : 'summary');
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const prevDetail = useRef<MatchDetail | null>(null);
  const celebrationId = useRef(0);
  const scoreBump = useAnimatedValue(1);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  const match = detail?.match ?? initial;
  const live = match.state === 'in';
  const now = useNow(1000, live && match.running);
  const slowNow = useNow(30_000);

  const load = useCallback(async () => {
    try {
      const d = await fetchMatchDetail(initial.id);
      const prev = prevDetail.current;
      prevDetail.current = d;
      setDetail(d);
      setError(null);
      setFetchedAt(Date.now());
      if (!prev) return;

      // Gol, düdük ve kırmızı kart anları.
      const moments = detectMoments([prev.match], [d.match]);
      const seen = new Set(prev.events.map((e) => e.id));
      const newRed = d.events.find((e) => e.kind === 'red' && !seen.has(e.id));
      const goal = [...moments].reverse().find((m) => m.kind === 'goal');
      const moment = goal ?? moments[moments.length - 1];
      if (moment) {
        let detailText: string | undefined;
        if (moment.kind === 'goal') {
          const teamId = moment.side === 'home' ? d.match.home.id : d.match.away.id;
          const last = [...d.events].reverse().find((e) => isGoal(e) && scorerTeam(e, d.match) === teamId);
          if (last?.player) detailText = `${last.player} ${last.minute}${last.kind === 'penalty' ? ' (P)' : last.kind === 'own-goal' ? ' (K.K.)' : ''}`;
          Animated.sequence([
            Animated.spring(scoreBump, { toValue: 1.35, useNativeDriver: true, speed: 20, bounciness: 12 }),
            Animated.spring(scoreBump, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
          ]).start();
        }
        celebrationId.current += 1;
        setCelebration(celebrationFor(moment, momentText(moment), celebrationId.current, detailText));
      } else if (newRed) {
        const team = newRed.teamId === d.match.home.id ? d.match.home.name : d.match.away.name;
        celebrationId.current += 1;
        setCelebration({ id: celebrationId.current, kind: 'red', title: `Kırmızı kart · ${newRed.minute}`, body: `${newRed.player ?? ''} (${team})` });
      }
    } catch {
      setError('Maç bilgisi alınamadı. İnternet bağlantınızı kontrol edin.');
    }
  }, [initial.id, scoreBump]);

  useEffect(() => {
    // Açılışta maç ayrıntısını indir (veri çekme deseni; setState await sonrasında).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      setAppActive(s === 'active');
      if (s === 'active') load();
    });
    return () => sub.remove();
  }, [load]);

  // Maç penceresinde 20 sn, maça 3 saatten az kala 5 dk'da bir; uygulama arka plandayken durur.
  const delay = pollDelay([match], slowNow);
  useEffect(() => {
    if (delay === null || !appActive) return;
    const t = setInterval(load, delay);
    return () => clearInterval(t);
  }, [appActive, delay, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);
  const endCelebration = useCallback(() => setCelebration(null), []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        header: { paddingHorizontal: 16, paddingBottom: 16 },
        topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
        close: {
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.18)',
        },
        league: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), fontWeight: '800', letterSpacing: 1 },
        board: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
        team: { flex: 1, alignItems: 'center', gap: 6 },
        crest: {
          width: 46,
          height: 46,
          borderRadius: 23,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.35)',
        },
        crestUs: { backgroundColor: '#FFFFFF' },
        crestText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '900' },
        crestTextUs: { color: CLUB_COLORS.greenDark },
        teamName: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '800', textAlign: 'center' },
        center: { width: fs(124), alignItems: 'center', gap: 4, paddingTop: 4 },
        score: { color: '#FFFFFF', fontSize: fs(44), fontWeight: '900', fontVariant: ['tabular-nums'] },
        vs: { color: '#FFFFFF', fontSize: fs(24), fontWeight: '900' },
        statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
        statusLive: { backgroundColor: 'rgba(255,59,48,0.9)' },
        status: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '900', fontVariant: ['tabular-nums'] },
        meta: { color: 'rgba(255,255,255,0.85)', fontSize: fs(12), textAlign: 'center', marginTop: 12 },
        tabs: { backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 40 },
        muted: { color: colors.textMuted, fontSize: fs(14), textAlign: 'center', lineHeight: fs(20) },
        error: { color: colors.error, fontSize: fs(14), textAlign: 'center', marginBottom: 10 },
        updated: { color: colors.textMuted, fontSize: fs(12), textAlign: 'center', marginTop: 16 },
        disclaimer: { color: colors.textMuted, fontSize: fs(11), textAlign: 'center', marginTop: 6, lineHeight: fs(16) },
      }),
    [colors, fs],
  );

  const homeGoals = detail?.events.filter((e) => isGoal(e) && scorerTeam(e, match) === match.home.id) ?? [];
  const awayGoals = detail?.events.filter((e) => isGoal(e) && scorerTeam(e, match) === match.away.id) ?? [];
  const elapsed = now - fetchedAt;
  const minute = liveMinute(match, elapsed);
  const waiting = awaitingKickoff(match, slowNow);

  const crest = (id: string, abbr: string) => (
    <View style={[styles.crest, id === RIZESPOR_ID && styles.crestUs]}>
      <Text style={[styles.crestText, id === RIZESPOR_ID && styles.crestTextUs]}>{abbr.slice(0, 3) || '?'}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[CLUB_COLORS.greenDark, CLUB_COLORS.blueDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {live ? <LiveGlow /> : null}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.topBar}>
            <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Kapat" hitSlop={10}>
              <Icon name="close" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.league}>SÜPER LİG</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.board}>
            <View style={styles.team}>
              {crest(match.home.id, match.home.abbr)}
              <Text style={styles.teamName} numberOfLines={2}>
                {match.home.name}
              </Text>
              <GoalList events={homeGoals} />
            </View>
            <View style={styles.center}>
              {match.state === 'pre' ? (
                <Text style={styles.vs}>{clock(match.date)}</Text>
              ) : (
                <Animated.Text
                  style={[styles.score, { transform: [{ scale: scoreBump }] }]}
                  accessibilityLabel={`Skor ${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}
                >
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </Animated.Text>
              )}
              <View style={[styles.statusRow, live && styles.statusLive]}>
                {live ? <LivePulse color="#FFFFFF" size={7} /> : null}
                <Text style={styles.status}>
                  {match.state === 'pre' ? (waiting ? 'Başlamak üzere' : match.status || dayLabel(match.date)) : live ? minute : match.status}
                </Text>
              </View>
            </View>
            <View style={styles.team}>
              {crest(match.away.id, match.away.abbr)}
              <Text style={styles.teamName} numberOfLines={2}>
                {match.away.name}
              </Text>
              <GoalList events={awayGoals} />
            </View>
          </View>
          {live ? <ProgressBar progress={matchProgress(match, elapsed)} /> : null}
          <Text style={styles.meta}>
            {longKickoff(match.date)}
            {match.venue ? ` · ${match.venue}` : ''}
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.tabs}>
        <SegmentedTabs segments={TABS} value={tab} onChange={setTab} activeColor={CLUB_COLORS.green} />
      </View>

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
            {tab === 'summary' ? <SummaryTab detail={detail} match={match} live={live} elapsed={elapsed} waiting={waiting} /> : null}
            {tab === 'lineups' ? <LineupsTab detail={detail} match={match} live={live} /> : null}
            {tab === 'stats' ? <StatsTab detail={detail} match={match} live={live} /> : null}
            {tab === 'rivalry' ? <RivalryTab detail={detail} match={match} standings={standings} /> : null}
          </>
        ) : null}

        <Text style={styles.updated}>
          {live ? 'Canlı · 20 saniyede bir güncellenir · ' : ''}Son güncelleme: {new Date(fetchedAt).toLocaleTimeString('tr-TR')}
        </Text>
        <Text style={styles.disclaimer}>Veriler ESPN’den alınır; kulübün veya TFF’nin resmî verisi değildir ve gecikmeli olabilir.</Text>
      </ScrollView>

      {celebration ? <Celebration data={celebration} onDone={endCelebration} /> : null}
    </View>
  );
}

// ——— Başlık parçaları ———

/** Canlı maçta tabelanın arkasında yavaşça nefes alan kırmızımsı parıltı. */
function LiveGlow() {
  const reduced = useReducedMotion();
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.22] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <LinearGradient colors={['rgba(255,80,60,0)', 'rgba(255,80,60,0.9)']} start={{ x: 0.5, y: 0.3 }} end={{ x: 0.5, y: 1.2 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function GoalList({ events }: { events: MatchEvent[] }) {
  const { fs } = useTheme();
  if (events.length === 0) return null;
  return (
    <View style={{ alignItems: 'center' }}>
      {events.map((e) => (
        <Text key={e.id} style={{ color: 'rgba(255,255,255,0.88)', fontSize: fs(11) }} numberOfLines={1}>
          ⚽ {e.player ? shortName(e.player) : ''} {e.minute}
          {e.kind === 'penalty' ? ' (P)' : e.kind === 'own-goal' ? ' (K.K.)' : ''}
        </Text>
      ))}
    </View>
  );
}

// ——— Özet ———

function SummaryTab({ detail, match, live, elapsed, waiting }: { detail: MatchDetail; match: Match; live: boolean; elapsed: number; waiting: boolean }) {
  const { colors, fs } = useTheme();
  const info: [string, string][] = [
    ['Başlama', longKickoff(match.date)],
    ...(match.venue ? ([['Stadyum', match.venue]] as [string, string][]) : []),
    ...(detail.referee ? ([['Hakem', detail.referee]] as [string, string][]) : []),
    ...(detail.attendance ? ([['Seyirci', detail.attendance.toLocaleString('tr-TR')]] as [string, string][]) : []),
  ];
  return (
    <>
      {match.state === 'pre' ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: fs(14), textAlign: 'center', lineHeight: fs(20) }}>
            {waiting
              ? 'Başlama düdüğü bekleniyor. Maç başladığı anda skor ve dakika burada canlı akar.'
              : `Maç henüz başlamadı. Başlama saati ${clock(match.date)}; kadrolar genellikle maçtan yaklaşık bir saat önce açıklanır. Rekabet bölümünde iki takımın formuna bakabilirsiniz.`}
          </Text>
        </Card>
      ) : null}

      {match.state !== 'pre' && detail.events.length > 0 ? (
        <>
          <SectionTitle hint="Goller ve kartlar dakikasıyla">Maç akışı</SectionTitle>
          <Card>
            <MatchFlow events={detail.events} match={match} progress={matchProgress(match, elapsed)} />
          </Card>
          <SectionTitle hint={live ? 'En yeni en üstte' : undefined}>Maç anları</SectionTitle>
          <Card>
            <Timeline events={detail.events} match={match} live={live} />
          </Card>
        </>
      ) : match.state !== 'pre' ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: colors.textMuted, fontSize: fs(14), textAlign: 'center' }}>Henüz gol, kart ya da oyuncu değişikliği yok.</Text>
        </Card>
      ) : null}

      <SectionTitle>Maç bilgileri</SectionTitle>
      <Card style={{ gap: 10 }}>
        {info.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ color: colors.textMuted, fontSize: fs(14) }}>{k}</Text>
            <Text style={{ color: colors.text, fontSize: fs(14), fontWeight: '700', flexShrink: 1, textAlign: 'right' }}>{v}</Text>
          </View>
        ))}
      </Card>
    </>
  );
}

/** Yatay maç şeridi: ev sahibinin anları üstte, deplasmanınki altta; oynanan kısım dolu. */
function MatchFlow({ events, match, progress }: { events: MatchEvent[]; match: Match; progress: number }) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const marks = events.filter((e) => isGoal(e) || e.kind === 'red' || e.kind === 'yellow');
  const span = Math.max(5400, ...marks.map((e) => e.order + 60));
  const pop = useAnimatedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) Animated.timing(pop, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  }, [pop, reduced]);
  const homeColor = match.home.id === RIZESPOR_ID ? CLUB_COLORS.green : CLUB_COLORS.blue;
  const awayColor = match.away.id === RIZESPOR_ID ? CLUB_COLORS.green : '#8A94A6';
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Text style={{ color: colors.textMuted, fontSize: fs(11), fontWeight: '700' }} numberOfLines={1}>
        {shortTeamName(match.home.name)}
      </Text>
      <View style={{ height: 82, justifyContent: 'center' }}>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round((match.state === 'post' ? 1 : (progress * 5400) / span) * 100)}%`, height: '100%', backgroundColor: CLUB_COLORS.green, opacity: 0.5 }} />
        </View>
        <View style={{ position: 'absolute', left: (width * 2700) / span - 1, top: 26, height: 30, width: 2, backgroundColor: colors.textMuted, opacity: 0.5 }} />
        {width > 0
          ? marks.map((e) => {
              const team = isGoal(e) ? scorerTeam(e, match) : e.teamId;
              const top = team === match.home.id;
              const left = Math.min(width - 20, Math.max(0, (e.order / span) * width - 10));
              const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
              return (
                <Animated.View
                  key={e.id}
                  style={{ position: 'absolute', left, top: top ? 4 : 50, width: 20, alignItems: 'center', opacity: pop, transform: [{ scale }] }}
                  accessibilityLabel={`${e.minute} ${e.player ?? ''}`}
                >
                  {!top ? <View style={{ width: 2, height: 8, backgroundColor: awayColor }} /> : null}
                  {isGoal(e) ? (
                    <Text style={{ fontSize: 15 }}>⚽</Text>
                  ) : (
                    <View style={{ width: 10, height: 14, borderRadius: 2, backgroundColor: e.kind === 'red' ? '#E53935' : '#FDD835' }} />
                  )}
                  {top ? <View style={{ width: 2, height: 8, backgroundColor: homeColor }} /> : null}
                </Animated.View>
              );
            })
          : null}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: fs(11), fontWeight: '700' }} numberOfLines={1}>
        {shortTeamName(match.away.name)}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {["0'", "45'", "90'"].map((l) => (
          <Text key={l} style={{ color: colors.textMuted, fontSize: fs(10) }}>
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

type TimelineItem = { type: 'event'; event: MatchEvent } | { type: 'divider'; key: string; label: string };

/** Anlar + devre ayraçları ("Devre arası · 1-0"). Canlıda en yeni en üstte. */
function timelineItems(events: MatchEvent[], match: Match, live: boolean): TimelineItem[] {
  const items: TimelineItem[] = [{ type: 'divider', key: 'start', label: 'Başlama düdüğü' }];
  let h = 0;
  let a = 0;
  let htShown = false;
  const halftime = () => {
    items.push({ type: 'divider', key: 'ht', label: `Devre arası · ${h}-${a}` });
    htShown = true;
  };
  for (const e of events) {
    if (!htShown && e.period >= 2) halftime();
    items.push({ type: 'event', event: e });
    if (isGoal(e)) {
      if (scorerTeam(e, match) === match.home.id) h++;
      else a++;
    }
  }
  const secondHalfStarted = (match.period ?? 0) >= 2 || match.state === 'post';
  if (!htShown && (secondHalfStarted || match.status === 'Devre arası')) halftime();
  if (match.state === 'post') items.push({ type: 'divider', key: 'ft', label: `Maç sonu · ${match.homeScore ?? h}-${match.awayScore ?? a}` });
  return live ? items.reverse() : items;
}

function Timeline({ events, match, live }: { events: MatchEvent[]; match: Match; live: boolean }) {
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
        side: { flex: 1 },
        left: { alignItems: 'flex-end', paddingRight: 10 },
        right: { alignItems: 'flex-start', paddingLeft: 10 },
        minuteWrap: { width: 54, alignItems: 'center' },
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
        minuteGoal: { backgroundColor: CLUB_COLORS.green, color: '#FFFFFF' },
        rail: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, backgroundColor: colors.border },
        main: { fontSize: fs(14), color: colors.text, fontWeight: '700' },
        goalText: { fontWeight: '900' },
        sub: { fontSize: fs(12), color: colors.textMuted },
        divider: { alignSelf: 'center', marginVertical: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        dividerText: { color: colors.textMuted, fontSize: fs(12), fontWeight: '800' },
      }),
    [colors, fs],
  );

  return (
    <View>
      <View style={styles.rail} />
      {timelineItems(events, match, live).map((item) => {
        if (item.type === 'divider') {
          return (
            <View key={item.key} style={styles.divider}>
              <Text style={styles.dividerText}>{item.label}</Text>
            </View>
          );
        }
        const e = item.event;
        const home = (isGoal(e) ? scorerTeam(e, match) : e.teamId) === match.home.id;
        const align = { textAlign: home ? 'right' : 'left' } as const;
        const subLine =
          e.kind === 'sub' && e.playerOut
            ? `Çıkan: ${e.playerOut}`
            : e.kind === 'penalty'
              ? 'Penaltı'
              : e.kind === 'own-goal'
                ? 'Kendi kalesine'
                : e.assist
                  ? `Asist: ${e.assist}`
                  : null;
        const content = (
          <View style={[styles.side, home ? styles.left : styles.right]}>
            <Text style={[styles.main, isGoal(e) && styles.goalText, align]} numberOfLines={2}>
              {home ? `${e.player ?? ''} ${EVENT_ICON[e.kind]}` : `${EVENT_ICON[e.kind]} ${e.player ?? ''}`}
            </Text>
            {subLine ? (
              <Text style={[styles.sub, align]} numberOfLines={2}>
                {subLine}
              </Text>
            ) : null}
          </View>
        );
        return (
          <FadeRow key={e.id}>
            <View style={styles.row}>
              {home ? content : <View style={styles.side} />}
              <View style={styles.minuteWrap}>
                <Text style={[styles.minute, isGoal(e) && styles.minuteGoal]}>{e.minute}</Text>
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
  const v = useAnimatedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduced, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  return <Animated.View style={{ opacity: v, transform: [{ translateY }] }}>{children}</Animated.View>;
}

// ——— Kadrolar ———

type Standout = { player: LineupPlayer; team: string; us: boolean; line: string; score: number };

/** Maçın öne çıkan oyuncuları: gol, asist, kurtarış ve isabetli şuta göre. */
function standouts(detail: MatchDetail): Standout[] {
  const out: Standout[] = [];
  for (const lineup of [detail.lineups.home, detail.lineups.away]) {
    if (!lineup) continue;
    const team = lineup.teamId === detail.match.home.id ? detail.match.home.name : detail.match.away.name;
    for (const p of [...lineup.starters, ...lineup.bench]) {
      const parts: string[] = [];
      if (p.goals) parts.push(`${p.goals} gol`);
      if (p.assists) parts.push(`${p.assists} asist`);
      if (p.saves >= 3) parts.push(`${p.saves} kurtarış`);
      if (p.shotsOnTarget >= 2) parts.push(`${p.shotsOnTarget} isabetli şut`);
      if (parts.length === 0) continue;
      out.push({ player: p, team, us: lineup.teamId === RIZESPOR_ID, line: parts.join(' · '), score: p.goals * 10 + p.assists * 6 + p.saves + p.shotsOnTarget });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 6);
}

function LineupsTab({ detail, match, live }: { detail: MatchDetail; match: Match; live: boolean }) {
  const { colors, fs } = useTheme();
  const { home, away } = detail.lineups;
  if (!home && !away) {
    return (
      <Card style={{ marginTop: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: fs(14), textAlign: 'center', lineHeight: fs(20) }}>
          Kadrolar henüz açıklanmadı. İlk 11’ler genellikle maçtan yaklaşık bir saat önce gelir; bu sayfa açıkken kendiliğinden yenilenir.
        </Text>
      </Card>
    );
  }
  const best = standouts(detail);
  return (
    <>
      <SectionTitle hint={`${shortTeamName(match.home.name)} altta`}>İlk 11’ler</SectionTitle>
      <Pitch home={home} away={away} live={live} />
      {best.length > 0 ? (
        <>
          <SectionTitle>Öne çıkanlar</SectionTitle>
          <Card style={{ gap: 12 }}>
            {best.map((s) => (
              <View key={`${s.team}-${s.player.name}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: s.us ? CLUB_COLORS.blue : colors.border,
                    borderWidth: 2,
                    borderColor: s.us ? CLUB_COLORS.green : colors.border,
                  }}
                >
                  <Text style={{ color: s.us ? '#FFFFFF' : colors.text, fontWeight: '900', fontSize: fs(12) }}>{s.player.jersey ?? ''}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: fs(14) }} numberOfLines={1}>
                    {s.player.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fs(12) }} numberOfLines={1}>
                    {shortTeamName(s.team)} · {s.line}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      ) : null}
      <SectionTitle hint="↑ oyuna giren">Yedekler</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[home, away].map((l, i) => (l ? <BenchList key={i} lineup={l} name={i === 0 ? match.home.name : match.away.name} /> : null))}
      </View>
    </>
  );
}

function BenchList({ lineup, name }: { lineup: Lineup; name: string }) {
  const { colors, fs } = useTheme();
  const us = lineup.teamId === RIZESPOR_ID;
  return (
    <Card style={{ flex: 1, gap: 6, padding: 12 }}>
      <Text style={{ color: us ? CLUB_COLORS.green : colors.text, fontWeight: '900', fontSize: fs(13) }} numberOfLines={1}>
        {shortTeamName(name)}
      </Text>
      {lineup.bench.length === 0 ? <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>Bilgi yok</Text> : null}
      {lineup.bench.map((p) => (
        <Text key={p.name} style={{ color: p.subbedIn ? colors.text : colors.textMuted, fontSize: fs(12), fontWeight: p.subbedIn ? '800' : '500' }} numberOfLines={1}>
          {p.jersey ? `${p.jersey}  ` : ''}
          {shortName(p.name)}
          {p.subbedIn ? ' ↑' : ''}
          {p.goals ? ` ⚽${p.goals > 1 ? `×${p.goals}` : ''}` : ''}
        </Text>
      ))}
    </Card>
  );
}

// ——— İstatistik ———

function StatsTab({ detail, match, live }: { detail: MatchDetail; match: Match; live: boolean }) {
  const { colors, fs } = useTheme();
  if (detail.stats.length === 0) {
    return (
      <Card style={{ marginTop: 16 }}>
        <Text style={{ color: colors.textMuted, fontSize: fs(14), textAlign: 'center' }}>İstatistikler maç başladığında gelir.</Text>
      </Card>
    );
  }
  const homeIsUs = match.home.id === RIZESPOR_ID;
  const awayIsUs = match.away.id === RIZESPOR_ID;
  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 4 }}>
        <Text style={{ color: homeIsUs ? CLUB_COLORS.green : colors.text, fontWeight: '900', fontSize: fs(14) }}>{shortTeamName(match.home.name)}</Text>
        <Text style={{ color: awayIsUs ? CLUB_COLORS.green : colors.text, fontWeight: '900', fontSize: fs(14) }}>{shortTeamName(match.away.name)}</Text>
      </View>
      {STAT_GROUPS.map((g) => {
        const stats = detail.stats.filter((s) => s.group === g.id);
        if (stats.length === 0) return null;
        return (
          <View key={g.id}>
            <SectionTitle hint={live && g.id === 'attack' ? 'Canlı' : undefined}>{g.label}</SectionTitle>
            <Card>
              <StatBars stats={stats} homeIsUs={homeIsUs} awayIsUs={awayIsUs} />
            </Card>
          </View>
        );
      })}
    </>
  );
}

function StatBars({ stats, homeIsUs, awayIsUs }: { stats: TeamStat[]; homeIsUs: boolean; awayIsUs: boolean }) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const grow = useAnimatedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) Animated.timing(grow, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [grow, reduced]);

  const homeColor = homeIsUs ? CLUB_COLORS.green : CLUB_COLORS.blue;
  const awayColor = awayIsUs ? CLUB_COLORS.green : '#8A94A6';

  return (
    <View style={{ gap: 14 }}>
      {stats.map((s) => {
        const total = s.home + s.away;
        const hp = total > 0 ? s.home / total : 0.5;
        const fmt = (n: number) => (s.percent ? `%${Math.round(n)}` : String(n));
        const hw = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${hp * 100}%`] });
        const aw = grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${(1 - hp) * 100}%`] });
        const homeLeads = s.home > s.away;
        const awayLeads = s.away > s.home;
        return (
          <View key={s.key} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: homeLeads ? '900' : '600', fontSize: fs(14), width: 56 }}>{fmt(s.home)}</Text>
              <Text style={{ color: colors.textMuted, fontWeight: '600', fontSize: fs(13) }}>{s.label}</Text>
              <Text style={{ color: colors.text, fontWeight: awayLeads ? '900' : '600', fontSize: fs(14), width: 56, textAlign: 'right' }}>{fmt(s.away)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, height: 8 }}>
              <View style={{ flex: 1, alignItems: 'flex-end', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <Animated.View style={{ width: hw, height: '100%', backgroundColor: homeColor, borderRadius: 4, opacity: homeLeads || !awayLeads ? 1 : 0.55 }} />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-start', backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <Animated.View style={{ width: aw, height: '100%', backgroundColor: awayColor, borderRadius: 4, opacity: awayLeads || !homeLeads ? 1 : 0.55 }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ——— Rekabet ———

function RivalryTab({ detail, match, standings }: { detail: MatchDetail; match: Match; standings: StandingRow[] }) {
  const { colors, fs } = useTheme();
  const rows = [match.home, match.away].map((t) => standings.find((r) => r.team.id === t.id) ?? null);
  // Önceki karşılaşmaların özeti Rizespor açısından (Rizespor yoksa ev sahibi açısından).
  const focus = match.away.id === RIZESPOR_ID ? match.away.id : match.home.id;
  const tally = { G: 0, B: 0, M: 0 };
  for (const g of detail.h2h) {
    const us = g.home.id === focus ? g.homeScore : g.awayScore;
    const them = g.home.id === focus ? g.awayScore : g.homeScore;
    tally[us > them ? 'G' : us === them ? 'B' : 'M']++;
  }
  const focusName = focus === match.home.id ? match.home.name : match.away.name;
  const text = { color: colors.text, fontSize: fs(14) } as const;
  const muted = { color: colors.textMuted, fontSize: fs(12) } as const;

  return (
    <>
      {rows.some(Boolean) ? (
        <>
          <SectionTitle hint="Süper Lig">Puan durumu</SectionTitle>
          <Card style={{ gap: 10 }}>
            {rows.map((r, i) =>
              r ? (
                <View key={r.team.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={[text, { width: 30, fontWeight: '900', textAlign: 'center' }]}>{r.rank}.</Text>
                  <Text style={[text, { flex: 1, fontWeight: r.team.id === RIZESPOR_ID ? '900' : '700', color: r.team.id === RIZESPOR_ID ? CLUB_COLORS.green : colors.text }]} numberOfLines={1}>
                    {r.team.name}
                  </Text>
                  <Text style={muted}>
                    {r.played} maç · {r.won}G {r.drawn}B {r.lost}M
                  </Text>
                  <Text style={[text, { fontWeight: '900', minWidth: 44, textAlign: 'right' }]}>{r.points} P</Text>
                </View>
              ) : (
                <Text key={i} style={muted}>
                  Puan durumu bilgisi yok
                </Text>
              ),
            )}
          </Card>
        </>
      ) : null}

      <SectionTitle hint="Bu maçtan önce, yeniden eskiye">Son 5 maç</SectionTitle>
      <Card style={{ gap: 16 }}>
        <FormBlock name={match.home.name} us={match.home.id === RIZESPOR_ID} games={detail.form.home} />
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
        <FormBlock name={match.away.name} us={match.away.id === RIZESPOR_ID} games={detail.form.away} />
      </Card>

      <SectionTitle hint={detail.h2h.length ? `Son ${detail.h2h.length} karşılaşma` : undefined}>Önceki karşılaşmalar</SectionTitle>
      <Card style={{ gap: 12 }}>
        {detail.h2h.length === 0 ? (
          <Text style={[muted, { textAlign: 'center' }]}>Bu iki takımın yakın geçmişte karşılaşma kaydı yok.</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['G', 'B', 'M'] as const).map((k) => (
                <View key={k} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: `${RESULT_COLORS[k]}22` }}>
                  <Text style={{ color: RESULT_COLORS[k], fontSize: fs(22), fontWeight: '900' }}>{tally[k]}</Text>
                  <Text style={muted}>{k === 'G' ? `${shortTeamName(focusName)} kazandı` : k === 'B' ? 'Berabere' : 'Rakip kazandı'}</Text>
                </View>
              ))}
            </View>
            {detail.h2h.map((g) => (
              <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={[muted, { width: 78 }]}>{`${g.date.getDate()}.${g.date.getMonth() + 1}.${g.date.getFullYear()}`}</Text>
                <Text style={[text, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                  {shortTeamName(g.home.name)}
                </Text>
                <Text style={[text, { fontWeight: '900', width: 44, textAlign: 'center' }]}>
                  {g.homeScore}-{g.awayScore}
                </Text>
                <Text style={[text, { flex: 1 }]} numberOfLines={1}>
                  {shortTeamName(g.away.name)}
                </Text>
              </View>
            ))}
          </>
        )}
      </Card>
    </>
  );
}

function FormBlock({ name, us, games }: { name: string; us: boolean; games: FormGame[] }) {
  const { colors, fs } = useTheme();
  const points = games.reduce((n, g) => n + (g.result === 'G' ? 3 : g.result === 'B' ? 1 : 0), 0);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: us ? CLUB_COLORS.green : colors.text, fontWeight: '900', fontSize: fs(14) }} numberOfLines={1}>
          {name}
        </Text>
        {games.length ? <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>{points} puan / {games.length * 3}</Text> : null}
      </View>
      {games.length === 0 ? <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>Bilgi yok</Text> : null}
      {games.map((g) => (
        <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ResultPill result={g.result} size={22} />
          <Text style={{ color: colors.text, fontSize: fs(13), fontWeight: '800', width: 36 }}>
            {g.goalsFor}-{g.goalsAgainst}
          </Text>
          <Text style={{ color: colors.text, fontSize: fs(13), flex: 1 }} numberOfLines={1}>
            {g.home ? '' : '@ '}
            {g.opponent}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fs(12) }}>{dayLabel(g.date)}</Text>
        </View>
      ))}
    </View>
  );
}
