import { Link } from "react-router-dom";

import { AdSlot } from "@/components/ads/AdSlot";
import { useMinWidth } from "@/components/ads/useMinWidth";
import { ProductCard } from "@/components/commerce/ProductCard";
import { categories } from "@/fixtures/categories";
import { getFeaturedProducts, getProductsByPromotion } from "@/fixtures/product-helpers";

const featuredProducts = getFeaturedProducts(8);
const summerSaleProducts = getProductsByPromotion("summer-sale").slice(0, 4);
const WING_AD_MIN_WIDTH = 1200;

export function HomePage() {
  const showWingAd = useMinWidth(WING_AD_MIN_WIDTH);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-muted-foreground">Loop Shop</p>
            <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              오늘의 쇼핑을 한눈에
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              신선식품부터 홈데코까지, 데모 쇼핑몰의 추천 상품과 기획전을 둘러보세요.
            </p>
          </div>
          <AdSlot slotId="C1_MAIN_TOP" />
        </div>

        {showWingAd ? (
          <aside aria-label="데스크톱 추천 광고">
            <AdSlot slotId="W1_WING" />
          </aside>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Categories</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
              인기 카테고리
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            전체 상품 보기
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Daily Picks</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
            오늘의 추천 상품
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-muted-foreground">Promotion</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
              상쾌한 데일리 특가
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              가벼운 식탁과 외출 준비를 위한 상품을 모은 기획전입니다.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/promotion/summer-sale"
          >
            기획전 이동
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {summerSaleProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
