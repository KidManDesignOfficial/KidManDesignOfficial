/**
 * Ayarlar → Arka planlar: her sekme için sahne seçimi.
 * Solda seçili sahnenin küçük telefon önizlemesi (gerçek sahne, ölçeklenmiş ve durağan), sağda seçenekler.
 */
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BACKDROPS, BACKDROP_TABS, DEFAULT_BACKDROPS, backdropFor, type Backdrop, type BackdropTab, type WeatherStyle } from '../backdrops';
import { tapFeedback } from '../haptics';
import { sceneTint, useTheme } from '../theme';
import { sceneFor, skyChrome } from '../weatherScene';
import { Icon, type IconName } from './Icon';
import { useRizeSky } from './RizeScene';
import { EconomyBackdrop, NewsBackdrop, RizesporBackdrop, TeaBackdrop, useTabChrome, useToneChrome } from './TabBackdrop';
import WeatherScene from './WeatherScene';

const PREVIEW_W = 92;
/** Önizlemedeki örnek hava: parçalı bulutlu gündüz. */
const SAMPLE_WEATHER = sceneFor(2, true);

export default function BackdropPicker() {
  const { settings, updateSettings, colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        intro: { fontSize: fs(13), color: colors.textMuted, lineHeight: fs(18), marginBottom: 14 },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 16 },
        block: { flexDirection: 'row', gap: 14 },
        options: { flex: 1, gap: 4 },
        tabRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
        tabLabel: { fontSize: fs(15), fontWeight: '800', color: colors.text },
        option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10 },
        optionOn: { backgroundColor: colors.primarySoft },
        swatch: { width: 22, height: 22, borderRadius: 11, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
        optionName: { flex: 1, fontSize: fs(13.5), color: colors.text },
        optionNameOn: { fontWeight: '800' },
        hint: { fontSize: fs(12.5), color: colors.textMuted, lineHeight: fs(17), marginTop: 10 },
        reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 10 },
        resetText: { fontSize: fs(14), fontWeight: '700', color: colors.primary },
      }),
    [colors, fs],
  );
  const changed = BACKDROP_TABS.some((t) => settings.backdrops[t.id] !== DEFAULT_BACKDROPS[t.id]);

  return (
    <>
      <Text style={styles.intro}>
        Her sekmenin arkasındaki sahneyi ayrı seçin. Hareket, Özelleştirme’deki “Hareketli arka planlar” ayarına uyar.
      </Text>
      {BACKDROP_TABS.map((t, i) => (
        <View key={t.id}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <TabChoice
            tab={t.id}
            label={t.label}
            icon={t.icon as IconName}
            value={settings.backdrops[t.id]}
            styles={styles}
            onChange={(id) => updateSettings({ backdrops: { ...settings.backdrops, [t.id]: id } })}
          />
        </View>
      ))}
      {changed ? (
        <Pressable
          onPress={() => {
            tapFeedback();
            updateSettings({ backdrops: DEFAULT_BACKDROPS });
          }}
          style={styles.reset}
          accessibilityRole="button"
        >
          <Icon name="refresh" size={16} color={colors.primary} />
          <Text style={styles.resetText}>Hepsini özgün sahneye döndür</Text>
        </Pressable>
      ) : null}
    </>
  );
}

function TabChoice({
  tab,
  label,
  icon,
  value,
  styles,
  onChange,
}: {
  tab: BackdropTab;
  label: string;
  icon: IconName;
  value: string;
  styles: Record<string, object>;
  onChange: (id: string) => void;
}) {
  const { colors } = useTheme();
  const selected = backdropFor(tab, { [tab]: value });
  return (
    <>
      <View style={styles.block}>
        <Preview tab={tab} />
        <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel={`${label} arka planı`}>
          <View style={styles.tabRow}>
            <Icon name={icon} size={16} color={colors.primary} />
            <Text style={styles.tabLabel}>{label}</Text>
          </View>
          {BACKDROPS[tab].map((b, i) => (
            <Option key={b.id} b={b} original={i === 0} on={b.id === selected.id} styles={styles} onPress={() => onChange(b.id)} />
          ))}
        </View>
      </View>
      <Text style={styles.hint}>
        {selected.hint}
        {tab === 'weather' ? ' (önizleme örnek havayla)' : ''}
      </Text>
    </>
  );
}

function Option({ b, original, on, styles, onPress }: { b: Backdrop; original: boolean; on: boolean; styles: Record<string, object>; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (on) return;
        tapFeedback();
        onPress();
      }}
      style={[styles.option, on && styles.optionOn]}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${b.name}${original ? ' (özgün)' : ''}. ${b.hint}`}
    >
      <View style={styles.swatch}>
        <LinearGradient colors={[sceneTint(colors, b.swatch[0]), sceneTint(colors, b.swatch[1])]} style={StyleSheet.absoluteFill} />
        <Icon name={b.icon as IconName} size={12} color="#FFFFFF" />
      </View>
      <Text style={[styles.optionName, on && styles.optionNameOn]} numberOfLines={1}>
        {b.name}
      </Text>
      {on ? <Icon name="checkmark-circle" size={18} color={colors.primary} /> : null}
    </Pressable>
  );
}

/**
 * Seçili sahnenin telefon görünümünde durağan önizlemesi: sahne tam ekran boyutunda çizilip küçültülür,
 * üstüne başlık, iki cam kart ve sekme çubuğu taslağı konur (yazının sahne üstünde nasıl duracağı görünsün).
 */
const Preview = memo(function Preview({ tab }: { tab: BackdropTab }) {
  const { width, height } = useWindowDimensions();
  const { colors, settings } = useTheme();
  const sky = useRizeSky();
  const chrome = useTabChrome(tab === 'weather' ? 'news' : tab, sky);
  const weatherFrame = useToneChrome(skyChrome(SAMPLE_WEATHER));
  const frame = tab === 'weather' ? weatherFrame : chrome;
  const s = PREVIEW_W / width;
  const h = Math.round(height * s);
  const scene =
    tab === 'news' ? (
      <NewsBackdrop sky={sky} active={false} />
    ) : tab === 'rizespor' ? (
      <RizesporBackdrop active={false} />
    ) : tab === 'tea' ? (
      <TeaBackdrop active={false} />
    ) : tab === 'economy' ? (
      <EconomyBackdrop active={false} />
    ) : (
      <WeatherScene scene={SAMPLE_WEATHER} active={false} variant={settings.backdrops.weather as WeatherStyle} />
    );
  const card = (top: number, lines: number) => (
    <View style={[pv.card, { top }]}>
      {Array.from({ length: lines }, (_, i) => (
        <View key={i} style={[pv.line, { width: i === 0 ? '80%' : '55%', opacity: i === 0 ? 0.85 : 0.55 }]} />
      ))}
    </View>
  );
  return (
    <View
      style={[pv.frame, { height: h + 22, borderColor: colors.border, backgroundColor: frame.footer }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <View style={{ height: 12, backgroundColor: frame.header }} />
      <View style={{ width: PREVIEW_W, height: h, overflow: 'hidden' }}>
        {/* Tam boyutta çizilip ortadan küçültülür; kaydırma sol üst köşeye hizalar. */}
        <View style={{ position: 'absolute', left: (PREVIEW_W - width) / 2, top: (h - height) / 2, width, height, transform: [{ scale: s }] }}>{scene}</View>
        {card(h * 0.16, 2)}
        {card(h * 0.36, 3)}
        {card(h * 0.6, 2)}
      </View>
      <View style={{ height: 10, backgroundColor: frame.footer, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.14)' }} />
    </View>
  );
});

const pv = StyleSheet.create({
  frame: { width: PREVIEW_W + 2, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  card: {
    position: 'absolute',
    left: 7,
    right: 7,
    padding: 6,
    gap: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  line: { height: 3, borderRadius: 2, backgroundColor: '#FFFFFF' },
});
