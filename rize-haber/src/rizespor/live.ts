/**
 * Canlı maç takibi: ne zaman, ne sıklıkla yenileneceği; iki yenileme arasında ilerleyen maç saati;
 * gol, başlama, devre arası ve maç sonu anlarının yakalanması. Saf modüldür (yan etkisiz, test edilir).
 *
 * Eski davranıştaki hata: yenileme yalnızca önbellekte zaten "canlı" görünen bir maç varsa başlıyordu.
 * Uygulama maçtan önce açıldıysa maç "başlamadı" olarak kalıyor, skor hiç güncellenmiyordu. Artık
 * başlama saatinden 15 dakika önce "maç penceresi" açılır ve maç bitene kadar sık yenileme yapılır.
 */
import { RIZESPOR_ID } from './names.ts';
import type { Match } from './parse.ts';

/** Başlama saatinden ne kadar önce sık yenilemeye geçilir. */
export const WINDOW_BEFORE_MS = 15 * 60_000;
/** Başlama saatinden en çok ne kadar sonrasına kadar maç "sürüyor olabilir" sayılır (uzatmalar dahil). */
export const WINDOW_AFTER_MS = 150 * 60_000;
/** Maç penceresinde yenileme aralığı. */
export const LIVE_POLL_MS = 20_000;
/** Maça 3 saatten az kala (kadrolar, saat değişikliği) yenileme aralığı. */
export const SOON_POLL_MS = 5 * 60_000;
/** İki yenileme arasında saat en fazla bu kadar ileri sarılır (bağlantı koparsa saat kaçmasın). */
const MAX_EXTRAPOLATE_MS = 4 * 60_000;

const NOT_PLAYED = new Set(['Ertelendi', 'İptal']);

/** Maç şu an oynanıyor ya da birkaç dakika içinde başlayacak (veya sonucu henüz kesinleşmedi). */
export function inMatchWindow(m: Match, now = Date.now()): boolean {
  if (m.state === 'in') return true;
  if (m.state !== 'pre' || NOT_PLAYED.has(m.status)) return false;
  const t = m.date.getTime();
  return now >= t - WINDOW_BEFORE_MS && now <= t + WINDOW_AFTER_MS;
}

/** Bir sonraki yenilemeye kadar beklenecek süre; yenileme gerekmiyorsa null. */
export function pollDelay(matches: Match[], now = Date.now()): number | null {
  if (matches.some((m) => inMatchWindow(m, now))) return LIVE_POLL_MS;
  const soon = matches.some((m) => m.state === 'pre' && !NOT_PLAYED.has(m.status) && m.date.getTime() - now < 3 * 3600_000 && m.date.getTime() > now);
  return soon ? SOON_POLL_MS : null;
}

/** Başlama saati geçmiş ama kaynak henüz "başladı" dememiş maç. */
export function awaitingKickoff(m: Match, now = Date.now()): boolean {
  return m.state === 'pre' && !NOT_PLAYED.has(m.status) && now >= m.date.getTime() && inMatchWindow(m, now);
}

const PERIOD_CAP: Record<number, number> = { 1: 45, 2: 90, 3: 105, 4: 120 };

/**
 * Ekranda gösterilecek dakika. Saat işliyorsa son yenilemeden bu yana geçen süre eklenir:
 * "67'" → bir dakika sonra "68'"; normal süre dolduysa "90'+3'" biçimi.
 */
export function liveMinute(m: Match, elapsedMs: number): string {
  if (m.state !== 'in' || !m.running || m.clockSec === null) return m.status;
  const sec = m.clockSec + Math.min(Math.max(elapsedMs, 0), MAX_EXTRAPOLATE_MS) / 1000;
  const minute = Math.max(1, Math.ceil(sec / 60));
  const plus = /^(\d+)'\s*\+/.exec(m.status);
  const cap = plus ? Number(plus[1]) : (PERIOD_CAP[m.period ?? 0] ?? (minute > 45 ? 90 : 45));
  return minute <= cap ? `${minute}'` : `${cap}'+${minute - cap}'`;
}

/** 0–1 arası maç ilerlemesi (ilerleme çubuğu için; uzatmalar 1'de durur). */
export function matchProgress(m: Match, elapsedMs: number): number {
  if (m.state === 'post') return 1;
  if (m.state !== 'in') return 0;
  if (!m.running) return m.status === 'Devre arası' ? 0.5 : Math.min(1, (m.clockSec ?? 0) / 5400);
  const sec = (m.clockSec ?? 0) + Math.min(Math.max(elapsedMs, 0), MAX_EXTRAPOLATE_MS) / 1000;
  return Math.min(1, Math.max(0, sec / 5400));
}

export type LiveMoment =
  | { kind: 'goal'; match: Match; side: 'home' | 'away'; us: boolean }
  | { kind: 'kickoff' | 'halftime' | 'secondHalf' | 'fulltime'; match: Match };

const involvesUs = (m: Match) => m.home.id === RIZESPOR_ID || m.away.id === RIZESPOR_ID;

/**
 * Önceki ve yeni maç listesini karşılaştırıp Rizespor maçındaki önemli anları döndürür.
 * Yalnızca iki listede de bulunan maçlar karşılaştırılır (ilk yüklemede kutlama yapılmaz).
 */
export function detectMoments(prev: Match[], next: Match[]): LiveMoment[] {
  const before = new Map(prev.map((m) => [m.id, m]));
  const out: LiveMoment[] = [];
  for (const m of next) {
    const p = before.get(m.id);
    if (!p || !involvesUs(m)) continue;
    if (p.state === 'pre' && m.state === 'in') out.push({ kind: 'kickoff', match: m });
    if (p.state !== 'post' && m.state === 'post') out.push({ kind: 'fulltime', match: m });
    if (m.state === 'in' && p.status !== 'Devre arası' && m.status === 'Devre arası') out.push({ kind: 'halftime', match: m });
    if (m.state === 'in' && p.status === 'Devre arası' && m.status !== 'Devre arası') out.push({ kind: 'secondHalf', match: m });
    const goals = (side: 'home' | 'away') => {
      const a = (side === 'home' ? p.homeScore : p.awayScore) ?? 0;
      const b = (side === 'home' ? m.homeScore : m.awayScore) ?? 0;
      for (let i = a; i < b; i++) out.push({ kind: 'goal', match: m, side, us: (side === 'home' ? m.home.id : m.away.id) === RIZESPOR_ID });
    };
    if (m.state !== 'pre') {
      goals('home');
      goals('away');
    }
  }
  return out;
}

/** Skor tablosundaki (daha taze) maçları kulüp listelerine işler; aynı kimlikli kayıtlar değişir, listelerde
 * hiç olmayan Rizespor maçı fikstüre eklenir. Diğer takımların maçları listelere girmez. */
export function applyLive<T extends { fixtures: Match[]; results: Match[] }>(data: T, live: Match[]): T {
  if (live.length === 0) return data;
  const byId = new Map(live.map((m) => [m.id, m]));
  const swap = (list: Match[]) => {
    let changed = false;
    const out = list.map((m) => {
      const l = byId.get(m.id);
      if (!l) return m;
      changed = true;
      // Skor tablosu mekân adını boş verebilir: eldeki bilgiyi koru.
      return { ...l, venue: l.venue ?? m.venue };
    });
    return changed ? out : list;
  };
  let fixtures = swap(data.fixtures);
  const results = swap(data.results);
  // Takım listeleri canlı maçı geçici olarak hiç göstermeyebilir: skor tablosundaki Rizespor maçı kaybolmasın.
  const known = new Set([...fixtures, ...results].map((m) => m.id));
  const missing = live.filter((m) => involvesUs(m) && !known.has(m.id));
  if (missing.length) fixtures = [...fixtures, ...missing].sort((a, b) => a.date.getTime() - b.date.getTime());
  return fixtures === data.fixtures && results === data.results ? data : { ...data, fixtures, results };
}

/** Skor tablosu adresi için tarih: "20261121" (UTC; Süper Lig maçları UTC gününü aşmaz). */
export function scoreboardDate(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}`;
}

/** Kutlama ve bildirim metinleri. */
export function momentText(moment: LiveMoment): { title: string; body: string } {
  const m = moment.match;
  const score = `${m.home.name} ${m.homeScore ?? 0} - ${m.awayScore ?? 0} ${m.away.name}`;
  switch (moment.kind) {
    case 'goal':
      return { title: moment.us ? 'GOOOL!' : `Gol · ${moment.side === 'home' ? m.home.name : m.away.name}`, body: score };
    case 'kickoff':
      return { title: 'Maç başladı', body: `${m.home.name} – ${m.away.name}` };
    case 'halftime':
      return { title: 'Devre arası', body: score };
    case 'secondHalf':
      return { title: 'İkinci yarı başladı', body: score };
    case 'fulltime': {
      const r = m.result === 'G' ? 'Galibiyet!' : m.result === 'B' ? 'Beraberlik' : m.result === 'M' ? 'Mağlubiyet' : 'Maç sona erdi';
      return { title: `Maç sonu · ${r}`, body: score };
    }
  }
}
