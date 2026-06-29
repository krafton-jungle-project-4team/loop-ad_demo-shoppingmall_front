import { Link } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function OrderCompletePage() {
  return (
    <PagePlaceholder
      eyebrow="Order Complete"
      title="구매 완료"
      description="주문번호와 배송 예정 안내가 이곳에 표시됩니다."
      actions={
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/orders/demo-order"
        >
          주문 상세 보기
        </Link>
      }
    />
  );
}
