import { useParams } from "react-router-dom";
import { useCategory } from "@/hooks/useCatalog";
import { useCategoryBanner } from "@/hooks/useCategoryBanner";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { SmartLink } from "@/components/common/SmartLink";
import { buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { truncate } from "@/lib/utils";
import type { Category, CategoryBanner as Banner } from "@/types";

/** Admin category banner (Admin > Category Banners) as an editorial hero. */
function CategoryHero({ banner, fallbackTitle }: { banner: Banner; fallbackTitle: string }) {
  const desktop = banner.desktopImage!.url;
  const mobile = banner.mobileImage?.url || desktop;
  const hasCopy = !!(banner.title || banner.subtitle || banner.description);
  return (
    <section className="relative overflow-hidden bg-primary">
      <picture>
        <source media="(max-width: 767px)" srcSet={mobile} />
        <img src={desktop} alt={banner.title || fallbackTitle} fetchPriority="high" className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[440px]" />
      </picture>
      {hasCopy && (
        <div className="absolute inset-0 flex items-end bg-fg/30 sm:items-center">
          <div className="container-x pb-10 text-fg-inverse sm:pb-0">
            {banner.subtitle && <p className="text-label font-semibold uppercase tracking-eyebrow text-fg-inverse/85">{banner.subtitle}</p>}
            {banner.title && <p className="mt-3 max-w-xl font-display text-5xl font-semibold leading-display sm:text-6xl">{banner.title}</p>}
            {banner.description && <p className="mt-4 max-w-lg text-sm text-fg-inverse/85 sm:text-base">{banner.description}</p>}
            {banner.buttonText && banner.buttonLink && (
              <SmartLink to={banner.buttonLink} className={buttonClasses({ variant: "light", className: "mt-6" })}>
                {banner.buttonText}
              </SmartLink>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading, isError, refetch } = useCategory(slug);
  const { data: banner } = useCategoryBanner(category?._id);

  if (isError) return <ErrorState title="Collection not found" description="This collection may have moved. Explore our other collections." onRetry={() => refetch()} />;

  if (isLoading || !category) {
    return (
      <div className="container-x py-10">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-6 h-12 w-72" />
        <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const ancestors = (category.ancestors ?? []).filter((a): a is Category => typeof a === "object" && !!a?.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/categories" },
    ...ancestors.map((a) => ({ name: a.name, path: `/categories/${a.slug}` })),
    { name: category.name, path: `/categories/${category.slug}` },
  ];

  return (
    <>
      <Seo
        title={`${category.name} — Shop Online`}
        description={truncate(
          category.description || `Shop ${category.name.toLowerCase()} online — premium artificial jewellery with easy returns and secure payments.`,
        )}
        image={category.image?.url}
        canonicalPath={`/categories/${category.slug}`}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <CatalogView
        key={category._id}
        title={category.name}
        eyebrow={category.shortTitle || "Collection"}
        description={category.description}
        crumbs={crumbs}
        category={category}
        banner={banner?.desktopImage?.url ? <CategoryHero banner={banner} fallbackTitle={category.name} /> : undefined}
      />
    </>
  );
}
