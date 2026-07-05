import { describe, expect, it } from "vitest";

import { adSlots } from "@/config/ad-slots";
import { createFallbackAdDecision } from "@/utils/ad-fallback";

describe("ad fallback decision", () => {
  it("creates a filled decision from local ad slot config", () => {
    expect(
      createFallbackAdDecision(
        adSlots.C1_MAIN_TOP,
        "demo_project",
        "demo_project",
        "demo-user-1",
      ),
    ).toEqual({
      placementId: "C1_MAIN_TOP",
      placementKey: "C1_MAIN_TOP",
      status: "filled",
      ad: {
        title: "여름 숙소 세일",
        body: "회원가와 무료 취소 가능 숙소를 한 번에 비교해보세요.",
        cta: "특가 숙소 보기",
        targetUrl: "/search?deal=summer",
      },
      tracking: {
        project_id: "demo_project",
        user_id: "demo-user-1",
        campaign_id: "fallback-main-top-campaign",
        promotion_id: "fallback-main-top-promotion",
        promotion_run_id: "demo_project",
        ad_experiment_id: "fallback-main-top-experiment",
        segment_id: "fallback-main-top-segment",
        content_id: "loop-c1-summer-sale",
        content_option_id: "fallback-main-top-a",
        promotion_channel: "onsite_banner",
        placement_id: "C1_MAIN_TOP",
        target_url: "/search?deal=summer",
      },
    });
  });
});
