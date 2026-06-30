import type { AdSlotConfig } from "@/config/ad-slots";
import type { AdvertisementFilledDecision } from "@/lib/loop-ad-sdk";

export function createFallbackAdDecision(
  slot: AdSlotConfig,
  projectId: string,
): AdvertisementFilledDecision {
  return {
    placementKey: slot.id,
    status: "filled",
    ad: {
      creativeId: slot.creativeId,
      contentType: "image",
      title: slot.title,
      body: slot.description,
      ctaLabel: slot.ctaLabel,
      imageUrl: slot.desktopImage ?? slot.mobileImage ?? "",
      landingUrl: slot.linkTo,
    },
    tracking: {
      projectId,
      creativeId: slot.creativeId,
      experimentId: slot.fallbackTracking.experimentId,
      variantId: slot.fallbackTracking.variantId,
      mappingId: slot.fallbackTracking.mappingId,
      actionId: slot.fallbackTracking.actionId,
    },
  };
}
