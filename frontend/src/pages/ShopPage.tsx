import { useSearchParams } from "react-router-dom";
import { useCategoryTree } from "@/hooks/useCatalog";
import { sortForMenu } from "@/components/layout/nav";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { Category } from "@/types";
import { CategoryDetailPage } from "./CategoryDetailPage";
import { ProductListingPage } from "./ProductListingPage";

/** A category anywhere in the tree, by slug or id. */
function findCategory(nodes: Category[], key: string): Category | undefined {
  for (const n of nodes) {
    if (n.slug === key || n._id === key) return n;
    const hit = findCategory(n.children ?? [], key);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * /shop, /categories (and /products?category=…): the same page a category
 * opened from Home shows — search, main categories, sub-category image
 * cards, then products. Opens on ?category=<slug|id>, otherwise on the first
 * active main category in the admin's order.
 */
export function ShopPage() {
  const [params] = useSearchParams();
  const { data: tree, isLoading, isError, refetch } = useCategoryTree();
  const wanted = params.get("category");

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !tree) {
    return (
      <div className="container-x py-10" aria-busy>
        <Skeleton className="h-12 w-full max-w-2xl rounded-pill" />
        <div className="mt-6 flex gap-5 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-[68px] flex-none rounded-full" />
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  const roots = sortForMenu(tree.filter((c) => c.status === "active"));
  const slug = (wanted && findCategory(tree, wanted)?.slug) || roots[0]?.slug;
  if (!slug) return <EmptyState title="Collections coming soon" description="We're curating something beautiful. Please check back shortly." />;

  return <CategoryDetailPage key={slug} slug={slug} />;
}

/**
 * /products: plain "Shop" (optionally ?category=…) opens the Shop page;
 * any other filter (brand, sale, sort, price…) keeps the full listing.
 */
export function ProductsEntryPage() {
  const [params] = useSearchParams();
  const onlyCategory = [...params.keys()].every((k) => k === "category");
  return onlyCategory ? <ShopPage /> : <ProductListingPage />;
}
