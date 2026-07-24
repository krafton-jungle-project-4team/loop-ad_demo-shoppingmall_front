import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackCampaignRouteEvents } from "@/utils/campaign-events";

const { getDemoIdentityMock, rememberLoopAdAttributionMock, trackLoopAdEventMock } = vi.hoisted(() => ({
  getDemoIdentityMock: vi.fn(),
  rememberLoopAdAttributionMock: vi.fn(),
  trackLoopAdEventMock: vi.fn(),
}));

vi.mock("@/lib/loop-ad-sdk", () => ({
  getDemoIdentity: getDemoIdentityMock,
  trackLoopAdEvent: trackLoopAdEventMock,
}));

vi.mock("@/utils/ad-attribution", () => ({
  rememberLoopAdAttribution: rememberLoopAdAttributionMock,
}));

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const campaignParams = new URLSearchParams({
  deal: "summer-lastcall",
  loopad_campaign_id: "test-campaign",
  loopad_promotion_id: "test-promotion",
  loopad_promotion_run_id: "test-run",
  loopad_ad_experiment_id: "test-experiment",
  loopad_redirect_id: "test-redirect",
});

describe("campaign route events", () => {
  beforeEach(() => {
    getDemoIdentityMock.mockReset();
    rememberLoopAdAttributionMock.mockReset();
    trackLoopAdEventMock.mockReset();
    getDemoIdentityMock.mockReturnValue({ userId: "demo-user", sessionId: "demo-session" });
    vi.stubGlobal("window", { sessionStorage: new MemoryStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks campaign events once on landing and not on internal deal routes", () => {
    const searchUrl = `https://demo-shoppingmall.dev.loop-ad.org/search?${campaignParams}`;
    const hotelUrl = "https://demo-shoppingmall.dev.loop-ad.org/hotel/jeju-ocean-breeze-006?deal=summer-lastcall";
    const checkoutUrl = "https://demo-shoppingmall.dev.loop-ad.org/checkout/jeju-ocean-breeze-006?deal=summer-lastcall";

    trackCampaignRouteEvents(searchUrl);
    trackCampaignRouteEvents(hotelUrl, searchUrl);
    trackCampaignRouteEvents(checkoutUrl, hotelUrl);

    expect(trackLoopAdEventMock.mock.calls.map(([eventName]) => eventName)).toEqual([
      "campaign_redirect_click",
      "campaign_landing",
    ]);
  });

  it("can inherit redirect attribution on the same landing route", () => {
    const landingUrl = "https://demo-shoppingmall.dev.loop-ad.org/search?deal=summer-lastcall";
    const redirectUrl = `${landingUrl}&${campaignParams}`;

    trackCampaignRouteEvents(landingUrl, redirectUrl);

    expect(trackLoopAdEventMock).toHaveBeenCalledTimes(2);
    expect(trackLoopAdEventMock).toHaveBeenCalledWith(
      "campaign_landing",
      expect.objectContaining({
        campaignId: "test-campaign",
        promotionId: "test-promotion",
        properties: expect.objectContaining({ deal: "summer-lastcall" }),
      }),
    );
  });
});
