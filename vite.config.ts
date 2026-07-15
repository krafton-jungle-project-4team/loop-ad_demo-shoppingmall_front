import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { loopAdDiagnostics } from "./vite-plugins/loop-ad-diagnostics";

export default defineConfig({
  plugins: [
    loopAdDiagnostics({
      externalEvents: ["리다이렉트_클릭"],
      trackFunctions: [
        "trackLoopAdEvent",
        "trackBookingEvent",
        "trackCampaignEventOnce",
        "reportDecisionEvent",
      ],
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://dashboard.api.dev.loop-ad.org",
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: "https://demo-shoppingmall.dev.loop-ad.org",
        },
      },
    },
  },
});
