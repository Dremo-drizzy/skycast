import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../test/server';
import { forecastResponse } from '../test/fixtures';
import { FORECAST_URL, WeatherApiError, fetchForecast, fetchSnapshots, forecastUrl, searchPlaces, toForecast } from './openMeteo';

describe('openMeteo client', () => {
  it('builds an HTTPS forecast URL with no API key', () => {
    const url = new URL(forecastUrl(44.6488, -63.5752));
    expect(url.protocol).toBe('https:');
    expect(url.searchParams.get('latitude')).toBe('44.6488');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.search).not.toMatch(/appid|apikey/i);
  });

  it('starts the hourly series at the current hour and keeps 24 hours', () => {
    const f = toForecast(forecastResponse);
    expect(f.hourly).toHaveLength(24);
    expect(f.hourly[0].time).toBe('2026-10-26T14:00');
    expect(f.hourly[2].precipitationChance).toBe(0); // null in the source becomes 0
    expect(f.daily).toHaveLength(7);
    expect(f.daily[3].precipitationChance).toBe(0);
    expect(f.current.isDay).toBe(true);
  });

  it('fetches and maps a forecast', async () => {
    const f = await fetchForecast(44.6488, -63.5752);
    expect(f.current.temperature).toBe(9.6);
    expect(f.timezone).toBe('America/Halifax');
  });

  it('searches places and ignores very short queries', async () => {
    expect(await searchPlaces('o')).toEqual([]);
    const results = await searchPlaces('Ottawa');
    expect(results.map((r) => r.admin1)).toEqual(['Ontario', 'Kansas']);
    expect(await searchPlaces('zzzz')).toEqual([]);
  });

  it('fetches many places in one request', async () => {
    const places = [
      { id: 1, name: 'A', latitude: 1, longitude: 1 },
      { id: 2, name: 'B', latitude: 2, longitude: 2 },
    ];
    const snaps = await fetchSnapshots(places);
    expect(snaps.map((s) => s.temperature)).toEqual([10, 11]);
    expect(await fetchSnapshots([])).toEqual([]);
  });

  it('turns HTTP errors into readable WeatherApiErrors', async () => {
    server.use(http.get(FORECAST_URL, () => new HttpResponse(null, { status: 503 })));
    await expect(fetchForecast(0, 0)).rejects.toThrow(WeatherApiError);
    await expect(fetchForecast(0, 0)).rejects.toThrow('503');
  });

  it('reports network failures in plain language', async () => {
    server.use(http.get(FORECAST_URL, () => HttpResponse.error()));
    await expect(fetchForecast(0, 0)).rejects.toThrow(/Could not reach/);
  });
});
