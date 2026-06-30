import { getCategoryById } from "@/fixtures/product-helpers";
import { trackLoopAdEvent, type LoopAdTrackFields } from "@/lib/loop-ad-sdk";
import type { CartItem, Order, Product } from "@/types/commerce";
import { getProductUnitPrice } from "@/utils/money";
import { getLoopAdAttributionFields } from "@/utils/ad-attribution";
import {
  buildCommerceLineItems,
  calculateOrderAmounts,
  getOptionLabel,
  type CommerceLineItem,
} from "@/utils/order-summary";

export type CommerceEventName =
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "purchase";

const DEFAULT_CHANNEL = "demo-shoppingmall";
const INVENTORY_STATUS_IN_STOCK = "in_stock";
const EFFECT_EVENT_DEDUPE_MS = 1000;
const recentEffectEventKeys = new Map<string, number>();

export function trackProductView(product: Product): void {
  if (isRecentEffectEvent(`product_view:${product.id}`)) {
    return;
  }

  trackCommerceEvent("product_view", createProductViewFields(product));
}

export function trackAddToCart(
  product: Product,
  optionId: string | undefined,
  quantity: number,
): void {
  trackCommerceEvent("add_to_cart", createAddToCartFields(product, optionId, quantity));
}

export function trackCheckoutStart(items: CartItem[]): void {
  if (items.length === 0) {
    return;
  }

  if (isRecentEffectEvent(`checkout_start:${cartSignature(items)}`)) {
    return;
  }

  trackCommerceEvent("checkout_start", createCheckoutStartFields(items));
}

export function trackPurchase(order: Order): void {
  if (order.items.length === 0) {
    return;
  }

  trackCommerceEvent("purchase", createPurchaseFields(order));
}

export function createProductViewFields(product: Product): LoopAdTrackFields {
  const category = getCategoryById(product.categoryId);

  return {
    channel: DEFAULT_CHANNEL,
    category: category?.name ?? "",
    productId: product.id,
    inventoryStatus: INVENTORY_STATUS_IN_STOCK,
    price: product.price,
    properties: {
      category_id: product.categoryId,
      category_name: category?.name ?? "",
      product_name: product.name,
      route_group: "product-detail",
    },
  };
}

export function createAddToCartFields(
  product: Product,
  optionId: string | undefined,
  quantity: number,
): LoopAdTrackFields {
  const category = getCategoryById(product.categoryId);
  const normalizedQuantity = Math.max(1, Math.floor(quantity));
  const unitPrice = getProductUnitPrice(product, optionId);

  return {
    channel: DEFAULT_CHANNEL,
    category: category?.name ?? "",
    productId: product.id,
    inventoryStatus: INVENTORY_STATUS_IN_STOCK,
    price: unitPrice,
    quantity: normalizedQuantity,
    properties: {
      category_id: product.categoryId,
      category_name: category?.name ?? "",
      product_name: product.name,
      option_id: optionId ?? "",
      option_label: getOptionLabel(product, optionId),
      unit_price: unitPrice,
      line_total: unitPrice * normalizedQuantity,
      route_group: "product-detail",
    },
  };
}

export function createCheckoutStartFields(items: CartItem[]): LoopAdTrackFields {
  const lineItems = buildCommerceLineItems(items);
  const amounts = calculateOrderAmounts(items);
  const primaryLineItem = lineItems.length === 1 ? lineItems[0] : undefined;

  return {
    channel: DEFAULT_CHANNEL,
    category: primaryLineItem?.categoryName ?? "",
    productId: primaryLineItem?.product.id,
    inventoryStatus: primaryLineItem ? INVENTORY_STATUS_IN_STOCK : undefined,
    price: primaryLineItem?.unitPrice,
    quantity: countItems(items),
    properties: {
      cart_subtotal: amounts.subtotal,
      shipping_fee: amounts.shippingFee,
      cart_value: amounts.totalAmount,
      item_count: countItems(items),
      distinct_item_count: lineItems.length,
      items: lineItems.map(toLineItemProperties),
      route_group: "checkout",
    },
  };
}

export function createPurchaseFields(order: Order): LoopAdTrackFields {
  const lineItems = buildCommerceLineItems(order.items);
  const amounts = calculateOrderAmounts(order.items);
  const primaryLineItem = lineItems.length === 1 ? lineItems[0] : undefined;

  return {
    channel: DEFAULT_CHANNEL,
    category: primaryLineItem?.categoryName ?? "",
    productId: primaryLineItem?.product.id,
    inventoryStatus: primaryLineItem ? INVENTORY_STATUS_IN_STOCK : undefined,
    price: primaryLineItem?.unitPrice,
    quantity: countItems(order.items),
    revenue: order.totalAmount,
    orderId: order.id,
    properties: {
      order_status: order.status,
      order_created_at: order.createdAt,
      cart_subtotal: amounts.subtotal,
      shipping_fee: amounts.shippingFee,
      order_total: order.totalAmount,
      item_count: countItems(order.items),
      distinct_item_count: lineItems.length,
      items: lineItems.map(toLineItemProperties),
      route_group: "order-complete",
    },
  };
}

function trackCommerceEvent(eventName: CommerceEventName, fields: LoopAdTrackFields): void {
  const attributionFields = getLoopAdAttributionFields();

  trackLoopAdEvent(eventName, {
    ...attributionFields,
    ...fields,
    properties: {
      ...(attributionFields.properties ?? {}),
      ...(fields.properties ?? {}),
    },
  });
}

function toLineItemProperties({
  item,
  product,
  categoryName,
  optionLabel,
  unitPrice,
  lineTotal,
}: CommerceLineItem) {
  return {
    product_id: product.id,
    product_name: product.name,
    category_id: product.categoryId,
    category_name: categoryName,
    option_id: item.option ?? "",
    option_label: optionLabel,
    unit_price: unitPrice,
    quantity: item.quantity,
    line_total: lineTotal,
  };
}

function countItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function isRecentEffectEvent(key: string, now = Date.now()): boolean {
  const previousTrackedAt = recentEffectEventKeys.get(key);

  if (previousTrackedAt && now - previousTrackedAt < EFFECT_EVENT_DEDUPE_MS) {
    return true;
  }

  recentEffectEventKeys.set(key, now);
  return false;
}

function cartSignature(items: CartItem[]): string {
  return items
    .map((item) => `${item.productId}:${item.option ?? "default"}:${item.quantity}`)
    .sort()
    .join("|");
}
