import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ICON_FONT, Icon, type IconName } from './src/components/Icon';
import { PressableScale } from './src/components/motion';
import { T } from './src/components/ui';
import { setHapticsEnabled, tapFeedback } from './src/lib/haptics';
import { NavProvider } from './src/nav';
import type { Route, Tab } from './src/nav';
import AboutScreen from './src/screens/AboutScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import ExamScreen from './src/screens/ExamScreen';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import NetCalcScreen from './src/screens/NetCalcScreen';
import Onboarding from './src/screens/Onboarding';
import ProfileScreen from './src/screens/ProfileScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import SubjectsScreen from './src/screens/SubjectsScreen';
import TeacherScreen from './src/screens/TeacherScreen';
import WrongBookScreen from './src/screens/WrongBookScreen';
import { StoreProvider, useStore } from './src/store';
import { ThemeProvider, useTheme } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: true, duration: 350 });

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Themed() {
  const { state, ready } = useStore();
  const [fontsLoaded, fontError] = useFonts(ICON_FONT);
  const loaded = ready && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  useEffect(() => setHapticsEnabled(state.haptics), [state.haptics]);

  if (!loaded) return null;
  return (
    <ThemeProvider mode={state.mode} textSize={state.textSize}>
      <Root onboarded={state.onboarded} />
    </ThemeProvider>
  );
}

function Root({ onboarded }: { onboarded: boolean }) {
  const { c, dark } = useTheme();
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.bg).catch(() => {});
  }, [c.bg]);

  if (!onboarded) {
    return (
      <>
        <StatusBar style="light" />
        <Onboarding />
      </>
    );
  }
  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <NavProvider renderTab={renderTab} renderRoute={renderRoute} tabBar={(tab, setTab) => <TabBar tab={tab} setTab={setTab} />} />
    </View>
  );
}

function renderTab(t: Tab) {
  switch (t) {
    case 'home':
      return <HomeScreen />;
    case 'subjects':
      return <SubjectsScreen />;
    case 'exam':
      return <ExamScreen />;
    case 'teacher':
      return <TeacherScreen />;
    case 'profile':
      return <ProfileScreen />;
  }
}

function renderRoute(r: Route) {
  switch (r.name) {
    case 'subject':
      return <SubjectScreen subjectId={r.subjectId} />;
    case 'lesson':
      return <LessonScreen topicId={r.topicId} />;
    case 'quiz':
      return <QuizScreen config={r.config} />;
    case 'result':
      return <ResultScreen result={r.result} />;
    case 'wrongbook':
      return <WrongBookScreen />;
    case 'bookmarks':
      return <BookmarksScreen />;
    case 'flashcards':
      return <FlashcardsScreen subjectId={r.subjectId} />;
    case 'netcalc':
      return <NetCalcScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'about':
      return <AboutScreen />;
  }
}

const TABS: { id: Tab; label: string; icon: IconName; active: IconName }[] = [
  { id: 'home', label: 'Ana Sayfa', icon: 'home-outline', active: 'home' },
  { id: 'subjects', label: 'Dersler', icon: 'library-outline', active: 'library' },
  { id: 'exam', label: 'Deneme', icon: 'document-text-outline', active: 'document-text' },
  { id: 'teacher', label: 'Öğretmen', icon: 'easel-outline', active: 'easel' },
  { id: 'profile', label: 'Profil', icon: 'person-outline', active: 'person' },
];

function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { backgroundColor: c.tabBar, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const active = t.id === tab;
        return (
          <PressableScale
            key={t.id}
            onPress={() => {
              tapFeedback();
              setTab(t.id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            containerStyle={{ flex: 1 }}
            style={styles.tabBtn}
          >
            <View style={[styles.tabIcon, active && { backgroundColor: c.primarySoft }]}>
              <Icon name={active ? t.active : t.icon} size={22} color={active ? c.primary : c.textFaint} />
            </View>
            <T size={11} weight={active ? '800' : '600'} color={active ? c.primary : c.textFaint} lines={1}>
              {t.label}
            </T>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tabBtn: { alignItems: 'center', gap: 3 },
  tabIcon: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
