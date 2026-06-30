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
        title: "상쾌한 데일리 특가",
        body: "가볍게 먹고 들기 좋은 계절 상품을 모았습니다.",
        ctaLabel: "기획전 보기",
        imageUrl: "/ads/main-desktop.webp",
        landingUrl: "/promotion/summer-sale",
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
