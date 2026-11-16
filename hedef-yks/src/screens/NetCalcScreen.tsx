/** Net hesaplama: her test için doğru/yanlış girilir, net (D − Y/4) anında hesaplanır. */
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card, Chip, Screen, T } from '../components/ui';
import { clampTally, formatNet, tallyNet } from '../lib/net';
import { alpha, useTheme } from '../theme';

type TestDef = { id: string; name: string; total: number; color: string };

const TYT: TestDef[] = [
  { id: 'tr', name: 'Türkçe', total: 40, color: '#F43F5E' },
  { id: 'sos', name: 'Sosyal Bilimler', total: 20, color: '#F59E0B' },
  { id: 'mat', name: 'Temel Matematik', total: 40, color: '#6366F1' },
  { id: 'fen', name: 'Fen Bilimleri', total: 20, color: '#10B981' },
];
const AYT: TestDef[] = [
  { id: 'amat', name: 'Matematik', total: 40, color: '#4F46E5' },
  { id: 'afen', name: 'Fen Bilimleri (Fiz 14, Kim 13, Biy 13)', total: 40, color: '#059669' },
  { id: 'tde', name: 'TDE – Sosyal-1 (Edb 24, Tar 10, Coğ 6)', total: 40, color: '#E11D48' },
  { id: 'sos2', name: 'Sosyal-2 (Tar 11, Coğ 11, Fel 12, Din 6)', total: 40, color: '#D97706' },
];

export default function NetCalcScreen() {
  const { c } = useTheme();
  const [exam, setExam] = useState<'TYT' | 'AYT'>('TYT');
  const [vals, setVals] = useState<Record<string, { d: string; y: string }>>({});
  const tests = exam === 'TYT' ? TYT : AYT;
  const nets = tests.map((t) => {
    const v = vals[t.id] ?? { d: '', y: '' };
    const tally = clampTally({ correct: Number(v.d) || 0, wrong: Number(v.y) || 0, blank: 0 }, t.total);
    return { t, tally, net: tallyNet(tally) };
  });
  const total = nets.reduce((a, n) => a + n.net, 0);

  const set = (id: string, key: 'd' | 'y', text: string) => setVals((cur) => ({ ...cur, [id]: { ...(cur[id] ?? { d: '', y: '' }), [key]: text.replace(/[^0-9]/g, '').slice(0, 2) } }));

  return (
    <Screen title="Net hesaplama" subtitle="4 yanlış 1 doğruyu götürür">
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="TYT" selected={exam === 'TYT'} onPress={() => setExam('TYT')} />
        <Chip label="AYT" selected={exam === 'AYT'} onPress={() => setExam('AYT')} />
      </View>
      <Card style={[styles.total, { backgroundColor: c.primary, borderColor: c.primary }]}>
        <T size={13} weight="700" color="rgba(255,255,255,0.8)">
          TOPLAM {exam} NETİ
        </T>
        <T size={44} weight="900" color="#FFFFFF">
          {formatNet(total)}
        </T>
        <T size={12.5} color="rgba(255,255,255,0.8)">
          {tests.reduce((a, t) => a + t.total, 0)} sorudan
        </T>
      </Card>
      {nets.map(({ t, tally, net }) => (
        <Card key={t.id} style={{ gap: 10 }}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: t.color }]} />
            <T weight="800" style={{ flex: 1 }}>
              {t.name}
            </T>
            <T size={20} weight="900" color={t.color}>
              {formatNet(net)}
            </T>
          </View>
          <View style={styles.row}>
            <Field label="Doğru" value={vals[t.id]?.d ?? ''} onChange={(v) => set(t.id, 'd', v)} color={c.success} />
            <Field label="Yanlış" value={vals[t.id]?.y ?? ''} onChange={(v) => set(t.id, 'y', v)} color={c.danger} />
            <View style={[styles.blank, { backgroundColor: c.cardAlt }]}>
              <T size={11.5} muted>
                Boş
              </T>
              <T weight="800">{tally.blank}</T>
            </View>
          </View>
          <T size={12} muted>
            {t.total} soru
          </T>
        </Card>
      ))}
      <T size={12} muted center>
        Puan, ÖSYM’nin her yıl adayların ortalamasına göre belirlediği katsayılarla hesaplanır; burada yalnızca net gösterilir.
      </T>
    </Screen>
  );
}

function Field({ label, value, onChange, color }: { label: string; value: string; onChange: (v: string) => void; color: string }) {
  const { c, fs } = useTheme();
  return (
    <View style={[styles.field, { borderColor: alpha(color, 0.4), backgroundColor: alpha(color, 0.06) }]}>
      <T size={11.5} weight="700" color={color}>
        {label}
      </T>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={c.textFaint}
        accessibilityLabel={label}
        style={{ fontSize: fs(20), fontWeight: '800', color: c.text, padding: 0 }}
        maxLength={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  total: { alignItems: 'center', gap: 2, paddingVertical: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  field: { flex: 1, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 8 },
  blank: { width: 70, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
});
