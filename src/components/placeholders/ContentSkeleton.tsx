function SkeletonBlock({ className }: { className: string }) {
  return <div aria-hidden="true" className={className} />;
}

function SkeletonCard() {
  return (
    <article
      aria-hidden="true"
      className="rounded-lg border border-border bg-card p-3"
    >
      <SkeletonBlock className="aspect-[4/3] rounded-md bg-muted" />
      <div className="mt-3 flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-4/5 rounded bg-muted" />
        <SkeletonBlock className="h-3 w-3/5 rounded bg-muted" />
        <SkeletonBlock className="h-8 w-full rounded-md bg-surface" />
      </div>
    </article>
  );
}

export function ContentSkeleton() {
  return (
    <section aria-label="콘텐츠" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">추천 영역</h2>
          <p className="text-sm text-muted-foreground">콘텐츠 준비 중</p>
        </div>
        <div aria-hidden="true" className="h-8 w-20 rounded-md bg-surface" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  );
}
