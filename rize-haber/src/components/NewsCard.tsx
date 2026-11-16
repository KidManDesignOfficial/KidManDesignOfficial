import { memo, useMemo } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { useFavorites } from '../favorites';
import type { NewsItem } from '../rss';
import { useTheme } from '../theme';
import { timeAgo } from '../time';
import { pressFeedback } from '../haptics';
import { Icon } from './Icon';
import { openUrl } from './ui';

function shareArticle(item: NewsItem) {
  Share.share({
    title: item.title,
    message: `${item.title}\n${item.link}\n\nRize Haber uygulamasından paylaşıldı.`,
  }).catch(() => {});
}

function NewsCardBase({ item }: { item: NewsItem }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        main: { flexDirection: 'row', gap: 12, padding: 14, paddingBottom: 10 },
        pressed: { backgroundColor: colors.primarySoft },
        body: { flex: 1, gap: 6 },
        title: { fontSize: fs(16), fontWeight: '700', color: colors.text, lineHeight: fs(22) },
        summary: { fontSize: fs(14), color: colors.textMuted, lineHeight: fs(20) },
        meta: { fontSize: fs(12), color: colors.primary, fontWeight: '600' },
        image: { width: 84, height: 84, borderRadius: 10, backgroundColor: colors.border },
        actions: {
          flexDirection: 'row',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        action: { flex: 1, alignItems: 'center', paddingVertical: 10 },
        actionInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        actionText: { fontSize: fs(14), fontWeight: '600', color: colors.textMuted },
        actionActive: { color: colors.primary },
      }),
    [colors, fs],
  );
  const saved = isFavorite(item.id);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => openUrl(item.link, colors)}
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
          onPress={() => {
            pressFeedback();
            toggleFavorite(item);
          }}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          hitSlop={6}
        >
          <View style={styles.actionInner}>
            <Icon name={saved ? 'star' : 'star-outline'} size={17} color={saved ? colors.primary : colors.textMuted} />
            <Text style={[styles.actionText, saved && styles.actionActive]}>{saved ? 'Kaydedildi' : 'Kaydet'}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => shareArticle(item)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
          hitSlop={6}
        >
          <View style={styles.actionInner}>
            <Icon name="share-social-outline" size={17} color={colors.textMuted} />
            <Text style={styles.actionText}>Paylaş</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const NewsCard = memo(NewsCardBase);
