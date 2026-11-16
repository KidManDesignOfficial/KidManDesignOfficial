/** Tüm ekranlarda ortak kullanılan, temaya duyarlı küçük arayüz parçaları. */
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { useTheme, type Colors } from '../theme';
import { Icon } from './Icon';

export function openUrl(url: string, colors: Colors) {
  WebBrowser.openBrowserAsync(url, {
    toolbarColor: colors.header,
    controlsColor: colors.primary,
  }).catch(() => {});
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {children}
      </Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  glass = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Hava sahnesi gibi renkli arka planlar için yarı saydam (cam) görünüm. */
  glass?: boolean;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipActive, glass && styles.chipGlass, glass && selected && styles.chipGlassActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextActive,
          glass && styles.chipGlassText,
          glass && selected && styles.chipGlassTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Yatay kaydırılan seçim şeridi. ScrollView varsayılan olarak küçülebildiği için flexShrink: 0. */
export function ChipRow({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsScroll}
      contentContainerStyle={styles.chips}
    >
      {children}
    </ScrollView>
  );
}

export function LinkRow({ label, url }: { label: string; url: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => openUrl(url, colors)}
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Text style={styles.linkText}>{label}</Text>
      <Icon name="open-outline" size={18} color={colors.primary} />
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function useStyles() {
  const { colors, fs } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        sectionHeader: { marginTop: 24, marginBottom: 10, gap: 2 },
        sectionTitle: { fontSize: fs(18), fontWeight: '800', color: colors.text },
        sectionHint: { fontSize: fs(13), color: colors.textMuted },
        chipsScroll: { flexGrow: 0, flexShrink: 0 },
        chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
        chip: {
          flexShrink: 0,
          minHeight: 38,
          justifyContent: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
        chipText: { fontSize: fs(14), fontWeight: '600', color: colors.text },
        chipTextActive: { color: colors.isDark ? '#0F1311' : colors.onPrimary },
        chipGlass: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.28)' },
        chipGlassActive: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
        chipGlassText: { color: '#FFFFFF' },
        chipGlassTextActive: { color: '#1D2B3A' },
        linkRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        linkText: { flex: 1, fontSize: fs(15), color: colors.primary, fontWeight: '600' },
        linkArrow: { fontSize: fs(16), color: colors.primary },
        pressed: { opacity: 0.6 },
        button: {
          backgroundColor: colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: 'center',
        },
        buttonPressed: { opacity: 0.8 },
        buttonText: { color: colors.isDark ? '#0F1311' : colors.onPrimary, fontWeight: '700', fontSize: fs(15) },
      }),
    [colors, fs],
  );
}
