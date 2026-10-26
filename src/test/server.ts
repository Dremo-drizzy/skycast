import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FORECAST_URL, GEOCODING_URL } from '../api/openMeteo';
import { forecastResponse, geocodingResponse } from './fixtures';

export const handlers = [
  http.get(FORECAST_URL, ({ request }) => {
    const url = new URL(request.url);
    const lats = (url.searchParams.get('latitude') ?? '').split(',');
    // Multi-coordinate requests return an array, single ones an object, like the real API.
    if (lats.length > 1) {
      return HttpResponse.json(
        lats.map((_, i) => ({ current: { temperature_2m: 10 + i, weather_code: 0, is_day: 1 } })),
      );
    }
    return HttpResponse.json(forecastResponse);
  }),
  http.get(GEOCODING_URL, ({ request }) => {
    const name = new URL(request.url).searchParams.get('name') ?? '';
    return HttpResponse.json(name.toLowerCase().startsWith('ott') ? geocodingResponse : {});
  }),
];

export const server = setupServer(...handlers);
