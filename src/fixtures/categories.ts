import type { Category } from "@/types/commerce";

export const categories: Category[] = [
  {
    id: "fresh",
    name: "신선식품",
    slug: "fresh",
    description: "아침 식탁에 올리기 좋은 신선한 먹거리",
    displayOrder: 1,
  },
  {
    id: "pantry",
    name: "간편식",
    slug: "pantry",
    description: "바쁜 날에도 편하게 챙기는 데일리 푸드",
    displayOrder: 2,
  },
  {
    id: "living",
    name: "생활용품",
    slug: "living",
    description: "집안일을 가볍게 만드는 기본 생활 아이템",
    displayOrder: 3,
  },
  {
    id: "digital",
    name: "디지털",
    slug: "digital",
    description: "책상과 일상을 정돈하는 작은 디지털 소품",
    displayOrder: 4,
  },
  {
    id: "style",
    name: "스타일",
    slug: "style",
    description: "매일 들기 좋은 베이직 패션 잡화",
    displayOrder: 5,
  },
  {
    id: "home",
    name: "홈데코",
    slug: "home",
    description: "공간의 분위기를 부드럽게 바꾸는 홈 아이템",
    displayOrder: 6,
  },
];
