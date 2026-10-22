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

/** Store logo + wordmark (Admin > Settings). `tagline` adds the italic line beneath, as in the header. */
export function Brand({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  const { siteName, logo } = useStoreInfo();
  return (
    <Link to="/" className={cn("flex min-w-0 flex-col items-center", className)} aria-label={`${siteName} home`}>
      <span className="flex min-w-0 items-center gap-2 sm:gap-3">
        {logo && <img src={logo} alt="" width={40} height={40} className="h-7 w-7 flex-none object-contain sm:h-9 sm:w-9 lg:h-10 lg:w-10" />}
        {/* Negative right margin offsets the trailing letter-spacing so the wordmark centres optically. */}
        <span className="-mr-[0.3em] truncate font-display text-xl font-semibold uppercase leading-none tracking-[0.22em] text-fg sm:text-[28px] sm:tracking-[0.3em] lg:text-[32px]">
          {siteName}
        </span>
      </span>
      {tagline && (
        <span className="mt-1.5 hidden whitespace-nowrap font-sub text-[11px] tracking-[0.16em] text-accent sm:block">{BRAND_TAGLINE}</span>
      )}
    </Link>
  );
}
