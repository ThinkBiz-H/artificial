import { Link } from "react-router-dom";
import { useCategoryTree } from "@/hooks/useCatalog";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/** Sorts by admin menu order, then name — mirrors the backend's tree ordering. */
export function sortForMenu(categories: Category[]) {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Active categories from the admin tree; `header` = those flagged "show in header". */
export function useMenuCategories() {
  const { data: tree = [], isLoading } = useCategoryTree();
  const all = sortForMenu(tree.filter((c) => c.status === "active"));
  const header = all.filter((c) => c.showInHeader !== false);
  return { all, header, isLoading };
}

/** Fixed storefront links around the admin-managed category menu. */
export const SHOP_LINKS = {
  newArrivals: "/new-arrivals",
  bestSellers: "/best-sellers",
  sale: "/sale",
};

export const BRAND_TAGLINE = "Premium Artificial Jewellery";

/** Store logo — the image already carries the brand name, so no text wordmark beside it. `tagline` adds the italic line beneath, as in the header. */
export function Brand({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  const { siteName, logo } = useStoreInfo();
  return (
    <Link to="/" className={cn("flex min-w-0 flex-col items-center", className)} aria-label={`${siteName} home`}>
      <img
        src={logo}
        alt={siteName}
        width={1264}
        height={843}
        className="h-12 w-auto max-w-full flex-none object-contain sm:h-14 lg:h-16"
      />
      {tagline && (
        <span className="mt-1.5 hidden whitespace-nowrap font-sub text-[11px] tracking-[0.16em] text-accent sm:block">{BRAND_TAGLINE}</span>
      )}
    </Link>
  );
}
