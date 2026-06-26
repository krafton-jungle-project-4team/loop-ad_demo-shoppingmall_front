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

function MainTopPlaceholder() {
  return (
    <section
      aria-label="C1_MAIN_TOP"
      className="flex aspect-[720/380] min-h-48 items-center justify-center rounded-lg border border-dashed border-brand/50 bg-surface px-4 text-center md:aspect-[1920/450] md:min-h-44"
    >
      <div>
        <p className="text-sm font-semibold text-brand">C1_MAIN_TOP</p>
        <p className="mt-1 text-sm text-muted-foreground">광고 영역</p>
      </div>
    </section>
  );
}

function WingPlaceholder() {
  return (
    <aside
      aria-label="W1_WING"
      className="hidden min-[1200px]:flex min-h-44 items-center justify-center rounded-lg border border-dashed border-warm bg-warm px-4 text-center text-warm-foreground"
    >
      <div>
        <p className="text-sm font-semibold">W1_WING</p>
        <p className="mt-1 text-sm">윙 영역</p>
      </div>
    </aside>
  );
}

function HeroPlaceholders() {
  return (
    <div className="grid gap-4 min-[1200px]:grid-cols-[minmax(0,1fr)_clamp(9rem,13vw,12rem)]">
      <MainTopPlaceholder />
      <WingPlaceholder />
    </div>
  );
}

export function ShoppingShell() {
  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-8">
        <DesktopCategoryPlaceholder />
        <div className="min-w-0">
          <HeroPlaceholders />
          <div className="mt-6">
            <ContentSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
