/**
 * Resmî Kaynaklar: ÖSYM'den canlı sınav takvimi, YKS duyuruları, çıkmış soru kitapçıkları ve
 * MEB OGM Materyal YKS hazırlık kaynakları.
 */
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear } from '../components/Blocks';
import { Icon, type IconName } from '../components/Icon';
import { LiveBadge, LiveError, LiveSkeleton, trDate } from '../components/Live';
import { PressableScale } from '../components/motion';
import { Card, IconBadge, SectionTitle, T } from '../components/ui';
import { MEB_YKS, OSYM_PAGES } from '../data/sources';
import { tapFeedback } from '../lib/haptics';
import { openOfficial, useCalendar, useYksAnnouncements } from '../lib/official';
import { isoFromDotted } from '../lib/osym';
import { useNav } from '../nav';
import { alpha, useTheme } from '../theme';

const MEB_GRADIENT: [string, string] = ['#E30A17', '#9E0711'];
const OSYM_GRADIENT: [string, string] = ['#1E4FA0', '#0B2A5E'];

export default function OfficialScreen() {
  const { c } = useTheme();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const cal = useCalendar();
  const ann = useYksAnnouncements();
  const sessions = (cal.data ?? []).filter((r) => r.session);
  const year = sessions[0]?.year;
  const upcoming = sessions.some((r) => (isoFromDotted(r.examDate) ?? '') >= new Date().toISOString().slice(0, 10));

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => { cal.refresh(); ann.refresh(); }} tintColor={c.primary} />}
    >
      <T size={28} weight="900">
        Resmî Kaynaklar
      </T>
      <T muted>ÖSYM ve Millî Eğitim Bakanlığı’ndan canlı bilgiler</T>

      <Appear>
        <LinearGradient colors={OSYM_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroHead}>
            <View style={styles.heroIcon}>
              <Icon name="calendar" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <T size={12} weight="800" color="rgba(255,255,255,0.75)">
                ÖSYM SINAV TAKVİMİ
              </T>
              <T size={18} weight="900" color="#FFFFFF">
                {year ? `${year}-YKS oturumları` : 'YKS oturumları'}
              </T>
            </View>
          </View>
          {cal.data ? (
            <View style={{ gap: 8 }}>
              {sessions.map((r) => (
                <View key={r.name} style={styles.sessionRow}>
                  <View style={styles.sessionTag}>
                    <T size={12.5} weight="900" color={OSYM_GRADIENT[1]}>
                      {r.session}
                    </T>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T size={14.5} weight="800" color="#FFFFFF">
                      {trDate(isoFromDotted(r.examDate))}
                    </T>
                    <T size={11.5} color="rgba(255,255,255,0.75)">
                      Başvuru {r.application ?? '—'} · Sonuç {r.result?.split(' ')[0] ?? '—'}
                    </T>
                  </View>
                </View>
              ))}
              {!upcoming ? (
                <View style={styles.note}>
                  <Icon name="information-circle" size={16} color="#FFFFFF" />
                  <T size={12} color="#FFFFFF" style={{ flex: 1 }}>
                    ÖSYM’nin takviminde şu an yalnızca {year} yılı var; {year ? year + 1 : 'yeni yıl'} takvimi yayımlandığında burada ve geri sayımda kendiliğinden görünecek.
                  </T>
                </View>
              ) : null}
            </View>
          ) : cal.error ? null : (
            <T color="rgba(255,255,255,0.8)">ÖSYM takvimi yükleniyor…</T>
          )}
          <View style={styles.heroFoot}>
            <View style={{ flex: 1 }}>
              <LiveBadge state={cal} source="ÖSYM" />
            </View>
          </View>
        </LinearGradient>
      </Appear>
      <LiveError state={cal} onOpen={() => openOfficial(OSYM_PAGES.calendar)} />

      <SectionTitle title="ÖSYM YKS duyuruları" action="Tümü" onAction={() => nav.push({ name: 'announcements' })} />
      <Card style={{ gap: 12 }}>
        <LiveBadge state={ann} source="ÖSYM" />
        {ann.data ? (
          ann.data.slice(0, 5).map((a) => (
            <PressableScale key={a.url} onPress={() => { tapFeedback(); openOfficial(a.url, OSYM_GRADIENT[1]); }} accessibilityRole="link" style={[styles.annRow, { borderTopColor: c.border }]}>
              <T size={11.5} weight="800" color={c.primary}>
                {trDate(a.date)}
              </T>
              <T size={14.5} weight="600">
                {a.title}
              </T>
            </PressableScale>
          ))
        ) : ann.loading ? (
          <LiveSkeleton />
        ) : null}
        <LiveError state={ann} onOpen={() => openOfficial(OSYM_PAGES.yksAnnouncements)} />
      </Card>

      <Card onPress={() => nav.push({ name: 'papers' })} style={{ padding: 0, overflow: 'hidden' }}>
        <LinearGradient colors={[alpha(OSYM_GRADIENT[0], 0.14), alpha(OSYM_GRADIENT[0], 0.02)]} style={styles.papers}>
          <IconBadge name="documents" color={OSYM_GRADIENT[0]} size={46} />
          <View style={{ flex: 1 }}>
            <T size={16} weight="800">
              Çıkmış YKS soruları
            </T>
            <T size={13} muted>
              2018–2026 TYT, AYT ve YDT soru kitapçıkları ve cevap anahtarları (ÖSYM)
            </T>
          </View>
          <Icon name="chevron-forward" size={20} color={c.textFaint} />
        </LinearGradient>
      </Card>

      <SectionTitle title="MEB YKS hazırlık kaynakları" />
      <View style={styles.grid}>
        {MEB_YKS.map((r, i) => (
          <View key={r.id} style={styles.cell}>
            <Appear delay={i * 40}>
              <PressableScale onPress={() => { tapFeedback(); openOfficial(r.url, MEB_GRADIENT[1]); }} accessibilityRole="link" accessibilityLabel={r.title} style={[styles.meb, { backgroundColor: c.card, borderColor: c.border }]}>
                <IconBadge name={r.icon as IconName} color={MEB_GRADIENT[0]} size={38} />
                <T size={14} weight="800" lines={2}>
                  {r.title}
                </T>
                <T size={12} muted lines={2}>
                  {r.text}
                </T>
              </PressableScale>
            </Appear>
          </View>
        ))}
      </View>

      <SectionTitle title="Aday işlemleri" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Quick icon="person-circle" label="ÖSYM AİS" text="Başvuru, giriş belgesi" onPress={() => openOfficial(OSYM_PAGES.aday, OSYM_GRADIENT[1])} />
        <Quick icon="ribbon" label="Sonuç Sistemi" text="Sınav ve yerleştirme" onPress={() => openOfficial(OSYM_PAGES.sonuc, OSYM_GRADIENT[1])} />
      </View>

      <T size={12} muted center style={{ marginTop: 8 }}>
        Bilgiler ÖSYM (osym.gov.tr) ve MEB OGM Materyal (ogmmateryal.eba.gov.tr) resmî sayfalarından anlık alınır; uygulama bu kurumlarla bağlantılı değildir. MEB içeriklerinin yayın hakları MEB’e aittir.
      </T>
    </ScrollView>
  );
}

function Quick({ icon, label, text, onPress }: { icon: IconName; label: string; text: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Card onPress={onPress} style={{ flex: 1, gap: 6 }} accessibilityLabel={label}>
      <Icon name={icon} size={24} color={OSYM_GRADIENT[0]} />
      <T weight="800">{label}</T>
      <T size={12} color={c.textMuted}>
        {text}
      </T>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: { borderRadius: 24, padding: 18, gap: 14 },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 10 },
  sessionTag: { width: 46, paddingVertical: 6, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center' },
  note: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)' },
  heroFoot: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, padding: 6 },
  annRow: { gap: 3, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  papers: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
  meb: { borderRadius: 18, padding: 14, gap: 6, borderWidth: StyleSheet.hairlineWidth, minHeight: 148 },
});
