import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from './src/config';
import NewsScreen from './src/screens/NewsScreen';
import WeatherScreen from './src/screens/WeatherScreen';

type Tab = 'news' | 'weather';

const TABS: { id: Tab; label: string; icon: string; title: string }[] = [
  { id: 'news', label: 'Haberler', icon: '📰', title: 'Rize Haber' },
  { id: 'weather', label: 'Hava Durumu', icon: '🌦️', title: 'Rize Hava Durumu' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('news');
  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{activeTab.title}</Text>
        </View>

        {/* İki ekran da bağlı kalır; sekme değişince yüklenen veri ve kaydırma konumu korunur. */}
        <View style={styles.body}>
          <View style={[styles.screen, tab !== 'news' && styles.hidden]}>
            <NewsScreen />
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
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
