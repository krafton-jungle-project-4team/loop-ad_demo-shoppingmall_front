import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { adSlots, type AdSlotId } from "@/config/ad-slots";
import {
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
const DEFAULT_AD_IMAGE_ASPECT_RATIO = "1200 / 628";

function getCurrentViewportWidth(): number {
  if (typeof window === "undefined") {
    return 1440;
  }

  return window.innerWidth;
}

function setAdImageAspectRatio(
  slotElement: HTMLElement,
  imageElement: HTMLImageElement,
) {
  if (imageElement.naturalWidth <= 0 || imageElement.naturalHeight <= 0) {
    return;
  }

  slotElement.style.setProperty(
    "--loopad-ad-aspect-ratio",
    `${imageElement.naturalWidth} / ${imageElement.naturalHeight}`,
  );
}

export function AdSlot({ slotId, className }: AdSlotProps) {
  const slot = adSlots[slotId];
  const location = useLocation();
  const slotRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const page = location.pathname;
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
  const fallbackDecision = useMemo(
    () => createFallbackAdDecision(slot, loopAdSdkConfig.projectId),
    [slot],
  );
  const impressionKey = useMemo(
    () => `${page}:${slot.id}:${slot.creativeId}`,
    [page, slot.creativeId, slot.id],
  );

  useEffect(() => {
    const slotElement = slotRef.current;

    if (!slotElement) {
      return undefined;
    }

    slotElement.style.setProperty(
      "--loopad-ad-aspect-ratio",
      DEFAULT_AD_IMAGE_ASPECT_RATIO,
    );

    let observedImage: HTMLImageElement | null = null;
    let removeLoadListener: (() => void) | null = null;

    const observeRenderedImage = () => {
      const imageElement = slotElement.querySelector<HTMLImageElement>("img");

      if (imageElement === observedImage) {
        if (imageElement) {
          setAdImageAspectRatio(slotElement, imageElement);
        }

        return;
      }

      removeLoadListener?.();
      removeLoadListener = null;
      observedImage = imageElement;

      if (!imageElement) {
        return;
      }

      const applyAspectRatio = () => {
        setAdImageAspectRatio(slotElement, imageElement);
      };

      if (imageElement.complete) {
        applyAspectRatio();
        return;
      }

      imageElement.addEventListener("load", applyAspectRatio, { once: true });
      removeLoadListener = () => {
        imageElement.removeEventListener("load", applyAspectRatio);
      };
    };

    observeRenderedImage();

    const observer = new MutationObserver(observeRenderedImage);
    observer.observe(slotElement, {
      attributes: true,
      attributeFilter: ["src", "srcset"],
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      removeLoadListener?.();
    };
  }, [renderKey]);

  const reportDecisionEvent = useCallback(
    (
      eventName: "ad_impression" | "ad_click",
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
        experimentId: decision.tracking.experimentId,
        variantId: decision.tracking.variantId,
        actionId: decision.tracking.actionId,
        mappingId: decision.tracking.mappingId,
        creativeId: decision.tracking.creativeId || decision.ad.creativeId,
        properties: {
          placement_key: decision.placementKey,
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
        reportDecisionEvent("ad_impression", decision, "advertisement_sdk"),
      onClick: (decision) =>
        reportDecisionEvent("ad_click", decision, "advertisement_sdk"),
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
      "ad_impression",
      fallbackDecision,
      "advertisement_fallback",
    );
  }, [fallbackDecision, impressionKey, reportDecisionEvent, renderState]);

  function handleAdClick() {
    reportDecisionEvent(
      "ad_click",
      fallbackDecision,
      "advertisement_fallback",
    );
  }

  return (
    <div
      ref={slotRef}
      aria-busy={renderState === "loading"}
      className={cn(
        "loopad-ad-slot relative overflow-hidden rounded-md border border-border bg-card shadow-sm transition-colors",
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
          data-ad-creative-id={slot.creativeId}
          data-ad-description={slot.description}
          data-ad-title={slot.title}
          data-ad-cta-label={slot.ctaLabel}
          className="absolute inset-0 z-[1] block bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                className="size-full object-contain"
                onError={() => setImageFailed(true)}
              />
            </picture>
          ) : null}
        </Link>
      ) : null}
    </div>
  );
}
