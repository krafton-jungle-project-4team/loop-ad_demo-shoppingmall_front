import { type ReactNode, useEffect, useMemo, useReducer } from "react";

import {
  buildOrder,
  initialOrderState,
  isOrderState,
  orderReducer,
  type OrderState,
} from "@/state/order-core";
import { OrderContext, type OrderContextValue } from "@/state/order-context";
import { readJsonStorage, writeJsonStorage } from "@/state/persistence";

const ORDER_STORAGE_KEY = "loop-shop.orders.v1";

function readPersistedOrderState(fallback: OrderState): OrderState {
  return readJsonStorage(ORDER_STORAGE_KEY, fallback, isOrderState);
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    orderReducer,
    initialOrderState,
    readPersistedOrderState,
  );

  useEffect(() => {
    writeJsonStorage(ORDER_STORAGE_KEY, state);
  }, [state]);

  const value = useMemo<OrderContextValue>(
    () => ({
      orders: state.orders,
      createOrder: (input) => {
        const order = buildOrder(input, state.orders);

        dispatch({ type: "add", order });
        return order;
      },
      getOrderById: (orderId) => state.orders.find((order) => order.id === orderId),
      replaceOrders: (orders) => dispatch({ type: "replace", orders }),
      clearOrders: () => dispatch({ type: "clear" }),
    }),
    [state.orders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
