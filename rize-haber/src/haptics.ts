/**
 * Dokunsal geri bildirim. Çok hafif tutulur; desteklenmeyen cihazda veya web'de sessizce geçer.
 * - tapFeedback: sekme / seçim değişimi
 * - pressFeedback: kaydet, listeye ekle, hatırlatma gibi eylemler
 * - successFeedback: başarıyla açılan bildirim
 * - goalFeedback / alertFeedback: canlı maçta gol ve önemli anlar
 */
import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

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

/** Rizespor golü: belirgin, ritmik titreşim (Ayarlar'da titreşim kapalıysa sessiz). */
export function goalFeedback(): void {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  Vibration.vibrate([0, 90, 70, 160, 70, 220]);
}

/** Kırmızı kart, maç sonu gibi önemli ama kutlama olmayan anlar. */
export function alertFeedback(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
