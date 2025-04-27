export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      total: number;
      pageSize: number;
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceDiscount?: number;
  image: string;
  additionalImages?: string[];
  category: { id: string; name: string; slug: string };
  brand: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
  attributes?: Record<string, string[]>;
  variants?: { combination: string[]; stock: number }[];
  sku: string;
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  createdAt: string;
  updatedAt?: string;
  technicalDetails?: Record<string, Record<string, string>>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  level?: number;
  count?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  attributes?: Record<string, string>;
  sku: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  couponCode?: string;
  shippingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetails {
  id: string;
  provider: string;
  status: string;
  transactionId?: string;
  amount: number;
  currency: string;
  method: string;
  timestamp: string;
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  AUTHORIZED = "authorized",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}
