import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';

import { FadeInView } from '../components/motion';
import { HeroSkeleton } from '../components/Skeleton';
import StadiumScene from '../components/StadiumScene';
import { SegmentedTabs, type Segment } from '../components/SegmentedTabs';
import { PrimaryButton } from '../components/ui';
import { fetchClubData, fetchScoreboard, loadCachedClubData, mergeClubData, type ClubData } from '../rizespor/api';
import { LIVE_POLL_MS, detectMoments, inMatchWindow, momentText, pollDelay, type LiveMoment } from '../rizespor/live';
import { CLUB_COLORS } from '../rizespor/names';
import { GLASS, STADIUM_CHROME } from '../rizespor/stadium';
import type { Match } from '../rizespor/parse';
import { syncMatchReminders } from '../rizespor/reminders';
import { useTheme } from '../theme';
import Celebration, { celebrationFor, type CelebrationData } from './rizespor/Celebration';
import MatchCenter from './rizespor/MatchCenter';
import { MatchesView, SquadView, StandingsView } from './rizespor/views';

type Section = 'matches' | 'table' | 'squad';

const SECTIONS: Segment<Section>[] = [
  { id: 'matches', label: 'Maçlar', icon: 'football-outline' },
  { id: 'table', label: 'Puan', icon: 'stats-chart-outline' },
  { id: 'squad', label: 'Kadro', icon: 'shirt-outline' },
];

const EMPTY: ClubData = { results: [], fixtures: [], standings: [], roster: [], today: [] };
/** Sekmeye dönüldüğünde veri bundan eskiyse yenilenir. */
const STALE_MS = 2 * 60_000;
/** Maç penceresinde tüm kulüp verisi (puan durumu, kadro) bu aralıkla; arada yalnızca skor tablosu. */
const FULL_REFRESH_MS = 5 * 60_000;
/** Bu süreden uzun aradan sonra gelen değişiklikler kutlanmaz (eski golü yeni gibi göstermemek için). */
const CELEBRATE_WITHIN_MS = 3 * 60_000;

const allMatches = (d: ClubData) => [...d.fixtures, ...d.results];

/** Aynı anda gelen anlardan gösterilecek olan: Rizespor golü > maç sonu > diğerleri; en sonuncusu. */
function pickMoment(moments: LiveMoment[]): LiveMoment | null {
  if (moments.length === 0) return null;
  const rank = (m: LiveMoment) => (m.kind === 'goal' && m.us ? 3 : m.kind === 'fulltime' ? 2 : m.kind === 'goal' ? 1 : 0);
  return moments.reduce((best, m) => (rank(m) >= rank(best) ? m : best));
}

export default function RizesporScreen({ openMatchId, active = true }: { openMatchId?: string | null; active?: boolean }) {
  const { fs } = useTheme();
  const [section, setSection] = useState<Section>('matches');
  const [visited, setVisited] = useState<Set<Section>>(() => new Set(['matches']));
  const [data, setData] = useState<ClubData>(EMPTY);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [openMatch, setOpenMatch] = useState<Match | null>(null);
  // Bildirimden gelinen maç, kullanıcı kapatana kadar açık kalır.
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [now, setNow] = useState(() => Date.now());
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [cheer, setCheer] = useState(0);
  const [dataAt, setDataAt] = useState(() => Date.now());

  const dataRef = useRef<ClubData>(EMPTY);
  /** Son başarılı ağ yüklemesi (önbellekten açılış sayılmaz). */
  const lastNetworkAt = useRef(0);
  const lastFullAt = useRef(0);
  const celebrationId = useRef(0);
  const matchCenterOpen = useRef(false);

  /** Yeni veriyi işler; önceki ağ yüklemesine göre değişen anları kutlar. */
  const commit = useCallback((fresh: Partial<ClubData>) => {
    const prev = dataRef.current;
    const next = mergeClubData(prev, fresh);
    dataRef.current = next;
    setData(next);
    setNow(Date.now());
    setDataAt(Date.now());
    const recent = lastNetworkAt.current > 0 && Date.now() - lastNetworkAt.current < CELEBRATE_WITHIN_MS;
    lastNetworkAt.current = Date.now();
    if (!recent || matchCenterOpen.current) return;
    const moment = pickMoment(detectMoments(allMatches(prev), allMatches(next)));
    if (!moment) return;
    celebrationId.current += 1;
    setCelebration(celebrationFor(moment, momentText(moment), celebrationId.current));
    if (moment.kind === 'goal' && moment.us) setCheer((c) => c + 1);
  }, []);

  const load = useCallback(async () => {
    try {
      const fresh = await fetchClubData();
      lastFullAt.current = Date.now();
      commit(fresh);
      setState('ready');
      // Fikstür değiştiyse maç hatırlatmalarını tazele (ayar kapalıysa bir şey yapmaz).
      if (fresh.fixtures) syncMatchReminders(fresh.fixtures).catch(() => {});
    } catch {
      setState((s) => (s === 'ready' ? s : 'error'));
    }
  }, [commit]);

  /** Canlı yenileme: çoğunlukla yalnızca günün skor tablosu (tek, hafif istek). */
  const loadLive = useCallback(async () => {
    if (Date.now() - lastFullAt.current >= FULL_REFRESH_MS) return load();
    try {
      commit({ today: await fetchScoreboard() });
    } catch {
      // Bir sonraki turda yeniden denenir.
    }
  }, [commit, load]);

  useEffect(() => {
    loadCachedClubData().then((cached) => {
      if ((cached.fixtures.length || cached.results.length) && !dataRef.current.fixtures.length) {
        dataRef.current = cached;
        setData(cached);
        setState((s) => (s === 'loading' ? 'ready' : s));
      }
    });
    // Açılışta veriyi indir (veri çekme deseni; setState await sonrasında).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Uygulama arka plandan dönünce ya da sekmeye geri gelinince veri eskiyse yenile.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setAppActive(s === 'active'));
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (active && appActive && lastNetworkAt.current > 0 && Date.now() - lastNetworkAt.current > STALE_MS) {
      load();
    }
  }, [active, appActive, load]);

  // Saat ilerledikçe (ör. başlama saatine 15 dk kala) yenileme planı değişir: dakikada bir yeniden hesapla.
  useEffect(() => {
    if (!active || !appActive) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [active, appActive]);

  // Maç penceresinde 20 sn'de bir skor tablosu; maça 3 saatten az kala 5 dk'da bir tam yenileme.
  // (Skor tablosundaki Rizespor maçı mergeClubData ile fikstüre zaten işlenir.)
  const delay = pollDelay(allMatches(data), now);
  useEffect(() => {
    if (!active || !appActive || delay === null) return;
    const t = setInterval(delay === LIVE_POLL_MS ? loadLive : load, delay);
    return () => clearInterval(t);
  }, [active, appActive, delay, load, loadLive]);

  // Bildirimden gelinmişse ilgili maç (türetilmiş; ayrıca durum tutulmaz).
  // openMatchId = "<maçKimliği>#<bildirimKimliği>"; kapatılan istek yeniden açılmaz.
  const requestedId = openMatchId ? openMatchId.split('#')[0] : null;
  const fromNotification =
    requestedId && openMatchId !== dismissedId ? (allMatches(data).find((x) => x.id === requestedId) ?? null) : null;
  const shownMatch = openMatch ?? fromNotification;
  // Maç merkezi açıkken kutlamayı o yapar (aynı gol iki kez kutlanmasın).
  useEffect(() => {
    matchCenterOpen.current = shownMatch !== null;
  }, [shownMatch]);
  const closeMatch = useCallback(() => {
    setOpenMatch(null);
    if (openMatchId) setDismissedId(openMatchId);
    // Maç merkezinde geçen sürede değişenler burada yeniden kutlanmasın.
    lastNetworkAt.current = 0;
    load();
  }, [load, openMatchId]);

  const endCelebration = useCallback(() => setCelebration(null), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const select = (id: Section) => {
    setSection(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: STADIUM_CHROME.footer },
        page: { flex: 1 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
        error: { color: GLASS.text, fontSize: fs(15), textAlign: 'center', lineHeight: fs(22) },
      }),
    [fs],
  );

  const live = allMatches(data).some((m) => m.state === 'in' || inMatchWindow(m, now));
  const props = { data, now, dataAt, refreshing, onRefresh, onOpenMatch: setOpenMatch };

  return (
    <View style={styles.container}>
      <StadiumScene active={active} live={live} cheer={cheer} />
      <SegmentedTabs segments={SECTIONS} value={section} onChange={select} activeColor={CLUB_COLORS.green} glass />

      {state === 'loading' ? (
        <HeroSkeleton rows={5} />
      ) : state === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.error}>Rizespor verileri alınamadı. İnternet bağlantınızı kontrol edin.</Text>
          <PrimaryButton
            label="Tekrar dene"
            onPress={() => {
              setState('loading');
              load();
            }}
          />
        </View>
      ) : (
        SECTIONS.map((s) =>
          visited.has(s.id) ? (
            <FadeInView key={s.id} visible={section === s.id} style={styles.page}>
              {s.id === 'matches' ? <MatchesView {...props} /> : null}
              {s.id === 'table' ? <StandingsView {...props} /> : null}
              {s.id === 'squad' ? <SquadView {...props} /> : null}
            </FadeInView>
          ) : null,
        )
      )}

      {celebration && active ? <Celebration data={celebration} onDone={endCelebration} /> : null}
      <MatchCenter match={shownMatch} standings={data.standings} onClose={closeMatch} />
    </View>
  );
}
