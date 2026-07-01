import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDemoIdentity } from "@/lib/loop-ad-sdk";

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
});
