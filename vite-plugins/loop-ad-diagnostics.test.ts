import { describe, expect, test } from "vitest";
import { collectLoopAdSourceReferences } from "./loop-ad-diagnostics";

describe("LoopAd diagnostics Vite source collector", () => {
  test("collects literal calls and DOM annotations but not type declarations", () => {
    const references = collectLoopAdSourceReferences(
      `
        type BookingEventName = "booking_start" | "booking_complete";
        trackLoopAdEvent("page_view");
        trackBookingEvent("booking_start");
        sdk.track("promotion_click", {});
        const button = <button data-loopad-event="hotel_click" />;
        trackLoopAdEvent(dynamicName);
      `,
      "src/example.tsx",
      { trackFunctions: new Set(["trackLoopAdEvent", "trackBookingEvent"]) },
    );

    expect(references.map(({ eventName, kind }) => ({ eventName, kind }))).toEqual([
      { eventName: "page_view", kind: "call" },
      { eventName: "booking_start", kind: "call" },
      { eventName: "promotion_click", kind: "call" },
      { eventName: "hotel_click", kind: "dom" },
    ]);
  });
});
