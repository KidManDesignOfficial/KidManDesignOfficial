/** Rizespor bölümleri: Maçlar, Puan durumu, Kadro, Haberler. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '../../components/NewsCard';
import { FadeInView, PressableScale } from '../../components/motion';
import { Card, Chip, ChipRow, PrimaryButton, SectionTitle } from '../../components/ui';
import { googleNewsRssUrl } from '../../config';
import { latestResults, nextMatch, type ClubData } from '../../rizespor/api';
import { signed } from '../../rizespor/format';
import { CLUB_COLORS, POSITION_GROUPS, RIZESPOR_ID, flagEmoji } from '../../rizespor/names';
import { recentForm, type Match } from '../../rizespor/parse';
import { fetchRss, type NewsItem } from '../../rss';
import { useTheme } from '../../theme';
import NextMatchHero from './NextMatchHero';
import { MatchRow, ResultPill } from './shared';

type ViewProps = { data: ClubData; refreshing: boolean; onRefresh: () => void; onOpenMatch: (m: Match) => void };

function refreshControl(refreshing: boolean, onRefresh: () => void) {
  return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[CLUB_COLORS.green]} tintColor={CLUB_COLORS.green} />;
}

function useBaseStyles() {
  const { colors, fs } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 32 },
        pad: { paddingHorizontal: 16 },
        list: { gap: 8 },
        muted: { color: colors.textMuted, fontSize: fs(14), textAlign: 'center', padding: 16 },
        link: { color: CLUB_COLORS.green, fontWeight: '800', fontSize: fs(14), textAlign: 'center', paddingVertical: 10 },
      }),
    [colors, fs],
  );
}

export function MatchesView({ data, refreshing, onRefresh, onOpenMatch }: ViewProps) {
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const [showAllFixtures, setShowAllFixtures] = useState(false);

  const upcoming = useMemo(() => data.fixtures.filter((m) => m.state !== 'post'), [data.fixtures]);
  const results = useMemo(() => latestResults(data), [data]);
  const featured = nextMatch(data);
  const mode = featured?.state === 'in' ? 'live' : featured ? 'next' : 'last';
  const hero = featured ?? results[0] ?? null;
  const form = recentForm([...results].reverse());
  const row = data.standings.find((r) => r.team.id === RIZESPOR_ID);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        formCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        formTitle: { fontSize: fs(13), color: colors.textMuted, fontWeight: '700', marginBottom: 8 },
        pills: { flexDirection: 'row', gap: 6 },
        statBlock: { alignItems: 'center', minWidth: 54 },
        statNum: { fontSize: fs(22), fontWeight: '900', color: colors.text },
        statLabel: { fontSize: fs(11), color: colors.textMuted, fontWeight: '700' },
        stats: { flexDirection: 'row', gap: 4 },
      }),
    [colors, fs],
  );

  return (
    <ScrollView style={base.container} contentContainerStyle={base.content} refreshControl={refreshControl(refreshing, onRefresh)}>
      {hero ? <NextMatchHero match={hero} mode={mode} onOpen={() => onOpenMatch(hero)} /> : null}

      <View style={base.pad}>
        {form.length > 0 || row ? (
          <>
            <SectionTitle>Form ve sıralama</SectionTitle>
            <Card>
              <View style={styles.formCard}>
                <View>
                  <Text style={styles.formTitle}>Son {form.length} maç · eskiden yeniye →</Text>
                  <View style={styles.pills}>
                    {form.map((r, i) => (
                      <ResultPill key={i} result={r} size={26} />
                    ))}
                  </View>
                </View>
                {row ? (
                  <View style={styles.stats}>
                    <View style={styles.statBlock}>
                      <Text style={styles.statNum}>{row.rank}.</Text>
                      <Text style={styles.statLabel}>SIRA</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Text style={styles.statNum}>{row.points}</Text>
                      <Text style={styles.statLabel}>PUAN</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </Card>
          </>
        ) : null}

        <SectionTitle hint="Süper Lig">Fikstür</SectionTitle>
        {upcoming.length === 0 ? (
          <Text style={base.muted}>Yaklaşan maç bulunamadı.</Text>
        ) : (
          <View style={base.list}>
            {(showAllFixtures ? upcoming : upcoming.slice(0, 4)).map((m) => (
              <MatchRow key={m.id} match={m} onPress={() => onOpenMatch(m)} />
            ))}
            {upcoming.length > 4 ? (
              <PressableScale onPress={() => setShowAllFixtures((v) => !v)} accessibilityRole="button">
                <Text style={base.link}>{showAllFixtures ? 'Daha az göster ▴' : `Tüm fikstür (${upcoming.length}) ▾`}</Text>
              </PressableScale>
            ) : null}
          </View>
        )}

        <SectionTitle hint="En yeniden eskiye">Sonuçlar</SectionTitle>
        {results.length === 0 ? (
          <Text style={base.muted}>Henüz oynanmış maç yok.</Text>
        ) : (
          <View style={base.list}>
            {results.map((m) => (
              <MatchRow key={m.id} match={m} onPress={() => onOpenMatch(m)} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export function StandingsView({ data, refreshing, onRefresh }: ViewProps) {
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        table: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
        row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingRight: 10 },
        rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        us: { backgroundColor: colors.isDark ? '#12331F' : '#E3F4EA' },
        zone: { width: 4, alignSelf: 'stretch', marginRight: 8 },
        rank: { width: 24, fontSize: fs(13), fontWeight: '800', color: colors.text, textAlign: 'center' },
        team: { flex: 1, fontSize: fs(14), color: colors.text, fontWeight: '600', paddingLeft: 6 },
        teamUs: { fontWeight: '900', color: colors.isDark ? '#6FD39A' : CLUB_COLORS.greenDark },
        cell: { width: fs(26), fontSize: fs(13), color: colors.textMuted, textAlign: 'center', fontVariant: ['tabular-nums'] },
        gd: { width: fs(34) },
        pts: { width: fs(30), fontSize: fs(14), fontWeight: '900', color: colors.text, textAlign: 'center' },
        head: { color: colors.textMuted, fontWeight: '800', fontSize: fs(11) },
        legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
        legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        legendDot: { width: 10, height: 10, borderRadius: 3 },
        legendText: { fontSize: fs(12), color: colors.textMuted },
      }),
    [colors, fs],
  );

  const zones = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of data.standings) if (r.zone) m.set(r.zone.label, r.zone.color);
    return [...m.entries()];
  }, [data.standings]);

  return (
    <ScrollView style={base.container} contentContainerStyle={[base.content, base.pad]} refreshControl={refreshControl(refreshing, onRefresh)}>
      <SectionTitle hint="Trendyol Süper Lig 2026-27">Puan durumu</SectionTitle>
      {data.standings.length === 0 ? (
        <Text style={base.muted}>Puan durumu yüklenemedi.</Text>
      ) : (
        <FadeInView style={styles.table}>
          <View style={styles.row}>
            <View style={styles.zone} />
            <Text style={[styles.rank, styles.head]}>#</Text>
            <Text style={[styles.team, styles.head]}>Takım</Text>
            {['O', 'G', 'B', 'M'].map((h) => (
              <Text key={h} style={[styles.cell, styles.head]}>
                {h}
              </Text>
            ))}
            <Text style={[styles.cell, styles.gd, styles.head]}>AV</Text>
            <Text style={[styles.pts, styles.head]}>P</Text>
          </View>
          {data.standings.map((r) => {
            const us = r.team.id === RIZESPOR_ID;
            return (
              <View
                key={r.team.id}
                style={[styles.row, styles.rowBorder, us && styles.us]}
                accessibilityLabel={`${r.rank}. ${r.team.name}, ${r.points} puan, ${r.played} maç`}
              >
                <View style={[styles.zone, { backgroundColor: r.zone?.color ?? 'transparent' }]} />
                <Text style={styles.rank}>{r.rank}</Text>
                <Text style={[styles.team, us && styles.teamUs]} numberOfLines={1}>
                  {r.team.name}
                </Text>
                <Text style={styles.cell}>{r.played}</Text>
                <Text style={styles.cell}>{r.won}</Text>
                <Text style={styles.cell}>{r.drawn}</Text>
                <Text style={styles.cell}>{r.lost}</Text>
                <Text style={[styles.cell, styles.gd]}>{signed(r.goalDiff)}</Text>
                <Text style={styles.pts}>{r.points}</Text>
              </View>
            );
          })}
        </FadeInView>
      )}
      {zones.length > 0 ? (
        <View style={styles.legend}>
          {zones.map(([label, color]) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

export function SquadView({ data, refreshing, onRefresh }: ViewProps) {
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        summary: { fontSize: fs(13), color: colors.textMuted, marginTop: -4 },
        grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
        cellWrap: { width: '50%', padding: 4, alignSelf: 'stretch' },
        cell: {
          flex: 1,
          minHeight: fs(64),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
        },
        jersey: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: CLUB_COLORS.blue,
          borderWidth: 2.5,
          borderColor: CLUB_COLORS.green,
          alignItems: 'center',
          justifyContent: 'center',
        },
        jerseyText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '900' },
        info: { flex: 1, gap: 2 },
        name: { fontSize: fs(14), fontWeight: '700', color: colors.text },
        meta: { fontSize: fs(12), color: colors.textMuted },
        injured: { color: '#D64545', fontWeight: '700' },
      }),
    [colors, fs],
  );

  const ages = data.roster.map((p) => p.age).filter((a): a is number => a !== null);
  const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1).replace('.', ',') : null;
  const foreign = data.roster.filter((p) => p.nationality && p.nationality !== 'TUR').length;

  return (
    <ScrollView style={base.container} contentContainerStyle={[base.content, base.pad]} refreshControl={refreshControl(refreshing, onRefresh)}>
      <SectionTitle>Kadro</SectionTitle>
      {data.roster.length === 0 ? (
        <Text style={base.muted}>Kadro yüklenemedi.</Text>
      ) : (
        <>
          <Text style={styles.summary}>
            {data.roster.length} oyuncu{avgAge ? ` · yaş ortalaması ${avgAge}` : ''} · {foreign} yabancı
          </Text>
          {POSITION_GROUPS.map((g) => {
            const players = data.roster.filter((p) => p.group === g.id);
            if (players.length === 0) return null;
            return (
              <View key={g.id}>
                <SectionTitle hint={`${players.length} oyuncu`}>{g.label}</SectionTitle>
                <FadeInView style={styles.grid}>
                  {players.map((p) => {
                    const flag = flagEmoji(p.nationality);
                    return (
                      <View key={p.id} style={styles.cellWrap}>
                        <View
                          style={styles.cell}
                          accessibilityLabel={`${p.jersey ?? ''} numara ${p.name}, ${p.age ?? ''} yaşında${p.injured ? ', sakat' : ''}`}
                        >
                          <View style={styles.jersey}>
                            <Text style={styles.jerseyText}>{p.jersey ?? '–'}</Text>
                          </View>
                          <View style={styles.info}>
                            <Text style={styles.name} numberOfLines={2}>
                              {p.name}
                            </Text>
                            <Text style={styles.meta} numberOfLines={1}>
                              {flag ? `${flag} ` : ''}
                              {p.age !== null ? `${p.age} yaş` : ''}
                              {p.injured ? <Text style={styles.injured}> · Sakat</Text> : null}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </FadeInView>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const NEWS_FILTERS = [
  { id: 'all', label: 'Tümü', query: '"Rizespor" when:7d' },
  { id: 'transfer', label: '🔄 Transfer', query: '"Rizespor" (transfer OR imza OR "sözleşme" OR "anlaşma") when:30d' },
  { id: 'match', label: '⚽ Maç', query: '"Rizespor" (maç OR gol OR "maç sonu" OR "teknik direktör") when:7d' },
] as const;

export function ClubNewsView() {
  const base = useBaseStyles();
  const [filter, setFilter] = useState<(typeof NEWS_FILTERS)[number]['id']>('all');
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setError(false);
    try {
      const q = NEWS_FILTERS.find((f) => f.id === filter)!.query;
      const result = await fetchRss(googleNewsRssUrl(q), c.signal);
      if (!c.signal.aborted) setItems(result);
    } catch {
      if (!c.signal.aborted) setError(true);
    }
  }, [filter]);

  useEffect(() => {
    setItems(null);
    load();
    return () => controller.current?.abort();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ScrollView style={base.container} contentContainerStyle={base.content} refreshControl={refreshControl(refreshing, onRefresh)}>
      <ChipRow>
        {NEWS_FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </ChipRow>
      <View style={base.pad}>
        {items === null && !error ? <ActivityIndicator color={CLUB_COLORS.green} style={{ marginTop: 24 }} /> : null}
        {error ? (
          <>
            <Text style={base.muted}>Haberler yüklenemedi. İnternet bağlantınızı kontrol edin.</Text>
            <PrimaryButton label="Tekrar dene" onPress={load} />
          </>
        ) : null}
        {items && items.length === 0 ? <Text style={base.muted}>Bu konuda yakın tarihli haber yok.</Text> : null}
        {items && items.length > 0 ? (
          <FadeInView key={filter} style={base.list}>
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </FadeInView>
        ) : null}
      </View>
    </ScrollView>
  );
}
