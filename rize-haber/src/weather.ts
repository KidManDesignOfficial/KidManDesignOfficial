/**
 * Open-Meteo hava durumu istemcisi (ücretsiz, API anahtarı gerektirmez).
 * https://open-meteo.com/en/docs
 */
import type { WeatherLocation } from './config';

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

export type Weather = {
  current: CurrentWeather;
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

export async function fetchWeather(location: WeatherLocation, signal?: AbortSignal): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'Europe/Istanbul',
    forecast_days: '7',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Hava durumu servisi yanıt vermedi (HTTP ${response.status}).`);
  }
  const data = await response.json();
  const c = data.current;
  const d = data.daily;

  return {
    current: {
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      precipitation: c.precipitation,
      code: c.weather_code,
      isDay: c.is_day === 1,
    },
    daily: (d.time as string[]).map((date, i) => ({
      date,
      code: d.weather_code[i],
      max: d.temperature_2m_max[i],
      min: d.temperature_2m_min[i],
      precipitationProbability: d.precipitation_probability_max?.[i] ?? null,
    })),
    sunrise: d.sunrise?.[0] ?? null,
    sunset: d.sunset?.[0] ?? null,
  };
}
