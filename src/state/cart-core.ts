import { products } from "@/fixtures/products";
import type { CartItem, Product } from "@/types/commerce";
import { calculateCartSubtotal } from "@/utils/money";

export type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "add"; item: CartItem }
  | { type: "updateQuantity"; productId: string; option?: string; quantity: number }
  | { type: "remove"; productId: string; option?: string }
  | { type: "clear" }
  | { type: "replace"; items: CartItem[] };

export const initialCartState: CartState = {
  items: [],
};

export function createCartItemKey(item: Pick<CartItem, "productId" | "option">): string {
  return `${item.productId}:${item.option ?? "default"}`;
}

export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const nextItem = {
        ...action.item,
        quantity: normalizeQuantity(action.item.quantity),
      };
      const existingItem = state.items.find(
        (item) => createCartItemKey(item) === createCartItemKey(nextItem),
      );

      if (!existingItem) {
        return {
          items: [...state.items, nextItem],
        };
      }

      return {
        items: state.items.map((item) =>
          createCartItemKey(item) === createCartItemKey(nextItem)
            ? {
                ...item,
                quantity: item.quantity + nextItem.quantity,
              }
            : item,
        ),
      };
    }
    case "updateQuantity":
      return {
        items: state.items.map((item) =>
          item.productId === action.productId && item.option === action.option
            ? {
                ...item,
                quantity: normalizeQuantity(action.quantity),
              }
            : item,
        ),
      };
    case "remove":
      return {
        items: state.items.filter(
          (item) => !(item.productId === action.productId && item.option === action.option),
        ),
      };
    case "clear":
      return initialCartState;
    case "replace":
      return {
        items: action.items.map((item) => ({
          ...item,
          quantity: normalizeQuantity(item.quantity),
        })),
      };
  }
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[], catalog: Product[] = products): number {
  return calculateCartSubtotal(items, catalog);
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

export function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as CartState;
  return Array.isArray(state.items) && state.items.every(isCartItem);
}
