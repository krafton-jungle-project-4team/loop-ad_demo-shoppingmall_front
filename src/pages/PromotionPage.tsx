import { Link, useParams } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function PromotionPage() {
  const { promotionId } = useParams();

  return (
    <PagePlaceholder
      eyebrow="Promotion"
      title="기획전"
      description={`${promotionId ?? "기획전"} 행사 상품과 소개 영역이 이곳에 표시됩니다.`}
      actions={
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/products"
        >
          상품 목록으로
        </Link>
      }
    />
  );
}
