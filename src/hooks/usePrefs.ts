import { useCallback, useEffect, useState } from 'react';
import type { Place } from '../api/openMeteo';
import { loadPrefs, savePrefs, MAX_SAVED, type Prefs } from '../lib/storage';
import type { Units } from '../lib/format';

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());

  useEffect(() => savePrefs(prefs), [prefs]);

  const isSaved = useCallback((place: Place) => prefs.saved.some((p) => p.id === place.id), [prefs.saved]);

  const toggleSaved = useCallback((place: Place) => {
    setPrefs((prev) => {
      const exists = prev.saved.some((p) => p.id === place.id);
      const saved = exists
        ? prev.saved.filter((p) => p.id !== place.id)
        : [place, ...prev.saved].slice(0, MAX_SAVED);
      return { ...prev, saved };
    });
  }, []);

  const setUnits = useCallback((units: Units) => setPrefs((prev) => ({ ...prev, units })), []);
  const setTheme = useCallback((theme: Prefs['theme']) => setPrefs((prev) => ({ ...prev, theme })), []);
  const setLast = useCallback((last: Place) => setPrefs((prev) => ({ ...prev, last })), []);

  return { prefs, isSaved, toggleSaved, setUnits, setTheme, setLast };
}
