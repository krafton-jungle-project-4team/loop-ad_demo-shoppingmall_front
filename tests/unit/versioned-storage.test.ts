import type { z } from "zod";

import { COMMERCE_STORAGE_KEYS, DEFAULT_CART_STATE, cartStateV1Schema } from "@/stores";
import { parseVersionedStorage } from "@/stores/versioned-storage";

const storageOptions = {
  key: COMMERCE_STORAGE_KEYS.cart,
  schema: cartStateV1Schema,
  schemaVersion: 1,
  fallback: DEFAULT_CART_STATE,
} satisfies Parameters<typeof parseVersionedStorage<z.infer<typeof cartStateV1Schema>>>[1];

describe("parseVersionedStorage", () => {
  it("parses valid versioned state", () => {
    const result = parseVersionedStorage(JSON.stringify(DEFAULT_CART_STATE), storageOptions);

    expect(result.ok).toBe(true);
    expect(result.value.items).toEqual([]);
  });

  it("recovers from invalid JSON", () => {
    const result = parseVersionedStorage("{broken", storageOptions);

    expect(result.ok).toBe(false);
    expect(result.value).toEqual(DEFAULT_CART_STATE);
    expect(result.recovered && result.recovery.reason).toBe("invalid-json");
  });

  it("recovers from unknown schema versions", () => {
    const result = parseVersionedStorage(JSON.stringify({ schemaVersion: 99 }), storageOptions);

    expect(result.ok).toBe(false);
    expect(result.recovered && result.recovery.reason).toBe("schema-version-mismatch");
  });
});
