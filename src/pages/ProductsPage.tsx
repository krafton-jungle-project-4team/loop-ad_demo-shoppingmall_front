import { type ChangeEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ProductCard } from "@/components/commerce/ProductCard";
import { categories } from "@/fixtures/categories";
import {
  getCatalogProducts,
  getCategoryBySlug,
  type ProductSortKey,
} from "@/fixtures/product-helpers";
import { cn } from "@/lib/utils";

const sortOptions: { value: ProductSortKey; label: string }[] = [
  { value: "popular", label: "인기순" },
  { value: "price-low", label: "낮은 가격순" },
  { value: "price-high", label: "높은 가격순" },
  { value: "discount", label: "할인율순" },
];

function isProductSortKey(value: string | null): value is ProductSortKey {
  return sortOptions.some((option) => option.value === value);
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const categorySlug = searchParams.get("category") ?? "";
  const sortParam = searchParams.get("sort");
  const sort: ProductSortKey = isProductSortKey(sortParam) ? sortParam : "popular";
  const selectedCategory = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const products = getCatalogProducts({
    keyword,
    category: categorySlug,
    sort,
  });
  const title = keyword
    ? `"${keyword}" 검색 결과`
    : selectedCategory
      ? `${selectedCategory.name} 상품`
      : "상품 목록";
  const description = selectedCategory
    ? selectedCategory.description
    : "검색어와 카테고리로 원하는 상품을 빠르게 좁혀보세요.";

  function createProductsPath(nextCategorySlug: string | null): string {
    const nextParams = new URLSearchParams(searchParams);

    if (nextCategorySlug) {
      nextParams.set("category", nextCategorySlug);
    } else {
      nextParams.delete("category");
    }

    const query = nextParams.toString();
    return query ? `/products?${query}` : "/products";
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextParams = new URLSearchParams(searchParams);
    const nextSort = event.target.value;

    if (nextSort === "popular") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", nextSort);
    }

    setSearchParams(nextParams);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-muted-foreground">Products</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex min-w-52 flex-col gap-2">
            <label
              className="text-sm font-semibold text-muted-foreground"
              htmlFor="product-sort"
            >
              정렬
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={handleSortChange}
              className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-normal text-foreground">카테고리</h2>
          <span className="text-sm font-medium text-muted-foreground">
            {products.length}개 상품
          </span>
        </div>
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          <Link
            to={createProductsPath(null)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !categorySlug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground",
            )}
          >
            전체
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={createProductsPath(category.slug)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                categorySlug === category.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/35 hover:text-foreground",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="rounded-md border border-border bg-card p-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">Empty</p>
          <h2 className="mt-3 text-2xl font-bold tracking-normal text-foreground">
            조건에 맞는 상품이 없습니다
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            검색어를 줄이거나 다른 카테고리를 선택해보세요.
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            전체 상품 보기
          </Link>
        </section>
      )}
    </div>
  );
}
