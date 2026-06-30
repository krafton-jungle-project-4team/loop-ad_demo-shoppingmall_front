import { describe, expect, it } from "vitest";

import { SAMPLE_ORDER_ID, SAMPLE_ORDER_PATH } from "@/config/demo-routes";
import { sampleOrders } from "@/fixtures/orders";

describe("demo routes", () => {
  it("links to an existing sample order", () => {
    expect(SAMPLE_ORDER_PATH).toBe(`/orders/${SAMPLE_ORDER_ID}`);
    expect(sampleOrders.some((order) => order.id === SAMPLE_ORDER_ID)).toBe(true);
  });
});
