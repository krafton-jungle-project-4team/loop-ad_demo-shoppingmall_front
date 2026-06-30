import { getCategoryById, getProductById } from "@/fixtures/product-helpers";
import type { CartItem, Product } from "@/types/commerce";
import { getProductUnitPrice } from "@/utils/money";

export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_FEE = 3000;

export type CommerceLineItem = {
  item: CartItem;
  product: Product;
  categoryName: string;
  optionLabel: string;
  unitPrice: number;
  lineTotal: number;
};

export type OrderAmounts = {
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  amountUntilFreeShipping: number;
};

export function getOptionLabel(product: Product, optionId?: string): string {
  if (!optionId) {
    return "기본";
  }

  return product.options?.find((option) => option.id === optionId)?.label ?? optionId;
}

export function buildCommerceLineItems(items: CartItem[]): CommerceLineItem[] {
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

export function calculateOrderAmounts(items: CartItem[]): OrderAmounts {
  const subtotal = buildCommerceLineItems(items).reduce(
    (total, row) => total + row.lineTotal,
    0,
  );
  const shippingFee =
    subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;

  return {
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
    amountUntilFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
