import { beforeEach, describe, expect, it, vi } from "vitest";

import { getHotelForDeal, SUMMER_LASTCALL_DEAL } from "@/data/hotels";
import type { StoredBooking } from "@/types/booking";
import type { SearchState } from "@/types/search";
import {
  trackBookingComplete,
  trackCheckoutStart,
  trackHotelClick,
  trackHotelView,
} from "@/utils/booking-events";

const { getLoopAdAttributionFieldsMock, trackLoopAdEventMock } = vi.hoisted(() => ({
  getLoopAdAttributionFieldsMock: vi.fn(),
  trackLoopAdEventMock: vi.fn(),
}));

vi.mock("@/utils/ad-attribution", () => ({
  getLoopAdAttributionFields: getLoopAdAttributionFieldsMock,
}));

vi.mock("@/lib/loop-ad-sdk", () => ({
  trackLoopAdEvent: trackLoopAdEventMock,
}));

const booking: StoredBooking = {
  bookingNumber: "STAY-20260724-1200",
  hotelId: "jeju-ocean-breeze-006",
  hotelName: "Jeju Ocean Breeze Resort",
  roomId: "standard-double",
  roomName: "Standard Double Room",
  guestName: "StayLoop Guest",
  email: "guest@stayloop.example",
  phone: "010-0000-0000",
  checkIn: "2026-08-01",
  checkOut: "2026-08-03",
  adults: 2,
  children: 0,
  rooms: 1,
  total: 550440,
  paymentOption: "now",
  cancellation: "Free cancellation",
  status: "confirmed",
};

const lastCallSearchState: SearchState = {
  destination: "",
  checkIn: "2026-08-01",
  checkOut: "2026-08-03",
  adults: 2,
  children: 0,
  rooms: 1,
  deal: SUMMER_LASTCALL_DEAL,
};

describe("booking complete events", () => {
  beforeEach(() => {
    getLoopAdAttributionFieldsMock.mockReset();
    trackLoopAdEventMock.mockReset();
    getLoopAdAttributionFieldsMock.mockReturnValue({});
  });

  it("uses the booking deal instead of relying on attribution", () => {
    getLoopAdAttributionFieldsMock.mockReturnValue({
      properties: { deal: "attributed-deal" },
    });

    trackBookingComplete({ ...booking, deal: "summer-lastcall" });

    expect(trackLoopAdEventMock).toHaveBeenCalledWith(
      "booking_complete",
      expect.objectContaining({
        revenue: 550440,
        properties: expect.objectContaining({
          booking_value: 550440,
          deal: "summer-lastcall",
        }),
      }),
    );
  });

  it("does not add an empty deal property", () => {
    trackBookingComplete(booking);

    const properties = trackLoopAdEventMock.mock.calls[0]?.[1]?.properties;
    expect(properties).not.toHaveProperty("deal");
  });

  it("tracks the discounted hotel detail price with the last-call deal", () => {
    const hotel = getHotelForDeal("jeju-ocean-breeze-006", SUMMER_LASTCALL_DEAL)!;

    trackHotelView(hotel, lastCallSearchState);

    expect(trackLoopAdEventMock).toHaveBeenCalledWith(
      "hotel_detail_view",
      expect.objectContaining({
        price: 250200,
        properties: expect.objectContaining({ deal: SUMMER_LASTCALL_DEAL }),
      }),
    );
  });

  it("tracks hotel clicks with the discounted price and last-call deal", () => {
    const hotel = getHotelForDeal("jeju-ocean-breeze-006", SUMMER_LASTCALL_DEAL)!;

    trackHotelClick(hotel, lastCallSearchState);

    expect(trackLoopAdEventMock).toHaveBeenCalledWith(
      "hotel_click",
      expect.objectContaining({
        price: 250200,
        properties: expect.objectContaining({ deal: SUMMER_LASTCALL_DEAL }),
      }),
    );
  });

  it("tracks the discounted checkout price and revenue with the last-call deal", () => {
    const hotel = getHotelForDeal("jeju-ocean-breeze-006", SUMMER_LASTCALL_DEAL)!;
    const room = hotel.rooms.find((item) => item.id === "standard-double")!;

    trackCheckoutStart(hotel, room, lastCallSearchState);

    expect(trackLoopAdEventMock).toHaveBeenCalledWith(
      "booking_start",
      expect.objectContaining({
        price: 250200,
        revenue: 550440,
        properties: expect.objectContaining({
          booking_value: 550440,
          deal: SUMMER_LASTCALL_DEAL,
        }),
      }),
    );
  });
});
