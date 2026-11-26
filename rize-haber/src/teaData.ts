/**
 * Çay fiyatı verisini yükler: önce uygulamaya gömülü kopya, sonra son indirilen kopya,
 * en son da depodaki güncel `data/cay.json`. En yeni ve geçerli olan gösterilir.
 *
 * Fiyat değiştiğinde yalnızca `rize-haber/data/cay.json` güncellenip varsayılan dala
 * birleştirilir; kullanıcıların yeni APK kurmasına gerek kalmaz.
 */
import bundledJson from '../data/cay.json';
import { requestJson } from './net';
import { loadCachedTeaData, saveCachedTeaData } from './storage';
import { newerTeaData, parseTeaData, type TeaData } from './tea';

export const TEA_DATA_URL =
  'https://raw.githubusercontent.com/KidManDesignOfficial/KidManDesignOfficial/HEAD/rize-haber/data/cay.json';

export const BUNDLED_TEA_DATA = parseTeaData(bundledJson) as TeaData;

/** Gömülü ve önbellekteki veriden en yenisi (ağ beklemeden, anında gösterilir). */
export async function loadLocalTeaData(): Promise<TeaData> {
  const cached = parseTeaData(await loadCachedTeaData());
  return newerTeaData(BUNDLED_TEA_DATA, cached) ?? BUNDLED_TEA_DATA;
}

/** Depodaki güncel veriyi indirir; geçersizse veya ulaşılamazsa `null`. */
export async function fetchRemoteTeaData(signal?: AbortSignal): Promise<TeaData | null> {
  try {
    const data = parseTeaData(await requestJson(TEA_DATA_URL, { signal, headers: { 'Cache-Control': 'no-cache' } }));
    if (data) await saveCachedTeaData(data);
    return data;
  } catch {
    return null;
  }
}
