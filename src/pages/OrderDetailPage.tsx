import { useParams } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function OrderDetailPage() {
  const { orderId } = useParams();

  return (
    <PagePlaceholder
      eyebrow="Order"
      title="주문 상세"
      description={`${orderId ?? "주문"}의 주문 상태와 결제 정보가 이곳에 표시됩니다.`}
    />
  );
}
