import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface WarehouseAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface WarehouseStockSummary {
  units: number;
  reserved: number;
  damaged: number;
  incoming: number;
  skus: number;
  products: number;
  lowStock: number;
  outOfStock: number;
}

export interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address: WarehouseAddress;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  capacity?: number;
  notes?: string;
  isDefault: boolean;
  status: "active" | "inactive";
  createdAt: string;
  summary?: WarehouseStockSummary;
  utilisation?: number | null;
}

export interface WarehouseActivity {
  _id: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  referenceType: string;
  createdAt: string;
  product: { _id: string; title: string; slug?: string } | null;
  variant: { _id: string; sku?: string } | null;
  warehouse: { _id: string; name: string; code: string } | null;
  performedBy: { _id: string; name: string } | null;
}

export interface WarehouseHealth {
  healthy: boolean;
  issues: string[];
  defaultWarehouse: { name: string; code: string } | null;
  warehouses: number;
}

export interface WarehouseOverview {
  warehouses: Warehouse[];
  totals: { warehouses: number; active: number; units: number; reserved: number; lowStock: number; outOfStock: number };
  recentActivity: WarehouseActivity[];
  health: WarehouseHealth;
}

export interface LowStockItem {
  _id: string;
  available: number;
  reserved: number;
  lowStockThreshold: number;
  product: { _id: string; title: string; slug?: string; thumbnail?: { url: string } } | null;
  variant: { _id: string; sku?: string } | null;
}

export type WarehouseInput = Partial<Pick<Warehouse, "name" | "code" | "address" | "contactPerson" | "contactPhone" | "contactEmail" | "capacity" | "notes" | "status" | "isDefault">>;

export const warehousesApi = {
  list: () => apiClient.get<ApiEnvelope<{ warehouses: Warehouse[]; count: number }>>("/warehouses").then((r) => r.data),
  overview: () => apiClient.get<ApiEnvelope<WarehouseOverview>>("/warehouses/overview").then((r) => r.data),
  summary: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ warehouse: Warehouse; lowStockItems: LowStockItem[]; recentActivity: WarehouseActivity[] }>>(`/warehouses/${id}/summary`)
      .then((r) => r.data),
  create: (values: WarehouseInput) => apiClient.post<ApiEnvelope<{ warehouse: Warehouse }>>("/warehouses", values).then((r) => r.data),
  update: (id: string, values: WarehouseInput) =>
    apiClient.put<ApiEnvelope<{ warehouse: Warehouse; promoted: { name: string } | null }>>(`/warehouses/${id}`, values).then((r) => r.data),
  deactivate: (id: string) =>
    apiClient.delete<ApiEnvelope<{ warehouse: Warehouse; promoted: { name: string } | null }>>(`/warehouses/${id}`).then((r) => r.data),
  repair: () => apiClient.post<ApiEnvelope<{ report: Record<string, number | string>; health: WarehouseHealth }>>("/warehouses/repair").then((r) => r.data),
  transfer: (values: { productId: string; variantId?: string; fromWarehouseId: string; toWarehouseId: string; quantity: number; note?: string }) =>
    apiClient.post<ApiEnvelope<unknown>>("/inventory/transfer", values).then((r) => r.data),
};
