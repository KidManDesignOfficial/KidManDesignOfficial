/**
 * Yeni haber bildirimleri (sunucusuz).
 *
 * Android, uygulama kapalıyken bile bu görevi ~30 dakikada bir çalıştırır (kesin zamanı sistem
 * belirler; pil tasarrufu modunda gecikebilir). Görev "Tümü" beslemesini çeker, daha önce
 * görülmemiş ve son 6 saatte yayımlanmış haberler için yerel bildirim gösterir. Ana ekranda
 * widget varsa aynı görev widget verisini de tazeler (src/widgets/sync.ts).
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
import { fetchFixtures } from './rizespor/api';
import {
  ensureMatchChannel,
  ensurePermission,
  getMatchSettings,
  rizesporBackgroundCheck,
  setMatchSetting,
  syncMatchReminders,
} from './rizespor/reminders';
import { saveCachedNews } from './offline';
import { fetchRss, keepRelevant } from './rss';
import {
  clearSeenIds,
  loadNotificationsEnabled,
  loadSeenIds,
  saveNotificationsEnabled,
  saveSeenIds,
} from './storage';
import { placedWidgets, refreshWidgetData } from './widgets/sync';

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
  // Arka plan görevinin süresi kısıtlıdır: tek deneme, 20 sn sınır.
  const items = keepRelevant(await fetchRss(googleNewsRssUrl(NEWS_CATEGORIES[0].query), undefined, { retries: 0, timeoutMs: 20_000 }));
  // İndirilen liste önbelleğe de yazılır: uygulama güncel haberlerle açılır, widget aynı veriyi kullanır.
  await saveCachedNews(NEWS_CATEGORIES[0].id, items);
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

/** Görev; haber bildirimi, Rizespor özellikleri ve widget'lardan açık olanları sırayla çalıştırır. */
TaskManager.defineTask(NEWS_TASK, async () => {
  let failed = false;
  let newsFetched = false;
  if (await loadNotificationsEnabled()) {
    await checkForNewNews()
      .then(() => {
        newsFetched = true;
      })
      .catch(() => {
        failed = true;
      });
  }
  const match = await getMatchSettings();
  if (match.reminders || match.scoreAlerts) {
    await rizesporBackgroundCheck().catch(() => {
      failed = true;
    });
  }
  // Widget yoksa hiçbir şey indirilmez (pil ve veri harcanmaz).
  await refreshWidgetData({ news: newsFetched }).catch(() => {
    failed = true;
  });
  return failed ? BackgroundTask.BackgroundTaskResult.Failed : BackgroundTask.BackgroundTaskResult.Success;
});

export type EnableResult = 'enabled' | 'permission-denied' | 'unavailable';

/**
 * Herhangi bir arka plan özelliği açıksa (ya da ana ekranda widget varsa) görevi kaydeder; hepsi
 * kapalıysa kaldırır. Uygulama açılışında ve arka plana geçerken de çağrılır: kullanıcı widget'ı
 * başlatıcıdan eklediğinde uygulama bunu ancak bir sonraki açılışta öğrenebilir.
 */
export async function refreshBackgroundTask(): Promise<'ok' | 'unavailable'> {
  const match = await getMatchSettings();
  const needed = (await loadNotificationsEnabled()) || match.reminders || match.scoreAlerts || placedWidgets().size > 0;
  const registered = await TaskManager.isTaskRegisteredAsync(NEWS_TASK);
  if (!needed) {
    if (registered) await BackgroundTask.unregisterTaskAsync(NEWS_TASK);
    return 'ok';
  }
  if (registered) return 'ok';
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return 'unavailable';
  await BackgroundTask.registerTaskAsync(NEWS_TASK, { minimumInterval: CHECK_INTERVAL_MINUTES });
  return 'ok';
}

export async function enableNewsNotifications(): Promise<EnableResult> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Yeni haberler',
      description: 'Rize ile ilgili yeni haberler yayımlandığında bildirir.',
      // eslint-disable-next-line import/namespace -- `export *` zinciriyle çalışma anında mevcut (doğrulandı)
    importance: Notifications.AndroidImportance.HIGH,
    });
  }
  if (!(await ensurePermission())) return 'permission-denied';

  await saveNotificationsEnabled(true);
  if ((await refreshBackgroundTask()) === 'unavailable') {
    await saveNotificationsEnabled(false);
    return 'unavailable';
  }
  // Şu anki haberleri "görüldü" say; böylece ilk bildirim gerçekten yeni bir haber için gelir.
  await clearSeenIds();
  checkForNewNews().catch(() => {});
  return 'enabled';
}

export async function disableNewsNotifications(): Promise<void> {
  await saveNotificationsEnabled(false);
  await refreshBackgroundTask();
}

/** Maç hatırlatması / skor bildirimi aç-kapat. Hatırlatmalar hemen kurulur ya da silinir. */
export async function setMatchFeature(key: 'reminders' | 'scoreAlerts', enabled: boolean): Promise<EnableResult> {
  if (enabled) {
    await ensureMatchChannel();
    if (!(await ensurePermission())) return 'permission-denied';
  }
  await setMatchSetting(key, enabled);
  const bg = await refreshBackgroundTask();
  if (key === 'reminders') {
    const fixtures = await fetchFixtures().catch(() => null);
    if (fixtures) await syncMatchReminders(fixtures);
    else if (!enabled) await syncMatchReminders([]);
  }
  // Hatırlatmalar arka plan görevi olmadan da çalışır; skor bildirimi ise göreve muhtaçtır.
  if (enabled && key === 'scoreAlerts' && bg === 'unavailable') {
    await setMatchSetting(key, false);
    return 'unavailable';
  }
  return 'enabled';
}
