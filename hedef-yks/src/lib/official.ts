/**
 * Resmi kaynaklara ait canlı veri kancaları ve bağlantı açıcı.
 */
import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

import { OSYM_PAGES } from '../data/sources';
import { latestTytDate, parseAnnouncements, parseCalendar, parsePaperYears, parsePapers } from './osym';
import { useLive } from './live';

const HOUR = 60 * 60 * 1000;

export const useYksAnnouncements = () => useLive('osym-yks', OSYM_PAGES.yksAnnouncements, parseAnnouncements, 30 * 60 * 1000);
export const useCalendar = () => useLive('osym-takvim', OSYM_PAGES.calendar, parseCalendar, 6 * HOUR);
export const usePaperYears = () => useLive('osym-kitapcik-yillar', OSYM_PAGES.pastPapers, parsePaperYears, 24 * HOUR);
export const usePapers = (url: string | null) => useLive(`osym-kitapcik:${url}`, url, parsePapers, 7 * 24 * HOUR);

export type ExamTarget = { date: Date; official: boolean; year: number | null };

/**
 * Geri sayım hedefi: ÖSYM takviminde gelecekte bir TYT tarihi varsa o (resmî), yoksa kullanıcının
 * ayarladığı / varsayılan tahmini tarih.
 */
export function examTarget(rows: ReturnType<typeof parseCalendar> | null, fallback: Date, now = new Date()): ExamTarget {
  const t = rows ? latestTytDate(rows) : null;
  if (t) {
    const [y, m, d] = t.iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) return { date, official: true, year: t.year };
  }
  return { date: fallback, official: false, year: null };
}

/** Resmi sayfayı uygulama içi tarayıcıda açar (PDF'ler de bu yolla görüntülenir). */
export async function openOfficial(url: string, color = '#3A2BC9'): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.open?.(url, '_blank');
      return;
    }
    await WebBrowser.openBrowserAsync(url, { toolbarColor: color, controlsColor: '#FFFFFF', showTitle: true, enableBarCollapsing: true });
  } catch {
    Linking.openURL(url).catch(() => {});
  }
}
