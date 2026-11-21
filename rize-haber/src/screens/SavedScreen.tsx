import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '../components/NewsCard';
import { Icon } from '../components/Icon';
import RizeScene from '../components/RizeScene';
import { useFavorites } from '../favorites';
import { NEWS_GLASS as G, rizeSkyFor, type RizeSky } from '../rizeScene';
import { useTheme } from '../theme';

/** Kaydedilen haberler: Haberler sekmesinin parçası, aynı Rize manzarası üstünde cam kartlar. */
export default function SavedScreen({ sky = rizeSkyFor(new Date().getHours()), active = true }: { sky?: RizeSky; active?: boolean }) {
  const { favorites } = useFavorites();
  const { fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: sky.chrome.footer },
        list: { padding: 16, gap: 10, flexGrow: 1 },
        count: { fontSize: fs(13), color: G.soft, fontWeight: '600' },
        empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
        emptyTitle: { fontSize: fs(17), fontWeight: '700', color: G.text },
        emptyText: { fontSize: fs(14), color: G.soft, textAlign: 'center', lineHeight: fs(20) },
      }),
    [fs, sky],
  );

  return (
    <View style={styles.container}>
    <RizeScene sky={sky} active={active} />
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard item={item} glass />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        favorites.length > 0 ? <Text style={styles.count}>{favorites.length} kayıtlı haber</Text> : undefined
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Icon name="star-outline" size={fs(44)} color={G.accent} />
          <Text style={styles.emptyTitle}>Henüz kaydedilen haber yok</Text>
          <Text style={styles.emptyText}>
            Bir haberin altındaki “Kaydet” düğmesine dokunun; burada saklanır ve internet yokken de listede
            görünür.
          </Text>
        </View>
      }
    />
    </View>
  );
}
