import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ProductCard } from "@/components/commerce/ProductCard";
import {
  getCategoryById,
  getProductById,
  getProductsByCategory,
} from "@/fixtures/product-helpers";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/state/cart-context";
import { formatMoney, getDiscountRate, getProductUnitPrice } from "@/utils/money";

type ProductPurchaseState = {
  productId?: string;
  selectedOptionId?: string;
  quantity: number;
  feedbackMessage: string | null;
};

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const product = productId ? getProductById(productId) : undefined;
  const category = product ? getCategoryById(product.categoryId) : undefined;
  const [purchaseState, setPurchaseState] = useState<ProductPurchaseState>({
    productId,
    quantity: 1,
    feedbackMessage: null,
  });
  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return getProductsByCategory(product.categoryId)
      .filter((relatedProduct) => relatedProduct.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-7">
        <p className="text-sm font-semibold text-muted-foreground">Product</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          상품을 찾을 수 없습니다
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          주소가 바뀌었거나 아직 준비되지 않은 상품입니다.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/products"
        >
          상품 목록으로 이동
        </Link>
      </section>
    );
  }

  const currentProduct = product;
  const purchaseStateMatchesProduct = purchaseState.productId === currentProduct.id;
  const selectedOptionState =
    purchaseStateMatchesProduct &&
    product.options?.some((option) => option.id === purchaseState.selectedOptionId)
      ? purchaseState.selectedOptionId
      : undefined;
  const selectedOptionId = selectedOptionState ?? product.options?.[0]?.id;
  const quantity = purchaseStateMatchesProduct ? purchaseState.quantity : 1;
  const feedbackMessage = purchaseStateMatchesProduct
    ? purchaseState.feedbackMessage
    : null;
  const discountRate = getDiscountRate(product.originalPrice, product.price);
  const selectedOption = product.options?.find(
    (option) => option.id === selectedOptionId,
  );
  const unitPrice = getProductUnitPrice(product, selectedOptionId);
  const totalPrice = unitPrice * quantity;

  function handleQuantityChange(nextQuantity: number) {
    setPurchaseState({
      productId: currentProduct.id,
      selectedOptionId,
      quantity: Math.min(99, Math.max(1, nextQuantity)),
      feedbackMessage: null,
    });
  }

  function addSelectedProductToCart() {
    addItem({
      productId: currentProduct.id,
      option: selectedOptionId,
      quantity,
    });
  }

  function handleAddToCart() {
    addSelectedProductToCart();
    setPurchaseState({
      productId: currentProduct.id,
      selectedOptionId,
      quantity,
      feedbackMessage: "선택한 상품을 장바구니에 담았습니다.",
    });
  }

  function handleBuyNow() {
    addSelectedProductToCart();
    navigate("/checkout");
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div
          className="grid min-h-[22rem] place-items-center rounded-md border border-border bg-muted p-6"
          aria-hidden="true"
        >
          <div className="flex size-full min-h-72 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-muted-foreground">
            {category?.name ?? "상품 이미지"}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {category?.name ?? "Product"}
              </p>
              <h1 className="text-3xl font-bold tracking-normal text-foreground">
                {product.name}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {discountRate > 0 ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    {discountRate}% 할인
                  </span>
                ) : null}
                {product.badges?.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-3xl font-bold tracking-normal text-foreground">
                  {formatMoney(unitPrice)}
                </span>
                {product.originalPrice ? (
                  <span className="pb-1 text-sm text-muted-foreground line-through">
                    {formatMoney(product.originalPrice)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                평점 {product.rating?.toFixed(1) ?? "-"} · 리뷰{" "}
                {product.reviewCount ?? 0}개
              </p>
            </div>

            {product.options?.length ? (
              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-semibold text-foreground">옵션</legend>
                <div className="grid gap-2">
                  {product.options.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm transition-colors",
                        selectedOptionId === option.id
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/35",
                      )}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span>
                        {option.priceDelta
                          ? `+${formatMoney(option.priceDelta)}`
                          : "추가금 없음"}
                      </span>
                      <input
                        type="radio"
                        name="product-option"
                        value={option.id}
                        checked={selectedOptionId === option.id}
                        onChange={() =>
                          setPurchaseState({
                            productId: currentProduct.id,
                            selectedOptionId: option.id,
                            quantity,
                            feedbackMessage: null,
                          })
                        }
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                별도 옵션 없이 바로 담을 수 있는 상품입니다.
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-foreground" htmlFor="quantity">
                수량
              </label>
              <div className="flex h-11 w-fit items-center rounded-md border border-border bg-background">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="inline-flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="수량 줄이기"
                >
                  <Minus aria-hidden="true" className="size-4" />
                </button>
                <span
                  id="quantity"
                  className="inline-flex min-w-10 justify-center text-sm font-bold text-foreground"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="inline-flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="수량 늘리기"
                >
                  <Plus aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  선택 금액
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatMoney(totalPrice)}
                </span>
              </div>
              {selectedOption ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  선택 옵션: {selectedOption.label}
                </p>
              ) : null}
            </div>

            {feedbackMessage ? (
              <p className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
                {feedbackMessage}
              </p>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ShoppingCart aria-hidden="true" className="size-4" />
                장바구니 담기
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Zap aria-hidden="true" className="size-4" />
                바로 구매
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border border-border bg-card p-5 shadow-sm sm:p-6 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Delivery</p>
          <h2 className="mt-2 text-xl font-bold tracking-normal text-foreground">
            배송 안내
          </h2>
        </div>
        <div className="lg:col-span-2">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-semibold text-muted-foreground">배송비</dt>
              <dd className="font-medium text-foreground">3만원 이상 무료배송</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-semibold text-muted-foreground">도착 안내</dt>
              <dd className="font-medium text-foreground">목업 기준 내일 도착 예정</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-semibold text-muted-foreground">상세 설명</dt>
              <dd className="font-medium text-foreground">시연용 상품 상세 영역</dd>
            </div>
          </dl>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Related</p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">
                같은 카테고리 상품
              </h2>
            </div>
            <Link
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              to={`/products?category=${category?.slug ?? ""}`}
            >
              더 보기
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
