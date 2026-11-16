/**
 * Dokunsal geri bildirim. Çok hafif tutulur; desteklenmeyen cihazda veya web'de sessizce geçer.
 * - tapFeedback: sekme / seçim değişimi
 * - pressFeedback: kaydet, listeye ekle, hatırlatma gibi eylemler
 * - successFeedback: gol, başarıyla açılan bildirim
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let on = true;
/** Ayarlardan titreşim kapatılabilir. */
export function setHapticsEnabled(v: boolean): void {
  on = v;
}

const enabled = Platform.OS === 'android' || Platform.OS === 'ios';

export function tapFeedback(): void {
  if (enabled && on) Haptics.selectionAsync().catch(() => {});
}

export function pressFeedback(): void {
  if (enabled && on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function errorFeedback(): void {
  if (enabled && on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

export function successFeedback(): void {
  if (enabled && on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
