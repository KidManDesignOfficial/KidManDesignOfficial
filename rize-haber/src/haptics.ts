/**
 * Dokunsal geri bildirim. Çok hafif tutulur; desteklenmeyen cihazda veya web'de sessizce geçer.
 * - tapFeedback: sekme / seçim değişimi
 * - pressFeedback: kaydet, listeye ekle, hatırlatma gibi eylemler
 * - successFeedback: gol, başarıyla açılan bildirim
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const supported = Platform.OS === 'android' || Platform.OS === 'ios';
let enabled = supported;

/** Ayarlar'daki "Titreşim" anahtarı; tema sağlayıcısı ayar değişince çağırır. */
export function setHapticsEnabled(on: boolean): void {
  enabled = supported && on;
}

export function tapFeedback(): void {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}

export function pressFeedback(): void {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successFeedback(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
