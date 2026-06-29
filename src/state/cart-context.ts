import { createContext, useContext } from "react";

import type { CartItem } from "@/types/commerce";

export type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number, option?: string) => void;
  removeItem: (productId: string, option?: string) => void;
  clearCart: () => void;
  replaceCart: (items: CartItem[]) => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useCartStore(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartStore must be used inside CartProvider.");
  }

  return context;
}
