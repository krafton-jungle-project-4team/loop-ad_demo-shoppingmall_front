export function readJsonStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    return isValid(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full in demos; state still works in memory.
  }
}
