/**
 * Maç hatırlatmaları ("Çayını demle!") ve skor bildirimleri.
 *
 * Hatırlatmalar, fikstürdeki yaklaşan maçlar için başlama saatinden 30 dakika önceye telefonda
 * zamanlanır; sunucu gerekmez. Fikstür her yenilendiğinde eski hatırlatmalar silinip yeniden kurulur
 * (saat değişikliği veya erteleme yakalanır).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { fetchFixtures } from './api';
import type { Match } from './parse';
import { reminderText as reminderTextFor, upcomingForReminders } from './schedule';

export { REMINDER_MINUTES, reminderText, upcomingForReminders } from './schedule';

const REMINDER_PREFIX = 'mac-hatirlatma-';
export const MATCH_CHANNEL = 'rizespor-mac';

const KEYS = {
  reminders: 'rizehaber:rizespor:reminders:v1',
  scoreAlerts: 'rizehaber:rizespor:scoreAlerts:v1',
  lastScores: 'rizehaber:rizespor:lastScores:v1',
};

export async function getMatchSettings(): Promise<{ reminders: boolean; scoreAlerts: boolean }> {
  try {
    const [r, s] = await Promise.all([AsyncStorage.getItem(KEYS.reminders), AsyncStorage.getItem(KEYS.scoreAlerts)]);
    return { reminders: r === 'true', scoreAlerts: s === 'true' };
  } catch {
    return { reminders: false, scoreAlerts: false };
  }
}

export async function setMatchSetting(key: 'reminders' | 'scoreAlerts', value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS[key], String(value));
  } catch {
    // yok say
  }
}

export async function ensureMatchChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(MATCH_CHANNEL, {
    name: 'Rizespor maçları',
    description: 'Maç hatırlatmaları ve skor bildirimleri.',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Bildirim izni: varsa true; yoksa ister. */
export async function ensurePermission(): Promise<boolean> {
  let p = await Notifications.getPermissionsAsync();
  if (!p.granted) p = await Notifications.requestPermissionsAsync();
  return p.granted;
}

/** Mevcut hatırlatmaları silip fikstüre göre yeniden kurar. Ayar kapalıysa yalnızca siler. */
export async function syncMatchReminders(fixtures: Match[]): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(REMINDER_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  const { reminders } = await getMatchSettings();
  if (!reminders) return 0;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return 0;

  await ensureMatchChannel();
  const items = upcomingForReminders(fixtures, Date.now());
  for (const { match, at } of items) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_PREFIX}${match.id}`,
      content: { ...reminderTextFor(match), data: { screen: 'rizespor', matchId: match.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: MATCH_CHANNEL },
    });
  }
  return items.length;
}

/**
 * Arka plan görevinde çağrılır: hatırlatmaları tazeler ve canlı maçta skor değiştiyse bildirir.
 * Arka plan görevi en sık ~15–30 dakikada bir çalıştığı için skor bildirimi gecikmeli olabilir.
 */
export async function rizesporBackgroundCheck(): Promise<void> {
  const fixtures = await fetchFixtures();
  await syncMatchReminders(fixtures);

  const { scoreAlerts } = await getMatchSettings();
  if (!scoreAlerts) return;

  let last: Record<string, string> = {};
  try {
    last = JSON.parse((await AsyncStorage.getItem(KEYS.lastScores)) ?? '{}');
  } catch {
    last = {};
  }
  const recent = fixtures.filter((m) => m.state !== 'pre' && Date.now() - m.date.getTime() < 4 * 3600_000);
  for (const m of recent) {
    const score = `${m.homeScore ?? 0}-${m.awayScore ?? 0}`;
    const key = `${m.id}:${m.state}`;
    if (last[m.id] === `${score}|${m.state}`) continue;
    const isNewScore = last[m.id] !== undefined && last[m.id].split('|')[0] !== score;
    const finished = m.state === 'post';
    if (isNewScore || finished || last[m.id] === undefined) {
      await ensureMatchChannel();
      await Notifications.scheduleNotificationAsync({
        identifier: `skor-${key}-${score}`,
        content: {
          title: finished ? '🏁 Maç sona erdi' : isNewScore ? '⚽ GOOOL!' : '🟢 Maç başladı',
          body: `${m.home.name} ${score.replace('-', ' – ')} ${m.away.name}${!finished && m.status ? ` (${m.status})` : ''}`,
          data: { screen: 'rizespor', matchId: m.id },
        },
        trigger: Platform.OS === 'android' ? { channelId: MATCH_CHANNEL } : null,
      });
    }
    last[m.id] = `${score}|${m.state}`;
  }
  try {
    await AsyncStorage.setItem(KEYS.lastScores, JSON.stringify(last));
  } catch {
    // yok say
  }
}
