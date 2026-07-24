import { describe, expect, it } from 'vitest';

import { BLACK_FRIDAY_HOTEL_IDS, getHotelsForDeal } from '../data/hotels';
import type { Hotel } from '../types/hotel';
import { getDefaultSortOption, getSortOptionForDeal, sortHotels } from './hotelSorting';

const hotels = [
  { id: 'middle', pricePerNight: 200000 },
  { id: 'highest', pricePerNight: 300000 },
  { id: 'lowest', pricePerNight: 100000 },
] as Hotel[];

describe('hotel sorting', () => {
  it('uses high price as the default only for the existing summer promotion', () => {
    expect(getDefaultSortOption('summer')).toBe('priceHigh');
    expect(getDefaultSortOption('summer-lastcall')).toBe('recommended');
    expect(getDefaultSortOption()).toBe('recommended');
  });

  it('sorts hotels from the highest price to the lowest price', () => {
    expect(sortHotels(hotels, 'priceHigh').map((hotel) => hotel.id)).toEqual([
      'highest',
      'middle',
      'lowest',
    ]);
  });

  it('orders the existing summer promotion hotels by their displayed price', () => {
    const summerHotels = getHotelsForDeal('summer').filter((hotel) =>
      BLACK_FRIDAY_HOTEL_IDS.has(hotel.id),
    );
    const sortedPrices = sortHotels(summerHotels, 'priceHigh', 'summer').map(
      (hotel) => hotel.pricePerNight,
    );

    expect(sortedPrices).toEqual([...sortedPrices].sort((left, right) => right - left));
  });

  it('does not carry a sort selection into another deal', () => {
    expect(getSortOptionForDeal('summer', { deal: undefined, option: 'priceLow' })).toBe('priceHigh');
    expect(getSortOptionForDeal('summer', { deal: 'summer', option: 'priceLow' })).toBe('priceLow');
  });
});
