import { useCallback, useState } from 'react';
import type { Place } from '../api/openMeteo';
import { stableId } from '../lib/urlState';

type Status = 'idle' | 'locating' | 'error';

/** Asks the browser for the user's position and turns it into a Place. */
export function useGeolocation(onLocated: (place: Place) => void) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setMessage('Your browser does not support location.');
      return;
    }
    setStatus('locating');
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setStatus('idle');
        onLocated({
          id: stableId(coords.latitude, coords.longitude),
          name: 'My location',
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (err) => {
        setStatus('error');
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Search for a city instead.'
            : 'Could not find your location. Search for a city instead.',
        );
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }, [onLocated]);

  return { locate, status, message };
}
