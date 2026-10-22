import { useSearchParams } from "react-router-dom";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";

function headingFor(sp: URLSearchParams, mode: "listing" | "search") {
  const q = sp.get("q");

  if (mode === "search") {
    return {
      eyebrow: "Search",
      title: q ? `"${q}"` : "Search",
      description: q
        ? undefined
        : "Use the search bar to find earrings, necklaces, bangles and more.",
    };
  }

  if (sp.get("sale") === "1") {
    return {
      eyebrow: "Limited Time",
      title: "Sale",
      description: "Beautiful jewellery at special prices.",
    };
  }

  switch (sp.get("sort")) {
    case "-createdAt":
      return {
        eyebrow: "Just Landed",
        title: "New Arrivals",
        description: "The latest designs, fresh from our collections.",
      };

    case "-salesCount":
      return {
        eyebrow: "Most Loved",
        title: "Best Sellers",
        description: "The pieces our customers can't stop wearing.",
      };

    default:
      return {
        eyebrow: "The Collection",
        title: "All Jewellery",
        description: "Explore necklaces, earrings, rings, bangles and more.",
      };
  }
}

export function ProductListingPage({
  mode = "listing",
}: {
  mode?: "listing" | "search";
}) {
  const [searchParams] = useSearchParams();

  const { eyebrow, title, description } = headingFor(searchParams, mode);

  const crumbs = [{ name: "Home", path: "/" }, { name: title }];

  return (
    <>
      <Seo
        title={title}
        description={description}
        noindex={mode === "search"}
        canonicalPath={mode === "search" ? "/search" : "/products"}
        jsonLd={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: title, path: "/products" },
        ])}
      />

      {/* Products */}
      <CatalogView title={title} eyebrow={eyebrow} description={description} crumbs={crumbs} />
    </>
  );
}
