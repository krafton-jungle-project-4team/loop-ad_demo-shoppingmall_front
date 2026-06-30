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
  channel?: string | null;
  campaignId?: string | null;
  ageGroup?: string | null;
  gender?: string | null;
  device?: string | null;
  category?: string | null;
  productId?: string | null;
  inventoryStatus?: string | null;
  price?: number | null;
  quantity?: number | null;
  revenue?: number | null;
  couponId?: string | null;
  orderId?: string | null;
  experimentId?: string | null;
  variantId?: string | null;
  actionId?: string | null;
  mappingId?: string | null;
  adId?: string | null;
  creativeId?: string | null;
  banditPolicyId?: string | null;
  banditArmId?: string | null;
  banditDecisionId?: string | null;
  rewardValue?: number | null;
  properties?: LoopAdEventProperties | null;
};

type LoopAdIdentity = {
  userId: string;
  sessionId: string;
};

type LoopAdEventClient = {
  track(eventName: string, fields?: LoopAdTrackFields): void;
  setIdentity(identity: LoopAdIdentity, context?: LoopAdTrackFields | null): void;
  clearIdentity(): void;
  destroy(): void;
};

type LoopAdEventSdkGlobal = {
  init(options: {
    projectId: string;
    identity?: LoopAdIdentity | null;
    debug?: boolean | null;
    autoTrackPageViews?: boolean | null;
    collectDomEvents?: boolean | null;
    context?: LoopAdTrackFields | null;
  }): LoopAdEventClient;
  version: string;
};

export type AdvertisementFilledDecision = {
  placementKey: string;
  status: "filled";
  ad: {
    creativeId: string;
    contentType: string;
    title: string;
    body: string;
    ctaLabel: string;
    imageUrl: string;
    landingUrl: string;
  };
  tracking: {
    projectId: string;
    experimentId: string;
    variantId: string;
    creativeId: string;
    mappingId: string;
    actionId: string;
  };
};

type AdvertisementDecision =
  | AdvertisementFilledDecision
  | {
      placementKey: string;
      status: "empty";
      ad: null;
      tracking: null;
    };

type AdvertisementClient = {
  render(options: {
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
const DEMO_IDENTITY_STORAGE_KEY = "loop-ad-demo-identity";
const DEFAULT_PROJECT_ID = "demo-shoppingmall";
const DEFAULT_AD_API_BASE_URL = "https://dashboard.api.dev.loop-ad.org/api";
const DEV_AD_API_BASE_URL = "/api";
const DEFAULT_CHANNEL = "demo-shoppingmall";

const scriptLoaders = new Map<string, Promise<void>>();
let eventClientPromise: Promise<LoopAdEventClient> | null = null;
let advertisementClientPromise: Promise<AdvertisementClient> | null = null;

export const loopAdSdkConfig = {
  eventSdkUrl: LOOP_AD_EVENT_SDK_URL,
  advertisementSdkUrl: LOOP_AD_ADVERTISEMENT_SDK_URL,
  projectId: textEnv(import.meta.env.VITE_LOOP_AD_PROJECT_ID) ?? DEFAULT_PROJECT_ID,
  advertisementApiBaseUrl:
    textEnv(import.meta.env.VITE_LOOP_AD_AD_API_BASE_URL) ??
    (import.meta.env.DEV ? DEV_AD_API_BASE_URL : DEFAULT_AD_API_BASE_URL),
  debug:
    textEnv(import.meta.env.VITE_LOOP_AD_DEBUG) === "true" ||
    import.meta.env.DEV,
};

export function initLoopAdEventSdk(): Promise<LoopAdEventClient> {
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

        const identity = getDemoIdentity();
        const client = sdk.init({
          projectId: loopAdSdkConfig.projectId,
          debug: loopAdSdkConfig.debug,
          context: createLoopAdSharedContext(),
        });

        client.setIdentity(identity, createLoopAdSharedContext());

        return client;
      })
      .catch((error: unknown) => {
        eventClientPromise = null;
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
  return initLoopAdAdvertisementSdk().then((client) =>
    client.render({
      placementKey: options.placementKey,
      targetId: options.targetId,
      context: {
        channel: DEFAULT_CHANNEL,
        page: options.page,
        device: detectDevice(),
        ...createLoopAdAdContext(),
      },
      onImpression: options.onImpression ?? null,
      onClick: options.onClick ?? null,
    }),
  );
}

export function trackLoopAdEvent(eventName: string, fields?: LoopAdTrackFields): void {
  void initLoopAdEventSdk()
    .then((client) => client.track(eventName, withDemoUserTrackFields(fields)))
    .catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK tracking skipped.", error);
      }
    });
}

export function setLoopAdDemoUserIdentity(): void {
  void initLoopAdEventSdk()
    .then((client) => {
      client.setIdentity(getDemoIdentity(), createLoopAdSharedContext());
      resetLoopAdAdvertisementSdk();
    })
    .catch((error: unknown) => {
      if (loopAdSdkConfig.debug) {
        console.warn("Loop Ad Event SDK identity update skipped.", error);
      }
    });
}

function initLoopAdAdvertisementSdk(): Promise<AdvertisementClient> {
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

        return sdk.init({
          apiBaseUrl: loopAdSdkConfig.advertisementApiBaseUrl,
          projectId: loopAdSdkConfig.projectId,
          userId: getDemoIdentity().userId,
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
    ?.then((client) => client.destroy())
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

function getDemoIdentity(): LoopAdIdentity {
  const profile = getSelectedDemoUserProfile();

  if (typeof window === "undefined") {
    return {
      userId: profile?.userId ?? "demo-user-browser-only",
      sessionId: "demo-session-browser-only",
    };
  }

  const fallbackIdentity = getStoredDemoIdentity();

  if (profile) {
    return {
      userId: profile.userId,
      sessionId: fallbackIdentity.sessionId,
    };
  }

  return fallbackIdentity;
}

function getStoredDemoIdentity(): LoopAdIdentity {
  try {
    const stored = window.localStorage.getItem(DEMO_IDENTITY_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown) : null;

    if (isIdentity(parsed)) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(DEMO_IDENTITY_STORAGE_KEY);
  }

  const identity = {
    userId: createId("demo-user"),
    sessionId: createId("demo-session"),
  };

  window.localStorage.setItem(DEMO_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

function createLoopAdSharedContext(): LoopAdTrackFields {
  const profile = getSelectedDemoUserProfile();

  return {
    channel: DEFAULT_CHANNEL,
    device: detectDevice(),
    ageGroup: profile?.ageGroup,
    gender: profile?.gender,
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
    ageGroup: fields.ageGroup ?? profile.ageGroup,
    gender: fields.gender ?? profile.gender,
    properties: {
      ...createDemoUserProperties(profile),
      ...(fields.properties ?? {}),
    },
  };
}

function createDemoUserProperties(profile: DemoUserProfile): LoopAdEventProperties {
  return {
    region: profile.region,
    user_type: profile.type,
    user_segment: profile.segment,
    preferred_category: profile.preferredCategory,
  };
}

function isIdentity(value: unknown): value is LoopAdIdentity {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LoopAdIdentity).userId === "string" &&
    typeof (value as LoopAdIdentity).sessionId === "string"
  );
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
