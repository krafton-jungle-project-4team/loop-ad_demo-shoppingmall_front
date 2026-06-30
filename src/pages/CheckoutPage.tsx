import { CreditCard, Home, PackageCheck, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AppDialog } from "@/components/common/AppDialog";
import { ProductImage } from "@/components/commerce/ProductImage";
import { useCartStore } from "@/state/cart-context";
import { useOrderStore } from "@/state/order-context";
import { trackCheckoutStart, trackPurchase } from "@/utils/commerce-events";
import { formatMoney } from "@/utils/money";
import { buildCommerceLineItems, calculateOrderAmounts } from "@/utils/order-summary";

const deliveryRows = [
  { label: "받는 분", value: "데모 고객" },
  { label: "연락처", value: "010-0000-0000" },
  { label: "주소", value: "서울시 데모구 루프대로 100, 4층" },
  { label: "배송 요청", value: "문 앞에 놓아주세요" },
];

const paymentMethods = ["목업 카드", "간편결제 데모", "가상 계좌"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, itemCount } = useCartStore();
  const { createOrder } = useOrderStore();
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const lineItems = useMemo(() => buildCommerceLineItems(items), [items]);
  const orderItems = useMemo(() => lineItems.map(({ item }) => item), [lineItems]);
  const { subtotal, shippingFee, totalAmount } = calculateOrderAmounts(orderItems);

  useEffect(() => {
    trackCheckoutStart(orderItems);
  }, [orderItems]);

  if (lineItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleCreateMockOrder() {
    const order = createOrder({
      items: orderItems,
      totalAmount,
    });

    trackPurchase(order);
    setConfirmOpen(false);
    navigate(`/order-complete?orderId=${order.id}`, {
      state: {
        clearCart: true,
      },
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-muted-foreground">Checkout</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
            목업 결제
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            배송지와 주문 상품을 확인한 뒤 시연용 주문을 생성합니다.
          </p>
        </div>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <Home aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Delivery</p>
              <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                배송지
              </h2>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {deliveryRows.map((row) => (
              <div key={row.label} className="rounded-md bg-muted px-3 py-2">
                <dt className="font-semibold text-muted-foreground">{row.label}</dt>
                <dd className="mt-1 font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <PackageCheck aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Items</p>
              <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                주문 상품 {itemCount}개
              </h2>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {lineItems.map(({ item, product, optionLabel, unitPrice, lineTotal }) => (
              <article
                key={`${item.productId}:${item.option ?? "default"}`}
                className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_8rem]"
              >
                <ProductImage
                  product={product}
                  className="aspect-square"
                  decorative
                />
                <div className="min-w-0">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    옵션: {optionLabel} · 수량 {item.quantity}개
                  </p>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {formatMoney(unitPrice)}
                  </p>
                </div>
                <p className="text-left text-lg font-bold text-foreground sm:text-right">
                  {formatMoney(lineTotal)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <CreditCard aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Payment</p>
              <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                결제수단 목업
              </h2>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {paymentMethods.map((method, index) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background p-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35"
              >
                <input
                  type="radio"
                  name="payment-method"
                  className="size-4 accent-current"
                  defaultChecked={index === 0}
                />
                {method}
              </label>
            ))}
          </div>
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
            실제 결제 SDK는 연결하지 않으며, 확인 시 로컬 주문 데이터만 생성됩니다.
          </p>
        </section>
      </section>

      <aside className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-36">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Summary</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
              최종 결제 금액
            </h2>
          </div>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">상품 금액</dt>
              <dd className="font-semibold text-foreground">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">쿠폰/할인</dt>
              <dd className="font-semibold text-foreground">{formatMoney(0)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">배송비</dt>
              <dd className="font-semibold text-foreground">
                {shippingFee > 0 ? formatMoney(shippingFee) : "무료"}
              </dd>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-semibold text-foreground">결제 예정 금액</dt>
                <dd className="text-xl font-bold text-foreground">
                  {formatMoney(totalAmount)}
                </dd>
              </div>
            </div>
          </dl>

          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setConfirmOpen(true)}
          >
            <ShieldCheck aria-hidden="true" className="size-4" />
            목업 주문 생성
          </button>

          <Link
            to="/cart"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </aside>

      <AppDialog
        open={isConfirmOpen}
        title="목업 주문을 생성할까요?"
        description="실제 결제는 진행되지 않고, 로컬 주문 내역에만 저장됩니다."
        onOpenChange={setConfirmOpen}
        actions={
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={handleCreateMockOrder}
              autoFocus
            >
              주문 완료 처리
            </button>
          </>
        }
      >
        <dl className="rounded-md bg-muted p-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">총 결제 예정 금액</dt>
            <dd className="font-bold text-foreground">{formatMoney(totalAmount)}</dd>
          </div>
        </dl>
      </AppDialog>
    </div>
  );
}
