/**
 * Uygulama genelindeki hareketler: açılır-kapanır içerik, basınca yaylanma, yumuşak beliriş.
 *
 * Tek bir yerde tanımlandıkları için her ekranda aynı süre ve eğri kullanılır. Telefonda
 * "Hareketi azalt" (erişilebilirlik) açıksa ya da kullanıcı Ayarlar → Özelleştirme'den
 * animasyonları kapattıysa animasyonlar anında tamamlanır.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef, ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, ScrollView, View } from 'react-native';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { sceneFilter } from '../mono';
import { useTheme } from '../theme';
import { Icon } from './Icon';

/**
 * Bileşen ömrü boyunca sabit kalan animasyon değeri. React Native'in `useAnimatedValue` kancasıyla
 * aynı işi yapar ama web önizlemesi dahil her platformda çalışır ve React derleyicisiyle uyumludur.
 */
export function useAnimatedValue(initial: number): Animated.Value {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}

/**
 * Arka plan sahneleri için 0→1 arasında sürekli dönen saat (yerel sürücüde, doğrusal).
 * `running` yanlışsa durur; sahne durağan çizilir.
 */
export function useLoopClock(duration: number, running: boolean): Animated.Value {
  const clock = useAnimatedValue(0);
  useEffect(() => {
    if (!running) return;
    clock.setValue(0);
    const loop = Animated.loop(Animated.timing(clock, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [clock, duration, running]);
  return clock;
}

/** Saatten türetilen, `speed` kat hızlı ve `phase` kadar kaydırılmış 0→1 döngü. */
export function loopPhase(clock: Animated.Value, speed: number, phase: number) {
  return Animated.modulo(Animated.add(Animated.multiply(clock, speed), phase), 1);
}

/** Doğal hissettiren yavaşlayan eğri (Material "emphasized decelerate"e yakın). */
export const EASE_OUT = Easing.bezier(0.2, 0.8, 0.2, 1);
export const DURATION = { short: 180, medium: 300 } as const;

/** Telefonun erişilebilirlik ayarı "Hareketi azalt" açık mı? */
export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/** Arayüz animasyonları (geçiş, açılır-kapanır, yaylanma) kapalı mı? */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const { settings } = useTheme();
  return system || !settings.uiMotion;
}

/** Arka plan sahneleri durağan mı çizilmeli? (yağmur, bulut, buhar, borsa şeridi, stadyum ışıkları) */
export function useSceneStill(): boolean {
  const system = useSystemReducedMotion();
  const { settings } = useTheme();
  return system || !settings.sceneMotion;
}

/**
 * "Tek renk" düzeninde sahne katmanının kök görünümüne verilen renk filtresi; kapalıyken null.
 * Renk matrisi filtresi Android'in tüm sürümlerinde donanım katmanıyla çizilir.
 */
export function useSceneFilter(): ViewStyle | null {
  const { colors } = useTheme();
  const mono = colors.mono;
  return useMemo(() => (mono ? ({ filter: sceneFilter(mono, Platform.OS) } as ViewStyle) : null), [mono]);
}

/**
 * Yüksekliği yumuşakça açılıp kapanan içerik.
 * İçerik her zaman ölçülür (görünmez katmanda), böylece açılış tam yüksekliğe akıcı biçimde ulaşır.
 * `progress` verilirse dışarıdaki öğeler (ör. dönen ok) aynı animasyona bağlanabilir.
 */
export function Collapsible({
  open,
  children,
  progress: external,
}: {
  open: boolean;
  children: ReactNode;
  progress?: Animated.Value;
}) {
  const reduced = useReducedMotion();
  const internal = useAnimatedValue(open ? 1 : 0);
  const progress = external ?? internal;
  const [height, setHeight] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduced ? 0 : DURATION.medium,
      easing: EASE_OUT,
      useNativeDriver: false, // yükseklik yerel sürücüyle canlandırılamaz
    }).start();
  }, [open, progress, reduced]);

  const animatedHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] });
  const opacity = progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.2, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });

  return (
    <Animated.View
      style={{ height: animatedHeight, overflow: 'hidden' }}
      pointerEvents={open ? 'auto' : 'none'}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View
        style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity, transform: [{ translateY }] }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

/** Basılınca hafifçe küçülüp yaylanarak geri dönen dokunma alanı. */
export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.97,
  ...props
}: PressableProps & {
  children: ReactNode;
  /** Ölçeklenen iç görünümün stili (zemin, kenarlık, iç boşluk). */
  style?: StyleProp<ViewStyle>;
  /** Dış dokunma alanının stili (ör. satırda yer kaplama: flex, flexGrow). */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const reduced = useReducedMotion();
  const scale = useAnimatedValue(1);
  const to = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: value === 1 ? 6 : 0,
    }).start();

  return (
    <Pressable
      {...props}
      style={containerStyle}
      onPressIn={(e) => {
        if (!reduced) to(scaleTo);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduced) to(1);
        props.onPressOut?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * Görünür olduğunda hafif yukarı kayarak solarak beliren kapsayıcı.
 * Görünmezken `display: none` ile gizlenir; içerik bağlı kalır (durum ve kaydırma korunur).
 */
export function FadeInView({
  visible = true,
  children,
  style,
}: {
  visible?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useAnimatedValue(0);

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 0 : DURATION.medium,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }, [visible, progress, reduced]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  // Her yeniden görünüşte sayaç artar; iç içe sekmelerde üst sekmenin sayacı da hesaba katılır.
  const parent = useContext(ShowContext);
  const [shows, setShows] = useState(0);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setShows((n) => n + 1);
  }
  const key = `${parent}.${shows}`;

  return (
    <Animated.View
      style={[style, !visible && { display: 'none' }, { opacity: progress, transform: [{ translateY }] }]}
    >
      <ShowContext.Provider value={key}>{children}</ShowContext.Provider>
    </Animated.View>
  );
}

const ShowContext = createContext('0');

type Scrollable = {
  scrollTo?: (o: { x?: number; y?: number; animated?: boolean }) => void;
  scrollToOffset?: (o: { offset: number; animated?: boolean }) => void;
};

/**
 * Kaydırılabilir listeye verilecek ref: liste, içinde bulunduğu sekme (FadeInView) her yeniden
 * açıldığında animasyonsuz en üste döner. Sekme değiştirince sayfa yarıda kalmaz.
 */
export function useScrollTopOnShow<T extends Scrollable = ComponentRef<typeof ScrollView>>() {
  const ref = useRef<T>(null);
  const key = useContext(ShowContext);
  const first = useRef(key);
  useLayoutEffect(() => {
    if (key === first.current) return;
    first.current = key;
    const list = ref.current;
    if (list?.scrollToOffset) list.scrollToOffset({ offset: 0, animated: false });
    else list?.scrollTo?.({ y: 0, animated: false });
  }, [key]);
  return ref;
}

/** Ekran her gösterildiğinde değişen anahtar (gösterildiğinde veriyi yenilemek için). */
export function useShowKey(): string {
  return useContext(ShowContext);
}

/** Dönen ok (▾): `progress` 0 → 1 iken 0° → 180°. */
export function Chevron({ progress, color, size }: { progress: Animated.Value; color: string; size: number }) {
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Icon name="chevron-down" size={size} color={color} />
      </Animated.View>
    </View>
  );
}
