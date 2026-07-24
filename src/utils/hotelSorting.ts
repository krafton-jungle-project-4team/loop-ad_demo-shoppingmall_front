import { SUMMER_LASTCALL_DEAL } from '../data/hotels';
import type { Hotel } from '../types/hotel';
import type { SortOption } from '../types/search';

export type SortSelection = {
  deal?: string;
  option: SortOption;
};

export function getDefaultSortOption(deal?: string): SortOption {
  return deal === 'summer' ? 'priceHigh' : 'recommended';
}

export function getSortOptionForDeal(
  deal: string | undefined,
  selection: SortSelection | null,
): SortOption {
  return selection && selection.deal === deal
    ? selection.option
    : getDefaultSortOption(deal);
}

export function sortHotels(items: Hotel[], sortOption: SortOption, deal?: string): Hotel[] {
  return [...items].sort((left, right) => {
    if (deal === 'summer' || deal === SUMMER_LASTCALL_DEAL) {
      const leftDealScore = left.originalPrice ? 1 : 0;
      const rightDealScore = right.originalPrice ? 1 : 0;

      if (leftDealScore !== rightDealScore) return rightDealScore - leftDealScore;
    }

    if (sortOption === 'priceLow') return left.pricePerNight - right.pricePerNight;
    if (sortOption === 'priceHigh') return right.pricePerNight - left.pricePerNight;
    if (sortOption === 'ratingHigh') return right.guestRating - left.guestRating;
    if (sortOption === 'starHigh') return right.starRating - left.starRating;
    if (sortOption === 'reviewMany') return right.reviewCount - left.reviewCount;

    return right.guestRating * 100 + right.reviewCount / 100 - (left.guestRating * 100 + left.reviewCount / 100);
  });
}
