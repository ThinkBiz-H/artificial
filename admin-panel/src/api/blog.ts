import { apiClient } from "./client";
import type { ApiEnvelope, Blog, BlogCategory, BlogCategorySeo, BlogSeo } from "@/types";
import { toFormData } from "@/lib/utils";

export interface BlogFormValues {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  relatedBlogs?: string[];
  status?: "draft" | "published" | "scheduled";
  publishedAt?: string;
  seo?: BlogSeo;
  featuredImage?: File;
}

export const blogApi = {
  list: (params: { keyword?: string; status?: string; category?: string } = {}) =>
    apiClient.get<ApiEnvelope<{ blogs: Blog[]; count: number }>>("/admin/blogs", { params }).then((r) => r.data),

  byId: (id: string) => apiClient.get<ApiEnvelope<{ blog: Blog }>>(`/admin/blogs/${id}`).then((r) => r.data),

  create: (values: BlogFormValues) => {
    const { featuredImage, ...rest } = values;
    const form = toFormData(rest);
    if (featuredImage) form.append("featuredImage", featuredImage);
    return apiClient
      .post<ApiEnvelope<{ blog: Blog }>>("/admin/blogs", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<BlogFormValues>) => {
    const { featuredImage, ...rest } = values;
    const form = toFormData(rest);
    if (featuredImage) form.append("featuredImage", featuredImage);
    return apiClient
      .put<ApiEnvelope<{ blog: Blog }>>(`/admin/blogs/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  setStatus: (id: string, status: string, publishedAt?: string) =>
    apiClient.patch<ApiEnvelope<{ blog: Blog }>>(`/admin/blogs/${id}/status`, { status, publishedAt }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/blogs/${id}`).then((r) => r.data),

  // Blog categories
  categories: () => apiClient.get<ApiEnvelope<{ categories: BlogCategory[] }>>("/blogs/categories").then((r) => r.data),
  createCategory: (values: { name: string; description?: string; status?: string; seo?: BlogCategorySeo }) =>
    apiClient.post<ApiEnvelope<{ category: BlogCategory }>>("/admin/blog-categories", values).then((r) => r.data),
  updateCategory: (id: string, values: Partial<{ name: string; description?: string; status?: string; seo?: BlogCategorySeo }>) =>
    apiClient.put<ApiEnvelope<{ category: BlogCategory }>>(`/admin/blog-categories/${id}`, values).then((r) => r.data),
  removeCategory: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/blog-categories/${id}`).then((r) => r.data),
};
