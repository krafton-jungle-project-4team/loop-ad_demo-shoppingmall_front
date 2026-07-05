export type AdSlotId = "C1_MAIN_TOP" | "W1_WING";

export type AdSlotConfig = {
  id: AdSlotId;
  creativeId: string;
  fallbackTracking: {
    experimentId: string;
    variantId: string;
    mappingId: string;
    actionId: string;
  };
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
    fallbackTracking: {
      experimentId: "fallback-main-top",
      variantId: "fallback-main-top-a",
      mappingId: "fallback-main-top-mapping",
      actionId: "fallback-main-top-action",
    },
    title: "여름 숙소 세일",
    description: "회원가와 무료 취소 가능 숙소를 한 번에 비교해보세요.",
    ctaLabel: "특가 숙소 보기",
    linkTo: "/search?deal=summer",
    desktopImage: "/ads/main-desktop.webp",
    mobileImage: "/ads/main-mobile.webp",
  },
  W1_WING: {
    id: "W1_WING",
    creativeId: "loop-w1-wing-special",
    fallbackTracking: {
      experimentId: "fallback-wing",
      variantId: "fallback-wing-a",
      mappingId: "fallback-wing-mapping",
      actionId: "fallback-wing-action",
    },
    title: "주말 여행 추천 숙소",
    description: "도심 호텔부터 오션뷰 리조트까지 지금 예약하기 좋은 숙소",
    ctaLabel: "추천 숙소 보기",
    linkTo: "/search?deal=summer",
    desktopImage: "/ads/wing-desktop.webp",
  },
};
