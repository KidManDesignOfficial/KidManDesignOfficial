/**
 * Alt sekme çubuğu ve üst başlık yazısı.
 *
 * - Seçili sekmenin üstündeki gösterge çizgisi sekmeden sekmeye yaylanarak kayar (yerel sürücüde).
 * - Seçilen simge kısa bir "tık" hissiyle büyüyüp yerine oturur.
 * - Ayarlar açıkken hiçbir sekme seçili değildir; gösterge solarak kaybolur.
 * - Başlık yazısı değişince hafif aşağıdan solarak gelir.
 *
 * "Arayüz animasyonları" kapalıysa ya da telefonda "Hareketi azalt" açıksa hepsi anında yerine oturur.
 */
import { memo, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from './Icon';
import { EASE_OUT, useAnimatedValue, useReducedMotion } from './motion';

export type TabItem<T extends string> = { id: T; label: string; icon: IconName; iconActive: IconName };

const INDICATOR_W = 28;

export function TabBar<T extends string>({
  tabs,
  active,
  onPress,
  accent,
  idle,
  style,
  labelStyle,
}: {
  tabs: readonly TabItem<T>[];
  /** Seçili sekme; Ayarlar açıkken null. */
  active: T | null;
  onPress: (id: T) => void;
  /** Seçili sekmenin rengi (sekmeye ve sahneye göre değişir). */
  accent: (id: T) => string;
  idle: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = active ? tabs.findIndex((t) => t.id === active) : -1;
  const x = useAnimatedValue(0);
  const shown = useAnimatedValue(index >= 0 ? 1 : 0);
  const placed = useRef(false);
  const tabW = width / Math.max(1, tabs.length);

  useEffect(() => {
    if (!width || index < 0) return;
    const to = index * tabW + (tabW - INDICATOR_W) / 2;
    // İlk yerleşim ve azaltılmış hareket: kaydırmadan doğrudan yerine.
    if (!placed.current || reduced) {
      x.setValue(to);
      placed.current = true;
      return;
    }
    Animated.spring(x, { toValue: to, useNativeDriver: true, speed: 18, bounciness: 7 }).start();
  }, [index, tabW, width, reduced, x]);

  useEffect(() => {
    Animated.timing(shown, { toValue: index >= 0 ? 1 : 0, duration: reduced ? 0 : 180, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [index, reduced, shown]);

  const color = active ? accent(active) : idle;
  return (
    <SafeAreaView edges={['bottom']} style={style} accessibilityRole="tablist">
      <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.indicator, { backgroundColor: color, opacity: shown, transform: [{ translateX: x }] }]}
          />
        ) : null}
        {tabs.map((t) => (
          <TabButton
            key={t.id}
            item={t}
            selected={t.id === active}
            color={t.id === active ? accent(t.id) : idle}
            onPress={onPress}
            labelStyle={labelStyle}
            reduced={reduced}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const TabButton = memo(function TabButton<T extends string>({
  item,
  selected,
  color,
  onPress,
  labelStyle,
  reduced,
}: {
  item: TabItem<T>;
  selected: boolean;
  color: string;
  onPress: (id: T) => void;
  labelStyle?: StyleProp<TextStyle>;
  reduced: boolean;
}) {
  const pop = useAnimatedValue(1);
  const was = useRef(selected);
  useEffect(() => {
    if (selected && !was.current && !reduced) {
      pop.setValue(0.86);
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 12 }).start();
    }
    was.current = selected;
  }, [selected, reduced, pop]);

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={styles.button}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={item.label}
      android_ripple={{ color: 'rgba(127,127,127,0.18)', borderless: true, radius: 36 }}
    >
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <Icon name={selected ? item.iconActive : item.icon} size={23} color={color} />
      </Animated.View>
      <Text
        style={[labelStyle, { color }, selected && styles.labelOn]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}) as <T extends string>(props: {
  item: TabItem<T>;
  selected: boolean;
  color: string;
  onPress: (id: T) => void;
  labelStyle?: StyleProp<TextStyle>;
  reduced: boolean;
}) => ReactElement;

/** Değişince hafif aşağıdan solarak gelen başlık yazısı. */
export function HeaderTitle({ title, style }: { title: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotion();
  const t = useAnimatedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 260, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [title, reduced, t]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  return (
    <Animated.Text style={[style, { opacity: t, transform: [{ translateY }] }]} numberOfLines={1} accessibilityRole="header">
      {title}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'stretch' },
  button: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 6, paddingHorizontal: 2, gap: 2 },
  indicator: { position: 'absolute', top: 0, left: 0, height: 3, width: INDICATOR_W, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  labelOn: { fontWeight: '800' },
});
