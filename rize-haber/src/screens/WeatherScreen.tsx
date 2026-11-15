import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, WEATHER_LOCATIONS } from '../config';
import { clockTime, dayLabel } from '../time';
import { describeWeatherCode, fetchWeather, type Weather } from '../weather';

export default function WeatherScreen() {
  const [locationId, setLocationId] = useState(WEATHER_LOCATIONS[0].id);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const location = WEATHER_LOCATIONS.find((l) => l.id === locationId) ?? WEATHER_LOCATIONS[0];

  const load = useCallback(async () => {
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setLoading(true);
    setError(null);
    try {
      setWeather(await fetchWeather(location, c.signal));
    } catch {
      if (!c.signal.aborted) setError('Hava durumu alınamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      if (!c.signal.aborted) setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    setWeather(null);
    load();
    return () => controller.current?.abort();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const current = weather?.current;
  const now = current ? describeWeatherCode(current.code, current.isDay) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chips}
      >
        {WEATHER_LOCATIONS.map((l) => {
          const active = l.id === locationId;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLocationId(l.id)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{l.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading && !weather && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error && !weather ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load} style={styles.retryButton}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : current && now && weather ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.heroPlace}>{location.name}</Text>
            <Text style={styles.heroIcon}>{now.icon}</Text>
            <Text style={styles.heroTemp}>{Math.round(current.temperature)}°</Text>
            <Text style={styles.heroLabel}>{now.label}</Text>
            <Text style={styles.heroSub}>
              Hissedilen {Math.round(current.apparentTemperature)}° · En yüksek{' '}
              {Math.round(weather.daily[0]?.max)}° · En düşük {Math.round(weather.daily[0]?.min)}°
            </Text>
          </View>

          <View style={styles.grid}>
            <Stat label="Nem" value={`%${Math.round(current.humidity)}`} />
            <Stat label="Rüzgâr" value={`${Math.round(current.windSpeed)} km/s`} />
            <Stat label="Yağış" value={`${current.precipitation} mm`} />
            <Stat label="Gün doğumu" value={clockTime(weather.sunrise)} />
            <Stat label="Gün batımı" value={clockTime(weather.sunset)} />
            <Stat
              label="Yağış ihtimali"
              value={
                weather.daily[0]?.precipitationProbability != null
                  ? `%${weather.daily[0].precipitationProbability}`
                  : '–'
              }
            />
          </View>

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
  chip: {
    flexShrink: 0,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  chipTextActive: { color: '#FFFFFF' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
  errorText: { color: COLORS.error, fontSize: 15, textAlign: 'center' },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  hero: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  heroPlace: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  heroIcon: { fontSize: 56, marginTop: 8 },
  heroTemp: { color: '#FFFFFF', fontSize: 64, fontWeight: '300', lineHeight: 72 },
  heroLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  heroSub: { color: '#D7EBDD', fontSize: 14, marginTop: 6, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  stat: {
    width: '33.333%',
    padding: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  forecast: {
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  dayRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  dayName: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  dayIcon: { fontSize: 22, width: 36, textAlign: 'center' },
  dayRain: { width: 64, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  dayTemps: { width: 76, textAlign: 'right' },
  dayMax: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  dayMin: { fontSize: 15, color: COLORS.textMuted },
  attribution: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
});
