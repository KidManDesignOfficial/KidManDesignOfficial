/**
 * Öğretmen modu: soru bankasından konu seçerek çalışma kâğıdı oluşturma, cevap anahtarıyla
 * paylaşma (WhatsApp, e-posta, yazdırma uygulamaları) ve sınıfta tahtaya yansıtarak çözme.
 */
import { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '../components/Icon';
import { Button, Card, Chip, T } from '../components/ui';
import { SUBJECTS, questionsOfSubject } from '../data';
import type { Difficulty, Exam } from '../data';
import { successFeedback } from '../lib/haptics';
import { byDifficulty, letter, shuffle, worksheetText } from '../lib/quiz';
import { useNav } from '../nav';
import { GRADIENT, useTheme } from '../theme';

const COUNTS = [5, 10, 15, 20];

export default function TeacherScreen() {
  const { c } = useTheme();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [exam, setExam] = useState<Exam>('TYT');
  const [subjectId, setSubjectId] = useState('tyt-mat');
  const [topics, setTopics] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState<Difficulty | 0>(0);
  const [seed, setSeed] = useState(1);
  const [withKey, setWithKey] = useState(true);

  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const pool = questionsOfSubject(subjectId);
  const topicsWithQs = subject.topics.filter((t) => pool.some((q) => q.topicId === t.id));
  const sheet = useMemo(() => {
    const filtered = questionsOfSubject(subjectId).filter((q) => (topics.length === 0 || topics.includes(q.topicId)) && (level === 0 || q.difficulty === level));
    return byDifficulty(shuffle(filtered, seed).slice(0, count), seed);
  }, [subjectId, topics, level, seed, count]);

  const title = `${subject.exam} ${subject.name} Çalışma Kâğıdı (${sheet.length} soru)`;

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={GRADIENT.teacher} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Icon name="easel" size={30} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <T size={22} weight="900" color="#FFFFFF">
            Öğretmen Paneli
          </T>
          <T size={13.5} color="rgba(255,255,255,0.88)">
            Konu seç, çalışma kâğıdı oluştur; cevap anahtarıyla paylaş ya da sınıfta birlikte çöz.
          </T>
        </View>
      </LinearGradient>

      <Card style={{ gap: 12 }}>
        <T weight="800">1. Sınav ve ders</T>
        <View style={styles.chips}>
          {(['TYT', 'AYT'] as Exam[]).map((e) => (
            <Chip
              key={e}
              label={e}
              selected={exam === e}
              onPress={() => {
                setExam(e);
                const first = SUBJECTS.find((s) => s.exam === e)!;
                setSubjectId(first.id);
                setTopics([]);
              }}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {SUBJECTS.filter((s) => s.exam === exam).map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              color={s.colors[1]}
              selected={subjectId === s.id}
              onPress={() => {
                setSubjectId(s.id);
                setTopics([]);
              }}
            />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <T weight="800">2. Konular {topics.length ? `(${topics.length} seçili)` : '(tümü)'}</T>
        <View style={styles.chips}>
          {topicsWithQs.map((t) => (
            <Chip key={t.id} label={t.title} selected={topics.includes(t.id)} color={subject.colors[1]} onPress={() => setTopics((cur) => (cur.includes(t.id) ? cur.filter((x) => x !== t.id) : [...cur, t.id]))} />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <T weight="800">3. Soru sayısı ve zorluk</T>
        <View style={styles.chips}>
          {COUNTS.map((n) => (
            <Chip key={n} label={`${n} soru`} selected={count === n} onPress={() => setCount(n)} />
          ))}
        </View>
        <View style={styles.chips}>
          {([0, 1, 2, 3] as const).map((d) => (
            <Chip key={d} label={d === 0 ? 'Karışık' : d === 1 ? 'Kolay' : d === 2 ? 'Orta' : 'Zor'} selected={level === d} onPress={() => setLevel(d)} />
          ))}
        </View>
        <Chip label={withKey ? 'Cevap anahtarı eklenecek' : 'Cevap anahtarı eklenmeyecek'} icon={withKey ? 'key' : 'key-outline'} selected={withKey} onPress={() => setWithKey((v) => !v)} />
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={styles.row}>
          <T weight="800" style={{ flex: 1 }}>
            Önizleme · {sheet.length} soru
          </T>
          <Chip label="Yeniden karıştır" icon="shuffle" onPress={() => setSeed((s) => s + 1)} />
        </View>
        {sheet.length === 0 ? (
          <T muted>Seçimlere uygun soru yok. Zorluğu “Karışık” yapmayı ya da konu seçimini genişletmeyi dene.</T>
        ) : (
          sheet.map((q, i) => (
            <View key={q.id} style={[styles.pq, { borderColor: c.border }]}>
              <T size={13.5} weight="700" lines={2}>
                {i + 1}. {q.text}
              </T>
              <T size={12} muted>
                Cevap: {letter(q.answer)} · Zorluk {q.difficulty}/3
              </T>
            </View>
          ))
        )}
        {count > sheet.length && sheet.length > 0 ? (
          <T size={12} muted>
            Bu seçimde soru bankasında {sheet.length} soru var; yeni sorular güncellemelerle eklenir.
          </T>
        ) : null}
      </Card>

      <Button
        label="Paylaş (WhatsApp, e-posta, yazdır)"
        icon="share-social"
        gradient={GRADIENT.teacher}
        disabled={sheet.length === 0}
        onPress={async () => {
          try {
            await Share.share({ title, message: worksheetText(title, sheet, withKey) });
            successFeedback();
          } catch {
            // Paylaşım iptal edildi.
          }
        }}
      />
      <Button
        label="Sınıfta birlikte çöz"
        icon="tv"
        variant="secondary"
        disabled={sheet.length === 0}
        onPress={() => nav.push({ name: 'quiz', config: { title, mode: 'practice', kind: 'teacher', questionIds: sheet.map((q) => q.id) } })}
      />
      <T size={12} muted center>
        Sorular özgün olarak hazırlanmıştır ve ÖSYM soru biçimine (5 seçenek) uygundur.
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 18, borderRadius: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pq: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, gap: 2 },
});
