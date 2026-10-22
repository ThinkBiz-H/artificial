import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type ProductListParams,
  type ProductFormValues,
  type VariantPayload,
} from "@/api/products";
import type { ApiEnvelope, Product } from "@/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export function useProductList(params: ProductListParams) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => productsApi.list(params),
    select: (r) => r.data,
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => productsApi.byId(id as string),
    enabled: !!id,
    select: (r) => r.data.product,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ProductFormValues) => productsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<ProductFormValues>) =>
      productsApi.update(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success("Product updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRestoreProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product restored");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRemoveProductImage(productId: string) {
  const qc = useQueryClient();
  const queryKey = ["admin-product", productId];

  return useMutation({
    mutationFn: (publicId: string) =>
      productsApi.removeImage(productId, publicId),
    // Optimistically strip the image from the cached product so the preview
    // updates instantly, before the server round-trip completes.
    onMutate: async (publicId: string) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<ApiEnvelope<{ product: Product }>>(queryKey);
      if (previous?.data?.product) {
        qc.setQueryData<ApiEnvelope<{ product: Product }>>(queryKey, {
          ...previous,
          data: {
            ...previous.data,
            product: {
              ...previous.data.product,
              images: previous.data.product.images.filter((img) => img.publicId !== publicId),
            },
          },
        });
      }
      return { previous };
    },
    onError: (err, _publicId, context) => {
      if (context?.previous) qc.setQueryData(queryKey, context.previous);
      toast.error(getErrorMessage(err));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast.success("Image removed");
    },
  });
}

export function useVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ["admin-variants", productId],
    queryFn: () => productsApi.listVariants(productId as string),
    enabled: !!productId,
    select: (r) => r.data.variants,
  });
}

export function useCreateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: VariantPayload) =>
      productsApi.createVariant(productId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
      qc.invalidateQueries({ queryKey: ["admin-product", productId] });
      toast.success("Variant added");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      values,
    }: {
      variantId: string;
      values: VariantPayload;
    }) => productsApi.updateVariant(productId, variantId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
      toast.success("Variant updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) =>
      productsApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
      qc.invalidateQueries({ queryKey: ["admin-product", productId] });
      toast.success("Variant deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["admin-product-reviews", productId],
    queryFn: () => productsApi.getReviews(productId as string),
    enabled: !!productId,
    select: (r) => r.data,
  });
}

export function useDeleteProductReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      productsApi.deleteReview(productId, reviewId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-product-reviews", productId] });
      toast.success("Review deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
