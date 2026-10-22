import { apiClient } from "./client";
import type { ApiEnvelope, CategoryBanner } from "@/types";
import { toFormData } from "@/lib/utils";

export interface CategoryBannerFormValues {
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  categories: string[];
  priority?: number;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  desktopImage?: File;
  mobileImage?: File;
}

export const categoryBannersApi = {
  list: () =>
    apiClient
      .get<ApiEnvelope<{ banners: CategoryBanner[]; count: number }>>("/category-banners")
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiEnvelope<{ banner: CategoryBanner }>>(`/category-banners/${id}`)
      .then((r) => r.data),

  create: (values: CategoryBannerFormValues) => {
    const { desktopImage, mobileImage, ...rest } = values;
    const form = toFormData(rest);
    if (desktopImage) form.append("desktopImage", desktopImage);
    if (mobileImage) form.append("mobileImage", mobileImage);
    return apiClient
      .post<ApiEnvelope<{ banner: CategoryBanner }>>("/category-banners", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<CategoryBannerFormValues>) => {
    const { desktopImage, mobileImage, ...rest } = values;
    const form = toFormData(rest);
    if (desktopImage) form.append("desktopImage", desktopImage);
    if (mobileImage) form.append("mobileImage", mobileImage);
    return apiClient
      .put<ApiEnvelope<{ banner: CategoryBanner }>>(`/category-banners/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  remove: (id: string) =>
    apiClient.delete<ApiEnvelope<{}>>(`/category-banners/${id}`).then((r) => r.data),
};
