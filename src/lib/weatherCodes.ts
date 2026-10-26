// WMO weather interpretation codes, as used by Open-Meteo.
// https://open-meteo.com/en/docs (section "WMO Weather interpretation codes")

export type Sky = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

interface CodeInfo {
  label: string;
  sky: Sky;
}

const CODES: Record<number, CodeInfo> = {
  0: { label: 'Clear sky', sky: 'clear' },
  1: { label: 'Mainly clear', sky: 'clear' },
  2: { label: 'Partly cloudy', sky: 'partly' },
  3: { label: 'Overcast', sky: 'cloudy' },
  45: { label: 'Fog', sky: 'fog' },
  48: { label: 'Freezing fog', sky: 'fog' },
  51: { label: 'Light drizzle', sky: 'drizzle' },
  53: { label: 'Drizzle', sky: 'drizzle' },
  55: { label: 'Heavy drizzle', sky: 'drizzle' },
  56: { label: 'Freezing drizzle', sky: 'drizzle' },
  57: { label: 'Heavy freezing drizzle', sky: 'drizzle' },
  61: { label: 'Light rain', sky: 'rain' },
  63: { label: 'Rain', sky: 'rain' },
  65: { label: 'Heavy rain', sky: 'rain' },
  66: { label: 'Freezing rain', sky: 'rain' },
  67: { label: 'Heavy freezing rain', sky: 'rain' },
  71: { label: 'Light snow', sky: 'snow' },
  73: { label: 'Snow', sky: 'snow' },
  75: { label: 'Heavy snow', sky: 'snow' },
  77: { label: 'Snow grains', sky: 'snow' },
  80: { label: 'Light showers', sky: 'rain' },
  81: { label: 'Showers', sky: 'rain' },
  82: { label: 'Violent showers', sky: 'rain' },
  85: { label: 'Snow showers', sky: 'snow' },
  86: { label: 'Heavy snow showers', sky: 'snow' },
  95: { label: 'Thunderstorm', sky: 'storm' },
  96: { label: 'Thunderstorm with hail', sky: 'storm' },
  99: { label: 'Severe thunderstorm with hail', sky: 'storm' },
};

export function describeCode(code: number): CodeInfo {
  return CODES[code] ?? { label: 'Unknown', sky: 'cloudy' };
}
