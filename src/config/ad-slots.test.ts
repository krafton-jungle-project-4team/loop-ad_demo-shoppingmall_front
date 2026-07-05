import { describe, expect, it } from "vitest";

import { adSlots, type AdSlotId } from "@/config/ad-slots";

describe("ad slot configuration", () => {
  it("keeps configured slot ids in sync with their record keys", () => {
    const slotIds = Object.keys(adSlots) as AdSlotId[];

    expect(slotIds).toEqual(["C1_MAIN_TOP", "W1_WING"]);
    expect(slotIds.every((slotId) => adSlots[slotId].id === slotId)).toBe(true);
  });

  it("routes C1 and W1 ads to booking promotion landing pages", () => {
    expect(adSlots.C1_MAIN_TOP).toMatchObject({
      linkTo: "/search?deal=summer",
      desktopImage: "/ads/main-desktop.webp",
      mobileImage: "/ads/main-mobile.webp",
    });
    expect(adSlots.W1_WING).toMatchObject({
      linkTo: "/search?deal=summer",
      desktopImage: "/ads/wing-desktop.webp",
    });
  });

  it("uses unique content ids for ad event attribution", () => {
    const contentIds = Object.values(adSlots).map((slot) => slot.contentId);

    expect(new Set(contentIds).size).toBe(contentIds.length);
  });

  it("uses stable fallback tracking ids for each ad slot", () => {
    expect(adSlots.C1_MAIN_TOP.fallbackTracking).toEqual({
      campaignId: "fallback-main-top-campaign",
      promotionId: "fallback-main-top-promotion",
      adExperimentId: "fallback-main-top-experiment",
      segmentId: "fallback-main-top-segment",
      contentOptionId: "fallback-main-top-a",
    });
    expect(adSlots.W1_WING.fallbackTracking).toEqual({
      campaignId: "fallback-wing-campaign",
      promotionId: "fallback-wing-promotion",
      adExperimentId: "fallback-wing-experiment",
      segmentId: "fallback-wing-segment",
      contentOptionId: "fallback-wing-a",
    });
  });
});
