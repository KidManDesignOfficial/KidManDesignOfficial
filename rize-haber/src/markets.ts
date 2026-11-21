/**
 * Piyasa verileri: TCMB gösterge döviz kurları ve ons altın fiyatı.
 * Ayrıştırma ve hesaplar yan etkisizdir; Node ile doğrudan test edilir.
 *
 * Kaynaklar (anahtar gerektirmez):
 * - TCMB "today.xml": resmî gösterge kurlar; iş günlerinde ~15:30'da yayımlanır.
 * - gold-api.com: anlık ons altın (USD). Gram altın, ons ve TCMB dolar kurundan hesaplanır.
 */
import { XMLParser } from 'fast-xml-parser';

import { formatNumber } from './tea.ts';

export const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml';
export const GOLD_URL = 'https://api.gold-api.com/price/XAU';
/** 1 troy ons = 31,1034768 gram. */
export const GRAMS_PER_OUNCE = 31.1034768;

/** Ekranda gösterilecek dövizler (sırasıyla). Rize turizmi için Körfez ve Rus ziyaretçilerin para birimleri de var. */
export const CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'ABD Doları' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'İngiliz Sterlini' },
  { code: 'CHF', name: 'İsviçre Frangı' },
  { code: 'SAR', name: 'Suudi Riyali' },
  { code: 'RUB', name: 'Rus Rublesi' },
  { code: 'GEL', name: 'Gürcü Larisi' },
];

export type Rate = {
  code: string;
  name: string;
  /** 1 birim döviz kaç TL (TCMB birimi 100 olan dövizlerde 1 birime çevrilmiş). */
  buying: number;
  selling: number;
};

export type Markets = {
  /** TCMB bülten tarihi, "2026-11-21". */
  date: string | null;
  rates: Rate[];
  /** Ons altın, USD. */
  ounceUsd: number | null;
  fetchedAt: number;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  isArray: (name) => name === 'Currency',
});

function num(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  // TCMB nokta kullanır; virgüllü gelirse de anla.
  const n = Number(value.trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "11/21/2026" → "2026-11-21" */
function isoFromUs(date: unknown): string | null {
  if (typeof date !== 'string') return null;
  const m = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
}

/** TCMB today.xml → kurlar (yalnızca CURRENCIES listesindekiler, o sırayla). */
export function parseTcmb(xml: string): { date: string | null; rates: Rate[] } {
  const doc = parser.parse(xml) as Record<string, unknown>;
  const root = doc.Tarih_Date as Record<string, unknown> | undefined;
  if (!root) throw new Error('Kur verisi okunamadı.');
  const list = (root.Currency as Record<string, unknown>[] | undefined) ?? [];

  const byCode = new Map<string, Rate>();
  for (const c of list) {
    const code = (c['@_CurrencyCode'] ?? c['@_Kod']) as string | undefined;
    if (!code) continue;
    const unit = num(c.Unit) ?? 1;
    // Efektif yoksa döviz kuru kullanılır (bazı dövizlerde efektif alanı boştur).
    const buying = num(c.ForexBuying) ?? num(c.BanknoteBuying);
    const selling = num(c.ForexSelling) ?? num(c.BanknoteSelling);
    if (buying === null || selling === null) continue;
    byCode.set(code, { code, name: '', buying: buying / unit, selling: selling / unit });
  }

  const rates = CURRENCIES.flatMap(({ code, name }) => {
    const r = byCode.get(code);
    return r ? [{ ...r, name }] : [];
  });
  if (rates.length === 0) throw new Error('Kur verisi okunamadı.');
  return { date: isoFromUs(root['@_Date']), rates };
}

/** gold-api.com yanıtı → ons fiyatı (USD). Beklenmeyen yanıtta null. */
export function parseGold(json: unknown): number | null {
  if (!json || typeof json !== 'object') return null;
  const price = num((json as Record<string, unknown>).price);
  // Akla yatkın aralık dışındaysa (hatalı yanıt) gösterme.
  return price !== null && price > 100 && price < 100_000 ? price : null;
}

/** Gram altın (TL) = ons (USD) × dolar satış ÷ 31,1035. */
export function gramGoldTry(ounceUsd: number | null, rates: Rate[]): number | null {
  const usd = rates.find((r) => r.code === 'USD');
  if (!ounceUsd || !usd) return null;
  return (ounceUsd * usd.selling) / GRAMS_PER_OUNCE;
}

/** TL ↔ döviz çevirisi. `toTry`: döviz → TL (alış), değilse TL → döviz (satış). */
export function convert(amount: number, rate: Rate, toTry: boolean): number {
  return toTry ? amount * rate.buying : amount / rate.selling;
}

async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal, headers: { Accept: '*/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Kurlar zorunludur; altın gelmezse sayfa yine kurlarla açılır. */
export async function fetchMarkets(signal?: AbortSignal): Promise<Markets> {
  const [tcmb, gold] = await Promise.all([
    fetchText(TCMB_URL, signal),
    fetchText(GOLD_URL, signal)
      .then((t) => parseGold(JSON.parse(t)))
      .catch(() => null),
  ]);
  const { date, rates } = parseTcmb(tcmb);
  return { date, rates, ounceUsd: gold, fetchedAt: Date.now() };
}

/** 41,2345 → "41,23" ; küçük değerlerde 4 hane. */
export function formatRate(n: number): string {
  return formatNumber(n, n < 1 ? 4 : 2);
}
