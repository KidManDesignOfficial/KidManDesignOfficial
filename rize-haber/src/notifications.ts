/**
 * Yeni haber bildirimleri (sunucusuz).
 *
 * Android, uygulama kapalıyken bile bu görevi ~30 dakikada bir çalıştırır (kesin zamanı sistem
 * belirler; pil tasarrufu modunda gecikebilir). Görev "Tümü" beslemesini çeker, daha önce
 * görülmemiş ve son 6 saatte yayımlanmış haberler için yerel bildirim gösterir.
 *
 * ÖNEMLİ: Bu dosya index.ts içinde, uygulama başlarken içe aktarılır; `defineTask`
 * küresel kapsamda çağrılmak zorundadır.
 */
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { NEWS_CATEGORIES, googleNewsRssUrl } from './config';
import { diffNews } from './newsDiff';
import { fetchRss } from './rss';
import {
  clearSeenIds,
  loadSeenIds,
  saveNotificationsEnabled,
  saveSeenIds,
} from './storage';

export const NEWS_TASK = 'rize-haber-yeni-haber-kontrolu';
const CHANNEL_ID = 'yeni-haberler';
const CHECK_INTERVAL_MINUTES = 30;
/** Tek seferde en fazla bu kadar ayrı bildirim; fazlası tek özet bildirimde toplanır. */
const MAX_INDIVIDUAL = 3;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Yeni haberleri kontrol eder ve gerekirse bildirim gösterir. Bildirilen haber sayısını döner. */
export async function checkForNewNews(): Promise<number> {
  const items = await fetchRss(googleNewsRssUrl(NEWS_CATEGORIES[0].query));
  const { fresh, seenIds } = diffNews(items, await loadSeenIds());
  await saveSeenIds(seenIds);

  if (fresh.length === 0) return 0;

  if (fresh.length > MAX_INDIVIDUAL) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${fresh.length} yeni Rize haberi`,
        body: fresh
          .slice(0, 3)
          .map((i) => `• ${i.title}`)
          .join('\n'),
        data: { screen: 'news' },
      },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
  } else {
    for (const item of fresh) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.source ? `${item.source} · Rize Haber` : 'Rize Haber',
          data: { url: item.link },
        },
        trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
      });
    }
  }
  return fresh.length;
}

TaskManager.defineTask(NEWS_TASK, async () => {
  try {
    await checkForNewNews();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export type EnableResult = 'enabled' | 'permission-denied' | 'unavailable';

export async function enableNewsNotifications(): Promise<EnableResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Yeni haberler',
      description: 'Rize ile ilgili yeni haberler yayımlandığında bildirir.',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return 'permission-denied';

  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return 'unavailable';

  await BackgroundTask.registerTaskAsync(NEWS_TASK, { minimumInterval: CHECK_INTERVAL_MINUTES });
  await saveNotificationsEnabled(true);

  // Şu anki haberleri "görüldü" say; böylece ilk bildirim gerçekten yeni bir haber için gelir.
  await clearSeenIds();
  checkForNewNews().catch(() => {});
  return 'enabled';
}

export async function disableNewsNotifications(): Promise<void> {
  await saveNotificationsEnabled(false);
  if (await TaskManager.isTaskRegisteredAsync(NEWS_TASK)) {
    await BackgroundTask.unregisterTaskAsync(NEWS_TASK);
  }
}
