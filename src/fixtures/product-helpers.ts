import { categories } from "@/fixtures/categories";
import { products } from "@/fixtures/products";
import { promotions } from "@/fixtures/promotions";
import type { Category, Product, Promotion } from "@/types/commerce";

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

export function searchProducts(keyword: string): Product[] {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ko-KR");

  if (!normalizedKeyword) {
    return products;
  }

  return products.filter((product) => {
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
  });
}
