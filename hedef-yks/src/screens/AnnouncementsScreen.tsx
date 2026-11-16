import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { LiveBadge, LiveError, LiveSkeleton, trDate } from '../components/Live';
import { Card, Screen, T } from '../components/ui';
import { OSYM_PAGES } from '../data/sources';
import { openOfficial, useYksAnnouncements } from '../lib/official';
import { useTheme } from '../theme';

export default function AnnouncementsScreen() {
  const { c, fs } = useTheme();
  const ann = useYksAnnouncements();
  const [q, setQ] = useState('');
  const list = (ann.data ?? []).filter((a) => a.title.toLocaleLowerCase('tr-TR').includes(q.trim().toLocaleLowerCase('tr-TR')));
  return (
    <Screen title="ÖSYM YKS duyuruları" subtitle="osym.gov.tr · canlı">
      <LiveBadge state={ann} source="ÖSYM" />
      <TextInput value={q} onChangeText={setQ} placeholder="Duyurularda ara (ör. tercih, sonuç)" placeholderTextColor={c.textFaint} style={{ fontSize: fs(15), color: c.text, backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }} accessibilityLabel="Duyurularda ara" />
      <LiveError state={ann} onOpen={() => openOfficial(OSYM_PAGES.yksAnnouncements)} />
      {!ann.data && ann.loading ? <LiveSkeleton rows={6} /> : null}
      {list.map((a) => (
        <Card key={a.url} onPress={() => openOfficial(a.url, '#0B2A5E')} style={{ gap: 4 }} accessibilityLabel={a.title}>
          <T size={12} weight="800" color={c.primary}>
            {trDate(a.date)}
          </T>
          <T size={15} weight="600">
            {a.title}
          </T>
        </Card>
      ))}
      {ann.data && list.length === 0 ? (
        <T muted center>
          “{q}” için duyuru bulunamadı.
        </T>
      ) : null}
      <View style={{ height: 4 }} />
    </Screen>
  );
}
