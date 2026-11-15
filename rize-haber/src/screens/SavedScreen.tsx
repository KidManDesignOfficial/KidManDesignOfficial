import { FlatList, StyleSheet, Text, View } from 'react-native';

import { NewsCard } from '../components/NewsCard';
import { COLORS } from '../config';
import { useFavorites } from '../favorites';

export default function SavedScreen() {
  const { favorites } = useFavorites();

  return (
    <FlatList
      style={styles.container}
      data={favorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard item={item} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        favorites.length > 0 ? (
          <Text style={styles.count}>{favorites.length} kayıtlı haber</Text>
        ) : undefined
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={styles.emptyTitle}>Henüz kaydedilen haber yok</Text>
          <Text style={styles.emptyText}>
            Bir haberin altındaki “Kaydet” düğmesine dokunun; burada saklanır ve internet yokken de
            listede görünür.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  count: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emptyIcon: { fontSize: 44, color: COLORS.primary },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
});
