import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDemoIdentity,
  trackLoopAdEvent,
  trackLoopAdPageView,
} from "@/lib/loop-ad-sdk";

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
): { localStorage: Storage; sessionStorage: Storage } {
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    innerWidth: 1440,
    localStorage,
    location: {
      hash: "",
      href: "https://demo-shoppingmall.dev.loop-ad.org/login",
      pathname: "/login",
      search: "",
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

    const track = vi.fn();
    const setIdentity = vi.fn();
    const init = vi.fn(() => ({
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

    trackLoopAdEvent("hotel_view", {
      ageGroup: "10s",
      gender: "unknown",
      properties: {
        page: "/hotel/seoul-loop-city-001",
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
        collectDomEvents: false,
        context: expect.objectContaining({
          ageGroup: "30s",
          gender: "male",
          properties: expect.objectContaining(expectedDemographicProperties),
        }),
      }),
    );
    expect(track).toHaveBeenCalledWith(
      "page_view",
      expect.objectContaining({
        ageGroup: "30s",
        gender: "male",
        properties: expect.objectContaining({
          ...expectedDemographicProperties,
          page: expect.objectContaining({
            path: "/login",
            previous_url: "https://demo-shoppingmall.dev.loop-ad.org/",
            referrer: "https://example.test/start",
            title: "StayLoop Booking Demo",
            url: "https://demo-shoppingmall.dev.loop-ad.org/login",
          }),
          route_group: "/login",
        }),
      }),
    );
    expect(setIdentity).toHaveBeenCalledWith(
      {
        userId: "demo-user-busan-male-30s",
        sessionId: "demo-session-uuid-1",
      },
      expect.objectContaining({
        ageGroup: "30s",
        gender: "male",
        properties: expect.objectContaining(expectedDemographicProperties),
      }),
    );
    expect(track).toHaveBeenCalledWith(
      "hotel_view",
      expect.objectContaining({
        ageGroup: "30s",
        gender: "male",
        properties: expect.objectContaining({
          page: "/hotel/seoul-loop-city-001",
          ...expectedDemographicProperties,
        }),
      }),
    );
  });
});
