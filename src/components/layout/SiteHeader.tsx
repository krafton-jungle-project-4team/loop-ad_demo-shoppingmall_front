function IconButton({ label, children }: { label: string; children: string }) {
  return (
    <button
      aria-label={label}
      className="grid size-10 place-items-center rounded-md border border-border bg-card text-sm font-semibold text-foreground"
      disabled
      type="button"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <div
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-md bg-brand text-sm font-bold text-brand-foreground"
            >
              L
            </div>
            <span className="text-base font-semibold tracking-normal text-foreground">
              Loop Market
            </span>
          </div>

          <div className="min-w-0 flex-1" role="search">
            <label className="sr-only" htmlFor="site-search">
              검색
            </label>
            <div className="flex h-10 min-w-0 items-center gap-2 rounded-md border border-input bg-surface px-3 text-muted-foreground">
              <span aria-hidden="true" className="text-sm">
                /
              </span>
              <input
                aria-label="검색"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                id="site-search"
                placeholder="검색"
                readOnly
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <IconButton label="사용자 메뉴">U</IconButton>
            <IconButton label="장바구니">B</IconButton>
          </div>
        </div>

        <nav aria-label="주요 메뉴" className="flex min-w-0 items-center gap-2 overflow-x-auto">
          <span className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            메인
          </span>
          <span className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground">
            행사
          </span>
          <span className="shrink-0 rounded-md px-3 py-2 text-sm text-muted-foreground">
            브랜드
          </span>
          <span className="hidden shrink-0 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground lg:inline-flex">
            카테고리
          </span>
        </nav>
      </div>
    </header>
  );
}
