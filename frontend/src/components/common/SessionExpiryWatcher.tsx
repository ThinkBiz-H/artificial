import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

/**
 * When a logged-in session genuinely ends (refresh token rejected), tell the
 * shopper and take them to log in, returning to the page they were on.
 * Without this the header, bag and checkout silently switch to the (empty)
 * guest cart, which reads as "my bag was emptied" — the server-side bag is
 * intact and comes back right after logging in.
 */
export function SessionExpiryWatcher() {
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const acknowledge = useAuthStore((s) => s.acknowledgeSessionExpired);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionExpired) return;
    acknowledge();
    toast.info("Your session expired. Please log in again — your bag is saved.", { id: "session-expired" });
    if (location.pathname !== "/login") {
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
    }
  }, [sessionExpired, acknowledge, navigate, location.pathname, location.search]);

  return null;
}
