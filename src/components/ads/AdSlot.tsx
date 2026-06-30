import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { adSlots, type AdSlotId } from "@/config/ad-slots";
import {
  renderLoopAdPlacement,
  type AdvertisementFilledDecision,
} from "@/lib/loop-ad-sdk";
import { cn } from "@/lib/utils";
import {
  createAdDecisionEventPayload,
  createAdEventPayload,
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
  const sdkTargetId = useMemo(
    () => `loopad-${slot.id.toLowerCase().replace(/_/g, "-")}`,
    [slot.id],
  );
  const impressionKey = useMemo(
    () => `${page}:${slot.id}:${slot.creativeId}`,
    [page, slot.creativeId, slot.id],
  );

  useEffect(() => {
    let isMounted = true;

    function reportDecisionEvent(
      eventName: "ad_impression" | "ad_click",
      decision: AdvertisementFilledDecision,
    ) {
      const payload = createAdDecisionEventPayload(
        eventName,
        slot,
        decision,
        page,
        getCurrentViewportWidth(),
      );

      emitAdEvent(payload);
      trackAdEventWithSdk(payload, {
        experimentId: decision.tracking.experimentId,
        variantId: decision.tracking.variantId,
        actionId: decision.tracking.actionId,
        mappingId: decision.tracking.mappingId,
        creativeId: decision.tracking.creativeId || decision.ad.creativeId,
        properties: {
          placement_key: decision.placementKey,
          source: "advertisement_sdk",
        },
      });
    }

    void renderLoopAdPlacement({
      placementKey: slot.id,
      targetId: sdkTargetId,
      page,
      onImpression: (decision) => reportDecisionEvent("ad_impression", decision),
      onClick: (decision) => reportDecisionEvent("ad_click", decision),
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
  }, [page, renderKey, sdkTargetId, slot]);

  useEffect(() => {
    if (renderState !== "fallback") {
      return;
    }

    if (trackedImpressionKeys.has(impressionKey)) {
      return;
    }

    trackedImpressionKeys.add(impressionKey);
    const payload = createAdEventPayload(
      "ad_impression",
      slot,
      page,
      getCurrentViewportWidth(),
    );

    emitAdEvent(payload);
    trackAdEventWithSdk(payload, {
      properties: {
        source: "fallback_ad_slot",
      },
    });
  }, [impressionKey, page, renderState, slot]);

  function handleAdClick() {
    const payload = createAdEventPayload(
      "ad_click",
      slot,
      page,
      getCurrentViewportWidth(),
    );

    emitAdEvent(payload);
    trackAdEventWithSdk(payload, {
      properties: {
        source: "fallback_ad_slot",
      },
    });
  }

  return (
    <div
      aria-busy={renderState === "loading"}
      className={cn(
        "loopad-ad-slot relative overflow-hidden rounded-md border border-border bg-card shadow-sm transition-colors",
        isWingSlot
          ? "loopad-ad-slot-wing min-h-[28rem]"
          : "loopad-ad-slot-main min-h-[15rem] sm:min-h-[18rem]",
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
