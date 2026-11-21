import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HeroCard } from '../components/HeroCard';
import { Card, LinkRow, SectionTitle } from '../components/ui';
import { formatDateTr, formatLira, formatNumber, parseKg, yearOverYearChange, type TeaData } from '../tea';
import { BUNDLED_TEA_DATA, fetchRemoteTeaData, loadLocalTeaData } from '../teaData';
import { useTheme } from '../theme';

export default function TeaScreen() {
  const { colors, fs } = useTheme();
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
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 32 },
        heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: fs(14), fontWeight: '600' },
        heroPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
        heroPrice: { color: '#FFFFFF', fontSize: fs(48), fontWeight: '800', letterSpacing: -1 },
        heroUnit: { color: 'rgba(255,255,255,0.85)', fontSize: fs(18), fontWeight: '600' },
        badge: {
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderColor: 'rgba(255,255,255,0.26)',
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginTop: 6,
        },
        badgeText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '700' },
        heroMeta: { color: 'rgba(255,255,255,0.8)', fontSize: fs(13), marginTop: 10, lineHeight: fs(19) },
        label: { fontSize: fs(14), color: colors.textMuted, marginBottom: 8 },
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
        resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 },
        resultLabel: { fontSize: fs(15), color: colors.textMuted },
        resultValue: { fontSize: fs(26), fontWeight: '800', color: colors.primary },
        hint: { fontSize: fs(12), color: colors.textMuted, marginTop: 8, lineHeight: fs(17) },
        barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
        barYear: { width: fs(48), fontSize: fs(15), fontWeight: '700', color: colors.text },
        barTrack: { flex: 1, height: 14, borderRadius: 7, backgroundColor: colors.primarySoft, overflow: 'hidden' },
        barFill: { height: '100%', borderRadius: 7, backgroundColor: colors.primary },
        barValue: { width: fs(92), textAlign: 'right', fontSize: fs(14), fontWeight: '700', color: colors.text },
        note: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        noteRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
        bullet: { color: colors.primary, fontSize: fs(14), fontWeight: '800' },
        body: { fontSize: fs(14), color: colors.text, lineHeight: fs(21), marginBottom: 4 },
        updated: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 16 },
      }),
    [colors, fs],
  );

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
      <HeroCard
        watermark="leaf"
        eyebrow={`ÇAYKUR · ${data.current.year} SEZONU`}
        eyebrowIcon="leaf-outline"
        accessibilityLabel={`${data.current.year} yaş çay alım fiyatı kilogram başına ${formatLira(data.current.pricePerKg)}`}
      >
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

      <SectionTitle hint="Teslim ettiğiniz yaş çayın tutarını hesaplayın">Hesaplayıcı</SectionTitle>
      <Card>
        <Text style={styles.label}>Yaş çay miktarı (kg)</Text>
        <TextInput
          value={kgInput}
          onChangeText={setKgInput}
          placeholder="Örnek: 1250"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={styles.input}
          accessibilityLabel="Yaş çay miktarı, kilogram"
          maxLength={12}
        />
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Tutar</Text>
          <Text style={styles.resultValue}>{kg ? formatLira(kg * data.current.pricePerKg) : '—'}</Text>
        </View>
        <Text style={styles.hint}>
          {formatNumber(data.current.pricePerKg)} ₺/kg üzerinden brüt tutardır. Kesintiler, destekler ve ödeme
          koşulları dahil değildir.
        </Text>
      </Card>

      <SectionTitle>Yıllara göre alım fiyatı</SectionTitle>
      <Card>
        {data.history.map((h) => (
          <View key={h.year} style={styles.barRow}>
            <Text style={styles.barYear} numberOfLines={1}>
              {h.year}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(h.pricePerKg / maxPrice) * 100}%` }]} />
            </View>
            <Text style={styles.barValue} numberOfLines={1}>
              {formatLira(h.pricePerKg)}
            </Text>
          </View>
        ))}
      </Card>

      {data.notes.length > 0 ? (
        <>
          <SectionTitle>Bilgi</SectionTitle>
          <Card>
            {data.notes.map((n) => (
              <View key={n} style={styles.noteRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.note, { flex: 1 }]}>{n}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle>Kuru çay satış fiyatları</SectionTitle>
      <Card>
        <Text style={styles.body}>
          ÇAYKUR ürünlerinin güncel satış fiyatları ürüne ve ambalaja göre değişir. Doğru bilgi için resmî
          kaynağı kullanın.
        </Text>
        <LinkRow label="ÇAYKUR ürünleri ve fiyatları" url="https://www.caykur.gov.tr" />
      </Card>

      <SectionTitle>Kaynaklar</SectionTitle>
      <Card>
        {data.links.map((l) => (
          <LinkRow key={l.url} label={l.label} url={l.url} />
        ))}
      </Card>

      <Text style={styles.updated}>Veri güncelleme tarihi: {formatDateTr(data.updatedAt)}</Text>
    </ScrollView>
  );
}
