import { categories } from "@/fixtures/categories";
import { products } from "@/fixtures/products";
import { promotions } from "@/fixtures/promotions";
import type { Category, Product, Promotion } from "@/types/commerce";
import { getDiscountRate } from "@/utils/money";

export type ProductSortKey = "popular" | "price-low" | "price-high" | "discount";

export type ProductListFilters = {
  keyword?: string | null;
  category?: string | null;
  sort?: ProductSortKey;
};

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getProductById(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function getPromotionById(promotionId: string): Promotion | undefined {
  return promotions.find((promotion) => promotion.id === promotionId);
}

export function getProductsByCategory(categoryIdOrSlug: string): Product[] {
  const category =
    getCategoryById(categoryIdOrSlug) ?? getCategoryBySlug(categoryIdOrSlug);

  if (!category) {
    return [];
  }

  return products.filter((product) => product.categoryId === category.id);
}

export function getProductsByPromotion(promotionId: string): Product[] {
  const promotion = getPromotionById(promotionId);

  if (!promotion) {
    return [];
  }

  const promotionProductIds = new Set(promotion.productIds);
  return products.filter((product) => promotionProductIds.has(product.id));
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products
    .filter((product) => product.promotionIds?.includes("daily-picks"))
    .slice(0, limit);
}

function productMatchesKeyword(product: Product, normalizedKeyword: string): boolean {
  const categoryName = getCategoryById(product.categoryId)?.name ?? "";
  const searchableText = [
    product.name,
    product.description,
    categoryName,
    ...(product.badges ?? []),
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchableText.includes(normalizedKeyword);
}

export function searchProducts(keyword: string): Product[] {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ko-KR");

  if (!normalizedKeyword) {
    return products;
  }

  return products.filter((product) => productMatchesKeyword(product, normalizedKeyword));
}

function getPopularityScore(product: Product): number {
  return (product.rating ?? 0) * 1000 + (product.reviewCount ?? 0);
}

export function sortProducts(
  productList: Product[],
  sort: ProductSortKey = "popular",
): Product[] {
  const sortedProducts = [...productList];

  switch (sort) {
    case "price-low":
      return sortedProducts.sort((current, next) => current.price - next.price);
    case "price-high":
      return sortedProducts.sort((current, next) => next.price - current.price);
    case "discount":
      return sortedProducts.sort(
        (current, next) =>
          getDiscountRate(next.originalPrice, next.price) -
          getDiscountRate(current.originalPrice, current.price),
      );
    case "popular":
      return sortedProducts.sort(
        (current, next) => getPopularityScore(next) - getPopularityScore(current),
      );
  }
}

export function getCatalogProducts({
  keyword,
  category,
  sort = "popular",
}: ProductListFilters = {}): Product[] {
  const normalizedKeyword = keyword?.trim().toLocaleLowerCase("ko-KR") ?? "";
  const normalizedCategory = category?.trim() ?? "";
  const categoryFilter = normalizedCategory
    ? getCategoryById(normalizedCategory) ?? getCategoryBySlug(normalizedCategory)
    : undefined;

  if (normalizedCategory && !categoryFilter) {
    return [];
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter
      ? product.categoryId === categoryFilter.id
      : true;
    const matchesKeyword = normalizedKeyword
      ? productMatchesKeyword(product, normalizedKeyword)
      : true;

    return matchesCategory && matchesKeyword;
  });

  return sortProducts(filteredProducts, sort);
}
