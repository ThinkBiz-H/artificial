import { apiClient } from "./client";
import type { ApiEnvelope, Blog, BlogCategory } from "@/types";

export const blogApi = {
  // GET /api/v1/blogs
  list: (
    params: {
      keyword?: string;
      category?: string;
      tag?: string;
      page?: number;
      limit?: number;
    } = {},
  ) =>
    apiClient
      .get<
        ApiEnvelope<{
          blogs: Blog[];
          total: number;
          page: number;
          totalPages: number;
        }>
      >("/blogs", { params })
      .then((r) => r.data),

  // GET /api/v1/blogs/:slug
  bySlug: (slug: string) =>
    apiClient
      .get<ApiEnvelope<{ blog: Blog; related: Blog[] }>>(`/blogs/${slug}`)
      .then((r) => r.data),

  // GET /api/v1/blogs/categories
  categories: () =>
    apiClient
      .get<ApiEnvelope<{ categories: BlogCategory[] }>>("/blogs/categories")
      .then((r) => r.data),
};
