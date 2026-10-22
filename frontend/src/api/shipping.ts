import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export interface ShippingCalculateRequest {
  pincode: string;
  weight?: number;
  cod?: boolean;
  // Cart/order subtotal (before discounts) — orders of ₹999 or more ship
  // free; the backend (services/shipping.service.js) is the single source
  // of truth for this rule, this is just what triggers it.
  subTotal?: number;
}

export interface ShippingCalculateResult {
  shippingCharge: number;
  courierName: string;
  estimatedDays: number;
  courierId: string | null;
  availableCouriers: number;
  freeShipping: boolean;
  freeShippingThreshold: number;
}

export const shippingApi = {
  calculate(data: ShippingCalculateRequest) {
    return apiClient.post<ApiEnvelope<ShippingCalculateResult>>(
      "/shipping/calculate",
      data,
    );
  },
};
