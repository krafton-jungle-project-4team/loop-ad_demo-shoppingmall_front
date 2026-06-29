import { sampleOrders } from "@/fixtures/orders";
import type { CartItem, Order, OrderStatus } from "@/types/commerce";

export type OrderState = {
  orders: Order[];
};

export type CreateOrderInput = {
  items: CartItem[];
  totalAmount: number;
  status?: OrderStatus;
  createdAt?: string;
};

export type OrderAction =
  | { type: "add"; order: Order }
  | { type: "replace"; orders: Order[] }
  | { type: "clear" };

export const initialOrderState: OrderState = {
  orders: sampleOrders,
};

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "add":
      return {
        orders: [action.order, ...state.orders],
      };
    case "replace":
      return {
        orders: action.orders,
      };
    case "clear":
      return {
        orders: [],
      };
  }
}

export function createOrderId(existingOrders: Order[], now = new Date()): string {
  const year = now.getFullYear();
  const nextSequence = existingOrders.length + 1;
  return `ORD-${year}-${String(nextSequence).padStart(4, "0")}`;
}

export function buildOrder(input: CreateOrderInput, existingOrders: Order[]): Order {
  return {
    id: createOrderId(existingOrders),
    items: input.items,
    totalAmount: input.totalAmount,
    createdAt: input.createdAt ?? new Date().toISOString(),
    status: input.status ?? "paid",
  };
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as CartItem;
  return (
    typeof item.productId === "string" &&
    (typeof item.option === "undefined" || typeof item.option === "string") &&
    typeof item.quantity === "number"
  );
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object") {
    return false;
  }

  const order = value as Order;
  return (
    typeof order.id === "string" &&
    Array.isArray(order.items) &&
    order.items.every(isCartItem) &&
    typeof order.totalAmount === "number" &&
    typeof order.createdAt === "string" &&
    ["paid", "preparing", "shipping", "delivered"].includes(order.status)
  );
}

export function isOrderState(value: unknown): value is OrderState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as OrderState;
  return Array.isArray(state.orders) && state.orders.every(isOrder);
}
