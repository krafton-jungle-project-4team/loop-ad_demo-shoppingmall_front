import { Link } from "react-router-dom";

import { ProductImage } from "@/components/commerce/ProductImage";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";
import { formatMoney, getDiscountRate } from "@/utils/money";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const discountRate = getDiscountRate(product.originalPrice, product.price);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ProductImage
        product={product}
        className="aspect-[4/3] rounded-none"
        imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        decorative
      />
      <div className={cn("flex flex-1 flex-col gap-3 p-4", compact && "p-3")}>
        <div className="flex flex-wrap gap-1.5">
          {discountRate > 0 ? (
            <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
              {discountRate}% 할인
            </span>
          ) : null}
          {product.badges?.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold text-foreground">
            {formatMoney(product.price)}
          </span>
          {product.rating && product.reviewCount ? (
            <span className="text-xs text-muted-foreground">
              평점 {product.rating.toFixed(1)} · 리뷰 {product.reviewCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
