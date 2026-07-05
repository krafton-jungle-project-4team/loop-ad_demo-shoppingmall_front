import type { AdSlotConfig, AdSlotId } from "@/config/ad-slots";
import {
  trackLoopAdEvent,
  type AdvertisementFilledDecision,
  type LoopAdTrackFields,
} from "@/lib/loop-ad-sdk";
import { rememberLoopAdAttribution } from "@/utils/ad-attribution";

export type AdEventName = "promotion_impression" | "promotion_click";
export type AdViewport = "mobile" | "tablet" | "desktop";

export type AdEventPayload = {
  eventName: AdEventName;
  slotId: AdSlotId;
  contentId: string;
  page: string;
  viewport: AdViewport;
  timestamp: string;
};

const TABLET_MIN_WIDTH = 768;
const DESKTOP_MIN_WIDTH = 1200;

export function getAdViewport(width: number): AdViewport {
  if (width < TABLET_MIN_WIDTH) {
    return "mobile";
  }

  if (width < DESKTOP_MIN_WIDTH) {
    return "tablet";
  }

  return "desktop";
}

export function createAdEventPayload(
  eventName: AdEventName,
  slot: AdSlotConfig,
  page: string,
  width: number,
  timestamp = new Date().toISOString(),
): AdEventPayload {
  return {
    eventName,
    slotId: slot.id,
    contentId: slot.contentId,
    page,
    viewport: getAdViewport(width),
    timestamp,
  };
}

export function createAdDecisionEventPayload(
  eventName: AdEventName,
  slot: AdSlotConfig,
  decision: AdvertisementFilledDecision,
  page: string,
  width: number,
  timestamp = new Date().toISOString(),
): AdEventPayload {
  return {
    eventName,
    slotId: slot.id,
    contentId: decision.tracking.content_id || slot.contentId,
    page,
    viewport: getAdViewport(width),
    timestamp,
  };
}

export function emitAdEvent(payload: AdEventPayload): void {
  console.info("[ad-event]", JSON.stringify(payload));

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("ad-event", { detail: payload }));
}

export function trackAdEventWithSdk(
  payload: AdEventPayload,
  fields: LoopAdTrackFields = {},
): void {
  const sdkFields: LoopAdTrackFields = {
    ...fields,
    promotionChannel: fields.promotionChannel ?? "onsite_banner",
    contentId: fields.contentId ?? payload.contentId,
    placementId: fields.placementId ?? payload.slotId,
    device: fields.device ?? payload.viewport,
    properties: {
      slot_id: payload.slotId,
      page: payload.page,
      viewport: payload.viewport,
      source_event_time: payload.timestamp,
      ...(fields.properties ?? {}),
    },
  };

  if (payload.eventName === "promotion_click") {
    rememberLoopAdAttribution(sdkFields, {
      source: stringProperty(sdkFields.properties?.source),
      placementKey: sdkFields.placementId ?? undefined,
      page: payload.page,
      timestamp: payload.timestamp,
    });
  }

  trackLoopAdEvent(payload.eventName, sdkFields);
}

function stringProperty(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
