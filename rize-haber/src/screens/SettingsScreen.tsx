import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import appConfig from '../../app.json';

import BackdropPicker from '../components/BackdropPicker';
import { Icon } from '../components/Icon';

import LocationPicker from '../components/LocationPicker';
import WidgetSettings from '../components/WidgetSettings';
import { Card, Chip, LinkRow, SectionTitle, openUrl } from '../components/ui';
import { PressableScale, useSystemReducedMotion, useScrollTopOnShow } from '../components/motion';
import type { IconName } from '../components/Icon';
import { CONTACT_EMAIL, DEVELOPER_NAME } from '../config';
import { placeById, placeSubtitle, pushRecent, DISTRICT_PLACES } from '../places';
import { useFavorites } from '../favorites';
import { disableNewsNotifications, enableNewsNotifications, setMatchFeature } from '../notifications';
import { REMINDER_MINUTES, getMatchSettings } from '../rizespor/reminders';
import { loadNotificationsEnabled } from '../storage';
import { buildColors } from '../colors';
import { ECON_CHROME, MARKET } from '../economyScene';
import { GLASS, STADIUM_CHROME } from '../rizespor/stadium';
import { TEA_CHROME, TEA_GLASS } from '../teaScene';
import { tapFeedback } from '../haptics';
import {
  ACCENTS,
  DISCOVER_ENABLED,
  PALETTES,
  PALETTE_IDS,
  TEXT_SCALES,
  sceneTint,
  tint,
  useTheme,
  type AccentId,
  type PaletteId,
  type Settings,
  type TabId,
  type TextSize,
  type ThemeMode,
} from '../theme';

/** Sürüm derleme anında app.json'dan alınır (önbellekten bağımsız). */
const APP_VERSION = appConfig.expo.version;
const REPO = 'https://github.com/KidManDesignOfficial/KidManDesignOfficial';
const APP_PAGE = `${REPO}/tree/HEAD/rize-haber`;
const PRIVACY_URL = `${REPO}/blob/HEAD/rize-haber/GIZLILIK.md`;

function feedbackUrl(): string {
  const version = APP_VERSION;
  const body = `**Ne oldu / önerin nedir?**\n\n\n**Hangi ekranda?**\n\n\n---\nUygulama sürümü: ${version} · ${Platform.OS} ${Platform.Version}`;
  return `${REPO}/issues/new?title=${encodeURIComponent('Rize Haber: ')}&body=${encodeURIComponent(body)}`;
}

const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Sistem' },
  { id: 'light', label: 'Açık' },
  { id: 'dark', label: 'Koyu' },
];

const START_TABS = ([
  { id: 'news', label: 'Haberler' },
  { id: 'rizespor', label: 'Rizespor' },
  { id: 'tea', label: 'Çay' },
  { id: 'economy', label: 'Ekonomi' },
  { id: 'weather', label: 'Hava' },
  { id: 'rize', label: 'Keşfet' },
] as { id: TabId; label: string }[]).filter((t) => DISCOVER_ENABLED || t.id !== 'rize');

type ToggleKey = 'uiMotion' | 'sceneMotion' | 'haptics' | 'rainSound';

const TOGGLES: { key: ToggleKey; icon: IconName; label: string; hint: string }[] = [
  {
    key: 'uiMotion',
    icon: 'sparkles-outline',
    label: 'Arayüz animasyonları',
    hint: 'Ekran geçişleri, açılıp kapanan kartlar, dokununca yaylanma ve gol kutlaması.',
  },
  {
    key: 'sceneMotion',
    icon: 'film-outline',
    label: 'Hareketli arka planlar',
    hint: 'Yağmur, kar, bulutlar, çay buharı, borsa şeridi ve stadyum ışıkları. Kapalıyken manzaralar durağan görünür; pil tasarrufu sağlar.',
  },
  {
    key: 'haptics',
    icon: 'phone-portrait-outline',
    label: 'Titreşim',
    hint: 'Sekme değiştirirken ve kaydederken hafif titreşim.',
  },
  {
    key: 'rainSound',
    icon: 'rainy-outline',
    label: 'Yağmur sesi',
    hint: 'Hava ekranında, seçili yerde yağmur yağarken hafif yağmur sesi çalar.',
  },
];

const DATA_SOURCES = [
  { label: 'Haberler: Google Haberler', url: 'https://news.google.com' },
  { label: 'Hava durumu: Open-Meteo', url: 'https://open-meteo.com' },
  { label: 'Köy ve yayla konumları: GeoNames (CC BY 4.0)', url: 'https://www.geonames.org' },
  { label: 'Döviz kurları: TCMB', url: 'https://www.tcmb.gov.tr/kurlar/today.xml' },
  { label: 'Altın fiyatı: gold-api.com', url: 'https://gold-api.com' },
  { label: 'Çay fiyatları: T.C. Tarım ve Orman Bakanlığı', url: 'https://www.tarimorman.gov.tr' },
  { label: 'Çay sektörü: ÇAYKUR', url: 'https://www.caykur.gov.tr' },
  { label: 'Tarihçe: Rize Valiliği', url: 'https://www.rize.gov.tr' },
  { label: 'Rizespor maç verileri: ESPN (gayriresmî)', url: 'https://www.espn.com/soccer/team/_/id/7656' },
];

export default function SettingsScreen() {
  const scrollRef = useScrollTopOnShow();
  const { settings, updateSettings, colors, fs } = useTheme();
  const { favorites, clearFavorites } = useFavorites();
  const systemReduced = useSystemReducedMotion();
  const [pickerOpen, setPickerOpen] = useState(false);
  const defaultPlace = placeById(settings.weatherLocationId) ?? DISTRICT_PLACES[0];
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
        swatches: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, marginTop: 12 },
        swatch: { alignItems: 'center', width: '25%', gap: 6 },
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
        themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 },
        preview: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.primarySoft },
        previewText: { fontSize: fs(15), color: colors.text, lineHeight: fs(22) },
        switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        danger: { fontSize: fs(15), fontWeight: '700', color: colors.error },
        dangerDisabled: { opacity: 0.4 },
        about: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        version: { fontSize: fs(13), color: colors.textMuted, marginTop: 8 },
        legal: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: fs(18) },
        toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        toggleIcon: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        note: {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-start',
          padding: 10,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          marginBottom: 14,
        },
        noteText: { flex: 1, fontSize: fs(12.5), color: colors.text, lineHeight: fs(18) },
        tabGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
        placeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        placeName: { fontSize: fs(17), fontWeight: '800', color: colors.text },
        changeButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.primary,
        },
        changeText: { fontSize: fs(13), fontWeight: '700', color: colors.isDark ? '#0F1311' : colors.onPrimary },
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
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <SectionTitle>Görünüm</SectionTitle>
      <Card>
        <Text style={styles.rowLabel}>Tema</Text>
        <Text style={styles.rowHint}>Zemin, kart ve yazı tonları. Renk ve açık/koyu seçimiyle birlikte çalışır.</Text>
        <View style={styles.themeGrid} accessibilityRole="radiogroup">
          {PALETTE_IDS.map((id) => (
            <ThemeOption
              key={id}
              id={id}
              selected={settings.palette === id}
              accent={settings.accent}
              isDark={colors.isDark}
              onPress={() => updateSettings({ palette: id })}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Açık / koyu</Text>
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
                  {selected ? <Icon name="checkmark" size={22} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.swatchName} numberOfLines={1}>
                  {ACCENTS[id].short}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Renk düzeni</Text>
        <Text style={styles.rowHint}>
          “Tek renk” seçilince sahneler, başlıklar ve vurgular seçtiğiniz rengin tonlarına bürünür. Grafit ile
          uygulama tamamen siyah-beyaz olur. Yükseliş/düşüş ve kırmızı kart gibi anlam taşıyan renkler korunur.
        </Text>
        <View style={styles.themeGrid} accessibilityRole="radiogroup">
          {COLOR_MODES.map((m) => (
            <ColorModeOption
              key={m.id}
              mono={m.id === 'tek'}
              label={m.label}
              hint={m.hint}
              selected={settings.monochrome === (m.id === 'tek')}
              onPress={() => updateSettings({ monochrome: m.id === 'tek' })}
            />
          ))}
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

      <SectionTitle hint="Her sekmenin sahnesi ayrı seçilir">Arka planlar</SectionTitle>
      <Card>
        <BackdropPicker />
      </Card>

      <SectionTitle hint="Uygulamayı kendine göre ayarla">Özelleştirme</SectionTitle>
      <Card>
        {systemReduced ? (
          <View style={styles.note}>
            <Icon name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.noteText}>
              Telefonunuzda “Hareketi azalt” açık olduğu için animasyonlar bu ayarlardan bağımsız olarak kapalı.
            </Text>
          </View>
        ) : null}
        {TOGGLES.map((t, i) => (
          <View key={t.key}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <ToggleRow
              styles={styles}
              icon={t.icon}
              label={t.label}
              hint={t.hint}
              value={settings[t.key]}
              onChange={(v) => updateSettings({ [t.key]: v } as Partial<Settings>)}
            />
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.rowLabel}>Açılış ekranı</Text>
        <Text style={styles.rowHint}>Uygulama açıldığında ve geri tuşuna basınca bu sekme gelir.</Text>
        <View style={styles.tabGrid} accessibilityRole="radiogroup">
          {START_TABS.map((t) => (
            <Chip key={t.id} label={t.label} selected={settings.startTab === t.id} onPress={() => updateSettings({ startTab: t.id })} />
          ))}
        </View>
      </Card>

      <SectionTitle hint="Hava Durumu ekranı bu konumla açılır">Varsayılan konum</SectionTitle>
      <Card>
        <PressableScale
          onPress={() => setPickerOpen(true)}
          scaleTo={0.98}
          style={styles.placeRow}
          accessibilityRole="button"
          accessibilityLabel={`Varsayılan konum: ${defaultPlace.name}. Değiştir`}
        >
          <View style={styles.toggleIcon}>
            <Icon name="location-outline" size={19} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.placeName} numberOfLines={1}>
              {defaultPlace.name}
            </Text>
            <Text style={styles.rowHint} numberOfLines={1}>
              {placeSubtitle(defaultPlace)}
            </Text>
          </View>
          <View style={styles.changeButton}>
            <Icon name="search" size={14} color={colors.isDark ? '#0F1311' : colors.onPrimary} />
            <Text style={styles.changeText}>Değiştir</Text>
          </View>
        </PressableScale>
        <Text style={[styles.rowHint, { marginTop: 10 }]}>
          12 ilçe ve bunlara bağlı yaklaşık 480 köy, belde ve yayla arasından seçebilirsin.
        </Text>
      </Card>
      <LocationPicker
        visible={pickerOpen}
        selectedId={settings.weatherLocationId}
        recentIds={settings.recentPlaces}
        title="Varsayılan konum"
        onSelect={(p) =>
          updateSettings({
            weatherLocationId: p.id,
            recentPlaces: DISTRICT_PLACES.includes(p) ? settings.recentPlaces : pushRecent(settings.recentPlaces, p.id),
          })
        }
        onClose={() => setPickerOpen(false)}
      />

      <SectionTitle>Bildirimler</SectionTitle>
      <Card>
        <NotificationSetting styles={styles} />
        <View style={styles.divider} />
        <MatchSetting
          styles={styles}
          settingKey="reminders"
          label="Maç hatırlatmaları"
          hint={`Rizespor maçlarından ${REMINDER_MINUTES} dakika önce: “🍵 Çayını demle, maç başlıyor!”`}
        />
        <View style={styles.divider} />
        <MatchSetting
          styles={styles}
          settingKey="scoreAlerts"
          label="Skor bildirimleri"
          hint="Maç başladı, gol ve maç sonu. Arka planda en sık ~15–30 dakikada bir kontrol edildiği için gecikmeli gelebilir; anlık takip için Maç Merkezi’ni açın."
        />
      </Card>

      {Platform.OS !== 'ios' ? (
        <>
          <SectionTitle hint="Uygulamayı açmadan bakın, tek dokunuşla girin">Ana ekran widget’ları</SectionTitle>
          <Card>
            <WidgetSettings />
          </Card>
        </>
      ) : null}

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
          Rize Haber; Rize’nin haberlerini, hava durumunu, yaş çay alım fiyatını, Çaykur Rizespor’u ve gezi
          rehberini tek yerde toplar.
        </Text>
        <Text style={styles.version}>
          Sürüm {APP_VERSION} · Geliştirici: {DEVELOPER_NAME}
        </Text>
        <View style={styles.divider} />
        <ActionRow
          icon="mail-outline"
          label="İletişim"
          hint={CONTACT_EMAIL}
          onPress={() =>
            Linking.openURL(
              `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Rize Haber ${APP_VERSION}`)}`,
            ).catch(() => {})
          }
        />
        <ActionRow
          icon="chatbubble-ellipses-outline"
          label="Görüş bildir"
          hint="Hata, öneri veya eksik bilgi"
          onPress={() => openUrl(feedbackUrl(), colors)}
        />
        <ActionRow
          icon="share-social-outline"
          label="Uygulamayı paylaş"
          hint="Rizeli dostlarına öner"
          onPress={() =>
            Share.share({
              message: `Rize’nin haberleri, yaş çay fiyatı, Rizespor ve gezi rehberi tek uygulamada: Rize Haber\n${APP_PAGE}`,
            }).catch(() => {})
          }
        />
        <ActionRow icon="shield-checkmark-outline" label="Gizlilik politikası" onPress={() => openUrl(PRIVACY_URL, colors)} />
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

const COLOR_MODES = [
  { id: 'sekme', label: 'Sekmeye göre', hint: 'Her sekme kendi renginde' },
  { id: 'tek', label: 'Tek renk', hint: 'Her yer seçtiğiniz renkte' },
] as const;

/** Önizlemede gösterilen sekme çerçeveleri ve vurguları (Haberler, Rizespor, Çay, Ekonomi, Hava). */
const TAB_SWATCHES: readonly (readonly [string, string, string])[] = [
  ['#1D6782', '#1F6040', '#FFFFFF'],
  [STADIUM_CHROME.header, STADIUM_CHROME.footer, GLASS.accent],
  [TEA_CHROME.header, TEA_CHROME.footer, TEA_GLASS.accent],
  [ECON_CHROME.header, ECON_CHROME.footer, MARKET.gold],
  ['#2F7FC1', '#7DB8E8', '#FFFFFF'],
];

/** Renk düzeni seçeneği: beş sekmenin çerçeve ve vurgu renkleriyle küçük önizleme. */
function ColorModeOption({ mono, label, hint, selected, onPress }: { mono: boolean; label: string; hint: string; selected: boolean; onPress: () => void }) {
  const { colors, fs, settings } = useTheme();
  const c = useMemo(
    () => buildColors(settings.accent, colors.isDark, settings.palette, mono),
    [settings.accent, colors.isDark, settings.palette, mono],
  );
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      scaleTo={0.97}
      containerStyle={{ width: '48%' }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}. ${hint}`}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
          padding: 8,
          borderRadius: 14,
          borderWidth: selected ? 2.5 : 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: colors.background,
        }}
      >
        {TAB_SWATCHES.map(([top, bottom, accent], i) => (
          <View key={i} style={{ flex: 1, height: 46, borderRadius: 7, overflow: 'hidden' }}>
            <LinearGradient colors={[sceneTint(c, top), sceneTint(c, bottom)]} style={StyleSheet.absoluteFill} />
            <View style={{ position: 'absolute', left: 4, right: 4, bottom: 5, height: 4, borderRadius: 2, backgroundColor: tint(c, accent) }} />
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 6, fontSize: fs(13), fontWeight: selected ? '800' : '600', color: colors.text }} numberOfLines={1}>
        {label}
      </Text>
      <Text style={{ fontSize: fs(11), color: colors.textMuted }} numberOfLines={1}>
        {hint}
      </Text>
    </PressableScale>
  );
}

/** Tema seçeneği: seçili renk ve açık/koyu görünümle küçük bir ekran önizlemesi. */
function ThemeOption({
  id,
  selected,
  accent,
  isDark,
  onPress,
}: {
  id: PaletteId;
  selected: boolean;
  accent: AccentId;
  isDark: boolean;
  onPress: () => void;
}) {
  const { colors, fs } = useTheme();
  const c = useMemo(() => buildColors(accent, isDark, id), [accent, isDark, id]);
  const bar = (w: `${number}%`, color: string, h = 5) => <View style={{ width: w, height: h, borderRadius: 3, backgroundColor: color }} />;
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      scaleTo={0.97}
      containerStyle={{ width: '48%' }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${PALETTES[id].name} teması. ${PALETTES[id].hint}`}
    >
      <View
        style={{
          borderRadius: 14,
          borderWidth: selected ? 2.5 : 1,
          borderColor: selected ? colors.primary : colors.border,
          overflow: 'hidden',
          backgroundColor: c.background,
        }}
      >
        <View style={{ height: 16, backgroundColor: c.header }} />
        <View style={{ padding: 8, gap: 6 }}>
          <View
            style={{ backgroundColor: c.card, borderRadius: 8, padding: 7, gap: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }}
          >
            {bar('85%', c.text)}
            {bar('60%', c.textMuted, 4)}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 22, height: 10, borderRadius: 5, backgroundColor: c.primary }} />
            {bar('40%', c.textMuted, 4)}
          </View>
        </View>
        {selected ? (
          <View
            style={{
              position: 'absolute',
              top: 3,
              right: 4,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="checkmark" size={13} color={colors.primary} />
          </View>
        ) : null}
      </View>
      <Text style={{ marginTop: 6, fontSize: fs(13), fontWeight: selected ? '800' : '600', color: colors.text }} numberOfLines={1}>
        {PALETTES[id].name}
      </Text>
      <Text style={{ fontSize: fs(11), color: colors.textMuted, lineHeight: fs(15) }} numberOfLines={2}>
        {PALETTES[id].hint}
      </Text>
    </PressableScale>
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

function ToggleRow({
  styles,
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  styles: Record<string, object>;
  icon: IconName;
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}>
        <Icon name={icon} size={19} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
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

function MatchSetting({
  styles,
  settingKey,
  label,
  hint,
}: {
  styles: Record<string, object>;
  settingKey: 'reminders' | 'scoreAlerts';
  label: string;
  hint: string;
}) {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMatchSettings().then((s) => setEnabled(s[settingKey]));
  }, [settingKey]);

  const toggle = useCallback(
    async (next: boolean) => {
      if (busy) return;
      setBusy(true);
      try {
        const result = await setMatchFeature(settingKey, next);
        if (result === 'enabled') setEnabled(next);
        else if (result === 'permission-denied') {
          Alert.alert('Bildirim izni gerekli', 'Telefon ayarlarından Rize Haber uygulamasına bildirim izni verin.', [
            { text: 'Vazgeç', style: 'cancel' },
            { text: 'Ayarları aç', onPress: () => Linking.openSettings() },
          ]);
        } else {
          Alert.alert(
            'Arka plan kısıtlı',
            'Telefonunuz uygulamanın arka planda çalışmasına izin vermiyor. Ayarlar → Uygulamalar → Rize Haber → Pil bölümünden kısıtlamayı kaldırabilirsiniz.',
          );
        }
      } catch {
        Alert.alert('Bir sorun oluştu', 'Ayar değiştirilemedi. Lütfen tekrar deneyin.');
      } finally {
        setBusy(false);
      }
    },
    [busy, settingKey],
  );

  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      {enabled === null || busy ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
          accessibilityLabel={label}
        />
      )}
    </View>
  );
}

function ActionRow({ icon, label, hint, onPress }: { icon: IconName; label: string; hint?: string; onPress: () => void }) {
  const { colors, fs } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={19} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fs(15), fontWeight: '700', color: colors.text }}>{label}</Text>
        {hint ? <Text style={{ fontSize: fs(12), color: colors.textMuted, marginTop: 1 }}>{hint}</Text> : null}
      </View>
      <Icon name="chevron-forward" size={18} color={colors.textMuted} />
    </PressableScale>
  );
}
