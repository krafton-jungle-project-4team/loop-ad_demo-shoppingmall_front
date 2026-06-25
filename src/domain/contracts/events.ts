import type {
  CampaignId,
  CouponId,
  EventId,
  OrderId,
  ProductId,
  ScenarioId,
  SessionId,
  SkuId,
} from "@/domain/contracts/ids";

export const DEMO_EVENT_TYPES = [
  "APP_STARTED",
  "CAMPAIGN_LANDED",
  "HOME_VIEWED",
  "SEARCH_EXECUTED",
  "PRODUCT_LIST_VIEWED",
  "PRODUCT_VIEWED",
  "OPTION_SELECTED",
  "CART_ITEM_ADDED",
  "CART_QUANTITY_CHANGED",
  "CART_ITEM_REMOVED",
  "COUPON_APPLIED",
  "CHECKOUT_STARTED",
  "PAYMENT_SIMULATED",
  "ORDER_CREATED",
  "ORDER_VIEWED",
  "DEMO_SCENARIO_CHANGED",
  "DEMO_RESET",
  "PWA_INSTALL_AVAILABLE",
  "PWA_INSTALLED",
  "PWA_UPDATE_AVAILABLE",
] as const;

export type DemoEventType = (typeof DEMO_EVENT_TYPES)[number];
export type DisplayMode = "browser" | "standalone";
export type EmptyPayload = Record<string, never>;

export interface DemoEventPayloadMap {
  APP_STARTED: EmptyPayload;
  CAMPAIGN_LANDED: {
    source?: string;
    campaignId?: CampaignId;
    couponId?: CouponId;
    productId?: ProductId;
  };
  HOME_VIEWED: EmptyPayload;
  SEARCH_EXECUTED: { query: string; resultCount?: number };
  PRODUCT_LIST_VIEWED: { categoryId?: string; resultCount: number };
  PRODUCT_VIEWED: { productId: ProductId };
  OPTION_SELECTED: { productId: ProductId; skuId?: SkuId; optionValueIds: string[] };
  CART_ITEM_ADDED: { productId: ProductId; skuId: SkuId; quantity: number };
  CART_QUANTITY_CHANGED: { productId: ProductId; skuId: SkuId; quantity: number };
  CART_ITEM_REMOVED: { productId: ProductId; skuId: SkuId };
  COUPON_APPLIED: { couponId: CouponId };
  CHECKOUT_STARTED: { selectedItemCount: number };
  PAYMENT_SIMULATED: { outcome: "success" | "failure"; reason?: string };
  ORDER_CREATED: { orderId: OrderId; finalTotal: number };
  ORDER_VIEWED: { orderId: OrderId };
  DEMO_SCENARIO_CHANGED: { scenarioId: ScenarioId };
  DEMO_RESET: { hardReset: boolean };
  PWA_INSTALL_AVAILABLE: EmptyPayload;
  PWA_INSTALLED: EmptyPayload;
  PWA_UPDATE_AVAILABLE: EmptyPayload;
}

export interface EventEnvelope<
  TType extends DemoEventType = DemoEventType,
  TPayload extends DemoEventPayloadMap[TType] = DemoEventPayloadMap[TType],
> {
  id: EventId;
  type: TType;
  occurredAt: string;
  sessionId: SessionId;
  route: string;
  displayMode: DisplayMode;
  scenarioId: ScenarioId;
  campaignId?: CampaignId;
  payload: TPayload;
}

export type DemoEvent<TType extends DemoEventType = DemoEventType> = EventEnvelope<
  TType,
  DemoEventPayloadMap[TType]
>;

export interface EventLogger {
  emit<TType extends DemoEventType>(event: DemoEvent<TType>): void;
  list(): DemoEvent[];
  clear(): void;
}
