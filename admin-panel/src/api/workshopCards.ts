import { apiClient } from "./client";
import type { ApiEnvelope, WorkshopCard } from "@/types";
import { toFormData } from "@/lib/utils";

export interface WorkshopCardFormValues {
  heading: string;
  shortDescription?: string;
  order?: number;
  isActive?: boolean;
  image?: File;
}

export const workshopCardsApi = {
  list: () =>
    apiClient.get<ApiEnvelope<{ cards: WorkshopCard[]; count: number }>>("/admin/workshop-cards").then((r) => r.data),

  create: (values: WorkshopCardFormValues) => {
    const { image, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    return apiClient
      .post<ApiEnvelope<{ card: WorkshopCard }>>("/admin/workshop-cards", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<WorkshopCardFormValues>) => {
    const { image, ...rest } = values;
    const form = toFormData(rest);
    if (image) form.append("image", image);
    return apiClient
      .put<ApiEnvelope<{ card: WorkshopCard }>>(`/admin/workshop-cards/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  reorder: (order: string[]) =>
    apiClient.patch<ApiEnvelope<{ cards: WorkshopCard[] }>>("/admin/workshop-cards/reorder", { order }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/admin/workshop-cards/${id}`).then((r) => r.data),
};
