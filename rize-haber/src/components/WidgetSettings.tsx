/**
 * Ayarlar → "Ana ekran widget'ları": her widget'ın ne gösterdiği, ana ekranda olup olmadığı ve
 * (başlatıcı destekliyorsa) tek dokunuşla ekleme düğmesi. Kısayollar da burada anlatılır.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';

import { canPinWidget, installedWidgets, pinWidget, widgetsAvailable } from '../../modules/rize-widgets';
import { tapFeedback } from '../haptics';
import { useTheme } from '../theme';
import { WIDGET_CATALOG } from '../widgets/catalog';
import type { WidgetKind } from '../widgets/snapshot';
import { syncWidgets } from '../widgets/sync';
import { Icon } from './Icon';
import { PressableScale, useShowKey } from './motion';

export default function WidgetSettings() {
  const { colors, fs } = useTheme();
  const [counts, setCounts] = useState<Partial<Record<WidgetKind, number>>>(() => installedWidgets());
  const [canPin] = useState(() => canPinWidget());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const refresh = useCallback(() => setCounts(installedWidgets()), []);

  // Ayarlar her açıldığında (React'in "props değişince durumu ayarla" deseni: efekt yerine çizim sırasında)
  // ve uygulamaya dönüldüğünde (ör. başlatıcıdan widget eklendikten sonra) yenile.
  const shown = useShowKey();
  const [seen, setSeen] = useState(shown);
  if (seen !== shown) {
    setSeen(shown);
    setCounts(installedWidgets());
  }
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const add = useCallback(
    (kind: WidgetKind) => {
      tapFeedback();
      // Önce güncel veriyi yaz: widget ana ekrana düştüğü an dolu görünsün.
      syncWidgets().finally(() => pinWidget(kind));
      // Sistem onay sonucunu bildirmez; birkaç kez yeniden bakılır.
      timers.current.push(setTimeout(refresh, 2500), setTimeout(refresh, 6000));
    },
    [refresh],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
        icon: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 6 },
        title: { fontSize: fs(15), fontWeight: '700', color: colors.text },
        size: { fontSize: fs(12), color: colors.textMuted },
        desc: { fontSize: fs(12.5), color: colors.textMuted, marginTop: 2, lineHeight: fs(17) },
        placed: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
        placedText: { fontSize: fs(12), fontWeight: '700', color: colors.primary },
        button: {
          minHeight: 36,
          minWidth: 64,
          paddingHorizontal: 14,
          borderRadius: 999,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonText: { fontSize: fs(13), fontWeight: '700', color: colors.isDark ? '#0F1311' : colors.onPrimary },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        howTo: {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-start',
          padding: 10,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          marginTop: 12,
        },
        howToText: { flex: 1, fontSize: fs(12.5), color: colors.text, lineHeight: fs(18) },
      }),
    [colors, fs],
  );

  const showButtons = widgetsAvailable && canPin;

  return (
    <View>
      {WIDGET_CATALOG.map((w, i) => {
        const placed = (counts[w.kind] ?? 0) > 0;
        return (
          <View key={w.kind}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <View style={styles.icon}>
                <Icon name={w.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }} accessible accessibilityLabel={`${w.title} widget'ı, ${w.size}. ${w.description}${placed ? ' Ana ekranda.' : ''}`}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{w.title}</Text>
                  <Text style={styles.size}>{w.size}</Text>
                </View>
                <Text style={styles.desc}>{w.description}</Text>
                {placed ? (
                  <View style={styles.placed}>
                    <Icon name="checkmark-circle" size={14} color={colors.primary} />
                    <Text style={styles.placedText}>
                      Ana ekranda{(counts[w.kind] ?? 0) > 1 ? ` (${counts[w.kind]})` : ''}
                    </Text>
                  </View>
                ) : null}
              </View>
              {showButtons ? (
                <PressableScale
                  onPress={() => add(w.kind)}
                  scaleTo={0.95}
                  style={styles.button}
                  accessibilityRole="button"
                  accessibilityLabel={`${w.title} widget'ını ana ekrana ekle`}
                  hitSlop={6}
                >
                  <Text style={styles.buttonText}>{placed ? 'Bir daha' : 'Ekle'}</Text>
                </PressableScale>
              ) : null}
            </View>
          </View>
        );
      })}

      <View style={styles.howTo}>
        <Icon name="information-circle-outline" size={16} color={colors.primary} />
        <Text style={styles.howToText}>
          {showButtons
            ? 'Ekle’ye dokunun ve açılan pencerede yerini onaylayın. '
            : Platform.OS === 'android'
              ? 'Ana ekranda boş bir yere basılı tutun → Widget’lar → Rize Haber’i seçin. '
              : 'Widget’lar Android telefonlarda kullanılabilir. '}
          Widget’lar ana ekrandayken yaklaşık 30 dakikada bir kendiliğinden güncellenir; uygulamadaki renk, tema ve
          yazı boyutunu kullanır. Uygulama simgesine basılı tutarak da Haberler, Rizespor, Çay ve Hava’ya doğrudan
          gidebilirsiniz.
        </Text>
      </View>
    </View>
  );
}
