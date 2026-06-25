import { Link, NavLink, Outlet } from "react-router";

import { cn } from "@/lib/utils";

import { PRIMARY_NAV_ITEMS } from "./route-metadata";

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-3 focus:ring-ring/50"
      >
        Skip to content
      </a>

      <header className="border-b bg-background/95">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <Link
            to="/"
            className="w-fit rounded-lg text-lg font-semibold tracking-normal text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Loop Commerce Demo
          </Link>

          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink key={item.id} to={item.to} end={item.end} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center px-4 text-sm text-muted-foreground sm:px-6">
          Frontend-only static commerce demo foundation
        </div>
      </footer>
    </div>
  );
}
