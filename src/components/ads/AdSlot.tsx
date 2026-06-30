import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { adSlots, type AdSlotId } from "@/config/ad-slots";
import { cn } from "@/lib/utils";
import { createAdEventPayload, emitAdEvent } from "@/utils/ad-events";

type AdSlotProps = {
  slotId: AdSlotId;
  className?: string;
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
  const impressionKey = useMemo(
    () => `${page}:${slot.id}:${slot.creativeId}`,
    [page, slot.creativeId, slot.id],
  );

  useEffect(() => {
    if (trackedImpressionKeys.has(impressionKey)) {
      return;
    }

    trackedImpressionKeys.add(impressionKey);
    emitAdEvent(
      createAdEventPayload("ad_impression", slot, page, getCurrentViewportWidth()),
    );
  }, [impressionKey, page, slot]);

  function handleAdClick() {
    emitAdEvent(createAdEventPayload("ad_click", slot, page, getCurrentViewportWidth()));
  }

  return (
    <Link
      to={slot.linkTo}
      onClick={handleAdClick}
      aria-label={`${slot.title} ${slot.ctaLabel}`}
      className={cn(
        "group relative flex overflow-hidden rounded-md border border-border bg-card shadow-sm transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isWingSlot
          ? "min-h-[28rem] flex-col justify-between p-5"
          : "min-h-[15rem] items-stretch sm:min-h-[18rem]",
        className,
      )}
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
  );
}
