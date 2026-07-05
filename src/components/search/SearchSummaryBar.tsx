import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { SearchState } from '../../types/search';
import { formatDateRange } from '../../utils/format';
import { getDestinationName } from '../../utils/searchParams';
import { Button } from '../common/Button';
import { SearchBox } from './SearchBox';

type SearchSummaryBarProps = {
  searchState: SearchState;
  onSearchChange: (state: SearchState) => void;
};

export function SearchSummaryBar({ searchState, onSearchChange }: SearchSummaryBarProps) {
  const [open, setOpen] = useState(false);
  const destinationName = getDestinationName(searchState.destination);

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-loop-700">{destinationName} 숙소</p>
            <h1 className="mt-1 text-xl font-bold text-ink-900 sm:text-2xl">
              {formatDateRange(searchState.checkIn, searchState.checkOut)} · 성인 {searchState.adults}명
              {searchState.children ? ` · 아동 ${searchState.children}명` : ''} · 객실 {searchState.rooms}개
            </h1>
          </div>
          <Button variant="outline" onClick={() => setOpen((current) => !current)}>
            <SlidersHorizontal size={17} aria-hidden="true" />
            검색 조건 변경
          </Button>
        </div>

        {open ? (
          <div className="mt-4">
            <SearchBox
              variant="compact"
              defaultValues={searchState}
              onSearch={(nextState) => {
                onSearchChange(nextState);
                setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
