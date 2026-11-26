/**
 * Ana ekran widget'larının veri anlık görüntüsü (snapshot).
 *
 * Uygulama (ön planda ya da arka plan görevinde) son verilerden bu JSON'u üretir ve yerel modüle verir;
 * Android tarafı (modules/rize-widgets) yalnızca okur ve çizer. Biçimlendirme (Türkçe sayı, sıcaklık,
 * kur) burada yapılır ki uygulamayla birebir aynı olsun ve Node ile test edilebilsin. Zamana bağlı
 * metinler ("12 dk önce", "Bugün · 19:00") ise widget her çizildiğinde Android'de hesaplanır; böylece
 * uygulama günlerce açılmasa da widget'ta eskimiş "Bugün" yazısı kalmaz.
 *
 * Saf modüldür (React Native içermez).
 */
import { buildColors, type AccentId, type Colors, type PaletteId } from '../colors.ts';
import { gramGoldTry, formatRate, type Markets } from '../markets.ts';
import type { Match } from '../rizespor/parse.ts';
import type { NewsItem } from '../rss.ts';
import { formatNumber, type TeaData } from '../tea.ts';
import { describeWeatherCode, type Weather } from '../weather.ts';

/** Şema sürümü: Android tarafı tanımadığı sürümü çizmez, "Uygulamayı açın" der. */
export const SNAPSHOT_VERSION = 1;

/** Widget türleri. Android'deki sağlayıcı (AppWidgetProvider) adlarıyla eşleşir. */
export type WidgetKind = 'weather' | 'news' | 'markets' | 'rizespor' | 'shortcuts';
export const WIDGET_KINDS: WidgetKind[] = ['weather', 'news', 'markets', 'rizespor', 'shortcuts'];

/** Widget'ta kullanılan simgeler (res/drawable/rw_ic_*.xml). */
export type WeatherIcon = 'sunny' | 'moon' | 'partly' | 'partly_night' | 'cloudy' | 'rain' | 'snow' | 'storm';

/** "#RRGGBB" renkleri. */
export type WidgetPalette = {
  /** Kart zemini. */
  bg: string;
  text: string;
  muted: string;
  /** Simge ve başlık rengi. */
  accent: string;
  /** Dolu (vurgu renkli) widget zemini, ör. Hava durumu. */
  fill: string;
  /** Dolu zemin üzerindeki metin. */
  onFill: string;
  /** İnce ayraç çizgileri. */
  divider: string;
};

export type WidgetTheme = {
  /** `system`: telefonun koyu/açık ayarına uyar (Android widget'ı çizerken seçer). */
  mode: 'system' | 'light' | 'dark';
  light: WidgetPalette;
  dark: WidgetPalette;
};

export type WeatherSnapshot = {
  place: string;
  /** "12°" */
  temp: string;
  label: string;
  icon: WeatherIcon;
  /** "En yüksek 14° · En düşük 8°" yerine kısa: "14° / 8°" */
  hiLo: string | null;
  /** "Hissedilen 10° · Yağış %80" */
  detail: string;
  /** Önümüzdeki saatler (geniş widget). */
  hours: { time: string; temp: string; icon: WeatherIcon }[];
  /** Ekran okuyucu için tam cümle. */
  a11y: string;
  savedAt: number;
};

export type NewsSnapshot = {
  items: { title: string; source: string; publishedAt: number | null; url: string }[];
  savedAt: number;
};

export type MarketsSnapshot = {
  rows: { code: string; label: string; value: string }[];
  /** "2026 yaş çay: 26,50 ₺/kg" */
  tea: string | null;
  /** TCMB bülten tarihi: "21 Kas" */
  date: string | null;
  a11y: string;
  savedAt: number;
};

export type RizesporSnapshot = {
  state: 'pre' | 'in' | 'post';
  home: string;
  away: string;
  /** "2 – 1"; başlamamış maçta null. */
  score: string | null;
  /** Veri kaynağının kısa durumu: "MS", "İY", "67'". */
  status: string;
  /** Başlama saati (epoch ms). */
  kickoff: number;
  venue: string | null;
  rizesporHome: boolean;
  result: 'G' | 'B' | 'M' | null;
  savedAt: number;
};

export type WidgetSnapshot = {
  v: typeof SNAPSHOT_VERSION;
  savedAt: number;
  /** Uygulamadaki yazı boyutu ayarı (1, 1,15, 1,3). Telefonun kendi yazı boyutuna ek olarak uygulanır. */
  textScale: number;
  theme: WidgetTheme;
  weather: WeatherSnapshot | null;
  news: NewsSnapshot | null;
  markets: MarketsSnapshot | null;
  rizespor: RizesporSnapshot | null;
};

/** WMO hava kodu → widget simgesi. */
export function weatherIcon(code: number, isDay: boolean): WeatherIcon {
  if (code === 0 || code === 1) return isDay ? 'sunny' : 'moon';
  if (code === 2) return isDay ? 'partly' : 'partly_night';
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code === 95 || code === 96 || code === 99) return 'storm';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  return 'cloudy';
}

/** Sıcaklık: yuvarlanır, "-0" görünmez. */
export function degrees(t: number): string {
  const r = Math.round(t);
  return `${r === 0 ? 0 : r}°`;
}

export function widgetPalette(colors: Colors): WidgetPalette {
  return {
    bg: colors.card,
    text: colors.text,
    muted: colors.textMuted,
    accent: colors.primary,
    fill: colors.header,
    onFill: '#FFFFFF',
    divider: colors.border,
  };
}

export function widgetTheme(o: { accent: AccentId; palette: PaletteId; monochrome: boolean; mode: WidgetTheme['mode'] }): WidgetTheme {
  return {
    mode: o.mode,
    light: widgetPalette(buildColors(o.accent, false, o.palette, o.monochrome)),
    dark: widgetPalette(buildColors(o.accent, true, o.palette, o.monochrome)),
  };
}

export function weatherSnapshot(place: string, w: Weather, savedAt: number): WeatherSnapshot {
  const c = w.current;
  const { label } = describeWeatherCode(c.code, c.isDay);
  const today = w.daily[0];
  const rain = w.hourly[0]?.precipitationProbability ?? today?.precipitationProbability ?? null;
  const detailParts = [`Hissedilen ${degrees(c.apparentTemperature)}`];
  if (rain !== null) detailParts.push(`Yağış %${rain}`);
  const hiLo = today ? `${degrees(today.max)} / ${degrees(today.min)}` : null;
  // İlk saat "şimdi"dir (üstte zaten gösteriliyor); sonraki saatler 3'er saat arayla.
  const hours = w.hourly
    .filter((_, i) => i > 0 && i % 3 === 0)
    .slice(0, 4)
    .map((h) => ({ time: h.time.slice(11, 16), temp: degrees(h.temperature), icon: weatherIcon(h.code, h.isDay) }));
  const a11y = [
    `${place} hava durumu: ${degrees(c.temperature).replace('°', ' derece')}, ${label.toLocaleLowerCase('tr-TR')}`,
    today ? `en yüksek ${degrees(today.max).replace('°', '')}, en düşük ${degrees(today.min).replace('°', '')} derece` : null,
    rain !== null ? `yağış olasılığı yüzde ${rain}` : null,
  ]
    .filter(Boolean)
    .join(', ');
  return {
    place,
    temp: degrees(c.temperature),
    label,
    icon: weatherIcon(c.code, c.isDay),
    hiLo,
    detail: detailParts.join(' · '),
    hours,
    a11y: `${a11y}.`,
    savedAt,
  };
}

/** Widget'ta en fazla bu kadar haber saklanır (en büyük boyutta 4 satır görünür). */
export const NEWS_LIMIT = 5;

export function newsSnapshot(items: NewsItem[], savedAt: number): NewsSnapshot | null {
  const list = items
    .filter((i) => i.title && i.link.startsWith('http'))
    .slice(0, NEWS_LIMIT)
    .map((i) => ({
      title: i.title,
      source: i.source,
      publishedAt: i.publishedAt ? i.publishedAt.getTime() : null,
      url: i.link,
    }));
  return list.length ? { items: list, savedAt } : null;
}

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** "2026-11-21" → "21 Kas" */
function shortDate(iso: string | null): string | null {
  const m = iso?.match(/^\d{4}-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[2])} ${MONTHS[Number(m[1]) - 1]}` : null;
}

export function marketsSnapshot(m: Markets, tea: TeaData | null, savedAt: number): MarketsSnapshot | null {
  const rows: MarketsSnapshot['rows'] = [];
  for (const [code, label] of [['USD', 'Dolar'], ['EUR', 'Euro']] as const) {
    const r = m.rates.find((x) => x.code === code);
    if (r) rows.push({ code, label, value: `${formatRate(r.selling)} ₺` });
  }
  const gram = gramGoldTry(m.ounceUsd, m.rates);
  if (gram) rows.push({ code: 'XAU', label: 'Gram altın', value: `${formatNumber(gram, 0)} ₺` });
  if (!rows.length) return null;
  const teaText = tea ? `${tea.current.year} yaş çay: ${formatNumber(tea.current.pricePerKg)} ₺/kg` : null;
  const a11y = [
    ...rows.map((r) => `${r.label} ${r.value.replace(' ₺', ' lira')}`),
    teaText ? teaText.replace('₺/kg', 'lira kilogram') : null,
  ]
    .filter(Boolean)
    .join(', ');
  return { rows, tea: teaText, date: shortDate(m.date), a11y: `Piyasalar: ${a11y}.`, savedAt };
}

export function rizesporSnapshot(m: Match, savedAt: number): RizesporSnapshot {
  const started = m.state !== 'pre' && m.homeScore !== null && m.awayScore !== null;
  return {
    state: m.state,
    home: m.home.name,
    away: m.away.name,
    score: started ? `${m.homeScore} – ${m.awayScore}` : null,
    status: m.status,
    kickoff: m.date.getTime(),
    venue: m.venue,
    rizesporHome: m.rizesporHome,
    result: m.result,
    savedAt,
  };
}

/**
 * Widget'ta gösterilecek maç: canlı maç; yoksa son maçın üzerinden 18 saat geçmediyse son sonuç
 * (maç akşamı ve ertesi sabah skor görünsün); yoksa sıradaki maç; o da yoksa son sonuç.
 */
export function pickMatch(next: Match | null, latest: Match | null, now: number): Match | null {
  if (next?.state === 'in') return next;
  if (latest && now - latest.date.getTime() < 18 * 3600_000) return latest;
  return next ?? latest;
}

export type SnapshotInput = {
  now: number;
  textScale: number;
  theme: WidgetTheme;
  weather: { place: string; weather: Weather; savedAt: number } | null;
  news: { items: NewsItem[]; savedAt: number } | null;
  markets: { markets: Markets; savedAt: number } | null;
  tea: TeaData | null;
  match: { match: Match; savedAt: number } | null;
};

export function buildSnapshot(input: SnapshotInput): WidgetSnapshot {
  return {
    v: SNAPSHOT_VERSION,
    savedAt: input.now,
    textScale: input.textScale,
    theme: input.theme,
    weather: input.weather ? weatherSnapshot(input.weather.place, input.weather.weather, input.weather.savedAt) : null,
    news: input.news ? newsSnapshot(input.news.items, input.news.savedAt) : null,
    markets: input.markets ? marketsSnapshot(input.markets.markets, input.tea, input.markets.savedAt) : null,
    rizespor: input.match ? rizesporSnapshot(input.match.match, input.match.savedAt) : null,
  };
}
