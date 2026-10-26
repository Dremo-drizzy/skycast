import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import App from './App';
import { FORECAST_URL } from './api/openMeteo';
import { renderWithClient } from './test/render';
import { server } from './test/server';

describe('App', () => {
  it('shows Halifax by default with current conditions and a 7-day forecast', async () => {
    renderWithClient(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Halifax' })).toBeInTheDocument();
    expect(screen.getByLabelText('Temperature 10°')).toBeInTheDocument();
    expect(screen.getByText('Partly cloudy', { selector: '.condition' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: /7-day/i })).getAllByRole('listitem')).toHaveLength(7);
  });

  it('switches to Fahrenheit and remembers it', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    await screen.findByLabelText('Temperature 10°');
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByLabelText('Temperature 49°')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('skycast:v1')!).units).toBe('imperial');
  });

  it('searches for a city with the keyboard and updates the URL', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Halifax' });
    await user.type(screen.getByRole('combobox', { name: /search for a city/i }), 'Ottawa');
    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(await screen.findByRole('heading', { level: 1, name: 'Ottawa' })).toBeInTheDocument();
    expect(window.location.search).toContain('place=Ottawa');
  });

  it('tells the user when nothing matches', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    await user.type(screen.getByRole('combobox', { name: /search for a city/i }), 'zzzz');
    expect(await screen.findByText(/No places match/)).toBeInTheDocument();
  });

  it('saves a city to the saved list', async () => {
    const user = userEvent.setup();
    renderWithClient(<App />);
    await user.click(await screen.findByRole('button', { name: /save city/i }));
    const saved = screen.getByRole('region', { name: 'Saved cities' });
    expect(within(saved).getByRole('button', { name: /Remove Halifax/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '★ Saved' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens on the place in the URL', async () => {
    window.history.replaceState(null, '', '/?place=Lagos&lat=6.4541&lon=3.3947&country=Nigeria');
    renderWithClient(<App />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Lagos' })).toBeInTheDocument();
  });

  it('shows a friendly error with a retry button', async () => {
    server.use(http.get(FORECAST_URL, () => new HttpResponse(null, { status: 500 })));
    const user = userEvent.setup();
    renderWithClient(<App />);
    expect(await screen.findByText("Couldn't load the forecast")).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Halifax' })).toBeInTheDocument());
  });
});
