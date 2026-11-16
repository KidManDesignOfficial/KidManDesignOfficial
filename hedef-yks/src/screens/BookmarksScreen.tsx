import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Card, Empty, Screen, T } from '../components/ui';
import { LESSON_BY_TOPIC, subjectOfTopic, topicTitle } from '../data';
import { useNav } from '../nav';
import { useStore } from '../store';
import { useTheme } from '../theme';

export default function BookmarksScreen() {
  const { c } = useTheme();
  const { state } = useStore();
  const nav = useNav();
  const list = state.bookmarks.filter((t) => LESSON_BY_TOPIC[t]);
  return (
    <Screen title="Kaydedilen konular" subtitle={`${list.length} konu`}>
      {list.length === 0 ? (
        <Empty icon="bookmark-outline" title="Kayıtlı konu yok" text="Konu anlatımında sağ üstteki yer imi simgesine dokunarak konuları buraya ekleyebilirsin." />
      ) : (
        list.map((t) => {
          const s = subjectOfTopic(t)!;
          return (
            <Card key={t} onPress={() => nav.push({ name: 'lesson', topicId: t })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="bookmark" size={20} color={s.colors[0]} />
                <View style={{ flex: 1 }}>
                  <T weight="700">{topicTitle(t)}</T>
                  <T size={12.5} muted>
                    {s.exam} {s.name}
                  </T>
                </View>
                <Icon name="chevron-forward" size={18} color={c.textFaint} />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
