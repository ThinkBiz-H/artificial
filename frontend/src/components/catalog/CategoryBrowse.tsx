import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category, Product } from "@/types";
import { useCategoryTree } from "@/hooks/useCatalog";
import { useProductList } from "@/hooks/useProducts";
import { Breadcrumbs, type Crumb } from "@/components/common/Breadcrumbs";
import { Reveal } from "@/components/common/Reveal";
import { ProductGrid } from "@/components/product/ProductGrid";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CategorySearchStrip, SubCategoryCards } from "./SubCategoryCards";

const FRAME = "mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10";
const PREVIEW = 10;

/** Up to 10 products of a category: the admin's Featured ones first, topped up with the newest. */
function usePreviewProducts(categoryId: string) {
  const featured = useProductList({ category: categoryId, featured: true, limit: PREVIEW });
  const latest = useProductList({ category: categoryId, sort: "-createdAt", limit: PREVIEW });
  const products = useMemo(() => {
    const seen = new Set<string>();
    return [...(featured.data?.products ?? []), ...(latest.data?.products ?? [])]
      .filter((p: Product) => (seen.has(p._id) ? false : (seen.add(p._id), true)))
      .slice(0, PREVIEW);
  }, [featured.data, latest.data]);
  return { products, total: latest.data?.pagination?.total, isLoading: featured.isLoading || latest.isLoading };
}

/**
 * Main category page (e.g. /categories/earrings), Flipkart + Yes Madam style:
 * search → main categories → sub-category image cards, then 6–10 featured
 * products of the selected sub-category, refreshed in place. "View all" (or
 * tapping the selected card again) opens that sub-category's full listing.
 */
export function CategoryBrowse({ category, crumbs, eyebrow, banner }: { category: Category; crumbs: Crumb[]; eyebrow?: string; banner?: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: tree = [] } = useCategoryTree();
  const [selected, setSelected] = useState<Category | null>(null);
  const { products, total, isLoading } = usePreviewProducts(selected?._id ?? category._id);
  const viewAllHref = selected ? `/categories/${selected.slug}` : `/categories/${category.slug}?view=all`;
  const heading = selected ? selected.name : `All ${category.name}`;

  const onSelect = (sub: Category | null) => {
    // Tapping the selected card again opens its full listing.
    if ((sub?._id ?? null) === (selected?._id ?? null)) return navigate(viewAllHref);
    setSelected(sub);
  };

  return (
    <div>
      {banner}

      <section className="relative overflow-hidden border-b border-border bg-cream">
        <div className="catalog-pattern pointer-events-none absolute inset-y-0 right-0 w-full sm:w-2/3" aria-hidden />
        <Reveal className={cn(FRAME, "relative py-10 sm:py-14")}>
          <Breadcrumbs items={crumbs} className="text-[11px] uppercase tracking-[0.2em]" />
          <CategorySearchStrip tree={tree} currentId={category._id} />
          {eyebrow && <p className="eyebrow ornament mt-8">{eyebrow}</p>}
          <h1 className="mt-4 max-w-4xl font-display text-[32px] font-semibold leading-[1.05] text-fg sm:text-[40px] lg:text-[52px]">{category.name}</h1>
          {category.description && <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">{category.description}</p>}
          <SubCategoryCards group={category} selectedId={selected?._id} onSelect={onSelect} />
        </Reveal>
      </section>

      <section className={cn(FRAME, "py-10 sm:py-14")} aria-live="polite">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured designs</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-fg sm:text-4xl">{heading}</h2>
          </div>
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg underline decoration-gold-deep underline-offset-8 transition-colors hover:text-primary"
          >
            View all{typeof total === "number" ? ` ${total}` : ""} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <div key={selected?._id ?? "all"} className="animate-fade-up">
          <ProductGrid
            products={isLoading ? undefined : products}
            isLoading={isLoading}
            skeletonCount={6}
            emptyTitle="No pieces here yet"
            emptyDescription="New designs are added regularly — explore another style meanwhile."
          />
        </div>

        {products.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link to={viewAllHref} className={buttonClasses({ variant: "outline", size: "lg" })}>
              View all {heading}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
