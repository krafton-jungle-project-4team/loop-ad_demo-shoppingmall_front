import { describe, expect, it } from "vitest";

import { getProductById } from "@/fixtures/product-helpers";
import {
  createAddToCartFields,
  createCheckoutStartFields,
  createProductViewFields,
  createPurchaseFields,
} from "@/utils/commerce-events";

describe("commerce events", () => {
  it("creates product_view fields for the Event SDK contract", () => {
    const product = getProductById("fresh-salad-kit");

    expect(product).toBeDefined();
    expect(createProductViewFields(product!)).toMatchObject({
      channel: "demo-shoppingmall",
      category: "신선식품",
      productId: "fresh-salad-kit",
      inventoryStatus: "in_stock",
      price: 12900,
      properties: {
        category_id: "fresh",
        category_name: "신선식품",
        product_name: "새벽 수확 샐러드 키트",
        route_group: "product-detail",
      },
    });
  });

  it("creates add_to_cart fields with option price and quantity", () => {
    const product = getProductById("fresh-salad-kit");

    expect(product).toBeDefined();
    expect(createAddToCartFields(product!, "family", 2)).toMatchObject({
      productId: "fresh-salad-kit",
      price: 19900,
      quantity: 2,
      properties: {
        option_id: "family",
        option_label: "패밀리팩",
        unit_price: 19900,
        line_total: 39800,
      },
    });
  });

  it("creates checkout_start fields as a cart-level event", () => {
    expect(
      createCheckoutStartFields([
        {
          productId: "home-ceramic-mug",
          option: "cream",
          quantity: 1,
        },
        {
          productId: "fresh-salad-kit",
          option: "family",
          quantity: 2,
        },
      ]),
    ).toMatchObject({
      channel: "demo-shoppingmall",
      quantity: 3,
      properties: {
        cart_subtotal: 47700,
        shipping_fee: 0,
        cart_value: 47700,
        item_count: 3,
        distinct_item_count: 2,
      },
    });
  });

  it("creates purchase fields with order id and revenue", () => {
    expect(
      createPurchaseFields({
        id: "ORD-2026-0001",
        createdAt: "2026-06-30T00:00:00.000Z",
        status: "paid",
        totalAmount: 10900,
        items: [
          {
            productId: "home-ceramic-mug",
            option: "cream",
            quantity: 1,
          },
        ],
      }),
    ).toMatchObject({
      orderId: "ORD-2026-0001",
      productId: "home-ceramic-mug",
      price: 7900,
      quantity: 1,
      revenue: 10900,
      properties: {
        order_status: "paid",
        cart_subtotal: 7900,
        shipping_fee: 3000,
        order_total: 10900,
      },
    });
  });
});
