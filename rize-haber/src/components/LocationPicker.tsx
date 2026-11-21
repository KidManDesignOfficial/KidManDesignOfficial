/**
 * Konum seçici: 12 ilçe, Ayder ve ilçelere bağlı köy, belde ve yaylalar.
 *
 * - Üst düzeyde ilçeler listelenir; satıra dokunmak ilçe merkezini seçer, sağdaki düğme
 *   o ilçenin köylerini açar.
 * - Arama kutusu Türkçe harflere duyarsızdır ve köylerin eski adlarını da bulur.
 * - Tamamen çevrimdışıdır; veri uygulamayla gelir (GeoNames, CC BY 4.0).
 */
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { tapFeedback } from '../haptics';
import {
  DISTRICT_PLACES,
  districtName,
  districtPlaceCount,
  kindLabel,
  placeById,
  placeSubtitle,
  placesInDistrict,
  searchPlaces,
  type Place,
  type PlaceKind,
} from '../places';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { useReducedMotion } from './motion';

const KIND_ICON: Record<PlaceKind, IconName> = {
  ilce: 'business-outline',
  belde: 'storefront-outline',
  koy: 'home-outline',
  yayla: 'trail-sign-outline',
};

type Row =
  | { type: 'header'; key: string; title: string; count?: number }
  | { type: 'place'; key: string; place: Place; note?: string; drill?: boolean };

export default function LocationPicker({
  visible,
  selectedId,
  recentIds = [],
  title = 'Konum seç',
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedId: string;
  recentIds?: readonly string[];
  title?: string;
  onSelect: (place: Place) => void;
  onClose: () => void;
}) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState<string | null>(null);

  const close = useCallback(() => {
    setQuery('');
    setDistrict(null);
    onClose();
  }, [onClose]);

  const pick = useCallback(
    (place: Place) => {
      tapFeedback();
      Keyboard.dismiss();
      onSelect(place);
      close();
    },
    [onSelect, close],
  );

  const rows = useMemo<Row[]>(() => {
    if (query.trim()) {
      return searchPlaces(query).map(({ place, matchedAka }) => ({
        type: 'place',
        key: place.id,
        place,
        note: matchedAka ? `Eski adı: ${matchedAka}` : undefined,
      }));
    }
    if (district) {
      const center = placeById(district);
      const all = placesInDistrict(district);
      const out: Row[] = center ? [{ type: 'place', key: center.id, place: center }] : [];
      // Ayder, Çamlıhemşin'in yaylaları arasında da görünsün.
      const extra = DISTRICT_PLACES.filter((p) => p.kind !== 'ilce' && p.district === district);
      const groups: [PlaceKind, string][] = [
        ['belde', 'Beldeler'],
        ['koy', 'Köyler'],
        ['yayla', 'Yaylalar'],
      ];
      for (const [kind, label] of groups) {
        const items = [...(kind === 'yayla' ? extra : []), ...all.filter((p) => p.kind === kind)];
        if (items.length === 0) continue;
        out.push({ type: 'header', key: `h-${kind}`, title: label, count: items.length });
        for (const p of items) out.push({ type: 'place', key: p.id, place: p });
      }
      return out;
    }
    const out: Row[] = [];
    const recents = recentIds.map(placeById).filter((p): p is Place => !!p && p.kind !== 'ilce');
    if (recents.length > 0) {
      out.push({ type: 'header', key: 'h-recent', title: 'Son seçilenler' });
      for (const p of recents) out.push({ type: 'place', key: `r-${p.id}`, place: p });
    }
    out.push({ type: 'header', key: 'h-districts', title: 'İlçeler', count: 12 });
    for (const p of DISTRICT_PLACES) out.push({ type: 'place', key: p.id, place: p, drill: p.kind === 'ilce' });
    return out;
  }, [query, district, recentIds]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        top: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 8,
          paddingVertical: 8,
          backgroundColor: colors.header,
        },
        topButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
        topTitle: { flex: 1, color: '#FFFFFF', fontSize: fs(19), fontWeight: '800' },
        searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, backgroundColor: colors.background },
        searchField: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          paddingLeft: 12,
        },
        searchInput: { flex: 1, paddingVertical: 11, paddingRight: 8, fontSize: fs(16), color: colors.text },
        clear: { padding: 10 },
        hint: { fontSize: fs(12), color: colors.textMuted, paddingHorizontal: 18, paddingBottom: 4, lineHeight: fs(17) },
        list: { paddingBottom: 32 },
        header: {
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 8,
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 6,
        },
        headerText: { fontSize: fs(12), fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 },
        headerCount: { fontSize: fs(12), color: colors.textMuted },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 58,
          marginHorizontal: 12,
          borderRadius: 14,
        },
        rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingLeft: 8 },
        rowPressed: { backgroundColor: colors.primarySoft },
        rowSelected: { backgroundColor: colors.primarySoft },
        iconBox: {
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        name: { fontSize: fs(16), fontWeight: '700', color: colors.text },
        sub: { fontSize: fs(12.5), color: colors.textMuted, marginTop: 1 },
        note: { fontSize: fs(12), color: colors.primary, marginTop: 1, fontWeight: '600' },
        drill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginRight: 4,
          borderRadius: 999,
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        drillText: { fontSize: fs(12.5), fontWeight: '700', color: colors.primary },
        empty: { padding: 32, alignItems: 'center', gap: 8 },
        emptyText: { fontSize: fs(15), color: colors.textMuted, textAlign: 'center', lineHeight: fs(21) },
        credit: { fontSize: fs(11), color: colors.textMuted, textAlign: 'center', marginTop: 18, paddingHorizontal: 24 },
      }),
    [colors, fs],
  );

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.type === 'header') {
        return (
          <View style={styles.header} accessibilityRole="header">
            <Text style={styles.headerText}>{item.title.toLocaleUpperCase('tr-TR')}</Text>
            {item.count != null ? <Text style={styles.headerCount}>{item.count}</Text> : null}
          </View>
        );
      }
      const p = item.place;
      const selected = p.id === selectedId;
      const isCenterInDistrict = district != null && p.kind === 'ilce';
      const label = isCenterInDistrict ? `${p.name} (merkez)` : p.name;
      const sub = query.trim() || !district || p.kind === 'ilce' ? placeSubtitle(p) : subtitleInDistrict(p);
      const count = item.drill ? districtPlaceCount(p.id) : 0;
      return (
        <View style={[styles.row, selected && styles.rowSelected]}>
          <Pressable
            onPress={() => pick(p)}
            style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed, { borderRadius: 14 }]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label}, ${sub}`}
          >
            <View style={styles.iconBox}>
              <Icon name={KIND_ICON[p.kind]} size={19} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {sub}
              </Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
            {selected ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}
          </Pressable>
          {item.drill && count > 0 ? (
            <Pressable
              onPress={() => {
                tapFeedback();
                setDistrict(p.id);
              }}
              style={styles.drill}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${districtName(p.id)} köyleri ve yaylaları, ${count} yer`}
            >
              <Text style={styles.drillText}>{count} yer</Text>
              <Icon name="chevron-forward" size={15} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      );
    },
    [styles, selectedId, district, query, pick, colors.primary],
  );

  const heading = district && !query.trim() ? districtName(district) : title;

  return (
    <Modal
      visible={visible}
      animationType={reduced ? 'none' : 'slide'}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
      onRequestClose={() => (district && !query ? setDistrict(null) : close())}
      statusBarTranslucent
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.top}>
            {district ? (
              <Pressable
                onPress={() => setDistrict(null)}
                style={styles.topButton}
                accessibilityRole="button"
                accessibilityLabel="İlçelere dön"
              >
                <Icon name="arrow-back" size={22} color="#FFFFFF" />
              </Pressable>
            ) : (
              <View style={{ width: 8 }} />
            )}
            <Text style={styles.topTitle} numberOfLines={1} accessibilityRole="header">
              {heading}
            </Text>
            <Pressable onPress={close} style={styles.topButton} accessibilityRole="button" accessibilityLabel="Kapat">
              <Icon name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.searchField}>
              <Icon name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Köy, yayla veya ilçe ara"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="search"
                accessibilityLabel="Konum ara"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} style={styles.clear} accessibilityRole="button" accessibilityLabel="Aramayı temizle">
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
          </View>
          {!query && !district ? (
            <Text style={styles.hint}>Köyünü bulmak için adını yaz ya da ilçenin yanındaki düğmeye dokun. Eski köy adlarıyla da arayabilirsin.</Text>
          ) : null}

          <FlatList
            data={rows}
            keyExtractor={(r) => r.key}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={18}
            windowSize={9}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Icon name="search-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  “{query.trim()}” bulunamadı.{'\n'}Yazımı kontrol edin ya da köyün bağlı olduğu ilçeyi seçin.
                </Text>
              </View>
            }
            ListFooterComponent={<Text style={styles.credit}>Köy ve yayla konumları: GeoNames (CC BY 4.0)</Text>}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

/** İlçe görünümünde ilçe adı tekrar edilmez: "Köy · 820 m". */
function subtitleInDistrict(p: Place): string {
  const parts = [kindLabel(p.kind)];
  if (p.elevation != null) parts.push(`${p.elevation.toLocaleString('tr-TR')} m`);
  return parts.join(' · ');
}
