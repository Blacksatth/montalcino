export interface CloudImage {
  publicId: string;
  url: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: CloudImage;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface SizeVariant {
  size: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  collectionId: string;
  categoryId: string;
  sizes: SizeVariant[];
  images: CloudImage[];
  featured: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  shippingFlatRate: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  city?: string;
  address?: string;
  notes?: string;
}

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: OrderCustomer;
  payment: {
    mpPaymentId?: string;
    mpStatus?: string;
    paidAt?: number;
  };
  createdAt: number;
  updatedAt: number;
}