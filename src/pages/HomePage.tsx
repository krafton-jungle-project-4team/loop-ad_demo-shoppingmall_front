import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="grid gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Loop Shop</p>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
                오늘의 쇼핑을 한눈에
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                검색, 카테고리, 기획전, 장바구니로 이어지는 쇼핑 흐름을 준비하고 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                to="/products"
              >
                상품 보기
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                to="/promotion/summer-sale"
              >
                기획전 보기
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-md bg-muted p-4" aria-hidden="true">
            <div className="h-5 w-24 rounded-full bg-background" />
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square rounded-md bg-background" />
              <div className="aspect-square rounded-md bg-background" />
              <div className="aspect-square rounded-md bg-background" />
              <div className="aspect-square rounded-md bg-background" />
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden rounded-md border border-dashed border-border bg-muted/50 p-5 min-[1200px]:block">
        <p className="text-sm font-semibold text-foreground">Wing 영역</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          데스크톱 기획전 배너가 이곳에 표시됩니다.
        </p>
      </aside>
    </div>
  );
}
