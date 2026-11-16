/** Maç hatırlatmalarının zamanlama hesabı (yan etkisiz; Node ile test edilir). */
import type { Match } from './parse.ts';

export const REMINDER_MINUTES = 30;
export const MAX_REMINDERS = 4;

export function reminderText(m: Match): { title: string; body: string } {
  const where = m.venue ? ` · ${m.venue}` : '';
  return {
    title: '🍵 Çayını demle, maç başlıyor!',
    body: `${m.home.name} – ${m.away.name} maçı ${REMINDER_MINUTES} dakika sonra başlıyor${where}.`,
  };
}

/** Hatırlatma zamanı geçmemiş, başlamamış en yakın maçlar. Yan etkisiz; test edilir. */
export function upcomingForReminders(fixtures: Match[], now: number, max = MAX_REMINDERS): { match: Match; at: Date }[] {
  return fixtures
    .filter((m) => m.state === 'pre' && m.status === '')
    .map((m) => ({ match: m, at: new Date(m.date.getTime() - REMINDER_MINUTES * 60_000) }))
    .filter(({ at }) => at.getTime() > now + 60_000)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, max);
}

