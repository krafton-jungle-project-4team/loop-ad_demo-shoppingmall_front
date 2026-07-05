import { destinations } from '../data/destinations';
import type { SearchState } from '../types/search';

export const DEFAULT_SEARCH_STATE: SearchState = {
  destination: 'seoul',
  checkIn: '2026-08-01',
  checkOut: '2026-08-03',
  adults: 2,
  children: 0,
  rooms: 1,
};

function toPositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

export function parseSearchParams(searchParams: URLSearchParams): SearchState {
  const deal = searchParams.get('deal') || undefined;

  return {
    destination: searchParams.get('destination') ?? (deal ? '' : DEFAULT_SEARCH_STATE.destination),
    checkIn: searchParams.get('checkIn') || DEFAULT_SEARCH_STATE.checkIn,
    checkOut: searchParams.get('checkOut') || DEFAULT_SEARCH_STATE.checkOut,
    adults: Math.max(1, toPositiveNumber(searchParams.get('adults'), DEFAULT_SEARCH_STATE.adults)),
    children: toPositiveNumber(searchParams.get('children'), DEFAULT_SEARCH_STATE.children),
    rooms: Math.max(1, toPositiveNumber(searchParams.get('rooms'), DEFAULT_SEARCH_STATE.rooms)),
    deal,
  };
}

export function createSearchParams(state: SearchState): string {
  const params = new URLSearchParams({
    destination: state.destination,
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    adults: String(state.adults),
    children: String(state.children),
    rooms: String(state.rooms),
  });

  if (state.deal) {
    params.set('deal', state.deal);
  }

  return params.toString();
}

export function getDestinationName(destinationId: string): string {
  return destinations.find((destination) => destination.id === destinationId)?.name || '전체';
}
