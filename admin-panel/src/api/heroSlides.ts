import { apiClient } from "./client";
import type { ApiEnvelope, HomeSection } from "@/types";
import { toFormData } from "@/lib/utils";

export interface HeroSlideFormValues {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  order?: number;
  active?: boolean;
  desktopImage?: File;
  mobileImage?: File;
}

export const heroSlidesApi = {
  create: (sectionId: string, values: HeroSlideFormValues) => {
    const { desktopImage, mobileImage, ...rest } = values;
    const form = toFormData(rest);
    if (desktopImage) form.append("desktopImage", desktopImage);
    if (mobileImage) form.append("mobileImage", mobileImage);
    return apiClient
      .post<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/slides`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (sectionId: string, slideId: string, values: Partial<HeroSlideFormValues>) => {
    const { desktopImage, mobileImage, ...rest } = values;
    const form = toFormData(rest);
    if (desktopImage) form.append("desktopImage", desktopImage);
    if (mobileImage) form.append("mobileImage", mobileImage);
    return apiClient
      .put<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/slides/${slideId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  remove: (sectionId: string, slideId: string) =>
    apiClient.delete<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/slides/${slideId}`).then((r) => r.data),

  reorder: (sectionId: string, order: string[]) =>
    apiClient
      .patch<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/slides/reorder`, { order })
      .then((r) => r.data),
};
