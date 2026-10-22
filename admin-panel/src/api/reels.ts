import { apiClient } from "./client";
import type { ApiEnvelope, HomeSection } from "@/types";
import { toFormData } from "@/lib/utils";

export interface ReelFormValues {
  title?: string;
  link?: string;
  order?: number;
  active?: boolean;
  video?: File;
  thumbnail?: File;
}

export const reelsApi = {
  create: (sectionId: string, values: ReelFormValues) => {
    const { video, thumbnail, ...rest } = values;
    const form = toFormData(rest);
    if (video) form.append("video", video);
    if (thumbnail) form.append("thumbnail", thumbnail);
    return apiClient
      .post<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/reels`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (sectionId: string, reelId: string, values: Partial<ReelFormValues>) => {
    const { video, thumbnail, ...rest } = values;
    const form = toFormData(rest);
    if (video) form.append("video", video);
    if (thumbnail) form.append("thumbnail", thumbnail);
    return apiClient
      .put<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/reels/${reelId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  remove: (sectionId: string, reelId: string) =>
    apiClient.delete<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/reels/${reelId}`).then((r) => r.data),

  reorder: (sectionId: string, order: string[]) =>
    apiClient
      .patch<ApiEnvelope<{ section: HomeSection }>>(`/admin/home-sections/${sectionId}/reels/reorder`, { order })
      .then((r) => r.data),
};
