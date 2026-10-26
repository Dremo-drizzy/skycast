import { useCallback, useEffect, useState } from 'react';
import type { Place } from './api/openMeteo';
import { CurrentConditions } from './components/CurrentConditions';
import { DailyForecast } from './components/DailyForecast';
import { HourlyChart } from './components/HourlyChart';
import { PlaceStrip } from './components/PlaceStrip';
import { SearchBox } from './components/SearchBox';
import { useForecast } from './hooks/queries';
import { useGeolocation } from './hooks/useGeolocation';
import { usePrefs } from './hooks/usePrefs';
import { DEFAULT_PLACE, FEATURED } from './lib/places';
import { placeFromUrl, placeToSearch } from './lib/urlState';

export default function App() {
  const { prefs, isSaved, toggleSaved, setUnits, setTheme, setLast } = usePrefs();
  const [place, setPlace] = useState<Place>(
    () => placeFromUrl(window.location.search) ?? prefs.last ?? DEFAULT_PLACE,
  );
  const { data: forecast, isPending, isError, error, refetch, isFetching } = useForecast(place);

  const selectPlace = useCallback(
    (next: Place) => {
      setPlace(next);
      setLast(next);
      window.history.pushState(null, '', placeToSearch(next));
    },
    [setLast],
  );

  const geo = useGeolocation(selectPlace);

  // Back/forward buttons move between previously viewed places.
  useEffect(() => {
    const onPop = () => {
      const fromUrl = placeFromUrl(window.location.search);
      if (fromUrl) setPlace(fromUrl);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Theme: "system" follows the OS; light/dark force it.
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
  }, [prefs.theme]);

  useEffect(() => {
    document.title = `${place.name} weather · Skycast`;
  }, [place.name]);

  const nextTheme = prefs.theme === 'system' ? 'dark' : prefs.theme === 'dark' ? 'light' : 'system';

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to forecast
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Skycast
        </div>
        <SearchBox onSelect={selectPlace} />
        <div className="controls">
          <button type="button" className="ghost" onClick={geo.locate} disabled={geo.status === 'locating'}>
            {geo.status === 'locating' ? 'Locating…' : 'Use my location'}
          </button>
          <div className="seg" role="group" aria-label="Units">
            <button type="button" aria-pressed={prefs.units === 'metric'} onClick={() => setUnits('metric')}>
              °C
            </button>
            <button type="button" aria-pressed={prefs.units === 'imperial'} onClick={() => setUnits('imperial')}>
              °F
            </button>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Theme: ${prefs.theme}. Switch to ${nextTheme}.`}
          >
            Theme: {prefs.theme}
          </button>
        </div>
      </header>
      {geo.status === 'error' && (
        <p className="notice" role="alert">
          {geo.message}
        </p>
      )}

      <main id="main" className="layout" aria-busy={isFetching}>
        <div className="primary">
          {isPending && <Skeleton />}
          {isError && !forecast && (
            <section className="card error" role="alert">
              <h2>Couldn't load the forecast</h2>
              <p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>
              <button type="button" onClick={() => refetch()}>
                Try again
              </button>
            </section>
          )}
          {forecast && (
            <>
              <CurrentConditions
                place={place}
                forecast={forecast}
                units={prefs.units}
                saved={isSaved(place)}
                onToggleSave={() => toggleSaved(place)}
              />
              <HourlyChart hours={forecast.hourly} units={prefs.units} />
            </>
          )}
        </div>
        <aside className="secondary">
          {forecast && <DailyForecast days={forecast.daily} units={prefs.units} />}
          <PlaceStrip
            title="Saved cities"
            places={prefs.saved}
            units={prefs.units}
            selectedId={place.id}
            onSelect={selectPlace}
            onRemove={toggleSaved}
            emptyText="Save a city to keep it one tap away."
          />
          <PlaceStrip
            title="Around the world"
            places={FEATURED}
            units={prefs.units}
            selectedId={place.id}
            onSelect={selectPlace}
          />
        </aside>
      </main>

      <footer className="footer">
        Weather data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo.com
        </a>{' '}
        (CC BY 4.0). Built by Daniel Nwachukwu Chukwuemeka.
      </footer>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton" aria-label="Loading forecast">
      <div className="sk sk-title" />
      <div className="sk sk-temp" />
      <div className="sk sk-row" />
      <div className="sk sk-chart" />
    </div>
  );
}
