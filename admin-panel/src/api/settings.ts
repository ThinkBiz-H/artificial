import { apiClient } from "./client";
import type { ApiEnvelope, Settings, EnvironmentStatus } from "@/types";

export const settingsApi = {
  get: () => apiClient.get<ApiEnvelope<{ settings: Settings }>>("/admin/settings").then((r) => r.data),
  update: (values: Record<string, unknown>) =>
    apiClient.put<ApiEnvelope<{ settings: Settings }>>("/admin/settings", values).then((r) => r.data),
  updateLogo: (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return apiClient
      .put<ApiEnvelope<{ logo: { url: string; publicId: string } }>>("/admin/settings/logo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  updateFavicon: (file: File) => {
    const form = new FormData();
    form.append("favicon", file);
    return apiClient
      .put<ApiEnvelope<{ favicon: { url: string; publicId: string } }>>("/admin/settings/favicon", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  environmentStatus: () =>
    apiClient.get<ApiEnvelope<{ environment: EnvironmentStatus }>>("/admin/settings/environment-status").then((r) => r.data),
};
