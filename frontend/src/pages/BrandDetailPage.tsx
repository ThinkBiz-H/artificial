import { useParams } from "react-router-dom";
import { useBrand } from "@/hooks/useCatalog";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";

/** Brand page — the shared catalogue (filters, sort, pagination) pinned to one brand. */
export function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: brand, isLoading, isError, refetch } = useBrand(slug);

  if (isError) return <ErrorState title="Brand not found" onRetry={() => refetch()} />;
  if (isLoading || !brand) {
    return (
      <div className="container-x py-10">
        <Skeleton className="h-12 w-64" />
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Brands", path: "/brands" },
    { name: brand.name, path: `/brands/${brand.slug}` },
  ];

  return (
    <>
      <Seo title={brand.name} description={`Shop ${brand.name} jewellery online.`} image={brand.logo?.url} jsonLd={breadcrumbJsonLd(crumbs)} />
      <CatalogView
        key={brand._id}
        title={brand.name}
        eyebrow="Brand"
        crumbs={crumbs}
        preset={{ brand: brand._id }}
        banner={
          brand.logo?.url ? (
            <div className="container-x pt-6">
              <div className="flex items-center justify-center rounded-panel bg-surface py-10 shadow-soft">
                <img src={brand.logo.url} alt={brand.name} className="max-h-24 max-w-[60%] object-contain" />
              </div>
            </div>
          ) : undefined
        }
      />
    </>
  );
}
