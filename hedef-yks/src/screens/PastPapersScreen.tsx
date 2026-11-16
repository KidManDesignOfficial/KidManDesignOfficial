/** ÖSYM çıkmış YKS soru kitapçıkları: yıllar canlı listelenir, PDF'ler ÖSYM sunucusundan açılır. */
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Icon } from '../components/Icon';
import { LiveBadge, LiveError, LiveSkeleton } from '../components/Live';
import { Collapsible, PressableScale } from '../components/motion';
import { Card, Screen, T } from '../components/ui';
import { OSYM_PAGES } from '../data/sources';
import { tapFeedback } from '../lib/haptics';
import { openOfficial, usePaperYears, usePapers } from '../lib/official';
import type { PaperYear } from '../lib/osym';
import { alpha, useTheme } from '../theme';

export default function PastPapersScreen() {
  const years = usePaperYears();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Screen title="Çıkmış YKS soruları" subtitle="ÖSYM temel soru kitapçıkları ve cevap anahtarları">
      <LiveBadge state={years} source="ÖSYM" />
      <LiveError state={years} onOpen={() => openOfficial(OSYM_PAGES.pastPapers)} />
      {!years.data && years.loading ? <LiveSkeleton rows={5} /> : null}
      {(years.data ?? []).map((y) => (
        <YearCard key={y.year} y={y} open={open === y.year} onToggle={() => setOpen(open === y.year ? null : y.year)} />
      ))}
      <T size={12} muted center>
        Kitapçıklar ÖSYM’nin sunucusundan (dokuman.osym.gov.tr) açılır. Her kitapçığın son sayfasında cevap anahtarı yer alır. Soruların telif hakkı ÖSYM’ye aittir.
      </T>
    </Screen>
  );
}

function YearCard({ y, open, onToggle }: { y: PaperYear; open: boolean; onToggle: () => void }) {
  const { c } = useTheme();
  const papers = usePapers(open ? y.url : null);
  const color = { TYT: '#5B4BF5', AYT: '#FF7A45', YDT: '#12B76A', Diğer: c.textMuted } as const;
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <PressableScale onPress={() => { tapFeedback(); onToggle(); }} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
        <View style={{ width: 56, height: 44, borderRadius: 14, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <T size={16} weight="900" color={c.primary}>
            {y.year}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T weight="800">{y.year}-YKS</T>
          <T size={12.5} muted>
            TYT · AYT · YDT kitapçıkları
          </T>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={20} color={c.textFaint} />
      </PressableScale>
      <Collapsible open={open}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
          {papers.loading && !papers.data ? <ActivityIndicator color={c.primary} /> : null}
          {papers.error && !papers.data ? (
            <PressableScale onPress={() => openOfficial(y.url)} accessibilityRole="link">
              <T color={c.primary} weight="700">
                Yüklenemedi ({papers.error}). ÖSYM sayfasını aç →
              </T>
            </PressableScale>
          ) : null}
          {(papers.data ?? []).map((p) => (
            <PressableScale key={p.url} onPress={() => { tapFeedback(); openOfficial(p.url, '#0B2A5E'); }} accessibilityRole="link" accessibilityLabel={p.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: alpha(color[p.kind], 0.1) }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: color[p.kind] }}>
                <T size={11.5} weight="900" color="#FFFFFF">
                  {p.kind}
                </T>
              </View>
              <T size={13.5} weight="600" style={{ flex: 1 }}>
                {p.title}
              </T>
              <Icon name="document-attach" size={18} color={color[p.kind]} />
            </PressableScale>
          ))}
        </View>
      </Collapsible>
    </Card>
  );
}
