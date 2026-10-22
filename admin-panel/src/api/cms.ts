import { apiClient } from "./client";
import type { ApiEnvelope, Announcement, CmsPage, Faq, HomeSection } from "@/types";
import { toFormData } from "@/lib/utils";

export interface PageFormValues {
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: "draft" | "published" | "unpublished";
  sortOrder?: number;
  seo?: { title?: string; description?: string };
  featuredImage?: File;
}

export const pagesApi = {
  list: (params: { status?: string; keyword?: string } = {}) =>
    apiClient.get<ApiEnvelope<{ pages: CmsPage[]; count: number }>>("/admin/pages", { params }).then((r) => r.data),
  byId: (id: string) => apiClient.get<ApiEnvelope<{ page: CmsPage }>>(`/admin/pages/${id}`).then((r) => r.data),
  create: (values: PageFormValues) => {
    const { featuredImage, ...rest } = values;
    const form = toFormData(rest);
    if (featuredImage) form.append("featuredImage", featuredImage);
    return apiClient
      .post<ApiEnvelope<{ page: CmsPage }>>("/admin/pages", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  update: (id: string, values: Partial<PageFormValues>) => {
    const { featuredImage, ...rest } = values;
    const form = toFormData(rest);
    if (featuredImage) form.append("featuredImage", featuredImage);
    return apiClient
      .put<ApiEnvelope<{ page: CmsPage }>>(`/admin/pages/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  setStatus: (id: string, status: string) =>
    apiClient.patch<ApiEnvelope<{ page: CmsPage }>>(`/admin/pages/${id}/status`, { status }).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/pages/${id}`).then((r) => r.data),
};

export const faqsApi = {
  list: () => apiClient.get<ApiEnvelope<{ faqs: Faq[] }>>("/admin/faqs").then((r) => r.data),
  create: (values: { question: string; answer: string; category?: string; sortOrder?: number; isActive?: boolean }) =>
    apiClient.post<ApiEnvelope<{ faq: Faq }>>("/admin/faqs", values).then((r) => r.data),
  update: (id: string, values: Partial<{ question: string; answer: string; category?: string; sortOrder?: number; isActive?: boolean }>) =>
    apiClient.put<ApiEnvelope<{ faq: Faq }>>(`/admin/faqs/${id}`, values).then((r) => r.data),
  reorder: (order: string[]) => apiClient.patch<ApiEnvelope<{ faqs: Faq[] }>>("/admin/faqs/reorder", { order }).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/faqs/${id}`).then((r) => r.data),
};

export interface AnnouncementFormValues {
  text: string;
  sortOrder?: number;
  isActive?: boolean;
  scrollSpeed?: number;
  repeat?: boolean;
}

export const announcementsApi = {
  list: () => apiClient.get<ApiEnvelope<{ announcements: Announcement[] }>>("/admin/announcements").then((r) => r.data),
  create: (values: AnnouncementFormValues) =>
    apiClient.post<ApiEnvelope<{ announcement: Announcement }>>("/admin/announcements", values).then((r) => r.data),
  update: (id: string, values: Partial<AnnouncementFormValues>) =>
    apiClient.put<ApiEnvelope<{ announcement: Announcement }>>(`/admin/announcements/${id}`, values).then((r) => r.data),
  reorder: (order: string[]) =>
    apiClient.patch<ApiEnvelope<{ announcements: Announcement[] }>>("/admin/announcements/reorder", { order }).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/announcements/${id}`).then((r) => r.data),
};

export interface HomeSectionFormValues {
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder?: number;
  isActive?: boolean;
  config?: Record<string, unknown>;
  button?: { label?: string; link?: string };
  image?: File;
  videos?: File[];
  gallery?: File[];
}

export const homeSectionsApi = {
  list: () => apiClient.get<ApiEnvelope<{ sections: HomeSection[] }>>("/admin/home-sections").then((r) => r.data),
  create: (values: HomeSectionFormValues) => {
    const { image, videos, gallery, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    if (videos && videos.length > 0) {
      videos.forEach((video) => form.append("videos", video));
    }
    if (gallery && gallery.length > 0) {
      gallery.forEach((file) => form.append("gallery", file));
    }
    return apiClient
      .post<ApiEnvelope<{ section: HomeSection }>>("/admin/home-sections", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  update: (id: string, values: Partial<HomeSectionFormValues>) => {
    const { image, videos, gallery, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    if (videos && videos.length > 0) {
      videos.forEach((video) => form.append("videos", video));
    }
    if (gallery && gallery.length > 0) {
      gallery.forEach((file) => form.append("gallery", file));
    }
    return apiClient
      .put<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  reorder: (order: string[]) =>
    apiClient.patch<ApiEnvelope<{ sections: HomeSection[] }>>("/admin/home-sections/reorder", { order }).then((r) => r.data),
  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/home-sections/${id}`).then((r) => r.data),
};
