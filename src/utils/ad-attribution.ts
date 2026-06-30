import type { LoopAdTrackFields } from "@/lib/loop-ad-sdk";

const LOOP_AD_ATTRIBUTION_STORAGE_KEY = "loop-ad-demo-attribution.v1";
const ATTRIBUTION_TTL_MS = 30 * 60 * 1000;

type StoredLoopAdAttribution = {
  fields: LoopAdTrackFields;
  source?: string;
  placementKey?: string;
  page?: string;
  storedAt: number;
  expiresAt: number;
};

export type LoopAdAttributionMetadata = {
  source?: string;
  placementKey?: string;
  page?: string;
  timestamp?: string;
};

export function rememberLoopAdAttribution(
  fields: LoopAdTrackFields,
  metadata: LoopAdAttributionMetadata = {},
): void {
  const attributionFields = pickAttributionFields(fields);

  if (!hasAttributionFields(attributionFields)) {
    return;
  }

  const storage = getAttributionStorage();

  if (!storage) {
    return;
  }

  const storedAt = Date.parse(metadata.timestamp ?? "");
  const normalizedStoredAt = Number.isFinite(storedAt) ? storedAt : Date.now();
  const attribution: StoredLoopAdAttribution = {
    fields: attributionFields,
    source: text(metadata.source),
    placementKey: text(metadata.placementKey),
    page: text(metadata.page),
    storedAt: normalizedStoredAt,
    expiresAt: normalizedStoredAt + ATTRIBUTION_TTL_MS,
  };

  try {
    storage.setItem(LOOP_AD_ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution is best-effort and should never block commerce tracking.
  }
}

export function getLoopAdAttributionFields(now = Date.now()): LoopAdTrackFields {
  const storage = getAttributionStorage();

  if (!storage) {
    return {};
  }

  const attribution = readStoredAttribution(storage);

  if (!attribution) {
    return {};
  }

  if (attribution.expiresAt <= now) {
    try {
      storage.removeItem(LOOP_AD_ATTRIBUTION_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }

    return {};
  }

  return {
    ...attribution.fields,
    properties: {
      attribution_source: attribution.source ?? "",
      attribution_placement_key: attribution.placementKey ?? "",
      attribution_page: attribution.page ?? "",
      attribution_stored_at: new Date(attribution.storedAt).toISOString(),
    },
  };
}

export function clearLoopAdAttribution(): void {
  const storage = getAttributionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(LOOP_AD_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function readStoredAttribution(storage: Storage): StoredLoopAdAttribution | null {
  try {
    const value = storage.getItem(LOOP_AD_ATTRIBUTION_STORAGE_KEY);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value);

    if (!isRecord(parsed) || !isRecord(parsed.fields)) {
      return null;
    }

    return {
      fields: pickAttributionFields(parsed.fields),
      source: text(parsed.source),
      placementKey: text(parsed.placementKey),
      page: text(parsed.page),
      storedAt: number(parsed.storedAt),
      expiresAt: number(parsed.expiresAt),
    };
  } catch {
    return null;
  }
}

function pickAttributionFields(
  fields: Partial<Pick<
    LoopAdTrackFields,
    "experimentId" | "variantId" | "actionId" | "mappingId" | "creativeId" | "adId"
  >>,
): LoopAdTrackFields {
  return {
    experimentId: text(fields.experimentId),
    variantId: text(fields.variantId),
    actionId: text(fields.actionId),
    mappingId: text(fields.mappingId),
    creativeId: text(fields.creativeId),
    adId: text(fields.adId),
  };
}

function hasAttributionFields(fields: LoopAdTrackFields): boolean {
  return Boolean(
    fields.experimentId ||
      fields.variantId ||
      fields.actionId ||
      fields.mappingId ||
      fields.creativeId ||
      fields.adId,
  );
}

function getAttributionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
