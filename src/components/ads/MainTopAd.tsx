import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/config/ad-slots";

export function MainTopAd() {
  return (
    <AdSlot
      className="aspect-[720/380] min-h-48 md:aspect-[1920/450] md:min-h-44"
      slot={AD_SLOTS.C1_MAIN_TOP}
      useMobileSource
    />
  );
}
