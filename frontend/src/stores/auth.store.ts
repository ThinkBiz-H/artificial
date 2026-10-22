import { create } from "zustand";
import type { User } from "@/types";
import { setAccessToken, setSessionExpiredHandler } from "@/api/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  /** Set when a logged-in session ended because the refresh token was rejected (not a user logout). */
  sessionExpired: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setInitializing: (v: boolean) => void;
  acknowledgeSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  sessionExpired: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, ...(user ? { sessionExpired: false } : {}) }),
  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
  setInitializing: (v) => set({ isInitializing: v }),
  acknowledgeSessionExpired: () => set({ sessionExpired: false }),
}));

// When the API client finds the refresh token rejected, the session is over:
// drop the user (the UI switches to guest mode) and flag it, so
// SessionExpiryWatcher can send the shopper to log in — their server-side
// bag is untouched and returns as soon as they do.
setSessionExpiredHandler(() => {
  const { isAuthenticated, logout } = useAuthStore.getState();
  logout();
  if (isAuthenticated) useAuthStore.setState({ sessionExpired: true });
});
