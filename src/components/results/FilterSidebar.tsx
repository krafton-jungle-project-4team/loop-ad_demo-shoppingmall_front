import type { ReactNode } from 'react';
import { amenityFilters, propertyTypeLabels } from '../../data/hotels';
import type { Filters, PriceBucket } from '../../types/search';
import { Button } from '../common/Button';

type FilterSidebarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
};

const priceBuckets: Array<{ value: PriceBucket; label: string }> = [
  { value: 'under100', label: '10만원 이하' },
  { value: '100to200', label: '10만원 - 20만원' },
  { value: '200to300', label: '20만원 - 30만원' },
  { value: 'over300', label: '30만원 이상' },
];

const starRatings = [5, 4, 3];
const ratingOptions = [9, 8, 7];
const propertyTypes = Object.entries(propertyTypeLabels) as Array<[keyof typeof propertyTypeLabels, string]>;

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink-900">필터</h2>
        <button className="text-sm font-semibold text-loop-700 hover:text-loop-900" type="button" onClick={onReset}>
          초기화
        </button>
      </div>

      <div className="space-y-6">
        <FilterGroup title="예산">
          {priceBuckets.map((bucket) => (
            <Checkbox
              key={bucket.value}
              checked={filters.priceBuckets.includes(bucket.value)}
              label={bucket.label}
              onChange={() => onChange({ ...filters, priceBuckets: toggleValue(filters.priceBuckets, bucket.value) })}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="환불 정책">
          <Checkbox checked={filters.refundable} label="무료 취소 가능" onChange={() => onChange({ ...filters, refundable: !filters.refundable })} />
          <Checkbox checked={filters.payLater} label="숙소에서 결제 가능" onChange={() => onChange({ ...filters, payLater: !filters.payLater })} />
        </FilterGroup>

        <FilterGroup title="숙소 등급">
          {starRatings.map((rating) => (
            <Checkbox
              key={rating}
              checked={filters.starRatings.includes(rating)}
              label={`${rating}성급`}
              onChange={() => onChange({ ...filters, starRatings: toggleValue(filters.starRatings, rating) })}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="후기 평점">
          {ratingOptions.map((rating) => (
            <RadioOption
              key={rating}
              checked={filters.minRating === rating}
              label={`${rating}점 이상`}
              onChange={() => onChange({ ...filters, minRating: filters.minRating === rating ? null : rating })}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="인기 편의시설">
          {amenityFilters.map((amenity) => (
            <Checkbox
              key={amenity}
              checked={filters.amenities.includes(amenity)}
              label={amenity}
              onChange={() => onChange({ ...filters, amenities: toggleValue(filters.amenities, amenity) })}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="숙소 유형">
          {propertyTypes.map(([type, label]) => (
            <Checkbox
              key={type}
              checked={filters.propertyTypes.includes(type)}
              label={label}
              onChange={() => onChange({ ...filters, propertyTypes: toggleValue(filters.propertyTypes, type) })}
            />
          ))}
        </FilterGroup>
      </div>

      <Button className="mt-6 w-full" variant="outline" onClick={onReset}>
        필터 초기화
      </Button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold text-ink-900">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-slate-50">
      <input className="h-4 w-4 rounded border-slate-300 text-loop-600" type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function RadioOption({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-slate-50">
      <input className="h-4 w-4 border-slate-300 text-loop-600" type="radio" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
