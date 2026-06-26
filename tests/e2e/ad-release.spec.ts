import { expect, test, type Page } from "@playwright/test";

type AdEventPayload = {
  eventName: "ad_impression" | "ad_click";
  slotId: "C1_MAIN_TOP" | "W1_WING";
  creativeId: string;
  page: "home";
  viewport: "mobile" | "tablet" | "desktop";
  destinationUrl?: string;
  timestamp: string;
};

const VIEWPORTS = [
  { width: 390, height: 900, c1Path: "/ads/main-mobile.webp", hasWing: false },
  { width: 768, height: 900, c1Path: "/ads/main-desktop.webp", hasWing: false },
  { width: 1024, height: 900, c1Path: "/ads/main-desktop.webp", hasWing: false },
  { width: 1440, height: 900, c1Path: "/ads/main-desktop.webp", hasWing: true },
] as const;

async function installAdEventCapture(page: Page) {
  await page.addInitScript(() => {
    const target = window as typeof window & {
      __demoAdEvents?: AdEventPayload[];
    };

    target.__demoAdEvents = [];
    window.addEventListener("demo:ad-event", (event) => {
      target.__demoAdEvents?.push((event as CustomEvent<AdEventPayload>).detail);
    });
  });
}

async function readAdEvents(page: Page) {
  return page.evaluate(() => {
    const target = window as typeof window & {
      __demoAdEvents?: AdEventPayload[];
    };

    return target.__demoAdEvents ?? [];
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;

        return (
          root.scrollWidth <= root.clientWidth &&
          body.scrollWidth <= body.clientWidth
        );
      }),
    )
    .toBe(true);
}

function getPathnameFromSrc(src: string) {
  return new URL(src).pathname;
}

test.describe("ad demo release readiness", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px renders the expected ad layout`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");

      const mainAd = page.getByRole("link", { name: "메인 프로모션 광고" });
      const wingAd = page.getByRole("link", { name: "윙 프로모션 광고" });

      await expect(mainAd).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const currentMainSrc = await mainAd
        .locator("img")
        .evaluate((image) => (image as HTMLImageElement).currentSrc);

      expect(getPathnameFromSrc(currentMainSrc)).toBe(viewport.c1Path);

      if (viewport.hasWing) {
        await expect(wingAd).toBeVisible();

        const mainBox = await mainAd.boundingBox();
        const wingBox = await wingAd.boundingBox();

        expect(mainBox).not.toBeNull();
        expect(wingBox).not.toBeNull();
        expect(Math.abs((mainBox?.y ?? 0) - (wingBox?.y ?? 0))).toBeLessThanOrEqual(
          8,
        );
      } else {
        await expect(wingAd).toBeHidden();
      }
    });
  }

  test("shows stable fallbacks when ad image files are missing", async ({ page }) => {
    await page.route("**/ads/*.webp", (route) => route.abort());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByText("C1_MAIN_TOP")).toBeVisible();
    await expect(page.getByText("W1_WING")).toBeVisible();
    await expect(page.getByText("광고 콘텐츠 준비 중").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("emits ad events without duplicate impressions or hidden W1 noise", async ({
    page,
  }) => {
    await installAdEventCapture(page);
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/");

    const mainAd = page.getByRole("link", { name: "메인 프로모션 광고" });
    const wingAd = page.getByRole("link", { name: "윙 프로모션 광고" });

    await expect(mainAd).toBeVisible();
    await expect(wingAd).toBeHidden();

    await expect
      .poll(async () =>
        (await readAdEvents(page)).filter(
          (event) => event.eventName === "ad_impression",
        ),
      )
      .toHaveLength(1);

    await page.waitForTimeout(200);

    let events = await readAdEvents(page);
    let impressions = events.filter((event) => event.eventName === "ad_impression");

    expect(impressions).toEqual([
      expect.objectContaining({
        creativeId: "replace-me-main",
        eventName: "ad_impression",
        page: "home",
        slotId: "C1_MAIN_TOP",
        viewport: "desktop",
      }),
    ]);
    expect(impressions.some((event) => event.slotId === "W1_WING")).toBe(false);

    await mainAd.click();

    events = await readAdEvents(page);
    impressions = events.filter((event) => event.eventName === "ad_impression");

    expect(impressions).toHaveLength(1);
    expect(events).toContainEqual(
      expect.objectContaining({
        creativeId: "replace-me-main",
        destinationUrl: "#",
        eventName: "ad_click",
        page: "home",
        slotId: "C1_MAIN_TOP",
        viewport: "desktop",
      }),
    );
    expect(page.url()).toContain("#");
  });

  test("wide desktop emits one impression for each visible ad slot", async ({
    page,
  }) => {
    await installAdEventCapture(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "메인 프로모션 광고" })).toBeVisible();
    await expect(page.getByRole("link", { name: "윙 프로모션 광고" })).toBeVisible();

    await expect
      .poll(async () =>
        (await readAdEvents(page))
          .filter((event) => event.eventName === "ad_impression")
          .map((event) => event.slotId)
          .sort(),
      )
      .toEqual(["C1_MAIN_TOP", "W1_WING"]);

    await page.waitForTimeout(200);

    const impressions = (await readAdEvents(page)).filter(
      (event) => event.eventName === "ad_impression",
    );

    expect(impressions).toHaveLength(2);
  });

  test("ad links keep keyboard focus and accessible labels", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");

    const mainAd = page.getByRole("link", { name: "메인 프로모션 광고" });
    const mainAdImage = mainAd.locator("img");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await expect(mainAd).toBeFocused();
    await expect(mainAd).toHaveAttribute("aria-label", "메인 프로모션 광고");
    await expect(mainAdImage).toHaveAttribute("alt", "메인 프로모션 광고");

    const focusRing = await mainAd.evaluate(
      (element) => window.getComputedStyle(element).boxShadow,
    );

    expect(focusRing).not.toBe("none");
  });
});
