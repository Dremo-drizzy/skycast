import { useId, useRef, useState } from 'react';
import type { Place } from '../api/openMeteo';
import { usePlaceSearch } from '../hooks/queries';
import { useDebounced } from '../hooks/useDebounced';
import { placeLabel } from '../lib/format';

interface Props {
  onSelect: (place: Place) => void;
}

/**
 * City search with suggestions. Follows the WAI-ARIA combobox pattern so it works with
 * a keyboard (Up/Down to move, Enter to pick, Escape to close) and with screen readers.
 */
export function SearchBox({ onSelect }: Props) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounced(text, 300);
  const { data: results = [], isFetching, isError } = usePlaceSearch(debounced);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const showList = open && debounced.trim().length >= 2;

  function choose(place: Place) {
    onSelect(place);
    setText('');
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = results[active >= 0 ? active : 0];
      if (pick) choose(pick);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  let status = '';
  if (showList) {
    if (isError) status = 'Search is unavailable right now.';
    else if (isFetching && results.length === 0) status = 'Searching…';
    else if (results.length === 0) status = `No places match “${debounced.trim()}”.`;
  }

  return (
    <div className="search">
      <label htmlFor={`${listId}-input`} className="visually-hidden">
        Search for a city
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        placeholder="Search a city, e.g. Halifax"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
      />
      {showList && results.length > 0 && (
        <ul id={listId} role="listbox" className="search-list">
          {results.map((place, i) => (
            <li
              key={place.id}
              id={`${listId}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="opt-name">{place.name}</span>
              <span className="opt-region">{placeLabel({ ...place, name: '' }).replace(/^, /, '')}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="search-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
