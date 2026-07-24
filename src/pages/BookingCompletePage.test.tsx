import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BookingCompletePage } from "@/pages/BookingCompletePage";
import type { StoredBooking } from "@/types/booking";

const { getLastBookingMock } = vi.hoisted(() => ({
  getLastBookingMock: vi.fn(),
}));

vi.mock("@/utils/bookingStorage", () => ({
  getLastBooking: getLastBookingMock,
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

describe("BookingCompletePage", () => {
  beforeEach(() => {
    getLastBookingMock.mockReset();
  });

  it("keeps the booking deal in the hotel detail link", () => {
    getLastBookingMock.mockReturnValue({ ...booking, deal: "summer-lastcall" });

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <BookingCompletePage />
      </MemoryRouter>,
    );

    expect(markup).toContain(
      'href="/hotel/jeju-ocean-breeze-006?deal=summer-lastcall"',
    );
  });

  it("keeps the original hotel detail link when there is no deal", () => {
    getLastBookingMock.mockReturnValue(booking);

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <BookingCompletePage />
      </MemoryRouter>,
    );

    expect(markup).toContain('href="/hotel/jeju-ocean-breeze-006"');
    expect(markup).not.toContain("?deal=");
  });
});
