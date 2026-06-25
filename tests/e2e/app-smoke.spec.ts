import { expect, test } from "@playwright/test";

test("renders the foundation shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Loop Commerce Demo" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

test("renders registered fallback routes", async ({ page }) => {
  await page.goto("/cart");

  await expect(page.getByRole("heading", { name: "Cart" })).toBeVisible();

  await page.goto("/not-a-real-route");

  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
