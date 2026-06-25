import type { Campaign } from "@/domain/contracts/campaign";
import type { Coupon, Promotion } from "@/domain/contracts/promotions";
import type { DemoScenario } from "@/domain/contracts/scenario";
import type { CampaignId, CouponId, PromotionId, ScenarioId } from "@/domain/contracts/ids";

export interface PromotionRepository {
  listPromotions(): Promise<Promotion[]>;
  getPromotion(promotionId: PromotionId): Promise<Promotion | null>;
  listCoupons(): Promise<Coupon[]>;
  getCoupon(couponId: CouponId): Promise<Coupon | null>;
}

export interface CampaignRepository {
  listCampaigns(): Promise<Campaign[]>;
  getCampaign(campaignId: CampaignId): Promise<Campaign | null>;
}

export interface ScenarioRepository {
  listScenarios(): Promise<DemoScenario[]>;
  getScenario(scenarioId: ScenarioId): Promise<DemoScenario | null>;
}
