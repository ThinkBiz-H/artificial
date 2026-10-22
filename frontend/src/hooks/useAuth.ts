import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth.store";
import { isSessionRejected, mayHaveSession, refreshSession, setAccessToken } from "@/api/client";
import { getErrorMessage } from "@/lib/utils";
import { useMergeGuestCartIntoServer } from "@/hooks/useCart";

export function useMobileLoginRequestOtp() {
  return useMutation({
    mutationFn: (payload: { mobile: string }) =>
      authApi.mobileLoginRequestOtp(payload),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useMobileLoginVerifyOtp() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const mergeGuestCart = useMergeGuestCartIntoServer();

  return useMutation({
    mutationFn: (payload: { mobile: string; otp: string }) =>
      authApi.mobileLoginVerifyOtp(payload),
    onSuccess: async (data) => {
      setUser(data.data.user);
      await mergeGuestCart.mutateAsync();
      qc.invalidateQueries();
      toast.success("Welcome back!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: () => {
      logout();
      qc.clear();
      toast.success("Logged out");
      navigate("/login");
    },

    onError: () => {
      logout();
      qc.clear();
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          MOBILE RESET PASSWORD                             */
/* -------------------------------------------------------------------------- */

export function useForgotPasswordMobile() {
  return useMutation({
    mutationFn: (payload: { mobile: string }) =>
      authApi.forgotPasswordMobile(payload),

    onSuccess: () =>
      toast.success("OTP sent to your registered mobile number."),

    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: (payload: { mobile: string; otp: string }) =>
      authApi.verifyResetOtp(payload),

    onSuccess: () => toast.success("OTP verified successfully."),

    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useResetPasswordMobile() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: { mobile: string; otp: string; password: string }) =>
      authApi.resetPasswordMobile(payload),

    onSuccess: () => {
      toast.success("Password updated successfully.");
      navigate("/login");
    },

    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

/* -------------------------------------------------------------------------- */
/*                    OLD EMAIL RESET (KEEP FOR COMPATIBILITY)                */
/* -------------------------------------------------------------------------- */

export const useForgotPassword = useForgotPasswordMobile;
export const useResetPassword = useResetPasswordMobile;

/* -------------------------------------------------------------------------- */

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),

    onSuccess: () => toast.success("Password changed successfully."),

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

/**
 * Restores the session on page load from the refresh cookie. Uses the shared
 * single-flight refresh, so React StrictMode's double effect (dev) or any
 * concurrent 401 never fires a second, racing refresh.
 */
export async function tryRestoreSession() {
  // Known guest (logged out / session rejected earlier): nothing to restore.
  if (!mayHaveSession()) {
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setInitializing(false);
    return;
  }
  try {
    await refreshSession();
    const me = await authApi.getMe();
    useAuthStore.getState().setUser(me.data.user);
  } catch (err) {
    // No cookie / rejected cookie → guest. A network failure also leaves the
    // visitor as a guest for now, but the server session is untouched, so a
    // reload restores it.
    if (isSessionRejected(err)) setAccessToken(null);
    useAuthStore.getState().setUser(null);
  } finally {
    useAuthStore.getState().setInitializing(false);
  }
}
