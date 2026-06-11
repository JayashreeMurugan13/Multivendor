export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  wallet: number;
  rewardPoints: number;
  isActive: boolean;
}

export interface Seller {
  _id: string;
  email: string;
  shopName: string;
  businessName: string;
  ownerName: string;
  phone: string;
  storeLogo?: string;
  storeBanner?: string;
  storeDescription?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  totalRevenue: number;
  withdrawableBalance: number;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: { _id: string; name: string };
  brand: string;
  description: string;
  specifications: { key: string; value: string }[];
  price: number;
  discount: number;
  finalPrice: number;
  stock: number;
  images: string[];
  ratings: { average: number; count: number };
  seller: { _id: string; shopName: string; storeLogo?: string };
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: string;
  totalSold: number;
}

export interface OrderItem {
  product: Product;
  seller: Seller;
  name: string;
  image: string;
  price: number;
  quantity: number;
  status: string;
}

export interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingId?: string;
  createdAt: string;
}

export interface Address {
  _id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  type: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
