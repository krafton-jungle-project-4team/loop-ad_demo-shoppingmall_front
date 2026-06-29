import { RouterProvider } from "react-router-dom";

import { router } from "@/app/routes";
import { CartProvider } from "@/state/cart-store";
import { OrderProvider } from "@/state/order-store";

function App() {
  return (
    <OrderProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </OrderProvider>
  );
}

export default App;
