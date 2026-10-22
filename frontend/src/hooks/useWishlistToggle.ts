import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";

/**
 * One wishlist toggle shared by product cards, the product page and the
 * cart ("move to wishlist"). Wishlist is server-side only (existing
 * /wishlist API), so guests are prompted to log in.
 */
export function useWishlistToggle(productId: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: wishlist } = useWishlist();
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  const isWishlisted = !!productId && !!wishlist?.some((p) => p._id === productId);

  const promptLogin = () =>
    toast("Log in to save your favourites", {
      action: {
        label: "Log in",
        onClick: () => navigate("/login", { state: { from: location.pathname } }),
      },
    });

  const toggle = () => {
    if (!productId) return;
    if (!isAuthenticated) return promptLogin();
    if (isWishlisted) remove.mutate(productId);
    else add.mutate(productId);
  };

  /** Adds without toggling off (used by "move to wishlist"). */
  const addOnly = (opts?: { onSuccess?: () => void }) => {
    if (!productId) return;
    if (!isAuthenticated) return promptLogin();
    if (isWishlisted) return opts?.onSuccess?.();
    add.mutate(productId, { onSuccess: () => opts?.onSuccess?.() });
  };

  return { isWishlisted, toggle, addOnly, isPending: add.isPending || remove.isPending, isAuthenticated };
}
