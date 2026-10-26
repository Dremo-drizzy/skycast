import { describe, expect, it } from 'vitest';
import { compass, formatTemp, formatWind, hourLabel, placeLabel, timeLabel, toFahrenheit, weekday } from './format';

describe('format', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(toFahrenheit(0)).toBe(32);
    expect(toFahrenheit(100)).toBe(212);
    expect(toFahrenheit(-40)).toBe(-40);
  });

  it('rounds temperatures and never prints -0°', () => {
    expect(formatTemp(9.6, 'metric')).toBe('10°');
    expect(formatTemp(-0.4, 'metric')).toBe('0°');
    expect(formatTemp(10, 'imperial')).toBe('50°');
  });

  it('formats wind in both unit systems', () => {
    expect(formatWind(22.4, 'metric')).toBe('22 km/h');
    expect(formatWind(100, 'imperial')).toBe('62 mph');
  });

  it('maps degrees to compass points, wrapping around', () => {
    expect(compass(0)).toBe('N');
    expect(compass(225)).toBe('SW');
    expect(compass(350)).toBe('N');
    expect(compass(-90)).toBe('W');
    expect(compass(405)).toBe('NE');
  });

  it('reads local times without shifting time zones', () => {
    expect(hourLabel('2026-10-26T00:00')).toBe('12am');
    expect(hourLabel('2026-10-26T12:00')).toBe('12pm');
    expect(hourLabel('2026-10-26T15:00')).toBe('3pm');
    expect(timeLabel('2026-10-26T07:29')).toBe('7:29 am');
    expect(weekday('2026-10-26')).toBe('Mon');
  });

  it('joins place parts and skips missing ones', () => {
    expect(placeLabel({ name: 'Halifax', admin1: 'Nova Scotia', country: 'Canada' })).toBe('Halifax, Nova Scotia, Canada');
    expect(placeLabel({ name: 'Lagos', country: 'Nigeria' })).toBe('Lagos, Nigeria');
  });
});
