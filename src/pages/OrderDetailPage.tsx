import { ClipboardList, Headphones, MapPin, ReceiptText } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useOrderStore } from "@/state/order-context";
import type { OrderStatus } from "@/types/commerce";
import { formatMoney } from "@/utils/money";
import { buildCommerceLineItems, calculateOrderAmounts } from "@/utils/order-summary";

const orderDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusSteps: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: "paid",
    label: "주문 접수",
    description: "목업 주문이 생성되었습니다.",
  },
  {
    status: "preparing",
    label: "상품 준비",
    description: "상품을 준비하는 단계입니다.",
  },
  {
    status: "shipping",
    label: "배송 중",
    description: "배송 이동을 표시합니다.",
  },
  {
    status: "delivered",
    label: "배송 완료",
    description: "수령 완료 상태입니다.",
  },
];

function formatOrderDate(createdAt: string): string {
  return orderDateFormatter.format(new Date(createdAt));
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const { getOrderById } = useOrderStore();
  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <section className="rounded-md border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-md bg-muted text-muted-foreground">
          <ClipboardList aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-5 text-sm font-semibold text-muted-foreground">Order</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          주문을 찾을 수 없습니다
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          주문번호가 바뀌었거나 로컬 주문 내역에 없는 주문입니다.
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
  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-muted-foreground">Order</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-foreground">
              주문 상세
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              주문번호 <span className="font-bold text-foreground">{order.id}</span> ·{" "}
              {formatOrderDate(order.createdAt)}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            to="/products"
          >
            계속 쇼핑하기
          </Link>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-muted-foreground">Status</p>
        <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
          주문 상태
        </h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-4">
          {statusSteps.map((step, index) => {
            const isReached = index <= currentStatusIndex;
            const isCurrent = step.status === order.status;

            return (
              <li
                key={step.status}
                aria-current={isCurrent ? "step" : undefined}
                className="rounded-md border border-border bg-background p-4"
              >
                <div
                  className={cn(
                    "grid size-8 place-items-center rounded-md",
                    isReached
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <p className="mt-3 font-bold text-foreground">{step.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-muted-foreground">Items</p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
            주문 상품
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {lineItems.map(({ item, product, optionLabel, unitPrice, lineTotal }) => (
              <article
                key={`${item.productId}:${item.option ?? "default"}`}
                className="grid gap-3 rounded-md border border-border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_8rem]"
              >
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

        <aside className="flex flex-col gap-4">
          <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <MapPin aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Delivery</p>
                <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                  배송 정보
                </h2>
              </div>
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="font-semibold text-muted-foreground">배송지</dt>
                <dd className="mt-1 text-foreground">
                  서울시 데모구 루프대로 100, 4층
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">배송 예정</dt>
                <dd className="mt-1 text-foreground">목업 기준 내일 도착 예정</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <ReceiptText aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Payment</p>
                <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                  결제 정보
                </h2>
              </div>
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">상품 금액</dt>
                <dd className="font-semibold text-foreground">
                  {formatMoney(subtotal)}
                </dd>
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
          </section>

          <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <Headphones aria-hidden="true" className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Help</p>
                <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">
                  고객센터
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              이 화면은 데모용 주문 상세입니다. 문의 접수와 환불 처리는 제공하지
              않습니다.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
