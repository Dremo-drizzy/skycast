import type { HourlyPoint } from '../api/openMeteo';
import { formatTemp, hourLabel, toFahrenheit, type Units } from '../lib/format';
import { describeCode } from '../lib/weatherCodes';

interface Props {
  hours: HourlyPoint[];
  units: Units;
}

const W = 720;
const H = 200;
const PAD = { top: 28, right: 16, bottom: 44, left: 16 };

/**
 * Next-24-hours temperature line with rain-chance bars, drawn as plain SVG.
 * A visually hidden table carries the same data for screen readers.
 */
export function HourlyChart({ hours, units }: Props) {
  if (hours.length < 2) return null;
  const temps = hours.map((h) => (units === 'imperial' ? toFahrenheit(h.temperature) : h.temperature));
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(max - min, 4); // avoid a flat-looking line on calm days
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (hours.length - 1)) * plotW;
  const y = (t: number) => PAD.top + (1 - (t - min) / span) * plotH;

  const line = temps.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(t).toFixed(1)}`).join(' ');
  const area = `${line} L${x(hours.length - 1).toFixed(1)},${PAD.top + plotH} L${x(0).toFixed(1)},${PAD.top + plotH} Z`;
  const barW = plotW / hours.length - 4;

  return (
    <section className="card" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading">Next 24 hours</h2>
      <div className="chart-scroll">
        <svg className="hourly" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hourly temperature and rain chance">
          {hours.map((h, i) =>
            h.precipitationChance > 0 ? (
              <rect
                key={`b${h.time}`}
                className="rain-bar"
                x={x(i) - barW / 2}
                width={barW}
                y={PAD.top + plotH - (h.precipitationChance / 100) * plotH}
                height={(h.precipitationChance / 100) * plotH}
              />
            ) : null,
          )}
          <path className="temp-area" d={area} />
          <path className="temp-line" d={line} />
          {hours.map((h, i) =>
            i % 3 === 0 ? (
              <g key={h.time}>
                <circle className="temp-dot" cx={x(i)} cy={y(temps[i])} r="3.5" />
                <text className="temp-label" x={x(i)} y={y(temps[i]) - 10} textAnchor="middle">
                  {formatTemp(h.temperature, units)}
                </text>
                <text className="hour-label" x={x(i)} y={H - 18} textAnchor="middle">
                  {i === 0 ? 'Now' : hourLabel(h.time)}
                </text>
              </g>
            ) : null,
          )}
        </svg>
      </div>
      <p className="legend">
        <span className="legend-line" /> Temperature <span className="legend-bar" /> Chance of rain
      </p>
      <table className="visually-hidden">
        <caption>Hourly forecast</caption>
        <thead>
          <tr>
            <th>Hour</th>
            <th>Temperature</th>
            <th>Conditions</th>
            <th>Rain chance</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h.time}>
              <td>{hourLabel(h.time)}</td>
              <td>{formatTemp(h.temperature, units)}</td>
              <td>{describeCode(h.weatherCode).label}</td>
              <td>{Math.round(h.precipitationChance)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
