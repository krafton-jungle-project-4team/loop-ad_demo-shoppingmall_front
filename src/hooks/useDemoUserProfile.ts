import { useSyncExternalStore } from "react";

import {
  DEMO_USER_PROFILE_CHANGE_EVENT,
  getSelectedDemoUserProfile,
} from "@/lib/demo-user";

export function useDemoUserProfile() {
  return useSyncExternalStore(subscribe, getSelectedDemoUserProfile, () => null);
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(DEMO_USER_PROFILE_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(DEMO_USER_PROFILE_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
