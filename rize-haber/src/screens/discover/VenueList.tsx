/**
 * Lezzet → "Nerede yenir?": rehberlerde sık önerilen lokanta, kafe ve pideciler.
 * Puan ve fiyat gösterilmez; her kartta kaynak(lar) ve güncel yorumlar için harita bağlantısı vardır.
 */
import { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/motion';
import { Chip, ChipRow, SectionTitle, openUrl } from '../../components/ui';
import { VENUE_KINDS, VENUES, type VenueKind } from '../../data/venues';
import { distanceKm, formatKm } from '../../explore';
import { useTheme } from '../../theme';
import type { ExploreRef } from '../../useExploreLocation';

export default function VenueList({ origin }: { origin: ExploreRef }) {
  const { colors, fs } = useTheme();
  const [kind, setKind] = useState<'all' | VenueKind>('all');

  const list = useMemo(
    () =>
      VENUES.filter((v) => kind === 'all' || v.kind === kind)
        .map((v) => ({ v, km: distanceKm(origin, v) }))
        .sort((a, b) => a.km - b.km),
    [kind, origin],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pad: { paddingHorizontal: 16 },
        intro: { color: colors.textMuted, fontSize: fs(13), lineHeight: fs(19), marginTop: -4, marginBottom: 4 },
        list: { paddingHorizontal: 16, gap: 10 },
        card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
        top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        icon: { fontSize: fs(24) },
        name: { color: colors.text, fontSize: fs(16), fontWeight: '800' },
        meta: { color: colors.textMuted, fontSize: fs(12) },
        dishes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
        dish: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.primarySoft },
        dishText: { color: colors.text, fontSize: fs(12), fontWeight: '700' },
        bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 2 },
        sources: { flex: 1, color: colors.textMuted, fontSize: fs(11) },
        sourceLink: { color: colors.primary, fontWeight: '700' },
        mapBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: colors.primary,
        },
        mapText: { color: colors.onPrimary, fontSize: fs(13), fontWeight: '800' },
        note: { color: colors.textMuted, fontSize: fs(11), lineHeight: fs(16), paddingHorizontal: 16, marginTop: 10 },
      }),
    [colors, fs],
  );

  return (
    <>
      <View style={styles.pad}>
        <SectionTitle hint={origin.source === 'gps' ? 'Konumuna yakınlığa göre' : `${origin.label} konumuna yakınlığa göre`}>Nerede yenir?</SectionTitle>
        <Text style={styles.intro}>
          Rehberlerde ve yorum sitelerinde adı geçen, sık önerilen yerler. Güncel puanlar, yorumlar ve çalışma saatleri
          için “Haritada gör”e dokunun.
        </Text>
      </View>
      <ChipRow>
        <Chip label="Tümü" selected={kind === 'all'} onPress={() => setKind('all')} />
        {VENUE_KINDS.map((k) => (
          <Chip key={k.id} label={`${k.icon} ${k.label}`} selected={kind === k.id} onPress={() => setKind(k.id)} />
        ))}
      </ChipRow>
      <View style={styles.list}>
        {list.map(({ v, km }) => (
          <View key={v.id} style={styles.card}>
            <View style={styles.top}>
              <Text style={styles.icon}>{VENUE_KINDS.find((k) => k.id === v.kind)?.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{v.name}</Text>
                <Text style={styles.meta}>
                  {v.area ? `${v.area}, ` : ''}
                  {v.district} · ~{formatKm(km)}
                </Text>
              </View>
            </View>
            <View style={styles.dishes}>
              {v.knownFor.map((d) => (
                <View key={d} style={styles.dish}>
                  <Text style={styles.dishText}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={styles.bottom}>
              <Text style={styles.sources}>
                {v.sources.length > 1 ? `${v.sources.length} kaynakta öneriliyor: ` : 'Kaynak: '}
                {v.sources.map((s, i) => (
                  <Text key={s.url}>
                    {i > 0 ? ', ' : ''}
                    <Text style={styles.sourceLink} onPress={() => openUrl(s.url, colors)} accessibilityRole="link">
                      {s.label}
                    </Text>
                  </Text>
                ))}
              </Text>
              <PressableScale
                onPress={() =>
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapsQuery)}`).catch(() => {})
                }
                style={styles.mapBtn}
                accessibilityRole="button"
                accessibilityLabel={`${v.name}: haritada yorumlar ve yol tarifi`}
              >
                <Icon name="map-outline" size={15} color={colors.onPrimary} />
                <Text style={styles.mapText}>Haritada gör</Text>
              </PressableScale>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
          Uzaklıklar işletmenin değil, bulunduğu ilçe ya da yayla merkezinin yaklaşık konumuna göredir. Liste reklam
          değildir; işletmeler kapanmış ya da yer değiştirmiş olabilir.
      </Text>
    </>
  );
}
