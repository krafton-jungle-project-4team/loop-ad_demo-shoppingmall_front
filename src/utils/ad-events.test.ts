import { describe, expect, it } from "vitest";

import { adSlots } from "@/config/ad-slots";
import { createAdEventPayload, getAdViewport } from "@/utils/ad-events";

describe("ad events", () => {
  it("classifies viewport widths", () => {
    expect(getAdViewport(390)).toBe("mobile");
    expect(getAdViewport(1024)).toBe("tablet");
    expect(getAdViewport(1440)).toBe("desktop");
  });

  it("creates an ad event payload", () => {
    expect(
      createAdEventPayload(
        "ad_click",
        adSlots.C1_MAIN_TOP,
        "/",
        1440,
        "2026-06-30T00:00:00.000Z",
      ),
    ).toEqual({
      eventName: "ad_click",
      slotId: "C1_MAIN_TOP",
      creativeId: "loop-c1-summer-sale",
      page: "/",
      viewport: "desktop",
      timestamp: "2026-06-30T00:00:00.000Z",
    });
  });
});
