import { Link, useParams } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function ProductDetailPage() {
  const { productId } = useParams();

  return (
    <PagePlaceholder
      eyebrow="Product"
      title="상품 상세"
      description={`${productId ?? "상품"}의 가격, 옵션, 배송 안내가 이곳에 표시됩니다.`}
      actions={
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/cart"
        >
          장바구니로 이동
        </Link>
      }
    />
  );
}
