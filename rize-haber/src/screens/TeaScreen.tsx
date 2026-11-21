/**
 * Çay: yaş çay alım fiyatı, hesaplayıcı, yıllara göre fiyatlar ve kaynaklar.
 * Arka planda sabah çay bahçesi sahnesi; içerik cam kartlardadır. Vitrin kartında buharı tüten
 * ince belli çay bardağı bulunur.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { HeroCard } from '../components/HeroCard';
import { loopPhase, useLoopClock, useSceneStill, useScrollTopOnShow } from '../components/motion';
import TeaScene from '../components/TeaScene';
import { Card, LinkRow, SectionTitle } from '../components/ui';
import { formatDateTr, formatLira, formatNumber, parseKg, yearOverYearChange, type TeaData } from '../tea';
import { BUNDLED_TEA_DATA, fetchRemoteTeaData, loadLocalTeaData } from '../teaData';
import { TEA_CHROME, TEA_GLASS as G } from '../teaScene';
import { useTheme } from '../theme';

/** Vitrin kartı: üst solda taze yaprak yeşili, alt sağda koyu bahçe yeşili (cam). */
const HERO_GRADIENT = ['rgba(155,232,180,0.28)', 'rgba(6,40,24,0.55)'] as const;

export default function TeaScreen({ active = true }: { active?: boolean }) {
  const scrollRef = useScrollTopOnShow();
  const { fs } = useTheme();
  const [data, setData] = useState<TeaData>(BUNDLED_TEA_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [kgInput, setKgInput] = useState('');
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;

    const remote = await fetchRemoteTeaData(c.signal);
    if (c.signal.aborted) return;

    if (remote) setData((current) => (remote.updatedAt >= current.updatedAt ? remote : current));
  }, []);

  useEffect(() => {
    loadLocalTeaData().then((local) =>
      setData((current) => (local.updatedAt > current.updatedAt ? local : current)),
    );
    // Açılışta güncel veriyi indir (veri çekme deseni).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    return () => controller.current?.abort();
  }, [refresh]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const change = yearOverYearChange(data);
  const kg = parseKg(kgInput);
  const maxPrice = Math.max(...data.history.map((h) => h.pricePerKg));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: TEA_CHROME.footer },
        container: { flex: 1, backgroundColor: 'transparent' },
        content: { padding: 16, paddingBottom: 32 },
        card: { backgroundColor: G.surface, borderColor: G.border },
        heroShell: { borderWidth: 1, borderColor: 'rgba(155,232,180,0.32)' },
        heroLabel: { color: G.soft, fontSize: fs(14), fontWeight: '600' },
        heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
        heroPrice: { color: G.text, fontSize: fs(48), fontWeight: '800', letterSpacing: -1 },
        heroUnit: { color: G.soft, fontSize: fs(18), fontWeight: '600' },
        badge: {
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.14)',
          borderColor: 'rgba(255,255,255,0.24)',
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginTop: 6,
        },
        badgeText: { color: G.text, fontSize: fs(13), fontWeight: '700' },
        heroMeta: { color: G.soft, fontSize: fs(13), marginTop: 10, lineHeight: fs(19) },
        label: { fontSize: fs(14), color: G.soft, marginBottom: 8 },
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
        resultValue: { fontSize: fs(26), fontWeight: '800', color: G.accent, flexShrink: 1 },
        hint: { fontSize: fs(12), color: G.faint, marginTop: 8, lineHeight: fs(17) },
        barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
        barYear: { width: fs(48), fontSize: fs(15), fontWeight: '700', color: G.soft },
        barYearCurrent: { color: G.text },
        barTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.09)', overflow: 'hidden' },
        barFill: { height: '100%', borderRadius: 7, overflow: 'hidden' },
        barValue: { width: fs(92), textAlign: 'right', fontSize: fs(14), fontWeight: '700', color: G.soft },
        barValueCurrent: { color: G.amber },
        note: { fontSize: fs(14), color: G.text, lineHeight: fs(21) },
        noteRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
        bullet: { color: G.accent, fontSize: fs(14), fontWeight: '800' },
        body: { fontSize: fs(14), color: G.soft, lineHeight: fs(21), marginBottom: 4 },
        updated: { fontSize: fs(12), color: G.faint, textAlign: 'center', marginTop: 16 },
      }),
    [fs],
  );

  const currentYear = data.current.year;

  return (
    <View style={styles.root}>
      <TeaScene active={active} />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[G.accent]}
            tintColor={G.accent}
            progressBackgroundColor={TEA_CHROME.header}
          />
        }
      >
        <HeroCard
          gradient={HERO_GRADIENT}
          style={styles.heroShell}
          watermark="leaf"
          eyebrow={`ÇAYKUR · ${data.current.year} SEZONU`}
          eyebrowIcon="leaf-outline"
          accessibilityLabel={`${data.current.year} yaş çay alım fiyatı kilogram başına ${formatLira(data.current.pricePerKg)}`}
        >
          <TeaGlass running={active} />
          <Text style={styles.heroLabel}>Yaş Çay Alım Fiyatı</Text>
          <View style={styles.heroPriceRow}>
            <Text style={styles.heroPrice}>{formatNumber(data.current.pricePerKg)} ₺</Text>
            <Text style={styles.heroUnit}>/ kg</Text>
          </View>
          {change ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {change.percent >= 0 ? '▲' : '▼'} %{formatNumber(Math.abs(change.percent), 1)} · {change.previous.year}:{' '}
                {formatLira(change.previous.pricePerKg)}
              </Text>
            </View>
          ) : null}
          <Text style={styles.heroMeta}>
            {data.current.announcedBy}
            {'\n'}İlan tarihi: {formatDateTr(data.current.announcedAt)}
          </Text>
        </HeroCard>

        <SectionTitle light hint="Teslim ettiğiniz yaş çayın tutarını hesaplayın">
          Hesaplayıcı
        </SectionTitle>
        <Card style={styles.card}>
          <Text style={styles.label}>Yaş çay miktarı (kg)</Text>
          <TextInput
            value={kgInput}
            onChangeText={setKgInput}
            placeholder="Örnek: 1250"
            placeholderTextColor={G.faint}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel="Yaş çay miktarı, kilogram"
            maxLength={12}
          />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tutar</Text>
            <Text style={styles.resultValue} numberOfLines={1} adjustsFontSizeToFit>
              {kg ? formatLira(kg * data.current.pricePerKg) : '—'}
            </Text>
          </View>
          <Text style={styles.hint}>
            {formatNumber(data.current.pricePerKg)} ₺/kg üzerinden brüt tutardır. Kesintiler, destekler ve ödeme
            koşulları dahil değildir.
          </Text>
        </Card>

        <SectionTitle light>Yıllara göre alım fiyatı</SectionTitle>
        <Card style={styles.card}>
          {data.history.map((h) => {
            const current = h.year === currentYear;
            return (
              <View key={h.year} style={styles.barRow}>
                <Text style={[styles.barYear, current && styles.barYearCurrent]} numberOfLines={1}>
                  {h.year}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(h.pricePerKg / maxPrice) * 100}%` }]}>
                    <LinearGradient
                      colors={current ? ['#5FD08F', G.amber] : ['rgba(95,208,143,0.55)', 'rgba(155,232,180,0.8)']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
                <Text style={[styles.barValue, current && styles.barValueCurrent]} numberOfLines={1}>
                  {formatLira(h.pricePerKg)}
                </Text>
              </View>
            );
          })}
        </Card>

        {data.notes.length > 0 ? (
          <>
            <SectionTitle light>Bilgi</SectionTitle>
            <Card style={styles.card}>
              {data.notes.map((n) => (
                <View key={n} style={styles.noteRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.note, { flex: 1 }]}>{n}</Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <SectionTitle light>Kuru çay satış fiyatları</SectionTitle>
        <Card style={styles.card}>
          <Text style={styles.body}>
            ÇAYKUR ürünlerinin güncel satış fiyatları ürüne ve ambalaja göre değişir. Doğru bilgi için resmî
            kaynağı kullanın.
          </Text>
          <LinkRow glass label="ÇAYKUR ürünleri ve fiyatları" url="https://www.caykur.gov.tr" />
        </Card>

        <SectionTitle light>Kaynaklar</SectionTitle>
        <Card style={styles.card}>
          {data.links.map((l) => (
            <LinkRow glass key={l.url} label={l.label} url={l.url} />
          ))}
        </Card>

        <Text style={styles.updated}>Veri güncelleme tarihi: {formatDateTr(data.updatedAt)}</Text>
      </ScrollView>
    </View>
  );
}

// ——— Vitrin kartındaki ince belli çay bardağı ve tüten buhar ———

function TeaGlass({ running }: { running: boolean }) {
  const reduced = useSceneStill();
  const moving = running && !reduced;
  const clock = useLoopClock(3600, moving);
  const wisps = [0, 1, 2].map((i) => {
    const t = loopPhase(clock, 1, i / 3);
    return {
      left: 15 + i * 7,
      translateY: moving ? t.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }) : -8 - i * 4,
      translateX: moving ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, i % 2 ? 3 : -3, 0] }) : 0,
      opacity: moving ? t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.45, 0] }) : 0.3,
    };
  });
  return (
    <View style={glassStyles.wrap} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {wisps.map((w, i) => (
        <Animated.View
          key={i}
          style={[glassStyles.wisp, { left: w.left, opacity: w.opacity, transform: [{ translateY: w.translateY }, { translateX: w.translateX }] }]}
        />
      ))}
      {/* Bardak: geniş ağız, ince bel, dolgun gövde; içinde demli çay */}
      <View style={glassStyles.rim} />
      <View style={glassStyles.upper}>
        <LinearGradient colors={G.tea} style={[StyleSheet.absoluteFill, { top: 5 }]} />
        <View style={glassStyles.shine} />
      </View>
      <View style={glassStyles.waist}>
        <LinearGradient colors={[G.tea[1], G.tea[1]]} style={StyleSheet.absoluteFill} />
      </View>
      <View style={glassStyles.lower}>
        <LinearGradient colors={[G.tea[1], '#5E1A0B']} style={StyleSheet.absoluteFill} />
      </View>
      <View style={glassStyles.saucer} />
    </View>
  );
}

const glassStyles = StyleSheet.create({
  wrap: { position: 'absolute', top: 4, right: 6, width: 46, height: 88, alignItems: 'center', justifyContent: 'flex-end' },
  wisp: { position: 'absolute', top: 10, width: 3, height: 14, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' },
  rim: { width: 34, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)' },
  upper: {
    width: 32,
    height: 27,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  shine: { position: 'absolute', left: 5, top: 5, width: 3, height: 13, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  waist: { width: 13, height: 3, overflow: 'hidden' },
  lower: {
    width: 22,
    height: 14,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  saucer: { width: 46, height: 5, borderRadius: 3, marginTop: 1, backgroundColor: 'rgba(255,255,255,0.45)' },
});
