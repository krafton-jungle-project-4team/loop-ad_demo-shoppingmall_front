import type { AdSlotConfig, AdSlotId } from "@/config/ad-slots";

export type AdEventName = "ad_impression" | "ad_click";

export type AdViewport = "mobile" | "tablet" | "desktop";

export type AdEventPayload = {
  eventName: AdEventName;
  slotId: AdSlotId;
  creativeId: string;
  page: "home";
  viewport: AdViewport;
  destinationUrl?: string;
  timestamp: string;
};

const impressionSlotIds = new Set<AdSlotId>();

export function getAdViewport(width = window.innerWidth): AdViewport {
  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

export function isAdElementVisible(element: Element) {
  const style = window.getComputedStyle(element);

  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    element.getClientRects().length > 0
  );
}

export function buildAdEventPayload(
  eventName: AdEventName,
  slot: AdSlotConfig,
): AdEventPayload {
  const payload: AdEventPayload = {
    eventName,
    slotId: slot.slotId,
    creativeId: slot.creativeId,
    page: "home",
    viewport: getAdViewport(),
    timestamp: new Date().toISOString(),
  };

  if (eventName === "ad_click") {
    payload.destinationUrl = slot.href;
  }

  return payload;
}

export function emitAdEvent(payload: AdEventPayload) {
  console.info("[demo-ad-event]", payload);
  window.dispatchEvent(new CustomEvent("demo:ad-event", { detail: payload }));
}

export function emitAdImpression(slot: AdSlotConfig) {
  if (impressionSlotIds.has(slot.slotId)) {
    return false;
  }

  impressionSlotIds.add(slot.slotId);
  emitAdEvent(buildAdEventPayload("ad_impression", slot));

  return true;
}

export function emitAdClick(slot: AdSlotConfig) {
  emitAdEvent(buildAdEventPayload("ad_click", slot));
}

export function resetAdEventStateForTest() {
  impressionSlotIds.clear();
}
