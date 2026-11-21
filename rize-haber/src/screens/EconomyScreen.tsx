/**
 * Ekonomi: TCMB döviz kurları, altın, kur çevirici ve Rize'nin yerel göstergesi (yaş çay).
 * Haber listesi yoktur; haberler yalnızca Haberler sekmesindedir.
 * Arka planda piyasa ekranı sahnesi, üstte kayan kur bandı; içerik cam kartlardadır.
 * Ekran açıkken 10 dakikada bir kendiliğinden yenilenir.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppActive } from '../appState';
import EconomyScene from '../components/EconomyScene';
import { HeroCard } from '../components/HeroCard';
import { Icon } from '../components/Icon';
import { useAnimatedValue, useSceneStill } from '../components/motion';
import { HeroSkeleton } from '../components/Skeleton';
import { Card, Chip, ChipRow, PrimaryButton, SectionTitle } from '../components/ui';
import { ECON_CHROME, ECON_GLASS as G, FLAGS, MARKET } from '../economyScene';
import { tapFeedback } from '../haptics';
import { convert, fetchMarkets, formatRate, gramGoldTry, type Markets } from '../markets';
import { loadCachedMarkets, saveCachedMarkets, savedAtLabel } from '../offline';
import { formatDateTr, formatLira, formatNumber, parseKg, type TeaData } from '../tea';
import { BUNDLED_TEA_DATA, loadLocalTeaData } from '../teaData';
import { useTheme } from '../theme';

const REFRESH_MS = 10 * 60 * 1000;

/** Vitrin kartı: üst solda altın ışığı, alt sağda gece mavisi (cam). */
const HERO_GRADIENT = ['rgba(242,199,92,0.30)', 'rgba(12,28,62,0.55)'] as const;

type Props = {
  /** Sekme ekranda mı? Görünürken ve uygulama ön plandayken veriler kendiliğinden yenilenir. */
  active?: boolean;
  /** "Çay fiyatları" kartına dokununca Çay sekmesine geçer. */
  onOpenTea?: () => void;
};

export default function EconomyScreen({ active = true, onOpenTea }: Props) {
  const { fs } = useTheme();
  const appActive = useAppActive();
  const [markets, setMarkets] = useState<Markets | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [offline, setOffline] = useState(false);
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

    const m = await fetchMarkets(c.signal).catch(() => null);
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
        root: { flex: 1, backgroundColor: ECON_CHROME.footer },
        container: { flex: 1, backgroundColor: 'transparent' },
        content: { padding: 16, paddingBottom: 32 },
        card: { backgroundColor: G.surface, borderColor: G.border },
        heroShell: { borderWidth: 1, borderColor: G.goldBorder },
        heroLabel: { color: G.soft, fontSize: fs(14), fontWeight: '600' },
        heroValue: { color: G.text, fontSize: fs(46), fontWeight: '800', letterSpacing: -1, marginTop: 2 },
        heroStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
        heroStat: {
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderColor: 'rgba(255,255,255,0.18)',
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 8,
          paddingHorizontal: 10,
        },
        heroStatLabel: { color: G.faint, fontSize: fs(11), fontWeight: '700', letterSpacing: 0.4 },
        heroStatValue: { color: G.text, fontSize: fs(17), fontWeight: '800', marginTop: 2 },
        heroStatGold: { color: MARKET.goldSoft },
        offline: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: G.surface,
          borderWidth: 1,
          borderColor: G.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginBottom: 10,
        },
        offlineText: { color: G.soft, fontSize: fs(12), fontWeight: '600' },
        tableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: G.border },
        th: { fontSize: fs(12), fontWeight: '700', color: G.faint, letterSpacing: 0.3 },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: G.divider,
        },
        codeBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          minWidth: fs(64),
          paddingVertical: 5,
          paddingHorizontal: 6,
          borderRadius: 8,
          backgroundColor: G.surfaceStrong,
          borderWidth: 1,
          borderColor: G.border,
        },
        flag: { fontSize: fs(13) },
        codeText: { fontSize: fs(12), fontWeight: '800', color: G.text, letterSpacing: 0.3 },
        name: { flex: 1, fontSize: fs(14), color: G.soft, fontWeight: '600' },
        num: { width: fs(74), textAlign: 'right', fontSize: fs(15), color: G.soft, fontVariant: ['tabular-nums'] },
        numStrong: { fontWeight: '800', color: G.text },
        goldRow: { flexDirection: 'row', gap: 10 },
        goldBox: { flex: 1, borderRadius: 14, padding: 12, overflow: 'hidden', borderWidth: 1, borderColor: G.goldBorder },
        goldLabel: { fontSize: fs(12), color: MARKET.goldSoft, fontWeight: '700', letterSpacing: 0.3 },
        goldValue: { fontSize: fs(22), color: G.text, fontWeight: '800', marginTop: 4 },
        hint: { fontSize: fs(12), color: G.faint, marginTop: 10, lineHeight: fs(17) },
        input: {
          borderWidth: 1,
          borderColor: G.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: fs(18),
          color: G.text,
          backgroundColor: G.input,
        },
        swapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
        swapLabel: { fontSize: fs(15), fontWeight: '700', color: G.text },
        swap: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: G.goldSurface,
          borderWidth: 1,
          borderColor: G.goldBorder,
        },
        swapText: { fontSize: fs(13), fontWeight: '700', color: MARKET.goldSoft },
        resultRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: G.divider,
        },
        resultLabel: { fontSize: fs(15), color: G.soft },
        resultValue: { fontSize: fs(26), fontWeight: '800', color: MARKET.gold, flexShrink: 1 },
        teaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        teaIcon: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: 'rgba(61,220,151,0.16)',
          borderWidth: 1,
          borderColor: 'rgba(61,220,151,0.35)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        teaTitle: { fontSize: fs(14), color: G.soft, fontWeight: '600' },
        teaValue: { fontSize: fs(20), color: G.text, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
        errorText: { color: G.text, fontSize: fs(15), textAlign: 'center' },
        footer: { fontSize: fs(12), color: G.faint, textAlign: 'center', marginTop: 16, lineHeight: fs(17) },
      }),
    [fs],
  );

  const running = active && appActive;

  if (!markets) {
    return (
      <View style={styles.root}>
        <EconomyScene active={running} />
        {state === 'loading' ? (
          <HeroSkeleton rows={5} glass />
        ) : (
          <View style={styles.center}>
            <Icon name="cloud-offline-outline" size={40} color={G.soft} />
            <Text style={styles.errorText}>Piyasa verileri yüklenemedi. İnternet bağlantınızı kontrol edin.</Text>
            <PrimaryButton
              label="Tekrar dene"
              onPress={() => {
                setState('loading');
                load();
              }}
            />
          </View>
        )}
      </View>
    );
  }

  const bulletin = markets.date ? formatDateTr(markets.date) : null;
  const ticker: TickerItem[] = [
    ...rates.map((r) => ({ label: r.code, value: formatRate(r.selling) })),
    ...(gram ? [{ label: 'GRAM ALTIN', value: formatNumber(gram, 0), gold: true }] : []),
    ...(markets.ounceUsd ? [{ label: 'ONS', value: `$${formatNumber(markets.ounceUsd)}`, gold: true }] : []),
    { label: 'YAŞ ÇAY', value: formatNumber(tea.current.pricePerKg) },
  ];

  return (
    <View style={styles.root}>
      <EconomyScene active={running} />
      <Ticker items={ticker} running={running} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[MARKET.gold]}
            tintColor={MARKET.gold}
            progressBackgroundColor={ECON_CHROME.header}
          />
        }
      >
        {offline ? (
          <View style={styles.offline}>
            <Icon name="cloud-offline-outline" size={16} color={G.soft} />
            <Text style={styles.offlineText}>Çevrimdışı · son güncelleme {savedAtLabel(markets.fetchedAt)}</Text>
          </View>
        ) : null}

        <HeroCard
          gradient={HERO_GRADIENT}
          style={styles.heroShell}
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
              <Text style={[styles.heroStatValue, styles.heroStatGold]}>{gram ? formatNumber(gram, 0) : '—'}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>YAŞ ÇAY</Text>
              <Text style={styles.heroStatValue}>{formatNumber(tea.current.pricePerKg)}</Text>
            </View>
          </View>
        </HeroCard>

        <SectionTitle light hint="TCMB gösterge kurları, 1 birim için ₺">
          Döviz kurları
        </SectionTitle>
        <Card style={styles.card}>
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
                {FLAGS[r.code] ? <Text style={styles.flag}>{FLAGS[r.code]}</Text> : null}
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

        <SectionTitle light hint="Ons fiyatı ve TCMB dolar kurundan hesaplanır">
          Altın
        </SectionTitle>
        <Card style={styles.card}>
          <View style={styles.goldRow}>
            {[
              { label: 'GRAM ALTIN', value: gram ? formatLira(gram) : '—' },
              { label: 'ONS ALTIN', value: markets.ounceUsd ? `$${formatNumber(markets.ounceUsd)}` : '—' },
            ].map((g) => (
              <View key={g.label} style={styles.goldBox}>
                <LinearGradient
                  colors={['rgba(242,199,92,0.24)', 'rgba(242,199,92,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.goldLabel}>{g.label}</Text>
                <Text style={styles.goldValue} numberOfLines={1} adjustsFontSizeToFit>
                  {g.value}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.hint}>
            {gram
              ? 'Has altının hesaplanan değeridir. Kuyumcu fiyatları işçilik ve alış-satış farkı nedeniyle değişir.'
              : 'Altın fiyatı şu an alınamadı. Aşağı çekerek yenileyin.'}
          </Text>
        </Card>

        <SectionTitle light hint="TCMB kuruyla yaklaşık hesap">
          Döviz çevirici
        </SectionTitle>
        <Card style={styles.card}>
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
              <Icon name="swap-horizontal" size={16} color={MARKET.goldSoft} />
              <Text style={styles.swapText}>Yönü değiştir</Text>
            </Pressable>
          </View>
          <TextInput
            value={amountInput}
            onChangeText={setAmountInput}
            placeholder="Tutar"
            placeholderTextColor={G.faint}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel={toTry ? `${selected?.name ?? 'Döviz'} tutarı` : 'Türk lirası tutarı'}
            maxLength={14}
          />
          <View style={{ marginHorizontal: -16 }}>
            <ChipRow>
              {rates.map((r) => (
                <Chip key={r.code} label={r.code} glass selected={r.code === selected?.code} onPress={() => setCode(r.code)} />
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

        <SectionTitle light>Rize ekonomisi</SectionTitle>
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
          <Card style={styles.card}>
            <View style={styles.teaRow}>
              <View style={styles.teaIcon}>
                <Icon name="leaf" size={22} color={MARKET.up} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.teaTitle}>{tea.current.year} yaş çay alım fiyatı</Text>
                <Text style={styles.teaValue}>{formatLira(tea.current.pricePerKg)} / kg</Text>
              </View>
              {onOpenTea ? <Icon name="chevron-forward" size={20} color={G.faint} /> : null}
            </View>
          </Card>
        </Pressable>

        <Text style={styles.footer}>
          Kaynak: TCMB, gold-api.com · {savedAtLabel(markets.fetchedAt)} itibarıyla{'\n'}Bilgi amaçlıdır, yatırım
          tavsiyesi değildir.
        </Text>
      </ScrollView>
    </View>
  );
}

// ——— Kayan kur bandı (borsa ekranlarındaki gibi) ———

type TickerItem = { label: string; value: string; gold?: boolean };

/** Px/sn: bant okunacak kadar yavaş akar. */
const TICKER_SPEED = 36;

function Ticker({ items, running }: { items: TickerItem[]; running: boolean }) {
  const { fs } = useTheme();
  const reduced = useSceneStill();
  const [rowWidth, setRowWidth] = useState(0);
  const x = useAnimatedValue(0);
  const moving = running && !reduced && rowWidth > 0;

  useEffect(() => {
    x.setValue(0);
    if (!moving) return;
    const loop = Animated.loop(
      Animated.timing(x, { toValue: -rowWidth, duration: (rowWidth / TICKER_SPEED) * 1000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, rowWidth, x]);

  const row = (copy: number) => (
    <View
      style={tickerStyles.row}
      onLayout={copy === 0 ? (e) => setRowWidth(e.nativeEvent.layout.width) : undefined}
    >
      {items.map((it) => (
        <View key={`${copy}-${it.label}`} style={tickerStyles.item}>
          <Text style={[tickerStyles.label, { fontSize: fs(11) }]}>{it.label}</Text>
          <Text style={[tickerStyles.value, { fontSize: fs(13) }, it.gold && { color: MARKET.goldSoft }]}>{it.value}</Text>
          <Text style={[tickerStyles.sep, { fontSize: fs(8) }]}>◆</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={tickerStyles.shell}
      accessible
      accessibilityLabel={`Piyasa özeti: ${items.map((it) => `${it.label} ${it.value}`).join(', ')}`}
    >
      <Animated.View style={[tickerStyles.track, { transform: [{ translateX: x }] }]}>
        {row(0)}
        {row(1)}
      </Animated.View>
    </View>
  );
}

const tickerStyles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    backgroundColor: 'rgba(2,8,20,0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242,199,92,0.22)',
    paddingVertical: 8,
  },
  track: { flexDirection: 'row', alignSelf: 'flex-start' },
  row: { flexDirection: 'row', flexShrink: 0 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 14, flexShrink: 0 },
  label: { color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 0.5 },
  value: { color: '#FFFFFF', fontWeight: '800', fontVariant: ['tabular-nums'] },
  sep: { color: 'rgba(242,199,92,0.55)', marginLeft: 8 },
});
