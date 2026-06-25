import { createBrowserRouter, createMemoryRouter } from "react-router";

import { appRoutes } from "./routes";

export function getRouterBasename(baseUrl: string): string | undefined {
  const trimmed = baseUrl.trim();

  if (!trimmed || trimmed === "/") {
    return undefined;
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function createAppRouter(baseUrl = import.meta.env.BASE_URL) {
  return createBrowserRouter(appRoutes, {
    basename: getRouterBasename(baseUrl),
  });
}

export function createMemoryAppRouter(initialEntries: string[] = ["/"]) {
  return createMemoryRouter(appRoutes, {
    initialEntries,
  });
}

export const appRouter = createAppRouter();
