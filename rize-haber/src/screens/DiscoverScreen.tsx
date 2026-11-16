import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { FadeInView, PressableScale, useReducedMotion } from '../components/motion';
import { useTheme } from '../theme';
import CultureView from './discover/CultureView';
import FoodView from './discover/FoodView';
import PlacesView from './discover/PlacesView';
import RizeScreen from './RizeScreen';

type Section = 'places' | 'food' | 'culture' | 'history';

const SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'places', label: 'Gezi', icon: '📍' },
  { id: 'food', label: 'Lezzet', icon: '🍲' },
  { id: 'culture', label: 'Kültür', icon: '🎻' },
  { id: 'history', label: 'Tarihçe', icon: '📜' },
];

export default function DiscoverScreen() {
  const { colors, fs } = useTheme();
  const [section, setSection] = useState<Section>('places');
  // Bir bölüm ilk kez açılınca oluşturulur, sonra bağlı kalır (kaydırma konumu korunur).
  const [visited, setVisited] = useState<Set<Section>>(() => new Set(['places']));
  const [barWidth, setBarWidth] = useState(0);
  const reduced = useReducedMotion();
  const index = SECTIONS.findIndex((s) => s.id === section);
  const slide = useRef(new Animated.Value(0)).current;
  const itemWidth = barWidth > 0 ? (barWidth - 8) / SECTIONS.length : 0;

  // Seçili bölümün zemini, yeni bölüme yaylanarak kayar.
  useEffect(() => {
    const toValue = index * itemWidth;
    if (reduced) slide.setValue(toValue);
    else Animated.spring(slide, { toValue, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }, [index, itemWidth, reduced, slide]);

  const select = (id: Section) => {
    setSection(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        bar: {
          flexDirection: 'row',
          margin: 12,
          marginBottom: 0,
          padding: 4,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 10, backgroundColor: colors.primary },
        itemWrap: { flex: 1 },
        item: { alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 1 },
        icon: { fontSize: 16 },
        label: { fontSize: fs(13), fontWeight: '700', color: colors.text },
        labelActive: { color: colors.isDark ? '#0F1311' : colors.onPrimary },
        page: { flex: 1 },
      }),
    [colors, fs],
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.bar}
        accessibilityRole="tablist"
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {itemWidth > 0 ? (
          <Animated.View style={[styles.pill, { width: itemWidth, transform: [{ translateX: slide }] }]} />
        ) : null}
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <PressableScale
              key={s.id}
              onPress={() => select(s.id)}
              style={styles.item}
              containerStyle={styles.itemWrap}
              scaleTo={0.94}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s.label}
            >
              <Text style={styles.icon}>{s.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {s.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {SECTIONS.map((s) =>
        visited.has(s.id) ? (
          <FadeInView key={s.id} visible={section === s.id} style={styles.page}>
            {s.id === 'places' ? <PlacesView /> : null}
            {s.id === 'food' ? <FoodView /> : null}
            {s.id === 'culture' ? <CultureView /> : null}
            {s.id === 'history' ? <RizeScreen /> : null}
          </FadeInView>
        ) : null,
      )}
    </View>
  );
}
