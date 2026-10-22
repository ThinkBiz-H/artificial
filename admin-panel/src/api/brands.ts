import { apiClient } from "./client";
import type { ApiEnvelope, Brand } from "@/types";
import { toFormData } from "@/lib/utils";

export interface BrandFormValues {
  name: string;
  status?: string;
  logo?: File;
}

export const brandsApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ brands: Brand[]; count: number }>>("/brands", { params }).then((r) => r.data),

  bySlug: (slug: string) => apiClient.get<ApiEnvelope<{ brand: Brand }>>(`/brands/${slug}`).then((r) => r.data),

  create: (values: BrandFormValues) => {
    const { logo, ...rest } = values;
    const form = toFormData(rest);
    if (logo) form.append("logo", logo);
    return apiClient
      .post<ApiEnvelope<{ brand: Brand }>>("/brands", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<BrandFormValues>) => {
    const { logo, ...rest } = values;
    const form = toFormData(rest);
    if (logo) form.append("logo", logo);
    return apiClient
      .put<ApiEnvelope<{ brand: Brand }>>(`/brands/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/brands/${id}`).then((r) => r.data),
};
