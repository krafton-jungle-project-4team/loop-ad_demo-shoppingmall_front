import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { getCategoryById, getProductById } from "@/fixtures/product-helpers";
import { useCartStore } from "@/state/cart-context";
import type { CartItem, Product } from "@/types/commerce";
import { formatMoney, getProductUnitPrice } from "@/utils/money";

const FREE_SHIPPING_THRESHOLD = 30000;
const SHIPPING_FEE = 3000;

type CartRow = {
  item: CartItem;
  product: Product;
  categoryName: string;
  optionLabel: string;
  unitPrice: number;
  lineTotal: number;
};

function getOptionLabel(product: Product, optionId?: string): string {
  if (!optionId) {
    return "기본";
  }

  return product.options?.find((option) => option.id === optionId)?.label ?? optionId;
}

function buildCartRows(items: CartItem[]): CartRow[] {
  return items.flatMap((item) => {
    const product = getProductById(item.productId);

    if (!product) {
      return [];
    }

    const unitPrice = getProductUnitPrice(product, item.option);

    return [
      {
        item,
        product,
        categoryName: getCategoryById(product.categoryId)?.name ?? "상품",
        optionLabel: getOptionLabel(product, item.option),
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      },
    ];
  });
}

export function CartPage() {
  const { items, itemCount, updateQuantity, removeItem, clearCart } = useCartStore();
  const cartRows = buildCartRows(items);
  const subtotal = cartRows.reduce((total, row) => total + row.lineTotal, 0);
  const shippingFee =
    subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const totalAmount = subtotal + shippingFee;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (cartRows.length === 0) {
    return (
      <section className="rounded-md border border-border bg-card p-7 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-md bg-muted text-muted-foreground">
          <ShoppingBag aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-5 text-sm font-semibold text-muted-foreground">Cart</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          장바구니가 비어 있습니다
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          마음에 드는 상품을 담으면 이곳에서 수량과 결제 예정 금액을 확인할 수
          있습니다.
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-muted-foreground">Cart</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-foreground">
                장바구니
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                총 {itemCount}개 상품의 수량과 금액을 확인하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              전체 비우기
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {cartRows.map(
            ({ item, product, categoryName, optionLabel, unitPrice, lineTotal }) => (
              <article
                key={`${item.productId}:${item.option ?? "default"}`}
                className="grid gap-4 rounded-md border border-border bg-card p-4 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)]"
              >
                <div
                  className="grid aspect-square place-items-center rounded-md bg-muted p-3"
                  aria-hidden="true"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {categoryName}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-base font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        옵션: {optionLabel}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {formatMoney(unitPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.option)}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`${product.name} 삭제`}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex h-11 w-fit items-center rounded-md border border-border bg-background">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1, item.option)
                        }
                        className="inline-flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`${product.name} 수량 줄이기`}
                      >
                        <Minus aria-hidden="true" className="size-4" />
                      </button>
                      <span className="inline-flex min-w-10 justify-center text-sm font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1, item.option)
                        }
                        className="inline-flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`${product.name} 수량 늘리기`}
                      >
                        <Plus aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-muted-foreground">
                        상품 합계
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {formatMoney(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <aside className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6 lg:sticky lg:top-36">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Summary</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
              주문 금액
            </h2>
          </div>

          <dl className="flex flex-col gap-3 text-sm">
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
                <dt className="font-semibold text-foreground">결제 예정 금액</dt>
                <dd className="text-xl font-bold text-foreground">
                  {formatMoney(totalAmount)}
                </dd>
              </div>
            </div>
          </dl>

          {amountUntilFreeShipping > 0 ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
              {formatMoney(amountUntilFreeShipping)} 더 담으면 무료배송입니다.
            </p>
          ) : (
            <p className="rounded-md bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
              무료배송 조건을 달성했습니다.
            </p>
          )}

          <Link
            to="/checkout"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            결제하기
          </Link>
        </div>
      </aside>
    </div>
  );
}
