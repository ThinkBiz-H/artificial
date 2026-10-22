import { apiClient } from "./client";
import type { ApiEnvelope, Category, Brand, Faq, HomeSection, Announcement, PublicSettings, CmsPage, AttributeTemplateField } from "@/types";

export const categoriesApi = {
  list: (params: Record<string, unknown> = {}) =>
    apiClient.get<ApiEnvelope<{ categories: Category[]; count: number }>>("/categories", { params }).then((r) => r.data),

  tree: () =>
    apiClient
      .get<ApiEnvelope<{ categories: Category[] }>>("/categories", { params: { tree: "true" } })
      .then((r) => r.data),

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
