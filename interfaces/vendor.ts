export interface IVendor {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  rating: number;
  isOpen: boolean;
  deliveryTime: string;
  deliveryFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  commissionType: any;
  commissionValue: any;
  saleMode: any;
  locationLat: any;
  locationLng: any;
  deliveryZoneType: any;
  deliveryRadiusKm: any;
  deliveryPolygon: any;
  logo: any;
  coverImage: any;
  businessType: BusinessType;
  products: Product[];
  vendorCategories: any[];
  subOrders: SubOrder[];
  deliverySlots: any[];
  banners: any[];
  brands: any[];
  categories: Category[];
  owner: Owner;
}

export interface BusinessType {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  homeTitle: string;
  description: string;
  layoutType: string;
  orderMode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Product {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  baseSalePrice?: number;
  sku: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  attributes: Attributes;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  soldCount: any;
  reviewCount: any;
  averageRating: any;
  isFlashSale: any;
  saleStartDate: any;
  saleEndDate: any;
}

export interface Attributes {
  spicyLevel: number;
}

export interface SubOrder {
  id: number;
  documentId: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  vendorNote: any;
  tipAmount: any;
  deliveryTimingType: any;
  deliveryAfterMinutes: any;
  deliveryScheduledAt: any;
  deliveryWindowDate: any;
  deliveryWindowStart: any;
  deliveryWindowEnd: any;
  deliverySlotSnapshot: any;
  deliveryInstructions: any;
  deliveredAt: any;
  cancelledAt: any;
  returnedAt: any;
  deliveryManSnapshot: any;
  returnRequested: any;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Owner {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  accountType: string;
  phone: string;
  walletBalance: any;
  loyaltyPoints: any;
  isVip: boolean;
}
