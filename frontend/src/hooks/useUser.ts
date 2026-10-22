import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type { Address } from "@/types";

export function useProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userApi.getProfile(),
    enabled: isAuthenticated,
    select: (res) => res.data.user,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setUser(res.data.user);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.uploadProfileImage(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile photo updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useAddresses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => userApi.getAddresses(),
    enabled: isAuthenticated,
    select: (res) => res.data.addresses,
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Address, "_id" | "createdAt" | "updatedAt">) => userApi.addAddress(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ addressId, payload }: { addressId: string; payload: Partial<Address> }) =>
      userApi.updateAddress(addressId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (addressId: string) => userApi.deleteAddress(addressId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
