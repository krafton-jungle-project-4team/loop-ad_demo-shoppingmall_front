import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/routes";
import { initLoopAdEventSdk } from "@/lib/loop-ad-sdk";
import { CartProvider } from "@/state/cart-store";
import { OrderProvider } from "@/state/order-store";

function App() {
  useEffect(() => {
    void initLoopAdEventSdk();
  }, []);

  return (
    <OrderProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </OrderProvider>
  );
}

export default App;
