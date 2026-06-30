import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrderCompletePage } from "@/pages/OrderCompletePage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { PromotionPage } from "@/pages/PromotionPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "products/:productId",
        element: <ProductDetailPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "order-complete",
        element: <OrderCompletePage />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetailPage />,
      },
      {
        path: "promotion/:promotionId",
        element: <PromotionPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
