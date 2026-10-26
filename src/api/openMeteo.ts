// Thin, typed client for the free Open-Meteo APIs (no API key, HTTPS, CORS-enabled).
// Docs: https://open-meteo.com/en/docs and https://open-meteo.com/en/docs/geocoding-api

export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // province / state
}

export interface CurrentWeather {
  time: string;
  temperature: number; // °C
  feelsLike: number; // °C
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitation: number; // mm
  weatherCode: number; // WMO code
  isDay: boolean;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  precipitationChance: number;
  weatherCode: number;
}

export interface DailyPoint {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  precipitationChance: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface Forecast {
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyPoint[]; // next 24 hours, starting at the current hour
  daily: DailyPoint[]; // 7 days
}

export class WeatherApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new WeatherApiError('Could not reach the weather service. Check your connection.');
  }
  if (!res.ok) {
    throw new WeatherApiError(`The weather service answered ${res.status}.`, res.status);
  }
  return (await res.json()) as T;
}

// ---------- Geocoding ----------

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }>;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
  const data = await getJson<GeocodingResponse>(url, signal);
  return (data.results ?? []).map(({ id, name, latitude, longitude, country, admin1 }) => ({
    id,
    name,
    latitude,
    longitude,
    country,
    admin1,
  }));
}

// ---------- Forecast ----------

interface ForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: Array<number | null>;
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: Array<number | null>;
    sunrise: string[];
    sunset: string[];
    uv_index_max: Array<number | null>;
  };
}

export function forecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
    timezone: 'auto',
    forecast_days: '7',
  });
  return `${FORECAST_URL}?${params.toString()}`;
}

/** Turns the column-oriented API response into row objects the UI can render directly. */
export function toForecast(data: ForecastResponse): Forecast {
  const c = data.current;
  // Hourly data starts at midnight local time; start the chart at the current hour.
  const currentHour = c.time.slice(0, 13); // "YYYY-MM-DDTHH"
  let start = data.hourly.time.findIndex((t) => t.slice(0, 13) === currentHour);
  if (start < 0) start = 0;

  const hourly: HourlyPoint[] = data.hourly.time.slice(start, start + 24).map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[start + i],
    precipitationChance: data.hourly.precipitation_probability[start + i] ?? 0,
    weatherCode: data.hourly.weather_code[start + i],
  }));

  const daily: DailyPoint[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    max: data.daily.temperature_2m_max[i],
    min: data.daily.temperature_2m_min[i],
    precipitationChance: data.daily.precipitation_probability_max[i] ?? 0,
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    uvIndexMax: data.daily.uv_index_max[i] ?? 0,
  }));

  return {
    timezone: data.timezone,
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      precipitation: c.precipitation,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
    },
    hourly,
    daily,
  };
}

export async function fetchForecast(lat: number, lon: number, signal?: AbortSignal): Promise<Forecast> {
  const data = await getJson<ForecastResponse>(forecastUrl(lat, lon), signal);
  return toForecast(data);
}

// ---------- Many places at once (one request) ----------

export interface Snapshot {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

interface MultiCurrentResponse {
  current: { temperature_2m: number; weather_code: number; is_day: number };
}

/** Open-Meteo accepts comma-separated coordinates and returns an array: one request instead of N. */
export async function fetchSnapshots(places: Place[], signal?: AbortSignal): Promise<Snapshot[]> {
  if (places.length === 0) return [];
  const params = new URLSearchParams({
    latitude: places.map((p) => p.latitude.toFixed(4)).join(','),
    longitude: places.map((p) => p.longitude.toFixed(4)).join(','),
    current: 'temperature_2m,weather_code,is_day',
    timezone: 'auto',
  });
  const data = await getJson<MultiCurrentResponse | MultiCurrentResponse[]>(
    `${FORECAST_URL}?${params.toString()}`,
    signal,
  );
  const list = Array.isArray(data) ? data : [data];
  return list.map((d) => ({
    temperature: d.current.temperature_2m,
    weatherCode: d.current.weather_code,
    isDay: d.current.is_day === 1,
  }));
}
