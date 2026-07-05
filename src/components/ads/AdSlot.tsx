import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { adSlots, type AdSlotId } from "@/config/ad-slots";
import {
  getDemoIdentity,
  loopAdSdkConfig,
  renderLoopAdPlacement,
  type AdvertisementFilledDecision,
} from "@/lib/loop-ad-sdk";
import { cn } from "@/lib/utils";
import { createFallbackAdDecision } from "@/utils/ad-fallback";
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

const trackedImpressionKeys = new Set<string>();

function getCurrentViewportWidth(): number {
  if (typeof window === "undefined") {
    return 1440;
  }

  return window.innerWidth;
}

export function AdSlot({ slotId, className }: AdSlotProps) {
  const slot = adSlots[slotId];
  const location = useLocation();
  const [imageFailed, setImageFailed] = useState(false);
  const page = location.pathname;
  const isWingSlot = slotId === "W1_WING";
  const renderKey = `${page}:${slot.id}`;
  const [renderSnapshot, setRenderSnapshot] = useState<AdRenderSnapshot>({
    key: renderKey,
    state: "loading",
  });
  const renderState =
    renderSnapshot.key === renderKey ? renderSnapshot.state : "loading";
  const demoIdentity = getDemoIdentity();
  const sdkTargetId = useMemo(
    () => `loopad-${slot.id.toLowerCase().replace(/_/g, "-")}`,
    [slot.id],
  );
  const fallbackDecision = useMemo(
    () =>
      createFallbackAdDecision(
        slot,
        loopAdSdkConfig.projectId,
        loopAdSdkConfig.promotionRunId,
        demoIdentity?.userId ?? "demo-user-anonymous",
      ),
    [demoIdentity?.userId, slot],
  );
  const impressionKey = useMemo(
    () => `${page}:${slot.id}:${slot.contentId}`,
    [page, slot.contentId, slot.id],
  );

  const reportDecisionEvent = useCallback(
    (
      eventName: "promotion_impression" | "promotion_click",
      decision: AdvertisementFilledDecision,
      source: "advertisement_sdk" | "advertisement_fallback",
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
          fallback: source === "advertisement_fallback",
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

  useEffect(() => {
    if (renderState !== "fallback") {
      return;
    }

    if (trackedImpressionKeys.has(impressionKey)) {
      return;
    }

    trackedImpressionKeys.add(impressionKey);
    reportDecisionEvent(
      "promotion_impression",
      fallbackDecision,
      "advertisement_fallback",
    );
  }, [fallbackDecision, impressionKey, reportDecisionEvent, renderState]);

  function handleAdClick() {
    reportDecisionEvent(
      "promotion_click",
      fallbackDecision,
      "advertisement_fallback",
    );
  }

  return (
    <div
      aria-busy={renderState === "loading"}
      className={cn(
        "loopad-ad-slot relative overflow-hidden rounded-md border border-border bg-card shadow-sm transition-colors",
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

      {renderState !== "filled" ? (
        <Link
          to={slot.linkTo}
          onClick={handleAdClick}
          aria-label={`${slot.title} ${slot.ctaLabel}`}
          className="group absolute inset-0 z-[1] flex transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {slot.desktopImage && !imageFailed ? (
            <picture className="absolute inset-0">
              {slot.mobileImage ? (
                <source media="(max-width: 767px)" srcSet={slot.mobileImage} />
              ) : null}
              <img
                src={slot.desktopImage}
                alt=""
                aria-hidden="true"
                className="size-full object-cover"
                onError={() => setImageFailed(true)}
              />
            </picture>
          ) : null}

          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-muted",
              !imageFailed && slot.desktopImage ? "opacity-80" : "opacity-100",
            )}
          />

          <div className="relative z-[1] flex w-full flex-col justify-between gap-6 p-5 sm:p-7">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-muted-foreground">{slot.id}</p>
              <div className="flex flex-col gap-2">
                <h2
                  className={cn(
                    "font-bold tracking-normal text-foreground",
                    isWingSlot ? "text-2xl" : "text-3xl sm:text-4xl",
                  )}
                >
                  {slot.title}
                </h2>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {slot.description}
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
              {slot.ctaLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
          </div>
        </Link>
      ) : null}
    </div>
  );
}
