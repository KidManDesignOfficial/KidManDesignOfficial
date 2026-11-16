/**
 * Uygulama genelindeki çizgi simgeler (Ionicons). Emoji yerine kullanılır: her telefonda aynı
 * görünür, renk ve boyutu temaya uyar. Yazı tipi App.tsx'te açılış ekranı sırasında önceden yüklenir.
 */
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const ICON_FONT = Ionicons.font;

export function Icon({
  name,
  size = 20,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  // Simgeler dekoratiftir; anlamı yanındaki metin veya kapsayıcının erişilebilirlik etiketi taşır.
  return <Ionicons name={name} size={size} color={color} style={style} accessible={false} importantForAccessibility="no" />;
}
