import type { AdSlotConfig } from "@/config/ad-slots";
import type { AdvertisementFilledDecision } from "@/lib/loop-ad-sdk";

export function createFallbackAdDecision(
  slot: AdSlotConfig,
  projectId: string,
  promotionRunId: string,
  userId: string,
): AdvertisementFilledDecision {
  return {
    placementId: slot.id,
    placementKey: slot.id,
    status: "filled",
    ad: {
      title: slot.title,
      body: slot.description,
      cta: slot.ctaLabel,
      targetUrl: slot.linkTo,
    },
    tracking: {
      project_id: projectId,
      user_id: userId,
      campaign_id: slot.fallbackTracking.campaignId,
      promotion_id: slot.fallbackTracking.promotionId,
      promotion_run_id: promotionRunId,
      ad_experiment_id: slot.fallbackTracking.adExperimentId,
      segment_id: slot.fallbackTracking.segmentId,
      content_id: slot.contentId,
      content_option_id: slot.fallbackTracking.contentOptionId,
      promotion_channel: "onsite_banner",
      placement_id: slot.id,
      target_url: slot.linkTo,
    },
  };
}
