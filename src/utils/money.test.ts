import { describe, expect, it } from "vitest";

import { products } from "@/fixtures/products";
import { calculateCartSubtotal, formatMoney, getDiscountRate } from "@/utils/money";

describe("money utilities", () => {
  it("formats Korean won without decimals", () => {
    expect(formatMoney(12900)).toBe("₩12,900");
  });

  it("calculates a rounded discount rate", () => {
    expect(getDiscountRate(15900, 12900)).toBe(19);
  });

  it("uses option price deltas in cart subtotal", () => {
    expect(
      calculateCartSubtotal(
        [
          {
            productId: "fresh-salad-kit",
            option: "family",
            quantity: 1,
          },
        ],
        products,
      ),
    ).toBe(19900);
  });
});
