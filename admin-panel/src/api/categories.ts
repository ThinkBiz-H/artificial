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
  seo?: { title?: string; description?: string; keywords?: string };
  image?: File;
  icon?: File;
  banner?: File;
  /** Clear the saved icon / banner. */
  remove_icon?: boolean;
  remove_banner?: boolean;
}

/** Multipart body with the image, icon and banner files under their own fields. */
const categoryForm = (values: Partial<CategoryFormValues>) => {
  const { image, icon, banner, ...rest } = values;
  const form = toFormData(rest);
  if (image) form.append("image", image);
  if (icon) form.append("icon", icon);
  if (banner) form.append("banner", banner);
  return form;
};

export const categoriesApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ categories: Category[]; count: number }>>("/categories", { params: { all: "true", ...params } }).then((r) => r.data),

  tree: () =>
    // all=true: the admin sees empty categories too (the storefront hides them).
    apiClient.get<ApiEnvelope<{ categories: Category[] }>>("/categories", { params: { tree: "true", all: "true" } }).then((r) => r.data),

  bySlug: (slug: string) => apiClient.get<ApiEnvelope<{ category: Category }>>(`/categories/${slug}`).then((r) => r.data),

  attributeTemplate: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ attributeTemplate: AttributeTemplateField[] }>>(`/categories/${id}/attribute-template`)
      .then((r) => r.data),

  create: (values: CategoryFormValues) => {
    const form = categoryForm(values);
    return apiClient
      .post<ApiEnvelope<{ category: Category }>>("/categories", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<CategoryFormValues>) => {
    const form = categoryForm(values);
    return apiClient
      .put<ApiEnvelope<{ category: Category }>>(`/categories/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/categories/${id}`).then((r) => r.data),
};
