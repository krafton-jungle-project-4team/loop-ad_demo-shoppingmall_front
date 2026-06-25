import type { z } from "zod";

export interface BrowserStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StorageRecoveryReason =
  | "missing"
  | "invalid-json"
  | "schema-version-mismatch"
  | "schema-validation-failed";

export interface StorageRecovery {
  key: string;
  reason: StorageRecoveryReason;
  rawValue: string | null;
  issues: string[];
}

export type VersionedStorageParseResult<TPayload> =
  | {
      ok: true;
      recovered: false;
      value: TPayload;
    }
  | {
      ok: false;
      recovered: true;
      recovery: StorageRecovery;
      value: TPayload;
    };

export interface VersionedStorageOptions<TPayload extends { schemaVersion: number }> {
  key: string;
  schema: z.ZodType<TPayload>;
  schemaVersion: TPayload["schemaVersion"];
  fallback: TPayload;
  onRecover?: (recovery: StorageRecovery) => void;
}

function isVersionedPayload(value: unknown): value is { schemaVersion: unknown } {
  return typeof value === "object" && value !== null && "schemaVersion" in value;
}

function recover<TPayload extends { schemaVersion: number }>(
  options: VersionedStorageOptions<TPayload>,
  reason: StorageRecoveryReason,
  rawValue: string | null,
  issues: string[],
): VersionedStorageParseResult<TPayload> {
  const recovery: StorageRecovery = {
    key: options.key,
    reason,
    rawValue,
    issues,
  };

  options.onRecover?.(recovery);

  return {
    ok: false,
    recovered: true,
    recovery,
    value: options.fallback,
  };
}

export function parseVersionedStorage<TPayload extends { schemaVersion: number }>(
  rawValue: string | null,
  options: VersionedStorageOptions<TPayload>,
): VersionedStorageParseResult<TPayload> {
  if (rawValue === null) {
    return recover(options, "missing", rawValue, []);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawValue);
  } catch (error) {
    return recover(options, "invalid-json", rawValue, [
      error instanceof Error ? error.message : "Unknown JSON parse error",
    ]);
  }

  if (!isVersionedPayload(parsed) || parsed.schemaVersion !== options.schemaVersion) {
    return recover(options, "schema-version-mismatch", rawValue, [
      `Expected schemaVersion ${options.schemaVersion}.`,
    ]);
  }

  const result = options.schema.safeParse(parsed);

  if (!result.success) {
    return recover(
      options,
      "schema-validation-failed",
      rawValue,
      result.error.issues.map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`),
    );
  }

  return {
    ok: true,
    recovered: false,
    value: result.data,
  };
}

export function readVersionedStorage<TPayload extends { schemaVersion: number }>(
  storage: BrowserStorageLike,
  options: VersionedStorageOptions<TPayload>,
): VersionedStorageParseResult<TPayload> {
  return parseVersionedStorage(storage.getItem(options.key), options);
}

export function writeVersionedStorage<TPayload extends { schemaVersion: number }>(
  storage: BrowserStorageLike,
  key: string,
  value: TPayload,
): void {
  storage.setItem(key, JSON.stringify(value));
}
