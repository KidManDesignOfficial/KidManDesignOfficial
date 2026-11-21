import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ICON_FONT, Icon, type IconName } from './src/components/Icon';
import { FadeInView } from './src/components/motion';
import { tapFeedback } from './src/haptics';
import { openUrl } from './src/components/ui';
import { FavoritesProvider } from './src/favorites';
import { CLUB_COLORS } from './src/rizespor/names';
import { GLASS, STADIUM_CHROME } from './src/rizespor/stadium';
import { useRizeSky } from './src/components/RizeScene';
import { ECON_CHROME, MARKET } from './src/economyScene';
import { TEA_CHROME, TEA_GLASS } from './src/teaScene';
import DiscoverScreen from './src/screens/DiscoverScreen';
import EconomyScreen from './src/screens/EconomyScreen';
import NewsScreen from './src/screens/NewsScreen';
import Onboarding, { hasOnboarded } from './src/screens/Onboarding';
import RizesporScreen from './src/screens/RizesporScreen';
import SavedScreen from './src/screens/SavedScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TeaScreen from './src/screens/TeaScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import type { SkyChrome } from './src/weatherScene';
import { loadSettings } from './src/storage';
import { DISCOVER_ENABLED, ThemeProvider, useTheme, type Settings, type TabId } from './src/theme';

// Bildirim yanıtı yalnızca telefonda vardır; web önizlemesinde boş döner.
const useNotificationResponse =
  Platform.OS === 'web' ? () => null : Notifications.useLastNotificationResponse;

// Açılış ekranı, simge yazı tipi ve ayarlar hazır olana kadar görünür kalır; sonra solarak kapanır.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 350 });

type Tab = TabId;

type TabDef = { id: Tab; label: string; icon: IconName; iconActive: IconName; title: string };

const TABS = ([
  { id: 'news', label: 'Haberler', icon: 'newspaper-outline', iconActive: 'newspaper', title: 'Rize Haber' },
  { id: 'rizespor', label: 'Rizespor', icon: 'football-outline', iconActive: 'football', title: 'Çaykur Rizespor' },
  { id: 'tea', label: 'Çay', icon: 'leaf-outline', iconActive: 'leaf', title: 'Çay Fiyatları' },
  { id: 'economy', label: 'Ekonomi', icon: 'trending-up-outline', iconActive: 'trending-up', title: 'Ekonomi' },
  { id: 'weather', label: 'Hava', icon: 'partly-sunny-outline', iconActive: 'partly-sunny', title: 'Hava Durumu' },
  { id: 'rize', label: 'Keşfet', icon: 'compass-outline', iconActive: 'compass', title: 'Rize’yi Keşfet' },
] as TabDef[]).filter((t) => DISCOVER_ENABLED || t.id !== 'rize');

export default function App() {
  const [fontsLoaded, fontError] = useFonts(ICON_FONT);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  // Ayarlar açılış ekranı kapanmadan okunur: ilk karede doğru tema ve açılış sekmesi görünür.
  const [stored, setStored] = useState<Partial<Settings> | null>(null);
  useEffect(() => {
    hasOnboarded().then(setOnboarded);
    loadSettings().then(setStored);
  }, []);
  const ready = (fontsLoaded || fontError !== null) && onboarded !== null && stored !== null;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider initial={stored}>
        <FavoritesProvider>
          {onboarded ? <Main /> : <Onboarding onDone={() => setOnboarded(true)} />}
        </FavoritesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const { colors, fs, settings } = useTheme();
  const startTab = settings.startTab;
  const [tab, setTab] = useState<Tab>(startTab);
  const [showSaved, setShowSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);
  const [weatherChrome, setWeatherChrome] = useState<SkyChrome | null>(null);
  // Her sekme ilk açıldığında yüklenir: açılış hızlanır, gereksiz ağ isteği ve pil harcanmaz.
  const [mounted, setMounted] = useState<Set<Tab | 'settings'>>(() => new Set(['news', startTab]));
  const mount = useCallback((t: Tab | 'settings') => {
    setMounted((m) => (m.has(t) ? m : new Set(m).add(t)));
  }, []);
  const activeTab = TABS.find((t) => t.id === tab)!;

  const goTo = useCallback((t: Tab) => {
    tapFeedback();
    setTab(t);
    setShowSettings(false);
    mount(t);
  }, [mount]);

  useOpenNotifications(goTo, () => setShowSaved(false), setOpenMatchId);

  // Android geri tuşu: önce Ayarlar'ı / Kaydedilenler'i kapat, sonra açılış sekmesine dön.
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
      if (tab !== startTab) {
        setTab(startTab);
        mount(startTab);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [showSaved, showSettings, tab, startTab, mount]);

  const club = tab === 'rizespor' && !showSettings;
  const newsVisible = tab === 'news' && !showSettings;
  const teaVisible = tab === 'tea' && !showSettings;
  const economyVisible = tab === 'economy' && !showSettings;
  // Haberler sekmesi: günün saatine göre Rize manzarası (gündüz / akşam üstü / gece).
  const rizeSky = useRizeSky();
  const weatherVisible = tab === 'weather' && !showSettings;
  // Hava sekmesinde başlık ve sekme çubuğu gökyüzünün rengini alır; sahneyle kesintisiz birleşir.
  // Rizespor sekmesinde de aynısı: başlık gece göğüne, sekme çubuğu stadyumun çimine karışır.
  // Haberler, Çay ve Ekonomi sekmelerinde de başlık ve sekme çubuğu kendi sahnelerinin renklerini alır.
  const skyChrome = weatherVisible
    ? weatherChrome
    : club
      ? STADIUM_CHROME
      : newsVisible
        ? rizeSky.chrome
        : teaVisible
          ? TEA_CHROME
          : economyVisible
            ? ECON_CHROME
            : null;
  const sky = skyChrome?.header ?? null;
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
        headerButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
        body: { flex: 1, backgroundColor: colors.background },
        screen: { flex: 1 },
        tabBar: {
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        tabButton: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 6, paddingHorizontal: 2, gap: 2 },
        tabIndicator: { position: 'absolute', top: 0, height: 3, width: 28, borderRadius: 2 },
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
            onPress={() => {
              tapFeedback();
              setShowSaved((v) => !v);
            }}
            style={[styles.headerButton, showSaved && styles.headerButtonActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: showSaved }}
            accessibilityLabel={showSaved ? 'Haberlere dön' : 'Kaydedilen haberler'}
            hitSlop={6}
          >
            <View style={styles.headerButtonInner}>
              <Icon name={showSaved ? 'arrow-back' : 'star'} size={16} color="#FFFFFF" />
              <Text style={styles.headerButtonText}>{showSaved ? 'Haberler' : 'Kayıtlı'}</Text>
            </View>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            tapFeedback();
            mount('settings');
            setShowSettings((v) => !v);
          }}
          style={[styles.headerButton, showSettings && styles.headerButtonActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: showSettings }}
          accessibilityLabel={showSettings ? 'Ayarları kapat' : 'Ayarlar'}
          hitSlop={6}
        >
          <Icon name={showSettings ? 'close' : 'settings-outline'} size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      {/* Hava ekranında alt çubuk koyu gökyüzü rengindedir: Android gezinme düğmeleri açık renk olur. */}
      <NavigationBar style={skyChrome ? 'light' : 'auto'} />
      <SafeAreaView
        style={[styles.root, sky ? { backgroundColor: sky } : null]} edges={['top', 'left', 'right']}>
        <View style={{ backgroundColor: sky ?? colors.header }}>{headerContent}</View>

        {/* Ekranlar bağlı kalır; sekme değişince yüklenen veri ve kaydırma konumu korunur. */}
        <View style={styles.body}>
          <FadeInView visible={!showSettings && tab === 'news' && !showSaved} style={styles.screen}>
            <NewsScreen active={newsVisible && !showSaved} sky={rizeSky} />
          </FadeInView>
          <FadeInView visible={!showSettings && tab === 'news' && showSaved} style={styles.screen}>
            <SavedScreen sky={rizeSky} active={newsVisible && showSaved} />
          </FadeInView>
          {mounted.has('rizespor') ? (
            <FadeInView visible={!showSettings && tab === 'rizespor'} style={styles.screen}>
              <RizesporScreen openMatchId={openMatchId} active={club} />
            </FadeInView>
          ) : null}
          {mounted.has('tea') ? (
            <FadeInView visible={teaVisible} style={styles.screen}>
              <TeaScreen active={teaVisible} />
            </FadeInView>
          ) : null}
          {mounted.has('economy') ? (
            <FadeInView visible={economyVisible} style={styles.screen}>
              <EconomyScreen active={economyVisible} onOpenTea={() => goTo('tea')} />
            </FadeInView>
          ) : null}
          {mounted.has('weather') ? (
            <FadeInView visible={weatherVisible} style={styles.screen}>
              <WeatherScreen active={weatherVisible} onSkyColors={setWeatherChrome} />
            </FadeInView>
          ) : null}
          {DISCOVER_ENABLED && mounted.has('rize') ? (
            <FadeInView visible={!showSettings && tab === 'rize'} style={styles.screen}>
              <DiscoverScreen active={!showSettings && tab === 'rize'} />
            </FadeInView>
          ) : null}
          {mounted.has('settings') ? (
            <FadeInView visible={showSettings} style={styles.screen}>
              <SettingsScreen />
            </FadeInView>
          ) : null}
        </View>

        <SafeAreaView
          edges={['bottom']}
          style={[styles.tabBar, skyChrome && { backgroundColor: skyChrome.footer, borderTopColor: 'rgba(255,255,255,0.12)' }]}
          accessibilityRole="tablist"
        >
          {TABS.map((t) => {
            const active = t.id === tab && !showSettings;
            // Hava ekranında sekme çubuğu gökyüzüne karışır: seçili sekme beyaz, diğerleri yarı saydam beyaz.
            const accent = club ? GLASS.accent : economyVisible ? MARKET.gold : teaVisible ? TEA_GLASS.accent : skyChrome ? '#FFFFFF' : t.id === 'rizespor' ? CLUB_COLORS.green : colors.primary;
            const idle = skyChrome ? 'rgba(255,255,255,0.62)' : colors.textMuted;
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
                <Icon name={active ? t.iconActive : t.icon} size={23} color={active ? accent : idle} />
                <Text
                  style={[styles.tabLabel, { color: active ? accent : idle }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
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
      // Her dokunuş ayrı bir istektir: aynı maç için ikinci bildirim de maçı yeniden açar.
      if (typeof data.matchId === 'string') openMatch(`${data.matchId}#${id}`);
      return;
    }
    goTo('news');
    closeSaved();
    if (typeof data.url === 'string') openUrl(data.url, colors);
  }, [response, goTo, closeSaved, openMatch, colors]);
}
