import {
  getDemoIdentity,
  trackLoopAdEvent,
  type LoopAdTrackFields,
} from "@/lib/loop-ad-sdk";
import { rememberLoopAdAttribution } from "@/utils/ad-attribution";

type CampaignEventName = "campaign_redirect_click" | "campaign_landing";

const CAMPAIGN_EVENT_STORAGE_PREFIX = "loop-ad-demo-campaign-event.v1";

const CAMPAIGN_PARAM_KEYS = [
  "loopad_campaign_id",
  "campaign_id",
  "campaignId",
  "utm_campaign",
  "loopad_promotion_id",
  "promotion_id",
  "promotionId",
  "loopad_promotion_run_id",
  "promotion_run_id",
  "promotionRunId",
  "loopad_ad_experiment_id",
  "ad_experiment_id",
  "adExperimentId",
  "loopad_promotion_channel",
  "promotion_channel",
  "promotionChannel",
  "loopad_segment_id",
  "segment_id",
  "segmentId",
  "loopad_content_id",
  "content_id",
  "contentId",
  "loopad_content_option_id",
  "content_option_id",
  "contentOptionId",
  "loopad_redirect_id",
  "redirect_id",
  "redirectId",
  "landing_type",
  "landingType",
  "landing_url",
  "landingUrl",
  "target_url",
  "targetUrl",
  "utm_source",
  "utm_medium",
  "source",
  "channel",
  "deal",
];

export function trackCampaignRouteEvents(
  url: string,
  previousUrl?: string | null,
): void {
  const campaign = createCampaignRouteEvent(url, previousUrl);

  if (!campaign) {
    return;
  }

  rememberLoopAdAttribution(campaign.fields, {
    source: "campaign_route",
    page: new URL(url).pathname,
  });
  trackCampaignEventOnce("campaign_redirect_click", campaign);
  trackCampaignEventOnce("campaign_landing", campaign);
}

function createCampaignRouteEvent(
  url: string,
  previousUrl?: string | null,
): { signature: string; fields: LoopAdTrackFields } | null {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const params = parsedUrl.searchParams;

  if (!hasCampaignSignal(params)) {
    return null;
  }

  const campaignId =
    textParam(params, "loopad_campaign_id", "campaign_id", "campaignId", "utm_campaign") ??
    textParam(params, "deal");
  const source = textParam(params, "utm_source", "source", "channel");
  const medium = textParam(params, "utm_medium", "medium");
  const landingUrl = textParam(params, "landing_url", "landingUrl") ?? url;
  const targetUrl = textParam(params, "target_url", "targetUrl") ?? url;

  return {
    signature: createCampaignSignature(parsedUrl),
    fields: {
      campaignId,
      promotionId: textParam(params, "loopad_promotion_id", "promotion_id", "promotionId"),
      promotionRunId: textParam(
        params,
        "loopad_promotion_run_id",
        "promotion_run_id",
        "promotionRunId",
      ),
      adExperimentId: textParam(
        params,
        "loopad_ad_experiment_id",
        "ad_experiment_id",
        "adExperimentId",
      ),
      promotionChannel:
        textParam(
          params,
          "loopad_promotion_channel",
          "promotion_channel",
          "promotionChannel",
        ) ??
        "campaign",
      segmentId: textParam(params, "loopad_segment_id", "segment_id", "segmentId"),
      contentId: textParam(params, "loopad_content_id", "content_id", "contentId"),
      contentOptionId: textParam(
        params,
        "loopad_content_option_id",
        "content_option_id",
        "contentOptionId",
      ),
      redirectId: textParam(params, "loopad_redirect_id", "redirect_id", "redirectId"),
      landingType:
        textParam(params, "landing_type", "landingType") ??
        (textParam(params, "deal") ? "promotion_deal" : "campaign"),
      landingUrl,
      targetUrl,
      properties: {
        campaign_source: source ?? "",
        campaign_medium: medium ?? "",
        campaign_name: textParam(params, "utm_campaign") ?? campaignId ?? "",
        page_path: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
        previous_url: previousUrl ?? "",
      },
    },
  };
}

function trackCampaignEventOnce(
  eventName: CampaignEventName,
  campaign: { signature: string; fields: LoopAdTrackFields },
): void {
  const storageKey = `${CAMPAIGN_EVENT_STORAGE_PREFIX}:${eventName}:${campaign.signature}`;

  if (!getDemoIdentity()) {
    return;
  }

  if (hasSessionMarker(storageKey)) {
    return;
  }

  setSessionMarker(storageKey);
  trackLoopAdEvent(eventName, campaign.fields);
}

function hasCampaignSignal(params: URLSearchParams): boolean {
  return CAMPAIGN_PARAM_KEYS.some((key) => Boolean(textParam(params, key)));
}

function createCampaignSignature(url: URL): string {
  const signatureParams = new URLSearchParams();

  for (const key of CAMPAIGN_PARAM_KEYS) {
    const value = textParam(url.searchParams, key);

    if (value) {
      signatureParams.set(key, value);
    }
  }

  return `${url.pathname}?${signatureParams.toString()}`;
}

function textParam(params: URLSearchParams, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = params.get(key)?.trim();

    if (value) {
      return value;
    }
  }

  return undefined;
}

function hasSessionMarker(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setSessionMarker(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Campaign events should remain best-effort when storage is unavailable.
  }
}
