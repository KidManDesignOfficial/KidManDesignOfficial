import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FadeInView } from '../components/motion';
import { HeroSkeleton } from '../components/Skeleton';
import StadiumScene from '../components/StadiumScene';
import { SegmentedTabs, type Segment } from '../components/SegmentedTabs';
import { PrimaryButton } from '../components/ui';
import { fetchClubData, loadCachedClubData, mergeClubData, type ClubData } from '../rizespor/api';
import { CLUB_COLORS } from '../rizespor/names';
import { GLASS, STADIUM_CHROME } from '../rizespor/stadium';
import type { Match } from '../rizespor/parse';
import { syncMatchReminders } from '../rizespor/reminders';
import { useTheme } from '../theme';
import MatchCenter from './rizespor/MatchCenter';
import { MatchesView, SquadView, StandingsView } from './rizespor/views';

type Section = 'matches' | 'table' | 'squad';

const SECTIONS: Segment<Section>[] = [
  { id: 'matches', label: 'Maçlar', icon: 'football-outline' },
  { id: 'table', label: 'Puan', icon: 'stats-chart-outline' },
  { id: 'squad', label: 'Kadro', icon: 'shirt-outline' },
];

const EMPTY: ClubData = { results: [], fixtures: [], standings: [], roster: [] };
const LIVE_LIST_REFRESH_MS = 60_000;

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

  const load = useCallback(async () => {
    try {
      const fresh = await fetchClubData();
      setData((prev) => mergeClubData(prev, fresh));
      setState('ready');
      // Fikstür değiştiyse maç hatırlatmalarını tazele (ayar kapalıysa bir şey yapmaz).
      if (fresh.fixtures) syncMatchReminders(fresh.fixtures).catch(() => {});
    } catch {
      setState((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => {
    loadCachedClubData().then((cached) => {
      if (cached.fixtures.length || cached.results.length) {
        setData((d) => (d.fixtures.length ? d : cached));
        setState((s) => (s === 'loading' ? 'ready' : s));
      }
    });
    // Açılışta veriyi indir (veri çekme deseni; setState await sonrasında).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Canlı maç varken liste dakikada bir yenilenir.
  const hasLive = data.fixtures.some((m) => m.state === 'in') || data.results.some((m) => m.state === 'in');
  useEffect(() => {
    if (!hasLive) return;
    const t = setInterval(load, LIVE_LIST_REFRESH_MS);
    return () => clearInterval(t);
  }, [hasLive, load]);

  // Bildirimden gelinmişse ilgili maç (türetilmiş; ayrıca durum tutulmaz).
  // openMatchId = "<maçKimliği>#<bildirimKimliği>"; kapatılan istek yeniden açılmaz.
  const requestedId = openMatchId ? openMatchId.split('#')[0] : null;
  const fromNotification =
    requestedId && openMatchId !== dismissedId
      ? ([...data.fixtures, ...data.results].find((x) => x.id === requestedId) ?? null)
      : null;
  const shownMatch = openMatch ?? fromNotification;
  const closeMatch = useCallback(() => {
    setOpenMatch(null);
    if (openMatchId) setDismissedId(openMatchId);
  }, [openMatchId]);

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

  const props = { data, refreshing, onRefresh, onOpenMatch: setOpenMatch };

  return (
    <View style={styles.container}>
      <StadiumScene active={active} />
      <SegmentedTabs segments={SECTIONS} value={section} onChange={select} activeColor={CLUB_COLORS.green} glass />

      {state === 'loading' ? (
        <HeroSkeleton rows={5} />
      ) : state === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.error}>Rizespor verileri alınamadı. İnternet bağlantınızı kontrol edin.</Text>
          <PrimaryButton label="Tekrar dene" onPress={() => { setState('loading'); load(); }} />
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

      <MatchCenter match={shownMatch} onClose={closeMatch} />
    </View>
  );
}
