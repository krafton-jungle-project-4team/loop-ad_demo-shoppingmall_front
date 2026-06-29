import { createContext, useContext } from "react";

import type { CreateOrderInput } from "@/state/order-core";
import type { Order } from "@/types/commerce";

export type OrderContextValue = {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  replaceOrders: (orders: Order[]) => void;
  clearOrders: () => void;
};

export const OrderContext = createContext<OrderContextValue | null>(null);

export function useOrderStore(): OrderContextValue {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrderStore must be used inside OrderProvider.");
  }

  return context;
}
