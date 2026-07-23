import {
  getSelectedDemoUserProfile,
  type DemoUserProfile,
} from "@/lib/demo-user";
import { getLoopAdAttributionFields } from "@/utils/ad-attribution";

type LoopAdPropertyValue =
  | string
  | number
  | boolean
  | LoopAdPropertyValue[]
  | { [key: string]: LoopAdPropertyValue };

export type LoopAdEventProperties = {
  [key: string]: LoopAdPropertyValue;
};

export type LoopAdTrackFields = {
  eventId?: string | null;
  eventTime?: string | number | Date | null;
  campaignId?: string | null;
  promotionId?: string | null;
  promotionRunId?: string | null;
  adExperimentId?: string | null;
  promotionChannel?: string | null;
  segmentId?: string | null;
  contentId?: string | null;
  contentOptionId?: string | null;
  placementId?: string | null;
  redirectId?: string | null;
  landingType?: string | null;
  landingUrl?: string | null;
  targetUrl?: string | null;
  hotelId?: string | null;
  hotelCluster?: string | null;
  hotelMarket?: string | null;
  hotelCity?: string | null;
  hotelCountry?: string | null;
  checkinDate?: string | null;
  checkoutDate?: string | null;
  adultCount?: number | string | null;
  childCount?: number | string | null;
  breakfastIncluded?: boolean | number | string | null;
  freeCancellation?: boolean | number | string | null;
  roomType?: string | null;
  bookingId?: string | null;
  currency?: string | null;
  device?: string | null;
  price?: number | null;
  revenue?: number | null;
  properties?: LoopAdEventProperties | null;
};

export type LoopAdEventContext = LoopAdEventProperties;

type LoopAdIdentity = {
  userId: string;
  sessionId: string;
};

type LoopAdPrivacyIdentity = {
  subjectId: string;
  sessionId: string;
  namespace: string;
  keyVersion: string;
};

type LoopAdPrivacyPocConfig = {
  collectorUrl: string;
  identityNamespace: string;
  identityKeyVersion: string;
  policyVersion: string;
  purposeIds: string[];
};

type LoopAdEventClient = {
  track(
    eventName: string,
    properties?: LoopAdEventProperties,
    options?: {
      eventId?: string;
      eventTime?: string | number | Date;
    },
  ): void;
  setIdentity(identity: LoopAdIdentity, context?: LoopAdEventContext | null): void;
  setPrivacyIdentity(
    identity: LoopAdPrivacyIdentity,
    context?: LoopAdEventContext | null,
  ): void;
  clearIdentity(): void;
  destroy(): void;
};

type LoopAdEventSdkGlobal = {
  init(options: {
    connectionUrl: string;
    identity?: LoopAdIdentity | null;
    privacy?: {
      collectorUrl: string;
      identity?: LoopAdPrivacyIdentity | null;
      consent: {
        status: "granted";
        policyVersion: string;
        purposeIds: string[];
      };
    } | null;
    debug?: boolean | null;
    autoTrackPageViews?: boolean | null;
    collectDomEvents?: boolean | null;
    context?: LoopAdEventContext | null;
  }): Promise<LoopAdEventClient>;
  version: string;
};

export type AdvertisementFilledDecision = {
  placementId: string;
  placementKey: string;
  status: "filled";
  ad: {
    title: string;
    body: string;
    cta: string;
    targetUrl: string;
  };
  tracking: {
    project_id: string;
    user_id: string;
    campaign_id: string;
    promotion_id: string;
    promotion_run_id: string;
    ad_experiment_id: string;
    segment_id: string;
    content_id: string;
    content_option_id: string;
    promotion_channel: "onsite_banner";
    placement_id: string;
    target_url: string;
  };
};

type AdvertisementDecision =
  | AdvertisementFilledDecision
  | {
      placementKey: string;
      placementId?: string;
      status: "empty";
      ad: null;
      tracking: null;
    };

type AdvertisementClient = {
  render(options: {
    placementId: string;
    placementKey: string;
    targetId: string;
    context?: Record<string, string | number | boolean | null> | null;
    onImpression?: ((decision: AdvertisementFilledDecision) => void) | null;
    onClick?: ((decision: AdvertisementFilledDecision) => void) | null;
  }): Promise<AdvertisementDecision>;
  destroy(): void;
};

type AdvertisementSdkGlobal = {
  init(options: {
    apiBaseUrl: string;
    projectId: string;
    userId?: string;
    subjectId?: string;
    promotionRunId: string;
    debug?: boolean | null;
  }): AdvertisementClient;
  version: string;
};

declare global {
  interface Window {
    LoopAdEventSDK?: LoopAdEventSdkGlobal;
    LoopAdAdvertisementSDK?: AdvertisementSdkGlobal;
    LoopAdPrivacyPocConfig?: LoopAdPrivacyPocConfig;
  }
}

const LOOP_AD_ADVERTISEMENT_SDK_URL =
  "https://krafton-jungle-project-4team.github.io/loop-ad_advertisement_sdk/loop-ad-advertisement-sdk.iife.js";
const LOOP_AD_EVENT_SDK_URL =
  "https://krafton-jungle-project-4team.github.io/loop-ad_event_sdk/loop-ad-event-sdk.iife.js";
const LOOP_AD_CONNECTION_URL =
  "https://dashboard.api.dev.loop-ad.org/api/public/v1/sdk/connections/demo_project";
const DEMO_SESSION_STORAGE_KEY = "loop-ad-demo-session-id";
const LOOP_AD_PROJECT_ID = "demo_project";
const LOOP_AD_AD_API_BASE_URL = "https://dashboard.api.dev.loop-ad.org/api";
const DEV_AD_API_BASE_URL = "/api";
const LOOP_AD_DEBUG = true;
const PROMOTION_CHANNEL = "onsite_banner";

const scriptLoaders = new Map<string, Promise<void>>();
let eventClientPromise: Promise<LoopAdEventClient> | null = null;
let eventClientInstance: LoopAdEventClient | null = null;
let advertisementClientPromise: Promise<AdvertisementClient | null> | null = null;
let advertisementClientPromotionRunId: string | null = null;

export const loopAdSdkConfig = {
  eventSdkUrl: LOOP_AD_EVENT_SDK_URL,
  advertisementSdkUrl: LOOP_AD_ADVERTISEMENT_SDK_URL,
  projectId: LOOP_AD_PROJECT_ID,
  connectionUrl: resolveEventConnectionUrl(LOOP_AD_CONNECTION_URL),
  advertisementApiBaseUrl: import.meta.env.DEV
    ? DEV_AD_API_BASE_URL
    : LOOP_AD_AD_API_BASE_URL,
  debug: LOOP_AD_DEBUG,
};

function resolveEventConnectionUrl(configuredUrl: string): string {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return configuredUrl;
  }

  const connectionUrl = new URL(configuredUrl, window.location.origin);
  if (connectionUrl.origin !== new URL(LOOP_AD_CONNECTION_URL).origin) {
    return connectionUrl.href;
  }

  return new URL(
    `${connectionUrl.pathname}${connectionUrl.search}`,
    window.location.origin,
  ).href;
}

export function initLoopAdEventSdk(): Promise<LoopAdEventClient> {
  if (!eventClientPromise) {
    eventClientPromise = loadScript(
      loopAdSdkConfig.eventSdkUrl,
      () => window.LoopAdEventSDK,
    )
      .then(async () => {
        const sdk = window.LoopAdEventSDK;

        if (!sdk) {
          throw new Error("LoopAdEventSDK global was not registered.");
        }

        const privacyConfig = getPrivacyPocConfig();
        const client = await sdk.init({
          connectionUrl: loopAdSdkConfig.connectionUrl,
          identity: privacyConfig ? null : getDemoIdentity(),
          privacy: privacyConfig
            ? {
                collectorUrl: privacyConfig.collectorUrl,
                identity: getDemoPrivacyIdentity(privacyConfig),
                consent: {
                  status: "granted",
                  policyVersion: privacyConfig.policyVersion,
                  purposeIds: [...privacyConfig.purposeIds],
                },
              }
            : null,
          debug: loopAdSdkConfig.debug,
          autoTrackPageViews: false,
          collectDomEvents: true,
          context: createLoopAdSharedContext(),
        });

        eventClientInstance = client;

        return client;
      })
      .catch((error: unknown) => {
        eventClientPromise = null;
        eventClientInstance = null;
        throw error;
      });
  }

  return eventClientPromise;
}

export function destroyLoopAdEventSdk(): void {
  const clientPromise = eventClientPromise;
  eventClientPromise = null;
  eventClientInstance = null;
  void clientPromise?.then((client) => client.destroy()).catch(() => undefined);
}

export function renderLoopAdPlacement(options: {
  placementKey: string;
  targetId: string;
  page: string;
  onImpression?: ((decision: AdvertisementFilledDecision) => void) | null;
  onClick?: ((decision: AdvertisementFilledDecision) => void) | null;
}): Promise<AdvertisementDecision> {
  return initLoopAdAdvertisementSdk().then((client) => {
    if (!client) {
      return {
        placementKey: options.placementKey,
        placementId: options.placementKey,
        status: "empty",
        ad: null,
        tracking: null,
      };
    }

    return client.render({
      placementId: options.placementKey,
      placementKey: options.placementKey,
      targetId: options.targetId,
      context: {
        promotionChannel: PROMOTION_CHANNEL,
        page: options.page,
        device: detectDevice(),
        ...createLoopAdAdContext(),
      },
      onImpression: options.onImpression ?? null,
      onClick: options.onClick ?? null,
    });
  });
}

export function trackLoopAdEvent(eventName: string, fields?: LoopAdTrackFields): void {
  const identity = getDemoIdentity();

  if (!identity) {
    if (loopAdSdkConfig.debug) {
      console.info("Loop Ad Event SDK tracking skipped before demo login.");
    }

    return;
  }

  const trackFields = withDemoUserTrackFields(withLoopAdAttributionFields(fields));

  const readyClient = eventClientInstance;

  if (readyClient) {
    trackWithGenericClient(readyClient, eventName, trackFields);
    return;
  }

  void initLoopAdEventSdk()
    .then((client) => {
      trackWithGenericClient(client, eventName, trackFields);
    })
    .catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK tracking skipped.", error);
      }
    });
}

export function trackLoopAdPageView(previousUrl?: string | null): void {
  trackLoopAdEvent("page_view", createPageViewFields(previousUrl));
}

export function setLoopAdDemoUserIdentity(): void {
  if (!getDemoIdentity()) {
    return;
  }

  void initLoopAdEventSdk()
    .then((client) => {
      const identity = getDemoIdentity();

      if (!identity) {
        return;
      }

      const privacyConfig = getPrivacyPocConfig();
      if (privacyConfig) {
        const privacyIdentity = getDemoPrivacyIdentity(privacyConfig);
        if (!privacyIdentity) {
          return;
        }
        client.setPrivacyIdentity(privacyIdentity, createLoopAdSharedContext());
      } else {
        client.setIdentity(identity, createLoopAdSharedContext());
      }
      resetLoopAdAdvertisementSdk();
      trackLoopAdPageView();
    })
    .catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK identity update skipped.", error);
      }
    });
}

function initLoopAdAdvertisementSdk(): Promise<AdvertisementClient | null> {
  const identity = getDemoIdentity();
  const promotionRunId = getCurrentPromotionRunId();

  if (!identity) {
    return Promise.resolve(null);
  }

  if (!promotionRunId) {
    resetLoopAdAdvertisementSdk();
    if (loopAdSdkConfig.debug) {
      console.info("Loop Ad Advertisement SDK skipped without a promotion run id.");
    }

    return Promise.resolve(null);
  }

  if (
    advertisementClientPromise &&
    advertisementClientPromotionRunId !== promotionRunId
  ) {
    resetLoopAdAdvertisementSdk();
  }

  if (!advertisementClientPromise) {
    advertisementClientPromotionRunId = promotionRunId;
    advertisementClientPromise = loadScript(
      loopAdSdkConfig.advertisementSdkUrl,
      () => window.LoopAdAdvertisementSDK,
    )
      .then(() => {
        const sdk = window.LoopAdAdvertisementSDK;

        if (!sdk) {
          throw new Error("LoopAdAdvertisementSDK global was not registered.");
        }

        const currentIdentity = getDemoIdentity();

        if (!currentIdentity) {
          advertisementClientPromise = null;
          return null;
        }

        const privacyConfig = getPrivacyPocConfig();
        return sdk.init({
          apiBaseUrl: loopAdSdkConfig.advertisementApiBaseUrl,
          projectId: loopAdSdkConfig.projectId,
          ...(privacyConfig
            ? {
                subjectId: getDemoPrivacyIdentity(privacyConfig)?.subjectId,
              }
            : { userId: currentIdentity.userId }),
          promotionRunId,
          debug: loopAdSdkConfig.debug,
        });
      })
      .catch((error: unknown) => {
        advertisementClientPromise = null;
        advertisementClientPromotionRunId = null;
        throw error;
      });
  }

  return advertisementClientPromise;
}

function resetLoopAdAdvertisementSdk(): void {
  const clientPromise = advertisementClientPromise;
  advertisementClientPromise = null;
  advertisementClientPromotionRunId = null;

  void clientPromise
    ?.then((client) => client?.destroy())
    .catch(() => undefined);
}

function loadScript<T>(src: string, getGlobal: () => T | undefined): Promise<void> {
  if (getGlobal()) {
    return Promise.resolve();
  }

  if (typeof document === "undefined") {
    return Promise.reject(new Error("Loop Ad SDK scripts require a browser document."));
  }

  const existingLoader = scriptLoaders.get(src);

  if (existingLoader) {
    return existingLoader;
  }

  const loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = withLatestSdkQuery(src);
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.loopAdSdk = "true";

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => {
        script.remove();
        scriptLoaders.delete(src);
        reject(new Error(`Failed to load Loop Ad SDK script: ${src}`));
      },
      { once: true },
    );

    document.head.appendChild(script);
  });

  scriptLoaders.set(src, loader);
  return loader;
}

function withLatestSdkQuery(src: string): string {
  const url = new URL(src, window.location.href);
  url.searchParams.set("loopad_sdk_t", Date.now().toString());
  return url.toString();
}

function createPageViewFields(previousUrl?: string | null): LoopAdTrackFields {
  const page = getCurrentPageProperties(previousUrl);

  return {
    promotionChannel: PROMOTION_CHANNEL,
    device: detectDevice(),
    properties: {
      route_group: page.path,
    },
  };
}

function getCurrentPageProperties(previousUrl?: string | null): LoopAdEventProperties {
  if (typeof window === "undefined") {
    return {
      url: "",
      path: "",
      title: "",
      referrer: "",
      previous_url: previousUrl ?? "",
    };
  }

  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  return {
    url: window.location.href,
    path,
    title: typeof document === "undefined" ? "" : document.title,
    referrer: typeof document === "undefined" ? "" : document.referrer,
    previous_url: previousUrl ?? "",
  };
}

export function getDemoIdentity(): LoopAdIdentity | null {
  const profile = getSelectedDemoUserProfile();

  if (!profile) {
    return null;
  }

  if (typeof window === "undefined") {
    return {
      userId: profile.userId,
      sessionId: "demo-session-browser-only",
    };
  }

  return {
    userId: profile.userId,
    sessionId: getStoredDemoSessionId(),
  };
}

export function getDemoPrivacyIdentity(
  config: LoopAdPrivacyPocConfig,
): LoopAdPrivacyIdentity | null {
  const profile = getSelectedDemoUserProfile();
  if (!profile) {
    return null;
  }
  return {
    subjectId: profile.privacySubjectId,
    sessionId:
      typeof window === "undefined"
        ? "demo-session-browser-only"
        : getStoredDemoSessionId(),
    namespace: config.identityNamespace,
    keyVersion: config.identityKeyVersion,
  };
}

function getPrivacyPocConfig(): LoopAdPrivacyPocConfig | null {
  if (typeof window === "undefined" || !window.LoopAdPrivacyPocConfig) {
    return null;
  }
  const config = window.LoopAdPrivacyPocConfig;
  if (
    !isNonEmptyString(config.collectorUrl) ||
    !isNonEmptyString(config.identityNamespace) ||
    !isNonEmptyString(config.identityKeyVersion) ||
    !isNonEmptyString(config.policyVersion) ||
    !Array.isArray(config.purposeIds) ||
    config.purposeIds.length === 0 ||
    config.purposeIds.some((purposeId) => !isNonEmptyString(purposeId))
  ) {
    throw new Error("Loop Ad privacy PoC config is invalid.");
  }
  return {
    ...config,
    purposeIds: [...config.purposeIds],
  };
}

function getStoredDemoSessionId(): string {
  try {
    const sessionId = window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY);

    if (isNonEmptyString(sessionId)) {
      return sessionId;
    }
  } catch {
    // Create an in-memory identity when sessionStorage is unavailable.
  }

  const sessionId = createId("demo-session");
  storeDemoSessionId(sessionId);
  return sessionId;
}

function storeDemoSessionId(sessionId: string): void {
  try {
    window.sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Demo identity should still be usable when storage writes are unavailable.
  }
}

function createLoopAdSharedContext(): LoopAdEventContext {
  return {
    promotion_channel: PROMOTION_CHANNEL,
    device: detectDevice(),
  };
}

function createLoopAdAdContext(): Record<string, string | null> {
  const profile = getSelectedDemoUserProfile();

  if (!profile) {
    return {};
  }

  return {
    ageGroup: profile.ageGroup,
    gender: profile.gender,
    region: profile.region,
    userType: profile.type,
    userSegment: profile.segment,
    preferredCategory: profile.preferredCategory,
  };
}

function getCurrentPromotionRunId(): string | null {
  if (typeof window !== "undefined") {
    const params = new URL(window.location.href).searchParams;

    for (const key of [
      "loopad_promotion_run_id",
      "promotion_run_id",
      "promotionRunId",
    ]) {
      const value = params.get(key)?.trim();

      if (value) {
        return value;
      }
    }
  }

  const promotionRunId = getLoopAdAttributionFields().promotionRunId;
  return isNonEmptyString(promotionRunId) ? promotionRunId : null;
}

function withDemoUserTrackFields(fields: LoopAdTrackFields = {}): LoopAdTrackFields {
  const profile = getSelectedDemoUserProfile();

  if (!profile) {
    return fields;
  }

  return {
    ...fields,
    properties: {
      ...(fields.properties ?? {}),
      ...createDemoUserProperties(profile),
    },
  };
}

function withLoopAdAttributionFields(
  fields: LoopAdTrackFields = {},
): LoopAdTrackFields {
  const attributionFields = getLoopAdAttributionFields();

  return {
    ...attributionFields,
    ...fields,
    properties: {
      ...(attributionFields.properties ?? {}),
      ...(fields.properties ?? {}),
    },
  };
}

function trackWithGenericClient(
  client: LoopAdEventClient,
  eventName: string,
  fields: LoopAdTrackFields,
): void {
  const options: { eventId?: string; eventTime?: string | number | Date } = {};
  if (typeof fields.eventId === "string" && fields.eventId.trim()) {
    options.eventId = fields.eventId;
  }
  if (
    typeof fields.eventTime === "string" ||
    typeof fields.eventTime === "number" ||
    fields.eventTime instanceof Date
  ) {
    options.eventTime = fields.eventTime;
  }
  client.track(
    eventName,
    propertiesFromTrackFields(fields),
    Object.keys(options).length > 0 ? options : undefined,
  );
}

function propertiesFromTrackFields(fields: LoopAdTrackFields): LoopAdEventProperties {
  return compactProperties({
    campaign_id: fields.campaignId,
    promotion_id: fields.promotionId,
    promotion_run_id: fields.promotionRunId,
    ad_experiment_id: fields.adExperimentId,
    promotion_channel: fields.promotionChannel,
    segment_id: fields.segmentId,
    content_id: fields.contentId,
    content_option_id: fields.contentOptionId,
    placement_id: fields.placementId,
    redirect_id: fields.redirectId,
    landing_type: fields.landingType,
    landing_url: fields.landingUrl,
    target_url: fields.targetUrl,
    hotel_id: fields.hotelId,
    hotel_cluster: fields.hotelCluster,
    hotel_market: fields.hotelMarket,
    hotel_city: fields.hotelCity,
    hotel_country: fields.hotelCountry,
    checkin_date: fields.checkinDate,
    checkout_date: fields.checkoutDate,
    adult_count: fields.adultCount,
    child_count: fields.childCount,
    breakfast_included: fields.breakfastIncluded,
    free_cancellation: fields.freeCancellation,
    room_type: fields.roomType,
    booking_id: fields.bookingId,
    currency: fields.currency,
    device: fields.device,
    price: fields.price,
    revenue: fields.revenue,
    ...(fields.properties ?? {}),
  });
}

function compactProperties(
  value: Record<string, LoopAdPropertyValue | null | undefined>,
): LoopAdEventProperties {
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, LoopAdPropertyValue] =>
        entry[1] !== null && entry[1] !== undefined,
    ),
  );
}

function createDemoUserProperties(profile: DemoUserProfile): LoopAdEventProperties {
  return {
    region: profile.region,
    age_group: profile.ageGroup,
    gender: profile.gender,
    user_type: profile.type,
    user_segment: profile.segment,
    preferred_category: profile.preferredCategory,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function createId(prefix: string): string {
  const value =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${value}`;
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") {
    return "desktop";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1200) {
    return "tablet";
  }

  return "desktop";
}
