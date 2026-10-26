import type { Place } from '../api/openMeteo';

// Halifax is the default: the app was built in Nova Scotia.
export const DEFAULT_PLACE: Place = {
  id: 6324729,
  name: 'Halifax',
  latitude: 44.6488,
  longitude: -63.5752,
  admin1: 'Nova Scotia',
  country: 'Canada',
};

export const FEATURED: Place[] = [
  DEFAULT_PLACE,
  { id: 6094817, name: 'Ottawa', latitude: 45.4112, longitude: -75.6981, admin1: 'Ontario', country: 'Canada' },
  { id: 6167865, name: 'Toronto', latitude: 43.7001, longitude: -79.4163, admin1: 'Ontario', country: 'Canada' },
  { id: 6173331, name: 'Vancouver', latitude: 49.2497, longitude: -123.1193, admin1: 'British Columbia', country: 'Canada' },
  { id: 2332459, name: 'Lagos', latitude: 6.4541, longitude: 3.3947, admin1: 'Lagos', country: 'Nigeria' },
  { id: 2643743, name: 'London', latitude: 51.5085, longitude: -0.1257, admin1: 'England', country: 'United Kingdom' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.6917, admin1: 'Tokyo', country: 'Japan' },
];
