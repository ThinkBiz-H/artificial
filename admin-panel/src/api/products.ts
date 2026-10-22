import { apiClient } from "./client";
import type { ApiEnvelope, ImageRef, Product, Pagination, Variant } from "@/types";
import { toFormData } from "@/lib/utils";

/** Variant create/update body: `images` are new uploads, `pickedImages` reuse the product's existing photos. */
export type VariantPayload = Omit<Partial<Variant>, "images"> & { images?: File[]; pickedImages?: ImageRef[] };

/**
 * toFormData() drops empty strings (so optional ids like `brand` aren't sent
 * blank). For free-text fields the admin may clear, send them explicitly —
 * the backend treats "" as "clear this value".
 */
function withClearableText(form: FormData, values: Record<string, unknown>, keys: string[] = ["metal", "plating"]) {
  keys.forEach((key) => {
    if (typeof values[key] === "string") form.set(key, values[key] as string);
  });
  return form;
}

export interface ProductListParams {
  keyword?: string;
  category?: string;
  brand?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: unknown;
}

export interface ProductFormValues {
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  SKU?: string;
  category: string;
  brand?: string;
  unit?: string;
  unitValue?: number;
  price: number;
  salePrice?: number;
  gstRate?: number;
  priceIncludesGST?: boolean;
  stock: number;
  tags?: string[];
  attributes?: { key: string; value: string }[];
  colors?: string[];
  colorOptions?: { name: string; hex: string; images: ImageRef[] }[];
  sizes?: string[];
  metal?: string;
  plating?: string;
  weight?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  warranty?: string;
  returnPolicy?: string;
  featured?: boolean;
  status?: string;
  seoTitle?: string;
  seoDescription?: string;
  images?: File[];
}

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiClient.get<ApiEnvelope<{ products: Product[]; pagination: Pagination }>>("/products", { params }).then((r) => r.data),

  byId: (id: string) => apiClient.get<ApiEnvelope<{ product: Product }>>(`/products/id/${id}`).then((r) => r.data),

  create: (values: ProductFormValues) => {
    const { images, ...rest } = values;
    const form = withClearableText(toFormData(rest), rest);
    (images || []).forEach((file) => form.append("images", file));
    return apiClient
      .post<ApiEnvelope<{ product: Product }>>("/products", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  update: (id: string, values: Partial<ProductFormValues>) => {
    const { images, ...rest } = values;
    const form = withClearableText(toFormData(rest), rest);
    (images || []).forEach((file) => form.append("images", file));
    return apiClient
      .put<ApiEnvelope<{ product: Product }>>(`/products/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },

  remove: (id: string) => apiClient.delete<ApiEnvelope<{}>>(`/products/${id}`).then((r) => r.data),

  restore: (id: string) => apiClient.patch<ApiEnvelope<{ product: Product }>>(`/products/${id}/restore`).then((r) => r.data),

  removeImage: (id: string, publicId: string) =>
    // publicId is a Cloudinary id like "ecommerce/products/abc123" — it contains
    // slashes, so it must be percent-encoded to survive as a single path segment.
    apiClient
      .delete<ApiEnvelope<{ product: Product }>>(`/products/${id}/images/${encodeURIComponent(publicId)}`)
      .then((r) => r.data),

  // Variants
  listVariants: (productId: string) =>
    apiClient.get<ApiEnvelope<{ variants: Variant[] }>>(`/products/${productId}/variants`).then((r) => r.data),

  createVariant: (productId: string, values: VariantPayload) => {
    const { images, pickedImages, ...rest } = values;
    const form = toFormData(rest);
    if (pickedImages) form.append("images", JSON.stringify(pickedImages));
    (images || []).forEach((file) => form.append("images", file));
    return apiClient
      .post<ApiEnvelope<{ variant: Variant }>>(`/products/${productId}/variants`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  updateVariant: (productId: string, variantId: string, values: VariantPayload) => {
    const { images, pickedImages, ...rest } = values;
    const form = withClearableText(toFormData(rest), rest, ["color", "size"]);
    if (pickedImages) form.append("images", JSON.stringify(pickedImages));
    (images || []).forEach((file) => form.append("images", file));
    return apiClient
      .put<ApiEnvelope<{ variant: Variant }>>(`/products/${productId}/variants/${variantId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteVariant: (productId: string, variantId: string) =>
    apiClient.delete<ApiEnvelope<{}>>(`/products/${productId}/variants/${variantId}`).then((r) => r.data),

  // Reviews (moderation)
  getReviews: (productId: string) =>
    apiClient
      .get<ApiEnvelope<{ reviews: import("@/types").Review[]; rating: number; numReviews: number }>>(`/products/${productId}/reviews`)
      .then((r) => r.data),

  deleteReview: (productId: string, reviewId: string) =>
    apiClient.delete<ApiEnvelope<{ reviews: import("@/types").Review[]; rating: number }>>(`/products/${productId}/reviews/${reviewId}`).then((r) => r.data),
};
