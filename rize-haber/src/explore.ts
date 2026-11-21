/**
 * "Bugün nereye gideyim?" ve "Yakınındakiler": uzaklık, mevsim ve havaya göre gezi önerisi.
 * Saf modüldür (yan etkisiz, test edilir); hava verisi ve konum dışarıdan verilir.
 *
 * Kurallar (sade ve açıklanabilir; her önerinin gerekçesi kullanıcıya gösterilir):
 * - Mevsimi dışındaki yerler (ör. Aralık'ta yaylalar) önerilmez.
 * - Yağışlı ya da fırtınalı günde kapalı alanlar öne çıkar; yüksek yaylalar düşer. Şelaleler yağış sonrası
 *   daha gösterişli olduğu için hafif yağmurda cezalandırılmaz.
 * - Gün ilerledikçe uzak ve "tam gün" yerler düşer; akşam yakın ve kısa duraklar kalır.
 * - Aynı gün aynı önerileri görmemek için güne ve "Başka öner" sayacına bağlı küçük bir çeşitlilik eklenir.
 */
import type { Place } from './data/discover.ts';

export type LatLon = { lat: number; lon: number };

/** İki nokta arası kuş uçuşu km (haversine). */
export function distanceKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "850 m", "12 km", "~120 km" */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

/**
 * Dağlık Rize'de yol, kuş uçuşunun yaklaşık 1,5 katıdır; ortalama 45 km/sa ile kaba süre.
 * Yalnızca karşılaştırma içindir; gerçek süre için harita uygulaması açılır.
 */
export function roughDriveMinutes(km: number): number {
  return Math.max(5, Math.round(((km * 1.5) / 45) * 60 / 5) * 5);
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

/** Ay (1–12) mevsim aralığında mı? Aralık yıl sonunu aşabilir (ör. [11, 3]). */
export function inSeason(place: Pick<Place, 'months'>, month: number): boolean {
  if (!place.months) return true;
  const [a, b] = place.months;
  return a <= b ? month >= a && month <= b : month >= a || month <= b;
}

export type WithDistance<T> = { item: T; km: number };

/** En yakından uzağa sıralı ilk `limit` kayıt. */
export function nearest<T extends LatLon>(ref: LatLon, items: readonly T[], limit = items.length): WithDistance<T>[] {
  return items
    .map((item) => ({ item, km: distanceKm(ref, item) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/** Günün havası (öneri için gereken kadarı). */
export type DayWeather = {
  /** WMO hava kodu. */
  code: number;
  max: number;
  precipitationProbability: number | null;
};

export type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'heavy' | 'snow';

export function weatherKind(w: DayWeather): WeatherKind {
  const c = w.code;
  if (c >= 95 || c === 65 || c === 82 || c === 67) return 'heavy';
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
  if (c === 45 || c === 48) return 'fog';
  if (c >= 2) return 'cloudy';
  return (w.precipitationProbability ?? 0) >= 60 ? 'rain' : 'clear';
}

export type Suggestion = { place: Place; km: number; minutes: number; score: number; reasons: string[] };

export type SuggestInput = {
  places: readonly Place[];
  ref: LatLon;
  /** Yoksa havaya göre ayıklama yapılmaz (çevrimdışı). */
  weather: DayWeather | null;
  now: Date;
  /** "Başka öner" her basışta bir artar. */
  shuffle?: number;
  limit?: number;
};

/** Güne ve sayaca bağlı, kararlı 0–1 değer (aynı gün aynı sonuç). */
function jitter(id: string, day: number, shuffle: number): number {
  let h = 2166136261 ^ (day * 31 + shuffle * 7919);
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

export function suggestToday({ places, ref, weather, now, shuffle = 0, limit = 3 }: SuggestInput): Suggestion[] {
  const month = now.getMonth() + 1;
  const hour = now.getHours() + now.getMinutes() / 60;
  const kind = weather ? weatherKind(weather) : null;
  const wet = kind === 'rain' || kind === 'heavy' || kind === 'snow';
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000);
  // Kalan gün ışığı (Rize'de yazın ~20.30, kışın ~16.45 gün batımı) kabaca.
  const sunset = month >= 4 && month <= 9 ? 20 : 17;
  const hoursLeft = Math.max(0, sunset - hour);

  const out: Suggestion[] = [];
  for (const place of places) {
    if (!inSeason(place, month)) continue;
    const km = distanceKm(ref, place);
    const minutes = roughDriveMinutes(km);
    const reasons: string[] = [];
    let score = 50;

    // Uzaklık: yakın yerler öne, ama 5 km içi her şey eşit derecede "yakın".
    score -= Math.max(0, km - 5) * 0.45;
    if (km < 5) reasons.push('Çok yakın');
    else if (minutes <= 45) reasons.push(`Yaklaşık ${formatDuration(minutes)} yol`);

    // Gün ışığı: gidiş + gezme süresi kalan güne sığmalı.
    const needed = minutes / 60 + (place.visit === 'tam' ? 4 : place.visit === 'yarim' ? 2.5 : 1);
    if (needed > hoursLeft + 0.5) {
      // Müzeler genellikle 17.00'ye kadar açık: öğleden sonra geç saatte de kısa bir ziyaret sığar.
      if (place.indoor && hour < 16) score -= 5;
      else continue;
    }
    if (hoursLeft < 3 && place.visit === 'kisa') score += 8;

    // Hava
    if (kind) {
      if (wet) {
        if (place.indoor) {
          score += 25;
          reasons.push('Kapalı alan: yağmurda da gezilir');
        } else if (place.category === 'yayla' || place.id === 'kackar') {
          score -= kind === 'rain' ? 30 : 60;
        } else if (place.category === 'doga' && kind === 'rain' && place.id !== 'pileki') {
          score -= 4;
          if (place.name.includes('Şelale')) reasons.push('Yağış sonrası şelale coşkulu akar');
        } else score -= kind === 'rain' ? 12 : 30;
      } else if (kind === 'fog') {
        if (place.category === 'yayla') {
          score -= 6;
          reasons.push('Sis olabilir; yükseklerde bulut denizi görülebilir');
        }
      } else {
        if (!place.indoor) {
          score += kind === 'clear' ? 12 : 5;
          if (kind === 'clear') reasons.push('Hava açık');
        }
        if (place.category === 'yayla' && weather!.max >= 14) {
          score += 6;
          reasons.push('Yayla havası için uygun gün');
        }
      }
    }

    if (place.popular) {
      score += 8;
      reasons.push('En çok önerilenlerden');
    }
    score += jitter(place.id, day, shuffle) * 14;

    out.push({ place, km, minutes, score, reasons: reasons.slice(0, 3) });
  }
  out.sort((a, b) => b.score - a.score);

  // Çeşitlilik: aynı kategoriden üç öneri yerine farklı türler.
  const picked: Suggestion[] = [];
  const used = new Set<string>();
  for (const s of out) {
    if (picked.length >= limit) break;
    if (used.has(s.place.category) && out.some((o) => !used.has(o.place.category) && !picked.includes(o))) continue;
    picked.push(s);
    used.add(s.place.category);
  }
  for (const s of out) {
    if (picked.length >= limit) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked.sort((a, b) => b.score - a.score);
}

/** Öneri kartının başlığındaki tek cümle: havaya ve saate göre. */
export function todayHeadline(weather: DayWeather | null, now: Date): string {
  const hour = now.getHours();
  const kind = weather ? weatherKind(weather) : null;
  const part = hour < 11 ? 'Güne' : hour < 17 ? 'Öğleden sonraya' : 'Akşama';
  if (kind === 'heavy') return 'Hava sert; kapalı ve yakın yerler daha keyifli.';
  if (kind === 'rain') return `${part} yağmurlu bir plan: müzeler, kaleler, şelaleler.`;
  if (kind === 'snow') return 'Karlı bir gün: yaylalar kapalı, şehir ve sahil durakları açık.';
  if (kind === 'fog') return `${part} sisli bir başlangıç; vadiler ve köprüler yine güzel.`;
  if (kind === 'clear') return hour >= 17 ? 'Gün batımına yakın: kısa ve yakın bir mola.' : `${part} açık hava: dışarı çıkmanın tam zamanı.`;
  return `${part} uygun birkaç fikir.`;
}

/** Gün batımına bir saatten az kaldıysa öneriler yarın sabah için yapılır. */
export function planTarget(now: Date): { date: Date; dayIndex: 0 | 1; label: string } {
  const month = now.getMonth() + 1;
  const sunset = month >= 4 && month <= 9 ? 20 : 17;
  if (now.getHours() + now.getMinutes() / 60 < sunset - 1) return { date: now, dayIndex: 0, label: 'Bugün' };
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return { date: tomorrow, dayIndex: 1, label: 'Yarın' };
}
