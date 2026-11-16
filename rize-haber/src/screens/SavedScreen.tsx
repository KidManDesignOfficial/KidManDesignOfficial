import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '../components/NewsCard';
import { Icon } from '../components/Icon';
import { useFavorites } from '../favorites';
import { useTheme } from '../theme';

export default function SavedScreen() {
  const { favorites } = useFavorites();
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        list: { padding: 16, gap: 10, flexGrow: 1 },
        count: { fontSize: fs(13), color: colors.textMuted, fontWeight: '600' },
        empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
        emptyIcon: { fontSize: fs(44), color: colors.primary },
        emptyTitle: { fontSize: fs(17), fontWeight: '700', color: colors.text },
        emptyText: { fontSize: fs(14), color: colors.textMuted, textAlign: 'center', lineHeight: fs(20) },
      }),
    [colors, fs],
  );

  return (
    <FlatList
      style={styles.container}
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard item={item} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        favorites.length > 0 ? <Text style={styles.count}>{favorites.length} kayıtlı haber</Text> : undefined
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Icon name="star-outline" size={fs(44)} color={colors.primary} />
          <Text style={styles.emptyTitle}>Henüz kaydedilen haber yok</Text>
          <Text style={styles.emptyText}>
            Bir haberin altındaki “Kaydet” düğmesine dokunun; burada saklanır ve internet yokken de listede
            görünür.
          </Text>
        </View>
      }
    />
  );
}
