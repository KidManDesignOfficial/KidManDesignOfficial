import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

import { NewsCard } from '../components/NewsCard';
import { Chip, ChipRow, PrimaryButton } from '../components/ui';
import { NEWS_CATEGORIES, googleNewsRssUrl } from '../config';
import { fetchRss, type NewsItem } from '../rss';
import { useTheme } from '../theme';

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
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        searchBox: { paddingHorizontal: 16, paddingTop: 12 },
        searchInput: {
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: fs(16),
          color: colors.text,
        },
        list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
        muted: { color: colors.textMuted, fontSize: fs(15), textAlign: 'center' },
        errorText: { color: colors.error, fontSize: fs(15), textAlign: 'center' },
        inlineError: { color: colors.error, fontSize: fs(13), marginBottom: 4 },
      }),
    [colors, fs],
  );

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

  const showFullScreenLoader = state.loading && state.items.length === 0 && !refreshing;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Haberlerde ara…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Haberlerde ara"
        />
      </View>

      <ChipRow>
        {NEWS_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
        ))}
      </ChipRow>

      {showFullScreenLoader ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Haberler yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              progressBackgroundColor={colors.card}
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
                  <PrimaryButton label="Tekrar dene" onPress={() => load(categoryId)} />
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
