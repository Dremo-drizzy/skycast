import type { Place } from '../api/openMeteo';
import { useSnapshots } from '../hooks/queries';
import { formatTemp, type Units } from '../lib/format';
import { describeCode } from '../lib/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  title: string;
  places: Place[];
  units: Units;
  selectedId?: number;
  onSelect: (place: Place) => void;
  onRemove?: (place: Place) => void;
  emptyText?: string;
}

/** A row of places with their current temperature, all fetched in a single request. */
export function PlaceStrip({ title, places, units, selectedId, onSelect, onRemove, emptyText }: Props) {
  const { data: snaps } = useSnapshots(places);

  return (
    <section className="strip" aria-label={title}>
      <h2>{title}</h2>
      {places.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="strip-list">
          {places.map((place, i) => {
            const snap = snaps?.[i];
            return (
              <li key={place.id} className={place.id === selectedId ? 'is-selected' : undefined}>
                <button type="button" className="chip" onClick={() => onSelect(place)}>
                  {snap && <WeatherIcon code={snap.weatherCode} isDay={snap.isDay} size={24} />}
                  <span className="chip-name">{place.name}</span>
                  <span className="chip-temp">{snap ? formatTemp(snap.temperature, units) : '…'}</span>
                  {snap && <span className="visually-hidden">{describeCode(snap.weatherCode).label}</span>}
                </button>
                {onRemove && (
                  <button
                    type="button"
                    className="chip-remove"
                    aria-label={`Remove ${place.name} from saved cities`}
                    onClick={() => onRemove(place)}
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
