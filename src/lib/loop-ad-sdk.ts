import {
  getSelectedDemoUserProfile,
  type DemoUserProfile,
} from "@/lib/demo-user";

type LoopAdPropertyValue =
  | string
  | number
  | boolean
  | null
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

export type LoopAdEventContext = Omit<
  LoopAdTrackFields,
  "eventId" | "eventTime" | "properties"
>;

type LoopAdIdentity = {
  userId: string;
  sessionId: string;
};

type LoopAdCollectorPayload = {
  project_id: string;
  write_key: string;
  schema_version: "hotel_rec_promo.v1";
  event_id: string;
  event_name: string;
  event_time: string;
  source: "browser_sdk";
  user_id: string;
  session_id: string;
  properties_json: string;
};

type LoopAdEventClient = {
  track(eventName: string, fields?: LoopAdTrackFields): void;
  setIdentity(identity: LoopAdIdentity, context?: LoopAdEventContext | null): void;
  clearIdentity(): void;
  destroy(): void;
};

type LoopAdEventSdkGlobal = {
  init(options: {
    projectId: string;
    writeKey: string;
    identity?: LoopAdIdentity | null;
    debug?: boolean | null;
    autoTrackPageViews?: boolean | null;
    collectDomEvents?: boolean | null;
    context?: LoopAdEventContext | null;
  }): LoopAdEventClient;
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
    userId: string;
    promotionRunId: string;
    debug?: boolean | null;
  }): AdvertisementClient;
  version: string;
};

declare global {
  interface Window {
    LoopAdEventSDK?: LoopAdEventSdkGlobal;
    LoopAdAdvertisementSDK?: AdvertisementSdkGlobal;
  }
}

const LOOP_AD_EVENT_SDK_URL =
  "https://krafton-jungle-project-4team.github.io/loop-ad_event_sdk/loop-ad-event-sdk.iife.js";
const LOOP_AD_ADVERTISEMENT_SDK_URL =
  "https://krafton-jungle-project-4team.github.io/loop-ad_advertisement_sdk/loop-ad-advertisement-sdk.iife.js";
const DEMO_SESSION_STORAGE_KEY = "loop-ad-demo-session-id";
const DEFAULT_PROJECT_ID = "demo_project";
const DEFAULT_WRITE_KEY = "demo_project";
const DEFAULT_PROMOTION_RUN_ID = "demo_project";
const DEFAULT_AD_API_BASE_URL = "https://dashboard.api.dev.loop-ad.org/api";
const DEV_AD_API_BASE_URL = "/api";
const EVENT_INGEST_ENDPOINT = "https://event.api.dev.loop-ad.org";
const EVENT_SCHEMA_VERSION = "hotel_rec_promo.v1";
const PROMOTION_CHANNEL = "onsite_banner";
const DIRECT_COLLECTOR_EVENT_NAMES = new Set([
  "page_view",
  "promotion_impression",
  "promotion_click",
  "campaign_redirect_click",
  "campaign_landing",
  "hotel_search",
  "hotel_click",
  "hotel_detail_view",
  "booking_start",
  "booking_complete",
  "booking_cancel",
]);

const scriptLoaders = new Map<string, Promise<void>>();
let eventClientPromise: Promise<LoopAdEventClient | null> | null = null;
let eventClientInstance: LoopAdEventClient | null = null;
let advertisementClientPromise: Promise<AdvertisementClient | null> | null = null;

export const loopAdSdkConfig = {
  eventSdkUrl: LOOP_AD_EVENT_SDK_URL,
  advertisementSdkUrl: LOOP_AD_ADVERTISEMENT_SDK_URL,
  projectId: textEnv(import.meta.env.VITE_LOOP_AD_PROJECT_ID) ?? DEFAULT_PROJECT_ID,
  writeKey: textEnv(import.meta.env.VITE_LOOP_AD_WRITE_KEY) ?? DEFAULT_WRITE_KEY,
  promotionRunId:
    textEnv(import.meta.env.VITE_LOOP_AD_PROMOTION_RUN_ID) ??
    DEFAULT_PROMOTION_RUN_ID,
  advertisementApiBaseUrl:
    textEnv(import.meta.env.VITE_LOOP_AD_AD_API_BASE_URL) ??
    (import.meta.env.DEV ? DEV_AD_API_BASE_URL : DEFAULT_AD_API_BASE_URL),
  debug:
    textEnv(import.meta.env.VITE_LOOP_AD_DEBUG) === "true" ||
    import.meta.env.DEV,
};

export function initLoopAdEventSdk(): Promise<LoopAdEventClient | null> {
  const identity = getDemoIdentity();

  if (!identity) {
    return Promise.resolve(null);
  }

  if (!eventClientPromise) {
    eventClientPromise = loadScript(
      loopAdSdkConfig.eventSdkUrl,
      () => window.LoopAdEventSDK,
    )
      .then(() => {
        const sdk = window.LoopAdEventSDK;

        if (!sdk) {
          throw new Error("LoopAdEventSDK global was not registered.");
        }

        const currentIdentity = getDemoIdentity();

        if (!currentIdentity) {
          eventClientPromise = null;
          eventClientInstance = null;
          return null;
        }

        const client = sdk.init({
          projectId: loopAdSdkConfig.projectId,
          writeKey: loopAdSdkConfig.writeKey,
          debug: loopAdSdkConfig.debug,
          autoTrackPageViews: false,
          collectDomEvents: false,
          context: createLoopAdSharedContext(),
        });

        client.setIdentity(currentIdentity, createLoopAdSharedContext());
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

  const trackFields = withDemoUserTrackFields(fields);

  if (shouldUseDirectCollectorTransport(eventName)) {
    sendLoopAdEventDirectly(eventName, identity, trackFields);

    void initLoopAdEventSdk().catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK preload skipped.", error);
      }
    });

    return;
  }

  const readyClient = eventClientInstance;

  if (readyClient) {
    readyClient.track(eventName, trackFields);
    return;
  }

  if (shouldUseDirectCollectorFallback()) {
    sendLoopAdEventDirectly(eventName, identity, trackFields);

    void initLoopAdEventSdk().catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK preload skipped.", error);
      }
    });

    return;
  }

  void initLoopAdEventSdk()
    .then((client) => client?.track(eventName, trackFields))
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

      if (!client || !identity) {
        return;
      }

      client.setIdentity(identity, createLoopAdSharedContext());
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

  if (!identity) {
    return Promise.resolve(null);
  }

  if (!advertisementClientPromise) {
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

        return sdk.init({
          apiBaseUrl: loopAdSdkConfig.advertisementApiBaseUrl,
          projectId: loopAdSdkConfig.projectId,
          userId: currentIdentity.userId,
          promotionRunId: loopAdSdkConfig.promotionRunId,
          debug: loopAdSdkConfig.debug,
        });
      })
      .catch((error: unknown) => {
        advertisementClientPromise = null;
        throw error;
      });
  }

  return advertisementClientPromise;
}

function resetLoopAdAdvertisementSdk(): void {
  const clientPromise = advertisementClientPromise;
  advertisementClientPromise = null;

  void clientPromise
    ?.then((client) => client?.destroy())
    .catch(() => undefined);
}

function loadScript<T>(src: string, getGlobal: () => T | undefined): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Loop Ad SDK scripts require a browser document."));
  }

  if (getGlobal()) {
    return Promise.resolve();
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
      page,
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

function shouldUseDirectCollectorTransport(eventName: string): boolean {
  return DIRECT_COLLECTOR_EVENT_NAMES.has(eventName);
}

function shouldUseDirectCollectorFallback(): boolean {
  return typeof window !== "undefined" && !window.LoopAdEventSDK;
}

function sendLoopAdEventDirectly(
  eventName: string,
  identity: LoopAdIdentity,
  fields: LoopAdTrackFields,
): void {
  const payload = createLoopAdCollectorPayload(eventName, identity, fields);
  const body = JSON.stringify(payload);

  if (typeof fetch === "function") {
    void fetch(EVENT_INGEST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      keepalive: true,
      body,
    }).catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK direct event send failed.", error);
      }
    });

    return;
  }

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(EVENT_INGEST_ENDPOINT, blob);
  }
}

function createLoopAdCollectorPayload(
  eventName: string,
  identity: LoopAdIdentity,
  fields: LoopAdTrackFields,
): LoopAdCollectorPayload {
  return {
    project_id: loopAdSdkConfig.projectId,
    write_key: loopAdSdkConfig.writeKey,
    schema_version: EVENT_SCHEMA_VERSION,
    event_id: textField(fields.eventId) ?? createSdkId("evt"),
    event_name: eventName,
    event_time: eventTime(fields.eventTime),
    source: "browser_sdk",
    user_id: identity.userId,
    session_id: identity.sessionId,
    properties_json: serializeProperties(createDirectCollectorProperties(fields)),
  };
}

function createDirectCollectorProperties(
  fields: LoopAdTrackFields,
): LoopAdEventProperties {
  const fieldProperties = fields.properties ?? {};
  const page = objectProperty(fieldProperties.page) ?? getCurrentPageProperties();
  const pagePath = textField(fieldProperties.page_path) ?? textField(page.path) ?? "";

  return {
    ...propertiesFromTrackFields(fields),
    ...fieldProperties,
    page_path: pagePath,
    page,
    sdk: {
      name: "loop-ad_event_sdk",
      version: window.LoopAdEventSDK?.version ?? "direct-transport",
    },
  };
}

function objectProperty(value: unknown): LoopAdEventProperties | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as LoopAdEventProperties;
}

function propertiesFromTrackFields(fields: LoopAdTrackFields): LoopAdEventProperties {
  const properties: LoopAdEventProperties = {};

  setProperty(properties, "campaign_id", textField(fields.campaignId));
  setProperty(properties, "promotion_id", textField(fields.promotionId));
  setProperty(properties, "promotion_run_id", textField(fields.promotionRunId));
  setProperty(properties, "ad_experiment_id", textField(fields.adExperimentId));
  setProperty(properties, "promotion_channel", textField(fields.promotionChannel));
  setProperty(properties, "segment_id", textField(fields.segmentId));
  setProperty(properties, "content_id", textField(fields.contentId));
  setProperty(properties, "content_option_id", textField(fields.contentOptionId));
  setProperty(properties, "placement_id", textField(fields.placementId));
  setProperty(properties, "redirect_id", textField(fields.redirectId));
  setProperty(properties, "landing_type", textField(fields.landingType));
  setProperty(properties, "landing_url", textField(fields.landingUrl));
  setProperty(properties, "target_url", textField(fields.targetUrl));
  setProperty(properties, "hotel_id", textField(fields.hotelId));
  setProperty(properties, "hotel_cluster", textField(fields.hotelCluster));
  setProperty(properties, "hotel_market", textField(fields.hotelMarket));
  setProperty(properties, "hotel_city", textField(fields.hotelCity));
  setProperty(properties, "hotel_country", textField(fields.hotelCountry));
  setProperty(properties, "checkin_date", textField(fields.checkinDate));
  setProperty(properties, "checkout_date", textField(fields.checkoutDate));
  setProperty(properties, "adult_count", integerText(fields.adultCount));
  setProperty(properties, "child_count", integerText(fields.childCount));
  setProperty(properties, "price", decimalText(fields.price));
  setProperty(properties, "breakfast_included", flagText(fields.breakfastIncluded));
  setProperty(properties, "free_cancellation", flagText(fields.freeCancellation));
  setProperty(properties, "room_type", textField(fields.roomType));
  setProperty(properties, "booking_id", textField(fields.bookingId));
  setProperty(properties, "revenue", decimalText(fields.revenue));
  setProperty(properties, "currency", textField(fields.currency));
  setProperty(properties, "device", textField(fields.device));

  return properties;
}

function setProperty(
  properties: LoopAdEventProperties,
  key: string,
  value: LoopAdPropertyValue | undefined,
): void {
  if (value !== null && value !== undefined && value !== "") {
    properties[key] = value;
  }
}

function eventTime(value: LoopAdTrackFields["eventTime"]): string {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  return textField(value) ?? new Date().toISOString();
}

function integerText(value: unknown): string | undefined {
  const normalized = numberOrNull(value);

  if (normalized === null) {
    return undefined;
  }

  return String(Math.max(0, Math.trunc(normalized)));
}

function decimalText(value: unknown): string | undefined {
  const normalized = numberOrNull(value);

  if (normalized === null) {
    return undefined;
  }

  return String(Math.round(normalized * 100) / 100);
}

function flagText(value: unknown): string | undefined {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  const normalized = numberOrNull(value);

  if (normalized !== null) {
    return normalized === 0 ? "0" : "1";
  }

  const stringValue = textField(value)?.toLowerCase();

  if (!stringValue) {
    return undefined;
  }

  if (["true", "yes", "y"].includes(stringValue)) {
    return "1";
  }

  if (["false", "no", "n"].includes(stringValue)) {
    return "0";
  }

  return undefined;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function serializeProperties(properties: LoopAdEventProperties): string {
  try {
    return JSON.stringify(properties);
  } catch {
    return "{}";
  }
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
    promotionChannel: PROMOTION_CHANNEL,
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

function createSdkId(prefix: string): string {
  const value =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${value}`;
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

function textField(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized || undefined;
}

function textEnv(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
