import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { brandApi, type BrandAdminView, type BrandSlot } from "@/api/brand";
import { getErrorMessage } from "@/lib/utils";

/** "brand" = the public payload the admin shell uses; "admin-brand" = the editor. Realtime refreshes both. */
export const BRAND_KEYS = { public: ["brand"] as const, admin: ["admin-brand"] as const };

/** Bundled fallback when no logo is configured in Brand Management. */
export const FALLBACK_LOGO = `${import.meta.env.BASE_URL}logo.jpeg`;

/** Brand for the admin shell (sidebar logo, login logo, title, favicon). */
export function usePublicBrand() {
  return useQuery({ queryKey: BRAND_KEYS.public, queryFn: brandApi.publicBrand, select: (r) => r.data.brand, staleTime: 5 * 60_000 });
}

export function useBrandAdmin() {
  return useQuery({ queryKey: BRAND_KEYS.admin, queryFn: brandApi.get, select: (r) => r.data });
}

/** Every brand mutation returns the fresh editor view — write it straight into the cache. */
function useBrandMutation<TVars>(fn: (vars: TVars) => Promise<{ data: BrandAdminView; message: string }>, quiet = false) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      qc.setQueryData(BRAND_KEYS.admin, r);
      qc.invalidateQueries({ queryKey: BRAND_KEYS.public });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["brand-versions"] });
      if (!quiet) toast.success(r.message);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export const useUpdateBrand = () => useBrandMutation(brandApi.update);
export const useUploadBrandAsset = () => useBrandMutation(({ slot, file }: { slot: BrandSlot; file: File }) => brandApi.upload(slot, file));
export const useBrandAssetFromMedia = () => useBrandMutation(({ slot, mediaId }: { slot: BrandSlot; mediaId: string }) => brandApi.useMedia(slot, mediaId));
export const useRemoveBrandAsset = () => useBrandMutation((slot: BrandSlot) => brandApi.remove(slot));
export const useRestoreBrandAsset = () => useBrandMutation(({ slot, versionId }: { slot: BrandSlot; versionId: string }) => brandApi.restore(slot, versionId));
export const useResetBrand = () => useBrandMutation((sections: ("theme" | "logos")[]) => brandApi.reset(sections));
export const useImportBrand = () => useBrandMutation(brandApi.importFile);

export function useBrandVersions(slot: BrandSlot | null) {
  return useQuery({
    queryKey: ["brand-versions", slot],
    queryFn: () => brandApi.versions(slot as BrandSlot),
    enabled: !!slot,
    select: (r) => r.data.versions,
  });
}

/** URL for a brand logo slot (admin Brand Management), or the bundled logo. */
export function useBrandLogo(slot: BrandSlot = "adminLogo") {
  const { data } = usePublicBrand();
  return data?.logos?.[slot] || FALLBACK_LOGO;
}

/** Brand name for titles, with a sensible default while loading. */
export function useBrandName() {
  const { data } = usePublicBrand();
  return data?.company?.brandName || "Abj Jewellery";
}
