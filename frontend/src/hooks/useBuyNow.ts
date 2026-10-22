import { useNavigate } from "react-router-dom";
import { useAddToCart } from "./useCart";
import type { Product, Variant } from "@/types";

export function useBuyNow() {
  const navigate = useNavigate();
  const addToCart = useAddToCart();

  const buyNow = (params: {
    product: Product;
    variant?: Variant | null;
    quantity: number;
    color?: string;
    colorHex?: string;
    size?: string;
  }) => {
    addToCart.mutate(
      {
        product: params.product,
        variant: params.variant,
        productId: params.product._id,
        quantity: params.quantity,
        variantId: params.variant?._id,
        color: params.color,
        colorHex: params.colorHex,
        size: params.size,
      },
      {
        onSuccess: () => navigate("/checkout"),
      },
    );
  };

  return { buyNow, isLoading: addToCart.isPending };
}
