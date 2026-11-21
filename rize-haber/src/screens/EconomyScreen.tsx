/**
 * Ekonomi: TCMB döviz kurları, altın, kur çevirici, Rize'nin yerel göstergesi (yaş çay) ve
 * Rize ekonomi haberleri. Ekran açıkken 10 dakikada bir kendiliğinden yenilenir.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppActive } from '../appState';
import { HeroCard } from '../components/HeroCard';
import { Icon } from '../components/Icon';
import { NewsCard } from '../components/NewsCard';
import { HeroSkeleton, SkeletonCard, SkeletonGroup } from '../components/Skeleton';
import { Card, Chip, ChipRow, PrimaryButton, SectionTitle } from '../components/ui';
import { NEWS_CATEGORIES, googleNewsRssUrl } from '../config';
import { tapFeedback } from '../haptics';
import { convert, fetchMarkets, formatRate, gramGoldTry, type Markets } from '../markets';
import { loadCachedMarkets, saveCachedMarkets, savedAtLabel } from '../offline';
import { fetchRss, type NewsItem } from '../rss';
import { formatDateTr, formatLira, formatNumber, parseKg, type TeaData } from '../tea';
import { BUNDLED_TEA_DATA, loadLocalTeaData } from '../teaData';
import { useTheme } from '../theme';

const REFRESH_MS = 10 * 60 * 1000;
const NEWS_LIMIT = 5;
const ECONOMY_QUERY = NEWS_CATEGORIES.find((c) => c.id === 'ekonomi')!.query;

type Props = {
  /** Sekme ekranda mı? Görünürken ve uygulama ön plandayken veriler kendiliğinden yenilenir. */
  active?: boolean;
  /** "Çay fiyatları" kartına dokununca Çay sekmesine geçer. */
  onOpenTea?: () => void;
};

export default function EconomyScreen({ active = true, onOpenTea }: Props) {
  const { colors, fs } = useTheme();
  const appActive = useAppActive();
  const [markets, setMarkets] = useState<Markets | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [offline, setOffline] = useState(false);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [tea, setTea] = useState<TeaData>(BUNDLED_TEA_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [code, setCode] = useState('USD');
  const [toTry, setToTry] = useState(true);
  const [amountInput, setAmountInput] = useState('100');
  const controller = useRef<AbortController | null>(null);
  const lastLoad = useRef(0);

  const load = useCallback(async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    lastLoad.current = Date.now();

    const [m, items] = await Promise.all([
      fetchMarkets(c.signal).catch(() => null),
      fetchRss(googleNewsRssUrl(ECONOMY_QUERY), c.signal).catch(() => null),
    ]);
    if (c.signal.aborted) return;

    if (m) {
      setMarkets(m);
      setOffline(false);
      setState('ready');
      saveCachedMarkets(m);
    } else {
      // Ağ yoksa son kayıtlı kurlar "çevrimdışı" notuyla gösterilir.
      const cached = await loadCachedMarkets();
      if (c.signal.aborted) return;
      setMarkets((cur) => cur ?? cached);
      setOffline(true);
      setState(cached ? 'ready' : 'error');
    }
    if (items) setNews(items.slice(0, NEWS_LIMIT));
    else setNews((cur) => cur ?? []);
  }, []);

  useEffect(() => {
    loadLocalTeaData().then((local) => setTea((cur) => (local.updatedAt > cur.updatedAt ? local : cur)));
    loadCachedMarkets().then((cached) => setMarkets((cur) => cur ?? cached));
    return () => controller.current?.abort();
  }, []);

  // İlk açılış, sekmeye / uygulamaya dönüş (veri bayatsa) ve açık kaldıkça düzenli yenileme.
  useEffect(() => {
    if (!active || !appActive) return;
    if (Date.now() - lastLoad.current >= REFRESH_MS) load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [active, appActive, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const rates = markets?.rates ?? [];
  const usd = rates.find((r) => r.code === 'USD');
  const eur = rates.find((r) => r.code === 'EUR');
  const gram = markets ? gramGoldTry(markets.ounceUsd, rates) : null;
  const selected = rates.find((r) => r.code === code) ?? rates[0];
  const amount = parseKg(amountInput);
  const result = selected && amount ? convert(amount, selected, toTry) : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 32 },
        heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: fs(14), fontWeight: '600' },
        heroValue: { color: '#FFFFFF', fontSize: fs(46), fontWeight: '800', letterSpacing: -1, marginTop: 2 },
        heroStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
        heroStat: {
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.14)',
          borderColor: 'rgba(255,255,255,0.22)',
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 8,
          paddingHorizontal: 10,
        },
        heroStatLabel: { color: 'rgba(255,255,255,0.8)', fontSize: fs(11), fontWeight: '700', letterSpacing: 0.4 },
        heroStatValue: { color: '#FFFFFF', fontSize: fs(17), fontWeight: '800', marginTop: 2 },
        offline: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginBottom: 10,
        },
        offlineText: { color: colors.textMuted, fontSize: fs(12), fontWeight: '600' },
        tableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        th: { fontSize: fs(12), fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        codeBadge: {
          width: fs(44),
          paddingVertical: 5,
          borderRadius: 8,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
        },
        codeText: { fontSize: fs(12), fontWeight: '800', color: colors.primary, letterSpacing: 0.3 },
        name: { flex: 1, fontSize: fs(14), color: colors.text, fontWeight: '600' },
        num: { width: fs(74), textAlign: 'right', fontSize: fs(15), color: colors.text, fontVariant: ['tabular-nums'] },
        numStrong: { fontWeight: '800' },
        goldRow: { flexDirection: 'row', gap: 10 },
        goldBox: { flex: 1, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 12 },
        goldLabel: { fontSize: fs(12), color: colors.textMuted, fontWeight: '700' },
        goldValue: { fontSize: fs(22), color: colors.text, fontWeight: '800', marginTop: 4 },
        hint: { fontSize: fs(12), color: colors.textMuted, marginTop: 10, lineHeight: fs(17) },
        input: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: fs(18),
          color: colors.text,
          backgroundColor: colors.background,
        },
        swapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
        swapLabel: { fontSize: fs(15), fontWeight: '700', color: colors.text },
        swap: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: colors.primarySoft,
        },
        swapText: { fontSize: fs(13), fontWeight: '700', color: colors.primary },
        resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 },
        resultLabel: { fontSize: fs(15), color: colors.textMuted },
        resultValue: { fontSize: fs(26), fontWeight: '800', color: colors.primary },
        teaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        teaIcon: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        teaTitle: { fontSize: fs(14), color: colors.textMuted, fontWeight: '600' },
        teaValue: { fontSize: fs(20), color: colors.text, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        newsList: { gap: 10 },
        muted: { fontSize: fs(14), color: colors.textMuted, textAlign: 'center', padding: 12 },
        center: { alignItems: 'center', padding: 32, gap: 12 },
        errorText: { color: colors.error, fontSize: fs(15), textAlign: 'center' },
        footer: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: fs(17) },
      }),
    [colors, fs],
  );

  if (!markets && state === 'loading') return <HeroSkeleton rows={5} />;

  if (!markets) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="cloud-offline-outline" size={40} color={colors.textMuted} />
        <Text style={styles.errorText}>Piyasa verileri yüklenemedi. İnternet bağlantınızı kontrol edin.</Text>
        <PrimaryButton
          label="Tekrar dene"
          onPress={() => {
            setState('loading');
            load();
          }}
        />
      </View>
    );
  }

  const bulletin = markets.date ? formatDateTr(markets.date) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressBackgroundColor={colors.card}
        />
      }
    >
      {offline ? (
        <View style={styles.offline}>
          <Icon name="cloud-offline-outline" size={16} color={colors.textMuted} />
          <Text style={styles.offlineText}>Çevrimdışı · son güncelleme {savedAtLabel(markets.fetchedAt)}</Text>
        </View>
      ) : null}

      <HeroCard
        watermark="trending-up-outline"
        eyebrow={bulletin ? `TCMB · ${bulletin.toLocaleUpperCase('tr-TR')}` : 'TCMB GÖSTERGE KURU'}
        eyebrowIcon="stats-chart-outline"
        accessibilityLabel={usd ? `Dolar ${formatRate(usd.selling)} lira` : 'Piyasalar'}
      >
        <Text style={styles.heroLabel}>Dolar / TL</Text>
        <Text style={styles.heroValue}>{usd ? `${formatRate(usd.selling)} ₺` : '—'}</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>EURO</Text>
            <Text style={styles.heroStatValue}>{eur ? formatRate(eur.selling) : '—'}</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>GRAM ALTIN</Text>
            <Text style={styles.heroStatValue}>{gram ? formatNumber(gram, 0) : '—'}</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>YAŞ ÇAY</Text>
            <Text style={styles.heroStatValue}>{formatNumber(tea.current.pricePerKg)}</Text>
          </View>
        </View>
      </HeroCard>

      <SectionTitle hint="TCMB gösterge kurları, 1 birim için ₺">Döviz kurları</SectionTitle>
      <Card>
        <View style={styles.tableHead}>
          <Text style={[styles.th, { flex: 1 }]}>DÖVİZ</Text>
          <Text style={[styles.th, styles.num]}>ALIŞ</Text>
          <Text style={[styles.th, styles.num]}>SATIŞ</Text>
        </View>
        {rates.map((r, i) => (
          <View
            key={r.code}
            style={[styles.row, i === rates.length - 1 && { borderBottomWidth: 0, paddingBottom: 2 }]}
            accessible
            accessibilityLabel={`${r.name}: alış ${formatRate(r.buying)}, satış ${formatRate(r.selling)} lira`}
          >
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{r.code}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {r.name}
            </Text>
            <Text style={styles.num}>{formatRate(r.buying)}</Text>
            <Text style={[styles.num, styles.numStrong]}>{formatRate(r.selling)}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle hint="Ons fiyatı ve TCMB dolar kurundan hesaplanır">Altın</SectionTitle>
      <Card>
        <View style={styles.goldRow}>
          <View style={styles.goldBox}>
            <Text style={styles.goldLabel}>Gram altın</Text>
            <Text style={styles.goldValue}>{gram ? formatLira(gram) : '—'}</Text>
          </View>
          <View style={styles.goldBox}>
            <Text style={styles.goldLabel}>Ons altın</Text>
            <Text style={styles.goldValue}>{markets.ounceUsd ? `$${formatNumber(markets.ounceUsd)}` : '—'}</Text>
          </View>
        </View>
        <Text style={styles.hint}>
          {gram
            ? 'Has altının hesaplanan değeridir. Kuyumcu fiyatları işçilik ve alış-satış farkı nedeniyle değişir.'
            : 'Altın fiyatı şu an alınamadı. Aşağı çekerek yenileyin.'}
        </Text>
      </Card>

      <SectionTitle hint="TCMB kuruyla yaklaşık hesap">Döviz çevirici</SectionTitle>
      <Card>
        <View style={styles.swapRow}>
          <Text style={styles.swapLabel}>{toTry ? `${selected?.code ?? ''} → TL` : `TL → ${selected?.code ?? ''}`}</Text>
          <Pressable
            onPress={() => {
              tapFeedback();
              setToTry((v) => !v);
            }}
            style={({ pressed }) => [styles.swap, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Çeviri yönünü değiştir"
          >
            <Icon name="swap-horizontal" size={16} color={colors.primary} />
            <Text style={styles.swapText}>Yönü değiştir</Text>
          </Pressable>
        </View>
        <TextInput
          value={amountInput}
          onChangeText={setAmountInput}
          placeholder="Tutar"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={styles.input}
          accessibilityLabel={toTry ? `${selected?.name ?? 'Döviz'} tutarı` : 'Türk lirası tutarı'}
          maxLength={14}
        />
        <View style={{ marginHorizontal: -16 }}>
          <ChipRow>
            {rates.map((r) => (
              <Chip key={r.code} label={r.code} selected={r.code === selected?.code} onPress={() => setCode(r.code)} />
            ))}
          </ChipRow>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Sonuç</Text>
          <Text style={styles.resultValue} numberOfLines={1} adjustsFontSizeToFit>
            {result === null ? '—' : toTry ? formatLira(result) : `${formatNumber(result)} ${selected?.code}`}
          </Text>
        </View>
        <Text style={styles.hint}>
          {toTry ? 'Döviz alış kuruyla' : 'Döviz satış kuruyla'} hesaplanır. Banka ve döviz bürolarının kurları farklıdır.
        </Text>
      </Card>

      <SectionTitle>Rize ekonomisi</SectionTitle>
      <Pressable
        onPress={() => {
          tapFeedback();
          onOpenTea?.();
        }}
        disabled={!onOpenTea}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
        accessibilityLabel={`Yaş çay alım fiyatı ${formatLira(tea.current.pricePerKg)}, çay sayfasını aç`}
      >
        <Card>
          <View style={styles.teaRow}>
            <View style={styles.teaIcon}>
              <Icon name="leaf" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teaTitle}>{tea.current.year} yaş çay alım fiyatı</Text>
              <Text style={styles.teaValue}>{formatLira(tea.current.pricePerKg)} / kg</Text>
            </View>
            {onOpenTea ? <Icon name="chevron-forward" size={20} color={colors.textMuted} /> : null}
          </View>
        </Card>
      </Pressable>

      <SectionTitle hint="Çay, fındık, liman ve ticaret – son 7 gün">Ekonomi gündemi</SectionTitle>
      {news === null ? (
        <SkeletonGroup style={{ gap: 10 }}>
          <SkeletonCard />
          <SkeletonCard />
        </SkeletonGroup>
      ) : news.length === 0 ? (
        <Text style={styles.muted}>Ekonomi haberleri şu an yüklenemedi.</Text>
      ) : (
        <View style={styles.newsList}>
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        Kaynak: TCMB, gold-api.com · {savedAtLabel(markets.fetchedAt)} itibarıyla{'\n'}Bilgi amaçlıdır, yatırım
        tavsiyesi değildir.
      </Text>
    </ScrollView>
  );
}
