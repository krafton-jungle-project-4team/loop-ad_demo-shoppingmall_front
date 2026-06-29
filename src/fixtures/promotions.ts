import type { Promotion } from "@/types/commerce";

export const promotions: Promotion[] = [
  {
    id: "summer-sale",
    title: "상쾌한 데일리 특가",
    description: "가볍게 먹고 들기 좋은 계절 상품을 모았습니다.",
    productIds: [
      "fresh-salad-kit",
      "fresh-breakfast-box",
      "pantry-fruit-jam",
      "style-daily-tote",
      "home-ceramic-mug",
    ],
  },
  {
    id: "wing-special",
    title: "공간 정리 추천전",
    description: "책상과 방을 깔끔하게 만드는 실용 아이템을 소개합니다.",
    productIds: [
      "living-soft-towel",
      "digital-desk-lamp",
      "digital-mini-speaker",
      "home-cotton-bedding",
    ],
  },
  {
    id: "daily-picks",
    title: "오늘의 장보기 픽",
    description: "매일 쓰고 먹기 좋은 반복 구매 상품을 골랐습니다.",
    productIds: [
      "fresh-salad-kit",
      "fresh-tomato-pack",
      "pantry-drip-coffee",
      "living-storage-bag",
      "style-daily-tote",
    ],
  },
];
