import type { RouteObject } from "react-router";

import { AppErrorBoundary } from "./error-boundary";
import { NotFoundPage } from "./not-found";
import { RootLayout } from "./RootLayout";
import { RoutePlaceholder } from "./RoutePlaceholder";
import { APP_ROUTE_METADATA } from "./route-metadata";

function createPlaceholderRoute(route: (typeof APP_ROUTE_METADATA)[number]): RouteObject {
  return {
    id: route.id,
    path: route.path,
    element: <RoutePlaceholder routeId={route.id} />,
  };
}

export const appRoutes: RouteObject[] = [
  {
    id: "root",
    path: "/",
    element: <RootLayout />,
    errorElement: <AppErrorBoundary />,
    children: [
      ...APP_ROUTE_METADATA.map(createPlaceholderRoute),
      {
        id: "not-found",
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];
