import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { COLORS, NEWS_CATEGORIES, googleNewsRssUrl } from '../config';
import { fetchRss, type NewsItem } from '../rss';
import { timeAgo } from '../time';

type CategoryState = {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  loadedAt: number | null;
};

const EMPTY: CategoryState = { items: [], loading: false, error: null, loadedAt: null };
/** Bu süreden yeni veri varsa kategori değiştirirken tekrar indirme yapılmaz. */
const STALE_AFTER_MS = 5 * 60 * 1000;

export default function NewsScreen() {
  const [categoryId, setCategoryId] = useState(NEWS_CATEGORIES[0].id);
  const [byCategory, setByCategory] = useState<Record<string, CategoryState>>({});
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const controllers = useRef<Record<string, AbortController>>({});

  const state = byCategory[categoryId] ?? EMPTY;

  const load = useCallback(async (id: string) => {
    const category = NEWS_CATEGORIES.find((c) => c.id === id);
    if (!category) return;

    controllers.current[id]?.abort();
    const controller = new AbortController();
    controllers.current[id] = controller;

    setByCategory((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? EMPTY), loading: true, error: null },
    }));
    try {
      const items = await fetchRss(googleNewsRssUrl(category.query), controller.signal);
      setByCategory((prev) => ({
        ...prev,
        [id]: { items, loading: false, error: null, loadedAt: Date.now() },
      }));
    } catch (e) {
      if (controller.signal.aborted) return;
      const message =
        e instanceof Error && e.message.startsWith('Haber')
          ? e.message
          : 'Haberler yüklenemedi. İnternet bağlantınızı kontrol edin.';
      setByCategory((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? EMPTY), loading: false, error: message },
      }));
    }
  }, []);

  useEffect(() => {
    const current = byCategory[categoryId];
    const isFresh = current?.loadedAt && Date.now() - current.loadedAt < STALE_AFTER_MS;
    if (!isFresh && !current?.loading) load(categoryId);
    // Yalnızca kategori değişince çalışmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  useEffect(() => {
    const all = controllers.current;
    return () => Object.values(all).forEach((c) => c.abort());
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(categoryId);
    setRefreshing(false);
  }, [categoryId, load]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr-TR');
    if (!q) return state.items;
    return state.items.filter((item) =>
      `${item.title} ${item.summary} ${item.source}`.toLocaleLowerCase('tr-TR').includes(q),
    );
  }, [state.items, search]);

  const openArticle = useCallback((item: NewsItem) => {
    WebBrowser.openBrowserAsync(item.link, {
      toolbarColor: COLORS.primary,
      controlsColor: COLORS.primary,
    }).catch(() => {});
  }, []);

  const showFullScreenLoader = state.loading && state.items.length === 0 && !refreshing;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Haberlerde ara…"
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Haberlerde ara"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {NEWS_CATEGORIES.map((c) => {
          const active = c.id === categoryId;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCategoryId(c.id)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showFullScreenLoader ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.muted}>Haberler yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} onPress={openArticle} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            state.error && state.items.length > 0 ? (
              <Text style={styles.inlineError}>{state.error}</Text>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.center}>
              {state.error ? (
                <>
                  <Text style={styles.errorText}>{state.error}</Text>
                  <Pressable onPress={() => load(categoryId)} style={styles.retryButton}>
                    <Text style={styles.retryText}>Tekrar dene</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.muted}>
                  {search ? 'Aramanızla eşleşen haber yok.' : 'Bu kategoride henüz haber yok.'}
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

function NewsCard({ item, onPress }: { item: NewsItem; onPress: (item: NewsItem) => void }) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="link"
      accessibilityLabel={`${item.title}, ${item.source}`}
    >
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {item.title}
        </Text>
        {item.summary ? (
          <Text style={styles.cardSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        ) : null}
        <Text style={styles.cardMeta} numberOfLines={1}>
          {[item.source, timeAgo(item.publishedAt)].filter(Boolean).join(' · ')}
        </Text>
      </View>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardImage} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBox: { paddingHorizontal: 16, paddingTop: 12 },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  // ScrollView varsayılan olarak flexShrink: 1 gelir; liste ekranı doldururken şerit ezilmesin.
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
  chip: {
    flexShrink: 0,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: { backgroundColor: COLORS.primaryLight },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, lineHeight: 22 },
  cardSummary: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  cardMeta: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cardImage: { width: 84, height: 84, borderRadius: 10, backgroundColor: COLORS.border },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  muted: { color: COLORS.textMuted, fontSize: 15, textAlign: 'center' },
  errorText: { color: COLORS.error, fontSize: 15, textAlign: 'center' },
  inlineError: { color: COLORS.error, fontSize: 13, marginBottom: 4 },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
