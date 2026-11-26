/** Ayarlar → Ana ekran widget'ları listesi (Android'deki widget seçicisiyle aynı adlar ve sıra). */
import type { WidgetKind } from './snapshot.ts';

export type WidgetInfo = {
  kind: WidgetKind;
  title: string;
  description: string;
  /** Varsayılan boyut (hücre); kullanıcı ana ekranda büyütüp küçültebilir. */
  size: string;
  icon: 'partly-sunny-outline' | 'newspaper-outline' | 'trending-up-outline' | 'football-outline' | 'apps-outline';
};

export const WIDGET_CATALOG: WidgetInfo[] = [
  {
    kind: 'weather',
    title: 'Hava Durumu',
    description: 'Varsayılan konumun anlık havası; genişletince önümüzdeki saatler.',
    size: '2×2',
    icon: 'partly-sunny-outline',
  },
  {
    kind: 'news',
    title: 'Son Haberler',
    description: 'Rize’den son başlıklar; dokunduğunuz haber uygulamada açılır.',
    size: '4×2',
    icon: 'newspaper-outline',
  },
  {
    kind: 'markets',
    title: 'Döviz, Altın ve Çay',
    description: 'Dolar, euro, gram altın ve yaş çay alım fiyatı.',
    size: '2×2',
    icon: 'trending-up-outline',
  },
  {
    kind: 'rizespor',
    title: 'Çaykur Rizespor',
    description: 'Sıradaki maç, canlı skor ya da son sonuç.',
    size: '4×2',
    icon: 'football-outline',
  },
  {
    kind: 'shortcuts',
    title: 'Hızlı Erişim',
    description: 'Haberler, Rizespor, Çay, Ekonomi ve Hava’ya tek dokunuş.',
    size: '4×1',
    icon: 'apps-outline',
  },
];
