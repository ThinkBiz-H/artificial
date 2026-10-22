import { useMemo } from "react";
import { useCategoryTree } from "@/hooks/useCatalog";
import {
  useBestSellers,
  useFeaturedProducts,
  useNewArrivals,
  useTopRated,
} from "@/hooks/useProducts";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { productImage } from "@/lib/utils";
import type { Product } from "@/types";
import { Seo } from "@/components/common/Seo";
import { ProductRail } from "@/components/product/ProductRail";
import { ReelsSection } from "@/components/common/ReelsSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import {
  TrendingCollections,
  pickCollections,
} from "@/components/home/TrendingCollections";
import { ShopByOccasion } from "@/components/home/ShopByOccasion";
import { CampaignBanner } from "@/components/home/CampaignBanner";
import { CollectionFeature } from "@/components/home/CollectionFeature";
import { BestSellers } from "@/components/home/BestSellers";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { Lookbook } from "@/components/home/Lookbook";
import { EditorialSplit } from "@/components/home/EditorialSplit";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ShopByCategory } from "@/components/home/ShopByPrice";
import { FeaturedBrands } from "@/components/home/FeaturedBrands";
import {
  findCategoryByKeyword,
  flattenCategories,
  useHomeContent,
} from "@/components/home/homeData";
import { SHOP_LINKS, sortForMenu } from "@/components/layout/nav";

/** Merges product lists in priority order, de-duplicated. */
function mergeLists(max: number, ...lists: (Product[] | undefined)[]) {
  const seen = new Set<string>();
  return lists
    .flatMap((l) => l ?? [])
    .filter((p) => (seen.has(p._id) ? false : (seen.add(p._id), true)))
    .slice(0, max);
}

/*
 * Editorial homepage. Section order follows the Swastikala brief:
 * hero → categories → collections → occasions → best sellers → campaign →
 * new arrivals → bridal → everyday → price → brands → reviews → Instagram →
 * video → brand story → newsletter. Every section reads live data (admin
 * Homepage Builder, categories, brands, products, reviews) and hides itself
 * when there is nothing real to show.
 */
export function HomePage() {
  const { siteName, tagline, social, logo } = useStoreInfo();
  const { find, isLoading: loadingSections } = useHomeContent();
  const { data: tree = [], isLoading: loadingCategories } = useCategoryTree();
  const { data: newArrivals, isLoading: loadingNew } = useNewArrivals();
  const { data: bestsellers, isLoading: loadingBest } = useBestSellers(8);
  const { data: featured } = useFeaturedProducts();
  const { data: topRated } = useTopRated(8);

  // ---- Admin-managed sections (exact `type` strings from the Homepage Builder) ----
  const hero = find("hero");
  const campaign = find("cta");
  const videoBanner = find("video-banner");
  const reels = find("reels");
  const brandStory = find("about-preview", "story", "brand-story");
  const whyChoose = find("why-choose");
  const instagram = find("instagram-gallery");

  // ---- Catalogue-derived content ----
  const topLevel = useMemo(
    () => sortForMenu(tree.filter((c) => c.status === "active")),
    [tree],
  );
  const allCategories = useMemo(() => flattenCategories(topLevel), [topLevel]);
  const collections = useMemo(
    () =>
      pickCollections(
        allCategories,
        new Set(topLevel.slice(0, 8).map((c) => c._id)),
      ),
    [allCategories, topLevel],
  );
  const bridal = useMemo(
    () => findCategoryByKeyword(allCategories, ["bridal", "wedding", "dulhan"]),
    [allCategories],
  );
  const everyday = useMemo(
    () =>
      findCategoryByKeyword(
        allCategories.filter((c) => c._id !== bridal?._id),
        ["everyday", "daily", "office", "minimal", "casual"],
      ),
    [allCategories, bridal],
  );

  // Sales-driven lists are empty on a new store — fall back to other real lists.
  const bestList = bestsellers?.length
    ? bestsellers
    : topRated?.length
      ? topRated
      : featured;
  const campaignProducts = useMemo(
    () => mergeLists(3, featured, bestsellers, newArrivals),
    [featured, bestsellers, newArrivals],
  );

  const storyImage =
    brandStory?.image?.url ||
    collections[1]?.image?.url ||
    topLevel.find((c) => c.image?.url)?.image?.url;
  const storySecondary = newArrivals?.[1]
    ? productImage(newArrivals[1])
    : undefined;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const sameAs = Object.values(social).filter(
    (v): v is string => !!v && /^https?:/i.test(v),
  );

  return (
    <>
      <Seo
        description={
          tagline ||
          "Discover premium artificial jewellery — necklaces, earrings, jhumkas, bangles, rings and bridal sets designed to make every moment unforgettable."
        }
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: origin,
            ...(logo ? { logo } : {}),
            ...(sameAs.length ? { sameAs } : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: origin,
            potentialAction: {
              "@type": "SearchAction",
              target: `${origin}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />

      {/* Luxury hero slider (under the transparent sticky header) */}
      <HeroBanner
        section={hero}
        products={newArrivals}
        isLoading={loadingNew}
        sectionsLoading={loadingSections}
      />

      {/* Featured categories */}
      <CategoryShowcase categories={topLevel} isLoading={loadingCategories} />

      {/* Trending collections */}
      <TrendingCollections collections={collections} />

      {/* Shop by occasion */}
      <ShopByOccasion categories={allCategories} />

      {/* Best sellers */}
      <BestSellers
        products={bestList}
        isLoading={loadingBest}
        viewAllTo={SHOP_LINKS.bestSellers}
      />

      {/* Luxury campaign banner — admin CTA, else an editorial campaign from real products */}
      <CampaignBanner section={campaign} fallbackProducts={campaignProducts} />

      {/* New arrivals */}
      <ProductRail
        eyebrow="Just landed"
        title="New Arrivals"
        description="Fresh designs, added this season."
        products={newArrivals}
        isLoading={loadingNew}
        viewAllTo={SHOP_LINKS.newArrivals}
      />

      {/* Bridal & everyday collections (shown when those categories exist) */}
      <CollectionFeature
        category={bridal}
        eyebrow="The bridal edit"
        fallbackTitle="For Your Most Memorable Day"
        fallbackText="Heirloom-inspired sets designed for every ritual, from haldi to the reception."
        tone="beige"
      />
      <CollectionFeature
        category={everyday}
        eyebrow="Everyday luxe"
        fallbackTitle="Effortless, Every Day"
        fallbackText="Lightweight pieces that move from desk to dinner with ease."
        reverse
      />

      {/* Shop by price */}
      <ShopByCategory categories={topLevel} isLoading={loadingCategories} />

      {/* Featured brands */}
      <FeaturedBrands />

      {/* Customer reviews */}
      <CustomerReviews />

      {/* Instagram gallery */}
      <Lookbook section={instagram} products={newArrivals} />

      {/* Video section — admin "Video Banner", then admin reels */}
      <CampaignBanner section={videoBanner} />
      {reels && (
        <ReelsSection
          title={reels.title || "Watch & Shop"}
          subtitle={reels.subtitle}
          reels={reels.reels}
          videos={reels.videos}
        />
      )}

      {/* Brand story */}
      {/* <EditorialSplit
        reverse
        tone="beige"
        image={storyImage}
        imageAlt={`${siteName} jewellery`}
        secondaryImage={storySecondary}
        eyebrow={brandStory?.subtitle || "Our story"}
        title={brandStory?.title || "Crafted to Be Treasured"}
        body={
          brandStory?.content ||
          `${siteName} brings together the artistry of Indian jewellery traditions and the ease of modern design — pieces that look precious, feel comfortable and are made to be worn often.\n\nFrom intricate bridal sets to everyday studs, every design is chosen for its finish, its detail and the way it makes you feel.`
        }
        ctaLabel={brandStory?.button?.label || "Discover our story"}
        ctaTo={brandStory?.button?.link || "/about"}
      /> */}
      <WhyChooseUs section={whyChoose} />

      {/* Newsletter */}
      <NewsletterSection />
    </>
  );
}
