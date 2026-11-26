/**
 * Rize Haber ana ekran widget'ları ve uygulama kısayolları (yalnızca Android).
 *
 * Yerel modül yoksa (web önizlemesi, iOS, eski geliştirme derlemesi) tüm işlevler sessizce boş döner;
 * uygulama widget'sız çalışmaya devam eder.
 */
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

import type { WidgetKind } from '../../src/widgets/snapshot';

type NativeRizeWidgets = {
  setSnapshot(json: string): Promise<void>;
  getInstalled(): Partial<Record<WidgetKind, number>>;
  canRequestPin(): boolean;
  requestPin(kind: WidgetKind): boolean;
  publishShortcuts(): number;
};

const native = Platform.OS === 'android' ? requireOptionalNativeModule<NativeRizeWidgets>('RizeWidgets') : null;

/** Bu cihazda widget desteği var mı (Android + yerel modül). */
export const widgetsAvailable = native != null;

export async function setWidgetSnapshot(json: string): Promise<void> {
  await native?.setSnapshot(json);
}

/** Ana ekrandaki widget sayıları; desteklenmiyorsa boş. */
export function installedWidgets(): Partial<Record<WidgetKind, number>> {
  try {
    return native?.getInstalled() ?? {};
  } catch {
    return {};
  }
}

/** Başlatıcı "Ana ekrana ekle" penceresini destekliyor mu (Android 8+). */
export function canPinWidget(): boolean {
  try {
    return native?.canRequestPin() ?? false;
  } catch {
    return false;
  }
}

/** Sistem penceresini açar; kullanıcı onaylarsa widget ana ekrana eklenir. Pencere açıldıysa `true`. */
export function pinWidget(kind: WidgetKind): boolean {
  try {
    return native?.requestPin(kind) ?? false;
  } catch {
    return false;
  }
}

/** Uygulama simgesine basılı tutunca açılan kısayolları yayımlar. */
export function publishShortcuts(): number {
  try {
    return native?.publishShortcuts() ?? 0;
  } catch {
    return 0;
  }
}
