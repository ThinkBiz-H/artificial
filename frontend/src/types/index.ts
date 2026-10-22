// ---- Generic API envelope: { success, message, data, error } ----
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Auth / User ----
export interface Address {
  _id: string;
  type: "Home" | "Office" | "Other";
  firstName?: string;
  lastName?: string;
  addressLine1: string;
  addressLine2?: string; // Apartment / suite / unit
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  profileImage?: { url: string; publicId: string };
  address: Address[];
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  wishlist?: string[] | Product[];
  role: "user" | "admin";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

// ---- Category ----
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: { url: string; publicId: string };
  shortTitle?: string;
  description?: string;
  status: "active" | "inactive";
  parent: string | null;
  ancestors?: Category[] | string[];
  children?: Category[];
  level: number;
  sortOrder: number;
  showInHeader?: boolean;
  attributeTemplate?: AttributeTemplateField[];
}

export interface Announcement {
  _id: string;
  text: string;
  sortOrder: number;
  isActive: boolean;
  scrollSpeed: number;
  repeat: boolean;
}

export interface AttributeTemplateField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  unit?: string;
  required: boolean;
}

// ---- Category Banner ----
export interface CategoryBanner {
  _id: string;
  name: string;
  desktopImage?: { url: string; publicId: string };
  mobileImage?: { url: string; publicId: string };
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  categories: Category[] | string[];
  priority: number;
  status: "active" | "inactive";
  startDate?: string | null;
  endDate?: string | null;
}

// ---- Brand ----
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: { url: string; publicId: string };
  status: "active" | "inactive";
}

// ---- Unit ----
export interface Unit {
  _id: string;
  name: string;
  symbol: string;
  allowDecimal: boolean;
}

// ---- Variant ----
/** Jewellery option values carried by cart lines and order items. */
export interface ItemOptionValues {
  color?: string;
  colorHex?: string;
  size?: string;
  metal?: string;
  plating?: string;
}

export interface ColorOption {
  _id?: string;
  name: string;
  hex?: string;
  images?: { url: string; publicId: string }[];
}

export interface Variant {
  _id: string;
  product: string;
  attributes: { key: string; value: string }[];
  /** Jewellery combination (mirrors the Color / Size attributes). */
  color?: string;
  colorHex?: string;
  size?: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: { url: string; publicId: string }[];
  status: "active" | "inactive";
  isDefault: boolean;
}

// ---- Product ----
export interface Review {
  _id: string;
  user: { _id: string; name: string; profileImage?: { url: string } } | string | null;
  rating: number;
  comment?: string;
  images?: { url: string; publicId: string }[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  SKU?: string;
  category: Category | string | null;
  brand?: Brand | string | null;
  unit?: Unit | string | null;
  unitValue?: number;
  price: number;
  salePrice?: number;
  stock: number;
  images: { url: string; publicId: string }[];
  thumbnail?: { url: string; publicId: string };
  documents?: { url: string; publicId: string; name: string }[];
  videoUrl?: string;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  /** Colour options with swatch hex and optional gallery (source of truth for colours). */
  colorOptions?: ColorOption[];
  /** Legacy colour names (synced from colorOptions). */
  colors?: string[];
  sizes?: string[];
  metal?: string;
  plating?: string;
  hasVariants: boolean;
  variants?: Variant[];
  relatedProducts?: Product[] | string[];
  crossSell?: Product[] | string[];
  upSell?: Product[] | string[];
  weight?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  warranty?: string;
  returnPolicy?: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  salesCount?: number;
  viewCount?: number;
  featured: boolean;
  status: "active" | "inactive" | "draft";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

// ---- Cart ----
export interface CartLineItem extends ItemOptionValues {
  /** Server cart line id (absent on guest-cart lines). */
  lineId?: string;
  product: Product;
  variant: Variant | null;
  quantity: number;
  /** Line image: variant image → colour gallery → product thumbnail. */
  image?: string;
  price: number;
  itemTotal: number;
}

// ---- Wishlist ----
export type WishlistItem = Product;

// ---- Coupon ----
export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  type: "percentage" | "flat";
  expiry: string;
  minimumOrder: number;
  maximumDiscount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
}

// ---- Order ----
export interface OrderItem extends ItemOptionValues {
  product: Product | string | null;
  variant?: string | null;
  title: string;
  sku?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  changedBy?: string | null;
  note?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email?: string; mobile?: string } | null;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    mobile?: string;
  };
  coupon?: { code: string | null; discountAmount: number };
  discountAmount?: number;
  discountPercentage?: number;
  subTotal: number;
  shippingCharge: number;
  tax: number;
  grandTotal: number;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded" | "Partially Refunded";
  paymentInfo?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
  };
  orderStatus:
    | "Pending"
    | "Confirmed"
    | "Packed"
    | "Shipped"
    | "Out For Delivery"
    | "Delivered"
    | "Cancelled"
    | "Returned"
    | "Refunded";
  statusHistory: StatusHistoryEntry[];
  courier?: { partner?: string; courierId?: string; courierName?: string };
  tracking?: {
    number?: string;
    url?: string;
    estimatedDeliveryDate?: string;
    shipmentStatus: string;
    deliveryAttempts: number;
  };
  shippingNotes?: string;
  shiprocket?: { awbCode?: string; shipmentId?: string; [k: string]: unknown };
  invoiceNumber: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
}

// ---- Payment ----
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentTransaction {
  _id: string;
  order: string;
  type: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  method?: string;
  status: string;
  failureReason?: string;
  createdAt: string;
}

// ---- Notification ----
export interface AppNotification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  relatedOrder?: string;
  createdAt: string;
}

// ---- Blog ----
export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  /** SEO for the category's journal listing. */
  seo?: { title?: string; description?: string; keywords?: string; canonicalUrl?: string; ogImage?: string };
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: BlogCategory | string | null;
  author?: { _id: string; name: string } | string | null;
  tags?: string[];
  featuredImage?: { url: string; publicId: string };
  status: "draft" | "published" | "scheduled";
  publishedAt?: string;
  viewCount?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robots?: string;
  };
  relatedBlogs?: Blog[];
  createdAt: string;
}

// ---- CMS Page ----
export interface CmsPage {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: "draft" | "published" | "unpublished";
  featuredImage?: { url: string; publicId: string };
  seo?: { title?: string; description?: string };
  sortOrder?: number;
}

// ---- FAQ ----
export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
}

// ---- Home Section ----
export interface HeroSlide {
  _id: string;
  desktopImage: { url: string; publicId: string };
  mobileImage?: { url: string; publicId: string };
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  active: boolean;
}

export interface Reel {
  _id: string;
  video: { url: string; publicId: string };
  thumbnail?: { url: string; publicId: string };
  title?: string;
  link?: string;
  order: number;
  active: boolean;
}

export interface HomeSection {
  _id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isActive: boolean;
  config?: Record<string, unknown>;
  button?: { label?: string; link?: string };
  image?: { url: string; publicId: string };
  videos?: { url: string; publicId: string }[];
  gallery?: { url: string; publicId: string }[];
  slides?: HeroSlide[];
  reels?: Reel[];
}

// ---- Settings ----
export interface PublicSettings {
  general?: {
    siteName?: string;
    tagline?: string;
    siteTagline?: string;
    supportEmail?: string;
    supportPhone?: string;
    footerNote?: string;
    [k: string]: unknown;
  };
  payment?: { codEnabled?: boolean; onlinePaymentEnabled?: boolean };
  currency?: { code?: string; symbol?: string };
  tax?: { defaultTaxPercent?: number; pricesIncludeTax?: boolean };
  seo?: Record<string, unknown>;
  social?: Record<string, string>;
  contact?: { email?: string; phone?: string; address?: string };
  integrations?: Record<string, unknown>;
  featureFlags?: Record<string, boolean>;
  logo?: { url: string; publicId: string };
  favicon?: { url: string; publicId: string };
  maintenanceMode?: { enabled: boolean; message?: string };
  whatsapp?: {
    businessNumber: string;
    enableStartChat: boolean;
    trackingBaseUrl: string;
  };
  shipping?: {
    freeShippingEnabled: boolean;
    freeShippingThreshold: number;
    defaultShippingCharge: number;
  };
}

// Session
export interface Session {
  _id: string;
  userAgent?: string;
  ip?: string;
  createdAt: string;
  isCurrent: boolean;
}
