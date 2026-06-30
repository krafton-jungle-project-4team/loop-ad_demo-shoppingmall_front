export type AdSlotId = "C1_MAIN_TOP" | "W1_WING";

export type AdSlotConfig = {
  id: AdSlotId;
  creativeId: string;
  title: string;
  description: string;
  ctaLabel: string;
  linkTo: string;
  desktopImage?: string;
  mobileImage?: string;
};

export const adSlots: Record<AdSlotId, AdSlotConfig> = {
  C1_MAIN_TOP: {
    id: "C1_MAIN_TOP",
    creativeId: "loop-c1-summer-sale",
    title: "상쾌한 데일리 특가",
    description: "가볍게 먹고 들기 좋은 계절 상품을 모았습니다.",
    ctaLabel: "기획전 보기",
    linkTo: "/promotion/summer-sale",
    desktopImage: "/ads/main-desktop.webp",
    mobileImage: "/ads/main-mobile.webp",
  },
  W1_WING: {
    id: "W1_WING",
    creativeId: "loop-w1-wing-special",
    title: "공간 정리 추천전",
    description: "책상과 방을 깔끔하게 만드는 실용 아이템",
    ctaLabel: "추천전 보기",
    linkTo: "/promotion/wing-special",
    desktopImage: "/ads/wing-desktop.webp",
  },
};
