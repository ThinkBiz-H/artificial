import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface StockMovement {
  _id: string;
  type: "purchase" | "sale" | "return" | "adjustment" | "transfer_in" | "transfer_out" | "reservation" | "release" | "damaged";
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: string;
  note: string;
  createdAt: string;
  product: { _id: string; title: string; SKU?: string } | null;
  variant: { _id: string; sku?: string } | null;
  warehouse: { _id: string; name: string; code?: string } | null;
  performedBy: { _id: string; name: string } | null;
}

export const inventoryApi = {
  /** GET /inventory/movements — stock history (paginated). */
  movements: (params: { productId?: string; type?: string; page?: number; limit?: number }) =>
    apiClient
      .get<ApiEnvelope<{ movements: StockMovement[]; total: number; page: number; totalPages: number }>>("/inventory/movements", { params })
      .then((r) => r.data),

  /** Goods received (purchase entry) into a warehouse. */
  purchase: (values: StockOperation) => apiClient.post<ApiEnvelope<unknown>>("/inventory/purchase", values).then((r) => r.data),
  /** Manual correction (+/−) — note required. */
  adjust: (values: StockOperation) => apiClient.post<ApiEnvelope<unknown>>("/inventory/adjust", values).then((r) => r.data),
  /** Moves stock to damaged. */
  damaged: (values: StockOperation) => apiClient.post<ApiEnvelope<unknown>>("/inventory/damaged", values).then((r) => r.data),
};

export interface StockOperation {
  productId: string;
  variantId?: string;
  warehouseId?: string;
  quantity: number;
  note?: string;
}
