import { apiClient } from "./client";
import type { ApiEnvelope, AdminUser } from "@/types";

export const userApi = {
  getProfile: () => apiClient.get<ApiEnvelope<{ user: AdminUser }>>("/users/profile").then((r) => r.data),
  updateProfile: (payload: Partial<Pick<AdminUser, "name" | "mobile">>) =>
    apiClient.put<ApiEnvelope<{ user: AdminUser }>>("/users/profile", payload).then((r) => r.data),
  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return apiClient
      .post<ApiEnvelope<{ profileImage: { url: string; publicId: string } }>>("/users/profile/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
