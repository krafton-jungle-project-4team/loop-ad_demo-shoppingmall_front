import type { StoredBooking } from "@/types/booking";
import type { Hotel, Room } from "@/types/hotel";
import type { SearchState } from "@/types/search";
import { getLoopAdAttributionFields } from "@/utils/ad-attribution";
import { calculatePrice } from "@/utils/pricing";
import { trackLoopAdEvent, type LoopAdTrackFields } from "@/lib/loop-ad-sdk";

export type BookingEventName =
  | "hotel_search"
  | "hotel_detail_view"
  | "hotel_click"
  | "booking_start"
  | "booking_complete";

const DEFAULT_CURRENCY = "KRW";
const INVENTORY_STATUS_AVAILABLE = "available";

export function trackSearchSubmit(searchState: SearchState): void {
  trackBookingEvent("hotel_search", {
    checkinDate: searchState.checkIn,
    checkoutDate: searchState.checkOut,
    adultCount: searchState.adults,
    childCount: searchState.children,
    properties: {
      ...createSearchProperties(searchState),
      route_group: "search",
    },
  });
}

export function trackHotelView(hotel: Hotel, searchState: SearchState): void {
  trackBookingEvent("hotel_detail_view", {
    hotelId: hotel.id,
    hotelMarket: hotel.destinationId,
    hotelCity: hotel.destination,
    price: hotel.pricePerNight,
    properties: {
      ...createHotelProperties(hotel),
      ...createSearchProperties(searchState),
      route_group: "hotel-detail",
    },
  });
}

export function trackRoomSelect(
  hotel: Hotel,
  room: Room,
  searchState: SearchState,
): void {
  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  trackBookingEvent("hotel_click", {
    hotelId: hotel.id,
    hotelMarket: hotel.destinationId,
    hotelCity: hotel.destination,
    checkinDate: searchState.checkIn,
    checkoutDate: searchState.checkOut,
    adultCount: searchState.adults,
    childCount: searchState.children,
    roomType: room.name,
    breakfastIncluded: room.breakfastIncluded,
    freeCancellation: room.refundable,
    price: room.pricePerNight,
    revenue: price.total,
    currency: DEFAULT_CURRENCY,
    properties: {
      ...createHotelProperties(hotel),
      ...createRoomProperties(room),
      ...createSearchProperties(searchState),
      nights: price.nights,
      booking_value: price.total,
      route_group: "hotel-detail",
    },
  });
}

export function trackCheckoutStart(
  hotel: Hotel,
  room: Room,
  searchState: SearchState,
): void {
  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  trackBookingEvent("booking_start", {
    hotelId: hotel.id,
    hotelMarket: hotel.destinationId,
    hotelCity: hotel.destination,
    checkinDate: searchState.checkIn,
    checkoutDate: searchState.checkOut,
    adultCount: searchState.adults,
    childCount: searchState.children,
    roomType: room.name,
    breakfastIncluded: room.breakfastIncluded,
    freeCancellation: room.refundable,
    price: room.pricePerNight,
    revenue: price.total,
    currency: DEFAULT_CURRENCY,
    properties: {
      ...createHotelProperties(hotel),
      ...createRoomProperties(room),
      ...createSearchProperties(searchState),
      nights: price.nights,
      booking_value: price.total,
      route_group: "checkout",
    },
  });
}

export function trackBookingComplete(booking: StoredBooking): void {
  trackBookingEvent("booking_complete", {
    hotelId: booking.hotelId,
    checkinDate: booking.checkIn,
    checkoutDate: booking.checkOut,
    adultCount: booking.adults,
    childCount: booking.children,
    roomType: booking.roomName,
    bookingId: booking.bookingNumber,
    revenue: booking.total,
    currency: DEFAULT_CURRENCY,
    properties: {
      hotel_id: booking.hotelId,
      hotel_name: booking.hotelName,
      room_id: booking.roomId,
      room_name: booking.roomName,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      rooms: booking.rooms,
      payment_option: booking.paymentOption,
      booking_value: booking.total,
      inventory_status: INVENTORY_STATUS_AVAILABLE,
      is_booking: 1,
      route_group: "booking-complete",
    },
  });
}

function trackBookingEvent(
  eventName: BookingEventName,
  fields: LoopAdTrackFields,
): void {
  const attributionFields = getLoopAdAttributionFields();

  trackLoopAdEvent(eventName, {
    ...attributionFields,
    ...fields,
    properties: {
      ...(attributionFields.properties ?? {}),
      ...(fields.properties ?? {}),
    },
  });
}

function createSearchProperties(searchState: SearchState) {
  return {
    destination_id: searchState.destination,
    check_in: searchState.checkIn,
    check_out: searchState.checkOut,
    adults: searchState.adults,
    children: searchState.children,
    rooms: searchState.rooms,
    deal: searchState.deal ?? "",
  };
}

function createHotelProperties(hotel: Hotel) {
  return {
    hotel_id: hotel.id,
    hotel_name: hotel.name,
    destination_id: hotel.destinationId,
    destination_name: hotel.destination,
    neighborhood: hotel.neighborhood,
    hotel_star_rating: hotel.starRating,
    hotel_guest_rating: hotel.guestRating,
    property_type: hotel.propertyType,
    refundable: hotel.refundable,
    pay_later: hotel.payLater,
  };
}

function createRoomProperties(room: Room) {
  return {
    room_id: room.id,
    room_name: room.name,
    room_capacity: room.capacity,
    room_refundable: room.refundable,
    breakfast_included: room.breakfastIncluded,
  };
}
