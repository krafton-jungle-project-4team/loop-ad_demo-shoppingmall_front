import { describe, expect, it } from "vitest";

import { buildCommerceLineItems, calculateOrderAmounts } from "@/utils/order-summary";

describe("order summary utilities", () => {
  it("builds commerce line items with option labels and totals", () => {
    expect(
      buildCommerceLineItems([
        {
          productId: "fresh-salad-kit",
          option: "family",
          quantity: 2,
        },
      ]).map((lineItem) => ({
        productId: lineItem.product.id,
        optionLabel: lineItem.optionLabel,
        unitPrice: lineItem.unitPrice,
        lineTotal: lineItem.lineTotal,
      })),
    ).toEqual([
      {
        productId: "fresh-salad-kit",
        optionLabel: "패밀리팩",
        unitPrice: 19900,
        lineTotal: 39800,
      },
    ]);
  });

  it("adds mock shipping for orders below the free shipping threshold", () => {
    expect(
      calculateOrderAmounts([
        {
          productId: "home-ceramic-mug",
          option: "cream",
          quantity: 1,
        },
      ]),
    ).toEqual({
      subtotal: 7900,
      shippingFee: 3000,
      totalAmount: 10900,
      amountUntilFreeShipping: 22100,
    });
  });

  it("keeps shipping free when the subtotal reaches the threshold", () => {
    expect(
      calculateOrderAmounts([
        {
          productId: "fresh-salad-kit",
          option: "family",
          quantity: 2,
        },
      ]),
    ).toMatchObject({
      subtotal: 39800,
      shippingFee: 0,
      totalAmount: 39800,
    });
  });
});
