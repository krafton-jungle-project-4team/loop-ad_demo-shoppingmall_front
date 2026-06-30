import { CheckCircle2, ClipboardList } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { useCartStore } from "@/state/cart-context";
import { useOrderStore } from "@/state/order-context";
import { formatMoney } from "@/utils/money";
import { buildCommerceLineItems, calculateOrderAmounts } from "@/utils/order-summary";

type OrderCompleteLocationState = {
  clearCart?: boolean;
};

export function OrderCompletePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const orderId = searchParams.get("orderId") ?? "";
  const hasClearedCartRef = useRef(false);
  const { clearCart } = useCartStore();
  const { getOrderById } = useOrderStore();
  const order = orderId ? getOrderById(orderId) : undefined;
  const shouldClearCart = Boolean(
    (location.state as OrderCompleteLocationState | null)?.clearCart,
  );

  useEffect(() => {
    if (!order || !shouldClearCart || hasClearedCartRef.current) {
      return;
    }

    hasClearedCartRef.current = true;
    clearCart();
  }, [clearCart, order, shouldClearCart]);

  if (!order) {
    return (
      <section className="rounded-md border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-md bg-muted text-muted-foreground">
          <ClipboardList aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-5 text-sm font-semibold text-muted-foreground">
          Order Complete
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          주문 정보를 찾을 수 없습니다
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          주문 완료 화면은 결제 흐름에서 생성된 주문번호로 확인할 수 있습니다.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/products"
        >
          상품 둘러보기
        </Link>
      </section>
    );
  }

  const lineItems = buildCommerceLineItems(order.items);
  const { subtotal, shippingFee } = calculateOrderAmounts(order.items);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-md border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid size-16 place-items-center rounded-md bg-primary text-primary-foreground">
          <CheckCircle2 aria-hidden="true" className="size-8" />
        </div>
        <p className="mt-5 text-sm font-semibold text-muted-foreground">
          Order Complete
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          구매가 완료되었습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          주문번호 <span className="font-bold text-foreground">{order.id}</span>
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to={`/orders/${order.id}`}
          >
            주문 상세 보기
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/products"
          >
            계속 쇼핑하기
          </Link>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border border-border bg-card p-5 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Items</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
            주문 상품 요약
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {lineItems.map(({ item, product, optionLabel, lineTotal }) => (
              <article
                key={`${item.productId}:${item.option ?? "default"}`}
                className="rounded-md border border-border bg-background p-4"
              >
                <p className="font-bold text-foreground">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  옵션: {optionLabel} · 수량 {item.quantity}개
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatMoney(lineTotal)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-md bg-muted p-4">
          <p className="text-sm font-semibold text-muted-foreground">Payment</p>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">상품 금액</dt>
              <dd className="font-semibold text-foreground">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">배송비</dt>
              <dd className="font-semibold text-foreground">
                {shippingFee > 0 ? formatMoney(shippingFee) : "무료"}
              </dd>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-foreground">결제 금액</dt>
                <dd className="text-lg font-bold text-foreground">
                  {formatMoney(order.totalAmount)}
                </dd>
              </div>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            목업 기준 내일 도착 예정입니다.
          </p>
        </aside>
      </section>
    </div>
  );
}
