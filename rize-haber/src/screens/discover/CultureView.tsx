import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, LinkRow, SectionTitle, openUrl } from '../../components/ui';
import { CULTURE, DISCOVER_SOURCES, FESTIVALS, PRACTICAL } from '../../data/discover';
import { useTheme } from '../../theme';
import { useScrollTopOnShow } from '../../components/motion';

export default function CultureView() {
  const scrollRef = useScrollTopOnShow();
  const { colors, fs } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { paddingHorizontal: 16, paddingBottom: 32 },
        grid: { gap: 10 },
        item: { flexDirection: 'row', gap: 12 },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        icon: { fontSize: 22 },
        itemBody: { flex: 1, gap: 4 },
        title: { fontSize: fs(16), fontWeight: '800', color: colors.text },
        badge: { fontSize: fs(11), fontWeight: '700', color: colors.primary },
        text: { fontSize: fs(14), color: colors.text, lineHeight: fs(21) },
        source: { fontSize: fs(12), color: colors.primary, fontWeight: '600' },
        festRow: { paddingVertical: 10, gap: 2 },
        festBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        festName: { fontSize: fs(15), fontWeight: '700', color: colors.text },
        festMeta: { fontSize: fs(13), color: colors.textMuted },
        hint: { fontSize: fs(12), color: colors.textMuted, marginTop: 8, lineHeight: fs(17) },
      }),
    [colors, fs],
  );

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <SectionTitle hint="El sanatları, müzik ve oyunlar">Gelenekler</SectionTitle>
      <View style={styles.grid}>
        {CULTURE.map((c) => (
          <Card key={c.id}>
            <View style={styles.item}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{c.icon}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.title}>{c.title}</Text>
                {c.badge ? <Text style={styles.badge}>🏅 {c.badge}</Text> : null}
                <Text style={styles.text}>{c.text}</Text>
                <Pressable onPress={() => openUrl(c.sourceUrl, colors)} accessibilityRole="link" hitSlop={6}>
                  <Text style={styles.source}>Kaynak ↗</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle hint="Yaylalar yazın şenlikle canlanır">Şenlikler ve festivaller</SectionTitle>
      <Card>
        {FESTIVALS.map((f, i) => (
          <View key={f.name} style={[styles.festRow, i > 0 && styles.festBorder]}>
            <Text style={styles.festName}>🎉 {f.name}</Text>
            <Text style={styles.festMeta}>
              🗓️ {f.when} · 📍 {f.where}
            </Text>
          </View>
        ))}
        <Text style={styles.hint}>Kesin tarihler her yıl ilgili belediye ve kurumlarca duyurulur.</Text>
      </Card>

      <SectionTitle>Pratik bilgiler</SectionTitle>
      <View style={styles.grid}>
        {PRACTICAL.map((p) => (
          <Card key={p.title}>
            <View style={styles.item}>
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>{p.icon}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.title}>{p.title}</Text>
                <Text style={styles.text}>{p.text}</Text>
                {p.sourceUrl ? (
                  <Pressable onPress={() => openUrl(p.sourceUrl!, colors)} accessibilityRole="link" hitSlop={6}>
                    <Text style={styles.source}>Kaynak ↗</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle>Kaynaklar</SectionTitle>
      <Card>
        {DISCOVER_SOURCES.map((s) => (
          <LinkRow key={s.url} label={s.label} url={s.url} />
        ))}
      </Card>
    </ScrollView>
  );
}
