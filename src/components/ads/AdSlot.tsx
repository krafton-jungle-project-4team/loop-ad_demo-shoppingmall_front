import { useState } from "react";
import type { AdSlotConfig } from "@/config/ad-slots";
import { cn } from "@/lib/utils";

type AdSlotProps = {
  slot: AdSlotConfig;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  useMobileSource?: boolean;
};

export function AdSlot({
  slot,
  className,
  imageClassName,
  fallbackClassName,
  useMobileSource = false,
}: AdSlotProps) {
  const [isImageReady, setIsImageReady] = useState(false);

  return (
    <a
      aria-label={slot.alt}
      className={cn(
        "group relative block overflow-hidden rounded-lg border border-border bg-surface outline-none ring-ring transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      href={slot.href}
    >
      <picture>
        {useMobileSource && slot.mobileSrc ? (
          <source media="(max-width: 767px)" srcSet={slot.mobileSrc} />
        ) : null}
        <img
          alt={slot.alt}
          className={cn(
            "absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-200",
            isImageReady ? "opacity-100" : null,
            imageClassName,
          )}
          decoding="async"
          onError={() => setIsImageReady(false)}
          onLoad={() => setIsImageReady(true)}
          src={slot.desktopSrc}
        />
      </picture>

      <span
        aria-hidden={isImageReady}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center",
          "bg-surface text-surface-foreground",
          isImageReady ? "opacity-0" : "opacity-100",
          fallbackClassName,
        )}
      >
        <span className="text-sm font-semibold">{slot.slotId}</span>
        <span className="text-sm opacity-80">광고 콘텐츠 준비 중</span>
      </span>
    </a>
  );
}
