/**
 * Rizespor verisinin ağdan alınması ve telefonda önbelleğe yazılması.
 *
 * Kaynak: ESPN'in herkese açık ama belgelenmemiş veri adresleri (Süper Lig = "tur.1",
 * Çaykur Rizespor = 7656). Kaynak değişirse yalnızca bu dosya ve `parse.ts` güncellenir.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RIZESPOR_ID } from './names';
import { parseRoster, parseSchedule, parseStandings, parseSummary, type Match, type MatchDetail, type Player, type StandingRow } from './parse';

const SITE = 'https://site.web.api.espn.com/apis/site/v2/sports/soccer/tur.1';
const QUERY = 'region=tr&lang=tr';
const TIMEOUT_MS = 12_000;

export const RIZESPOR_URLS = {
  results: `${SITE}/teams/${RIZESPOR_ID}/schedule?${QUERY}`,
  fixtures: `${SITE}/teams/${RIZESPOR_ID}/schedule?fixture=true&${QUERY}`,
  roster: `${SITE}/teams/${RIZESPOR_ID}/roster?${QUERY}`,
  standings: `https://site.web.api.espn.com/apis/v2/sports/soccer/tur.1/standings?${QUERY}`,
  summary: (eventId: string) => `${SITE}/summary?event=${encodeURIComponent(eventId)}&${QUERY}`,
};

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

const CACHE_PREFIX = 'rizehaber:rizespor:v1:';

async function cached<T>(key: string, url: string, parse: (json: unknown) => T, signal?: AbortSignal): Promise<T> {
  const json = await fetchJson(url, signal);
  const parsed = parse(json);
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(json));
  } catch {
    // önbellek yazılamazsa veri yine gösterilir
  }
  return parsed;
}

async function fromCache<T>(key: string, parse: (json: unknown) => T): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    return raw ? parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export type ClubData = {
  results: Match[];
  fixtures: Match[];
  standings: StandingRow[];
  roster: Player[];
};


/** Önbellekteki son veriler (çevrimdışı açılış ve anında gösterim için). */
export async function loadCachedClubData(): Promise<ClubData> {
  const [results, fixtures, standings, roster] = await Promise.all([
    fromCache('results', parseSchedule),
    fromCache('fixtures', parseSchedule),
    fromCache('standings', parseStandings),
    fromCache('roster', parseRoster),
  ]);
  return {
    results: results ?? [],
    fixtures: fixtures ?? [],
    standings: standings ?? [],
    roster: roster ?? [],
  };
}

/**
 * Tüm verileri paralel çeker. Bir kaynak başarısız olsa bile diğerleri gelir; başarısız olanlar
 * sonuçta yer almaz (çağıran önceki değeri korur — bkz. mergeClubData). Hiçbiri gelmezse hata fırlatır.
 */
export async function fetchClubData(signal?: AbortSignal): Promise<Partial<ClubData>> {
  const settled = await Promise.allSettled([
    cached('results', RIZESPOR_URLS.results, parseSchedule, signal),
    cached('fixtures', RIZESPOR_URLS.fixtures, parseSchedule, signal),
    cached('standings', RIZESPOR_URLS.standings, parseStandings, signal),
    cached('roster', RIZESPOR_URLS.roster, parseRoster, signal),
  ]);
  if (settled.every((s) => s.status === 'rejected')) {
    throw new Error('Rizespor verisi alınamadı. İnternet bağlantınızı kontrol edin.');
  }
  const pick = <T,>(i: number): T | undefined => {
    const s = settled[i];
    return s.status === 'fulfilled' ? (s.value as T) : undefined;
  };
  const out: Partial<ClubData> = {};
  const results = pick<Match[]>(0);
  const fixtures = pick<Match[]>(1);
  const standings = pick<StandingRow[]>(2);
  const roster = pick<Player[]>(3);
  if (results) out.results = results;
  if (fixtures) out.fixtures = fixtures;
  if (standings) out.standings = standings;
  if (roster) out.roster = roster;
  return out;
}

/** Yeni gelen parçaları öncekinin üzerine yazar; gelmeyenler (başarısız istekler) korunur. */
export function mergeClubData(previous: ClubData, fresh: Partial<ClubData>): ClubData {
  return { ...previous, ...fresh };
}

/** Yalnızca fikstür (arka plan görevi ve hatırlatmalar için hafif istek). */
export async function fetchFixtures(signal?: AbortSignal): Promise<Match[]> {
  return cached('fixtures', RIZESPOR_URLS.fixtures, parseSchedule, signal);
}

export async function fetchMatchDetail(eventId: string, signal?: AbortSignal): Promise<MatchDetail> {
  const detail = parseSummary(await fetchJson(RIZESPOR_URLS.summary(eventId), signal), eventId);
  if (!detail) throw new Error('Maç ayrıntısı okunamadı.');
  return detail;
}

/** Sıradaki maç: canlı olan varsa o, yoksa başlamamış en yakın maç. */
export function nextMatch(data: ClubData, now = Date.now()): Match | null {
  const all = [...data.fixtures, ...data.results];
  const live = all.find((m) => m.state === 'in');
  if (live) return live;
  return data.fixtures.find((m) => m.state === 'pre' && m.date.getTime() > now - 3 * 3600_000) ?? null;
}

/** Son oynanan maçlar (yeniden eskiye). */
export function latestResults(data: ClubData): Match[] {
  const byId = new Map<string, Match>();
  for (const m of [...data.results, ...data.fixtures]) if (m.state === 'post') byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}
