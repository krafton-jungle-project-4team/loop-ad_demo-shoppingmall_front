import { Link, useParams } from "react-router-dom";

import { ProductCard } from "@/components/commerce/ProductCard";
import { getProductsByPromotion, getPromotionById } from "@/fixtures/product-helpers";

export function PromotionPage() {
  const { promotionId } = useParams();
  const promotion = promotionId ? getPromotionById(promotionId) : undefined;
  const promotionProducts = promotion ? getProductsByPromotion(promotion.id) : [];

  if (!promotion) {
    return (
      <section className="rounded-md border border-border bg-card p-5 sm:p-7">
        <p className="text-sm font-semibold text-muted-foreground">Promotion</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          기획전을 찾을 수 없습니다
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          주소가 바뀌었거나 아직 준비되지 않은 기획전입니다.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/"
        >
          홈으로 이동
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground">Promotion</p>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
                {promotion.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {promotion.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                to="/products"
              >
                전체 상품 보기
              </Link>
              {promotionProducts[0] ? (
                <Link
                  className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  to={`/products/${promotionProducts[0].id}`}
                >
                  대표 상품 보기
                </Link>
              ) : null}
            </div>
          </div>

          <div
            className="grid min-h-52 place-items-center rounded-md bg-muted p-5"
            aria-hidden="true"
          >
            <div className="flex size-full items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-muted-foreground">
              {promotion.id}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Featured</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
              행사 상품
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/products"
          >
            상품 목록으로 이동
          </Link>
        </div>

        {promotionProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {promotionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
            이 기획전에 연결된 상품이 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}
