import { apiClient } from "./client";
import type { AdminUser, ApiEnvelope, Order, Pagination } from "@/types";

/* ---------------------------------------------------------------- Customers */

export interface CustomerOverview {
  user: AdminUser;
  stats: { orderCount: number; totalSpent: number; lastOrderAt: string | null };
  lastLogin: { at: string; method: string; ip: string; userAgent: string } | null;
  activeSessions: number;
  recentOrders: Pick<Order, "_id" | "orderNumber" | "grandTotal" | "orderStatus" | "paymentStatus" | "paymentMethod" | "createdAt">[];
}

export interface DeviceSession {
  _id: string;
  deviceLabel: string;
  userAgent: string;
  ip: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
}

/* ---------------------------------------------------------------- Transactions */

export interface PaymentTransaction {
  _id: string;
  type: "payment" | "refund";
  status: string;
  amount: number;
  currency: string;
  method: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  failureReason: string | null;
  createdAt: string;
  order: { _id: string; orderNumber: string; grandTotal: number; paymentMethod: string; paymentStatus: string; returnRequest?: { refund?: { status?: string } } } | null;
  user: { _id: string; name: string; email?: string; mobile?: string } | null;
}

/* ---------------------------------------------------------------- Returns */

export interface ReturnRequest {
  requestedAt: string;
  items: { product: string; quantity: number }[];
  reason: string;
  comment?: string;
  images?: { url: string; publicId?: string }[];
  status: "Requested" | "Approved" | "Rejected" | "Picked Up" | "Received" | "Completed";
  adminComment?: string;
  reviewedAt?: string;
  refund: {
    status: "Not Applicable" | "Pending" | "Processing" | "Completed" | "Failed";
    method?: "Original Payment Method" | "Bank Transfer" | "Store Credit" | null;
    amount: number;
    razorpayRefundId?: string;
    processedAt?: string;
    history: { status: string; amount: number; note?: string; at: string }[];
  };
}

export type ReturnOrder = Pick<Order, "_id" | "orderNumber" | "grandTotal" | "paymentMethod" | "paymentStatus" | "orderStatus" | "items" | "createdAt"> & {
  user: { _id: string; name: string; email?: string; mobile?: string } | null;
  deliveredAt?: string;
  returnRequest: ReturnRequest;
};

export interface ReturnUpdate {
  status?: ReturnRequest["status"];
  adminComment?: string;
  refund?: { status?: ReturnRequest["refund"]["status"]; amount?: number; method?: string | null; note?: string };
}

/* ---------------------------------------------------------------- Support */

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Normal" | "High" | "Urgent";

export interface SupportTicket {
  _id: string;
  inquiryType: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: { _id: string; name: string; email: string } | null;
  replies: { _id: string; message: string; byName: string; emailed: boolean; at: string }[];
  createdAt: string;
}

/* ---------------------------------------------------------------- Notifications & search */

export interface NotificationStats {
  days: number;
  totals: { sent: number; failed: number; queued: number };
  byChannel: Record<string, { pending: number; processing: number; sent: number; failed: number }>;
  inApp: { sent: number; read: number };
}

export interface SearchResults {
  products: { _id: string; title: string; slug: string; SKU?: string; price: number; salePrice?: number; stock: number; status: string }[];
  orders: { _id: string; orderNumber: string; grandTotal: number; orderStatus: string; createdAt: string; shippingAddress?: { fullName?: string } }[];
  customers: { _id: string; name: string; email?: string; mobile?: string; isActive: boolean }[];
  coupons: { _id: string; code: string; discount: number; type: string; isActive: boolean }[];
  reviews: { _id: string; productId: string; productTitle: string; rating: number; comment: string }[];
  blogs: { _id: string; title: string; slug: string; status: string }[];
}

type Page<K extends string, T> = { [key in K]: T[] } & { pagination: Pagination };

export const adminOpsApi = {
  customerOverview: (id: string) =>
    apiClient.get<ApiEnvelope<CustomerOverview>>(`/admin/users/${id}/overview`).then((r) => r.data),
  setVerified: (id: string, isVerified: boolean) =>
    apiClient.patch<ApiEnvelope<{ user: AdminUser }>>(`/admin/users/${id}/verify`, { isVerified }).then((r) => r.data),
  sessions: (id: string) =>
    apiClient.get<ApiEnvelope<{ sessions: DeviceSession[] }>>(`/admin/users/${id}/sessions`).then((r) => r.data),
  revokeSession: (id: string, sessionId: string) =>
    apiClient.delete<ApiEnvelope<object>>(`/admin/users/${id}/sessions/${sessionId}`).then((r) => r.data),
  revokeAllSessions: (id: string) =>
    apiClient.delete<ApiEnvelope<{ revoked: number }>>(`/admin/users/${id}/sessions`).then((r) => r.data),

  transactions: (params: { status?: string; type?: string; method?: string; q?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiEnvelope<Page<"transactions", PaymentTransaction>>>("/admin/transactions", { params }).then((r) => r.data),

  returns: (params: { status?: string; refundStatus?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiEnvelope<Page<"orders", ReturnOrder>>>("/admin/returns", { params }).then((r) => r.data),
  updateReturn: (orderId: string, body: ReturnUpdate) =>
    apiClient.patch<ApiEnvelope<{ order: ReturnOrder }>>(`/admin/orders/${orderId}/return`, body).then((r) => r.data),

  tickets: (params: { status?: string; priority?: string; assignedTo?: string; q?: string; page?: number; limit?: number }) =>
    apiClient
      .get<ApiEnvelope<Page<"inquiries", SupportTicket> & { counts: Record<string, number> }>>("/admin/inquiries", { params })
      .then((r) => r.data),
  updateTicket: (id: string, body: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string | null }) =>
    apiClient.patch<ApiEnvelope<{ inquiry: SupportTicket }>>(`/admin/inquiries/${id}`, body).then((r) => r.data),
  replyTicket: (id: string, message: string) =>
    apiClient.post<ApiEnvelope<{ inquiry: SupportTicket }>>(`/admin/inquiries/${id}/reply`, { message }).then((r) => r.data),

  notificationStats: (days = 30) =>
    apiClient.get<ApiEnvelope<NotificationStats>>("/admin/notifications/stats", { params: { days } }).then((r) => r.data),

  /** The signed-in admin's own devices (GET/DELETE /auth/sessions, POST /auth/logout-all). */
  mySessions: () =>
    apiClient.get<ApiEnvelope<{ sessions: (DeviceSession & { isCurrent: boolean })[] }>>("/auth/sessions").then((r) => r.data),
  revokeMySession: (sessionId: string) => apiClient.delete<ApiEnvelope<object>>(`/auth/sessions/${sessionId}`).then((r) => r.data),
  logoutOtherDevices: () =>
    apiClient.post<ApiEnvelope<object>>("/auth/logout-all", { keepCurrentSession: true }).then((r) => r.data),

  search: (q: string) => apiClient.get<ApiEnvelope<{ results: Partial<SearchResults> }>>("/admin/search", { params: { q } }).then((r) => r.data),
};
