import { Link, useSearchParams } from "react-router-dom";

import { PagePlaceholder } from "@/pages/PagePlaceholder";

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const category = searchParams.get("category");
  const title = keyword ? `"${keyword}" 검색 결과` : "상품 목록";
  const description = category
    ? `${category} 카테고리 상품이 이곳에 표시됩니다.`
    : "검색과 카테고리 탐색 결과가 이곳에 표시됩니다.";

  return (
    <PagePlaceholder
      eyebrow="Products"
      title={title}
      description={description}
      actions={
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/products/sample-product"
        >
          상세 예시
        </Link>
      }
    />
  );
}
