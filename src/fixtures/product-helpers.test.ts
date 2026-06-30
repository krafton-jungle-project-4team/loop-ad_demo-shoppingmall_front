import { describe, expect, it } from "vitest";

import {
  getCatalogProducts,
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

  it("combines category and keyword filters for product listing", () => {
    expect(
      getCatalogProducts({ category: "fresh", keyword: "과일" }).map(
        (product) => product.id,
      ),
    ).toEqual(["fresh-breakfast-box"]);
  });

  it("sorts product listing by low price", () => {
    expect(getCatalogProducts({ sort: "price-low" }).at(0)?.id).toBe(
      "pantry-grain-bread",
    );
  });

  it("returns an empty list for an unknown category", () => {
    expect(getCatalogProducts({ category: "unknown" })).toEqual([]);
  });
});
