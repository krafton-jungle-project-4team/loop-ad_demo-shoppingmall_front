export type PwaInstallPromptState = "unavailable" | "available" | "accepted" | "dismissed";
export type PwaUpdateState = "idle" | "available" | "refreshing";

export interface PwaPlatformState {
  installPrompt: PwaInstallPromptState;
  updateState: PwaUpdateState;
  offlineReady: boolean;
}

export interface PwaLifecycle {
  markInstallAvailable(): void;
  markInstalled(): void;
  markUpdateAvailable(): void;
  clearUpdateAvailable(): void;
}
