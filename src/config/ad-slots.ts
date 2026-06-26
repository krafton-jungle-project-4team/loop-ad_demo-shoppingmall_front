export type AdSlotId = "C1_MAIN_TOP" | "W1_WING";

export type AdSlotConfig = {
  slotId: AdSlotId;
  creativeId: string;
  desktopSrc: string;
  mobileSrc?: string;
  href: string;
  alt: string;
};

export const AD_SLOTS = {
  C1_MAIN_TOP: {
    slotId: "C1_MAIN_TOP",
    creativeId: "replace-me-main",
    desktopSrc: "/ads/main-desktop.webp",
    mobileSrc: "/ads/main-mobile.webp",
    href: "#",
    alt: "메인 프로모션 광고",
  },
  W1_WING: {
    slotId: "W1_WING",
    creativeId: "replace-me-wing",
    desktopSrc: "/ads/wing-desktop.webp",
    href: "#",
    alt: "윙 프로모션 광고",
  },
} satisfies Record<AdSlotId, AdSlotConfig>;
