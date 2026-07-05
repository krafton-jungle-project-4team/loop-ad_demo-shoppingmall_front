import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { BookingCompletePage } from "@/pages/BookingCompletePage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { HomePage } from "@/pages/HomePage";
import { HotelDetailPage } from "@/pages/HotelDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SearchResultsPage } from "@/pages/SearchResultsPage";
import { TripsPage } from "@/pages/TripsPage";

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
        path: "search",
        element: <SearchResultsPage />,
      },
      {
        path: "hotel/:hotelId",
        element: <HotelDetailPage />,
      },
      {
        path: "checkout/:hotelId",
        element: <CheckoutPage />,
      },
      {
        path: "booking-complete",
        element: <BookingCompletePage />,
      },
      {
        path: "trips",
        element: <TripsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
