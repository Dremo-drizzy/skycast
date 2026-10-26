import { describeCode } from '../lib/weatherCodes';

interface Props {
  code: number;
  isDay?: boolean;
  size?: number;
}

/** Hand-drawn SVG icons (no icon font or image requests). Decorative: the label is shown next to it. */
export function WeatherIcon({ code, isDay = true, size = 32 }: Props) {
  const { sky } = describeCode(code);
  const sun = (
    <g className="ico-sun">
      <circle cx="20" cy="18" r="7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="20" y1="5" x2="20" y2="8" transform={`rotate(${a} 20 18)`} />
      ))}
    </g>
  );
  const moon = <path className="ico-moon" d="M24 9a9 9 0 1 0 7 13 7 7 0 0 1-7-13z" />;
  const cloud = <path className="ico-cloud" d="M13 34h19a7 7 0 0 0 0-14 9 9 0 0 0-17 3 5.5 5.5 0 0 0-2 11z" />;
  const drops = (n: number) => (
    <g className="ico-rain">
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={16 + i * 6} y1="37" x2={14 + i * 6} y2="42" />
      ))}
    </g>
  );
  const flakes = (
    <g className="ico-snow">
      {[16, 23, 30].map((x) => (
        <circle key={x} cx={x} cy="40" r="1.6" />
      ))}
    </g>
  );

  let body;
  switch (sky) {
    case 'clear':
      body = isDay ? sun : moon;
      break;
    case 'partly':
      body = (
        <>
          <g transform="translate(-6 -4) scale(0.85)">{isDay ? sun : moon}</g>
          {cloud}
        </>
      );
      break;
    case 'fog':
      body = (
        <g className="ico-fog">
          {[16, 22, 28, 34].map((y) => (
            <line key={y} x1="8" y1={y} x2="40" y2={y} />
          ))}
        </g>
      );
      break;
    case 'drizzle':
      body = (
        <>
          {cloud}
          {drops(2)}
        </>
      );
      break;
    case 'rain':
      body = (
        <>
          {cloud}
          {drops(3)}
        </>
      );
      break;
    case 'snow':
      body = (
        <>
          {cloud}
          {flakes}
        </>
      );
      break;
    case 'storm':
      body = (
        <>
          {cloud}
          <path className="ico-bolt" d="M24 34l-4 7h4l-2 6 7-9h-4l2-4z" />
        </>
      );
      break;
    default:
      body = cloud;
  }

  return (
    <svg className="wicon" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}
