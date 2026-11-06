import { Link } from "react-router-dom";
import { useCategoryTree } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Reveal } from "@/components/common/Reveal";
import { CategoryCard } from "@/components/home/CategoryCard";
import { sortForMenu } from "@/components/layout/nav";
import { SubCategoryGrid } from "@/components/catalog/SubCategoryGrid";

/** All collections — the admin's category tree, top-level first with their subcategories. */
export function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategoryTree();
  const categories = sortForMenu((data ?? []).filter((c) => c.status === "active"));
  const crumbs = [{ name: "Home", path: "/" }, { name: "Collections", path: "/collections" }];

  return (
    <div className="container-x py-10 sm:py-14">
      <Seo title="All Collections" description="Explore every jewellery collection — earrings, necklaces, bangles, rings, bridal sets and more." jsonLd={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-6 max-w-2xl">
        <p className="eyebrow">Browse</p>
        <h1 className="mt-2 font-display text-5xl font-semibold leading-display text-fg sm:text-6xl">All Collections</h1>
        <p className="mt-4 text-base text-fg-muted">From everyday studs to heirloom bridal sets — find your next favourite piece.</p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-t-panel" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState title="Collections coming soon" description="We're curating something beautiful. Please check back shortly." />
      ) : (
        <>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c._id} delay={(i % 4) * 0.05}>
                <CategoryCard category={c} />
              </Reveal>
            ))}
          </div>

          <div className="mt-20 space-y-16 border-t border-border pt-14">
            {categories
              .filter((c) => c.children?.some((ch) => ch.status === "active"))
              .map((c) => (
                <section key={c._id} aria-labelledby={`subs-${c._id}`}>
                  <div className="mb-8 flex items-end justify-between gap-4">
                    <h2 id={`subs-${c._id}`} className="font-display text-3xl font-semibold text-fg">
                      {c.name}
                    </h2>
                    <Link
                      to={`/categories/${c.slug}?view=all`}
                      className="flex-none text-[11px] font-semibold uppercase tracking-[0.2em] text-fg underline decoration-gold-deep underline-offset-8 hover:text-primary"
                    >
                      View all
                    </Link>
                  </div>
                  <SubCategoryGrid categories={c.children ?? []} />
                </section>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
