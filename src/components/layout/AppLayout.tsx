import { useEffect, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { trackLoopAdPageView } from "@/lib/loop-ad-sdk";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageViewTracker />
      <SiteHeader />
      <main className="mx-auto min-h-[calc(100vh-16rem)] w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
        <Outlet />
      </main>
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
    trackLoopAdPageView(previousUrlRef.current);
    previousUrlRef.current = window.location.href;
  }, [location.hash, location.pathname, location.search]);

  return null;
}
