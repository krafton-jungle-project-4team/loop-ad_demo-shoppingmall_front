import { useEffect, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { trackLoopAdPageView } from "@/lib/loop-ad-sdk";
import { trackCampaignRouteEvents } from "@/utils/campaign-events";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageViewTracker />
      <SiteHeader />
      <div className="min-h-[calc(100vh-16rem)] w-full pb-24 lg:pb-0">
        <Outlet />
      </div>
      <SiteFooter />
      <MobileNavigation />
      <ScrollRestoration />
    </div>
  );
}

function PageViewTracker() {
  const location = useLocation();
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const previousUrl = previousUrlRef.current;

    trackLoopAdPageView(previousUrl);
    trackCampaignRouteEvents(window.location.href, previousUrl);
    previousUrlRef.current = window.location.href;
  }, [location.hash, location.pathname, location.search]);

  return null;
}
