export type AppRouteId =
  | "home"
  | "search"
  | "category"
  | "product"
  | "cart"
  | "checkout"
  | "orderComplete"
  | "orders"
  | "orderDetail"
  | "demo"
  | "offline";

export interface AppRouteMetadata {
  id: AppRouteId;
  path: string;
  title: string;
  label: string;
  summary: string;
  owner: string;
  phase: string;
}

export const APP_ROUTE_METADATA: AppRouteMetadata[] = [
  {
    id: "home",
    path: "/",
    title: "Loop Commerce Demo",
    label: "Home",
    summary: "Static frontend shell for the responsive commerce demo.",
    owner: "Foundation",
    phase: "P1 shell",
  },
  {
    id: "search",
    path: "/search",
    title: "Search",
    label: "Search",
    summary: "Search route placeholder for discovery workflows.",
    owner: "Discovery",
    phase: "P4",
  },
  {
    id: "category",
    path: "/category/:categoryId",
    title: "Category",
    label: "Category",
    summary: "Category route placeholder for product list workflows.",
    owner: "Discovery",
    phase: "P4",
  },
  {
    id: "product",
    path: "/products/:productId",
    title: "Product detail",
    label: "Product",
    summary: "Product route placeholder for campaign landing and option selection.",
    owner: "Product & Campaign",
    phase: "P3",
  },
  {
    id: "cart",
    path: "/cart",
    title: "Cart",
    label: "Cart",
    summary: "Cart route placeholder for selected items, coupons, and totals.",
    owner: "Cart & Pricing",
    phase: "P3",
  },
  {
    id: "checkout",
    path: "/checkout",
    title: "Checkout",
    label: "Checkout",
    summary: "Checkout route placeholder for simulated payment and order creation.",
    owner: "Checkout & Orders",
    phase: "P3",
  },
  {
    id: "orderComplete",
    path: "/order-complete/:orderId",
    title: "Order complete",
    label: "Complete",
    summary: "Order completion route placeholder for successful simulated purchases.",
    owner: "Checkout & Orders",
    phase: "P3",
  },
  {
    id: "orders",
    path: "/orders",
    title: "Orders",
    label: "Orders",
    summary: "Order history route placeholder for local order snapshots.",
    owner: "Checkout & Orders",
    phase: "P3",
  },
  {
    id: "orderDetail",
    path: "/orders/:orderId",
    title: "Order detail",
    label: "Order",
    summary: "Order detail route placeholder for a single immutable order snapshot.",
    owner: "Checkout & Orders",
    phase: "P3",
  },
  {
    id: "demo",
    path: "/demo",
    title: "Demo controls",
    label: "Demo",
    summary: "Demo controls route placeholder for scenarios, reset, and local event log.",
    owner: "Integration",
    phase: "P4",
  },
  {
    id: "offline",
    path: "/offline",
    title: "Offline",
    label: "Offline",
    summary: "Offline route placeholder for the future PWA fallback.",
    owner: "PWA Platform",
    phase: "P4",
  },
];

export const PRIMARY_NAV_ITEMS = APP_ROUTE_METADATA.filter((route) =>
  ["home", "search", "cart", "orders", "demo"].includes(route.id),
).map((route) => ({
  id: route.id,
  label: route.label,
  to: route.path,
  end: route.id === "home",
}));

export function getRouteMetadata(routeId: AppRouteId): AppRouteMetadata {
  const route = APP_ROUTE_METADATA.find((item) => item.id === routeId);

  if (!route) {
    throw new Error(`Unknown app route id: ${routeId}`);
  }

  return route;
}
