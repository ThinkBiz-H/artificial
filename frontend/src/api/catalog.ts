import { apiClient } from "./client";
import type { ApiEnvelope, Category, Brand, Faq, HomeSection, Announcement, PublicSettings, CmsPage, AttributeTemplateField } from "@/types";

/** Drops inactive categories (and everything under them) at every level. */
const activeOnly = (nodes: Category[]): Category[] =>
  nodes.filter((c) => c.status === "active").map((c) => ({ ...c, children: activeOnly(c.children ?? []) }));

export const categoriesApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ categories: Category[]; count: number }>>("/categories", { params }).then((r) => r.data),

  /**
   * Every ACTIVE category from Admin > Categories, nested. `all=true` keeps
   * categories that have no published products yet, so the storefront always
   * lists exactly the categories the admin has switched on.
   */
  tree: () =>
    apiClient
      .get<ApiEnvelope<{ categories: Category[] }>>("/categories", { params: { tree: "true", all: "true" } })
      .then((r) => ({ ...r.data, data: { ...r.data.data, categories: activeOnly(r.data.data?.categories ?? []) } })),

  bySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<{ category: Category }>>(`/categories/${slug}`).then((r) => r.data),

  attributeTemplate: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ attributeTemplate: AttributeTemplateField[] }>>(`/categories/${id}/attribute-template`)
      .then((r) => r.data),
};

export const brandsApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ brands: Brand[]; count: number }>>("/brands", { params }).then((r) => r.data),

  bySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<{ brand: Brand }>>(`/brands/${slug}`).then((r) => r.data),
};

export const faqsApi = {
  list: (category?: string) =>
    apiClient.get<ApiEnvelope<{ faqs: Faq[]; count: number }>>("/faqs", { params: { category } }).then((r) => r.data),
};

export const homeSectionsApi = {
  list: () => apiClient.get<ApiEnvelope<{ sections: HomeSection[] }>>("/home-sections").then((r) => r.data),
};


export const announcementsApi = {
  list: () => apiClient.get<ApiEnvelope<{ announcements: Announcement[] }>>("/announcements").then((r) => r.data),
};

export const settingsApi = {
  get: () => apiClient.get<ApiEnvelope<{ settings: PublicSettings }>>("/settings").then((r) => r.data),
};

export const pagesApi = {
  list: () => apiClient.get<ApiEnvelope<{ pages: CmsPage[]; count: number }>>("/pages").then((r) => r.data),
  bySlug: (slug: string) => apiClient.get<ApiEnvelope<{ page: CmsPage }>>(`/pages/${slug}`).then((r) => r.data),
};
