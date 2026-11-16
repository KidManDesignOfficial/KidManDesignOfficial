/**
 * Ortak arayüz parçaları: ekran iskeleti, kart, düğme, çip, ilerleme çubuğu, başlıklar.
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapFeedback } from '../lib/haptics';
import { useNav } from '../nav';
import { alpha, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { EASE_OUT, PressableScale, useAnimatedValue, useReducedMotion } from './motion';

export function T({
  children,
  size = 15,
  weight = '400',
  color,
  muted,
  style,
  center,
  lines,
}: {
  children: ReactNode;
  size?: number;
  weight?: TextStyle['fontWeight'];
  color?: string;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  center?: boolean;
  lines?: number;
}) {
  const { c, fs } = useTheme();
  return (
    <Text
      numberOfLines={lines}
      style={[
        { fontSize: fs(size), lineHeight: Math.round(fs(size) * 1.42), fontWeight: weight, color: color ?? (muted ? c.textMuted : c.text) },
        center && { textAlign: 'center' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Yığın ekranlarının iskeleti: geri düğmeli başlık + kaydırılabilir gövde. */
export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  footer,
  headerColor,
  contentStyle,
  scrollProps,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  headerColor?: [string, string];
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
}) {
  const { c } = useTheme();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const onColor = headerColor ? '#FFFFFF' : c.text;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <PressableScale
        onPress={() => {
          tapFeedback();
          nav.pop();
        }}
        accessibilityRole="button"
        accessibilityLabel="Geri"
        hitSlop={8}
        style={[styles.headerBtn, { backgroundColor: headerColor ? 'rgba(255,255,255,0.18)' : c.card, borderColor: headerColor ? 'transparent' : c.border }]}
      >
        <Icon name="chevron-back" size={22} color={onColor} />
      </PressableScale>
      <View style={styles.headerText}>
        <T size={18} weight="800" color={onColor} lines={1}>
          {title}
        </T>
        {subtitle ? (
          <T size={12.5} color={headerColor ? 'rgba(255,255,255,0.8)' : c.textMuted} lines={1}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right ?? <View style={styles.headerBtnSpace} />}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: (footer ? 16 : insets.bottom + 32) }, contentStyle]}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: c.bg }]}>
      {headerColor ? (
        <LinearGradient colors={headerColor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {header}
        </LinearGradient>
      ) : (
        header
      )}
      {body}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: c.bg, borderTopColor: c.border }]}>{footer}</View> : null}
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  const { c, dark } = useTheme();
  const base = [styles.card, { backgroundColor: c.card, borderColor: c.border }, !dark && styles.shadow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={base}
    >
      {children}
    </PressableScale>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  style,
  gradient,
  small,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  gradient?: [string, string];
  small?: boolean;
}) {
  const { c, fs } = useTheme();
  const fg = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : variant === 'secondary' ? c.primary : c.textMuted;
  const bg = variant === 'primary' ? c.primary : variant === 'danger' ? c.danger : variant === 'secondary' ? c.primarySoft : 'transparent';
  const inner = (
    <View style={[styles.btnInner, small && styles.btnSmall]}>
      {icon ? <Icon name={icon} size={small ? 16 : 19} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: fs(small ? 14 : 16), fontWeight: '700' }}>{label}</Text>
    </View>
  );
  return (
    <PressableScale
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      containerStyle={style}
      style={[styles.btn, { backgroundColor: gradient ? 'transparent' : bg, opacity: disabled ? 0.45 : 1 }]}
    >
      {gradient && variant === 'primary' ? (
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </PressableScale>
  );
}

export function Chip({ label, selected, onPress, icon, color }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; color?: string }) {
  const { c, fs } = useTheme();
  const tint = color ?? c.primary;
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, { backgroundColor: selected ? tint : c.card, borderColor: selected ? tint : c.border }]}
    >
      {icon ? <Icon name={icon} size={15} color={selected ? '#FFFFFF' : c.textMuted} /> : null}
      <Text style={{ color: selected ? '#FFFFFF' : c.text, fontSize: fs(13.5), fontWeight: '600' }}>{label}</Text>
    </PressableScale>
  );
}

/** Genişliği yumuşakça dolan ilerleme çubuğu (0–1). */
export function ProgressBar({ value, color, height = 8, track }: { value: number; color?: string; height?: number; track?: string }) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(p, { toValue: Math.max(0, Math.min(1, value)), duration: reduced ? 0 : 700, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [value, p, reduced]);
  const width = p.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track ?? c.cardAlt, overflow: 'hidden' }}>
      <Animated.View style={{ width, height, borderRadius: height, backgroundColor: color ?? c.primary }} />
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.section}>
      <T size={17} weight="800">
        {title}
      </T>
      {action ? (
        <PressableScale onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <T size={13.5} weight="700" color={c.primary}>
            {action}
          </T>
        </PressableScale>
      ) : null}
    </View>
  );
}

export function IconBadge({ name, color, size = 40, solid }: { name: IconName; color: string; size?: number; solid?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: solid ? color : alpha(color, 0.14), alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.5} color={solid ? '#FFFFFF' : color} />
    </View>
  );
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={styles.empty}>
      <IconBadge name={icon} color={c.primary} size={68} />
      <T size={18} weight="800" center>
        {title}
      </T>
      <T muted center>
        {text}
      </T>
      {action}
    </View>
  );
}

export function Stat({ label, value, icon, color }: { label: string; value: string; icon: IconName; color: string }) {
  return (
    <Card style={styles.stat}>
      <IconBadge name={icon} color={color} size={34} />
      <T size={20} weight="800" style={{ marginTop: 8 }}>
        {value}
      </T>
      <T size={12} muted lines={1}>
        {label}
      </T>
    </Card>
  );
}

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  headerBtnSpace: { width: 40 },
  headerText: { flex: 1 },
  content: { padding: 16, gap: 14 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  card: { borderRadius: 20, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  shadow: { shadowColor: '#1B1F5C', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  btn: { borderRadius: 16, overflow: 'hidden' },
  btnGradient: { borderRadius: 16 },
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, paddingHorizontal: 20 },
  btnSmall: { paddingVertical: 10, paddingHorizontal: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 48, paddingHorizontal: 24 },
  stat: { flex: 1, padding: 14, minWidth: 0 },
});
