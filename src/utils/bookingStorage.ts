import type { StoredBooking } from '../types/booking';

const BOOKING_STORAGE_KEY = 'stayloop:lastBooking';

export function saveLastBooking(booking: StoredBooking): void {
  sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(booking));
}

export function cancelLastBooking(
  booking: StoredBooking,
  cancelledAt = new Date().toISOString(),
): StoredBooking {
  const cancelledBooking: StoredBooking = {
    ...booking,
    status: 'cancelled',
    cancelledAt,
  };

  saveLastBooking(cancelledBooking);
  return cancelledBooking;
}

export function getLastBooking(): StoredBooking | null {
  const rawBooking = sessionStorage.getItem(BOOKING_STORAGE_KEY);

  if (!rawBooking) {
    return null;
  }

  try {
    return JSON.parse(rawBooking) as StoredBooking;
  } catch {
    return null;
  }
}

export function createBookingNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');

  return `STAY-${date}-${suffix}`;
}
