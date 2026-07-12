import {
  getSelectedDemoUserProfile,
  type DemoUserProfile,
} from "@/lib/demo-user";
import { getLoopAdAttributionFields } from "@/utils/ad-attribution";
import {
  init as initLoopAdEventPackage,
  version as loopAdEventPackageVersion,
} from "@krafton-jungle-project-4team/loop-ad_event_sdk";

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

type LoopAdEventClient = {
  track(eventName: string, fields?: LoopAdTrackFields): void;
  setIdentity(identity: LoopAdIdentity, context?: LoopAdEventContext | null): void;
  clearIdentity(): void;
  destroy(): void;
};

type LoopAdEventSdkGlobal = {
  init(options: {
    connectionUrl: string;
    identity?: LoopAdIdentity | null;
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

const LOOP_AD_ADVERTISEMENT_SDK_URL =
  "https://krafton-jungle-project-4team.github.io/loop-ad_advertisement_sdk/loop-ad-advertisement-sdk.iife.js";
const DEMO_SESSION_STORAGE_KEY = "loop-ad-demo-session-id";
const DEFAULT_PROJECT_ID = "demo_project";
const DEFAULT_CONNECTION_URL =
  "https://dashboard.api.dev.loop-ad.org/api/public/v1/sdk/connections/demo_project";
const DEFAULT_AD_API_BASE_URL = "https://dashboard.api.dev.loop-ad.org/api";
const DEV_AD_API_BASE_URL = "/api";
const PROMOTION_CHANNEL = "onsite_banner";
const VALIDATION_PROBE_QUERY = "loopad_validate_tracking_plan";
const VALIDATION_PROBE_STORAGE_KEY = "loop-ad-tracking-plan-validation-probe.v1";

const scriptLoaders = new Map<string, Promise<void>>();
let eventClientPromise: Promise<LoopAdEventClient | null> | null = null;
let eventClientInstance: LoopAdEventClient | null = null;
let advertisementClientPromise: Promise<AdvertisementClient | null> | null = null;

export const loopAdSdkConfig = {
  advertisementSdkUrl: LOOP_AD_ADVERTISEMENT_SDK_URL,
  projectId: textEnv(import.meta.env.VITE_LOOP_AD_PROJECT_ID) ?? DEFAULT_PROJECT_ID,
  connectionUrl:
    textEnv(import.meta.env.VITE_LOOP_AD_CONNECTION_URL) ?? DEFAULT_CONNECTION_URL,
  promotionRunId: textEnv(import.meta.env.VITE_LOOP_AD_PROMOTION_RUN_ID) ?? "",
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
    eventClientPromise = Promise.resolve()
      .then(async () => {
        const sdk: LoopAdEventSdkGlobal = window.LoopAdEventSDK ?? {
          init: initLoopAdEventPackage,
          version: loopAdEventPackageVersion,
        };

        const currentIdentity = getDemoIdentity();

        if (!currentIdentity) {
          eventClientPromise = null;
          eventClientInstance = null;
          return null;
        }

        const client = await sdk.init({
          connectionUrl: loopAdSdkConfig.connectionUrl,
          debug: loopAdSdkConfig.debug,
          autoTrackPageViews: false,
          collectDomEvents: false,
          context: createLoopAdSharedContext(),
        });

        client.setIdentity(currentIdentity, createLoopAdSharedContext());
        runTrackingPlanValidationProbe(client);
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
  void clientPromise?.then((client) => client?.destroy()).catch(() => undefined);
}

function runTrackingPlanValidationProbe(client: LoopAdEventClient): void {
  if (typeof window === "undefined") {
    return;
  }

  const enabled = new URL(window.location.href).searchParams.get(VALIDATION_PROBE_QUERY) === "1";
  if (!enabled || window.sessionStorage.getItem(VALIDATION_PROBE_STORAGE_KEY) === "done") {
    return;
  }
  window.sessionStorage.setItem(VALIDATION_PROBE_STORAGE_KEY, "done");

  client.track("page_view", { properties: { validation_probe: "valid" } });
  client.track("__loopad_unregistered_validation_probe");
  client.track("hotel_detail_view", { properties: { validation_probe: "required_missing" } });
  client.track("hotel_detail_view", {
    properties: { hotel_id: 123, validation_probe: "type_error" },
  });
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
    readyClient.track(eventName, trackFields);
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

  if (!loopAdSdkConfig.promotionRunId) {
    if (loopAdSdkConfig.debug) {
      console.info("Loop Ad Advertisement SDK skipped without a promotion run id.");
    }

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

function textEnv(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
