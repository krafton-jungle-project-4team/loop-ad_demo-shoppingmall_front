import { CalendarDays, MapPin, Minus, Plus, Search, UsersRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations } from '../../data/destinations';
import type { SearchState } from '../../types/search';
import { cn } from '../../utils/cn';
import { trackSearchSubmit } from '../../utils/booking-events';
import { createSearchParams, DEFAULT_SEARCH_STATE } from '../../utils/searchParams';
import { Button } from '../common/Button';

type SearchBoxProps = {
  variant?: 'hero' | 'compact';
  defaultValues?: SearchState;
  onSearch?: (state: SearchState) => void;
};

type TravelerStepperProps = {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
};

function TravelerStepper({ label, value, min, onChange }: TravelerStepperProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-ink-700 hover:bg-slate-50 disabled:opacity-40"
          type="button"
          aria-label={`${label} 줄이기`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <span className="w-6 text-center text-sm font-bold text-ink-900">{value}</span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-ink-700 hover:bg-slate-50"
          type="button"
          aria-label={`${label} 늘리기`}
          onClick={() => onChange(value + 1)}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function SearchBox({ variant = 'hero', defaultValues = DEFAULT_SEARCH_STATE, onSearch }: SearchBoxProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<SearchState>(defaultValues);
  const isCompact = variant === 'compact';

  const updateState = <K extends keyof SearchState>(key: K, value: SearchState[K]) => {
    setState((current) => ({
      ...current,
      [key]: value,
      deal: key === 'destination' ? undefined : current.deal,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackSearchSubmit(state);

    if (onSearch) {
      onSearch(state);
      return;
    }

    navigate(`/search?${createSearchParams(state)}`);
  };

  return (
    <form
      className={cn(
        'grid gap-3 rounded-lg border border-slate-200 bg-white shadow-card',
        isCompact ? 'p-3 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr_auto]' : 'p-4 sm:p-5 lg:grid-cols-[1.35fr_1fr_1fr_1.15fr_auto]',
      )}
      onSubmit={handleSubmit}
    >
      <label className="group block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-ink-500">
          <MapPin size={15} aria-hidden="true" />
          목적지
        </span>
        <select
          className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-base font-semibold text-ink-900 transition group-hover:border-loop-200"
          value={state.destination}
          onChange={(event) => updateState('destination', event.target.value)}
        >
          <option value="">전체 지역</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.id}>
              {destination.name}
            </option>
          ))}
        </select>
      </label>

      <label className="group block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-ink-500">
          <CalendarDays size={15} aria-hidden="true" />
          체크인
        </span>
        <input
          className="h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-ink-900 transition group-hover:border-loop-200"
          type="date"
          value={state.checkIn}
          onChange={(event) => updateState('checkIn', event.target.value)}
        />
      </label>

      <label className="group block">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-ink-500">
          <CalendarDays size={15} aria-hidden="true" />
          체크아웃
        </span>
        <input
          className="h-12 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold text-ink-900 transition group-hover:border-loop-200"
          type="date"
          value={state.checkOut}
          onChange={(event) => updateState('checkOut', event.target.value)}
        />
      </label>

      <div className="rounded-md border border-slate-200 p-3">
        <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-ink-500">
          <UsersRound size={15} aria-hidden="true" />
          여행자/객실
        </span>
        <div className={cn('grid gap-3', isCompact ? 'sm:grid-cols-3 lg:grid-cols-1' : 'sm:grid-cols-3 lg:grid-cols-1')}>
          <TravelerStepper label="성인" value={state.adults} min={1} onChange={(value) => updateState('adults', value)} />
          <TravelerStepper label="아동" value={state.children} min={0} onChange={(value) => updateState('children', value)} />
          <TravelerStepper label="객실" value={state.rooms} min={1} onChange={(value) => updateState('rooms', value)} />
        </div>
      </div>

      <Button className={cn('w-full self-end', isCompact ? 'lg:h-12' : 'h-12 lg:h-full')} type="submit" size="lg">
        <Search size={18} aria-hidden="true" />
        검색
      </Button>
    </form>
  );
}
