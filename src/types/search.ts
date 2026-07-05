import type { PropertyType } from './hotel';

export type SearchState = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  deal?: string;
};

export type PriceBucket = 'under100' | '100to200' | '200to300' | 'over300';

export type Filters = {
  priceBuckets: PriceBucket[];
  refundable: boolean;
  payLater: boolean;
  starRatings: number[];
  minRating: number | null;
  amenities: string[];
  propertyTypes: PropertyType[];
};

export type SortOption = 'recommended' | 'priceLow' | 'ratingHigh' | 'starHigh' | 'reviewMany';
