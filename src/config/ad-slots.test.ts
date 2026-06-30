import { describe, expect, it } from "vitest";

import { adSlots, type AdSlotId } from "@/config/ad-slots";

describe("ad slot configuration", () => {
  it("keeps configured slot ids in sync with their record keys", () => {
    const slotIds = Object.keys(adSlots) as AdSlotId[];

    expect(slotIds).toEqual(["C1_MAIN_TOP", "W1_WING"]);
    expect(slotIds.every((slotId) => adSlots[slotId].id === slotId)).toBe(true);
  });

  it("routes C1 and W1 ads to their promotion landing pages", () => {
    expect(adSlots.C1_MAIN_TOP).toMatchObject({
      linkTo: "/promotion/summer-sale",
      desktopImage: "/ads/main-desktop.webp",
      mobileImage: "/ads/main-mobile.webp",
    });
    expect(adSlots.W1_WING).toMatchObject({
      linkTo: "/promotion/wing-special",
      desktopImage: "/ads/wing-desktop.webp",
    });
  });

  it("uses unique creative ids for ad event attribution", () => {
    const creativeIds = Object.values(adSlots).map((slot) => slot.creativeId);

    expect(new Set(creativeIds).size).toBe(creativeIds.length);
  });

  it("uses stable fallback tracking ids for each ad slot", () => {
    expect(adSlots.C1_MAIN_TOP.fallbackTracking).toEqual({
      experimentId: "fallback-main-top",
      variantId: "fallback-main-top-a",
      mappingId: "fallback-main-top-mapping",
      actionId: "fallback-main-top-action",
    });
    expect(adSlots.W1_WING.fallbackTracking).toEqual({
      experimentId: "fallback-wing",
      variantId: "fallback-wing-a",
      mappingId: "fallback-wing-mapping",
      actionId: "fallback-wing-action",
    });
  });
});
