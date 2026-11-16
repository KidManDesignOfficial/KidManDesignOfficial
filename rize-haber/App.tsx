import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from './src/components/motion';
import { openUrl } from './src/components/ui';
import { FavoritesProvider } from './src/favorites';
import NewsScreen from './src/screens/NewsScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import SavedScreen from './src/screens/SavedScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TeaScreen from './src/screens/TeaScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import { ThemeProvider, useTheme } from './src/theme';

// Bildirim yanıtı yalnızca telefonda vardır; web önizlemesinde boş döner.
const useNotificationResponse =
  Platform.OS === 'web' ? () => null : Notifications.useLastNotificationResponse;

type Tab = 'news' | 'tea' | 'weather' | 'rize' | 'settings';

const TABS: { id: Tab; label: string; icon: string; title: string }[] = [
  { id: 'news', label: 'Haberler', icon: '📰', title: 'Rize Haber' },
  { id: 'tea', label: 'Çay', icon: '🍃', title: 'Çay Fiyatları' },
  { id: 'weather', label: 'Hava', icon: '🌦️', title: 'Hava Durumu' },
  { id: 'rize', label: 'Keşfet', icon: '🧭', title: 'Rize’yi Keşfet' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️', title: 'Ayarlar' },
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
  const activeTab = TABS.find((t) => t.id === tab)!;
  useOpenNotifications(setTab, () => setShowSaved(false));

  // Android geri tuşu: önce Kaydedilenler'i kapat, sonra Haberler sekmesine dön.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
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
  }, [showSaved, tab]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.header },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          backgroundColor: colors.header,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        headerTitle: { flexShrink: 1, color: '#FFFFFF', fontSize: fs(22), fontWeight: '800' },
        headerButton: {
          minHeight: 36,
          justifyContent: 'center',
          paddingHorizontal: 12,
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
        tabIndicatorActive: { backgroundColor: colors.primary },
        tabIcon: { fontSize: 22 },
        tabInactive: { opacity: 0.45 },
        tabLabel: { fontSize: fs(11), fontWeight: '600', color: colors.textMuted },
        tabLabelActive: { color: colors.primary },
      }),
    [colors, fs],
  );

  const title = tab === 'news' && showSaved ? 'Kaydedilenler' : activeTab.title;

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {tab === 'news' ? (
            <Pressable
              onPress={() => setShowSaved((v) => !v)}
              style={[styles.headerButton, showSaved && styles.headerButtonActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: showSaved }}
              accessibilityLabel={showSaved ? 'Haberlere dön' : 'Kaydedilen haberler'}
              hitSlop={8}
            >
              <Text style={styles.headerButtonText}>{showSaved ? '← Haberler' : '★ Kaydedilenler'}</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Ekranlar bağlı kalır; sekme değişince yüklenen veri ve kaydırma konumu korunur. */}
        <View style={styles.body}>
          <FadeInView visible={tab === 'news' && !showSaved} style={styles.screen}>
            <NewsScreen />
          </FadeInView>
          <FadeInView visible={tab === 'news' && showSaved} style={styles.screen}>
            <SavedScreen />
          </FadeInView>
          <FadeInView visible={tab === 'tea'} style={styles.screen}>
            <TeaScreen />
          </FadeInView>
          <FadeInView visible={tab === 'weather'} style={styles.screen}>
            <WeatherScreen />
          </FadeInView>
          <FadeInView visible={tab === 'rize'} style={styles.screen}>
            <DiscoverScreen />
          </FadeInView>
          <FadeInView visible={tab === 'settings'} style={styles.screen}>
            <SettingsScreen />
          </FadeInView>
        </View>

        <SafeAreaView edges={['bottom']} style={styles.tabBar} accessibilityRole="tablist">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={styles.tabButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
              >
                <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
                <Text style={[styles.tabIcon, !active && styles.tabInactive]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
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

/** Bildirime dokunulunca: tek haberse onu açar, özet bildirimse Haberler sekmesine geçer. */
function useOpenNotifications(setTab: (tab: Tab) => void, closeSaved: () => void) {
  const { colors } = useTheme();
  const response = useNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;

    setTab('news');
    closeSaved();
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string') openUrl(url, colors);
  }, [response, setTab, closeSaved, colors]);
}
