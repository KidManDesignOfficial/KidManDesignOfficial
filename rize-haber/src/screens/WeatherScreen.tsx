import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon, type IconName } from '../components/Icon';
import LocationPicker from '../components/LocationPicker';
import { PressableScale, useScrollTopOnShow } from '../components/motion';
import { HeroSkeleton } from '../components/Skeleton';
import { Chip, ChipRow, PrimaryButton } from '../components/ui';
import { useBackdrop } from '../components/Backdrop';
import WeatherScene from '../components/WeatherScene';
import type { WeatherStyle } from '../backdrops';
import { WEATHER_LOCATIONS } from '../config';
import { DISTRICT_PLACES, districtName, placeById, pushRecent, type Place } from '../places';
import { pressFeedback } from '../haptics';
import { loadCachedWeather, saveCachedWeather, savedAtLabel } from '../offline';
import { useRainSound, useRainSoundPreference } from '../rainSound';
import { useTheme } from '../theme';
import { clockTime, dayLabel } from '../time';
import { describeWeatherCode, fetchWeather, type Weather } from '../weather';
import { sceneFor, skyChrome, type SkyChrome } from '../weatherScene';

const WHITE = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.78)';
const GLASS = 'rgba(255,255,255,0.13)';
const GLASS_BORDER = 'rgba(255,255,255,0.24)';
/** Beyaz bulutun ya da parlak gökyüzünün önündeki yazılar için yumuşak gölge. */
const SHADOW = {
  textShadowColor: 'rgba(0,0,0,0.25)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 8,
} as const;

export default function WeatherScreen({
  active = true,
  onSkyColors,
}: {
  /** Ekran görünür mü? Değilse sahne animasyonları ve ses durur (pil tasarrufu). */
  active?: boolean;
  /** Üst başlık ve alt sekme çubuğunu gökyüzüne uydurmak için renkler; veri yokken null. */
  onSkyColors?: (colors: SkyChrome | null) => void;
}) {
  const scrollRef = useScrollTopOnShow();
  const { colors, fs, settings, updateSettings } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  // Kullanıcının bu ekranda seçtiği ilçe; Ayarlar'daki varsayılan değişirse geçersiz olur.
  const [choice, setChoice] = useState<{ base: string; id: string } | null>(null);
  const locationId = choice && choice.base === settings.weatherLocationId ? choice.id : settings.weatherLocationId;
  // Veri ilçeye bağlı tutulur: ilçe değişince eski ilçenin verisi bir an bile görünmez.
  const [entry, setEntry] = useState<{ id: string; weather: Weather; cachedAt: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const location: Place = placeById(locationId) ?? placeById(WEATHER_LOCATIONS[0].id)!;
  // Şeritte: önce son seçilen köy/yaylalar, sonra 12 ilçe ve Ayder.
  // Seçili köy (ör. Ayarlar'da varsayılan yapılmışsa) son seçilenlerde olmasa da şeridin başında görünür.
  const strip = useMemo(() => {
    const list: Place[] = [location, ...settings.recentPlaces.map(placeById), ...DISTRICT_PLACES].filter(
      (p): p is Place => !!p,
    );
    const villages = list.filter((p) => !DISTRICT_PLACES.includes(p));
    return [...villages, ...DISTRICT_PLACES].filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i);
  }, [location, settings.recentPlaces]);
  const choose = useCallback(
    (place: Place) => {
      setChoice({ base: settings.weatherLocationId, id: place.id });
      if (!DISTRICT_PLACES.includes(place)) {
        updateSettings({ recentPlaces: pushRecent(settings.recentPlaces, place.id) });
      }
    },
    [settings.weatherLocationId, settings.recentPlaces, updateSettings],
  );
  const weather = entry?.id === location.id ? entry.weather : null;
  const cachedAt = entry?.id === location.id ? entry.cachedAt : null;

  const load = useCallback(async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setLoading(true);
    setError(null);
    // Son kayıtlı veriyi hemen göster; ağdan gelince yerini alır.
    loadCachedWeather(location.id).then((cached) => {
      if (!cached || c.signal.aborted) return;
      setEntry((e) => (e?.id === location.id ? e : { id: location.id, weather: cached.weather, cachedAt: cached.savedAt }));
    });
    try {
      const fresh = await fetchWeather(location, c.signal);
      setEntry({ id: location.id, weather: fresh, cachedAt: null });
      saveCachedWeather(location.id, fresh);
    } catch {
      if (!c.signal.aborted) setError('Hava durumu alınamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      if (!c.signal.aborted) setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    // Ekran açılınca / ilçe değişince veriyi indir (React'in önerdiği veri çekme deseni).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => controller.current?.abort();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const current = weather?.current;
  const code = current?.code;
  const isDay = current?.isDay ?? true;
  const scene = useMemo(() => (code == null ? null : sceneFor(code, isDay)), [code, isDay]);
  const variant = useBackdrop('weather').id as WeatherStyle;
  const chrome = scene ? skyChrome(scene) : null;
  const chromeHeader = chrome?.header ?? null;
  const chromeFooter = chrome?.footer ?? null;

  useEffect(() => {
    onSkyColors?.(chromeHeader && chromeFooter ? { header: chromeHeader, footer: chromeFooter } : null);
  }, [chromeHeader, chromeFooter, onSkyColors]);

  const [soundOn, setSoundOn] = useRainSoundPreference();
  const rainy = scene?.rainy ?? false;
  useRainSound(soundOn && rainy && active);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: scene ? scene.sky[1] : colors.background },
        scroll: { flex: 1 },
        content: { paddingBottom: 28 },
        center: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
        errorText: { color: colors.error, fontSize: fs(15), textAlign: 'center' },
        pill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'center',
          backgroundColor: GLASS,
          borderWidth: 1,
          borderColor: GLASS_BORDER,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        pillOn: { backgroundColor: WHITE, borderColor: WHITE },
        pillText: { color: WHITE, fontSize: fs(13), fontWeight: '700' },
        pillTextOn: { color: '#1D2B3A' },
        hero: { alignItems: 'center', paddingTop: 18, paddingBottom: 22, paddingHorizontal: 16 },
        placeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        place: { color: WHITE, fontSize: fs(20), fontWeight: '700', ...SHADOW },
        placeSub: { color: 'rgba(255,255,255,0.85)', fontSize: fs(13), fontWeight: '600', marginTop: 2, ...SHADOW },
        findChip: {
          minHeight: 38,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 13,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.22)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.45)',
        },
        findChipPlain: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
        findChipText: { color: WHITE, fontSize: fs(14), fontWeight: '700' },
        temp: {
          color: WHITE,
          fontSize: fs(96),
          lineHeight: fs(108),
          fontWeight: '200',
          marginLeft: fs(18), // derece işareti sağda; sayı ortada dursun
          ...SHADOW,
        },
        label: { color: WHITE, fontSize: fs(20), fontWeight: '600', ...SHADOW },
        hilo: { color: 'rgba(255,255,255,0.88)', fontSize: fs(15), fontWeight: '600', marginTop: 4, ...SHADOW },
        actions: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' },
        glass: {
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 22,
          backgroundColor: GLASS,
          borderWidth: 1,
          borderColor: GLASS_BORDER,
          overflow: 'hidden',
        },
        cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
        cardTitle: { color: SOFT, fontSize: fs(12), fontWeight: '800', letterSpacing: 1 },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: GLASS_BORDER, marginHorizontal: 16 },
        grid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 6 },
        stat: { width: '33.333%', paddingVertical: 12, paddingHorizontal: 12, gap: 4 },
        statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        statLabel: { fontSize: fs(12), color: SOFT, fontWeight: '600', flexShrink: 1 },
        statValue: { fontSize: fs(18), fontWeight: '700', color: WHITE },
        hourlyScroll: { flexGrow: 0, flexShrink: 0 },
        hourly: { paddingHorizontal: 10, paddingBottom: 14, gap: 4 },
        hour: { width: 58 * (fs(100) / 100), alignItems: 'center', paddingVertical: 10, gap: 6, borderRadius: 16 },
        hourNow: { backgroundColor: 'rgba(255,255,255,0.2)' },
        hourTime: { fontSize: fs(13), fontWeight: '600', color: SOFT },
        hourTimeNow: { color: WHITE, fontWeight: '800' },
        hourIcon: { fontSize: fs(24) },
        hourTemp: { fontSize: fs(17), fontWeight: '700', color: WHITE },
        hourRain: { fontSize: fs(11), color: '#BFE3FF', fontWeight: '700' },
        dayRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 8 },
        dayName: { width: fs(84), fontSize: fs(15), fontWeight: '700', color: WHITE },
        dayIcon: { fontSize: fs(22), width: fs(30), textAlign: 'center' },
        dayRain: { width: fs(40), fontSize: fs(12), color: '#BFE3FF', fontWeight: '700' },
        dayMin: { width: fs(34), fontSize: fs(15), color: SOFT, textAlign: 'right', fontWeight: '600' },
        dayMax: { width: fs(34), fontSize: fs(15), color: WHITE, fontWeight: '800' },
        track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
        attribution: { fontSize: fs(12), color: SOFT, textAlign: 'center', marginTop: 18 },
      }),
    [colors, fs, scene],
  );

  const now = current ? describeWeatherCode(current.code, current.isDay) : null;
  const today = weather?.daily[0];
  const weekMin = weather ? Math.min(...weather.daily.map((d) => d.min)) : 0;
  const weekMax = weather ? Math.max(...weather.daily.map((d) => d.max)) : 1;
  const span = Math.max(1, weekMax - weekMin);

  const toggleSound = () => {
    pressFeedback();
    setSoundOn(!soundOn);
  };

  return (
    <View style={styles.root}>
      {scene ? <WeatherScene scene={scene} active={active} variant={variant} /> : null}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={scene ? WHITE : colors.primary}
            progressBackgroundColor={colors.card}
          />
        }
      >
        <ChipRow>
          <PressableScale
            onPress={() => {
              pressFeedback();
              setPickerOpen(true);
            }}
            style={[styles.findChip, !scene && styles.findChipPlain]}
            accessibilityRole="button"
            accessibilityLabel="Köy, yayla veya ilçe ara"
          >
            <Icon name="search" size={15} color={scene ? WHITE : colors.primary} />
            <Text style={[styles.findChipText, !scene && { color: colors.primary }]}>Köy ara</Text>
          </PressableScale>
          {strip.map((l) => (
            <Chip key={l.id} label={l.name} glass={!!scene} selected={l.id === locationId} onPress={() => choose(l)} />
          ))}
        </ChipRow>
        <LocationPicker
          visible={pickerOpen}
          selectedId={locationId}
          recentIds={settings.recentPlaces}
          title="Hava durumu konumu"
          onSelect={choose}
          onClose={() => setPickerOpen(false)}
        />

        {loading && !weather && !refreshing ? (
          <HeroSkeleton rows={3} />
        ) : error && !weather ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <PrimaryButton label="Tekrar dene" onPress={load} />
          </View>
        ) : current && now && weather ? (
          <>
            <View style={styles.hero} accessible accessibilityLabel={`${location.name}: ${Math.round(current.temperature)} derece, ${now.label}`}>
              <View style={styles.placeRow}>
                <Icon name="location-sharp" size={fs(16)} color={WHITE} />
                <Text style={styles.place}>{location.name}</Text>
              </View>
              {location.kind !== 'ilce' && location.id !== 'ayder' ? (
                <Text style={styles.placeSub}>
                  {districtName(location.district)}
                  {location.elevation != null ? ` · ${location.elevation.toLocaleString('tr-TR')} m` : ''}
                </Text>
              ) : null}
              <Text style={styles.temp}>{Math.round(current.temperature)}°</Text>
              <Text style={styles.label}>{now.label}</Text>
              {today ? (
                <Text style={styles.hilo}>
                  En yüksek {Math.round(today.max)}° · En düşük {Math.round(today.min)}°
                </Text>
              ) : null}
              <Text style={styles.hilo}>Hissedilen {Math.round(current.apparentTemperature)}°</Text>

              {rainy || (error && cachedAt) ? (
                <View style={styles.actions}>
                  {rainy ? (
                    <PressableScale
                      onPress={toggleSound}
                      style={[styles.pill, soundOn && styles.pillOn]}
                      accessibilityRole="switch"
                      accessibilityLabel="Yağmur sesi"
                      accessibilityState={{ checked: soundOn }}
                    >
                      <Icon name={soundOn ? 'volume-high' : 'volume-mute-outline'} size={16} color={soundOn ? '#1D2B3A' : WHITE} />
                      <Text style={[styles.pillText, soundOn && styles.pillTextOn]}>
                        {soundOn ? 'Yağmur sesi açık' : 'Yağmur sesini aç'}
                      </Text>
                    </PressableScale>
                  ) : null}
                  {error && cachedAt ? (
                    <View style={styles.pill}>
                      <Icon name="cloud-offline-outline" size={16} color={WHITE} />
                      <Text style={styles.pillText}>Çevrimdışı · {savedAtLabel(cachedAt)}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.glass}>
              <View style={styles.grid}>
                <Stat styles={styles} icon="water-outline" label="Nem" value={`%${Math.round(current.humidity)}`} />
                <Stat styles={styles} icon="flag-outline" label="Rüzgâr" value={`${Math.round(current.windSpeed)} km/s`} />
                <Stat styles={styles} icon="rainy-outline" label="Yağış" value={`${current.precipitation} mm`} />
                <Stat styles={styles} icon="sunny-outline" label="Gün doğumu" value={clockTime(weather.sunrise)} />
                <Stat styles={styles} icon="moon-outline" label="Gün batımı" value={clockTime(weather.sunset)} />
                <Stat
                  styles={styles}
                  icon="umbrella-outline"
                  label="Yağış ihtimali"
                  value={today?.precipitationProbability != null ? `%${today.precipitationProbability}` : '–'}
                />
              </View>
            </View>

            {weather.hourly.length > 0 ? (
              <View style={styles.glass}>
                <View style={styles.cardTitleRow}>
                  <Icon name="time-outline" size={14} color={SOFT} />
                  <Text style={styles.cardTitle}>SAATLİK TAHMİN</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.hourlyScroll}
                  contentContainerStyle={styles.hourly}
                >
                  {weather.hourly.map((hour, i) => {
                    const h = describeWeatherCode(hour.code, hour.isDay);
                    const isNow = i === 0;
                    return (
                      <View
                        key={hour.time}
                        style={[styles.hour, isNow && styles.hourNow]}
                        accessible
                        accessibilityLabel={`${isNow ? 'Şimdi' : clockTime(hour.time)}: ${Math.round(hour.temperature)} derece, ${h.label}`}
                      >
                        <Text style={[styles.hourTime, isNow && styles.hourTimeNow]}>{isNow ? 'Şimdi' : clockTime(hour.time)}</Text>
                        <Text style={styles.hourIcon}>{h.icon}</Text>
                        <Text style={styles.hourTemp}>{Math.round(hour.temperature)}°</Text>
                        <Text style={styles.hourRain}>{hour.precipitationProbability ? `%${hour.precipitationProbability}` : ' '}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.glass}>
              <View style={styles.cardTitleRow}>
                <Icon name="calendar-outline" size={14} color={SOFT} />
                <Text style={styles.cardTitle}>7 GÜNLÜK TAHMİN</Text>
              </View>
              {weather.daily.map((day, i) => {
                const d = describeWeatherCode(day.code);
                const left = ((day.min - weekMin) / span) * 100;
                const width = Math.max(6, ((day.max - day.min) / span) * 100);
                return (
                  <View key={day.date}>
                    <View style={styles.divider} />
                    <View
                      style={styles.dayRow}
                      accessible
                      accessibilityLabel={`${dayLabel(day.date, i)}: ${d.label}, en yüksek ${Math.round(day.max)}, en düşük ${Math.round(day.min)} derece`}
                    >
                      <Text style={styles.dayName}>{dayLabel(day.date, i)}</Text>
                      <Text style={styles.dayIcon}>{d.icon}</Text>
                      <Text style={styles.dayRain}>{day.precipitationProbability ? `%${day.precipitationProbability}` : ''}</Text>
                      <Text style={styles.dayMin}>{Math.round(day.min)}°</Text>
                      <View style={styles.track}>
                        <LinearGradient
                          colors={['#8FD3FF', '#FFD36B']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{ position: 'absolute', top: 0, bottom: 0, left: `${Math.min(left, 94)}%`, width: `${width}%`, borderRadius: 3 }}
                        />
                      </View>
                      <Text style={styles.dayMax}>{Math.round(day.max)}°</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.attribution}>Veri: Open-Meteo.com (CC BY 4.0)</Text>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({
  styles,
  icon,
  label,
  value,
}: {
  styles: { stat: object; statLabelRow: object; statLabel: object; statValue: object };
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.statLabelRow}>
        <Icon name={icon} size={13} color={SOFT} />
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
