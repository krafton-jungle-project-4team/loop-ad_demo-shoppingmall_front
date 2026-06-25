import type {
  CampaignId,
  CouponId,
  OrderId,
  ProductId,
  ScenarioId,
  SkuId,
} from "@/domain/contracts/ids";

export type OrderStatus = "created" | "payment-failed" | "paid";

export interface DiscountSnapshot {
  id: string;
  label: string;
  amount: number;
}

export interface OrderLineSnapshot {
  productId: ProductId;
  skuId: SkuId;
  productName: string;
  optionLabel: string;
  image: {
    src: string;
    alt: string;
  };
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
  discounts: DiscountSnapshot[];
}

export interface OrderAmountSnapshot {
  itemSubtotal: number;
  productDiscount: number;
  couponDiscount: number;
  shippingFee: number;
  finalTotal: number;
}

export interface ShippingAddressSnapshot {
  label: string;
  recipient: string;
  line1: string;
  line2?: string;
  postalCode: string;
}

export interface PaymentMethodSnapshot {
  id: string;
  label: string;
}

export interface OrderSnapshot {
  id: OrderId;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  scenarioId: ScenarioId;
  campaignId?: CampaignId;
  couponIds: CouponId[];
  items: OrderLineSnapshot[];
  amounts: OrderAmountSnapshot;
  shippingAddress: ShippingAddressSnapshot;
  paymentMethod: PaymentMethodSnapshot;
}
