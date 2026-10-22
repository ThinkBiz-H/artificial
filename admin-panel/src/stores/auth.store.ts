import { create } from "zustand";
import type { AdminUser } from "@/types";
import { setAccessToken } from "@/api/client";

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: AdminUser | null) => void;
  logout: () => void;
  setInitializing: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
  setInitializing: (v) => set({ isInitializing: v }),
}));

/** Returns true if the current admin has no restrictions, or explicitly has `perm`. */
export function hasPermission(perm: string): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  if (!user.permissions || user.permissions.length === 0) return true;
  return user.permissions.includes(perm);
}
