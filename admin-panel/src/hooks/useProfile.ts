import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useAdminProfile() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({ queryKey: ["admin-profile"], queryFn: () => userApi.getProfile(), enabled: isAuthenticated, select: (r) => r.data.user });
}

export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
      setUser(res.data.user);
      toast.success("Profile updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadAdminAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userApi.uploadProfileImage(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Photo updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
