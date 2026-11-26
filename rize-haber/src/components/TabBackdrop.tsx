/**
 * Sekmelerin arka planı: kullanıcının Ayarlar → Arka planlar'da seçtiği sahne, seçilmediyse sekmenin
 * özgün sahnesi. Ekranlar ve Ayarlar'daki önizleme aynı bileşenleri kullanır.
 */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import type { BackdropTab } from '../backdrops';
import type { RizeSky } from '../rizeScene';
import { ECON_CHROME } from '../economyScene';
import { STADIUM_CHROME } from '../rizespor/stadium';
import { TEA_CHROME } from '../teaScene';
import { sceneTint, useTheme } from '../theme';
import type { SkyChrome } from '../weatherScene';
import BackdropView, { useBackdrop } from './Backdrop';
import { useSceneStill } from './motion';
import EconomyScene from './EconomyScene';
import RizeScene from './RizeScene';
import StadiumScene, { Fireworks } from './StadiumScene';
import TeaScene from './TeaScene';

const FIXED_CHROME: Record<Exclude<BackdropTab, 'news' | 'weather'>, SkyChrome> = {
  rizespor: STADIUM_CHROME,
  tea: TEA_CHROME,
  economy: ECON_CHROME,
};

/**
 * Seçili sahnenin üst başlık / alt sekme çubuğu renkleri. Haberler'de özgün sahnenin rengi saate
 * göre değiştiği için `newsSky` verilir. Hava sekmesinin rengi havadan gelir; burada kullanılmaz.
 */
export function useTabChrome(tab: Exclude<BackdropTab, 'weather'>, newsSky?: RizeSky): SkyChrome {
  const backdrop = useBackdrop(tab);
  const raw = backdrop.scene ? backdrop.scene.chrome : tab === 'news' ? newsSky!.chrome : FIXED_CHROME[tab];
  return useToneChrome(raw);
}

/** "Tek renk" düzeninde çerçeve renklerini sahne filtresiyle aynı tona çevirir; başlık ile sahne dikişsiz birleşir. */
export function useToneChrome<T extends SkyChrome | null>(chrome: T): T {
  const { colors } = useTheme();
  const header = chrome?.header;
  const footer = chrome?.footer;
  return useMemo(() => {
    if (!colors.mono || header == null || footer == null) return chrome;
    return { header: sceneTint(colors, header), footer: sceneTint(colors, footer) } as T;
    // `chrome` nesnesi her çizimde yeni olabilir; renkleri yeterli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, header, footer]);
}

export function NewsBackdrop({ sky, active }: { sky: RizeSky; active: boolean }) {
  const backdrop = useBackdrop('news');
  return backdrop.scene ? <BackdropView scene={backdrop.scene} active={active} /> : <RizeScene sky={sky} active={active} />;
}

export function RizesporBackdrop({ active, live = false, cheer = 0 }: { active: boolean; live?: boolean; cheer?: number }) {
  const backdrop = useBackdrop('rizespor');
  const still = useSceneStill();
  if (!backdrop.scene) return <StadiumScene active={active} live={live} cheer={cheer} />;
  return (
    <BackdropView scene={backdrop.scene} active={active}>
      {/* Gol kutlaması seçilen sahnede de patlar. */}
      {active && !still && cheer > 0 ? <GoalFireworks key={cheer} /> : null}
    </BackdropView>
  );
}

function GoalFireworks() {
  const { width, height } = useWindowDimensions();
  return <Fireworks width={width} height={height} />;
}

export function TeaBackdrop({ active }: { active: boolean }) {
  const backdrop = useBackdrop('tea');
  return backdrop.scene ? <BackdropView scene={backdrop.scene} active={active} /> : <TeaScene active={active} />;
}

export function EconomyBackdrop({ active }: { active: boolean }) {
  const backdrop = useBackdrop('economy');
  return backdrop.scene ? <BackdropView scene={backdrop.scene} active={active} /> : <EconomyScene active={active} />;
}
