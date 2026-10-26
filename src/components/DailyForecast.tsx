import type { DailyPoint } from '../api/openMeteo';
import { formatTemp, weekday, type Units } from '../lib/format';
import { describeCode } from '../lib/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  days: DailyPoint[];
  units: Units;
}

/** 7-day list. The bar shows each day's low–high inside the whole week's range. */
export function DailyForecast({ days, units }: Props) {
  if (days.length === 0) return null;
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekMax = Math.max(...days.map((d) => d.max));
  const range = Math.max(weekMax - weekMin, 1);

  return (
    <section className="card" aria-labelledby="daily-heading">
      <h2 id="daily-heading">7-day forecast</h2>
      <ol className="daily" aria-labelledby="daily-heading">
        {days.map((d, i) => {
          const { label } = describeCode(d.weatherCode);
          const left = ((d.min - weekMin) / range) * 100;
          const width = Math.max(((d.max - d.min) / range) * 100, 4);
          return (
            <li key={d.date}>
              <span className="day">{i === 0 ? 'Today' : weekday(d.date)}</span>
              <span className="day-icon" title={label}>
                <WeatherIcon code={d.weatherCode} size={28} />
                <span className="visually-hidden">{label}</span>
              </span>
              <span className="day-rain" aria-label={`${Math.round(d.precipitationChance)}% chance of rain`}>
                {d.precipitationChance >= 20 ? `${Math.round(d.precipitationChance)}%` : ''}
              </span>
              <span className="day-min">{formatTemp(d.min, units)}</span>
              <span className="range" aria-hidden="true">
                <span className="range-fill" style={{ left: `${left}%`, width: `${width}%` }} />
              </span>
              <span className="day-max">{formatTemp(d.max, units)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
