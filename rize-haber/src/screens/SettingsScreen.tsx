import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';

import { Card, Chip, ChipRow, LinkRow, SectionTitle } from '../components/ui';
import { WEATHER_LOCATIONS } from '../config';
import { useFavorites } from '../favorites';
import { disableNewsNotifications, enableNewsNotifications } from '../notifications';
import { loadNotificationsEnabled } from '../storage';
import {
  ACCENTS,
  TEXT_SCALES,
  useTheme,
  type AccentId,
  type TextSize,
  type ThemeMode,
} from '../theme';

const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Sistem' },
  { id: 'light', label: 'Açık' },
  { id: 'dark', label: 'Koyu' },
];

const DATA_SOURCES = [
  { label: 'Haberler: Google Haberler', url: 'https://news.google.com' },
  { label: 'Hava durumu: Open-Meteo', url: 'https://open-meteo.com' },
  { label: 'Çay fiyatları: T.C. Tarım ve Orman Bakanlığı', url: 'https://www.tarimorman.gov.tr' },
  { label: 'Çay sektörü: ÇAYKUR', url: 'https://www.caykur.gov.tr' },
  { label: 'Tarihçe: Rize Valiliği', url: 'https://www.rize.gov.tr' },
];

export default function SettingsScreen() {
  const { settings, updateSettings, colors, fs } = useTheme();
  const { favorites, clearFavorites } = useFavorites();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: 16, paddingBottom: 40 },
        rowLabel: { fontSize: fs(15), fontWeight: '600', color: colors.text },
        rowHint: { fontSize: fs(13), color: colors.textMuted, marginTop: 2, lineHeight: fs(18) },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 14 },
        segment: {
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 4,
          marginTop: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
        segmentItemActive: { backgroundColor: colors.primary },
        segmentText: { fontSize: fs(14), fontWeight: '600', color: colors.text },
        segmentTextActive: { color: colors.isDark ? '#0F1311' : colors.onPrimary },
        swatches: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 12 },
        swatch: { alignItems: 'center', width: 60, gap: 6 },
        swatchCircle: {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: 'transparent',
        },
        swatchSelected: { borderColor: colors.text },
        swatchCheck: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
        swatchName: { fontSize: fs(11), color: colors.textMuted, textAlign: 'center' },
        preview: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.primarySoft },
        previewText: { fontSize: fs(15), color: colors.text, lineHeight: fs(22) },
        switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        danger: { fontSize: fs(15), fontWeight: '700', color: colors.error },
        dangerDisabled: { opacity: 0.4 },
        about: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        version: { fontSize: fs(13), color: colors.textMuted, marginTop: 8 },
        legal: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: fs(18) },
        chipBleed: { marginHorizontal: -16, marginTop: 4 },
      }),
    [colors, fs],
  );

  const confirmClearFavorites = useCallback(() => {
    Alert.alert('Kaydedilenler silinsin mi?', `${favorites.length} kayıtlı haber silinecek. Bu işlem geri alınamaz.`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: clearFavorites },
    ]);
  }, [favorites.length, clearFavorites]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionTitle>Görünüm</SectionTitle>
      <Card>
        <Text style={styles.rowLabel}>Tema</Text>
        <Text style={styles.rowHint}>“Sistem”, telefonunuzun açık/koyu ayarını izler.</Text>
        <Segmented
          styles={styles}
          options={MODES}
          value={settings.mode}
          onChange={(mode) => updateSettings({ mode })}
        />

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Renk</Text>
        <View style={styles.swatches}>
          {(Object.keys(ACCENTS) as AccentId[]).map((id) => {
            const selected = settings.accent === id;
            return (
              <Pressable
                key={id}
                onPress={() => updateSettings({ accent: id })}
                style={styles.swatch}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={ACCENTS[id].name}
              >
                <View
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: ACCENTS[id].light },
                    selected && styles.swatchSelected,
                  ]}
                >
                  {selected ? <Text style={styles.swatchCheck}>✓</Text> : null}
                </View>
                <Text style={styles.swatchName} numberOfLines={1}>
                  {ACCENTS[id].short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Yazı boyutu</Text>
        <Segmented
          styles={styles}
          options={(Object.keys(TEXT_SCALES) as TextSize[]).map((id) => ({ id, label: TEXT_SCALES[id].name }))}
          value={settings.textSize}
          onChange={(textSize) => updateSettings({ textSize })}
        />
        <View style={styles.preview}>
          <Text style={styles.previewText}>Önizleme: Rize’de bugün hava parçalı bulutlu.</Text>
        </View>
      </Card>

      <SectionTitle hint="Hava Durumu ekranı bu konumla açılır">Varsayılan konum</SectionTitle>
      <View style={styles.chipBleed}>
        <ChipRow>
          {WEATHER_LOCATIONS.map((l) => (
            <Chip
              key={l.id}
              label={l.name}
              selected={settings.weatherLocationId === l.id}
              onPress={() => updateSettings({ weatherLocationId: l.id })}
            />
          ))}
        </ChipRow>
      </View>

      <SectionTitle>Bildirimler</SectionTitle>
      <Card>
        <NotificationSetting styles={styles} />
      </Card>

      <SectionTitle>Veriler</SectionTitle>
      <Card>
        <Pressable
          onPress={confirmClearFavorites}
          disabled={favorites.length === 0}
          accessibilityRole="button"
          accessibilityState={{ disabled: favorites.length === 0 }}
        >
          <Text style={[styles.danger, favorites.length === 0 && styles.dangerDisabled]}>
            Kaydedilen haberleri temizle
          </Text>
          <Text style={styles.rowHint}>
            {favorites.length > 0 ? `${favorites.length} kayıtlı haber var.` : 'Kayıtlı haber yok.'}
          </Text>
        </Pressable>
      </Card>

      <SectionTitle>Hakkında</SectionTitle>
      <Card>
        <Text style={styles.about}>
          Rize Haber; Rize’nin güncel haberlerini, hava durumunu ve yaş çay alım fiyatlarını tek yerde toplar.
        </Text>
        <Text style={styles.version}>Sürüm {Constants.expoConfig?.version ?? '–'}</Text>
      </Card>

      <SectionTitle>Veri kaynakları</SectionTitle>
      <Card>
        {DATA_SOURCES.map((s) => (
          <LinkRow key={s.url} label={s.label} url={s.url} />
        ))}
      </Card>

      <Text style={styles.legal}>
        Rize Haber bağımsız bir uygulamadır; herhangi bir kamu kurumuyla bağlantısı yoktur. Resmî bilgiler ilgili
        kurumların yayımladığı kaynaklardan derlenir ve kaynak bağlantılarıyla birlikte sunulur. Haber içeriklerinin
        hakları ilgili yayın kuruluşlarına aittir.
      </Text>
    </ScrollView>
  );
}

function Segmented<T extends string>({
  styles,
  options,
  value,
  onChange,
}: {
  styles: Record<string, object>;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NotificationSetting({ styles }: { styles: Record<string, object> }) {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadNotificationsEnabled().then(setEnabled);
  }, []);

  const toggle = useCallback(
    async (next: boolean) => {
      if (busy) return;
      setBusy(true);
      try {
        if (!next) {
          await disableNewsNotifications();
          setEnabled(false);
          return;
        }
        const result = await enableNewsNotifications();
        if (result === 'enabled') {
          setEnabled(true);
          Alert.alert(
            'Bildirimler açıldı',
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
    },
    [busy],
  );

  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>Yeni haber bildirimleri</Text>
        <Text style={styles.rowHint}>Rize’de yeni bir haber yayımlandığında bildirim alın (~30 dk aralıkla).</Text>
      </View>
      {enabled === null || busy ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
          accessibilityLabel="Yeni haber bildirimleri"
        />
      )}
    </View>
  );
}
