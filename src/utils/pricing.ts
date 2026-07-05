const DEFAULT_NIGHTS = 2;
const TAX_RATE = 0.1;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

type PriceInput = {
  pricePerNight: number;
  originalPrice?: number;
  checkIn: string;
  checkOut: string;
  rooms: number;
};

export function getNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end.getTime() - start.getTime()) / DAY_IN_MS);

  if (!Number.isFinite(diff) || diff <= 0) {
    return DEFAULT_NIGHTS;
  }

  return diff;
}

export function calculatePrice({ pricePerNight, originalPrice, checkIn, checkOut, rooms }: PriceInput) {
  const nights = getNights(checkIn, checkOut);
  const roomCount = Math.max(1, rooms);
  const subtotal = pricePerNight * nights * roomCount;
  const taxAndFees = Math.round(subtotal * TAX_RATE);
  const discount = originalPrice ? Math.max(0, (originalPrice - pricePerNight) * nights * roomCount) : 0;
  const total = subtotal + taxAndFees;

  return {
    nights,
    subtotal,
    taxAndFees,
    discount,
    total,
  };
}
