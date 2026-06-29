import { describe, expect, it } from "vitest";

import {
  getProductsByCategory,
  getProductsByPromotion,
  searchProducts,
} from "@/fixtures/product-helpers";

describe("product helpers", () => {
  it("finds products by category slug", () => {
    expect(getProductsByCategory("fresh").map((product) => product.id)).toContain(
      "fresh-salad-kit",
    );
  });

  it("returns promotion products in the local catalog", () => {
    expect(getProductsByPromotion("summer-sale").map((product) => product.id)).toContain(
      "style-daily-tote",
    );
  });

  it("searches across product names and descriptions", () => {
    expect(searchProducts("머그").map((product) => product.id)).toEqual([
      "home-ceramic-mug",
    ]);
  });
});
