import { apiClient } from "./client";
import type { ApiEnvelope, Blog, BlogCategory } from "@/types";

export type BlogSort = "latest" | "popular" | "trending" | "liked";

export interface BlogListParams {
  keyword?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
  sort?: BlogSort;
  featured?: boolean;
  trending?: boolean;
}

/** Neighbouring posts for in-article navigation. */
export type BlogNav = Pick<Blog, "_id" | "title" | "slug" | "featuredImage" | "publishedAt" | "readingTime"> | null;

export interface BlogHighlights {
  featured: Blog[];
  trending: Blog[];
  popular: Blog[];
  tags: { tag: string; count: number }[];
  /** category id → number of published posts */
  categoryCounts: Record<string, number>;
}

export const blogApi = {
  // GET /api/v1/blogs
  list: (params: BlogListParams = {}) =>
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
      .get<ApiEnvelope<{ blog: Blog; related: Blog[]; prev?: BlogNav; next?: BlogNav }>>(`/blogs/${slug}`)
      .then((r) => r.data),

  // GET /api/v1/blogs/categories
  categories: () =>
    apiClient
      .get<ApiEnvelope<{ categories: BlogCategory[] }>>("/blogs/categories")
      .then((r) => r.data),

  // GET /api/v1/blogs/highlights — featured / trending / popular / tags
  highlights: () => apiClient.get<ApiEnvelope<BlogHighlights>>("/blogs/highlights").then((r) => r.data),

  // POST /api/v1/blogs/:slug/like
  like: (slug: string, liked: boolean) =>
    apiClient.post<ApiEnvelope<{ likeCount: number; liked: boolean }>>(`/blogs/${slug}/like`, { liked }).then((r) => r.data),
};
