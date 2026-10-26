import type { Forecast, Place } from '../api/openMeteo';
import { compass, formatTemp, formatWind, placeLabel, timeLabel, type Units } from '../lib/format';
import { describeCode } from '../lib/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  place: Place;
  forecast: Forecast;
  units: Units;
  saved: boolean;
  onToggleSave: () => void;
}

export function CurrentConditions({ place, forecast, units, saved, onToggleSave }: Props) {
  const { current } = forecast;
  const today = forecast.daily[0];
  const { label } = describeCode(current.weatherCode);

  return (
    <section className="current" aria-labelledby="current-heading">
      <div className="current-top">
        <div>
          <h1 id="current-heading" className="place-name">
            {place.name}
          </h1>
          <p className="place-region">{placeLabel({ ...place, name: '' }).replace(/^, /, '') || 'Current location'}</p>
        </div>
        <button
          type="button"
          className={`save-btn${saved ? ' is-saved' : ''}`}
          aria-pressed={saved}
          onClick={onToggleSave}
        >
          {saved ? '★ Saved' : '☆ Save city'}
        </button>
      </div>

      <div className="current-main">
        <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={96} />
        <div>
          <p className="temp-now" aria-label={`Temperature ${formatTemp(current.temperature, units)}`}>
            {formatTemp(current.temperature, units)}
          </p>
          <p className="condition">{label}</p>
          {today && (
            <p className="hilo">
              H {formatTemp(today.max, units)} · L {formatTemp(today.min, units)}
            </p>
          )}
        </div>
      </div>

      <dl className="stats">
        <div>
          <dt>Feels like</dt>
          <dd>{formatTemp(current.feelsLike, units)}</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>
            {formatWind(current.windSpeed, units)} {compass(current.windDirection)}
          </dd>
        </div>
        <div>
          <dt>Humidity</dt>
          <dd>{Math.round(current.humidity)}%</dd>
        </div>
        <div>
          <dt>Rain chance</dt>
          <dd>{today ? `${Math.round(today.precipitationChance)}%` : '—'}</dd>
        </div>
        <div>
          <dt>UV index</dt>
          <dd>{today ? Math.round(today.uvIndexMax) : '—'}</dd>
        </div>
        <div>
          <dt>Sunrise / sunset</dt>
          <dd>{today ? `${timeLabel(today.sunrise)} / ${timeLabel(today.sunset)}` : '—'}</dd>
        </div>
      </dl>
      <p className="updated">Local time of reading: {timeLabel(current.time)} ({forecast.timezone})</p>
    </section>
  );
}
