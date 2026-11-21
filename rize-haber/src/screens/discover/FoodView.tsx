import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { mix } from '../../colors';
import { HeroCard } from '../../components/HeroCard';
import { Chip, ChipRow, SectionTitle, openUrl } from '../../components/ui';
import { CULTURE, FOOD_KINDS, FOODS, type Food } from '../../data/discover';
import { useTheme } from '../../theme';
import type { ExploreRef } from '../../useExploreLocation';
import VenueList from './VenueList';
import { useScrollTopOnShow } from '../../components/motion';

type Filter = 'all' | Food['kind'] | 'gi';

const GOLD = '#B8860B';

/** Coğrafi işaretli toplam ürün: lezzetler + kültür ürünleri (Rize Bezi, Hemşin Çorabı). */
export const GEO_INDICATION_COUNT =
  FOODS.filter((f) => f.geoIndication).length + CULTURE.filter((c) => c.badge?.startsWith('Coğrafi')).length;

export default function FoodView({ origin }: { origin: ExploreRef }) {
  const scrollRef = useScrollTopOnShow();
  const { colors, fs } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return FOODS;
    if (filter === 'gi') return FOODS.filter((f) => f.geoIndication);
    return FOODS.filter((f) => f.kind === filter);
  }, [filter]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 32 },
        hero: { marginHorizontal: 16, marginTop: 12 },
        heroRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
        heroNumber: { color: '#FFFFFF', fontSize: fs(44), fontWeight: '800' },
        heroBody: { flex: 1, gap: 2 },
        heroTitle: { color: '#FFFFFF', fontSize: fs(16), fontWeight: '800' },
        heroText: { color: 'rgba(255,255,255,0.9)', fontSize: fs(13), lineHeight: fs(18) },
        list: { paddingHorizontal: 16, gap: 10 },
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
          flexDirection: 'row',
          gap: 12,
        },
        iconWrap: {
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        icon: { fontSize: 24 },
        body: { flex: 1, gap: 4 },
        name: { fontSize: fs(16), fontWeight: '800', color: colors.text },
        badge: {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 2,
          backgroundColor: colors.isDark ? mix(GOLD, '#000000', 0.6) : mix(GOLD, '#FFFFFF', 0.85),
        },
        badgeText: { fontSize: fs(11), fontWeight: '700', color: colors.isDark ? '#F2D27A' : '#7A5A00' },
        description: { fontSize: fs(14), color: colors.text, lineHeight: fs(20) },
        source: { fontSize: fs(12), color: colors.primary, fontWeight: '600', marginTop: 2 },
      }),
    [colors, fs],
  );

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tümü' },
    { id: 'gi', label: '🏅 Coğrafi işaretli' },
    ...FOOD_KINDS.map((k) => ({ id: k.id as Filter, label: `${k.icon} ${k.label}` })),
  ];

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <HeroCard
        gradient={[mix(GOLD, '#5A3A00', 0.35), mix(GOLD, '#000000', 0.55)]}
        watermark="restaurant-outline"
        eyebrow="COĞRAFİ İŞARET"
        eyebrowIcon="ribbon-outline"
        style={styles.hero}
      >
        <View style={styles.heroRow}>
        <Text style={styles.heroNumber}>{GEO_INDICATION_COUNT}</Text>
        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>coğrafi işaretli ürün</Text>
          <Text style={styles.heroText}>
            Rize Çayı’ndan Anzer Balı’na, muhlamadan pepeçuraya; Türk Patent tescilli Rize lezzetleri.
          </Text>
        </View>
        </View>
      </HeroCard>

      <VenueList origin={origin} />

      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle hint="Coğrafi işaretli ürünler ve yöresel yemekler">Yöresel lezzetler</SectionTitle>
      </View>
      <ChipRow>
        {chips.map((c) => (
          <Chip key={c.id} label={c.label} selected={filter === c.id} onPress={() => setFilter(c.id)} />
        ))}
      </ChipRow>

      <View style={styles.list}>
        {visible.map((food) => {
          return (
            <View key={food.id} style={styles.card}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{food.icon}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name}>{food.name}</Text>
                {food.geoIndication ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🏅 {food.geoIndication}</Text>
                  </View>
                ) : null}
                <Text style={styles.description}>{food.description}</Text>
                <Pressable onPress={() => openUrl(food.sourceUrl, colors)} accessibilityRole="link" hitSlop={6}>
                  <Text style={styles.source}>Kaynak ↗</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
