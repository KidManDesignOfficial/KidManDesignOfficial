import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from './src/components/motion';
import { openUrl } from './src/components/ui';
import { FavoritesProvider } from './src/favorites';
import { CLUB_COLORS } from './src/rizespor/names';
import DiscoverScreen from './src/screens/DiscoverScreen';
import NewsScreen from './src/screens/NewsScreen';
import RizesporScreen from './src/screens/RizesporScreen';
import SavedScreen from './src/screens/SavedScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TeaScreen from './src/screens/TeaScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import { ThemeProvider, useTheme } from './src/theme';

// Bildirim yanıtı yalnızca telefonda vardır; web önizlemesinde boş döner.
const useNotificationResponse =
  Platform.OS === 'web' ? () => null : Notifications.useLastNotificationResponse;

type Tab = 'news' | 'rizespor' | 'tea' | 'weather' | 'rize';

const TABS: { id: Tab; label: string; icon: string; title: string }[] = [
  { id: 'news', label: 'Haberler', icon: '📰', title: 'Rize Haber' },
  { id: 'rizespor', label: 'Rizespor', icon: '⚽', title: 'Çaykur Rizespor' },
  { id: 'tea', label: 'Çay', icon: '🍃', title: 'Çay Fiyatları' },
  { id: 'weather', label: 'Hava', icon: '🌦️', title: 'Hava Durumu' },
  { id: 'rize', label: 'Keşfet', icon: '🧭', title: 'Rize’yi Keşfet' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <Main />
        </FavoritesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const { colors, fs } = useTheme();
  const [tab, setTab] = useState<Tab>('news');
  const [showSaved, setShowSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);
  // Rizespor sekmesi ilk açıldığında yüklenir (gereksiz ağ isteği yapılmaz).
  const [rizesporMounted, setRizesporMounted] = useState(false);
  const activeTab = TABS.find((t) => t.id === tab)!;

  const goTo = useCallback((t: Tab) => {
    setTab(t);
    setShowSettings(false);
    if (t === 'rizespor') setRizesporMounted(true);
  }, []);

  useOpenNotifications(goTo, () => setShowSaved(false), setOpenMatchId);

  // Android geri tuşu: önce Ayarlar'ı / Kaydedilenler'i kapat, sonra Haberler sekmesine dön.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showSettings) {
        setShowSettings(false);
        return true;
      }
      if (showSaved) {
        setShowSaved(false);
        return true;
      }
      if (tab !== 'news') {
        setTab('news');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [showSaved, showSettings, tab]);

  const club = tab === 'rizespor' && !showSettings;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.header },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        headerTitle: { flexShrink: 1, color: '#FFFFFF', fontSize: fs(22), fontWeight: '800' },
        headerActions: { flexDirection: 'row', gap: 8 },
        headerButton: {
          minHeight: 36,
          minWidth: 36,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.16)',
        },
        headerButtonActive: { backgroundColor: 'rgba(255,255,255,0.32)' },
        headerButtonText: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '700' },
        body: { flex: 1, backgroundColor: colors.background },
        screen: { flex: 1 },
        tabBar: {
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        tabButton: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 6, gap: 2 },
        tabIndicator: { position: 'absolute', top: 0, height: 3, width: 28, borderRadius: 2 },
        tabIcon: { fontSize: 22 },
        tabInactive: { opacity: 0.45 },
        tabLabel: { fontSize: fs(11), fontWeight: '600', color: colors.textMuted },
      }),
    [colors, fs],
  );

  const title = showSettings ? 'Ayarlar' : tab === 'news' && showSaved ? 'Kaydedilenler' : activeTab.title;

  const headerContent = (
    <View style={styles.header}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerActions}>
        {tab === 'news' && !showSettings ? (
          <Pressable
            onPress={() => setShowSaved((v) => !v)}
            style={[styles.headerButton, showSaved && styles.headerButtonActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: showSaved }}
            accessibilityLabel={showSaved ? 'Haberlere dön' : 'Kaydedilen haberler'}
            hitSlop={6}
          >
            <Text style={styles.headerButtonText}>{showSaved ? '← Haberler' : '★ Kayıtlı'}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => setShowSettings((v) => !v)}
          style={[styles.headerButton, showSettings && styles.headerButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: showSettings }}
          accessibilityLabel={showSettings ? 'Ayarları kapat' : 'Ayarlar'}
          hitSlop={6}
        >
          <Text style={styles.headerButtonText}>{showSettings ? '✕' : '⚙️'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.root, club && { backgroundColor: CLUB_COLORS.green }]} edges={['top', 'left', 'right']}>
        {club ? (
          <LinearGradient colors={[CLUB_COLORS.green, CLUB_COLORS.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {headerContent}
          </LinearGradient>
        ) : (
          <View style={{ backgroundColor: colors.header }}>{headerContent}</View>
        )}

        {/* Ekranlar bağlı kalır; sekme değişince yüklenen veri ve kaydırma konumu korunur. */}
        <View style={styles.body}>
          <FadeInView visible={!showSettings && tab === 'news' && !showSaved} style={styles.screen}>
            <NewsScreen />
          </FadeInView>
          <FadeInView visible={!showSettings && tab === 'news' && showSaved} style={styles.screen}>
            <SavedScreen />
          </FadeInView>
          {rizesporMounted ? (
            <FadeInView visible={!showSettings && tab === 'rizespor'} style={styles.screen}>
              <RizesporScreen openMatchId={openMatchId} />
            </FadeInView>
          ) : null}
          <FadeInView visible={!showSettings && tab === 'tea'} style={styles.screen}>
            <TeaScreen />
          </FadeInView>
          <FadeInView visible={!showSettings && tab === 'weather'} style={styles.screen}>
            <WeatherScreen />
          </FadeInView>
          <FadeInView visible={!showSettings && tab === 'rize'} style={styles.screen}>
            <DiscoverScreen />
          </FadeInView>
          <FadeInView visible={showSettings} style={styles.screen}>
            <SettingsScreen />
          </FadeInView>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.tabBar} accessibilityRole="tablist">
          {TABS.map((t) => {
            const active = t.id === tab && !showSettings;
            const accent = t.id === 'rizespor' ? CLUB_COLORS.green : colors.primary;
            return (
              <Pressable
                key={t.id}
                onPress={() => goTo(t.id)}
                style={styles.tabButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
              >
                <View style={[styles.tabIndicator, active && { backgroundColor: accent }]} />
                <Text style={[styles.tabIcon, !active && styles.tabInactive]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && { color: accent }]} numberOfLines={1}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

/**
 * Bildirime dokunulunca: haber bildirimi ise haberi açar; Rizespor bildirimi ise Rizespor
 * sekmesine geçip ilgili maçı açar.
 */
function useOpenNotifications(goTo: (tab: Tab) => void, closeSaved: () => void, openMatch: (id: string | null) => void) {
  const { colors } = useTheme();
  const response = useNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;

    const data = response.notification.request.content.data ?? {};
    if (data.screen === 'rizespor') {
      goTo('rizespor');
      if (typeof data.matchId === 'string') openMatch(data.matchId);
      return;
    }
    goTo('news');
    closeSaved();
    if (typeof data.url === 'string') openUrl(data.url, colors);
  }, [response, goTo, closeSaved, openMatch, colors]);
}
