import { render, screen } from "@testing-library/react";

import { App } from "@/app/App";
import { normalizeRouteError } from "@/app/error-utils";
import { createMemoryAppRouter, getRouterBasename } from "@/app/router";

function renderRoute(path: string) {
  render(<App router={createMemoryAppRouter([path])} />);
}

describe("App", () => {
  it("renders the root shell and home placeholder", () => {
    renderRoute("/");

    expect(screen.getByRole("heading", { name: "Loop Commerce Demo" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");
  });

  it("renders registered feature route placeholders", () => {
    renderRoute("/cart");

    expect(screen.getByRole("heading", { name: "Cart" })).toBeInTheDocument();
    expect(screen.getByText("Cart & Pricing")).toBeInTheDocument();
  });

  it("renders dynamic route params without feature logic", () => {
    renderRoute("/products/P1001");

    expect(screen.getByRole("heading", { name: "Product detail" })).toBeInTheDocument();
    expect(screen.getByText("productId: P1001")).toBeInTheDocument();
  });

  it("renders the not-found route", () => {
    renderRoute("/missing/path");

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("normalizes Vite base paths for React Router", () => {
    expect(getRouterBasename("/")).toBeUndefined();
    expect(getRouterBasename("")).toBeUndefined();
    expect(getRouterBasename("/demo-shop/")).toBe("/demo-shop");
    expect(getRouterBasename("nested/demo")).toBe("/nested/demo");
  });

  it("normalizes unknown route errors", () => {
    expect(normalizeRouteError(new Error("Boom"))).toMatchObject({
      status: "Error",
      message: "Boom",
    });
  });
});
