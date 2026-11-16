/**
 * Açık kaynak kapsamlı anlatım: konuyla eşlenmiş Türkçe Vikipedi maddeleri canlı indirilir,
 * bölüm bölüm okunur. Lisans (CC BY-SA 4.0) gereği kaynak, yazarlar ve lisans her maddede gösterilir.
 */
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { WIKI_ARTICLES } from '../data/wikiMap';
import { tapFeedback } from '../lib/haptics';
import { useLive } from '../lib/live';
import { openOfficial } from '../lib/official';
import { WIKI_LICENSE, parseWikiResponse, wikiApiUrl, wikiHistoryUrl, wikiPageUrl, wikiRawUrl } from '../lib/wiki';
import type { WikiArticle, WikiSection } from '../lib/wiki';
import { alpha, useTheme } from '../theme';
import { LiveBadge, LiveError, LiveSkeleton } from './Live';
import { Chevron, Collapsible, PressableScale, useAnimatedValue } from './motion';
import { Card, Chip, T } from './ui';

const WEEK = 7 * 24 * 60 * 60 * 1000;
const WIKI_INK = '#36383D';
/** Wikimedia kullanıcı aracısı politikası: istemci kendini tanıtmalı (tarayıcı bu başlığı kendisi belirler). */
const HEADERS: Record<string, string> | undefined = Platform.OS === 'web' ? undefined : { 'User-Agent': 'HedefYKS/1.0 (Android/iOS; YKS egitim uygulamasi)', Accept: 'text/x-wiki, application/json' };

export function wikiArticlesFor(topicId: string): string[] {
  return WIKI_ARTICLES[topicId] ?? [];
}

export function WikiLesson({ topicId, accent }: { topicId: string; accent: string }) {
  const titles = wikiArticlesFor(topicId);
  const [active, setActive] = useState(0);
  if (!titles.length) return null;
  const title = titles[Math.min(active, titles.length - 1)];
  return (
    <Card style={{ gap: 12 }}>
      <View style={styles.head}>
        <View style={[styles.logo, { backgroundColor: WIKI_INK }]}>
          <T size={17} weight="800" color="#FFFFFF">
            W
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T size={16} weight="800">
            Kapsamlı anlatım · açık kaynak
          </T>
          <T size={12} muted>
            Türkçe Vikipedi · {titles.length} madde · güncel sürüm canlı indirilir
          </T>
        </View>
      </View>
      {titles.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {titles.map((t, i) => (
            <Chip key={t} label={t} selected={i === active} color={accent} onPress={() => setActive(i)} />
          ))}
        </ScrollView>
      ) : null}
      <ArticleView key={title} title={title} accent={accent} />
    </Card>
  );
}

function ArticleView({ title, accent }: { title: string; accent: string }) {
  const { c } = useTheme();
  const url = Platform.OS === 'web' ? wikiApiUrl(title) : wikiRawUrl(title);
  const state = useLive<WikiArticle>(`wiki:${title}`, url, (body) => parseWikiResponse(body, title), WEEK, HEADERS);
  const a = state.data;
  return (
    <View style={{ gap: 12 }}>
      <LiveBadge state={state} source="Vikipedi" />
      {!a && state.loading ? <LiveSkeleton rows={4} /> : null}
      <LiveError state={state} title="Vikipedi'ye ulaşılamadı" onOpen={() => openOfficial(wikiPageUrl(title), WIKI_INK)} />
      {a ? (
        <>
          <T size={20} weight="800">
            {a.title}
          </T>
          <T size={12} muted>
            {a.sections.length} bölüm · yaklaşık {Math.max(1, Math.round(a.chars / 1000))} dk okuma
          </T>
          {a.sections.map((sec, i) => (
            <SectionView key={`${i}-${sec.title}`} section={sec} accent={accent} initiallyOpen={i === 0} />
          ))}
          <View style={[styles.credit, { backgroundColor: c.cardAlt }]}>
            <T size={12} muted style={{ lineHeight: 18 }}>
              Metin: Vikipedi katkıcıları, “{a.title}” maddesi. Lisans: {WIKI_LICENSE.name}. Uygulamada biçim sadeleştirildi (tablolar, görseller, dipnotlar ve kaynakça çıkarıldı;
              formüller düz metne çevrildi). Vikipedi gönüllülerce yazılır; sınav odaklı müfredat anlatımı bu kartın üstündedir.
            </T>
            <View style={styles.creditLinks}>
              <CreditLink label="Maddeyi aç" onPress={() => openOfficial(wikiPageUrl(a.title), WIKI_INK)} />
              <CreditLink label="Yazarlar (geçmiş)" onPress={() => openOfficial(wikiHistoryUrl(a.title), WIKI_INK)} />
              <CreditLink label={WIKI_LICENSE.name} onPress={() => openOfficial(WIKI_LICENSE.url, WIKI_INK)} />
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

function CreditLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <PressableScale
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <T size={12.5} weight="800" color={c.primary}>
        {label} ↗
      </T>
    </PressableScale>
  );
}

function SectionView({ section, accent, initiallyOpen }: { section: WikiSection; accent: string; initiallyOpen: boolean }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const [mounted, setMounted] = useState(initiallyOpen);
  const progress = useAnimatedValue(initiallyOpen ? 1 : 0);
  const sub = section.level > 2;
  return (
    <View style={[styles.section, { borderColor: c.border, marginLeft: sub ? 12 : 0 }]}>
      <PressableScale
        onPress={() => {
          tapFeedback();
          setMounted(true);
          setOpen((o) => !o);
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${section.title} bölümü`}
        style={styles.sectionHead}
      >
        <View style={[styles.bar, { backgroundColor: sub ? alpha(accent, 0.45) : accent }]} />
        <T size={sub ? 14 : 15} weight="800" style={{ flex: 1 }}>
          {section.title}
        </T>
        <Chevron progress={progress} color={c.textFaint} size={18} />
      </PressableScale>
      <Collapsible open={open} progress={progress}>
        {mounted ? (
          <View style={{ gap: 9, paddingBottom: 12, paddingHorizontal: 4 }}>
            {section.blocks.map((b, i) =>
              b.t === 'math' ? (
                <View key={i} style={[styles.math, { backgroundColor: alpha(accent, 0.08) }]}>
                  <T size={15} weight="600" style={styles.mono} color={c.text}>
                    {b.text}
                  </T>
                </View>
              ) : b.t === 'li' ? (
                <View key={i} style={styles.li}>
                  <View style={[styles.dot, { backgroundColor: accent }]} />
                  <T size={14.5} style={{ flex: 1, lineHeight: 22 }}>
                    {b.text}
                  </T>
                </View>
              ) : (
                <T key={i} size={14.5} style={{ lineHeight: 23 }}>
                  {b.text}
                </T>
              ),
            )}
          </View>
        ) : null}
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: { borderTopWidth: StyleSheet.hairlineWidth },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  bar: { width: 4, height: 18, borderRadius: 2 },
  math: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
  li: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },
  credit: { padding: 12, borderRadius: 14, gap: 8 },
  creditLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
});
