/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOOP_AD_PROJECT_ID?: string;
  readonly VITE_LOOP_AD_WRITE_KEY?: string;
  readonly VITE_LOOP_AD_PROMOTION_RUN_ID?: string;
  readonly VITE_LOOP_AD_AD_API_BASE_URL?: string;
  readonly VITE_LOOP_AD_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
