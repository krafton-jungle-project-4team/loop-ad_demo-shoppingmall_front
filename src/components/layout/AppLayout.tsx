import { Outlet, ScrollRestoration } from "react-router-dom";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
