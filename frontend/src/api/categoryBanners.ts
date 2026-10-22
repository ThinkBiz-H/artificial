import { apiClient } from "./client";
import type { ApiEnvelope, CategoryBanner } from "@/types";

export const categoryBannersApi = {
  byCategory: (categoryId: string) =>
    apiClient
      .get<ApiEnvelope<{ banner: CategoryBanner | null }>>(`/category-banners/by-category/${categoryId}`)
      .then((r) => r.data),
};
