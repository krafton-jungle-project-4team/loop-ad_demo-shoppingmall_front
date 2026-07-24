import { describe, expect, it } from 'vitest';

import {
  getHotelForDeal,
  getHotelsForDeal,
  hotels,
  SUMMER_LASTCALL_DEAL,
  SUMMER_LASTCALL_HOTEL_IDS,
} from './hotels';
import { calculatePrice } from '../utils/pricing';

const EXPECTED_HOTEL_PRICES = {
  'jeju-ocean-breeze-006': {
    regular: 342000,
    promotion: 278000,
    lastCall: 250200,
    rooms: {
      'standard-double': 250200,
      'deluxe-king': 305244,
    },
  },
  'jeju-aewol-sunset-007': {
    regular: 248000,
    promotion: 214000,
    lastCall: 192600,
    rooms: {
      'standard-double': 192600,
      'deluxe-king': 234972,
    },
  },
  'okinawa-naha-terrace-017': {
    regular: 268000,
    promotion: 232000,
    lastCall: 208800,
    rooms: {
      'standard-double': 208800,
      'deluxe-king': 254736,
    },
  },
  'okinawa-chatan-sunset-018': {
    regular: 362000,
    promotion: 318000,
    lastCall: 286200,
    rooms: {
      'standard-double': 286200,
      'deluxe-king': 349164,
    },
  },
} as const;

describe('summer last-call hotel data', () => {
  it('returns only the four eligible hotels with the expected prices', () => {
    const lastCallHotels = getHotelsForDeal(SUMMER_LASTCALL_DEAL);

    expect(lastCallHotels).toHaveLength(4);
    expect(lastCallHotels.map((hotel) => hotel.id)).toEqual(
      Object.keys(EXPECTED_HOTEL_PRICES),
    );
    expect(new Set(lastCallHotels.map((hotel) => hotel.id))).toEqual(
      SUMMER_LASTCALL_HOTEL_IDS,
    );

    for (const hotel of lastCallHotels) {
      const expected = EXPECTED_HOTEL_PRICES[hotel.id as keyof typeof EXPECTED_HOTEL_PRICES];

      expect(hotel.originalPrice).toBe(expected.promotion);
      expect(hotel.pricePerNight).toBe(expected.lastCall);
    }
  });

  it('discounts every cloned room by 10 percent and keeps its promotion price', () => {
    for (const hotel of getHotelsForDeal(SUMMER_LASTCALL_DEAL)) {
      const originalHotel = hotels.find((item) => item.id === hotel.id)!;
      const expected = EXPECTED_HOTEL_PRICES[hotel.id as keyof typeof EXPECTED_HOTEL_PRICES];

      expect(hotel.rooms).not.toBe(originalHotel.rooms);
      expect(hotel.rooms).toHaveLength(originalHotel.rooms.length);

      for (const room of hotel.rooms) {
        const originalRoom = originalHotel.rooms.find((item) => item.id === room.id)!;
        const expectedRoomPrice = expected.rooms[room.id as keyof typeof expected.rooms];

        expect(room).not.toBe(originalRoom);
        expect(room.originalPrice).toBe(originalRoom.pricePerNight);
        expect(room.pricePerNight).toBe(Math.round(originalRoom.pricePerNight * 0.9));
        expect(room.pricePerNight).toBe(expectedRoomPrice);
      }
    }
  });

  it('reuses stable discounted hotel and room references', () => {
    const firstHotels = getHotelsForDeal(SUMMER_LASTCALL_DEAL);
    const secondHotels = getHotelsForDeal(SUMMER_LASTCALL_DEAL);

    expect(secondHotels).toBe(firstHotels);

    for (const hotel of firstHotels) {
      expect(getHotelForDeal(hotel.id, SUMMER_LASTCALL_DEAL)).toBe(hotel);
      expect(getHotelForDeal(hotel.id, SUMMER_LASTCALL_DEAL)?.rooms).toBe(hotel.rooms);
    }
  });

  it('does not mutate the original hotel or summer deal data', () => {
    expect(getHotelsForDeal()).toBe(hotels);
    expect(getHotelsForDeal('summer')).toBe(hotels);

    for (const [hotelId, expected] of Object.entries(EXPECTED_HOTEL_PRICES)) {
      const originalHotel = getHotelForDeal(hotelId, 'summer')!;

      expect(originalHotel).toBe(hotels.find((hotel) => hotel.id === hotelId));
      expect(originalHotel.originalPrice).toBe(expected.regular);
      expect(originalHotel.pricePerNight).toBe(expected.promotion);

      for (const room of originalHotel.rooms) {
        const expectedPromotionPrice =
          room.id === 'standard-double'
            ? expected.promotion
            : Math.round(expected.promotion * 1.22);

        expect(room.pricePerNight).toBe(expectedPromotionPrice);
      }
    }
  });

  it('does not expose non-eligible hotel details in last-call mode', () => {
    expect(getHotelForDeal('seoul-loop-city-001', SUMMER_LASTCALL_DEAL)).toBeUndefined();
  });

  it('calculates the representative two-night checkout total from the last-call room price', () => {
    const hotel = getHotelForDeal('jeju-ocean-breeze-006', SUMMER_LASTCALL_DEAL)!;
    const room = hotel.rooms.find((item) => item.id === 'standard-double')!;

    expect(
      calculatePrice({
        pricePerNight: room.pricePerNight,
        originalPrice: room.originalPrice,
        checkIn: '2026-08-01',
        checkOut: '2026-08-03',
        rooms: 1,
      }),
    ).toEqual({
      nights: 2,
      subtotal: 500400,
      taxAndFees: 50040,
      discount: 55600,
      total: 550440,
    });
  });
});
