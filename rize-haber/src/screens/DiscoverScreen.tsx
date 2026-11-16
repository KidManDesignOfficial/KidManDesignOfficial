import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        item: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 1 },
        itemActive: { backgroundColor: colors.primary },
        icon: { fontSize: 16 },
        label: { fontSize: fs(13), fontWeight: '700', color: colors.text },
        labelActive: { color: colors.isDark ? '#0F1311' : colors.onPrimary },
        page: { flex: 1 },
        hidden: { display: 'none' },
      }),
    [colors, fs],
  );

  return (
    <View style={styles.container}>
      <View style={styles.bar} accessibilityRole="tablist">
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <Pressable
              key={s.id}
              onPress={() => select(s.id)}
              style={[styles.item, active && styles.itemActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s.label}
            >
              <Text style={styles.icon}>{s.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {SECTIONS.map((s) =>
        visited.has(s.id) ? (
          <View key={s.id} style={[styles.page, section !== s.id && styles.hidden]}>
            {s.id === 'places' ? <PlacesView /> : null}
            {s.id === 'food' ? <FoodView /> : null}
            {s.id === 'culture' ? <CultureView /> : null}
            {s.id === 'history' ? <RizeScreen /> : null}
          </View>
        ) : null,
      )}
    </View>
  );
}
