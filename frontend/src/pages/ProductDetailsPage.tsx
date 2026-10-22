import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Banknote,
  Check,
  Heart,
  RotateCcw,
  Share2,
  ShieldCheck,
  TicketPercent,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBestSellers,
  useFeaturedProducts,
  useNewArrivals,
  useProduct,
  useRelatedProducts,
  useTrackView,
  useTrendingProducts,
} from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useRecentlyViewedStore } from "@/stores/recentlyViewed.store";
import {
  cn,
  discountPercent,
  effectivePrice,
  formatCurrency,
  isNewProduct,
  stripHtml,
  truncate,
} from "@/lib/utils";
import type { Category, ColorOption, Product, Variant } from "@/types";
import { findColorOption, productColorOptions, variantColor, variantSize } from "@/lib/itemOptions";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { RatingStars } from "@/components/ui/RatingStars";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { AccordionItem } from "@/components/ui/Accordion";
import { ProductPrice } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRail } from "@/components/product/ProductRail";
import { ProductReviews } from "@/components/product/ProductReviews";
import { SHOP_LINKS } from "@/components/layout/nav";
import { DeliveryCheck } from "@/components/product/DeliveryCheck";
import { FrequentlyBoughtTogether } from "@/components/product/FrequentlyBoughtTogether";
import { sanitizeBlogHtml as sanitize } from "@/lib/blogHtml";

const CARE_TIPS = [
  "Put your jewellery on last — after perfume, lotion and hairspray — and take it off first.",
  "Keep it away from water, sweat and chemicals; remove before bathing, swimming or workouts.",
  "Wipe gently with a soft, dry cloth after each wear to keep the finish bright.",
  "Store each piece separately in its pouch or an airtight box, away from humidity.",
];
const eq = (a?: string, b?: string) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
/** Colour and size get dedicated selectors; any other variant attribute keeps generic buttons. */
const isColorOrSize = (key: string) => ["color", "colour", "size"].includes(key.trim().toLowerCase());

/** Max cards per recommendation rail. */
const RAIL_SIZE = 8;

interface RailSpec {
  key: string;
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllTo?: string;
}
interface Offer {
  icon: React.ReactNode;
  title: string;
  text: string;
}

/** Offer cards built only from live store settings (Admin > Settings) — never invented promotions. */
function OfferCards({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;
  return (
    <section aria-labelledby="pdp-offers" className="mt-6">
      <h2
        id="pdp-offers"
        className="text-xs font-semibold uppercase tracking-label text-fg"
      >
        Offers & benefits
      </h2>
      <ul className="no-scrollbar -mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0">
        {offers.map((o) => (
          <li
            key={o.title}
            className="gold-shine flex w-[min(78%,240px)] flex-none snap-start items-start gap-3 sm:w-auto rounded-card border border-dashed border-accent-soft/70 bg-canvas p-4"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface text-accent shadow-sm">
              {o.icon}
            </span>
            <span>
              <span className="block text-sm font-semibold text-fg">
                {o.title}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-fg-muted">
                {o.text}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PdpSkeleton() {
  return (
    <div className="container-x py-8">
      <Skeleton className="h-3 w-56" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <Skeleton className="aspect-[4/5] w-full rounded-image" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openCart = useUiStore((s) => s.setCartDrawerOpen);
  const addRecent = useRecentlyViewedStore((s) => s.add);
  const recent = useRecentlyViewedStore((s) => s.items);
  const store = useStoreInfo();

  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    {},
  );

  const trackView = useTrackView();
  const addToCart = useAddToCart();
  const { buyNow, isLoading: buying } = useBuyNow();
  const wishlist = useWishlistToggle(product?._id);
  const { data: relatedProducts, isLoading: loadingRelated } =
    useRelatedProducts(product?._id);
  // Same React Query keys as the homepage, so these are usually already cached.
  const { data: bestSellers } = useBestSellers(RAIL_SIZE);
  const { data: newArrivals } = useNewArrivals();
  const { data: trending } = useTrendingProducts(RAIL_SIZE);
  const { data: featured } = useFeaturedProducts();

  /*
   * Recommendation rails, in display order. Every product appears at most
   * once across the page (and never the product being viewed); a rail left
   * with no products is dropped rather than rendered empty.
   */
  const rails = useMemo<RailSpec[]>(() => {
    if (!product) return [];
    const isFull = (p: Product | string): p is Product =>
      typeof p === "object" && !!p?._id;
    // Complete-the-look items arrive partially populated (no variant info),
    // so their quick-add opens the product page instead of guessing a variant.
    const crossSell = (product.crossSell ?? [])
      .filter(isFull)
      .map((p) => ({ ...p, hasVariants: p.hasVariants ?? true }));
    const plan: RailSpec[] = [
      {
        key: "related",
        eyebrow: "Inspired for you",
        title: "You May Also Like",
        products: relatedProducts ?? [],
      },
      {
        key: "recent",
        eyebrow: "Picked up where you left",
        title: "Recently Viewed",
        products: recent,
      },
      {
        key: "best",
        eyebrow: "Most loved",
        title: "Best Sellers",
        products: bestSellers ?? [],
        viewAllTo: SHOP_LINKS.bestSellers,
      },

     
      
      {
        key: "look",
        eyebrow: "Complete the look",
        title: "Complete the Look",
        products: crossSell,
      },
    ];
    const seen = new Set<string>([product._id]);
    return plan
      .map((rail) => ({
        ...rail,
        products: rail.products
          .filter((p) => (seen.has(p._id) ? false : (seen.add(p._id), true)))
          .slice(0, RAIL_SIZE),
      }))
      .filter((rail) => rail.products.length > 0);
  }, [
    product,
    relatedProducts,
    recent,
    bestSellers,
    newArrivals,
    trending,
    featured,
  ]);

  useEffect(() => {
    if (!product?._id) return;
    // Server-side view tracking (feeds "Trending") is an authenticated endpoint.
    if (isAuthenticated) trackView.mutate(product._id);
    addRecent(product);
    setQuantity(product.minOrderQuantity || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  // ---- Options: colour swatches, sizes, and any other variant attributes ----
  const activeVariants = useMemo(() => (product?.variants ?? []).filter((v) => v.status !== "inactive"), [product]);
  const usesVariants = !!product?.hasVariants && activeVariants.length > 0;

  /** Colours on offer: from the variants when there are some, else the product's colour options. */
  const colorChoices = useMemo<ColorOption[]>(() => {
    if (!product) return [];
    if (!usesVariants) return productColorOptions(product);
    const names = [...new Set(activeVariants.map((v) => variantColor(v)).filter(Boolean))];
    return names.map((name) => {
      const option = findColorOption(product, name);
      const withHex = activeVariants.find((v) => eq(variantColor(v), name) && v.colorHex);
      return { name, hex: withHex?.colorHex || option?.hex, images: option?.images };
    });
  }, [product, usesVariants, activeVariants]);

  const sizeChoices = useMemo<string[]>(() => {
    if (!product) return [];
    if (!usesVariants) return product.sizes ?? [];
    return [...new Set(activeVariants.map((v) => variantSize(v)).filter(Boolean))];
  }, [product, usesVariants, activeVariants]);

  const otherKeys = useMemo(() => {
    if (!usesVariants) return [];
    return [...new Set(activeVariants.flatMap((v) => v.attributes.map((a) => a.key)).filter((k) => !isColorOrSize(k)))];
  }, [usesVariants, activeVariants]);

  const otherOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    otherKeys.forEach((key) => {
      map[key] = [...new Set(activeVariants.map((v) => v.attributes.find((a) => a.key === key)?.value).filter((x): x is string => !!x))];
    });
    return map;
  }, [otherKeys, activeVariants]);

  // Preselect the default variant (or, for simple products, the first colour / the only size).
  useEffect(() => {
    if (!product) return;
    const def = activeVariants.find((v) => v.isDefault) || activeVariants[0];
    if (usesVariants && def) {
      const next: Record<string, string> = {};
      const c = variantColor(def);
      const sz = variantSize(def);
      if (c) next.color = c;
      if (sz) next.size = sz;
      def.attributes.forEach((a) => {
        if (!isColorOrSize(a.key)) next[a.key] = a.value;
      });
      setSelectedAttrs(next);
      return;
    }
    const colours = productColorOptions(product);
    setSelectedAttrs({
      ...(colours.length ? { color: colours[0].name } : {}),
      ...(product.sizes?.length === 1 ? { size: product.sizes[0] } : {}),
    });
  }, [product, usesVariants, activeVariants]);

  /** Does an in-stock variant exist for this colour/size (others as currently selected)? */
  const inStock = (pick: { color?: string; size?: string }) =>
    activeVariants.some(
      (v) =>
        v.stock > 0 &&
        (!pick.color || eq(variantColor(v), pick.color)) &&
        (!pick.size || eq(variantSize(v), pick.size)) &&
        otherKeys.every((k) => !selectedAttrs[k] || v.attributes.find((a) => a.key === k)?.value === selectedAttrs[k]),
    );

  const matchedVariant: Variant | undefined = useMemo(() => {
    if (!usesVariants) return undefined;
    if (colorChoices.length && !selectedAttrs.color) return undefined;
    if (sizeChoices.length && !selectedAttrs.size) return undefined;
    if (otherKeys.some((k) => !selectedAttrs[k])) return undefined;
    return activeVariants.find(
      (v) =>
        (!colorChoices.length || eq(variantColor(v), selectedAttrs.color)) &&
        (!sizeChoices.length || eq(variantSize(v), selectedAttrs.size)) &&
        otherKeys.every((k) => v.attributes.find((a) => a.key === k)?.value === selectedAttrs[k]),
    );
  }, [usesVariants, colorChoices, sizeChoices, otherKeys, activeVariants, selectedAttrs]);

  /** Picking a colour keeps the size when that combination exists, else jumps to an in-stock size. */
  const pickColor = (name: string) => {
    setSelectedAttrs((prev) => {
      const next: Record<string, string> = { ...prev, color: name };
      if (usesVariants && sizeChoices.length && prev.size && !activeVariants.some((v) => eq(variantColor(v), name) && eq(variantSize(v), prev.size))) {
        const fallback = sizeChoices.find((sz) => inStock({ color: name, size: sz })) ?? sizeChoices.find((sz) => activeVariants.some((v) => eq(variantColor(v), name) && eq(variantSize(v), sz)));
        if (fallback) next.size = fallback;
      }
      return next;
    });
  };

  if (isLoading) return <PdpSkeleton />;
  if (isError || !product)
    return (
      <ErrorState
        title="Product not found"
        description="This piece may no longer be available. Explore our latest collections instead."
        onRetry={() => refetch()}
      />
    );

  const baseImages = product.images?.length
    ? product.images
    : product.thumbnail
      ? [product.thumbnail]
      : [];
  // Selecting a colour updates the gallery: variant image → colour gallery →
  // any variant of that colour → the product's own images.
  const colorGallery = colorChoices.find((c) => eq(c.name, selectedAttrs.color))?.images;
  const colorVariantImages = activeVariants.find((v) => eq(variantColor(v), selectedAttrs.color) && v.images?.length)?.images;
  const images = matchedVariant?.images?.length
    ? matchedVariant.images
    : colorGallery?.length
      ? colorGallery
      : colorVariantImages?.length
        ? colorVariantImages
        : baseImages;
  const price = matchedVariant
    ? effectivePrice(matchedVariant)
    : effectivePrice(product);
  const mrp = matchedVariant?.price ?? product.price;
  const discount = discountPercent(
    mrp,
    matchedVariant?.salePrice ?? product.salePrice,
  );
  const stock = usesVariants ? (matchedVariant?.stock ?? 0) : product.stock;
  const canAddToCart = usesVariants ? !!matchedVariant && stock > 0 : stock > 0;
  const category =
    typeof product.category === "object"
      ? (product.category as Category)
      : undefined;
  const brand = typeof product.brand === "object" ? product.brand : undefined;
  const sku = matchedVariant?.sku || product.SKU;
  const color = selectedAttrs.color || undefined;
  const size = selectedAttrs.size || undefined;
  const colorHex = colorChoices.find((c) => eq(c.name, color))?.hex;
  // Simple (variant-less) products with several colours/sizes still need a choice.
  const missingChoice =
    !usesVariants && colorChoices.length > 1 && !color ? "colour" : !usesVariants && sizeChoices.length > 1 && !size ? "size" : null;
  const pricesIncludeTax = store.settings?.tax?.pricesIncludeTax ?? true;

  const handleAddToCart = () => {
    if (usesVariants && !matchedVariant)
      return toast.error("Please select all options");
    if (missingChoice) return toast.error(`Please select a ${missingChoice}`);
    addToCart.mutate(
      {
        product,
        variant: matchedVariant,
        productId: product._id,
        quantity,
        variantId: matchedVariant?._id,
        color,
        colorHex,
        size,
      },
      { onSuccess: () => openCart(true) },
    );
  };
  const handleBuyNow = () => {
    if (usesVariants && !matchedVariant)
      return toast.error("Please select all options");
    if (missingChoice) return toast.error(`Please select a ${missingChoice}`);
    buyNow({ product, variant: matchedVariant, quantity, color, colorHex, size });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const crumbs = [
    { name: "Home", path: "/" },
    ...(category
      ? [{ name: category.name, path: `/categories/${category.slug}` }]
      : [{ name: "Shop", path: "/products" }]),
    { name: product.title, path: `/products/${product.slug}` },
  ];

  const metaDescription = truncate(
    product.seoDescription ||
      product.shortDescription ||
      stripHtml(product.description) ||
      `Buy ${product.title} online.`,
  );
  const origin = window.location.origin;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: baseImages.map((i) => i.url),
    description: metaDescription,
    ...(sku ? { sku } : {}),
    ...(brand?.name ? { brand: { "@type": "Brand", name: brand.name } } : {}),
    ...(category?.name ? { category: category.name } : {}),
    offers: {
      "@type": "Offer",
      url: `${origin}/products/${product.slug}`,
      priceCurrency: "INR",
      price,
      availability:
        stock > 0 || product.hasVariants
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.numReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.numReviews,
          },
        }
      : {}),
  };

  const galleryBadge =
    discount > 0 ? (
      <span className="rounded-full bg-primary px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-fg-inverse">
        {discount}% off
      </span>
    ) : isNewProduct(product.createdAt) ? (
      <span className="rounded-full bg-canvas px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-primary ring-1 ring-gold/70">
        New
      </span>
    ) : undefined;

  const lineTotal = price * quantity;
  const offers: Offer[] = [
    ...(store.freeShippingEnabled && store.freeShippingThreshold > 0
      ? [
          {
            icon: <Truck size={16} strokeWidth={1.5} aria-hidden />,
            title:
              lineTotal >= store.freeShippingThreshold
                ? "Free shipping unlocked"
                : "Free shipping",
            text:
              lineTotal >= store.freeShippingThreshold
                ? `This order qualifies — on orders above ${formatCurrency(store.freeShippingThreshold)}.`
                : `Add ${formatCurrency(store.freeShippingThreshold - lineTotal)} more to ship free.`,
          },
        ]
      : []),
    {
      icon: <TicketPercent size={16} strokeWidth={1.5} aria-hidden />,
      title: "Have a coupon?",
      text: "Apply your code at checkout to see your savings.",
    },
    ...(store.onlinePaymentEnabled
      ? [
          {
            icon: <ShieldCheck size={16} strokeWidth={1.5} aria-hidden />,
            title: "10% off on prepaid",
            text: "Pay online via Razorpay — UPI, cards, net banking & wallets.",
          },
        ]
      : []),
    ...(store.codEnabled
      ? [
          {
            icon: <Banknote size={16} strokeWidth={1.5} aria-hidden />,
            title: "Cash on delivery",
            text: "Pay when your order arrives.",
          },
        ]
      : []),
  ];

  const descriptionIsHtml = /<[a-z][\s\S]*>/i.test(product.description || "");

  return (
    <>
      <Seo
        title={product.seoTitle || product.title}
        description={metaDescription}
        image={baseImages[0]?.url}
        type="product"
        canonicalPath={`/products/${product.slug}`}
        jsonLd={[productJsonLd, breadcrumbJsonLd(crumbs)]}
      />

      <div className="container-x pt-4 sm:pt-8">
        <Breadcrumbs items={crumbs} className="hidden sm:block" />

        <div className="mt-0 grid gap-8 sm:mt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <ProductGallery
            images={images}
            fallback={baseImages}
            alt={product.title}
            badge={galleryBadge}
            videoUrl={product.videoUrl}
          />

          {/* Sticky buy box */}
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h,89px)+28px)] lg:self-start lg:rounded-panel lg:border lg:border-border/70 lg:bg-surface lg:p-9 lg:shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {(category || brand) && (
                  <p className="eyebrow">
                    {category ? (
                      <Link
                        to={`/categories/${category.slug}`}
                        className="hover:text-fg"
                      >
                        {category.name}
                      </Link>
                    ) : (
                      brand?.name
                    )}
                  </p>
                )}
                <h1 className="mt-2 font-display text-4xl font-semibold leading-display text-fg sm:text-5xl">
                  {product.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={share}
                aria-label="Share"
                className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-primary"
              >
                <Share2 size={16} aria-hidden />
              </button>
            </div>

            {product.numReviews > 0 && (
              <a
                href="#reviews"
                className="mt-3 inline-flex items-center gap-2 text-sm text-fg-muted hover:text-fg"
              >
                <RatingStars rating={product.rating} size={14} />
                <span>
                  {product.rating.toFixed(1)} · {product.numReviews} review
                  {product.numReviews === 1 ? "" : "s"}
                </span>
              </a>
            )}

            <div className="mt-5 border-t border-border pt-5">
              <ProductPrice price={price} mrp={mrp} size="lg" />
              <p className="mt-1 text-xs text-fg-muted">
                {pricesIncludeTax
                  ? "Inclusive of all taxes"
                  : "Taxes calculated at checkout"}
              </p>
            </div>

            {product.shortDescription && (
              <p className="mt-5 font-sub text-base leading-relaxed text-fg-soft">
                {product.shortDescription}
              </p>
            )}

            {/* Metal / plating */}
            {(product.metal || product.plating) && (
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
                {product.metal && (
                  <>
                    <dt className="text-fg-muted">Metal</dt>
                    <dd className="font-medium text-fg">{product.metal}</dd>
                  </>
                )}
                {product.plating && (
                  <>
                    <dt className="text-fg-muted">Plating</dt>
                    <dd className="font-medium text-fg">{product.plating}</dd>
                  </>
                )}
              </dl>
            )}

            {/* Colour swatches */}
            {colorChoices.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-xs font-semibold uppercase tracking-label text-fg">
                  Color
                  {color && <span className="ml-2 font-normal normal-case tracking-normal text-fg-muted">{color}</span>}
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorChoices.map((c) => {
                    const isSelected = eq(c.name, color);
                    const available = !usesVariants || inStock({ color: c.name });
                    const label = `${c.name}${available ? "" : " — out of stock"}`;
                    return c.hex ? (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => pickColor(c.name)}
                        aria-pressed={isSelected}
                        aria-label={label}
                        title={label}
                        className={cn(
                          "relative h-9 w-9 rounded-full ring-offset-2 ring-offset-surface transition-[box-shadow,transform] duration-300 hover:scale-105",
                          isSelected ? "ring-2 ring-primary" : "ring-1 ring-border-strong hover:ring-primary",
                          !available && "opacity-45",
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {!available && <span className="absolute left-1/2 top-1/2 h-px w-11 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-fg/70" aria-hidden />}
                      </button>
                    ) : (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => pickColor(c.name)}
                        aria-pressed={isSelected}
                        aria-label={label}
                        className={cn(
                          "flex min-w-12 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
                          isSelected ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary",
                          !available && "text-fg-muted line-through",
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Sizes */}
            {sizeChoices.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-xs font-semibold uppercase tracking-label text-fg">
                  Size
                  {size && <span className="ml-2 font-normal normal-case tracking-normal text-fg-muted">{size}</span>}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeChoices.map((sz) => {
                    const isSelected = eq(sz, size);
                    const available = !usesVariants || inStock({ color: color, size: sz });
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedAttrs((prev) => ({ ...prev, size: sz }))}
                        aria-pressed={isSelected}
                        aria-label={`Size ${sz}${available ? "" : " — unavailable in this colour"}`}
                        className={cn(
                          "flex min-w-12 items-center justify-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
                          isSelected ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary",
                          !available && !isSelected && "border-dashed text-fg-muted line-through",
                        )}
                      >
                        {sz}
                        {isSelected && <Check size={13} strokeWidth={2.5} aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Any other variant attributes (e.g. Length) */}
            {otherKeys.map((key) => (
              <fieldset key={key} className="mt-6">
                <legend className="text-xs font-semibold uppercase tracking-label text-fg">
                  {key}
                  {selectedAttrs[key] && <span className="ml-2 font-normal normal-case tracking-normal text-fg-muted">{selectedAttrs[key]}</span>}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherOptions[key].map((value) => {
                    const isSelected = selectedAttrs[key] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedAttrs((prev) => ({ ...prev, [key]: value }))}
                        aria-pressed={isSelected}
                        className={cn(
                          "flex min-w-12 items-center justify-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
                          isSelected ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary",
                        )}
                      >
                        {value}
                        {isSelected && <Check size={13} strokeWidth={2.5} aria-hidden />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {usesVariants && !matchedVariant && (
              <p className="mt-3 text-xs text-danger" role="status">
                This combination isn't available — please choose another option.
              </p>
            )}

            <p className="mt-6 flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  stock > 0 ? "bg-success" : "bg-danger",
                )}
                aria-hidden
              />
              {stock > 0 ? (
                <span className="text-success">
                  {stock < 10
                    ? `Only ${stock} left — order soon`
                    : "In stock, ready to ship"}
                </span>
              ) : (
                <span className="text-danger">Out of stock</span>
              )}
            </p>

            <div className="mt-5 flex gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={product.minOrderQuantity || 1}
                max={Math.max(
                  1,
                  Math.min(product.maxOrderQuantity || 99, stock || 99),
                )}
                disabled={!canAddToCart}
              />
              <Button
                className="h-11 flex-1"
                variant="outline"
                disabled={!canAddToCart}
                isLoading={addToCart.isPending}
                onClick={handleAddToCart}
              >
                {canAddToCart ? "Add to bag" : "Sold out"}
              </Button>
              <button
                type="button"
                onClick={wishlist.toggle}
                aria-label={
                  wishlist.isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                aria-pressed={wishlist.isWishlisted}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-border bg-surface transition-colors hover:border-primary"
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden
                  className={cn(
                    wishlist.isWishlisted && "fill-primary text-primary",
                  )}
                />
              </button>
            </div>
            <Button
              size="lg"
              className="mt-3 w-full"
              disabled={!canAddToCart}
              isLoading={buying}
              onClick={handleBuyNow}
            >
              Buy it now
            </Button>

            <OfferCards offers={offers} />

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-5 text-xs text-fg-muted">
              <RotateCcw
                size={14}
                strokeWidth={1.5}
                className="text-accent"
                aria-hidden
              />{" "}
              Easy returns on eligible orders
              <Link
                to="/refund-policy"
                className="underline underline-offset-4 hover:text-fg"
              >
                Returns policy
              </Link>
            </p>

            <div className="mt-5">
              <DeliveryCheck
                weight={product.weight}
                subTotal={price * quantity}
              />
            </div>

            {sku && <p className="mt-4 text-xs text-fg-muted">SKU: {sku}</p>}
          </div>
        </div>

        {/* Details */}
        <section className="mt-14 grid gap-10 border-t border-border pb-14 pt-12 sm:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <div>
            <p className="eyebrow">The details</p>
            <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-fg">
              Description
            </h2>
            {product.description ? (
              descriptionIsHtml ? (
                <div
                  className="rich-content mt-5"
                  dangerouslySetInnerHTML={{
                    __html: sanitize(product.description),
                  }}
                />
              ) : (
                <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-fg-soft">
                  {product.description}
                </p>
              )
            ) : (
              <p className="mt-5 text-base leading-relaxed text-fg-soft">
                {product.shortDescription ||
                  "Details for this piece will be added soon."}
              </p>
            )}
          </div>
          <div className="border-t border-border">
            {(product.attributes?.length ||
              sku ||
              brand ||
              category ||
              product.weight) && (
              <AccordionItem title="Product details" defaultOpen>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
                  {product.attributes?.map((a) => (
                    <div key={a.key} className="contents">
                      <dt className="text-fg-muted">{a.key}</dt>
                      <dd className="text-fg">{a.value}</dd>
                    </div>
                  ))}
                  {category && (
                    <>
                      <dt className="text-fg-muted">Category</dt>
                      <dd className="text-fg">{category.name}</dd>
                    </>
                  )}
                  {brand?.name && (
                    <>
                      <dt className="text-fg-muted">Brand</dt>
                      <dd className="text-fg">{brand.name}</dd>
                    </>
                  )}
                  {product.weight ? (
                    <>
                      <dt className="text-fg-muted">Weight</dt>
                      <dd className="text-fg">{product.weight} kg</dd>
                    </>
                  ) : null}
                  {sku && (
                    <>
                      <dt className="text-fg-muted">SKU</dt>
                      <dd className="text-fg">{sku}</dd>
                    </>
                  )}
                  {product.warranty && (
                    <>
                      <dt className="text-fg-muted">Warranty</dt>
                      <dd className="text-fg">{product.warranty}</dd>
                    </>
                  )}
                </dl>
              </AccordionItem>
            )}
            <AccordionItem title="Jewellery care">
              <ul className="list-disc space-y-2 pl-5">
                {CARE_TIPS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </AccordionItem>
            <AccordionItem title="Shipping & delivery">
              <p>
                Every order is packed securely and shipped with tracking. Use
                the pincode checker above for an estimated delivery date to your
                address.
                {store.freeShippingEnabled &&
                  store.freeShippingThreshold > 0 && (
                    <>
                      {" "}
                      Orders above {formatCurrency(
                        store.freeShippingThreshold,
                      )}{" "}
                      ship free.
                    </>
                  )}
              </p>
              <Link
                to="/shipping-policy"
                className="mt-2 inline-block text-fg underline underline-offset-4"
              >
                Shipping policy
              </Link>
            </AccordionItem>
            <AccordionItem title="Returns & exchanges">
              <p>
                {product.returnPolicy ||
                  "Easy returns on eligible orders — raise a request from My Orders after delivery."}
              </p>
              <Link
                to="/refund-policy"
                className="mt-2 inline-block text-fg underline underline-offset-4"
              >
                Returns & refunds policy
              </Link>
            </AccordionItem>
          </div>
        </section>

        <div className="pb-4">
          <FrequentlyBoughtTogether
            product={product}
            variant={matchedVariant}
            related={relatedProducts}
          />
        </div>

        <ProductReviews
          productId={product._id}
          rating={product.rating}
          numReviews={product.numReviews}
        />
      </div>

      {/* Recommendations — each rail once, alternating surfaces; empty rails are skipped */}
      {loadingRelated && rails.length === 0 ? (
        <ProductRail
          eyebrow="Inspired for you"
          title="You May Also Like"
          isLoading
          className="bg-surface"
        />
      ) : (
        rails.map((rail, i) => (
          <ProductRail
            key={rail.key}
            eyebrow={rail.eyebrow}
            title={rail.title}
            products={rail.products}
            viewAllTo={rail.viewAllTo}
            className={i % 2 === 0 ? "bg-surface" : "bg-canvas"}
          />
        ))
      )}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 shadow-lift backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-fg">
              {formatCurrency(price)}
            </p>
            {discount > 0 && (
              <p className="text-label text-fg-muted line-through">
                {formatCurrency(mrp)}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="px-4"
            disabled={!canAddToCart}
            isLoading={addToCart.isPending}
            onClick={handleAddToCart}
          >
            {canAddToCart ? "Add to bag" : "Sold out"}
          </Button>
          <Button
            className="px-4"
            disabled={!canAddToCart}
            isLoading={buying}
            onClick={handleBuyNow}
          >
            Buy now
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
