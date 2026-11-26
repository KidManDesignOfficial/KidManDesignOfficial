/** Rizespor bölümleri: Maçlar, Puan durumu, Kadro. Haberler yalnızca Haberler sekmesinde (Spor kategorisi). */
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FadeInView, PressableScale, useScrollTopOnShow } from '../../components/motion';
import { Card, SectionTitle } from '../../components/ui';
import { latestResults, nextMatch, type ClubData } from '../../rizespor/api';
import { clock, signed } from '../../rizespor/format';
import { CLUB_COLORS, POSITION_GROUPS, RIZESPOR_ID, flagEmoji, shortTeamName } from '../../rizespor/names';
import { GLASS } from '../../rizespor/stadium';
import { recentForm, type Match } from '../../rizespor/parse';
import { seasonSummary, streakText, teamLeaders, type Record3 } from '../../rizespor/season';
import { useTheme, tint } from '../../theme';
import NextMatchHero from './NextMatchHero';
import { LivePulse, MatchRow, RESULT_COLORS, ResultPill } from './shared';

type ViewProps = {
  data: ClubData;
  /** Ekranın son "şimdi"si (dakikada bir ve her veri gelişinde güncellenir). */
  now: number;
  /** Verinin geldiği an (canlı dakikayı ilerletmek için). */
  dataAt: number;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenMatch: (m: Match) => void;
};

function ClubRefresh(props: { refreshing: boolean; onRefresh: () => void }) {
  const { colors } = useTheme();
  return <RefreshControl {...props} colors={[tint(colors, CLUB_COLORS.green)]} tintColor={GLASS.text} progressBackgroundColor="#0B2A1C" />;
}

function useBaseStyles() {
  const { colors, fs } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        // Arka plandaki stadyum sahnesi görünsün diye zemin saydam; yüzeyler cam.
        container: { flex: 1, backgroundColor: 'transparent' },
        content: { paddingBottom: 32 },
        pad: { paddingHorizontal: 16 },
        list: { gap: 8 },
        glass: { backgroundColor: GLASS.surface, borderColor: GLASS.border },
        muted: { color: GLASS.soft, fontSize: fs(14), textAlign: 'center', padding: 16 },
        link: { color: tint(colors, GLASS.accent), fontWeight: '800', fontSize: fs(14), textAlign: 'center', paddingVertical: 10 },
      }),
    [colors, fs],
  );
}

export function MatchesView({ data, now, dataAt, refreshing, onRefresh, onOpenMatch }: ViewProps) {
  const scrollRef = useScrollTopOnShow();
  const { fs } = useTheme();
  const base = useBaseStyles();
  const [showAllFixtures, setShowAllFixtures] = useState(false);

  const upcoming = useMemo(() => data.fixtures.filter((m) => m.state !== 'post'), [data.fixtures]);
  const results = useMemo(() => latestResults(data), [data]);
  const featured = nextMatch(data, now);
  const season = useMemo(() => seasonSummary(results), [results]);
  const others = useMemo(
    () => data.today.filter((m) => m.home.id !== RIZESPOR_ID && m.away.id !== RIZESPOR_ID),
    [data.today],
  );
  const mode = featured?.state === 'in' ? 'live' : featured ? 'next' : 'last';
  const hero = featured ?? results[0] ?? null;
  const form = recentForm([...results].reverse());
  const row = data.standings.find((r) => r.team.id === RIZESPOR_ID);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        formCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        formTitle: { fontSize: fs(13), color: GLASS.soft, fontWeight: '700', marginBottom: 8 },
        pills: { flexDirection: 'row', gap: 6 },
        statBlock: { alignItems: 'center', minWidth: 54 },
        statNum: { fontSize: fs(22), fontWeight: '900', color: GLASS.text },
        statLabel: { fontSize: fs(11), color: GLASS.soft, fontWeight: '700' },
        stats: { flexDirection: 'row', gap: 4 },
      }),
    [fs],
  );

  return (
    <ScrollView ref={scrollRef} style={base.container} contentContainerStyle={base.content} refreshControl={<ClubRefresh refreshing={refreshing} onRefresh={onRefresh} />}>
      {hero ? <NextMatchHero match={hero} mode={mode} dataAt={dataAt} onOpen={() => onOpenMatch(hero)} /> : null}

      <View style={base.pad}>
        {form.length > 0 || row ? (
          <>
            <SectionTitle light>Form ve sıralama</SectionTitle>
            <Card style={base.glass}>
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

        {others.length > 0 ? (
          <>
            <SectionTitle light hint={others.some((m) => m.state === 'in') ? 'Canlı skorlar' : 'Diğer maçlar'}>
              Süper Lig’de bugün
            </SectionTitle>
            <Card style={[base.glass, { gap: 10 }]}>
              {others.map((m) => (
                <MiniScore key={m.id} match={m} />
              ))}
            </Card>
          </>
        ) : null}

        <SectionTitle light hint="Süper Lig">Fikstür</SectionTitle>
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

        {season.all.played > 0 ? (
          <>
            <SectionTitle light hint={season.streak ? streakText(season.streak) : undefined}>
              Sezon özeti
            </SectionTitle>
            <SeasonCard season={season} />
          </>
        ) : null}

        <SectionTitle light hint="En yeniden eskiye">Sonuçlar</SectionTitle>
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
  const scrollRef = useScrollTopOnShow();
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        table: { backgroundColor: GLASS.surface, borderRadius: 16, borderWidth: 1, borderColor: GLASS.border, overflow: 'hidden' },
        row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingRight: 10 },
        headRow: { backgroundColor: 'rgba(255,255,255,0.05)' },
        rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: GLASS.divider },
        us: { backgroundColor: tint(colors, GLASS.highlight) },
        zone: { width: 4, alignSelf: 'stretch', marginRight: 8 },
        rank: { width: 24, fontSize: fs(13), fontWeight: '800', color: GLASS.text, textAlign: 'center' },
        team: { flex: 1, fontSize: fs(14), color: GLASS.text, fontWeight: '600', paddingLeft: 6 },
        teamUs: { fontWeight: '900', color: tint(colors, GLASS.accent) },
        cell: { width: fs(26), fontSize: fs(13), color: GLASS.soft, textAlign: 'center', fontVariant: ['tabular-nums'] },
        gd: { width: fs(34) },
        pts: { width: fs(30), fontSize: fs(14), fontWeight: '900', color: GLASS.text, textAlign: 'center' },
        head: { color: GLASS.faint, fontWeight: '800', fontSize: fs(11) },
        legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
        legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        legendDot: { width: 10, height: 10, borderRadius: 3 },
        legendText: { fontSize: fs(12), color: GLASS.soft },
      }),
    [colors, fs],
  );

  const zones = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of data.standings) if (r.zone) m.set(r.zone.label, r.zone.color);
    return [...m.entries()];
  }, [data.standings]);

  return (
    <ScrollView ref={scrollRef} style={base.container} contentContainerStyle={[base.content, base.pad]} refreshControl={<ClubRefresh refreshing={refreshing} onRefresh={onRefresh} />}>
      <SectionTitle light hint="Trendyol Süper Lig 2026-27">Puan durumu</SectionTitle>
      {data.standings.length === 0 ? (
        <Text style={base.muted}>Puan durumu yüklenemedi.</Text>
      ) : (
        <FadeInView style={styles.table}>
          <View style={[styles.row, styles.headRow]}>
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

/** "11 maç · 4 gol · 1 asist" (kaleciler için kurtarış). */
function playerLine(p: ClubData['roster'][number]): string {
  const parts = [`${p.stats.apps} maç`];
  if (p.group === 'GK' && p.stats.saves) parts.push(`${p.stats.saves} kurtarış`);
  if (p.stats.goals) parts.push(`${p.stats.goals} gol`);
  if (p.stats.assists) parts.push(`${p.stats.assists} asist`);
  if (p.stats.red) parts.push(`${p.stats.red} kırmızı`);
  return parts.join(' · ');
}

export function SquadView({ data, refreshing, onRefresh }: ViewProps) {
  const scrollRef = useScrollTopOnShow();
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        summary: { fontSize: fs(13), color: GLASS.soft, marginTop: -4 },
        grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
        cellWrap: { width: '50%', padding: 4, alignSelf: 'stretch' },
        cell: {
          flex: 1,
          minHeight: fs(64),
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: GLASS.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: GLASS.border,
          padding: 10,
        },
        jersey: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: tint(colors, CLUB_COLORS.blue),
          borderWidth: 2.5,
          borderColor: tint(colors, CLUB_COLORS.green),
          alignItems: 'center',
          justifyContent: 'center',
        },
        jerseyText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '900' },
        info: { flex: 1, gap: 2 },
        name: { fontSize: fs(14), fontWeight: '700', color: GLASS.text },
        meta: { fontSize: fs(12), color: GLASS.soft },
        injured: { color: '#FF7A7A', fontWeight: '700' },
      }),
    [colors, fs],
  );

  const ages = data.roster.map((p) => p.age).filter((a): a is number => a !== null);
  const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1).replace('.', ',') : null;
  const foreign = data.roster.filter((p) => p.nationality && p.nationality !== 'TUR').length;

  return (
    <ScrollView ref={scrollRef} style={base.container} contentContainerStyle={[base.content, base.pad]} refreshControl={<ClubRefresh refreshing={refreshing} onRefresh={onRefresh} />}>
      <SectionTitle light>Kadro</SectionTitle>
      {data.roster.length === 0 ? (
        <Text style={base.muted}>Kadro yüklenemedi.</Text>
      ) : (
        <>
          <Text style={styles.summary}>
            {data.roster.length} oyuncu{avgAge ? ` · yaş ortalaması ${avgAge}` : ''} · {foreign} yabancı
          </Text>
          <LeadersCard roster={data.roster} />
          {POSITION_GROUPS.map((g) => {
            const players = data.roster.filter((p) => p.group === g.id);
            if (players.length === 0) return null;
            return (
              <View key={g.id}>
                <SectionTitle light hint={`${players.length} oyuncu`}>{g.label}</SectionTitle>
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
                            {p.stats.apps > 0 ? (
                              <Text style={styles.meta} numberOfLines={1}>
                                {playerLine(p)}
                              </Text>
                            ) : null}
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

/** Günün diğer lig maçlarından biri: tek satır, canlıysa dakika kırmızı. */
function MiniScore({ match }: { match: Match }) {
  const { fs } = useTheme();
  const live = match.state === 'in';
  const score = match.state === 'pre' ? clock(match.date) : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityLabel={`${match.home.name} ${score} ${match.away.name}, ${match.status}`}>
      <Text style={{ flex: 1, color: GLASS.text, fontSize: fs(13), textAlign: 'right' }} numberOfLines={1}>
        {shortTeamName(match.home.name)}
      </Text>
      <Text style={{ width: fs(58), color: GLASS.text, fontSize: fs(14), fontWeight: '900', textAlign: 'center', fontVariant: ['tabular-nums'] }}>{score}</Text>
      <Text style={{ flex: 1, color: GLASS.text, fontSize: fs(13) }} numberOfLines={1}>
        {shortTeamName(match.away.name)}
      </Text>
      <View style={{ width: fs(52), flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {live ? <LivePulse size={7} /> : null}
        <Text style={{ color: live ? '#FF6B61' : GLASS.soft, fontSize: fs(11), fontWeight: '800' }} numberOfLines={1}>
          {match.state === 'pre' ? '' : match.status}
        </Text>
      </View>
    </View>
  );
}

function SeasonCard({ season }: { season: ReturnType<typeof seasonSummary> }) {
  const { fs } = useTheme();
  const base = useBaseStyles();
  const a = season.all;
  const avg = (n: number) => (a.played ? (n / a.played).toFixed(1).replace('.', ',') : '0');
  const tiles: [string, string][] = [
    [`${a.won}-${a.drawn}-${a.lost}`, 'G-B-M'],
    [`${a.goalsFor}:${a.goalsAgainst}`, 'ATTIĞI:YEDİĞİ'],
    [avg(a.goalsFor), 'GOL / MAÇ'],
    [String(season.cleanSheets), 'GOL YEMEDİ'],
  ];
  const split = (label: string, r: Record3) => (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={{ color: GLASS.soft, fontSize: fs(12), fontWeight: '700' }}>{label}</Text>
      <Text style={{ color: GLASS.text, fontSize: fs(15), fontWeight: '900' }}>
        {r.won}G {r.drawn}B {r.lost}M
      </Text>
      <Text style={{ color: GLASS.soft, fontSize: fs(12) }}>
        {r.points} puan · {r.goalsFor}:{r.goalsAgainst}
      </Text>
      <WinBar r={r} />
    </View>
  );
  return (
    <Card style={[base.glass, { gap: 16 }]}>
      <View style={{ flexDirection: 'row' }}>
        {tiles.map(([v, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
            <Text style={{ color: GLASS.text, fontSize: fs(19), fontWeight: '900' }} adjustsFontSizeToFit numberOfLines={1}>
              {v}
            </Text>
            <Text style={{ color: GLASS.soft, fontSize: fs(10), fontWeight: '800', textAlign: 'center' }}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: GLASS.divider }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {split('🏟️ İç saha', season.home)}
        {split('🚌 Deplasman', season.away)}
      </View>
      {season.biggestWin ? (
        <Text style={{ color: GLASS.soft, fontSize: fs(12) }}>
          En farklı galibiyet: {season.biggestWin.home.name} {season.biggestWin.homeScore}-{season.biggestWin.awayScore} {season.biggestWin.away.name}
        </Text>
      ) : null}
    </Card>
  );
}

/** Galibiyet / beraberlik / mağlubiyet oranı: üç renkli ince şerit. */
function WinBar({ r }: { r: Record3 }) {
  if (r.played === 0) return null;
  return (
    <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 2, backgroundColor: GLASS.divider }}>
      {(['G', 'B', 'M'] as const).map((k) => {
        const n = k === 'G' ? r.won : k === 'B' ? r.drawn : r.lost;
        return n > 0 ? <View key={k} style={{ flex: n, backgroundColor: RESULT_COLORS[k] }} /> : null;
      })}
    </View>
  );
}

/** Takım liderleri: gol, asist, maç, kurtarış, kart — ilk 3'ler. */
function LeadersCard({ roster }: { roster: ClubData['roster'] }) {
  const { colors, fs } = useTheme();
  const base = useBaseStyles();
  const boards = useMemo(() => teamLeaders(roster), [roster]);
  const [selected, setSelected] = useState<string>('goals');
  if (boards.length === 0) return null;
  const board = boards.find((b) => b.id === selected) ?? boards[0];
  const max = board.leaders[0]?.value ?? 1;
  return (
    <>
      <SectionTitle light hint="Sezon, tüm maçlar">Takım liderleri</SectionTitle>
      <Card style={[base.glass, { gap: 12 }]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {boards.map((b) => {
            const on = b.id === board.id;
            return (
              <PressableScale
                key={b.id}
                onPress={() => setSelected(b.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: on ? tint(colors, CLUB_COLORS.green) : GLASS.surfaceStrong,
                  borderWidth: 1,
                  borderColor: on ? tint(colors, CLUB_COLORS.green) : GLASS.border,
                }}
              >
                <Text style={{ color: GLASS.text, fontSize: fs(12), fontWeight: '800' }}>{b.label}</Text>
              </PressableScale>
            );
          })}
        </View>
        {board.leaders.map((l, i) => (
          <View key={l.player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ width: 22, color: i === 0 ? tint(colors, '#FFD447') : GLASS.soft, fontSize: fs(16), fontWeight: '900', textAlign: 'center' }}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                <Text style={{ color: GLASS.text, fontSize: fs(14), fontWeight: '800', flex: 1 }} numberOfLines={1}>
                  {l.player.name}
                </Text>
                <Text style={{ color: GLASS.text, fontSize: fs(14), fontWeight: '900' }}>
                  {l.value} <Text style={{ color: GLASS.soft, fontWeight: '600', fontSize: fs(12) }}>{board.unit}</Text>
                </Text>
              </View>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: GLASS.divider, overflow: 'hidden' }}>
                <View style={{ width: `${(l.value / max) * 100}%`, height: '100%', backgroundColor: i === 0 ? tint(colors, GLASS.accent) : 'rgba(123,224,166,0.55)' }} />
              </View>
            </View>
          </View>
        ))}
      </Card>
    </>
  );
}
