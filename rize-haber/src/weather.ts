/**
 * Open-Meteo hava durumu istemcisi (ücretsiz, API anahtarı gerektirmez).
 * https://open-meteo.com/en/docs
 */
import type { WeatherLocation } from './config';
import { requestJson } from './net.ts';

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  code: number;
  isDay: boolean;
};

export type DailyForecast = {
  date: string; // YYYY-MM-DD
  code: number;
  max: number;
  min: number;
  precipitationProbability: number | null;
};

export type HourlyForecast = {
  time: string; // YYYY-MM-DDTHH:00 (İstanbul saati)
  temperature: number;
  code: number;
  precipitationProbability: number | null;
  isDay: boolean;
};

export type Weather = {
  current: CurrentWeather;
  /** Şu anki saatten başlayarak önümüzdeki 24 saat. */
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  sunrise: string | null; // ISO yerel saat
  sunset: string | null;
};

/** WMO hava kodu → Türkçe açıklama + emoji. */
export function describeWeatherCode(code: number, isDay = true): { label: string; icon: string } {
  if (code === 0) return { label: 'Açık', icon: isDay ? '☀️' : '🌙' };
  if (code === 1) return { label: 'Çoğunlukla açık', icon: isDay ? '🌤️' : '🌙' };
  if (code === 2) return { label: 'Parçalı bulutlu', icon: '⛅' };
  if (code === 3) return { label: 'Kapalı', icon: '☁️' };
  if (code === 45 || code === 48) return { label: 'Sisli', icon: '🌫️' };
  if (code >= 51 && code <= 57) return { label: 'Çiseleme', icon: '🌦️' };
  if (code === 61) return { label: 'Hafif yağmur', icon: '🌦️' };
  if (code === 63) return { label: 'Yağmurlu', icon: '🌧️' };
  if (code === 65) return { label: 'Kuvvetli yağmur', icon: '🌧️' };
  if (code === 66 || code === 67) return { label: 'Dondurucu yağmur', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { label: 'Kar yağışlı', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { label: 'Sağanak yağış', icon: '🌧️' };
  if (code === 85 || code === 86) return { label: 'Kar sağanağı', icon: '🌨️' };
  if (code === 95 || code === 96 || code === 99) return { label: 'Gök gürültülü fırtına', icon: '⛈️' };
  return { label: 'Bilinmiyor', icon: '🌡️' };
}

export function weatherUrl(location: WeatherLocation): string {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'Europe/Istanbul',
    forecast_days: '7',
    // Rüzgâr km/sa, sıcaklık °C (varsayılanlar; açıkça istenir ki servis değişse de birim kaymasın).
    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

export async function fetchWeather(location: WeatherLocation, signal?: AbortSignal): Promise<Weather> {
  return parseWeather(await requestJson(weatherUrl(location), { signal }));
}

const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const numOr = (v: unknown, d: number): number => (finite(v) ? v : d);
const pct = (v: unknown): number | null => (finite(v) ? Math.min(100, Math.max(0, Math.round(v))) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/**
 * Open-Meteo yanıtını doğrulayarak okur. Zorunlu alanlar (anlık sıcaklık, hava kodu) yoksa hata verir;
 * eksik ya da bozuk saatlik/günlük değerler atlanır, böylece ekranda "NaN°" ya da boş satır görünmez.
 */
export function parseWeather(json: unknown): Weather {
  const data = (json ?? {}) as Record<string, any>;
  const c = data.current ?? {};
  if (!finite(c.temperature_2m) || !finite(c.weather_code)) throw new Error('Hava durumu verisi eksik geldi.');
  const h = data.hourly ?? {};
  const d = data.daily ?? {};

  const hours: HourlyForecast[] = [];
  arr(h.time).forEach((time, i) => {
    const temperature = h.temperature_2m?.[i];
    const code = h.weather_code?.[i];
    if (typeof time !== 'string' || !finite(temperature) || !finite(code)) return;
    hours.push({ time, temperature, code, precipitationProbability: pct(h.precipitation_probability?.[i]), isDay: h.is_day?.[i] === 1 });
  });

  const daily: DailyForecast[] = [];
  arr(d.time).forEach((date, i) => {
    const max = d.temperature_2m_max?.[i];
    const min = d.temperature_2m_min?.[i];
    const code = d.weather_code?.[i];
    if (typeof date !== 'string' || !finite(max) || !finite(min) || !finite(code)) return;
    daily.push({ date, code, max, min, precipitationProbability: pct(d.precipitation_probability_max?.[i]) });
  });

  const currentTime = typeof c.time === 'string' ? c.time : (hours[0]?.time ?? '');
  return {
    current: {
      temperature: c.temperature_2m,
      apparentTemperature: numOr(c.apparent_temperature, c.temperature_2m),
      humidity: Math.min(100, Math.max(0, numOr(c.relative_humidity_2m, 0))),
      windSpeed: Math.max(0, numOr(c.wind_speed_10m, 0)),
      precipitation: Math.max(0, numOr(c.precipitation, 0)),
      code: c.weather_code,
      isDay: c.is_day === 1,
    },
    hourly: nextHours(hours, currentTime, 24),
    daily,
    sunrise: typeof d.sunrise?.[0] === 'string' ? d.sunrise[0] : null,
    sunset: typeof d.sunset?.[0] === 'string' ? d.sunset[0] : null,
  };
}

/**
 * Saatlik listeyi, içinde bulunulan saatten başlatıp `count` kadar kısaltır.
 * Zamanlar aynı saat diliminde ve "YYYY-MM-DDTHH:MM" biçiminde olduğundan metin karşılaştırması yeterlidir.
 */
export function nextHours<T extends { time: string }>(hours: T[], currentTime: string, count: number): T[] {
  const currentHour = `${currentTime.slice(0, 13)}:00`;
  const start = hours.findIndex((hour) => hour.time >= currentHour);
  return start === -1 ? [] : hours.slice(start, start + count);
}
