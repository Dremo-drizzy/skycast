import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchForecast, fetchSnapshots, searchPlaces, type Place } from '../api/openMeteo';

const TEN_MINUTES = 10 * 60 * 1000;

export function useForecast(place: Place | undefined) {
  return useQuery({
    queryKey: ['forecast', place?.latitude.toFixed(3), place?.longitude.toFixed(3)],
    queryFn: ({ signal }) => fetchForecast(place!.latitude, place!.longitude, signal),
    enabled: !!place,
    staleTime: TEN_MINUTES, // Open-Meteo updates hourly; no need to refetch on every focus
    placeholderData: keepPreviousData, // keep the old forecast on screen while the next loads
  });
}

export function usePlaceSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ['places', q.toLowerCase()],
    queryFn: ({ signal }) => searchPlaces(q, signal),
    enabled: q.length >= 2,
    staleTime: Infinity, // place names don't change
  });
}

export function useSnapshots(places: Place[]) {
  return useQuery({
    queryKey: ['snapshots', places.map((p) => p.id).join(',')],
    queryFn: ({ signal }) => fetchSnapshots(places, signal),
    enabled: places.length > 0,
    staleTime: TEN_MINUTES,
  });
}
