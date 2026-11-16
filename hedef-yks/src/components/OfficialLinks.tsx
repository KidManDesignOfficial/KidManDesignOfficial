/** Bir dersin MEB resmî konu özetleri ve YKS video anlatım bağlantıları. */
import { StyleSheet, View } from 'react-native';

import { MEB_YKS, mebLinksForSubject } from '../data/sources';
import { tapFeedback } from '../lib/haptics';
import { openOfficial } from '../lib/official';
import { alpha, useTheme } from '../theme';
import { Icon } from './Icon';
import { PressableScale } from './motion';
import { Card, T } from './ui';

const MEB_RED = '#C8102E';

export function OfficialLinks({ subjectId, compact }: { subjectId: string; compact?: boolean }) {
  const { c } = useTheme();
  const links = [
    ...mebLinksForSubject(subjectId),
    { label: 'YKS video konu anlatımları (MEB)', url: MEB_YKS.find((r) => r.id === 'video')!.url },
    ...(mebLinksForSubject(subjectId).length ? [] : [{ label: 'MEBİ konu özeti kitapları', url: MEB_YKS.find((r) => r.id === 'ozet')!.url }]),
  ];
  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.head}>
        <View style={[styles.flag, { backgroundColor: MEB_RED }]}>
          <Icon name="shield-checkmark" size={16} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <T size={15} weight="800">
            {compact ? 'Resmî kaynakta pekiştir' : 'Millî Eğitim Bakanlığı resmî kaynakları'}
          </T>
          <T size={12} muted>
            ogmmateryal.eba.gov.tr · güncel sürüm canlı açılır
          </T>
        </View>
      </View>
      {links.map((l) => (
        <PressableScale
          key={l.url}
          onPress={() => {
            tapFeedback();
            openOfficial(l.url, '#9E0711');
          }}
          accessibilityRole="link"
          accessibilityLabel={l.label}
          style={[styles.link, { backgroundColor: alpha(MEB_RED, 0.07) }]}
        >
          <Icon name={l.label.includes('video') ? 'play-circle' : 'document-text'} size={18} color={MEB_RED} />
          <T size={13.5} weight="700" style={{ flex: 1 }}>
            {l.label}
          </T>
          <Icon name="open-outline" size={16} color={c.textFaint} />
        </PressableScale>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flag: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14 },
});
