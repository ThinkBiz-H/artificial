import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export type OfferKind = "festival" | "category" | "product" | "store";

export interface Offer {
  _id: string;
  name: string;
  kind: OfferKind;
  discountType: "percentage" | "flat";
  value: number;
  categories: { _id: string; name: string; slug: string }[];
  products: { _id: string; title: string; slug: string }[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  description?: string;
  status: "scheduled" | "running" | "ended";
  /** Prices currently changed by this offer. */
  appliedCount?: number;
}

export interface OfferFormValues {
  name: string;
  kind: OfferKind;
  discountType: "percentage" | "flat";
  value: number;
  categories: string[];
  products: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  description?: string;
}

export const offersApi = {
  list: () => apiClient.get<ApiEnvelope<{ offers: Offer[] }>>("/offers").then((r) => r.data),
  create: (values: OfferFormValues) => apiClient.post<ApiEnvelope<{ offer: Offer }>>("/offers", values).then((r) => r.data),
  update: (id: string, values: Partial<OfferFormValues>) =>
    apiClient.put<ApiEnvelope<{ offer: Offer }>>(`/offers/${id}`, values).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<object>>(`/offers/${id}`).then((r) => r.data),
};
