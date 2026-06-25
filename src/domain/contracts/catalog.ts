import type { CategoryId, ProductId, PromotionId, SkuId } from "@/domain/contracts/ids";
import type { CurrencyCode } from "@/domain/contracts/money";

export interface DemoImage {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Category {
  id: CategoryId;
  label: string;
  parentId?: CategoryId;
  sortOrder: number;
}

export interface DeliveryPresentation {
  label: string;
  fee: number;
  freeThreshold?: number;
  estimatedArrivalLabel: string;
}

export interface OptionValue {
  id: string;
  label: string;
  swatch?: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  values: OptionValue[];
}

export interface Sku {
  id: SkuId;
  optionValueIds: string[];
  priceDelta: number;
  stock: number;
  soldOut: boolean;
  imageId?: string;
}

export interface Product {
  id: ProductId;
  categoryId: CategoryId;
  brand: string;
  name: string;
  shortDescription: string;
  images: DemoImage[];
  basePrice: number;
  currency: CurrencyCode;
  badges: string[];
  rating: number;
  reviewCount: number;
  delivery: DeliveryPresentation;
  optionGroups: OptionGroup[];
  skus: Sku[];
  promotionIds: PromotionId[];
  keywords: string[];
}
