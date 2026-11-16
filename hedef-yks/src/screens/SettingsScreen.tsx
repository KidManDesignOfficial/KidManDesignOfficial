import { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Button, Card, Chip, Screen, T } from '../components/ui';
import { EXAM_DATE_NOTE } from '../config';
import { FIELD_LABELS } from '../data';
import type { Field } from '../data';
import { formatTrDate, parseTrDate } from '../lib/dates';
import { setHapticsEnabled } from '../lib/haptics';
import { useStore } from '../store';
import type { Role } from '../store';
import type { TextSize, ThemeMode } from '../theme';
import { useTheme } from '../theme';

export default function SettingsScreen() {
  const { c, fs } = useTheme();
  const { state, update, reset } = useStore();
  const [name, setName] = useState(state.name);
  const [date, setDate] = useState(state.examDate);
  const dateOk = parseTrDate(date) !== null;

  const confirmReset = () => {
    const run = () => reset();
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Tüm ilerleme silinsin mi?') ?? true) run();
      return;
    }
    Alert.alert('İlerlemeyi sıfırla', 'Çözülen sorular, tamamlanan konular, yanlış defteri ve denemeler silinecek. Bu işlem geri alınamaz.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: run },
    ]);
  };

  const input = { fontSize: fs(16), color: c.text, borderColor: c.border, backgroundColor: c.cardAlt };

  return (
    <Screen title="Ayarlar">
      <Card style={styles.card}>
        <T weight="800">Profil</T>
        <TextInput value={name} onChangeText={setName} onEndEditing={() => update({ name: name.trim() })} onBlur={() => update({ name: name.trim() })} placeholder="Adın" placeholderTextColor={c.textFaint} style={[styles.input, input]} maxLength={24} accessibilityLabel="Adın" />
        <View style={styles.chips}>
          {(['student', 'teacher'] as Role[]).map((r) => (
            <Chip key={r} label={r === 'student' ? 'Öğrenci' : 'Öğretmen'} selected={state.role === r} onPress={() => update({ role: r })} />
          ))}
        </View>
        <T size={13} muted>
          Puan türü (AYT dersleri buna göre önerilir)
        </T>
        <View style={styles.chips}>
          {(Object.keys(FIELD_LABELS) as Field[]).map((f) => (
            <Chip key={f} label={FIELD_LABELS[f]} selected={state.field === f} onPress={() => update({ field: f })} />
          ))}
        </View>
        <T size={13} muted>
          Günlük soru hedefi
        </T>
        <View style={styles.chips}>
          {[10, 20, 40, 60, 100].map((g) => (
            <Chip key={g} label={`${g}`} selected={state.dailyGoal === g} onPress={() => update({ dailyGoal: g })} />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <T weight="800">Sınav tarihi (geri sayım)</T>
        <TextInput
          value={date}
          onChangeText={setDate}
          onEndEditing={() => dateOk && update({ examDate: formatTrDate(parseTrDate(date)!) })}
          onBlur={() => dateOk && update({ examDate: formatTrDate(parseTrDate(date)!) })}
          placeholder="GG.AA.YYYY"
          placeholderTextColor={c.textFaint}
          keyboardType="numbers-and-punctuation"
          style={[styles.input, input, !dateOk && { borderColor: c.danger }]}
          accessibilityLabel="Sınav tarihi"
        />
        <T size={12.5} muted>
          {dateOk ? EXAM_DATE_NOTE : 'Tarihi GG.AA.YYYY biçiminde gir.'}
        </T>
      </Card>

      <Card style={styles.card}>
        <T weight="800">Görünüm</T>
        <View style={styles.chips}>
          {([['system', 'Sistem'], ['light', 'Açık'], ['dark', 'Koyu']] as [ThemeMode, string][]).map(([m, l]) => (
            <Chip key={m} label={l} icon={m === 'dark' ? 'moon' : m === 'light' ? 'sunny' : 'phone-portrait'} selected={state.mode === m} onPress={() => update({ mode: m })} />
          ))}
        </View>
        <T size={13} muted>
          Yazı boyutu
        </T>
        <View style={styles.chips}>
          {([['small', 'Küçük'], ['normal', 'Normal'], ['large', 'Büyük']] as [TextSize, string][]).map(([s, l]) => (
            <Chip key={s} label={l} selected={state.textSize === s} onPress={() => update({ textSize: s })} />
          ))}
        </View>
        <View style={styles.switchRow}>
          <T style={{ flex: 1 }}>Titreşimli geri bildirim</T>
          <Switch
            value={state.haptics}
            onValueChange={(v) => {
              setHapticsEnabled(v);
              update({ haptics: v });
            }}
            trackColor={{ true: c.primary, false: c.border }}
            accessibilityLabel="Titreşimli geri bildirim"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <T weight="800">Veriler</T>
        <T size={13} muted>
          Tüm ilerlemen yalnızca bu cihazda saklanır.
        </T>
        <Button label="İlerlemeyi sıfırla" icon="trash" variant="danger" onPress={confirmReset} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
});
