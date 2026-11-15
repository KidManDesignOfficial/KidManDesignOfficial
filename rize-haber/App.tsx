import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { openArticle } from './src/components/NewsCard';
import { COLORS } from './src/config';
import { FavoritesProvider } from './src/favorites';
import { disableNewsNotifications, enableNewsNotifications } from './src/notifications';
import NewsScreen from './src/screens/NewsScreen';
import SavedScreen from './src/screens/SavedScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import { loadNotificationsEnabled } from './src/storage';

type Tab = 'news' | 'saved' | 'weather';

const TABS: { id: Tab; label: string; icon: string; title: string }[] = [
  { id: 'news', label: 'Haberler', icon: '📰', title: 'Rize Haber' },
  { id: 'saved', label: 'Kaydedilenler', icon: '⭐', title: 'Kaydedilenler' },
  { id: 'weather', label: 'Hava Durumu', icon: '🌦️', title: 'Rize Hava Durumu' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <Main />
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const [tab, setTab] = useState<Tab>('news');
  const activeTab = TABS.find((t) => t.id === tab)!;
  useOpenNotifications(setTab);

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeTab.title}
          </Text>
          {tab === 'news' ? <NotificationToggle /> : null}
        </View>

        {/* Ekranlar bağlı kalır; sekme değişince yüklenen veri ve kaydırma konumu korunur. */}
        <View style={styles.body}>
          <View style={[styles.screen, tab !== 'news' && styles.hidden]}>
            <NewsScreen />
          </View>
          <View style={[styles.screen, tab !== 'saved' && styles.hidden]}>
            <SavedScreen />
          </View>
          <View style={[styles.screen, tab !== 'weather' && styles.hidden]}>
            <WeatherScreen />
          </View>
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
                <Text style={[styles.tabIcon, !active && styles.tabInactive]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </SafeAreaView>
      </SafeAreaView>
    </>
  );
}

/** Bildirime dokunulunca: tek haberse onu açar, özet bildirimse Haberler sekmesine geçer. */
function useOpenNotifications(setTab: (tab: Tab) => void) {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;

    setTab('news');
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string') openArticle(url);
  }, [response, setTab]);
}

function NotificationToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadNotificationsEnabled().then(setEnabled);
  }, []);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        await disableNewsNotifications();
        setEnabled(false);
        Alert.alert('Bildirimler kapatıldı', 'Yeni haberler için artık bildirim gönderilmeyecek.');
        return;
      }
      const result = await enableNewsNotifications();
      if (result === 'enabled') {
        setEnabled(true);
        Alert.alert(
          'Bildirimler açıldı 🔔',
          'Rize ile ilgili yeni bir haber yayımlandığında bildirim alacaksınız.\n\n' +
            'Kontrol yaklaşık 30 dakikada bir yapılır; kesin zamanı telefonunuz belirler. ' +
            'Pil tasarrufu modu açıksa bildirimler gecikebilir.',
        );
      } else if (result === 'permission-denied') {
        Alert.alert(
          'Bildirim izni gerekli',
          'Bildirim almak için telefon ayarlarından Rize Haber uygulamasına bildirim izni verin.',
          [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları aç', onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert(
          'Arka plan kısıtlı',
          'Telefonunuz bu uygulamanın arka planda çalışmasına izin vermiyor. ' +
            'Ayarlar → Uygulamalar → Rize Haber → Pil bölümünden kısıtlamayı kaldırabilirsiniz.',
        );
      }
    } catch {
      Alert.alert('Bir sorun oluştu', 'Bildirim ayarı değiştirilemedi. Lütfen tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  }, [busy, enabled]);

  if (enabled === null) return null;

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, busy }}
      accessibilityLabel="Yeni haber bildirimleri"
      hitSlop={8}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.bellText}>{enabled ? '🔔 Açık' : '🔕 Bildirim'}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { flexShrink: 1, color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  bell: {
    minHeight: 36,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bellPressed: { backgroundColor: 'rgba(255,255,255,0.3)' },
  bellText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  body: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 },
  tabIcon: { fontSize: 22 },
  tabInactive: { opacity: 0.45 },
  tabLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.primary },
});
