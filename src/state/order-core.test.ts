import { describe, expect, it } from "vitest";

import { buildOrder, createOrderId, orderReducer } from "@/state/order-core";
import type { Order } from "@/types/commerce";

const existingOrder: Order = {
  id: "ORD-2026-0001",
  items: [],
  totalAmount: 0,
  createdAt: "2026-06-30T09:00:00+09:00",
  status: "paid",
};

describe("order store core", () => {
  it("creates a readable order id for the next sequence", () => {
    expect(createOrderId([existingOrder], new Date(2026, 5, 30))).toBe(
      "ORD-2026-0002",
    );
  });

  it("builds a paid order snapshot from cart items", () => {
    const cartItem = {
      productId: "fresh-salad-kit",
      option: "family",
      quantity: 1,
    };
    const order = buildOrder(
      {
        items: [cartItem],
        totalAmount: 22900,
        createdAt: "2026-06-30T10:00:00+09:00",
      },
      [existingOrder],
    );

    cartItem.quantity = 5;

    expect(order).toEqual({
      id: "ORD-2026-0002",
      items: [
        {
          productId: "fresh-salad-kit",
          option: "family",
          quantity: 1,
        },
      ],
      totalAmount: 22900,
      createdAt: "2026-06-30T10:00:00+09:00",
      status: "paid",
    });
  });

  it("prepends newly created orders", () => {
    const state = orderReducer(
      {
        orders: [existingOrder],
      },
      {
        type: "add",
        order: {
          ...existingOrder,
          id: "ORD-2026-0002",
        },
      },
    );

    expect(state.orders.map((order) => order.id)).toEqual([
      "ORD-2026-0002",
      "ORD-2026-0001",
    ]);
  });
});
