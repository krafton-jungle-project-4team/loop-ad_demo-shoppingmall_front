import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/config/ad-slots";
import type { AdEventPayload } from "@/lib/ad-events";
import { resetAdEventStateForTest } from "@/lib/ad-events";

let removeEventListeners: Array<() => void> = [];
let observerOptions: IntersectionObserverInit | undefined;
let triggerIntersection:
  | ((entry: Partial<IntersectionObserverEntry>) => void)
  | undefined;

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
}

function captureAdEvents() {
  const events: AdEventPayload[] = [];
  const listener = (event: Event) => {
    events.push((event as CustomEvent<AdEventPayload>).detail);
  };

  window.addEventListener("demo:ad-event", listener);
  removeEventListeners.push(() => {
    window.removeEventListener("demo:ad-event", listener);
  });

  return events;
}

function setClientRectCount(element: Element, length: number) {
  Object.defineProperty(element, "getClientRects", {
    configurable: true,
    value: () => ({ length }),
  });
}

function installIntersectionObserverMock() {
  const observeMock = vi.fn();
  const disconnectMock = vi.fn();

  class MockIntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [0.5];

    constructor(
      private readonly callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      observerOptions = options;
      triggerIntersection = (entry) => {
        this.callback(
          [entry as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      };
    }

    observe(element: Element) {
      observeMock(element);
    }

    unobserve() {}

    disconnect() {
      disconnectMock();
    }

    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  return { observeMock, disconnectMock };
}

beforeEach(() => {
  setViewportWidth(1440);
  resetAdEventStateForTest();
  observerOptions = undefined;
  triggerIntersection = undefined;
});

afterEach(() => {
  for (const removeEventListener of removeEventListeners) {
    removeEventListener();
  }

  removeEventListeners = [];
  cleanup();
  resetAdEventStateForTest();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AdSlot events", () => {
  it("emits an impression payload when a visible slot is at least half in view", () => {
    installIntersectionObserverMock();
    const consoleInfo = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const events = captureAdEvents();

    setViewportWidth(390);
    render(<AdSlot slot={AD_SLOTS.C1_MAIN_TOP} />);

    const link = screen.getByRole("link", {
      name: AD_SLOTS.C1_MAIN_TOP.alt,
    });
    setClientRectCount(link, 1);

    expect(observerOptions).toMatchObject({ threshold: 0.5 });
    expect(triggerIntersection).toBeTypeOf("function");
    triggerIntersection?.({
      intersectionRatio: 0.5,
      isIntersecting: true,
      target: link,
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      eventName: "ad_impression",
      slotId: "C1_MAIN_TOP",
      creativeId: "replace-me-main",
      page: "home",
      viewport: "mobile",
    });
    expect("destinationUrl" in events[0]).toBe(false);
    expect(Number.isNaN(Date.parse(events[0].timestamp))).toBe(false);
    expect(consoleInfo).toHaveBeenCalledWith("[demo-ad-event]", events[0]);
  });

  it("emits one impression per slot across repeated observer callbacks", () => {
    installIntersectionObserverMock();
    const consoleInfo = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const events = captureAdEvents();

    render(<AdSlot slot={AD_SLOTS.C1_MAIN_TOP} />);

    const link = screen.getByRole("link", {
      name: AD_SLOTS.C1_MAIN_TOP.alt,
    });
    setClientRectCount(link, 1);

    expect(triggerIntersection).toBeTypeOf("function");
    triggerIntersection?.({
      intersectionRatio: 0.75,
      isIntersecting: true,
      target: link,
    });
    triggerIntersection?.({
      intersectionRatio: 1,
      isIntersecting: true,
      target: link,
    });

    expect(events).toHaveLength(1);
    expect(consoleInfo).toHaveBeenCalledTimes(1);
  });

  it("does not emit a W1 impression while the slot is hidden", () => {
    installIntersectionObserverMock();
    const consoleInfo = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const events = captureAdEvents();

    render(<AdSlot slot={AD_SLOTS.W1_WING} />);

    const link = screen.getByRole("link", {
      name: AD_SLOTS.W1_WING.alt,
    });
    link.style.display = "none";
    setClientRectCount(link, 1);

    expect(triggerIntersection).toBeTypeOf("function");
    triggerIntersection?.({
      intersectionRatio: 1,
      isIntersecting: true,
      target: link,
    });

    expect(events).toHaveLength(0);
    expect(consoleInfo).not.toHaveBeenCalled();
  });

  it("emits a click payload before preserving normal link behavior", () => {
    const consoleInfo = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const events = captureAdEvents();

    render(<AdSlot slot={AD_SLOTS.W1_WING} />);

    const link = screen.getByRole("link", {
      name: AD_SLOTS.W1_WING.alt,
    });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    link.focus();
    const dispatchResult = fireEvent(link, clickEvent);

    expect(document.activeElement).toBe(link);
    expect(link.className).toContain("focus-visible:ring-2");
    expect(link.getAttribute("aria-label")).toBe(AD_SLOTS.W1_WING.alt);
    expect(link.getAttribute("href")).toBe(AD_SLOTS.W1_WING.href);
    expect(dispatchResult).toBe(true);
    expect(clickEvent.defaultPrevented).toBe(false);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      eventName: "ad_click",
      slotId: "W1_WING",
      creativeId: "replace-me-wing",
      page: "home",
      viewport: "desktop",
      destinationUrl: AD_SLOTS.W1_WING.href,
    });
    expect(consoleInfo).toHaveBeenCalledWith("[demo-ad-event]", events[0]);
  });
});
