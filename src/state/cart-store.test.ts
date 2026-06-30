import { describe, expect, it } from "vitest";

import {
  cartReducer,
  getCartItemCount,
  getCartSubtotal,
  normalizeQuantity,
} from "@/state/cart-core";

describe("cart store reducer", () => {
  it("merges matching product and option items", () => {
    const state = cartReducer(
      {
        items: [
          {
            productId: "fresh-salad-kit",
            option: "single",
            quantity: 1,
          },
        ],
      },
      {
        type: "add",
        item: {
          productId: "fresh-salad-kit",
          option: "single",
          quantity: 2,
        },
      },
    );

    expect(state.items).toEqual([
      {
        productId: "fresh-salad-kit",
        option: "single",
        quantity: 3,
      },
    ]);
  });

  it("normalizes invalid quantities to at least one", () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(2.8)).toBe(2);
  });

  it("counts cart item quantities", () => {
    expect(
      getCartItemCount([
        {
          productId: "fresh-salad-kit",
          quantity: 2,
        },
        {
          productId: "home-ceramic-mug",
          quantity: 3,
        },
      ]),
    ).toBe(5);
  });

  it("updates and removes matching product option items", () => {
    const updatedState = cartReducer(
      {
        items: [
          {
            productId: "fresh-salad-kit",
            option: "single",
            quantity: 2,
          },
          {
            productId: "fresh-salad-kit",
            option: "family",
            quantity: 1,
          },
        ],
      },
      {
        type: "updateQuantity",
        productId: "fresh-salad-kit",
        option: "family",
        quantity: 3,
      },
    );

    expect(updatedState.items).toContainEqual({
      productId: "fresh-salad-kit",
      option: "family",
      quantity: 3,
    });

    expect(
      cartReducer(updatedState, {
        type: "remove",
        productId: "fresh-salad-kit",
        option: "single",
      }).items,
    ).toEqual([
      {
        productId: "fresh-salad-kit",
        option: "family",
        quantity: 3,
      },
    ]);
  });

  it("calculates subtotal with option price deltas", () => {
    expect(
      getCartSubtotal([
        {
          productId: "fresh-salad-kit",
          option: "family",
          quantity: 2,
        },
      ]),
    ).toBe(39800);
  });
});
