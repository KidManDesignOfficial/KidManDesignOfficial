import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Icon } from '../components/Icon';
import { EASE_OUT, useAnimatedValue, useReducedMotion } from '../components/motion';
import { NewsCard } from '../components/NewsCard';
import { NewsSkeleton } from '../components/Skeleton';
import { Chip, ChipRow, PrimaryButton } from '../components/ui';
import { NEWS_CATEGORIES, googleNewsRssUrl } from '../config';
import { tapFeedback } from '../haptics';
import { AUTO_REFRESH_MS, buildFeed, isStale, newArrivals, updatedLabel, type FeedRow } from '../newsFeed';
import { loadCachedNews, saveCachedNews, savedAtLabel } from '../offline';
import { fetchRss, type NewsItem } from '../rss';
import { useTheme } from '../theme';

type CategoryState = {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  loadedAt: number | null;
  /** Gösterilen veri önbellekten geliyorsa kaydedilme zamanı. */
  cachedAt?: number | null;
  /** Son yenilemede listeye yeni katılan haberler. */
  newIds?: string[];
};

const EMPTY: CategoryState = { items: [], loading: false, error: null, loadedAt: null };
/** Bu kadar aşağı kaydırılmışken yeni haber gelirse "yeni haber" düğmesi gösterilir. */
const SCROLLED_DOWN_PX = 160;

/** Uygulama ön plandayken true. */
function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

/**
 * @param active Haberler sekmesi ekranda mı? Görünürken ve uygulama ön plandayken haberler
 *               kendiliğinden yenilenir: sekmeye/uygulamaya dönünce (veri 2 dk'dan eskiyse) ve
 *               açık kaldıkça 5 dakikada bir.
 */
export default function NewsScreen({ active = true }: { active?: boolean }) {
  const [categoryId, setCategoryId] = useState(NEWS_CATEGORIES[0].id);
  const [byCategory, setByCategory] = useState<Record<string, CategoryState>>({});
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  /** Aşağıdayken gelen yeni haber sayısı (üstteki "yeni haber" düğmesi). */
  const [pendingNew, setPendingNew] = useState(0);
  const controllers = useRef<Record<string, AbortController>>({});
  const listRef = useRef<FlatList<FeedRow>>(null);
  const scrollY = useRef(0);
  const stateRef = useRef(byCategory);
  useEffect(() => {
    stateRef.current = byCategory;
  }, [byCategory]);
  const appActive = useAppActive();
  const live = active && appActive;
  const reduced = useReducedMotion();
  const pill = useAnimatedValue(0);

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
        offline: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginBottom: 2,
        },
        offlineText: { color: colors.textMuted, fontSize: fs(12), fontWeight: '600' },
        status: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 2, paddingBottom: 2 },
        liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2FB36B' },
        statusText: { color: colors.textMuted, fontSize: fs(12), fontWeight: '600' },
        sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 2 },
        sectionTitle: { color: colors.text, fontSize: fs(13), fontWeight: '800', letterSpacing: 0.4 },
        sectionCount: { color: colors.textMuted, fontSize: fs(12), fontWeight: '600' },
        sectionLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        listArea: { flex: 1 },
        pillWrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' },
        pill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.header,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        pillText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '700' },
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
    // Liste boşsa son kayıtlı haberleri hemen göster (ağ beklenirken ve çevrimdışıyken).
    loadCachedNews(id).then((cached) => {
      if (!cached || controller.signal.aborted) return;
      setByCategory((prev) =>
        prev[id]?.items.length ? prev : { ...prev, [id]: { ...(prev[id] ?? EMPTY), items: cached.items, cachedAt: cached.savedAt } },
      );
    });
    try {
      const items = await fetchRss(googleNewsRssUrl(category.query), controller.signal);
      saveCachedNews(id, items);
      const previous = stateRef.current[id]?.items ?? [];
      // Önbellekten gösterilen liste de "önceki" sayılır: çevrimdışı sonrası gelenler YENİ olarak işaretlenir.
      const newIds = newArrivals(previous, items);
      if (newIds.length > 0 && scrollY.current > SCROLLED_DOWN_PX) setPendingNew(newIds.length);
      setNow(Date.now());
      setByCategory((prev) => ({
        ...prev,
        [id]: { items, loading: false, error: null, loadedAt: Date.now(), cachedAt: null, newIds },
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

  // Otomatik yenileme: kategori ilk açılınca, sekmeye / uygulamaya dönünce (veri bayatsa)
  // ve ekran açık kaldıkça düzenli aralıkla. Arka plandayken ağ ve pil harcanmaz.
  useEffect(() => {
    if (!live) return;
    const refreshIfStale = (force: boolean) => {
      const current = stateRef.current[categoryId];
      if (current?.loading) return;
      if (force || isStale(current?.loadedAt)) load(categoryId);
    };
    refreshIfStale(false);
    const timer = setInterval(() => refreshIfStale(true), AUTO_REFRESH_MS);
    // "5 dk önce" gibi göreli zamanlar ekranda donmasın.
    const clock = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearInterval(timer);
      clearInterval(clock);
    };
  }, [live, categoryId, load]);

  // Sekme değişince "yeni haber" düğmesi sıfırlanır.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingNew(0);
  }, [categoryId]);

  useEffect(() => {
    Animated.timing(pill, {
      toValue: pendingNew > 0 ? 1 : 0,
      duration: reduced ? 0 : 260,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }, [pendingNew, pill, reduced]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
    if (scrollY.current < 40) setPendingNew((n) => (n ? 0 : n));
  }, []);

  const scrollToTop = useCallback(() => {
    tapFeedback();
    setPendingNew(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: !reduced });
  }, [reduced]);

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

  const rows = useMemo(
    () => buildFeed(visibleItems, { lead: !search.trim(), now: new Date(now) }),
    [visibleItems, search, now],
  );
  const newSet = useMemo(() => new Set(state.newIds ?? []), [state.newIds]);

  const renderRow = useCallback(
    ({ item: row }: { item: FeedRow }) => {
      if (row.kind === 'section') {
        return (
          <View style={styles.sectionRow} accessibilityRole="header">
            <Text style={styles.sectionTitle}>{row.title.toLocaleUpperCase('tr-TR')}</Text>
            <Text style={styles.sectionCount}>{row.count} haber</Text>
            <View style={styles.sectionLine} />
          </View>
        );
      }
      return <NewsCard item={row.item} variant={row.kind === 'lead' ? 'lead' : 'default'} isNew={newSet.has(row.item.id)} />;
    },
    [newSet, styles],
  );

  const showFullScreenLoader = state.loading && state.items.length === 0 && !refreshing;
  const offline = Boolean(state.error && state.items.length > 0);

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

      <View style={styles.listArea}>
      {showFullScreenLoader ? (
        <NewsSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          onScroll={onScroll}
          scrollEventThrottle={100}
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
            offline ? (
              <View style={styles.offline}>
                <Icon name="cloud-offline-outline" size={16} color={colors.textMuted} />
                <Text style={styles.offlineText}>
                  Çevrimdışı{state.cachedAt ? ` · son güncelleme ${savedAtLabel(state.cachedAt)}` : ''}
                </Text>
              </View>
            ) : state.loadedAt || state.loading ? (
              <View style={styles.status} accessibilityLiveRegion="polite">
                {state.loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={styles.liveDot} />
                )}
                <Text style={styles.statusText}>
                  {state.loading ? 'Güncelleniyor…' : `${updatedLabel(state.loadedAt, now)} · otomatik yenilenir`}
                </Text>
              </View>
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

      <Animated.View
        pointerEvents={pendingNew > 0 ? 'box-none' : 'none'}
        style={[
          styles.pillWrap,
          { opacity: pill, transform: [{ translateY: pill.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] },
        ]}
      >
        <Pressable
          onPress={scrollToTop}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityLabel={`${pendingNew} yeni haber, en üste git`}
        >
          <Icon name="arrow-up" size={15} color="#FFFFFF" />
          <Text style={styles.pillText}>{pendingNew} yeni haber</Text>
        </Pressable>
      </Animated.View>
      </View>
    </View>
  );
}
