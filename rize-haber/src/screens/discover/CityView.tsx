/**
 * Keşfet → Kuşbakışı: Rize'ye yukarıdan bakan 3B canlı harita (binalar + akan trafik).
 * Harita ve trafik canlandırması `src/city/cityPage.ts` içinde; bu ekran yalnızca kontrolleri ve
 * durumları (yükleniyor, internet yok) gösterir. Ekran görünmezken canlandırma durur (pil).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CityWebView, type CityWebViewHandle } from '../../city/CityWebView';
import { cityHtml, type CityCommand, type CityMessage } from '../../city/cityPage';
import { Icon, type IconName } from '../../components/Icon';
import { PressableScale, useReducedMotion } from '../../components/motion';
import { WEATHER_LOCATIONS } from '../../config';
import { PLACES } from '../../data/discover';
import { tapFeedback } from '../../haptics';
import { useTheme } from '../../theme';

type Spot = { id: string; label: string; lon: number; lat: number; zoom?: number };

const place = (id: string) => PLACES.find((p) => p.id === id)!;
const district = (id: string) => WEATHER_LOCATIONS.find((l) => l.id === id)!;

/** Önce bina verisi en zengin Rize merkezi; sonra sahil ilçeleri, en son dağ ilçeleri ve Ayder. */
export const CITY_SPOTS: Spot[] = [
  { id: 'meydan', label: 'Rize Meydan', lon: 40.5195, lat: 41.0245 },
  { id: 'sahil', label: 'Sahil yolu', lon: 40.5245, lat: 41.0262, zoom: 17.4 },
  { id: 'ziraat', label: 'Ziraat Tepesi', lon: place('ziraatcay').lon, lat: place('ziraatcay').lat, zoom: 16.6 },
  { id: 'kale', label: 'Rize Kalesi', lon: place('rizekalesi').lon, lat: place('rizekalesi').lat, zoom: 16.8 },
  ...['cayeli', 'pazar', 'ardesen', 'findikli', 'iyidere', 'derepazari', 'guneysu', 'kalkandere', 'ikizdere', 'camlihemsin', 'hemsin'].map(
    (id) => ({ id, label: district(id).name, lon: district(id).longitude, lat: district(id).latitude, zoom: 16.4 }),
  ),
  { id: 'ayder', label: 'Ayder', lon: place('ayder').lon, lat: place('ayder').lat, zoom: 16.2 },
];

const DENSITY: { label: string; icon: IconName }[] = [
  { label: 'Sakin', icon: 'car-outline' },
  { label: 'Normal', icon: 'car-sport-outline' },
  { label: 'Yoğun', icon: 'car-sport' },
];

/** Rize'de kabaca karanlık saatler (yazın ~20.30–05.30, kışın ~17.00–07.30). */
export function isDarkHour(now: Date): boolean {
  const m = now.getMonth() + 1;
  const h = now.getHours() + now.getMinutes() / 60;
  const summer = m >= 4 && m <= 9;
  return summer ? h >= 20.75 || h < 5.5 : h >= 17.25 || h < 7.25;
}

function pageFor(night: boolean, orbit: boolean, density: 0 | 1 | 2): string {
  const s = CITY_SPOTS[0];
  return cityHtml({ lon: s.lon, lat: s.lat, night, orbit, density });
}

type Status = 'loading' | 'ready' | 'offline' | 'webgl';

export default function CityView({ active }: { active: boolean }) {
  const { colors, fs } = useTheme();
  const reduced = useReducedMotion();
  const web = useRef<CityWebViewHandle>(null);
  const [spot, setSpot] = useState('meydan');
  const [night, setNight] = useState(() => isDarkHour(new Date()));
  const [orbit, setOrbit] = useState(!reduced);
  const [density, setDensity] = useState<0 | 1 | 2>(1);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  // Sayfa bir kez kurulur; sonraki değişiklikler komutla gider (harita yeniden yüklenmez).
  const [html, setHtml] = useState(() => pageFor(night, orbit, density));
  const send = useCallback((cmd: CityCommand) => web.current?.send(cmd), []);

  useEffect(() => {
    if (status === 'ready') send({ type: active ? 'resume' : 'pause' });
  }, [active, status, send]);

  const onMessage = useCallback(
    (m: CityMessage) => {
      if (m.type === 'ready') {
        setStatus('ready');
        if (!active) send({ type: 'pause' });
      } else if (m.type === 'error') setStatus((s) => (s === 'ready' ? s : m.reason === 'webgl' ? 'webgl' : 'offline'));
    },
    [active, send],
  );

  const go = (s: Spot) => {
    tapFeedback();
    setSpot(s.id);
    send({ type: 'fly', lon: s.lon, lat: s.lat, zoom: s.zoom });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { flex: 1, marginTop: 10, overflow: 'hidden', backgroundColor: night ? '#05080f' : '#cfe3f3' },
        topBar: { position: 'absolute', top: 8, left: 0, right: 0 },
        spots: { paddingHorizontal: 12, gap: 6 },
        spot: {
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: 'rgba(10,16,26,0.62)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.16)',
        },
        spotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
        spotText: { color: '#FFFFFF', fontSize: fs(13), fontWeight: '700' },
        spotTextOn: { color: colors.onPrimary },
        tools: { position: 'absolute', right: 10, bottom: 34, gap: 8 },
        tool: {
          minWidth: 48,
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 7,
          borderRadius: 14,
          backgroundColor: 'rgba(10,16,26,0.66)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.16)',
          gap: 2,
        },
        toolText: { color: '#FFFFFF', fontSize: fs(10), fontWeight: '700' },
        badge: {
          position: 'absolute',
          left: 10,
          bottom: 34,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: 'rgba(10,16,26,0.62)',
          maxWidth: '62%',
        },
        dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#3ddc84' },
        badgeText: { color: '#FFFFFF', fontSize: fs(11), fontWeight: '600', flexShrink: 1 },
        cover: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
        coverBg: { backgroundColor: colors.background },
        coverTitle: { color: colors.text, fontSize: fs(17), fontWeight: '800', textAlign: 'center' },
        coverText: { color: colors.textMuted, fontSize: fs(13), lineHeight: fs(19), textAlign: 'center' },
        retry: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary },
        retryText: { color: colors.onPrimary, fontSize: fs(14), fontWeight: '800' },
      }),
    [colors, fs, night],
  );

  const failed = status === 'offline' || status === 'webgl';

  return (
    <View style={styles.wrap}>
      {!failed ? <CityWebView key={attempt} ref={web} html={html} onMessage={onMessage} /> : null}

      {status === 'ready' ? (
        <>
          <View style={styles.topBar} pointerEvents="box-none">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spots}>
              {CITY_SPOTS.map((s) => (
                <PressableScale
                  key={s.id}
                  onPress={() => go(s)}
                  style={[styles.spot, spot === s.id && styles.spotOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: spot === s.id }}
                  accessibilityLabel={`${s.label} üzerine uç`}
                >
                  <Text style={[styles.spotText, spot === s.id && styles.spotTextOn]}>{s.label}</Text>
                </PressableScale>
              ))}
            </ScrollView>
          </View>

          <View style={styles.badge} pointerEvents="none">
            <View style={styles.dot} />
            <Text style={styles.badgeText} numberOfLines={2}>
              Binalar gerçek harita verisi · trafik canlandırma
            </Text>
          </View>

          <View style={styles.tools}>
            <ToolButton
              styles={styles}
              icon={night ? 'moon' : 'sunny'}
              label={night ? 'Gece' : 'Gündüz'}
              hint="Gece ve gündüz görünümü arasında geçiş"
              onPress={() => {
                setNight(!night);
                send({ type: 'night', on: !night });
              }}
            />
            <ToolButton
              styles={styles}
              icon={orbit ? 'sync' : 'pause-outline'}
              label={orbit ? 'Dönüyor' : 'Sabit'}
              hint="Kameranın şehrin etrafında yavaşça dönmesini aç veya kapat"
              onPress={() => {
                setOrbit(!orbit);
                send({ type: 'orbit', on: !orbit });
              }}
            />
            <ToolButton
              styles={styles}
              icon={DENSITY[density].icon}
              label={DENSITY[density].label}
              hint="Trafik yoğunluğunu değiştir"
              onPress={() => {
                const next = ((density + 1) % 3) as 0 | 1 | 2;
                setDensity(next);
                send({ type: 'density', level: next });
              }}
            />
          </View>
        </>
      ) : null}

      {status === 'loading' ? (
        <View style={styles.cover} pointerEvents="none">
          <ActivityIndicator color={night ? '#FFFFFF' : colors.primary} />
          <Text style={[styles.coverText, night && { color: '#D6DEEA' }]}>Rize yukarıdan yükleniyor…</Text>
        </View>
      ) : null}

      {failed ? (
        <View style={[styles.cover, styles.coverBg]}>
          <Icon name={status === 'webgl' ? 'warning-outline' : 'cloud-offline-outline'} size={40} color={colors.textMuted} />
          <Text style={styles.coverTitle}>{status === 'webgl' ? '3B harita bu cihazda açılamadı' : 'Harita için internet gerekiyor'}</Text>
          <Text style={styles.coverText}>
            {status === 'webgl'
              ? 'Telefonun grafik desteği (WebGL) bu haritayı çizmeye yetmedi.'
              : 'Kuşbakışı görünüm binaları ve yolları her açılışta internetten (OpenStreetMap verisi) yükler.'}
          </Text>
          <PressableScale
            onPress={() => {
              setStatus('loading');
              setHtml(pageFor(night, orbit, density));
              setSpot('meydan');
              setAttempt((a) => a + 1);
            }}
            style={styles.retry}
            accessibilityRole="button"
          >
            <Icon name="refresh" size={16} color={colors.onPrimary} />
            <Text style={styles.retryText}>Tekrar dene</Text>
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}

function ToolButton({
  styles,
  icon,
  label,
  hint,
  onPress,
}: {
  styles: { tool: object; toolText: object };
  icon: IconName;
  label: string;
  hint: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={styles.tool}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${hint}`}
    >
      <Icon name={icon} size={18} color="#FFFFFF" />
      <Text style={styles.toolText}>{label}</Text>
    </PressableScale>
  );
}
