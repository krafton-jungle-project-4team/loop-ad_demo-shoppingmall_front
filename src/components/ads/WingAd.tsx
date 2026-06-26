import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/config/ad-slots";

export function WingAd() {
  return (
    <AdSlot
      className="hidden min-[1200px]:block min-h-44"
      fallbackClassName="bg-warm text-warm-foreground"
      imageClassName="object-cover"
      slot={AD_SLOTS.W1_WING}
    />
  );
}
