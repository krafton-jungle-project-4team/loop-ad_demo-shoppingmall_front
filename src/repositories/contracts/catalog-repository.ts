import type { Category, Product } from "@/domain/contracts/catalog";
import type { CategoryId, ProductId } from "@/domain/contracts/ids";

export type ProductSortKey = "recommended" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductQuery {
  query?: string;
  categoryId?: CategoryId;
  sort?: ProductSortKey;
  filters?: Record<string, string[]>;
  page: number;
  pageSize: number;
}

export interface ProductSearchResult {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CatalogRepository {
  listCategories(): Promise<Category[]>;
  searchProducts(query: ProductQuery): Promise<ProductSearchResult>;
  getProduct(productId: ProductId): Promise<Product | null>;
}
