import { describe, expect, it } from "vitest";

import { adSlots } from "@/config/ad-slots";
import { createFallbackAdDecision } from "@/utils/ad-fallback";

describe("ad fallback decision", () => {
  it("creates a filled decision from local ad slot config", () => {
    expect(
      createFallbackAdDecision(adSlots.C1_MAIN_TOP, "demo-shoppingmall"),
    ).toEqual({
      placementKey: "C1_MAIN_TOP",
      status: "filled",
      ad: {
        creativeId: "loop-c1-summer-sale",
        contentType: "image",
        title: "여름 숙소 세일",
        body: "회원가와 무료 취소 가능 숙소를 한 번에 비교해보세요.",
        ctaLabel: "특가 숙소 보기",
        imageUrl: "/ads/main-desktop.webp",
        landingUrl: "/search?deal=summer",
      },
      tracking: {
        projectId: "demo-shoppingmall",
        creativeId: "loop-c1-summer-sale",
        experimentId: "fallback-main-top",
        variantId: "fallback-main-top-a",
        mappingId: "fallback-main-top-mapping",
        actionId: "fallback-main-top-action",
      },
    });
  });
});
