import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeroCard } from '../components/HeroCard';
import { Card, LinkRow, SectionTitle } from '../components/ui';
import {
  RIZE_DISTRICTS,
  RIZE_FACTS,
  RIZE_HISTORY,
  RIZE_NAME_ORIGIN,
  RIZE_SOURCES,
  TEA_HISTORY,
  type TimelineEntry,
} from '../data/rize';
import { useTheme } from '../theme';
import { useScrollTopOnShow } from '../components/motion';

export default function RizeScreen() {
  const scrollRef = useScrollTopOnShow();
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 32 },
        heroTitle: { color: '#FFFFFF', fontSize: fs(34), fontWeight: '800', letterSpacing: -0.5 },
        heroText: { color: 'rgba(255,255,255,0.9)', fontSize: fs(14), lineHeight: fs(20), maxWidth: 300, marginBottom: 28 },
        facts: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginTop: 12 },
        fact: { width: '50%', padding: 4, alignSelf: 'stretch' },
        factInner: {
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          gap: 2,
        },
        factLabel: { fontSize: fs(12), color: colors.textMuted },
        factValue: { fontSize: fs(16), fontWeight: '700', color: colors.text },
        districts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        district: {
          backgroundColor: colors.primarySoft,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        districtText: { color: colors.primary, fontSize: fs(14), fontWeight: '600' },
        body: { fontSize: fs(15), color: colors.text, lineHeight: fs(23) },
        disclaimer: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 16, lineHeight: fs(17) },
      }),
    [colors, fs],
  );

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <HeroCard watermark="compass-outline" eyebrow="DOĞU KARADENİZ · 53" eyebrowIcon="location-outline" mountains>
        <Text style={styles.heroTitle}>Rize</Text>
        <Text style={styles.heroText}>
          Doğu Karadeniz’in yeşil kıyı şehri; Türkiye çayının ana vatanı ve Kaçkar Dağları’nın kapısı.
        </Text>
      </HeroCard>

      <View style={styles.facts}>
        {RIZE_FACTS.map((f) => (
          <View key={f.label} style={styles.fact}>
            <View style={styles.factInner}>
              <Text style={styles.factLabel}>{f.label}</Text>
              <Text style={styles.factValue}>{f.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <SectionTitle>İlçeler</SectionTitle>
      <View style={styles.districts}>
        {RIZE_DISTRICTS.map((d) => (
          <View key={d} style={styles.district}>
            <Text style={styles.districtText}>{d}</Text>
          </View>
        ))}
      </View>

      <SectionTitle>Adın kökeni</SectionTitle>
      <Card>
        <Text style={styles.body}>{RIZE_NAME_ORIGIN}</Text>
      </Card>

      <SectionTitle hint="Antik çağdan Cumhuriyet’e">Tarihçe</SectionTitle>
      <Timeline entries={RIZE_HISTORY} />

      <SectionTitle hint="1923’ten ÇAYKUR’a">Rize’de çayın hikâyesi</SectionTitle>
      <Timeline entries={TEA_HISTORY} />

      <SectionTitle>Kaynaklar</SectionTitle>
      <Card>
        {RIZE_SOURCES.map((s) => (
          <LinkRow key={s.url} label={s.label} url={s.url} />
        ))}
      </Card>

      <Text style={styles.disclaimer}>
        Bilgiler resmî kurumların yayımladığı tarihçe sayfalarından derlenmiştir. Kaynaklar arasında farklılık
        bulunan tarihler ilgili maddede ayrıca belirtilmiştir.
      </Text>
    </ScrollView>
  );
}

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', gap: 12 },
        rail: { width: 16, alignItems: 'center' },
        dot: {
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: colors.primary,
          borderWidth: 3,
          borderColor: colors.primarySoft,
          marginTop: 4,
        },
        line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
        body: { flex: 1, paddingBottom: 18, gap: 3 },
        period: { fontSize: fs(13), fontWeight: '800', color: colors.primary, letterSpacing: 0.3 },
        title: { fontSize: fs(16), fontWeight: '700', color: colors.text },
        text: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        note: {
          fontSize: fs(12),
          color: colors.textMuted,
          lineHeight: fs(17),
          marginTop: 4,
          fontStyle: 'italic',
        },
      }),
    [colors, fs],
  );

  return (
    <View>
      {entries.map((e, i) => (
        <View key={`${e.period}-${e.title}`} style={styles.row}>
          <View style={styles.rail}>
            <View style={styles.dot} />
            {i < entries.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.body}>
            <Text style={styles.period}>{e.period}</Text>
            <Text style={styles.title}>{e.title}</Text>
            <Text style={styles.text}>{e.text}</Text>
            {e.note ? <Text style={styles.note}>Not: {e.note}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
