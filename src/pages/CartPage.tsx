import { Link } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function CartPage() {
  return (
    <PagePlaceholder
      eyebrow="Cart"
      title="장바구니"
      description="담은 상품과 결제 예정 금액이 이곳에 표시됩니다."
      actions={
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/products"
        >
          상품 둘러보기
        </Link>
      }
    />
  );
}
