import { apiClient } from "./client";
import type { ApiEnvelope, User, Address } from "@/types";

export const userApi = {
  getProfile: () => apiClient.get<ApiEnvelope<{ user: User }>>("/users/profile").then((r) => r.data),

  updateProfile: (payload: Partial<Pick<User, "name" | "mobile" | "city" | "state" | "country" | "pincode">>) =>
    apiClient.put<ApiEnvelope<{ user: User }>>("/users/profile", payload).then((r) => r.data),

  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return apiClient
      .post<ApiEnvelope<{ profileImage: { url: string; publicId: string } }>>("/users/profile/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteAccount: () => apiClient.delete<ApiEnvelope<{}>>("/users/account").then((r) => r.data),

  getAddresses: () => apiClient.get<ApiEnvelope<{ addresses: Address[] }>>("/users/address").then((r) => r.data),

  addAddress: (payload: Omit<Address, "_id" | "createdAt" | "updatedAt">) =>
    apiClient.post<ApiEnvelope<{ address: Address[] }>>("/users/address", payload).then((r) => r.data),

  updateAddress: (addressId: string, payload: Partial<Address>) =>
    apiClient
      .put<ApiEnvelope<{ address: Address[] }>>(`/users/address/${addressId}`, payload)
      .then((r) => r.data),

  deleteAddress: (addressId: string) =>
    apiClient.delete<ApiEnvelope<{ address: Address[] }>>(`/users/address/${addressId}`).then((r) => r.data),
};
