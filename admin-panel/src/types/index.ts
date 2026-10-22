export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error: unknown;
}

export interface ImageRef {
  url: string;
  publicId: string;
}

// ---- Auth / Admin user ----
export interface Address {
  _id: string;
  type: "Home" | "Office" | "Other";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isDefault: boolean;
}

export interface AdminUser {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  profileImage?: ImageRef;
  address: Address[];
  role: "user" | "admin";
  permissions?: string[];
  // RBAC — populated when a role has been assigned; unset means
  // unrestricted (same "empty = full access" convention as `permissions`).
  roleRef?: Role | string | null;
  customPermissions?: PermissionEntry[];
  isVerified: boolean;
  isActive: boolean;
  isBlocked?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// ---- RBAC ----
export type PermissionResource =
  | "Dashboard"
  | "Products"
  | "Categories"
  | "Brands"
  | "Orders"
  | "Customers"
  | "Coupons"
  | "Inventory"
  | "Reviews"
  | "Reports"
  | "Settings"
  | "Users"
  | "Roles"
  | "Warehouse"
  | "Notifications"
  | "Blogs";

export type PermissionAction = "View" | "Create" | "Edit" | "Delete" | "Export" | "Approve";

export interface PermissionEntry {
  resource: PermissionResource;
  actions: PermissionAction[];
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isSuperAdmin: boolean;
  isSystem: boolean;
  permissions: PermissionEntry[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAccount {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  isActive: boolean;
  roleRef: Role | null;
  customPermissions: PermissionEntry[];
  createdAt: string;
}

// ---- Category ----
export interface AttributeTemplateField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  unit?: string;
  required: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: ImageRef;
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
  createdAt: string;
}

// ---- Category Banner ----
export interface CategoryBanner {
  _id: string;
  name: string;
  desktopImage?: ImageRef;
  mobileImage?: ImageRef;
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
  createdAt: string;
}

// ---- Brand ----
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: ImageRef;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Unit {
  _id: string;
  name: string;
  symbol: string;
  allowDecimal: boolean;
}

// ---- Variant ----
export interface Variant {
  _id: string;
  product: string;
  attributes: { key: string; value: string }[];
  /** Jewellery combination (kept in sync with the Color/Size attributes). */
  color?: string;
  colorHex?: string;
  size?: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock: number;

  unit?: Unit | string | null;
  unitValue?: number;

  images?: ImageRef[];
  status: "active" | "inactive";
  isDefault: boolean;
}

// ---- Product ----
export interface Review {
  _id: string;
  user: { _id: string; name: string; profileImage?: ImageRef } | string | null;
  rating: number;
  comment?: string;
  images?: ImageRef[];
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
  // GST Configuration — additive metadata; `price` remains the single
  // final-selling-price field used everywhere else in the app.
  basePrice?: number;
  gstRate?: number;
  gstAmount?: number;
  priceIncludesGST?: boolean;
  stock: number;
  images: ImageRef[];
  thumbnail?: ImageRef;
  videoUrl?: string;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  /** Source of truth for colours — name, swatch hex and optional gallery. */
  colorOptions?: ColorOption[];
  /** Legacy name list, synced from colorOptions by the backend. */
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
  isDeleted?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

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
  createdAt: string;
}

export interface CouponAnalytics {
  coupon: Coupon;
  totalRedemptions: number;
  totalDiscountGiven: number;
  totalOrderValue: number;
  uniqueUsers: number;
}

// ---- Order ----
export interface ColorOption {
  _id?: string;
  name: string;
  hex: string;
  images: ImageRef[];
}

export interface OrderItem {
  product: Product | string | null;
  variant?: string | null;
  title: string;
  sku?: string;
  thumbnail?: string;
  quantity: number;
  price: number;
  color?: string;
  colorHex?: string;
  size?: string;
  metal?: string;
  plating?: string;
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
  paymentStatus:
    | "Pending"
    | "Paid"
    | "Failed"
    | "Refunded"
    | "Partially Refunded";
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
  invoiceNumber: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
}

// ---- Blog ----
export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  seo?: BlogCategorySeo;
}

export interface BlogCategorySeo {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
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
  relatedBlogs?: Blog[] | string[];
  featuredImage?: ImageRef;
  status: "draft" | "published" | "scheduled";
  publishedAt?: string;
  viewCount?: number;
  seo?: BlogSeo;
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
  featuredImage?: ImageRef;
  seo?: { title?: string; description?: string };
  sortOrder?: number;
  createdAt: string;
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

// ---- Announcement (marquee) ----
export interface Announcement {
  _id: string;
  text: string;
  sortOrder: number;
  isActive: boolean;
  scrollSpeed: number;
  repeat: boolean;
}

// ---- Home Section ----
export interface HeroSlide {
  _id: string;
  desktopImage: ImageRef;
  mobileImage?: ImageRef;
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
  video: ImageRef;
  thumbnail?: ImageRef;
  title?: string;
  link?: string;
  order: number;
  active: boolean;
}

// ---- Workshop ----
export interface WorkshopCard {
  _id: string;
  image: ImageRef;
  heading: string;
  shortDescription?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
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
  image?: ImageRef;
  videos?: ImageRef[];
  gallery?: ImageRef[];
  slides?: HeroSlide[];
  reels?: Reel[];
}

// ---- Settings ----
export interface Settings {
  general: {
    siteName: string;
    siteTagline: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
  };
  store: {
    legalName: string;
    gstNumber: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
  };
  currency: { code: string; symbol: string; position: "before" | "after" };
  tax: {
    gstEnabled: boolean;
    defaultTaxPercent: number;
    pricesIncludeTax: boolean;
  };
  invoice: {
    prefix: string;
    startingNumber: number;
    termsAndConditions: string;
    footerNote: string;
  };
  integrations: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    razorpayEnabled: boolean;
    shiprocketEnabled: boolean;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultOgImage: string;
    googleAnalyticsId: string;
    googleSiteVerification: string;
    facebookPixelId: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
    pinterest: string;
    whatsapp: string;
  };
  contact: { email: string; phone: string; whatsapp: string; address: string };
  maintenanceMode: { enabled: boolean; message: string; allowedIPs: string[] };

  payment: {
    codEnabled: boolean;
    onlinePaymentEnabled: boolean;
  };
  shipping: {
    freeShippingEnabled: boolean;
    freeShippingThreshold: number;
    defaultShippingCharge: number;
    expressShippingCharge: number;
    codCharge: number;
  };
  // Storefront "Start Chat" button only — automatic order-status
  // notifications now go out over SMS, not WhatsApp.
  whatsapp: {
    businessNumber: string;
    enableStartChat: boolean;
    trackingBaseUrl: string;
  };
  featureFlags: Record<string, boolean>;
  appVersion?: {
    latestVersion: string;
    minimumVersion: string;
    forceUpdate: boolean;
    optionalUpdate: boolean;
    message: string;
    androidUrl: string;
    iosUrl: string;
  };
  logo?: ImageRef;
  favicon?: ImageRef;
}

export interface EnvironmentStatus {
  [key: string]: boolean;
}

// ---- Notification templates / broadcast ----
export interface NotificationTemplate {
  _id: string;
  type: string;
  channel: "in_app" | "email" | "sms" | "push";
  subject?: string;
  body: string;
  isActive: boolean;
}

// ---- Audit log ----
export interface AuditLog {
  _id: string;
  user?: { _id: string; name: string } | string | null;
  route: string;
  method: string;
  statusCode?: number;
  ip?: string;
  createdAt: string;
}

// ---- Media ----
export interface MediaFolder {
  _id: string;
  name: string;
  parent: string | null;
}

export interface Media {
  _id: string;
  url: string;
  publicId: string;
  folder: string | null;
  type: "image" | "video" | "raw";
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  tags?: string[];
  createdAt: string;
}

// ---- Dashboard ----
export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  _id: string;
  title: string;
  thumbnail?: string;
  salesCount: number;
  revenue: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
