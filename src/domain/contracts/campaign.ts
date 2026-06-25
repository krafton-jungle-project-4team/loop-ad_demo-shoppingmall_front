import type { CampaignId, CouponId, ProductId, ScenarioId } from "@/domain/contracts/ids";

export interface CampaignLanding {
  source?: string;
  campaignId?: CampaignId;
  couponId?: CouponId;
  productId?: ProductId;
  scenarioId?: ScenarioId;
  landedAt: string;
}

export interface Campaign {
  id: CampaignId;
  label: string;
  landingProductId: ProductId;
  defaultCouponId?: CouponId;
  defaultScenarioId?: ScenarioId;
}
