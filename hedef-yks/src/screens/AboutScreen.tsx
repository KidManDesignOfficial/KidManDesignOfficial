import { Linking, View } from 'react-native';

import { Icon } from '../components/Icon';
import { Card, Screen, T } from '../components/ui';
import { APP_NAME, APP_VERSION, CONTACT_EMAIL } from '../config';
import { LESSONS, QUESTIONS, SUBJECTS } from '../data';
import { useTheme } from '../theme';

export default function AboutScreen() {
  const { c } = useTheme();
  const topics = SUBJECTS.reduce((n, s) => n + s.topics.length, 0);
  return (
    <Screen title="Hakkında">
      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="rocket" size={36} color="#FFFFFF" />
        </View>
        <T size={22} weight="900">
          {APP_NAME}
        </T>
        <T muted>Sürüm {APP_VERSION}</T>
        <T muted center>
          {SUBJECTS.length} ders · {topics} konu başlığı · {LESSONS.length} konu anlatımı · {QUESTIONS.length} çözümlü soru
        </T>
      </Card>
      <Card style={{ gap: 8 }}>
        <T weight="800">Müfredat</T>
        <T size={14} muted>
          Konu başlıkları ÖSYM’nin YKS kapsamı (TYT ve AYT) ile MEB ortaöğretim öğretim programları esas alınarak düzenlenmiştir. Sınavdaki soru dağılımları son yılların YKS kılavuzlarına göredir; ÖSYM her yıl kılavuzu yeniden yayımlar.
        </T>
      </Card>
      <Card style={{ gap: 8 }}>
        <T weight="800">Canlı resmî veriler</T>
        <T size={14} muted>
          Sınav takvimi, YKS duyuruları ve 2018’den bu yana çıkmış soru kitapçıkları ÖSYM’nin sayfalarından anlık okunur; son başarılı veri internetsiz kullanım için cihazda saklanır. MEB konu özetleri, video anlatımlar, denemeler ve puan hesaplama motoru MEB OGM Materyal’in resmî sayfalarında açılır. Her konunun altındaki “Kapsamlı anlatım” bölümü, konuyla eşlenmiş Türkçe Vikipedi maddelerinin güncel sürümünü canlı indirir (açık lisans: CC BY-SA 4.0; yazar ve lisans bilgisi her maddede gösterilir). Uygulama ÖSYM, MEB ve Wikimedia Vakfı ile bağlantılı değildir.
        </T>
      </Card>
      <Card style={{ gap: 8 }}>
        <T weight="800">Sorular</T>
        <T size={14} muted>
          Uygulamadaki sorular ÖSYM biçiminde (beş seçenekli) özgün olarak hazırlanmıştır; ÖSYM’nin çıkmış sorularından alınmamıştır ve ÖSYM ile resmî bir bağı yoktur.
        </T>
      </Card>
      <Card style={{ gap: 8 }}>
        <T weight="800">Gizlilik</T>
        <T size={14} muted>
          Uygulama hesap gerektirmez ve hiçbir kişisel veri toplamaz. İnternet yalnızca ÖSYM (osym.gov.tr) ve MEB (ogmmateryal.eba.gov.tr) resmî sayfalarını okumak için kullanılır; bu isteklerde senden hiçbir bilgi gönderilmez. Konu anlatımları (Türkçe Vikipedi maddeleri dahil) ve sorular uygulamanın içindedir, internetsiz çalışır. İlerlemen, cevapların ve ayarların yalnızca telefonunda saklanır.
        </T>
      </Card>
      <Card onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(APP_NAME + ' geri bildirim')}`).catch(() => {})}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="mail" size={22} color={c.primary} />
          <View style={{ flex: 1 }}>
            <T weight="800">Hata bildir / öneride bulun</T>
            <T size={13} muted>
              {CONTACT_EMAIL}
            </T>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
