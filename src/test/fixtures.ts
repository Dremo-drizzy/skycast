// A trimmed but realistic Open-Meteo response. Times are local wall-clock (timezone=auto).
const hours = Array.from({ length: 48 }, (_, i) => {
  const day = i < 24 ? '26' : '27';
  return `2026-10-${day}T${String(i % 24).padStart(2, '0')}:00`;
});

export const forecastResponse = {
  timezone: 'America/Halifax',
  current: {
    time: '2026-10-26T14:15',
    temperature_2m: 9.6,
    apparent_temperature: 6.2,
    relative_humidity_2m: 71,
    wind_speed_10m: 22.4,
    wind_direction_10m: 225,
    precipitation: 0,
    weather_code: 2,
    is_day: 1,
  },
  hourly: {
    time: hours,
    temperature_2m: hours.map((_, i) => Math.round((7 + 4 * Math.sin(((i - 9) / 24) * 2 * Math.PI)) * 10) / 10),
    precipitation_probability: hours.map((_, i) => (i === 16 ? null : i > 18 && i < 30 ? 40 + (i % 5) * 10 : 5)),
    weather_code: hours.map(() => 3),
  },
  daily: {
    time: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
    weather_code: [2, 61, 63, 3, 0, 71, 95],
    temperature_2m_max: [11, 9, 8, 10, 12, 4, 7],
    temperature_2m_min: [4, 3, 2, 5, 6, -2, 1],
    precipitation_probability_max: [10, 80, 90, null, 0, 60, 70],
    sunrise: Array(7).fill('2026-10-26T07:29'),
    sunset: Array(7).fill('2026-10-26T18:07'),
    uv_index_max: [2.1, 1.2, 0.8, 2.4, 2.9, 1.0, null],
  },
};

export const geocodingResponse = {
  results: [
    { id: 6094817, name: 'Ottawa', latitude: 45.41117, longitude: -75.69812, country: 'Canada', admin1: 'Ontario' },
    { id: 4401618, name: 'Ottawa', latitude: 38.61558, longitude: -95.26775, country: 'United States', admin1: 'Kansas' },
  ],
};
