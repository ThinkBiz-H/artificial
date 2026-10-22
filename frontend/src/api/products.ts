import { apiClient } from "./client";
import type { ApiEnvelope, Product, Pagination, Review, Variant } from "@/types";

export interface ProductListParams {
  keyword?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
  sort?: string;
  price?: Record<string, number>;
  [key: string]: unknown;
}

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiClient
      .get<ApiEnvelope<{ products: Product[]; pagination: Pagination }>>("/products", { params })
      .then((r) => r.data),

  featured: () =>
    apiClient.get<ApiEnvelope<{ products: Product[] }>>("/products/featured/list").then((r) => r.data),

  newArrivals: () =>
    apiClient.get<ApiEnvelope<{ products: Product[] }>>("/products/new-arrivals/list").then((r) => r.data),

  trending: (limit?: number) =>
    apiClient
      .get<ApiEnvelope<{ products: Product[] }>>("/products/trending/list", { params: { limit } })
      .then((r) => r.data),

  bestsellers: (limit?: number) =>
    apiClient
      .get<ApiEnvelope<{ products: Product[] }>>("/products/bestsellers/list", { params: { limit } })
      .then((r) => r.data),

  topRated: (limit?: number) =>
    apiClient
      .get<ApiEnvelope<{ products: Product[] }>>("/products/top-rated/list", { params: { limit } })
      .then((r) => r.data),

  recentlyViewed: () =>
    apiClient
      .get<ApiEnvelope<{ items: { product: Product; viewedAt: string }[] }>>("/products/me/recently-viewed")
      .then((r) => r.data),

  bySlug: (slug: string) =>
    apiClient.get<ApiEnvelope<{ product: Product }>>(`/products/${slug}`).then((r) => r.data),

  related: (id: string) =>
    apiClient.get<ApiEnvelope<{ products: Product[] }>>(`/products/${id}/related`).then((r) => r.data),

  relatedByBrand: (id: string) =>
    apiClient.get<ApiEnvelope<{ products: Product[] }>>(`/products/${id}/related-by-brand`).then((r) => r.data),

  trackView: (id: string) =>
    apiClient.post<ApiEnvelope<{}>>(`/products/${id}/view`).then((r) => r.data),

  variants: (productId: string) =>
    apiClient
      .get<ApiEnvelope<{ variants: Variant[] }>>(`/products/${productId}/variants`)
      .then((r) => r.data),

  // Reviews
  getReviews: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ reviews: Review[]; rating: number; numReviews: number; distribution: { star: number; count: number; percentage: number }[] }>>(
        `/products/${id}/reviews`,
      )
      .then((r) => r.data),

  ratingDistribution: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ rating: number; numReviews: number; distribution: { star: number; count: number; percentage: number }[] }>>(
        `/products/${id}/reviews/rating-distribution`,
      )
      .then((r) => r.data),

  addReview: (id: string, payload: { rating: number; comment?: string }) =>
    apiClient
      .post<ApiEnvelope<{ reviews: Review[]; rating: number }>>(`/products/${id}/reviews`, payload)
      .then((r) => r.data),

  editReview: (id: string, reviewId: string, payload: { rating?: number; comment?: string }) =>
    apiClient
      .put<ApiEnvelope<{ reviews: Review[]; rating: number }>>(`/products/${id}/reviews/${reviewId}`, payload)
      .then((r) => r.data),

  deleteReview: (id: string, reviewId: string) =>
    apiClient
      .delete<ApiEnvelope<{ reviews: Review[]; rating: number }>>(`/products/${id}/reviews/${reviewId}`)
      .then((r) => r.data),
};
