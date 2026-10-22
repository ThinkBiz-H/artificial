import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { useBrands } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PageHeader } from "@/components/common/PageHeader";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Reveal } from "@/components/common/Reveal";

export function BrandsPage() {
  const { data: brands, isLoading, isError, refetch } = useBrands();
  const active = (brands ?? []).filter((b) => b.status !== "inactive");
  const crumbs = [{ name: "Home", path: "/" }, { name: "Brands", path: "/brands" }];

  return (
    <>
      <Seo title="Brands" description="Shop jewellery by brand." jsonLd={breadcrumbJsonLd(crumbs)} />
      <PageHeader eyebrow="Makers & labels" title="Shop by Brand" crumbs={crumbs} />
      <div className="container-x py-12 sm:py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : active.length === 0 ? (
          <EmptyState icon={<Award className="h-7 w-7" strokeWidth={1.25} />} title="No brands yet" description="Explore our collections in the meantime." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {active.map((brand, i) => (
              <Reveal key={brand._id} delay={(i % 5) * 0.04}>
                <Link
                  to={`/brands/${brand.slug}`}
                  className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-card border border-border bg-surface p-6 transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:shadow-soft"
                >
                  {brand.logo?.url ? (
                    <img src={brand.logo.url} alt={brand.name} loading="lazy" className="max-h-16 max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="font-display text-2xl font-semibold text-fg">{brand.name}</span>
                  )}
                  {brand.logo?.url && <span className="font-sub text-sm text-fg-muted">{brand.name}</span>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
