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
  "loopad_channel",
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
  let parsedPreviousUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (previousUrl) {
    try {
      parsedPreviousUrl = new URL(previousUrl);
    } catch {
      parsedPreviousUrl = null;
    }
  }

  const params = parsedUrl.searchParams;
  const previousParams = parsedPreviousUrl?.searchParams ?? null;
  const attributionParams = chooseAttributionParams(params, previousParams);

  if (!hasCampaignSignal(params) && !attributionParams) {
    return null;
  }

  const campaignId = attributionParams
    ? textParam(attributionParams, "loopad_campaign_id", "campaign_id", "campaignId")
    : undefined;
  const deal = textParam(params, "deal") ?? textParam(attributionParams, "deal");
  const source =
    textParam(params, "utm_source", "source", "channel", "loopad_channel") ??
    textParam(attributionParams, "utm_source", "source", "channel", "loopad_channel");
  const medium =
    textParam(params, "utm_medium", "medium") ??
    textParam(attributionParams, "utm_medium", "medium");
  const campaignName =
    textParam(params, "utm_campaign", "campaign_name", "campaignName") ??
    textParam(attributionParams, "utm_campaign", "campaign_name", "campaignName") ??
    deal ??
    campaignId;
  const landingUrl = textParam(params, "landing_url", "landingUrl") ?? url;
  const targetUrl = textParam(params, "target_url", "targetUrl") ?? url;

  return {
    signature: createCampaignSignature(parsedUrl, parsedPreviousUrl),
    fields: {
      campaignId,
      promotionId: textParam(
        attributionParams,
        "loopad_promotion_id",
        "promotion_id",
        "promotionId",
      ),
      promotionRunId: textParam(
        attributionParams,
        "loopad_promotion_run_id",
        "promotion_run_id",
        "promotionRunId",
      ),
      adExperimentId: textParam(
        attributionParams,
        "loopad_ad_experiment_id",
        "ad_experiment_id",
        "adExperimentId",
      ),
      promotionChannel:
        textParam(
          attributionParams,
          "loopad_promotion_channel",
          "loopad_channel",
          "promotion_channel",
          "promotionChannel",
        ) ??
        source ??
        "campaign",
      segmentId: textParam(attributionParams, "loopad_segment_id", "segment_id", "segmentId"),
      contentId: textParam(attributionParams, "loopad_content_id", "content_id", "contentId"),
      contentOptionId: textParam(
        attributionParams,
        "loopad_content_option_id",
        "content_option_id",
        "contentOptionId",
      ),
      redirectId: textParam(attributionParams, "loopad_redirect_id", "redirect_id", "redirectId"),
      landingType:
        textParam(params, "landing_type", "landingType") ??
        (deal ? "promotion_deal" : "campaign"),
      landingUrl,
      targetUrl,
      properties: {
        campaign_source: source ?? "",
        campaign_medium: medium ?? "",
        campaign_name: campaignName ?? "",
        deal: deal ?? "",
        landing_path: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
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

function chooseAttributionParams(
  params: URLSearchParams,
  previousParams: URLSearchParams | null,
): URLSearchParams | null {
  if (hasLoopAdAttributionSignal(params)) {
    return params;
  }

  if (previousParams && hasLoopAdAttributionSignal(previousParams)) {
    return previousParams;
  }

  return hasNonDealCampaignId(params) ? params : null;
}

function hasLoopAdAttributionSignal(params: URLSearchParams): boolean {
  return [
    "loopad_campaign_id",
    "loopad_promotion_id",
    "loopad_promotion_run_id",
    "loopad_ad_experiment_id",
    "loopad_segment_id",
    "loopad_content_id",
    "loopad_content_option_id",
    "loopad_redirect_id",
    "loopad_channel",
  ].some((key) => Boolean(textParam(params, key)));
}

function hasNonDealCampaignId(params: URLSearchParams): boolean {
  return Boolean(textParam(params, "campaign_id", "campaignId"));
}

function createCampaignSignature(url: URL, previousUrl: URL | null): string {
  const signatureParams = new URLSearchParams();

  for (const key of CAMPAIGN_PARAM_KEYS) {
    const value =
      textParam(url.searchParams, key) ??
      (previousUrl ? textParam(previousUrl.searchParams, key) : undefined);

    if (value) {
      signatureParams.set(key, value);
    }
  }

  return `${url.pathname}?${signatureParams.toString()}`;
}

function textParam(
  params: URLSearchParams | null | undefined,
  ...keys: string[]
): string | undefined {
  if (!params) {
    return undefined;
  }

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
