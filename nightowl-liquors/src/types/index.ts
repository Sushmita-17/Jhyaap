export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  volume: string;
  abv: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  description: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
  image: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  link: string;
  tag?: string;
}

export type Page = 'home' | 'products' | 'product' | 'cart' | 'checkout' | 'orders' | 'order-tracking' | 'profile' | 'search' | 'categories' | 'login' | 'about' | 'faqs' | 'contact' | 'reviews';

export interface Address {
  id: string;
  label: string;
  area: string;
  street: string;
  landmark?: string;
  isDefault: boolean;
  deliveryFee: number;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  dob?: string;
  /** NOTE: plaintext for local-only prototyping. Replace with backend auth + hashing before production. */
  password?: string;
  authMethod?: 'phone' | 'google';
  profilePhoto?: string;
  walletBalance: number;
  loyaltyPoints?: number;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: 'idle' | 'picking' | 'driving' | 'arrived';
  updatedAt: string;
}

export interface GeoCoords {
  lat: number;
  lng: number;
  label?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  address: Address;
  paymentMethod: 'cod' | 'esewa' | 'khalti';
  notes?: string;
  createdAt: string;
  statusUpdatedAt?: string;
  eta?: string;
  deliveryStaffName?: string;
  deliveryStaffPhone?: string;
  deliveryRider?: DeliveryRider;
  storeCoords?: GeoCoords;
  destinationCoords?: GeoCoords;
  routeProgress?: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  userId?: string;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat' | 'free_delivery';
  value: number;
  minOrder: number;
  maxUses: number;
  usesCount: number;
  expiresAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
  verified: boolean;
  createdAt: string;
  userName: string;
}

export interface OrderStatus {
  stage: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  label: string;
  time?: string;
  description?: string;
}