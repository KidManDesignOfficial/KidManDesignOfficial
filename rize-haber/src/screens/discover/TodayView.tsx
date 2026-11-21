/**
 * Keşfet → Bugün: "Bugün nereye gideyim?" önerileri, yakındaki gezi yerleri ve lezzet durakları,
 * en çok önerilenler. Öneriler havaya (Open-Meteo), mevsime, saate ve uzaklığa göre telefonda hesaplanır.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HeroCard } from '../../components/HeroCard';
import { Icon } from '../../components/Icon';
import { FadeInView, PressableScale } from '../../components/motion';
import { Card, Chip, ChipRow, SectionTitle } from '../../components/ui';
import { PLACE_CATEGORIES, PLACES, VISIT_LABELS, type Place, type PlaceCategory } from '../../data/discover';
import { VENUE_KINDS, VENUES, mapsNearbyUrl } from '../../data/venues';
import {
  formatDuration,
  formatKm,
  inSeason,
  nearest,
  planTarget,
  roughDriveMinutes,
  suggestToday,
  todayHeadline,
  type DayWeather,
  type Suggestion,
} from '../../explore';
import { pressFeedback } from '../../haptics';
import { useTheme, type Colors } from '../../theme';
import type { ExploreRef, LocateResult } from '../../useExploreLocation';
import { describeWeatherCode, fetchWeather } from '../../weather';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const CATEGORY_ICON = Object.fromEntries(PLACE_CATEGORIES.map((c) => [c.id, c.icon])) as Record<PlaceCategory, string>;

export function directionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

const open = (url: string) => Linking.openURL(url).catch(() => {});

type Props = {
  ref_: ExploreRef;
  locating: boolean;
  locate: () => Promise<LocateResult>;
  resetToSetting: () => void;
};

export default function TodayView({ ref_, locating, locate, resetToSetting }: Props) {
  const { colors, fs } = useTheme();
  const [now] = useState(() => new Date());
  const target = planTarget(now);
  const [weather, setWeather] = useState<DayWeather | null>(null);
  const [weatherState, setWeatherState] = useState<'loading' | 'ok' | 'off'>('loading');
  const [shuffle, setShuffle] = useState(0);
  const [nearFilter, setNearFilter] = useState<'all' | PlaceCategory>('all');

  // Önerilerin dayandığı noktanın günlük hava tahmini (konum değişince yeniden).
  useEffect(() => {
    const controller = new AbortController();
    const pt = ref_.publicPoint;
    fetchWeather({ id: 'explore', name: pt.name, latitude: pt.lat, longitude: pt.lon }, controller.signal)
      .then((w) => {
        const d = w.daily[target.dayIndex];
        if (d) {
          setWeather({ code: d.code, max: d.max, precipitationProbability: d.precipitationProbability });
          setWeatherState('ok');
        } else setWeatherState('off');
      })
      .catch(() => {
        if (!controller.signal.aborted) setWeatherState('off');
      });
    return () => controller.abort();
  }, [ref_.publicPoint, target.dayIndex]);

  const suggestions = useMemo(
    () => suggestToday({ places: PLACES, ref: ref_, weather, now: target.date, shuffle }),
    [ref_, weather, target.date, shuffle],
  );
  const near = useMemo(
    () => nearest(ref_, nearFilter === 'all' ? PLACES : PLACES.filter((p) => p.category === nearFilter), 6),
    [ref_, nearFilter],
  );
  const nearVenues = useMemo(() => nearest(ref_, VENUES, 4), [ref_]);
  const popular = useMemo(() => nearest(ref_, PLACES.filter((p) => p.popular)), [ref_]);
  const month = target.date.getMonth() + 1;

  const onLocate = useCallback(async () => {
    pressFeedback();
    const r = await locate();
    if (r === 'denied') {
      Alert.alert('Konum izni verilmedi', 'Öneriler Ayarlar’daki konumuna göre yapılmaya devam eder. İstersen telefon ayarlarından izin verebilirsin.', [
        { text: 'Tamam', style: 'cancel' },
        { text: 'Ayarları aç', onPress: () => Linking.openSettings() },
      ]);
    } else if (r === 'error') {
      Alert.alert('Konum alınamadı', 'Telefonun konum servisi kapalı olabilir. Öneriler Ayarlar’daki konumuna göre yapılıyor.');
    }
  }, [locate]);

  const styles = useMemo(() => makeStyles(colors, fs), [colors, fs]);

  const wx = weather ? describeWeatherCode(weather.code) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HeroCard watermark="compass-outline" eyebrow={`${target.label.toUpperCase()} · ${target.date.getDate()} ${MONTHS[month - 1].toUpperCase()}`} eyebrowIcon="sparkles-outline" mountains style={styles.hero}>
        <Text style={styles.heroTitle}>{target.label} nereye gidelim?</Text>
        <Text style={styles.heroText}>{todayHeadline(weather, target.date)}</Text>
        <View style={styles.weatherRow}>
          {wx ? (
            <Text style={styles.weatherText}>
              {wx.icon} {wx.label} · en yüksek {Math.round(weather!.max)}°
              {weather!.precipitationProbability != null ? ` · yağış %${weather!.precipitationProbability}` : ''}
            </Text>
          ) : (
            <Text style={styles.weatherText}>{weatherState === 'loading' ? 'Hava durumu alınıyor…' : 'Hava bilgisi yok; öneriler mevsim ve uzaklığa göre'}</Text>
          )}
        </View>
        <View style={styles.locRow}>
          <PressableScale
            onPress={resetToSetting}
            style={[styles.locPill, ref_.source === 'setting' && styles.locPillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: ref_.source === 'setting' }}
            accessibilityLabel="Ayarlardaki konuma göre"
          >
            <Icon name="home-outline" size={14} color={ref_.source === 'setting' ? colors.header : '#FFFFFF'} />
            <Text style={[styles.locText, ref_.source === 'setting' && styles.locTextOn]} numberOfLines={1}>
              {ref_.source === 'setting' ? ref_.label : 'Ayardaki konum'}
            </Text>
          </PressableScale>
          <PressableScale
            onPress={onLocate}
            style={[styles.locPill, ref_.source === 'gps' && styles.locPillOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: ref_.source === 'gps', busy: locating }}
            accessibilityLabel="Konumumu kullan"
          >
            <Icon name={locating ? 'hourglass-outline' : 'navigate-outline'} size={14} color={ref_.source === 'gps' ? colors.header : '#FFFFFF'} />
            <Text style={[styles.locText, ref_.source === 'gps' && styles.locTextOn]}>{locating ? 'Bulunuyor…' : 'Konumumu kullan'}</Text>
          </PressableScale>
        </View>
        <Text style={styles.locDetail}>Uzaklıklar: {ref_.source === 'gps' ? ref_.detail : `${ref_.label} (${ref_.detail})`}</Text>
      </HeroCard>

      <View style={styles.pad}>
        <SectionTitle hint="Hava, mevsim, saat ve uzaklığa göre">{target.label} için öneriler</SectionTitle>
        {suggestions.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Bu saatte gidilebilecek uygun bir yer bulunamadı. Yarın sabah yeniden bak.</Text>
          </Card>
        ) : (
          <FadeInView key={`${shuffle}-${ref_.lat}-${weatherState}`} style={styles.list}>
            {suggestions.map((s, i) => (
              <SuggestionCard key={s.place.id} s={s} index={i} styles={styles} />
            ))}
          </FadeInView>
        )}
        <PressableScale
          onPress={() => {
            pressFeedback();
            setShuffle((n) => n + 1);
          }}
          style={styles.again}
          accessibilityRole="button"
        >
          <Icon name="shuffle-outline" size={18} color={colors.primary} />
          <Text style={styles.againText}>Başka öner</Text>
        </PressableScale>

        <SectionTitle hint="Kuş uçuşu uzaklık">Yakınındaki gezi yerleri</SectionTitle>
      </View>
      <ChipRow>
        <Chip label="Tümü" selected={nearFilter === 'all'} onPress={() => setNearFilter('all')} />
        {PLACE_CATEGORIES.map((c) => (
          <Chip key={c.id} label={`${c.icon} ${c.label}`} selected={nearFilter === c.id} onPress={() => setNearFilter(c.id)} />
        ))}
      </ChipRow>
      <View style={styles.pad}>
        <Card style={{ paddingVertical: 4 }}>
          {near.map(({ item: p, km }, i) => {
            const off = !inSeason(p, month);
            return (
              <PressableScale
                key={p.id}
                onPress={() => open(directionsUrl(p.mapsQuery))}
                style={[styles.row, i > 0 && styles.rowBorder]}
                scaleTo={0.98}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}, ${formatKm(km)}. Yol tarifi`}
              >
                <Text style={styles.rowIcon}>{CATEGORY_ICON[p.category]}</Text>
                <View style={styles.rowBody}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {p.district} · {VISIT_LABELS[p.visit]}
                    {off && p.months ? ` · Mevsim dışı (${MONTHS[p.months[0] - 1]}–${MONTHS[p.months[1] - 1]})` : ''}
                  </Text>
                </View>
                <Text style={styles.km}>{formatKm(km)}</Text>
              </PressableScale>
            );
          })}
        </Card>

        <SectionTitle hint="Rehberlerde sık önerilenler">Yakındaki lezzet durakları</SectionTitle>
        <Card style={{ paddingVertical: 4 }}>
          {nearVenues.map(({ item: v, km }, i) => (
            <PressableScale
              key={v.id}
              onPress={() => open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapsQuery)}`)}
              style={[styles.row, i > 0 && styles.rowBorder]}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={`${v.name}, haritada aç`}
            >
              <Text style={styles.rowIcon}>{VENUE_KINDS.find((k) => k.id === v.kind)?.icon}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {v.name}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {v.area ? `${v.area}, ` : ''}
                  {v.district} · {v.knownFor.slice(0, 2).join(', ')}
                </Text>
              </View>
              <Text style={styles.km}>~{formatKm(km)}</Text>
            </PressableScale>
          ))}
        </Card>
        <View style={styles.quick}>
          {[
            ['restaurant-outline', 'Lokanta', 'lokanta'],
            ['cafe-outline', 'Kafe & çay bahçesi', 'çay bahçesi'],
            ['pizza-outline', 'Pideci', 'pide'],
            ['fish-outline', 'Balık', 'balık restoranı'],
          ].map(([icon, label, q]) => (
            <PressableScale
              key={q}
              onPress={() => open(mapsNearbyUrl(q, ref_.publicPoint.lat, ref_.publicPoint.lon))}
              style={styles.quickBtn}
              accessibilityRole="button"
              accessibilityLabel={`Yakınımdaki ${label}, haritada ara`}
            >
              <Icon name={icon as 'restaurant-outline'} size={15} color={colors.primary} />
              <Text style={styles.quickText}>{label}</Text>
            </PressableScale>
          ))}
        </View>

        <SectionTitle hint="Rize’ye gelenlerin uğradığı yerler">En çok önerilenler</SectionTitle>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popRow}>
        {popular.map(({ item: p, km }) => (
          <PressableScale
            key={p.id}
            onPress={() => open(directionsUrl(p.mapsQuery))}
            style={styles.pop}
            accessibilityRole="button"
            accessibilityLabel={`${p.name}, ${formatKm(km)}`}
          >
            <Text style={styles.popIcon}>{CATEGORY_ICON[p.category]}</Text>
            <Text style={styles.popName} numberOfLines={2}>
              {p.name}
            </Text>
            <Text style={styles.rowMeta}>
              {p.district} · {formatKm(km)}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>

      <Text style={styles.foot}>
        Uzaklıklar kuş uçuşudur; yol süreleri kabadır. Lezzet duraklarının konumu ilçe ya da yayla merkezine göredir.
        İşletme bilgileri değişebilir; gitmeden önce haritadan çalışma saatlerine ve güncel yorumlara bakın. Konumun
        yalnızca telefonda kullanılır, hiçbir yere gönderilmez.
      </Text>
    </ScrollView>
  );
}

function makeStyles(colors: Colors, fs: (n: number) => number) {
  return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingBottom: 32 },
        hero: { marginHorizontal: 16, marginTop: 12 },
        heroTitle: { color: '#FFFFFF', fontSize: fs(24), fontWeight: '900' },
        heroText: { color: 'rgba(255,255,255,0.92)', fontSize: fs(14), lineHeight: fs(20), marginTop: 4 },
        weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
        weatherText: { color: '#FFFFFF', fontSize: fs(14), fontWeight: '700' },
        locRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
        locPill: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.16)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.28)',
        },
        locPillOn: { backgroundColor: '#FFFFFF' },
        locText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '800' },
        locTextOn: { color: colors.header },
        locDetail: { color: 'rgba(255,255,255,0.8)', fontSize: fs(12), marginTop: 6 },
        pad: { paddingHorizontal: 16 },
        list: { gap: 10 },
        sugCard: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 },
        sugTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        rank: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primarySoft,
        },
        rankText: { color: colors.primary, fontWeight: '900', fontSize: fs(15) },
        sugName: { color: colors.text, fontSize: fs(17), fontWeight: '800' },
        sugMeta: { color: colors.textMuted, fontSize: fs(12) },
        tagline: { color: colors.text, fontSize: fs(14), lineHeight: fs(20) },
        reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
        reason: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.primarySoft },
        reasonText: { color: colors.text, fontSize: fs(12), fontWeight: '700' },
        actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
        btn: {
          flex: 1,
          flexDirection: 'row',
          gap: 6,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        },
        btnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
        btnText: { color: colors.text, fontSize: fs(13), fontWeight: '800' },
        btnTextPrimary: { color: colors.onPrimary },
        again: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16 },
        againText: { color: colors.primary, fontSize: fs(14), fontWeight: '800' },
        row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
        rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        rowIcon: { fontSize: fs(22), width: 30, textAlign: 'center' },
        rowBody: { flex: 1, gap: 2 },
        rowName: { color: colors.text, fontSize: fs(15), fontWeight: '700' },
        rowMeta: { color: colors.textMuted, fontSize: fs(12) },
        km: { color: colors.text, fontSize: fs(14), fontWeight: '800' },
        quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
        quickBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.primarySoft,
        },
        quickText: { color: colors.text, fontSize: fs(13), fontWeight: '700' },
        popRow: { gap: 10, paddingHorizontal: 16 },
        pop: { width: fs(150), backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 4 },
        popIcon: { fontSize: fs(24) },
        popName: { color: colors.text, fontSize: fs(14), fontWeight: '800' },
        foot: { color: colors.textMuted, fontSize: fs(11), lineHeight: fs(16), textAlign: 'center', marginTop: 18, paddingHorizontal: 24 },
        empty: { color: colors.textMuted, fontSize: fs(14), textAlign: 'center', lineHeight: fs(20) },
      });
}

type Styles = ReturnType<typeof makeStyles>;

function SuggestionCard({ s, index, styles }: { s: Suggestion; index: number; styles: Styles }) {
  const p: Place = s.place;
  return (
    <View style={styles.sugCard}>
      <View style={styles.sugTop}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sugName} numberOfLines={1}>
            {CATEGORY_ICON[p.category]} {p.name}
          </Text>
          <Text style={styles.sugMeta}>
            {p.district} · {formatKm(s.km)} · ~{formatDuration(roughDriveMinutes(s.km))} yol · {VISIT_LABELS[p.visit]}
          </Text>
        </View>
      </View>
      <Text style={styles.tagline}>{p.tagline}</Text>
      {s.reasons.length ? (
        <View style={styles.reasons}>
          {s.reasons.map((r) => (
            <View key={r} style={styles.reason}>
              <Text style={styles.reasonText}>{r}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        <PressableScale
          onPress={() => open(directionsUrl(p.mapsQuery))}
          style={[styles.btn, styles.btnPrimary]}
          containerStyle={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel={`${p.name} için yol tarifi`}
        >
          <Icon name="navigate" size={15} color="#FFFFFF" />
          <Text style={[styles.btnText, styles.btnTextPrimary]}>Yol tarifi</Text>
        </PressableScale>
        <PressableScale
          onPress={() => open(p.sourceUrl)}
          style={styles.btn}
          containerStyle={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel={`${p.name} hakkında bilgi`}
        >
          <Icon name="information-circle-outline" size={16} color={styles.btnText.color} />
          <Text style={styles.btnText}>Bilgi</Text>
        </PressableScale>
      </View>
    </View>
  );
}
