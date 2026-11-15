import { memo } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { COLORS } from '../config';
import { useFavorites } from '../favorites';
import type { NewsItem } from '../rss';
import { timeAgo } from '../time';

export function openArticle(url: string) {
  WebBrowser.openBrowserAsync(url, {
    toolbarColor: COLORS.primary,
    controlsColor: COLORS.primary,
  }).catch(() => {});
}

function shareArticle(item: NewsItem) {
  Share.share({
    title: item.title,
    message: `${item.title}\n${item.link}\n\nRize Haber uygulamasından paylaşıldı.`,
  }).catch(() => {});
}

function NewsCardBase({ item }: { item: NewsItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(item.id);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => openArticle(item.link)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`${item.title}, ${item.source}`}
      >
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={3}>
            {item.title}
          </Text>
          {item.summary ? (
            <Text style={styles.summary} numberOfLines={2}>
              {item.summary}
            </Text>
          ) : null}
          <Text style={styles.meta} numberOfLines={1}>
            {[item.source, timeAgo(item.publishedAt)].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleFavorite(item)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          hitSlop={6}
        >
          <Text style={[styles.actionText, saved && styles.actionActive]}>
            {saved ? '★ Kaydedildi' : '☆ Kaydet'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => shareArticle(item)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
          hitSlop={6}
        >
          <Text style={styles.actionText}>↗ Paylaş</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const NewsCard = memo(NewsCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  main: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10 },
  pressed: { backgroundColor: COLORS.primaryLight },
  body: { flex: 1, gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, lineHeight: 22 },
  summary: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  meta: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  image: { width: 84, height: 84, borderRadius: 10, backgroundColor: COLORS.border },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  action: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  actionText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  actionActive: { color: COLORS.primary },
});
