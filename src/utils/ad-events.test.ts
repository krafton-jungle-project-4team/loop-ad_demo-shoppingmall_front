import { afterEach, describe, expect, it, vi } from "vitest";

import { adSlots } from "@/config/ad-slots";
import { createAdEventPayload, emitAdEvent, getAdViewport } from "@/utils/ad-events";

class TestCustomEvent<T> {
  detail: T;
  type: string;

  constructor(type: string, init: { detail: T }) {
    this.type = type;
    this.detail = init.detail;
  }
}

describe("ad events", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("classifies viewport widths", () => {
    expect(getAdViewport(390)).toBe("mobile");
    expect(getAdViewport(768)).toBe("tablet");
    expect(getAdViewport(1024)).toBe("tablet");
    expect(getAdViewport(1200)).toBe("desktop");
    expect(getAdViewport(1440)).toBe("desktop");
  });

  it("creates an ad event payload", () => {
    expect(
      createAdEventPayload(
        "promotion_click",
        adSlots.C1_MAIN_TOP,
        "/",
        1440,
        "2026-06-30T00:00:00.000Z",
      ),
    ).toEqual({
      eventName: "promotion_click",
      slotId: "C1_MAIN_TOP",
      contentId: "loop-c1-summer-sale",
      page: "/",
      viewport: "desktop",
      timestamp: "2026-06-30T00:00:00.000Z",
    });
  });

  it("logs and dispatches ad events for demo verification", () => {
    const payload = createAdEventPayload(
      "promotion_impression",
      adSlots.W1_WING,
      "/",
      1440,
      "2026-06-30T00:00:00.000Z",
    );
    const dispatchEvent = vi.fn();
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    vi.stubGlobal("window", { dispatchEvent });
    vi.stubGlobal("CustomEvent", TestCustomEvent);

    emitAdEvent(payload);

    expect(info).toHaveBeenCalledWith("[ad-event]", JSON.stringify(payload));
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ad-event",
        detail: payload,
      }),
    );
  });
});
