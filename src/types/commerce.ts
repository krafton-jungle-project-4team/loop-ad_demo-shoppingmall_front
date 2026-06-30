export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export type ProductOption = {
  id: string;
  label: string;
  priceDelta?: number;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  options?: ProductOption[];
  description: string;
  promotionIds?: string[];
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  heroImage?: string;
  productIds: string[];
};

export type CartItem = {
  productId: string;
  option?: string;
  quantity: number;
};

export type OrderStatus = "paid" | "preparing" | "shipping" | "delivered";

export type Order = {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  status: OrderStatus;
};
