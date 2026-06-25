import { COMMERCE_STORAGE_KEYS } from "@/stores/persisted-state";
import type { BrowserStorageLike } from "@/stores/versioned-storage";

export const RESETTABLE_STORAGE_KEYS = Object.values(COMMERCE_STORAGE_KEYS);

export function clearCommerceDemoStorage(storage: BrowserStorageLike): void {
  for (const key of RESETTABLE_STORAGE_KEYS) {
    storage.removeItem(key);
  }
}
