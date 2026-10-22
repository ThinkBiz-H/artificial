import { apiClient } from "./client";
import type { ApiEnvelope, Category, AttributeTemplateField } from "@/types";
import { toFormData } from "@/lib/utils";

export interface CategoryFormValues {
  name: string;
  shortTitle?: string;
  description?: string;
  status?: string;
  sortOrder?: number;
  showInHeader?: boolean;
  parent?: string | null;
  attributeTemplate?: AttributeTemplateField[];
  image?: File;
}

export const categoriesApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ categories: Category[]; count: number }>>("/categories", { params }).then((r) => r.data),

  tree: () =>
    apiClient.get<ApiEnvelope<{ categories: Category[] }>>("/categories", { params: { tree: "true" } }).then((r) => r.data),

  bySlug: (slug: string) => apiClient.get<ApiEnvelope<{ category: Category }>>(`/categories/${slug}`).then((r) => r.data),

  attributeTemplate: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ attributeTemplate: AttributeTemplateField[] }>>(`/categories/${id}/attribute-template`)
      .then((r) => r.data),

  create: (values: CategoryFormValues) => {
    const { image, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    return apiClient
      .post<ApiEnvelope<{ category: Category }>>("/categories", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<CategoryFormValues>) => {
    const { image, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    return apiClient
      .put<ApiEnvelope<{ category: Category }>>(`/categories/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/categories/${id}`).then((r) => r.data),
};
