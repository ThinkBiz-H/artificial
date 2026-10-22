import { apiClient } from "./client";
import type { ApiEnvelope, Media, MediaFolder } from "@/types";

export const mediaApi = {
  listFolders: () => apiClient.get<ApiEnvelope<{ folders: MediaFolder[] }>>("/admin/media/folders").then((r) => r.data),
  createFolder: (name: string, parent?: string) =>
    apiClient.post<ApiEnvelope<{ folder: MediaFolder }>>("/admin/media/folders", { name, parent }).then((r) => r.data),
  updateFolder: (id: string, values: { name?: string; parent?: string | null }) =>
    apiClient.put<ApiEnvelope<{ folder: MediaFolder }>>(`/admin/media/folders/${id}`, values).then((r) => r.data),
  deleteFolder: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/media/folders/${id}`).then((r) => r.data),

  list: (params: { folderId?: string; type?: string; keyword?: string; page?: number; limit?: number } = {}) =>
    apiClient
      .get<ApiEnvelope<{ media: Media[]; total: number; page: number; totalPages: number }>>("/admin/media", { params })
      .then((r) => r.data),

  upload: (files: File[], folderId?: string) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (folderId) form.append("folderId", folderId);
    return apiClient
      .post<ApiEnvelope<{ media: Media[]; count: number }>>("/admin/media/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  update: (id: string, values: { tags?: string[]; folderId?: string | null }) =>
    apiClient.put<ApiEnvelope<{ media: Media }>>(`/admin/media/${id}`, values).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/media/${id}`).then((r) => r.data),
};
