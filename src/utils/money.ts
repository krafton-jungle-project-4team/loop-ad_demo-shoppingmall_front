import type { CartItem, Product } from "@/types/commerce";

const koreanWonFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  return koreanWonFormatter.format(amount);
}

export function getDiscountRate(originalPrice?: number, salePrice?: number): number {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function getProductUnitPrice(product: Product, optionId?: string): number {
  const optionPriceDelta =
    product.options?.find((option) => option.id === optionId)?.priceDelta ?? 0;

  return product.price + optionPriceDelta;
}

export function calculateCartSubtotal(
  items: CartItem[],
  catalog: Product[],
): number {
  return items.reduce((subtotal, item) => {
    const product = catalog.find((catalogProduct) => catalogProduct.id === item.productId);

    if (!product) {
      return subtotal;
    }

    return subtotal + getProductUnitPrice(product, item.option) * item.quantity;
  }, 0);
}
