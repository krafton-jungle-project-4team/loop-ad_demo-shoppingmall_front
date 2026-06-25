import { z } from "zod";

export const STORAGE_SCHEMA_VERSION = 1;

export const COMMERCE_STORAGE_KEYS = {
  cart: "commerce-demo.cart.v1",
  orders: "commerce-demo.orders.v1",
  campaign: "commerce-demo.campaign.v1",
  scenario: "commerce-demo.scenario.v1",
  events: "commerce-demo.events.v1",
  settings: "commerce-demo.settings.v1",
} as const;

export type CommerceStorageKey =
  (typeof COMMERCE_STORAGE_KEYS)[keyof typeof COMMERCE_STORAGE_KEYS];

const isoStringSchema = z.string().datetime({ offset: true });
const idStringSchema = z.string().min(1);
const nonNegativeIntegerSchema = z.number().int().nonnegative();
const positiveIntegerSchema = z.number().int().positive();

export const cartItemStateV1Schema = z.object({
  productId: idStringSchema,
  skuId: idStringSchema,
  quantity: positiveIntegerSchema,
  selected: z.boolean(),
});

export const cartStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  items: z.array(cartItemStateV1Schema),
  couponIds: z.array(idStringSchema),
  updatedAt: isoStringSchema,
});

export const discountSnapshotSchema = z.object({
  id: idStringSchema,
  label: z.string(),
  amount: nonNegativeIntegerSchema,
});

export const orderLineSnapshotSchema = z.object({
  productId: idStringSchema,
  skuId: idStringSchema,
  productName: z.string().min(1),
  optionLabel: z.string(),
  image: z.object({
    src: z.string().min(1),
    alt: z.string(),
  }),
  unitPrice: nonNegativeIntegerSchema,
  quantity: positiveIntegerSchema,
  lineSubtotal: nonNegativeIntegerSchema,
  discounts: z.array(discountSnapshotSchema),
});

export const orderAmountSnapshotSchema = z.object({
  itemSubtotal: nonNegativeIntegerSchema,
  productDiscount: nonNegativeIntegerSchema,
  couponDiscount: nonNegativeIntegerSchema,
  shippingFee: nonNegativeIntegerSchema,
  finalTotal: nonNegativeIntegerSchema,
});

export const orderSnapshotSchema = z.object({
  id: idStringSchema,
  orderNumber: z.string().min(1),
  createdAt: isoStringSchema,
  status: z.enum(["created", "payment-failed", "paid"]),
  scenarioId: idStringSchema,
  campaignId: idStringSchema.optional(),
  couponIds: z.array(idStringSchema),
  items: z.array(orderLineSnapshotSchema),
  amounts: orderAmountSnapshotSchema,
  shippingAddress: z.object({
    label: z.string(),
    recipient: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    postalCode: z.string(),
  }),
  paymentMethod: z.object({
    id: idStringSchema,
    label: z.string(),
  }),
});

export const ordersStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  orders: z.array(orderSnapshotSchema),
});

export const campaignStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  source: z.string().optional(),
  campaignId: idStringSchema.optional(),
  couponId: idStringSchema.optional(),
  landedAt: isoStringSchema.optional(),
});

export const scenarioStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  scenarioId: idStringSchema,
});

export const demoEventStateItemSchema = z.object({
  id: idStringSchema,
  type: z.string().min(1),
  occurredAt: isoStringSchema,
  sessionId: idStringSchema,
  route: z.string(),
  displayMode: z.enum(["browser", "standalone"]),
  scenarioId: idStringSchema,
  campaignId: idStringSchema.optional(),
  payload: z.record(z.string(), z.unknown()),
});

export const eventsStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  events: z.array(demoEventStateItemSchema),
});

export const demoSettingsStateV1Schema = z.object({
  schemaVersion: z.literal(STORAGE_SCHEMA_VERSION),
  scenarioId: idStringSchema,
  debugPanelEnabled: z.boolean(),
});

export type CartStateV1 = z.infer<typeof cartStateV1Schema>;
export type OrdersStateV1 = z.infer<typeof ordersStateV1Schema>;
export type CampaignStateV1 = z.infer<typeof campaignStateV1Schema>;
export type ScenarioStateV1 = z.infer<typeof scenarioStateV1Schema>;
export type EventsStateV1 = z.infer<typeof eventsStateV1Schema>;
export type DemoSettingsStateV1 = z.infer<typeof demoSettingsStateV1Schema>;

export const DEFAULT_CART_STATE: CartStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  items: [],
  couponIds: [],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const DEFAULT_ORDERS_STATE: OrdersStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  orders: [],
};

export const DEFAULT_CAMPAIGN_STATE: CampaignStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
};

export const DEFAULT_SCENARIO_STATE: ScenarioStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  scenarioId: "happy-path",
};

export const DEFAULT_EVENTS_STATE: EventsStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  events: [],
};

export const DEFAULT_SETTINGS_STATE: DemoSettingsStateV1 = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  scenarioId: "happy-path",
  debugPanelEnabled: false,
};
