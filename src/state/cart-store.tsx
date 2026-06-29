import { type ReactNode, useEffect, useMemo, useReducer } from "react";

import {
  cartReducer,
  getCartItemCount,
  getCartSubtotal,
  initialCartState,
  isCartState,
  type CartState,
} from "@/state/cart-core";
import { CartContext, type CartContextValue } from "@/state/cart-context";
import { readJsonStorage, writeJsonStorage } from "@/state/persistence";

const CART_STORAGE_KEY = "loop-shop.cart.v1";

function readPersistedCartState(fallback: CartState): CartState {
  return readJsonStorage(CART_STORAGE_KEY, fallback, isCartState);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    readPersistedCartState,
  );

  useEffect(() => {
    writeJsonStorage(CART_STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: getCartItemCount(state.items),
      subtotal: getCartSubtotal(state.items),
      addItem: (item) => dispatch({ type: "add", item }),
      updateQuantity: (productId, quantity, option) =>
        dispatch({ type: "updateQuantity", productId, quantity, option }),
      removeItem: (productId, option) => dispatch({ type: "remove", productId, option }),
      clearCart: () => dispatch({ type: "clear" }),
      replaceCart: (items) => dispatch({ type: "replace", items }),
    }),
    [state.items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
