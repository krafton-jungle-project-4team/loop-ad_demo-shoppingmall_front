import type { Order } from "@/types/commerce";

export const sampleOrders: Order[] = [
  {
    id: "ORD-2026-0001",
    items: [
      {
        productId: "fresh-salad-kit",
        option: "family",
        quantity: 1,
      },
      {
        productId: "home-ceramic-mug",
        option: "cream",
        quantity: 2,
      },
    ],
    totalAmount: 35700,
    createdAt: "2026-06-30T09:00:00+09:00",
    status: "preparing",
  },
];
