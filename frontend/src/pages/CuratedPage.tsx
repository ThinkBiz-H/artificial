import { CatalogView } from "@/components/catalog/CatalogView";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";

type Kind = "new" | "best" | "sale";

const CONFIG: Record<Kind, { path: string; eyebrow: string; title: string; description: string; preset: Record<string, string> }> = {
  new: {
    path: "/new-arrivals",
    eyebrow: "Just landed",
    title: "New Arrivals",
    description: "The latest designs, fresh from our collections — be the first to wear them.",
    preset: { sort: "-createdAt" },
  },
  best: {
    path: "/best-sellers",
    eyebrow: "Most loved",
    title: "Best Sellers",
    description: "The pieces our customers return to again and again.",
    preset: { sort: "-salesCount" },
  },
  sale: {
    path: "/sale",
    eyebrow: "Limited time",
    title: "The Sale",
    description: "Beautiful pieces at special prices — while they last.",
    preset: { sale: "1" },
  },
};

export function CuratedPage({ kind }: { kind: Kind }) {
  const c = CONFIG[kind];
  const crumbs = [{ name: "Home", path: "/" }, { name: c.title, path: c.path }];

  return (
    <>
      <Seo title={c.title} description={c.description} canonicalPath={c.path} jsonLd={breadcrumbJsonLd(crumbs)} />
      <CatalogView title={c.title} eyebrow={c.eyebrow} crumbs={crumbs} preset={c.preset} />
    </>
  );
}

export const NewArrivalsPage = () => <CuratedPage kind="new" />;
export const BestSellersPage = () => <CuratedPage kind="best" />;
export const SalePage = () => <CuratedPage kind="sale" />;
