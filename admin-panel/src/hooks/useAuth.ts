import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, type LoginPayload } from "@/api/auth";
import { useAuthStore } from "@/stores/auth.store";
import { setAccessToken } from "@/api/client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (data.data.user.role !== "admin") {
        setAccessToken(null);
        toast.error("This account does not have admin access.");
        return;
      }

      // ⭐ Missing
      setAccessToken(data.data.accessToken);

      setUser(data.data.user);

      toast.success("Welcome back!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      toast.success("Logged out");
    },
    onError: () => logout(),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
    enabled,
    retry: false,
  });
}

/** Silently restores the admin session on app load via the refresh-token cookie. */
export async function tryRestoreSession() {
  try {
    const res = await authApi.refreshToken();
    setAccessToken(res.data.accessToken);
    const me = await authApi.getMe();
    if (me.data.user.role !== "admin") {
      setAccessToken(null);
      useAuthStore.getState().setUser(null);
    } else {
      useAuthStore.getState().setUser(me.data.user);
    }
  } catch {
    setAccessToken(null);
    useAuthStore.getState().setUser(null);
  } finally {
    useAuthStore.getState().setInitializing(false);
  }
}
