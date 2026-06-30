import { SAMPLE_ORDER_ID } from "@/config/demo-routes";
import type { Order } from "@/types/commerce";

export const sampleOrders: Order[] = [
  {
    id: SAMPLE_ORDER_ID,
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
