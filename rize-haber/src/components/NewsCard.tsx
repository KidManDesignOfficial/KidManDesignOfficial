import { memo, useMemo } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { useFavorites } from '../favorites';
import { NEWS_GLASS as G } from '../rizeScene';
import { sourceBadge } from '../newsFeed';
import type { NewsItem } from '../rss';
import { useTheme } from '../theme';
import { timeAgo } from '../time';
import { pressFeedback } from '../haptics';
import { HeroCard } from './HeroCard';
import { Icon } from './Icon';
import { openUrl } from './ui';

function shareArticle(item: NewsItem) {
  Share.share({
    title: item.title,
    message: `${item.title}\n${item.link}\n\nRize Haber uygulamasından paylaşıldı.`,
  }).catch(() => {});
}

/** Kaynağın baş harfleriyle renkli yuvarlak rozet (beslemede görsel olmadığında kartı tanınır kılar). */
function SourceBadge({ source, size, ring }: { source: string; size: number; ring?: boolean }) {
  const { initials, color } = sourceBadge(source || 'Haber');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 1 : 0,
        borderColor: 'rgba(255,255,255,0.5)',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: size * 0.4, fontWeight: '800', letterSpacing: 0.2 }}>{initials}</Text>
    </View>
  );
}

type Props = {
  item: NewsItem;
  /** Listenin en üstündeki büyük manşet kartı. */
  variant?: 'default' | 'lead';
  /** Son otomatik yenilemede gelen haber: "YENİ" etiketi gösterilir. */
  isNew?: boolean;
  /** Rize manzarası gibi koyu sahnelerin üstünde yarı saydam cam kart. */
  glass?: boolean;
};

/** Cam manşet kartının geçişi: üstte daha belirgin, altta sahneyi gösteren saydamlık. */
const GLASS_LEAD: readonly [string, string] = ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'];

function NewsCardBase({ item, variant = 'default', isNew = false, glass = false }: Props) {
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
        metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 },
        meta: { flexShrink: 1, fontSize: fs(12), color: colors.textMuted, fontWeight: '600' },
        metaSource: { color: colors.text, fontWeight: '700' },
        newBadge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
        newBadgeText: { color: colors.onPrimary, fontSize: fs(10), fontWeight: '800', letterSpacing: 0.5 },
        leadTitle: { color: '#FFFFFF', fontSize: fs(21), fontWeight: '800', lineHeight: fs(28), marginTop: 2 },
        leadSummary: { color: 'rgba(255,255,255,0.85)', fontSize: fs(14), lineHeight: fs(20), marginTop: 6 },
        leadFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
        leadMeta: { flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: fs(12), fontWeight: '600' },
        leadAction: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.26)',
        },
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
        leadGlass: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
      }),
    [colors, fs],
  );
  // Cam görünüm: aynı yerleşim, sahneye uygun saydam yüzey ve beyaz yazı tonları.
  const g = useMemo(
    () =>
      glass
        ? StyleSheet.create({
            card: { backgroundColor: G.surface, borderColor: G.border },
            pressed: { backgroundColor: G.pressed },
            title: { color: G.text },
            summary: { color: G.soft },
            meta: { color: G.soft },
            metaSource: { color: G.text },
            newBadge: { backgroundColor: G.accent },
            newBadgeText: { color: '#0B2A1C' },
            image: { backgroundColor: G.border },
            actions: { borderTopColor: G.divider },
            actionText: { color: G.soft },
            actionActive: { color: G.accent },
          })
        : null,
    [glass],
  );
  const muted = glass ? G.soft : colors.textMuted;
  const activeColor = glass ? G.accent : colors.primary;
  const saved = isFavorite(item.id);

  if (variant === 'lead') {
    return (
      <Pressable
        onPress={() => openUrl(item.link, colors)}
        style={({ pressed }) => pressed && { opacity: 0.92 }}
        accessibilityRole="link"
        accessibilityLabel={`Manşet: ${item.title}, ${item.source}`}
      >
        <HeroCard
          watermark="newspaper-outline"
          eyebrow={isNew ? 'YENİ · MANŞET' : 'MANŞET'}
          eyebrowIcon="flash-outline"
          gradient={glass ? GLASS_LEAD : undefined}
          style={glass ? styles.leadGlass : undefined}
        >
          <Text style={styles.leadTitle} numberOfLines={4}>
            {item.title}
          </Text>
          {item.summary ? (
            <Text style={styles.leadSummary} numberOfLines={2}>
              {item.summary}
            </Text>
          ) : null}
          <View style={styles.leadFooter}>
            {item.source ? <SourceBadge source={item.source} size={26} ring /> : null}
            <Text style={styles.leadMeta} numberOfLines={1}>
              {[item.source, timeAgo(item.publishedAt)].filter(Boolean).join(' · ')}
            </Text>
            <Pressable
              onPress={() => {
                pressFeedback();
                toggleFavorite(item);
              }}
              style={styles.leadAction}
              accessibilityRole="button"
              accessibilityState={{ selected: saved }}
              accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
              hitSlop={6}
            >
              <Icon name={saved ? 'star' : 'star-outline'} size={17} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => shareArticle(item)}
              style={styles.leadAction}
              accessibilityRole="button"
              accessibilityLabel="Paylaş"
              hitSlop={6}
            >
              <Icon name="share-social-outline" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </HeroCard>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, g?.card]}>
      <Pressable
        onPress={() => openUrl(item.link, colors)}
        style={({ pressed }) => [styles.main, pressed && styles.pressed, pressed && g?.pressed]}
        accessibilityRole="link"
        accessibilityLabel={`${item.title}, ${item.source}`}
      >
        <View style={styles.body}>
          <Text style={[styles.title, g?.title]} numberOfLines={3}>
            {item.title}
          </Text>
          {item.summary ? (
            <Text style={[styles.summary, g?.summary]} numberOfLines={2}>
              {item.summary}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.source ? <SourceBadge source={item.source} size={20} /> : null}
            <Text style={[styles.meta, g?.meta]} numberOfLines={1}>
              {item.source ? <Text style={[styles.metaSource, g?.metaSource]}>{item.source}</Text> : null}
              {item.source && item.publishedAt ? ' · ' : ''}
              {timeAgo(item.publishedAt)}
            </Text>
            {isNew ? (
              <View style={[styles.newBadge, g?.newBadge]}>
                <Text style={[styles.newBadgeText, g?.newBadgeText]}>YENİ</Text>
              </View>
            ) : null}
          </View>
        </View>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={[styles.image, g?.image]} /> : null}
      </Pressable>

      <View style={[styles.actions, g?.actions]}>
        <Pressable
          onPress={() => {
            pressFeedback();
            toggleFavorite(item);
          }}
          style={({ pressed }) => [styles.action, pressed && styles.pressed, pressed && g?.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
          hitSlop={6}
        >
          <View style={styles.actionInner}>
            <Icon name={saved ? 'star' : 'star-outline'} size={17} color={saved ? activeColor : muted} />
            <Text style={[styles.actionText, g?.actionText, saved && styles.actionActive, saved && g?.actionActive]}>{saved ? 'Kaydedildi' : 'Kaydet'}</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => shareArticle(item)}
          style={({ pressed }) => [styles.action, pressed && styles.pressed, pressed && g?.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
          hitSlop={6}
        >
          <View style={styles.actionInner}>
            <Icon name="share-social-outline" size={17} color={muted} />
            <Text style={[styles.actionText, g?.actionText]}>Paylaş</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const NewsCard = memo(NewsCardBase);
