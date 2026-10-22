import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/api/wishlist";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const WISHLIST_KEY = ["wishlist"];
const CART_KEY = ["cart"];

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => wishlistApi.get(),
    enabled: isAuthenticated,
    select: (res) => res.data.wishlist,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.add(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast.success("Added to wishlist");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast.success("Removed from wishlist");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useMoveToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...rest }: { productId: string; quantity?: number; color?: string; size?: string; variantId?: string }) =>
      wishlistApi.moveToCart(productId, rest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WISHLIST_KEY });
      qc.invalidateQueries({ queryKey: CART_KEY });
      toast.success("Moved to cart");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
