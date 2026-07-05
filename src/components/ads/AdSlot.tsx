import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { adSlots, type AdSlotId } from "@/config/ad-slots";
import {
  renderLoopAdPlacement,
  type AdvertisementFilledDecision,
} from "@/lib/loop-ad-sdk";
import { cn } from "@/lib/utils";
import {
  createAdDecisionEventPayload,
  emitAdEvent,
  trackAdEventWithSdk,
} from "@/utils/ad-events";

type AdSlotProps = {
  slotId: AdSlotId;
  className?: string;
};

type AdRenderState = "loading" | "filled" | "fallback";
type AdRenderSnapshot = {
  key: string;
  state: AdRenderState;
};

function getCurrentViewportWidth(): number {
  if (typeof window === "undefined") {
    return 1440;
  }

  return window.innerWidth;
}

export function AdSlot({ slotId, className }: AdSlotProps) {
  const slot = adSlots[slotId];
  const location = useLocation();
  const page = location.pathname;
  const isWingSlot = slotId === "W1_WING";
  const renderKey = `${page}:${slot.id}`;
  const [renderSnapshot, setRenderSnapshot] = useState<AdRenderSnapshot>({
    key: renderKey,
    state: "loading",
  });
  const renderState =
    renderSnapshot.key === renderKey ? renderSnapshot.state : "loading";
  const sdkTargetId = useMemo(
    () => `loopad-${slot.id.toLowerCase().replace(/_/g, "-")}`,
    [slot.id],
  );

  const reportDecisionEvent = useCallback(
    (
      eventName: "promotion_impression" | "promotion_click",
      decision: AdvertisementFilledDecision,
      source: "advertisement_sdk",
    ) => {
      const payload = createAdDecisionEventPayload(
        eventName,
        slot,
        decision,
        page,
        getCurrentViewportWidth(),
      );

      emitAdEvent(payload);
      trackAdEventWithSdk(payload, {
        campaignId: decision.tracking.campaign_id,
        promotionId: decision.tracking.promotion_id,
        promotionRunId: decision.tracking.promotion_run_id,
        adExperimentId: decision.tracking.ad_experiment_id,
        promotionChannel: decision.tracking.promotion_channel,
        segmentId: decision.tracking.segment_id,
        contentId: decision.tracking.content_id,
        contentOptionId: decision.tracking.content_option_id,
        placementId: decision.tracking.placement_id,
        targetUrl: decision.tracking.target_url,
        properties: {
          placement_id: decision.tracking.placement_id,
          source,
        },
      });
    },
    [page, slot],
  );

  useEffect(() => {
    let isMounted = true;

    void renderLoopAdPlacement({
      placementKey: slot.id,
      targetId: sdkTargetId,
      page,
      onImpression: (decision) =>
        reportDecisionEvent("promotion_impression", decision, "advertisement_sdk"),
      onClick: (decision) =>
        reportDecisionEvent("promotion_click", decision, "advertisement_sdk"),
    })
      .then((decision) => {
        if (!isMounted) {
          return;
        }

        setRenderSnapshot({
          key: renderKey,
          state: decision.status === "filled" ? "filled" : "fallback",
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        console.warn("Loop Ad Advertisement SDK render failed.", error);
        setRenderSnapshot({
          key: renderKey,
          state: "fallback",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [page, renderKey, reportDecisionEvent, sdkTargetId, slot]);

  return (
    <div
      aria-busy={renderState === "loading"}
      className={cn(
        "loopad-ad-slot relative overflow-hidden rounded-md border border-border bg-muted shadow-sm transition-colors",
        isWingSlot ? "min-h-[28rem]" : "min-h-[15rem] sm:min-h-[18rem]",
        className,
      )}
    >
      <div
        id={sdkTargetId}
        className={cn(
          "loopad-sdk-target absolute inset-0 z-[2]",
          renderState === "filled" ? "block" : "hidden",
        )}
      />
    </div>
  );
}
