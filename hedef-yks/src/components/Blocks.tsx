/**
 * Konu anlatımı bloklarını çizer. Bloklar sırayla, kademeli olarak belirir; örnek çözümler
 * adım adım açılır, akış ve zaman çizelgeleri animasyonla dolar.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { Block } from '../data/types';
import { pressFeedback } from '../lib/haptics';
import { alpha, useTheme } from '../theme';
import { Icon } from './Icon';
import { EASE_OUT, PressableScale, useAnimatedValue, useReducedMotion } from './motion';
import { Plot } from './Plot';
import { T } from './ui';

/** Gecikmeli beliriş (kademeli giriş için). */
export function Appear({ delay = 0, children, from = 14 }: { delay?: number; children: ReactNode; from?: number }) {
  const reduced = useReducedMotion();
  const p = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration: reduced ? 0 : 420, delay: reduced ? 0 : delay, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [p, delay, reduced]);
  return (
    <Animated.View style={{ opacity: p, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

export function BlockView({ block, accent, index }: { block: Block; accent: string; index: number }) {
  return <Appear delay={Math.min(index, 8) * 70}>{renderBlock(block, accent)}</Appear>;
}

function renderBlock(block: Block, accent: string): ReactNode {
  switch (block.type) {
    case 'heading':
      return <Heading text={block.text} accent={accent} />;
    case 'text':
      return (
        <T size={15.5} style={{ lineHeight: 25 }}>
          {block.text}
        </T>
      );
    case 'bullets':
      return <Bullets items={block.items} accent={accent} />;
    case 'formula':
      return <Formula title={block.title} lines={block.lines} accent={accent} />;
    case 'tip':
      return <Tip tone={block.tone ?? 'exam'} text={block.text} />;
    case 'example':
      return <Example question={block.question} steps={block.steps} answer={block.answer} accent={accent} />;
    case 'table':
      return <Table head={block.head} rows={block.rows} accent={accent} />;
    case 'timeline':
      return <Timeline items={block.items} accent={accent} />;
    case 'flow':
      return <Flow title={block.title} items={block.items} accent={accent} />;
    case 'plot':
      return <Plot fns={block.fns} x={block.x} y={block.y} caption={block.caption} />;
  }
}

function Heading({ text, accent }: { text: string; accent: string }) {
  return (
    <View style={s.heading}>
      <View style={[s.headingBar, { backgroundColor: accent }]} />
      <T size={19} weight="800" style={{ flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

function Bullets({ items, accent }: { items: string[]; accent: string }) {
  return (
    <View style={{ gap: 10 }}>
      {items.map((it, i) => (
        <View key={i} style={s.bulletRow}>
          <View style={[s.bulletDot, { backgroundColor: accent }]} />
          <T size={15} style={{ flex: 1, lineHeight: 23 }}>
            {it}
          </T>
        </View>
      ))}
    </View>
  );
}

function Formula({ title, lines, accent }: { title?: string; lines: string[]; accent: string }) {
  const { c } = useTheme();
  return (
    <View style={[s.formula, { backgroundColor: alpha(accent, 0.08), borderColor: alpha(accent, 0.3) }]}>
      <View style={s.formulaHead}>
        <Icon name="sparkles" size={15} color={accent} />
        <T size={12.5} weight="800" color={accent} style={{ letterSpacing: 0.6 }}>
          {(title ?? 'Formül').toLocaleUpperCase('tr-TR')}
        </T>
      </View>
      {lines.map((l, i) => (
        <T key={i} size={16.5} weight="700" color={c.text} style={{ lineHeight: 27, fontVariant: ['tabular-nums'] }}>
          {l}
        </T>
      ))}
    </View>
  );
}

function Tip({ tone, text }: { tone: 'info' | 'warn' | 'exam'; text: string }) {
  const { c } = useTheme();
  const cfg = {
    exam: { color: c.primary, bg: c.primarySoft, icon: 'school' as const, label: 'Sınav taktiği' },
    warn: { color: c.warning, bg: c.warningSoft, icon: 'alert-circle' as const, label: 'Dikkat' },
    info: { color: c.info, bg: c.infoSoft, icon: 'information-circle' as const, label: 'Bilgi' },
  }[tone];
  return (
    <View style={[s.tip, { backgroundColor: cfg.bg }]}>
      <Icon name={cfg.icon} size={22} color={cfg.color} />
      <View style={{ flex: 1, gap: 2 }}>
        <T size={12.5} weight="800" color={cfg.color}>
          {cfg.label}
        </T>
        <T size={14.5} style={{ lineHeight: 22 }}>
          {text}
        </T>
      </View>
    </View>
  );
}

/** Adım adım çözüm: her dokunuşta bir sonraki adım kayarak açılır. */
function Example({ question, steps, answer, accent }: { question: string; steps: string[]; answer: string; accent: string }) {
  const { c } = useTheme();
  const [shown, setShown] = useState(0);
  const done = shown > steps.length;
  return (
    <View style={[s.example, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={s.exampleHead}>
        <View style={[s.examplePill, { backgroundColor: alpha(accent, 0.14) }]}>
          <Icon name="create" size={14} color={accent} />
          <T size={12} weight="800" color={accent}>
            ÖRNEK
          </T>
        </View>
      </View>
      <T size={15.5} weight="600" style={{ lineHeight: 24 }}>
        {question}
      </T>
      {steps.slice(0, shown).map((st, i) => (
        <Appear key={i} from={8}>
          <View style={s.stepRow}>
            <View style={[s.stepNum, { backgroundColor: accent }]}>
              <T size={12} weight="800" color="#FFFFFF">
                {i + 1}
              </T>
            </View>
            <T size={15} style={{ flex: 1, lineHeight: 23 }}>
              {st}
            </T>
          </View>
        </Appear>
      ))}
      {done ? (
        <Appear from={8}>
          <View style={[s.answer, { backgroundColor: c.successSoft }]}>
            <Icon name="checkmark-circle" size={20} color={c.success} />
            <T size={15.5} weight="800" color={c.success} style={{ flex: 1 }}>
              {answer}
            </T>
          </View>
        </Appear>
      ) : (
        <PressableScale
          onPress={() => {
            pressFeedback();
            setShown((n) => n + 1);
          }}
          accessibilityRole="button"
          style={[s.stepBtn, { borderColor: alpha(accent, 0.4) }]}
        >
          <Icon name={shown === steps.length ? 'flag' : 'play'} size={16} color={accent} />
          <T size={14} weight="700" color={accent}>
            {shown === 0 ? 'Çözümü adım adım göster' : shown === steps.length ? 'Sonucu göster' : 'Sonraki adım'}
          </T>
        </PressableScale>
      )}
    </View>
  );
}

function Table({ head, rows, accent }: { head: string[]; rows: string[][]; accent: string }) {
  const { c } = useTheme();
  const wide = head.length > 2;
  const colW = wide ? 150 : undefined;
  const content = (
    <View style={[s.table, { borderColor: c.border }]}>
      <View style={[s.tr, { backgroundColor: alpha(accent, 0.12) }]}>
        {head.map((h, i) => (
          <View key={i} style={[s.td, colW ? { width: colW } : { flex: i === 0 ? 1 : 1.4 }]}>
            <T size={13} weight="800" color={accent}>
              {h}
            </T>
          </View>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={[s.tr, { backgroundColor: ri % 2 ? c.cardAlt : c.card, borderTopColor: c.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
          {r.map((cell, ci) => (
            <View key={ci} style={[s.td, colW ? { width: colW } : { flex: ci === 0 ? 1 : 1.4 }]}>
              <T size={13.5} weight={ci === 0 ? '700' : '400'}>
                {cell}
              </T>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
  if (!wide) return content;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {content}
    </ScrollView>
  );
}

function Timeline({ items, accent }: { items: { date: string; title: string; text?: string }[]; accent: string }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingLeft: 4 }}>
      {items.map((it, i) => (
        <Appear key={i} delay={i * 90} from={10}>
          <View style={s.tlRow}>
            <View style={s.tlRail}>
              <View style={[s.tlDot, { backgroundColor: accent, borderColor: alpha(accent, 0.25) }]} />
              {i < items.length - 1 ? <View style={[s.tlLine, { backgroundColor: alpha(accent, 0.25) }]} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 16, gap: 2 }}>
              <T size={12.5} weight="800" color={accent}>
                {it.date}
              </T>
              <T size={15} weight="700">
                {it.title}
              </T>
              {it.text ? (
                <T size={13.5} color={c.textMuted}>
                  {it.text}
                </T>
              ) : null}
            </View>
          </View>
        </Appear>
      ))}
    </View>
  );
}

/** Akış şeması: kutular sırayla belirir, aralarında oklar vardır. */
function Flow({ title, items, accent }: { title?: string; items: string[]; accent: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      {title ? (
        <T size={13} weight="800" muted>
          {title}
        </T>
      ) : null}
      {items.map((it, i) => (
        <Appear key={i} delay={i * 160} from={6}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <LinearGradient
              colors={[alpha(accent, 0.16 + (i / Math.max(1, items.length - 1)) * 0.14), alpha(accent, 0.06)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.flowBox, { borderColor: alpha(accent, 0.35) }]}
            >
              <View style={[s.flowNum, { backgroundColor: accent }]}>
                <T size={11.5} weight="800" color="#FFFFFF">
                  {i + 1}
                </T>
              </View>
              <T size={14.5} weight="600" style={{ flex: 1 }} color={c.text}>
                {it}
              </T>
            </LinearGradient>
            {i < items.length - 1 ? <Icon name="arrow-down" size={16} color={alpha(accent, 0.7)} /> : null}
          </View>
        </Appear>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  headingBar: { width: 5, height: 22, borderRadius: 3 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletDot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
  formula: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 4 },
  formulaHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tip: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, alignItems: 'flex-start' },
  example: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  exampleHead: { flexDirection: 'row' },
  examplePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed' },
  answer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14 },
  table: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  tr: { flexDirection: 'row' },
  td: { paddingHorizontal: 10, paddingVertical: 9 },
  tlRow: { flexDirection: 'row', gap: 12 },
  tlRail: { width: 18, alignItems: 'center' },
  tlDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 3 },
  tlLine: { flex: 1, width: 2, marginTop: 2 },
  flowBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, alignSelf: 'stretch' },
  flowNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
