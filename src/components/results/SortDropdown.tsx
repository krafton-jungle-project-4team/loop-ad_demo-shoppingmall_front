import type { SortOption } from '../../types/search';

type SortDropdownProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'recommended', label: '추천순' },
  { value: 'priceLow', label: '낮은 가격순' },
  { value: 'priceHigh', label: '높은 가격순' },
  { value: 'ratingHigh', label: '높은 평점순' },
  { value: 'starHigh', label: '성급 높은순' },
  { value: 'reviewMany', label: '리뷰 많은순' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
      정렬
      <select
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-ink-900"
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
