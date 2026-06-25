import type { CouponId, ProductId, PromotionId } from "@/domain/contracts/ids";

export type DiscountType = "fixed" | "rate";

export interface Promotion {
  id: PromotionId;
  label: string;
  type: DiscountType;
  value: number;
  startsAt?: string;
  endsAt?: string;
  eligibleProductIds?: ProductId[];
}

export interface Coupon {
  id: CouponId;
  label: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  eligibleProductIds?: ProductId[];
}
