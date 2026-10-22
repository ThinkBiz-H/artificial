import { apiClient } from "./client";

export const pageApi = {
  list: () =>
    apiClient.get("/pages").then((res) => res.data),

  bySlug: (slug: string) =>
    apiClient.get(`/pages/${slug}`).then((res) => res.data),
};