import { MainTopAd } from "@/components/ads/MainTopAd";
import { WingAd } from "@/components/ads/WingAd";
import { ContentSkeleton } from "@/components/placeholders/ContentSkeleton";

function DesktopCategoryPlaceholder() {
  return (
    <aside
      aria-label="카테고리"
      className="hidden rounded-lg border border-border bg-card p-4 lg:block"
    >
      <h2 className="text-sm font-semibold text-foreground">카테고리</h2>
      <div aria-hidden="true" className="mt-4 flex flex-col gap-3">
        <div className="h-3 w-11/12 rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
        <div className="h-3 w-10/12 rounded bg-muted" />
        <div className="h-3 w-7/12 rounded bg-muted" />
      </div>
    </aside>
  );
}

function HeroAds() {
  return (
    <div className="grid gap-4 min-[1200px]:grid-cols-[minmax(0,1fr)_clamp(9rem,13vw,12rem)]">
      <MainTopAd />
      <WingAd />
    </div>
  );
}

export function ShoppingShell() {
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
        <DesktopCategoryPlaceholder />
        <div className="min-w-0">
          <HeroAds />
          <div className="mt-6">
            <ContentSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
