import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FadeInView } from '../components/motion';
import { SegmentedTabs, type Segment } from '../components/SegmentedTabs';
import { PrimaryButton } from '../components/ui';
import { fetchClubData, loadCachedClubData, type ClubData } from '../rizespor/api';
import { CLUB_COLORS } from '../rizespor/names';
import type { Match } from '../rizespor/parse';
import { syncMatchReminders } from '../rizespor/reminders';
import { useTheme } from '../theme';
import MatchCenter from './rizespor/MatchCenter';
import { ClubNewsView, MatchesView, SquadView, StandingsView } from './rizespor/views';

type Section = 'matches' | 'table' | 'squad' | 'news';

const SECTIONS: Segment<Section>[] = [
  { id: 'matches', label: 'Maçlar', icon: '⚽' },
  { id: 'table', label: 'Puan', icon: '📊' },
  { id: 'squad', label: 'Kadro', icon: '👕' },
  { id: 'news', label: 'Haberler', icon: '📰' },
];

const EMPTY: ClubData = { results: [], fixtures: [], standings: [], roster: [] };
const LIVE_LIST_REFRESH_MS = 60_000;

export default function RizesporScreen({ openMatchId }: { openMatchId?: string | null }) {
  const { colors, fs } = useTheme();
  const [section, setSection] = useState<Section>('matches');
  const [visited, setVisited] = useState<Set<Section>>(() => new Set(['matches']));
  const [data, setData] = useState<ClubData>(EMPTY);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [openMatch, setOpenMatch] = useState<Match | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const load = useCallback(async () => {
    try {
      const fresh = await fetchClubData(dataRef.current);
      setData(fresh);
      setState('ready');
      // Fikstür değiştiyse maç hatırlatmalarını tazele (ayar kapalıysa bir şey yapmaz).
      syncMatchReminders(fresh.fixtures).catch(() => {});
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
    load();
  }, [load]);

  // Canlı maç varken liste dakikada bir yenilenir.
  const hasLive = data.fixtures.some((m) => m.state === 'in') || data.results.some((m) => m.state === 'in');
  useEffect(() => {
    if (!hasLive) return;
    const t = setInterval(load, LIVE_LIST_REFRESH_MS);
    return () => clearInterval(t);
  }, [hasLive, load]);

  // Bildirimden gelinmişse ilgili maçı aç.
  useEffect(() => {
    if (!openMatchId) return;
    const m = [...data.fixtures, ...data.results].find((x) => x.id === openMatchId);
    if (m) setOpenMatch(m);
  }, [openMatchId, data]);

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
        container: { flex: 1, backgroundColor: colors.background },
        page: { flex: 1 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
        muted: { color: colors.textMuted, fontSize: fs(14), textAlign: 'center' },
        error: { color: colors.error, fontSize: fs(15), textAlign: 'center' },
      }),
    [colors, fs],
  );

  const props = { data, refreshing, onRefresh, onOpenMatch: setOpenMatch };

  return (
    <View style={styles.container}>
      <SegmentedTabs segments={SECTIONS} value={section} onChange={select} activeColor={CLUB_COLORS.green} />

      {state === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={CLUB_COLORS.green} />
          <Text style={styles.muted}>Rizespor verileri yükleniyor…</Text>
        </View>
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
              {s.id === 'news' ? <ClubNewsView /> : null}
            </FadeInView>
          ) : null,
        )
      )}

      <MatchCenter match={openMatch} onClose={() => setOpenMatch(null)} />
    </View>
  );
}
