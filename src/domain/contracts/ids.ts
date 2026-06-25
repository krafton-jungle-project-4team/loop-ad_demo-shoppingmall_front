export type CategoryId = `C${string}`;
export type ProductId = `P${string}`;
export type SkuId = `SKU-${string}`;
export type PromotionId = `PROMO-${string}`;
export type CouponId = string;
export type CampaignId = `CMP-${string}`;
export type ScenarioId = string;
export type OrderId = `ORD-${string}`;
export type ClientTransactionId = `TX-${string}`;
export type SessionId = `SES-${string}`;
export type EventId = `EVT-${string}`;

export type DemoEntityId =
  | CategoryId
  | ProductId
  | SkuId
  | PromotionId
  | CouponId
  | CampaignId
  | ScenarioId
  | OrderId
  | ClientTransactionId
  | SessionId
  | EventId;
