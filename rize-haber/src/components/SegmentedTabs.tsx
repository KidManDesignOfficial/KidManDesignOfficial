/** Seçili bölümün zemini yaylanarak kayan bölüm seçici (Keşfet ve Rizespor ekranlarında). */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { PressableScale, useReducedMotion } from './motion';

export type Segment<T extends string> = { id: T; label: string; icon: string };

export function SegmentedTabs<T extends string>({
  segments,
  value,
  onChange,
  activeColor,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Seçili zeminin rengi (varsayılan: tema vurgusu). */
  activeColor?: string;
}) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const index = Math.max(0, segments.findIndex((s) => s.id === value));
  const itemWidth = width > 0 ? (width - 8) / segments.length : 0;

  useEffect(() => {
    const toValue = index * itemWidth;
    if (reduced) slide.setValue(toValue);
    else Animated.spring(slide, { toValue, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }, [index, itemWidth, reduced, slide]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: 'row',
          margin: 12,
          marginBottom: 0,
          padding: 4,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 10 },
        itemWrap: { flex: 1 },
        item: { alignItems: 'center', paddingVertical: 8, borderRadius: 10, gap: 1 },
        icon: { fontSize: 16 },
        label: { fontSize: fs(13), fontWeight: '700', color: colors.text },
        labelActive: { color: activeColor ? '#FFFFFF' : colors.isDark ? '#0F1311' : colors.onPrimary },
      }),
    [colors, fs, activeColor],
  );

  return (
    <View style={styles.bar} accessibilityRole="tablist" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {itemWidth > 0 ? (
        <Animated.View
          style={[
            styles.pill,
            { width: itemWidth, backgroundColor: activeColor ?? colors.primary, transform: [{ translateX: slide }] },
          ]}
        />
      ) : null}
      {segments.map((s) => {
        const active = s.id === value;
        return (
          <PressableScale
            key={s.id}
            onPress={() => onChange(s.id)}
            style={styles.item}
            containerStyle={styles.itemWrap}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={s.label}
          >
            <Text style={styles.icon}>{s.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {s.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
