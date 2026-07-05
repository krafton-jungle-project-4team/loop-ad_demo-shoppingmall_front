import type { StoredBooking } from "@/types/booking";
import type { Hotel, Room } from "@/types/hotel";
import type { SearchState } from "@/types/search";
import { getLoopAdAttributionFields } from "@/utils/ad-attribution";
import { calculatePrice } from "@/utils/pricing";
import { trackLoopAdEvent, type LoopAdTrackFields } from "@/lib/loop-ad-sdk";

export type BookingEventName =
  | "search_submit"
  | "hotel_view"
  | "room_select"
  | "checkout_start"
  | "booking_complete";

const DEFAULT_CHANNEL = "demo-shoppingmall";
const INVENTORY_STATUS_AVAILABLE = "available";

export function trackSearchSubmit(searchState: SearchState): void {
  trackBookingEvent("search_submit", {
    channel: DEFAULT_CHANNEL,
    quantity: searchState.rooms,
    properties: {
      ...createSearchProperties(searchState),
      route_group: "search",
    },
  });
}

export function trackHotelView(hotel: Hotel, searchState: SearchState): void {
  trackBookingEvent("hotel_view", {
    channel: DEFAULT_CHANNEL,
    category: hotel.destination,
    productId: hotel.id,
    inventoryStatus: INVENTORY_STATUS_AVAILABLE,
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

  trackBookingEvent("room_select", {
    channel: DEFAULT_CHANNEL,
    category: hotel.destination,
    productId: hotel.id,
    inventoryStatus: INVENTORY_STATUS_AVAILABLE,
    price: room.pricePerNight,
    quantity: searchState.rooms,
    revenue: price.total,
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

  trackBookingEvent("checkout_start", {
    channel: DEFAULT_CHANNEL,
    category: hotel.destination,
    productId: hotel.id,
    inventoryStatus: INVENTORY_STATUS_AVAILABLE,
    price: room.pricePerNight,
    quantity: searchState.rooms,
    revenue: price.total,
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
    channel: DEFAULT_CHANNEL,
    category: booking.hotelName,
    productId: booking.hotelId,
    inventoryStatus: INVENTORY_STATUS_AVAILABLE,
    quantity: booking.rooms,
    revenue: booking.total,
    orderId: booking.bookingNumber,
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
