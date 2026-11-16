import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Button, Card, Empty, Screen, T } from '../components/ui';
import { questionById, subjectOfTopic, topicTitle } from '../data';
import { letter } from '../lib/quiz';
import { useNav } from '../nav';
import { useStore } from '../store';
import { GRADIENT, useTheme } from '../theme';

export default function WrongBookScreen() {
  const { c } = useTheme();
  const { state, resolveWrong } = useStore();
  const nav = useNav();
  const ids = state.wrongBook.filter((id) => questionById(id));

  return (
    <Screen
      title="Yanlış Defteri"
      subtitle={`${ids.length} soru tekrar bekliyor`}
      footer={ids.length ? <Button label={`Hepsini tekrar çöz (${ids.length})`} icon="refresh" gradient={GRADIENT.warm} onPress={() => nav.push({ name: 'quiz', config: { title: 'Yanlış Defteri', mode: 'practice', kind: 'wrongbook', questionIds: ids } })} /> : undefined}
    >
      {ids.length === 0 ? (
        <Empty icon="sparkles" title="Defterin tertemiz" text="Yanlış yaptığın her soru otomatik olarak buraya eklenir. Tekrar çözüp doğru yaptığında “Öğrendim” diyerek çıkarabilirsin." />
      ) : (
        ids.map((id) => {
          const q = questionById(id)!;
          const s = subjectOfTopic(q.topicId)!;
          const a = state.answers[id];
          const fixed = a?.correct;
          return (
            <Card key={id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.colors[0] }} />
                <T size={12} weight="800" muted style={{ flex: 1 }} lines={1}>
                  {s.exam} {s.name} · {topicTitle(q.topicId)}
                </T>
                {a?.wrongs ? (
                  <T size={11.5} weight="700" color={c.danger}>
                    {a.wrongs} kez yanlış
                  </T>
                ) : null}
              </View>
              <T size={14.5} weight="600" lines={3}>
                {q.text}
              </T>
              <T size={12.5} muted>
                Doğru cevap: {letter(q.answer)}) {q.options[q.answer]}
              </T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button small label="Çöz" icon="play" variant="secondary" style={{ flex: 1 }} onPress={() => nav.push({ name: 'quiz', config: { title: 'Yanlış Defteri', mode: 'practice', kind: 'wrongbook', questionIds: [id] } })} />
                <Button small label={fixed ? 'Öğrendim' : 'Çıkar'} icon={fixed ? 'checkmark-circle' : 'trash-outline'} variant={fixed ? 'primary' : 'ghost'} style={{ flex: 1 }} onPress={() => resolveWrong(id)} />
              </View>
              {fixed ? (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Icon name="checkmark-circle" size={15} color={c.success} />
                  <T size={12} color={c.success} weight="700">
                    Son denemede doğru çözdün
                  </T>
                </View>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
