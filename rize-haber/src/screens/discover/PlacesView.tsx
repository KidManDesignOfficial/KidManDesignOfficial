import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { mix } from '../../colors';
import { Icon, type IconName } from '../../components/Icon';
import { Chevron, Collapsible, FadeInView, PressableScale, useAnimatedValue } from '../../components/motion';
import { pressFeedback } from '../../haptics';
import { Chip, ChipRow, openUrl } from '../../components/ui';
import { PLACE_CATEGORIES, PLACES, VISIT_LABELS, mapsUrl, type Place, type PlaceCategory } from '../../data/discover';
import { loadPlaceList, savePlaceList } from '../../storage';
import { formatKm, distanceKm } from '../../explore';
import { useTheme, type Colors } from '../../theme';
import type { ExploreRef } from '../../useExploreLocation';

/** Kategori renkleri: yayla yeşil, doğa deniz mavisi, tarih toprak, müze mor. */
const CATEGORY_TINT: Record<PlaceCategory, string> = {
  yayla: '#2E7D4F',
  doga: '#0E6E7E',
  tarih: '#8A5A2B',
  muze: '#5B3F8C',
};

type Filter = 'all' | PlaceCategory | 'list';

export default function PlacesView({ origin }: { origin: ExploreRef }) {
  const { colors, fs } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [myList, setMyList] = useState<string[]>([]);
  const [byDistance, setByDistance] = useState(false);

  useEffect(() => {
    loadPlaceList().then(setMyList);
  }, []);

  const toggleList = useCallback((id: string) => {
    pressFeedback();
    setMyList((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      savePlaceList(next);
      return next;
    });
  }, []);

  const distances = useMemo(() => new Map(PLACES.map((p) => [p.id, distanceKm(origin, p)])), [origin]);
  const visible = useMemo(() => {
    const list =
      filter === 'all'
        ? PLACES
        : filter === 'list'
          ? PLACES.filter((p) => myList.includes(p.id))
          : PLACES.filter((p) => p.category === filter);
    return byDistance ? [...list].sort((a, b) => distances.get(a.id)! - distances.get(b.id)!) : list;
  }, [byDistance, distances, filter, myList]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 32 },
        hero: { marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 20, gap: 6 },
        heroTitle: { color: '#FFFFFF', fontSize: fs(24), fontWeight: '800' },
        heroText: { color: 'rgba(255,255,255,0.9)', fontSize: fs(14), lineHeight: fs(20) },
        heroStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
        heroStat: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '700' },
        list: { paddingHorizontal: 16, gap: 12 },
        empty: { padding: 32, alignItems: 'center', gap: 8 },
        emptyIcon: { fontSize: fs(40) },
        emptyText: { fontSize: fs(14), color: colors.textMuted, textAlign: 'center', lineHeight: fs(20) },
        count: { fontSize: fs(13), color: colors.textMuted, marginHorizontal: 16, marginBottom: 8 },
      }),
    [colors, fs],
  );

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tümü' },
    ...PLACE_CATEGORIES.map((c) => ({ id: c.id as Filter, label: `${c.icon} ${c.label}` })),
    { id: 'list', label: `♥ Listem${myList.length ? ` (${myList.length})` : ''}` },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={[colors.header, mix(colors.header, '#000000', 0.35)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Kaçkarlar’dan Karadeniz’e</Text>
        <Text style={styles.heroText}>
          Yaylalar, şelaleler, kaleler ve müzeler. Gitmek istediklerinizi listenize ekleyin, haritada tek
          dokunuşla açın.
        </Text>
        <View style={styles.heroStats}>
          <Text style={styles.heroStat}>📍 {PLACES.length} yer</Text>
          <Text style={styles.heroStat}>⛰️ {PLACES.filter((p) => p.category === 'yayla').length} yayla</Text>
          <Text style={styles.heroStat}>♥ {myList.length} listede</Text>
        </View>
      </LinearGradient>

      <ChipRow>
        {chips.map((c) => (
          <Chip key={c.id} label={c.label} selected={filter === c.id} onPress={() => setFilter(c.id)} />
        ))}
      </ChipRow>
      <ChipRow>
        <Chip label="Önerilen sıra" selected={!byDistance} onPress={() => setByDistance(false)} />
        <Chip label={origin.source === 'gps' ? '📍 Bana yakın olanlar' : `📍 Yakına göre (${origin.label})`} selected={byDistance} onPress={() => setByDistance(true)} />
      </ChipRow>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart-outline" size={fs(40)} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Listeniz boş. Bir yerin ayrıntısını açıp “Listeme ekle”ye dokunun; gezi planınız burada birikir.
          </Text>
        </View>
      ) : (
        <FadeInView key={filter} style={styles.list}>
          {visible.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              open={openId === place.id}
              inList={myList.includes(place.id)}
              km={distances.get(place.id) ?? null}
              onToggleOpen={() => setOpenId((id) => (id === place.id ? null : place.id))}
              onToggleList={() => toggleList(place.id)}
              colors={colors}
              fs={fs}
            />
          ))}
        </FadeInView>
      )}
    </ScrollView>
  );
}

type CardProps = {
  place: Place;
  km: number | null;
  open: boolean;
  inList: boolean;
  onToggleOpen: () => void;
  onToggleList: () => void;
  colors: Colors;
  fs: (n: number) => number;
};

const PlaceCard = memo(function PlaceCard({ place, km, open, inList, onToggleOpen, onToggleList, colors, fs }: CardProps) {
  const category = PLACE_CATEGORIES.find((c) => c.id === place.category)!;
  const progress = useAnimatedValue(open ? 1 : 0);
  const tint = colors.isDark ? mix(CATEGORY_TINT[place.category], '#000000', 0.25) : CATEGORY_TINT[place.category];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        band: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 4 },
        bandTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        badge: {
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 3,
        },
        badgeText: { color: '#FFFFFF', fontSize: fs(12), fontWeight: '700' },
        heart: { color: '#FFFFFF', fontSize: fs(18) },
        name: { color: '#FFFFFF', fontSize: fs(20), fontWeight: '800', marginTop: 4 },
        district: { color: 'rgba(255,255,255,0.85)', fontSize: fs(13), fontWeight: '600' },
        body: { padding: 16, gap: 10 },
        tagline: { fontSize: fs(15), color: colors.text, lineHeight: fs(21), fontWeight: '500' },
        more: { fontSize: fs(13), color: colors.primary, fontWeight: '700' },
        moreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        details: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
        description: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        highlight: { flexDirection: 'row', gap: 8 },
        bullet: { color: tint, fontSize: fs(14), fontWeight: '800' },
        highlightText: { flex: 1, fontSize: fs(14), color: colors.text, lineHeight: fs(20) },
        note: { fontSize: fs(12), color: colors.textMuted, fontStyle: 'italic', lineHeight: fs(17) },
        actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
        actionWrap: { flexGrow: 1, flexBasis: '45%' },
        action: {
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        actionPrimary: { backgroundColor: tint, borderColor: tint },
        actionText: { fontSize: fs(14), fontWeight: '700', color: colors.text },
        actionTextPrimary: { color: '#FFFFFF' },
        actionActive: { borderColor: tint, backgroundColor: colors.primarySoft },
      }),
    [colors, fs, tint],
  );

  const share = () =>
    Share.share({
      message: `${place.name} (${place.district}, Rize)\n${place.tagline}\n${mapsUrl(place.mapsQuery)}\n\nRize Haber uygulamasından paylaşıldı.`,
    }).catch(() => {});

  return (
    <View style={styles.card}>
      <PressableScale
        onPress={onToggleOpen}
        scaleTo={0.985}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${place.name}, ${place.district}. ${place.tagline}`}
        accessibilityHint={open ? 'Ayrıntıları kapatır' : 'Ayrıntıları açar'}
      >
        <LinearGradient colors={[tint, mix(tint, '#000000', 0.3)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.band}>
          <View style={styles.bandTop}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {category.icon} {category.label}
              </Text>
            </View>
            {inList ? <Icon name="heart" size={fs(20)} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.district}>
            📍 {place.district}
            {km !== null ? ` · ${formatKm(km)} uzakta` : ''} · {VISIT_LABELS[place.visit]}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.tagline}>{place.tagline}</Text>
          <View style={styles.moreRow}>
            <Text style={styles.more}>{open ? 'Daha az göster' : 'Ayrıntılar'}</Text>
            <Chevron progress={progress} color={colors.primary} size={fs(14)} />
          </View>
        </View>
      </PressableScale>

      <Collapsible open={open} progress={progress}>
        <View style={styles.details}>
          <Text style={styles.description}>{place.description}</Text>
          {place.highlights.map((h) => (
            <View key={h} style={styles.highlight}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.highlightText}>{h}</Text>
            </View>
          ))}
          {place.note ? <Text style={styles.note}>Not: {place.note}</Text> : null}

          <View style={styles.actions}>
            <PressableScale
              onPress={() => Linking.openURL(mapsUrl(place.mapsQuery)).catch(() => {})}
              style={[styles.action, styles.actionPrimary]}
              containerStyle={styles.actionWrap}
              accessibilityRole="button"
            >
              <ActionLabel icon="map-outline" text="Haritada aç" color="#FFFFFF" style={[styles.actionText, styles.actionTextPrimary]} />
            </PressableScale>
            <PressableScale
              onPress={onToggleList}
              style={[styles.action, inList && styles.actionActive]}
              containerStyle={styles.actionWrap}
              accessibilityRole="button"
              accessibilityState={{ selected: inList }}
            >
              <ActionLabel icon={inList ? 'heart' : 'heart-outline'} text={inList ? 'Listemde' : 'Listeme ekle'} color={inList ? tint : colors.text} style={styles.actionText} />
            </PressableScale>
            <PressableScale onPress={share} style={styles.action} containerStyle={styles.actionWrap} accessibilityRole="button">
              <ActionLabel icon="share-social-outline" text="Paylaş" color={colors.text} style={styles.actionText} />
            </PressableScale>
            <PressableScale
              onPress={() => openUrl(place.sourceUrl, colors)}
              style={styles.action}
              containerStyle={styles.actionWrap}
              accessibilityRole="link"
            >
              <ActionLabel icon="document-text-outline" text="Kaynak" color={colors.text} style={styles.actionText} />
            </PressableScale>
          </View>
          <Pressable onPress={onToggleOpen} accessibilityRole="button" hitSlop={8} style={styles.moreRow}>
            <Text style={styles.more}>Kapat</Text>
            <Chevron progress={progress} color={colors.primary} size={fs(14)} />
          </Pressable>
        </View>
      </Collapsible>
    </View>
  );
});

function ActionLabel({ icon, text, color, style }: { icon: IconName; text: string; color: string; style: object | object[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={17} color={color} />
      <Text style={style}>{text}</Text>
    </View>
  );
}
