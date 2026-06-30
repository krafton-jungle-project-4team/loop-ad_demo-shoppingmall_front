import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDemoIdentity } from "@/lib/loop-ad-sdk";

const USER_ID_STORAGE_KEY = "loop-ad-demo-user-id";
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

  it("stores browser userId in localStorage and sessionId in sessionStorage", () => {
    const { localStorage, sessionStorage } = stubBrowserStorage();

    const firstIdentity = getDemoIdentity();
    const secondIdentity = getDemoIdentity();

    expect(firstIdentity).toEqual({
      userId: "demo-user-uuid-1",
      sessionId: "demo-session-uuid-2",
    });
    expect(secondIdentity).toEqual(firstIdentity);
    expect(localStorage.getItem(USER_ID_STORAGE_KEY)).toBe(firstIdentity.userId);
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      firstIdentity.sessionId,
    );
  });

  it("keeps userId but creates a new sessionId for a new browser session", () => {
    const localStorage = new MemoryStorage();
    const firstSessionStorage = new MemoryStorage();
    stubBrowserStorage(localStorage, firstSessionStorage);

    const firstIdentity = getDemoIdentity();

    const secondSessionStorage = new MemoryStorage();
    stubBrowserStorage(localStorage, secondSessionStorage);

    const secondIdentity = getDemoIdentity();

    expect(secondIdentity.userId).toBe(firstIdentity.userId);
    expect(secondIdentity.sessionId).toBe("demo-session-uuid-3");
    expect(secondIdentity.sessionId).not.toBe(firstIdentity.sessionId);
    expect(secondSessionStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      secondIdentity.sessionId,
    );
  });

  it("uses the selected demo profile userId without changing the sessionId", () => {
    const { localStorage } = stubBrowserStorage();

    const browserIdentity = getDemoIdentity();
    localStorage.setItem(PROFILE_STORAGE_KEY, "seoul-female-20s");

    const profileIdentity = getDemoIdentity();

    expect(profileIdentity).toEqual({
      userId: "demo-user-seoul-female-20s",
      sessionId: browserIdentity.sessionId,
    });
  });
});
