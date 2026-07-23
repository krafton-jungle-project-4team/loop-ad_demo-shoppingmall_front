import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  destroyLoopAdEventSdk,
  getDemoIdentity,
  initLoopAdEventSdk,
  renderLoopAdPlacement,
  trackLoopAdEvent,
  trackLoopAdPageView,
} from "@/lib/loop-ad-sdk";
import { trackCampaignRouteEvents } from "@/utils/campaign-events";

const SESSION_STORAGE_KEY = "loop-ad-demo-session-id";
const PROFILE_STORAGE_KEY = "loop-ad-demo-user-profile.v1";

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.entries.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function stubBrowserStorage(
  localStorage = new MemoryStorage(),
  sessionStorage = new MemoryStorage(),
  href = "https://demo-shoppingmall.dev.loop-ad.org/login",
): { localStorage: Storage; sessionStorage: Storage } {
  const url = new URL(href);

  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    innerWidth: 1440,
    localStorage,
    location: {
      hash: url.hash,
      href: url.href,
      pathname: url.pathname,
      search: url.search,
    },
    sessionStorage,
  });

  return { localStorage, sessionStorage };
}

describe("getDemoIdentity", () => {
  let uuidSequence: number;

  beforeEach(() => {
    uuidSequence = 0;
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => `uuid-${++uuidSequence}`),
    });
  });

  afterEach(() => {
    destroyLoopAdEventSdk();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not create a browser identity before demo login", () => {
    const { localStorage, sessionStorage } = stubBrowserStorage();

    const firstIdentity = getDemoIdentity();
    const secondIdentity = getDemoIdentity();

    expect(firstIdentity).toBeNull();
    expect(secondIdentity).toBeNull();
    expect(localStorage.getItem("loop-ad-demo-user-id")).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("loads the public Event SDK IIFE without npm registry authentication", async () => {
    stubBrowserStorage();
    const listeners = new Map<string, () => void>();
    const script = {
      addEventListener: vi.fn((name: string, listener: () => void) => {
        listeners.set(name, listener);
      }),
      async: false,
      crossOrigin: "",
      dataset: {} as Record<string, string>,
      remove: vi.fn(),
      src: "",
    };
    const init = vi.fn(async () => ({
      track: vi.fn(),
      setIdentity: vi.fn(),
      clearIdentity: vi.fn(),
      destroy: vi.fn(),
    }));
    const appendChild = vi.fn(() => {
      Object.assign(window, {
        LoopAdEventSDK: {
          init,
          version: "test",
        },
      });
      listeners.get("load")?.();
    });

    vi.stubGlobal("document", {
      createElement: vi.fn(() => script),
      head: { appendChild },
      referrer: "",
      title: "StayLoop Booking Demo",
    });

    await initLoopAdEventSdk();

    expect(script.src).toMatch(
      /^https:\/\/krafton-jungle-project-4team\.github\.io\/loop-ad_event_sdk\/loop-ad-event-sdk\.iife\.js\?loopad_sdk_t=\d+$/,
    );
    expect(script.async).toBe(true);
    expect(script.crossOrigin).toBe("anonymous");
    expect(script.dataset.loopAdSdk).toBe("true");
    expect(appendChild).toHaveBeenCalledWith(script);
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ identity: null }));
  });

  it("starts the SDK before login so DevTools can inspect the connection", async () => {
    const { sessionStorage } = stubBrowserStorage();
    const destroy = vi.fn();
    const init = vi.fn(async () => ({
      track: vi.fn(),
      setIdentity: vi.fn(),
      clearIdentity: vi.fn(),
      destroy,
    }));

    Object.assign(window, {
      LoopAdEventSDK: {
        init,
        version: "test",
      },
    });

    await initLoopAdEventSdk();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: null,
        debug: true,
        autoTrackPageViews: false,
        collectDomEvents: true,
      }),
    );
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("uses only the pseudonymous identity when the privacy PoC is explicitly configured", async () => {
    const { localStorage } = stubBrowserStorage();
    localStorage.setItem(PROFILE_STORAGE_KEY, "seoul-female-20s");
    const init = vi.fn(async () => ({
      track: vi.fn(),
      setIdentity: vi.fn(),
      setPrivacyIdentity: vi.fn(),
      clearIdentity: vi.fn(),
      destroy: vi.fn(),
    }));

    Object.assign(window, {
      LoopAdPrivacyPocConfig: {
        collectorUrl: "https://connector.customer.example/private/v2/events",
        identityNamespace: "customer-user",
        identityKeyVersion: "customer-key.v1",
        policyVersion: "privacy-policy.v1",
        purposeIds: ["personalized-advertising"],
      },
      LoopAdEventSDK: {
        init,
        version: "test",
      },
    });

    await initLoopAdEventSdk();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        identity: null,
        privacy: {
          collectorUrl: "https://connector.customer.example/private/v2/events",
          identity: {
            subjectId:
              "sub_423fda0c41fee11cbc38d7b8cce21aa0d3a04169f52f744af71ace5ccb59325b",
            sessionId: "demo-session-uuid-1",
            namespace: "customer-user",
            keyVersion: "customer-key.v1",
          },
          consent: {
            status: "granted",
            policyVersion: "privacy-policy.v1",
            purposeIds: ["personalized-advertising"],
          },
        },
      }),
    );
  });

  it("uses the selected demo profile userId and stores sessionId", () => {
    const { localStorage, sessionStorage } = stubBrowserStorage();
    localStorage.setItem(PROFILE_STORAGE_KEY, "seoul-female-20s");

    const firstIdentity = getDemoIdentity();
    const secondIdentity = getDemoIdentity();

    expect(firstIdentity).toEqual({
      userId: "demo-user-seoul-female-20s",
      sessionId: "demo-session-uuid-1",
    });
    expect(secondIdentity).toEqual(firstIdentity);
    expect(localStorage.getItem("loop-ad-demo-user-id")).toBeNull();
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      firstIdentity?.sessionId,
    );
  });

  it("keeps userId but creates a new sessionId for a new browser session", () => {
    const localStorage = new MemoryStorage();
    const firstSessionStorage = new MemoryStorage();
    stubBrowserStorage(localStorage, firstSessionStorage);
    localStorage.setItem(PROFILE_STORAGE_KEY, "seoul-female-20s");

    const firstIdentity = getDemoIdentity();

    const secondSessionStorage = new MemoryStorage();
    stubBrowserStorage(localStorage, secondSessionStorage);

    const secondIdentity = getDemoIdentity();

    expect(firstIdentity).not.toBeNull();
    expect(secondIdentity).not.toBeNull();
    expect(secondIdentity?.userId).toBe(firstIdentity?.userId);
    expect(secondIdentity?.sessionId).toBe("demo-session-uuid-2");
    expect(secondIdentity?.sessionId).not.toBe(firstIdentity?.sessionId);
    expect(secondSessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      secondIdentity?.sessionId,
    );
  });

  it("uses the selected demo profile userId without changing the sessionId", () => {
    const { localStorage } = stubBrowserStorage();
    localStorage.setItem(PROFILE_STORAGE_KEY, "seoul-female-20s");

    const firstProfileIdentity = getDemoIdentity();
    localStorage.setItem(PROFILE_STORAGE_KEY, "busan-male-30s");

    const secondProfileIdentity = getDemoIdentity();

    expect(firstProfileIdentity).not.toBeNull();
    expect(secondProfileIdentity).toEqual({
      userId: "demo-user-busan-male-30s",
      sessionId: firstProfileIdentity?.sessionId,
    });
  });

  it("sends selected demo demographics in properties for every tracked event", async () => {
    const { localStorage } = stubBrowserStorage();
    localStorage.setItem(PROFILE_STORAGE_KEY, "busan-male-30s");
    vi.stubGlobal("document", {
      referrer: "https://example.test/start",
      title: "StayLoop Booking Demo",
    });
    const fetch = vi.fn((input: RequestInfo | URL, options?: RequestInit) => {
      void input;
      void options;
      return Promise.resolve({ status: 202 } as Response);
    });
    vi.stubGlobal("fetch", fetch);

    const track = vi.fn();
    const setIdentity = vi.fn();
    const init = vi.fn(async () => ({
      track,
      setIdentity,
      clearIdentity: vi.fn(),
      destroy: vi.fn(),
    }));

    Object.assign(window, {
      LoopAdEventSDK: {
        init,
        version: "test",
      },
    });

    trackLoopAdEvent("hotel_detail_view", {
      properties: {
        source_page: "/hotel/seoul-loop-city-001",
        region: "stale-region",
        age_group: "stale-age",
        gender: "stale-gender",
      },
    });
    trackLoopAdPageView("https://demo-shoppingmall.dev.loop-ad.org/");

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    const expectedDemographicProperties = {
      region: "부산",
      age_group: "30s",
      gender: "male",
      user_type: "busan-male-30s",
      user_segment: "high_intent",
      preferred_category: "business_hotel",
    };

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        autoTrackPageViews: false,
        collectDomEvents: true,
        connectionUrl:
          "https://dashboard.api.dev.loop-ad.org/api/public/v1/sdk/connections/demo_project",
        identity: {
          userId: "demo-user-busan-male-30s",
          sessionId: "demo-session-uuid-1",
        },
        context: expect.objectContaining({
          promotion_channel: "onsite_banner",
          device: "desktop",
        }),
      }),
    );
    expect(setIdentity).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(track).toHaveBeenCalledTimes(2);
    const pageViewProperties = track.mock.calls.find(([name]) => name === "page_view")?.[1];
    const hotelDetailProperties = track.mock.calls.find(
      ([name]) => name === "hotel_detail_view",
    )?.[1];
    expect(pageViewProperties).toEqual(
      expect.objectContaining({
        ...expectedDemographicProperties,
        route_group: "/login",
      }),
    );
    expect(hotelDetailProperties).toEqual(
      expect.objectContaining({
        ...expectedDemographicProperties,
        source_page: "/hotel/seoul-loop-city-001",
      }),
    );
  });

  it("carries loopad redirect attribution into SDK booking events", async () => {
    const href =
      "https://demo-shoppingmall.dev.loop-ad.org/login" +
      "?loopad_campaign_id=campaign-real" +
      "&loopad_promotion_id=promotion-real" +
      "&loopad_promotion_run_id=run-real" +
      "&loopad_ad_experiment_id=exp-real" +
      "&loopad_channel=email" +
      "&loopad_segment_id=segment-real" +
      "&loopad_content_id=content-real" +
      "&loopad_content_option_id=option-real" +
      "&loopad_redirect_id=redirect-real";
    const { localStorage } = stubBrowserStorage(
      new MemoryStorage(),
      new MemoryStorage(),
      href,
    );
    localStorage.setItem(PROFILE_STORAGE_KEY, "busan-male-30s");
    vi.stubGlobal("document", {
      referrer: "https://dashboard.api.dev.loop-ad.org/r/redirect-real",
      title: "StayLoop Booking Demo",
    });
    const track = stubEventSdk();

    trackCampaignRouteEvents(window.location.href);
    trackLoopAdEvent("booking_complete", {
      bookingId: "booking-1",
      properties: {
        booking_status: "completed",
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    const landingProperties = track.mock.calls.find(
      ([name]) => name === "campaign_landing",
    )?.[1];
    const bookingProperties = track.mock.calls.find(
      ([name]) => name === "booking_complete",
    )?.[1];

    for (const properties of [landingProperties, bookingProperties]) {
      expect(properties).toEqual(
        expect.objectContaining({
          campaign_id: "campaign-real",
          promotion_id: "promotion-real",
          promotion_run_id: "run-real",
          ad_experiment_id: "exp-real",
          promotion_channel: "email",
          segment_id: "segment-real",
          content_id: "content-real",
          content_option_id: "option-real",
          redirect_id: "redirect-real",
        }),
      );
    }
    expect(bookingProperties).toEqual(
      expect.objectContaining({
        booking_id: "booking-1",
        booking_status: "completed",
      }),
    );
  });

  it("keeps redirect attribution when the landing page only has deal params", async () => {
    const landingHref =
      "https://demo-shoppingmall.dev.loop-ad.org/hotel/jeju-ocean-breeze-006" +
      "?destination=&checkIn=2026-08-01&checkOut=2026-08-03" +
      "&adults=1&children=0&rooms=1&deal=summer";
    const redirectHref =
      landingHref +
      "&loopad_campaign_id=camp-expedia" +
      "&loopad_promotion_id=promotion-real" +
      "&loopad_promotion_run_id=run-real" +
      "&loopad_ad_experiment_id=exp-real" +
      "&loopad_promotion_channel=email" +
      "&loopad_segment_id=segment-real" +
      "&loopad_content_id=content-real" +
      "&loopad_content_option_id=option-real" +
      "&loopad_redirect_id=redirect-real";
    const { localStorage } = stubBrowserStorage(
      new MemoryStorage(),
      new MemoryStorage(),
      landingHref,
    );
    localStorage.setItem(PROFILE_STORAGE_KEY, "busan-male-30s");
    vi.stubGlobal("document", {
      referrer: "https://dashboard.api.dev.loop-ad.org/r/redirect-real",
      title: "StayLoop Booking Demo",
    });
    const track = stubEventSdk();

    trackCampaignRouteEvents(window.location.href, redirectHref);
    trackLoopAdEvent("booking_complete", {
      bookingId: "booking-1",
      properties: {
        booking_status: "completed",
      },
    });

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });

    const bookingProperties = track.mock.calls.find(
      ([name]) => name === "booking_complete",
    )?.[1];
    expect(bookingProperties).toEqual(
      expect.objectContaining({
        campaign_id: "camp-expedia",
        promotion_id: "promotion-real",
        promotion_run_id: "run-real",
        ad_experiment_id: "exp-real",
        promotion_channel: "email",
        segment_id: "segment-real",
        content_id: "content-real",
        content_option_id: "option-real",
        redirect_id: "redirect-real",
        deal: "summer",
      }),
    );
    expect(bookingProperties?.campaign_id).not.toBe("summer");
  });

  it("uses the redirect promotion run for Advertisement SDK requests", async () => {
    const href =
      "https://demo-shoppingmall.dev.loop-ad.org/login" +
      "?loopad_promotion_run_id=run-from-redirect";
    const { localStorage } = stubBrowserStorage(
      new MemoryStorage(),
      new MemoryStorage(),
      href,
    );
    localStorage.setItem(PROFILE_STORAGE_KEY, "busan-male-30s");
    const render = vi.fn(async () => ({
      placementKey: "C1_MAIN_TOP",
      placementId: "C1_MAIN_TOP",
      status: "empty" as const,
      ad: null,
      tracking: null,
    }));
    const init = vi.fn(() => ({ render, destroy: vi.fn() }));

    Object.assign(window, {
      LoopAdAdvertisementSDK: {
        init,
        version: "test",
      },
    });

    await renderLoopAdPlacement({
      placementKey: "C1_MAIN_TOP",
      targetId: "ad-slot",
      page: "/",
    });

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "demo_project",
        promotionRunId: "run-from-redirect",
      }),
    );
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({ placementId: "C1_MAIN_TOP" }),
    );
  });
});

function stubEventSdk() {
  const track = vi.fn();
  Object.assign(window, {
    LoopAdEventSDK: {
      init: vi.fn(async () => ({
        track,
        setIdentity: vi.fn(),
        clearIdentity: vi.fn(),
        destroy: vi.fn(),
      })),
      version: "test",
    },
  });
  return track;
}
