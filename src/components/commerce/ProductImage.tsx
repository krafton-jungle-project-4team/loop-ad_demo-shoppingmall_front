import type { ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

type ProductImageProps = {
  product: Pick<Product, "imageUrl" | "name">;
  className?: string;
  imageClassName?: string;
  decorative?: boolean;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
};

export function ProductImage({
  product,
  className,
  imageClassName,
  decorative = false,
  loading = "lazy",
}: ProductImageProps) {
  return (
    <div className={cn("overflow-hidden rounded-md bg-muted", className)}>
      <img
        src={product.imageUrl}
        alt={decorative ? "" : product.name}
        aria-hidden={decorative || undefined}
        loading={loading}
        decoding="async"
        className={cn("size-full object-cover", imageClassName)}
      />
    </div>
  );
}
