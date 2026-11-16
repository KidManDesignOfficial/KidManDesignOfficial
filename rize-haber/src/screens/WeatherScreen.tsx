import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../components/Icon';
import { HeroSkeleton } from '../components/Skeleton';
import { Chip, ChipRow, PrimaryButton } from '../components/ui';
import { WEATHER_LOCATIONS } from '../config';
import { loadCachedWeather, saveCachedWeather, savedAtLabel } from '../offline';
import { useTheme } from '../theme';
import { clockTime, dayLabel } from '../time';
import { describeWeatherCode, fetchWeather, type Weather } from '../weather';

export default function WeatherScreen() {
  const { colors, fs, settings } = useTheme();
  // Kullanıcının bu ekranda seçtiği ilçe; Ayarlar'daki varsayılan değişirse geçersiz olur.
  const [choice, setChoice] = useState<{ base: string; id: string } | null>(null);
  const locationId = choice && choice.base === settings.weatherLocationId ? choice.id : settings.weatherLocationId;
  // Veri ilçeye bağlı tutulur: ilçe değişince eski ilçenin verisi bir an bile görünmez.
  const [entry, setEntry] = useState<{ id: string; weather: Weather; cachedAt: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const location = WEATHER_LOCATIONS.find((l) => l.id === locationId) ?? WEATHER_LOCATIONS[0];
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 24 },
        center: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
        errorText: { color: colors.error, fontSize: fs(15), textAlign: 'center' },
        offline: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          marginHorizontal: 16,
          marginBottom: 8,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        offlineText: { color: colors.textMuted, fontSize: fs(12), fontWeight: '600' },
        hero: {
          marginHorizontal: 16,
          borderRadius: 20,
          backgroundColor: colors.header,
          paddingVertical: 24,
          paddingHorizontal: 16,
          alignItems: 'center',
        },
        heroPlace: { color: '#FFFFFF', fontSize: fs(18), fontWeight: '700' },
        heroIcon: { fontSize: fs(56), marginTop: 8 },
        heroTemp: { color: '#FFFFFF', fontSize: fs(64), fontWeight: '300', lineHeight: fs(72) },
        heroLabel: { color: '#FFFFFF', fontSize: fs(18), fontWeight: '600' },
        heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: fs(14), marginTop: 6, textAlign: 'center' },
        grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 12 },
        stat: { width: '33.333%', padding: 4 },
        statInner: {
          backgroundColor: colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
          gap: 2,
        },
        statLabel: { fontSize: fs(12), color: colors.textMuted },
        statValue: { fontSize: fs(17), fontWeight: '700', color: colors.text },
        sectionTitle: {
          fontSize: fs(17),
          fontWeight: '700',
          color: colors.text,
          marginHorizontal: 16,
          marginTop: 20,
          marginBottom: 8,
        },
        hourlyScroll: { flexGrow: 0, flexShrink: 0 },
        hourly: { paddingHorizontal: 16, gap: 8 },
        hour: {
          width: 64 * (fs(100) / 100),
          alignItems: 'center',
          paddingVertical: 10,
          gap: 4,
          borderRadius: 14,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        hourNow: { backgroundColor: colors.header, borderColor: colors.header },
        hourNowText: { color: '#FFFFFF' },
        hourTime: { fontSize: fs(13), fontWeight: '600', color: colors.textMuted },
        hourIcon: { fontSize: fs(22) },
        hourTemp: { fontSize: fs(16), fontWeight: '700', color: colors.text },
        hourRain: { fontSize: fs(11), color: colors.textMuted },
        forecast: {
          marginHorizontal: 16,
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
        },
        dayRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
        dayRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        dayName: { flex: 1, fontSize: fs(15), fontWeight: '600', color: colors.text },
        dayIcon: { fontSize: fs(22), width: fs(40), textAlign: 'center' },
        dayRain: { width: fs(72), fontSize: fs(13), color: colors.textMuted, textAlign: 'center' },
        dayTemps: { width: fs(88), textAlign: 'right' },
        dayMax: { fontSize: fs(15), fontWeight: '700', color: colors.text },
        dayMin: { fontSize: fs(15), color: colors.textMuted },
        attribution: { fontSize: fs(12), color: colors.textMuted, textAlign: 'center', marginTop: 16 },
      }),
    [colors, fs],
  );

  const current = weather?.current;
  const now = current ? describeWeatherCode(current.code, current.isDay) : null;
  const today = weather?.daily[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressBackgroundColor={colors.card}
        />
      }
    >
      <ChipRow>
        {WEATHER_LOCATIONS.map((l) => (
          <Chip key={l.id} label={l.name} selected={l.id === locationId} onPress={() => setChoice({ base: settings.weatherLocationId, id: l.id })} />
        ))}
      </ChipRow>

      {loading && !weather && !refreshing ? (
        <HeroSkeleton rows={3} />
      ) : error && !weather ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton label="Tekrar dene" onPress={load} />
        </View>
      ) : current && now && weather ? (
        <>
          {error && cachedAt ? (
            <View style={styles.offline}>
              <Icon name="cloud-offline-outline" size={16} color={colors.textMuted} />
              <Text style={styles.offlineText}>Çevrimdışı · son güncelleme {savedAtLabel(cachedAt)}</Text>
            </View>
          ) : null}
          <View style={styles.hero}>
            <Text style={styles.heroPlace}>{location.name}</Text>
            <Text style={styles.heroIcon}>{now.icon}</Text>
            <Text style={styles.heroTemp}>{Math.round(current.temperature)}°</Text>
            <Text style={styles.heroLabel}>{now.label}</Text>
            {today ? (
              <Text style={styles.heroSub}>
                Hissedilen {Math.round(current.apparentTemperature)}° · En yüksek {Math.round(today.max)}° · En
                düşük {Math.round(today.min)}°
              </Text>
            ) : null}
          </View>

          <View style={styles.grid}>
            <Stat styles={styles} label="Nem" value={`%${Math.round(current.humidity)}`} />
            <Stat styles={styles} label="Rüzgâr" value={`${Math.round(current.windSpeed)} km/s`} />
            <Stat styles={styles} label="Yağış" value={`${current.precipitation} mm`} />
            <Stat styles={styles} label="Gün doğumu" value={clockTime(weather.sunrise)} />
            <Stat styles={styles} label="Gün batımı" value={clockTime(weather.sunset)} />
            <Stat
              styles={styles}
              label="Yağış ihtimali"
              value={today?.precipitationProbability != null ? `%${today.precipitationProbability}` : '–'}
            />
          </View>

          {weather.hourly.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Saatlik tahmin</Text>
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
                    <View key={hour.time} style={[styles.hour, isNow && styles.hourNow]}>
                      <Text style={[styles.hourTime, isNow && styles.hourNowText]}>
                        {isNow ? 'Şimdi' : clockTime(hour.time)}
                      </Text>
                      <Text style={styles.hourIcon} accessibilityLabel={h.label}>
                        {h.icon}
                      </Text>
                      <Text style={[styles.hourTemp, isNow && styles.hourNowText]}>
                        {Math.round(hour.temperature)}°
                      </Text>
                      <Text style={[styles.hourRain, isNow && styles.hourNowText]}>
                        {hour.precipitationProbability ? `💧%${hour.precipitationProbability}` : ' '}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          ) : null}

          <Text style={styles.sectionTitle}>7 günlük tahmin</Text>
          <View style={styles.forecast}>
            {weather.daily.map((day, i) => {
              const d = describeWeatherCode(day.code);
              return (
                <View key={day.date} style={[styles.dayRow, i > 0 && styles.dayRowBorder]}>
                  <Text style={styles.dayName}>{dayLabel(day.date, i)}</Text>
                  <Text style={styles.dayIcon} accessibilityLabel={d.label}>
                    {d.icon}
                  </Text>
                  <Text style={styles.dayRain}>
                    {day.precipitationProbability != null ? `💧%${day.precipitationProbability}` : ''}
                  </Text>
                  <Text style={styles.dayTemps}>
                    <Text style={styles.dayMax}>{Math.round(day.max)}°</Text>
                    {'  '}
                    <Text style={styles.dayMin}>{Math.round(day.min)}°</Text>
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.attribution}>Veri: Open-Meteo.com (CC BY 4.0)</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

function Stat({
  styles,
  label,
  value,
}: {
  styles: { stat: object; statInner: object; statLabel: object; statValue: object };
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statInner}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}
