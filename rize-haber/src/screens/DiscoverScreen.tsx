import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '../components/motion';
import { SegmentedTabs, type Segment } from '../components/SegmentedTabs';
import { useTheme } from '../theme';
import CultureView from './discover/CultureView';
import FoodView from './discover/FoodView';
import PlacesView from './discover/PlacesView';
import RizeScreen from './RizeScreen';

type Section = 'places' | 'food' | 'culture' | 'history';

const SECTIONS: Segment<Section>[] = [
  { id: 'places', label: 'Gezi', icon: 'location-outline' },
  { id: 'food', label: 'Lezzet', icon: 'restaurant-outline' },
  { id: 'culture', label: 'Kültür', icon: 'musical-notes-outline' },
  { id: 'history', label: 'Tarihçe', icon: 'time-outline' },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const [section, setSection] = useState<Section>('places');
  // Bir bölüm ilk kez açılınca oluşturulur, sonra bağlı kalır (kaydırma konumu korunur).
  const [visited, setVisited] = useState<Set<Section>>(() => new Set(['places']));

  const select = (id: Section) => {
    setSection(id);
    setVisited((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  const styles = useMemo(
    () => StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background }, page: { flex: 1 } }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <SegmentedTabs segments={SECTIONS} value={section} onChange={select} />
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
