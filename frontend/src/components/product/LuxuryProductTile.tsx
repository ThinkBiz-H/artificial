import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Heart, Loader2, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types";
import { cn, discountPercent, effectivePrice, formatCurrency, isNewProduct, productImage } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useCart";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { useUiStore } from "@/stores/ui.store";
import { Skeleton } from "@/components/ui/Skeleton";
import { QuickViewModal } from "./QuickViewModal";

const EASE = [0.22, 1, 0.36, 1] as const;
const FAST = { duration: 0.3, ease: EASE };

function Badge({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" | "gold" }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.18em]",
        tone === "light" && "bg-surface text-fg",
        tone === "dark" && "bg-surface-dark text-fg-inverse",
        tone === "gold" && "bg-gold-deep text-fg-inverse",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Editorial product tile: no card — just the image and the details beneath.
 * Hover (or keyboard focus) zooms the image and slides up an "Add to bag"
 * bar with a quick-view button. Same data and cart / wishlist / quick-view
 * behaviour as before; touch devices get a compact bag button instead.
 */
export const LuxuryProductTile = memo(function LuxuryProductTile({
  product,
  priority = false,
  isBestSeller = false,
}: {
  product: Product;
  priority?: boolean;
  /** Set by lists that come from the best-sellers API — products carry no best-seller flag themselves. */
  isBestSeller?: boolean;
}) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const openCart = useUiStore((s) => s.setCartDrawerOpen);
  const wishlist = useWishlistToggle(product._id);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = effectivePrice(product);
  const discount = discountPercent(product.price, product.salePrice);
  const image = productImage(product);
  const outOfStock = product.stock <= 0 && !product.hasVariants;
  const isNew = isNewProduct(product.createdAt);
  const categoryName = typeof product.category === "object" ? product.category?.name : undefined;
  // Material / finish from the product's own attributes (e.g. "Material: Brass", "Plating: Gold").
  const material = product.attributes?.find((a) => /material|metal|plating|finish/i.test(a.key) && a.value)?.value;
  const href = `/products/${product.slug}`;
  const addLabel = product.hasVariants ? "Choose options" : "Add to bag";

  const quickAdd = () => {
    if (product.hasVariants) return navigate(href);
    addToCart.mutate({ product, productId: product._id, quantity: 1 }, { onSuccess: () => openCart(true) });
  };

  const state = active ? "hover" : "rest";

  return (
    <article className="flex h-full flex-col">
      <motion.div
        className="relative aspect-[4/5] overflow-hidden bg-surface-muted"
        initial="rest"
        animate={state}
        onHoverStart={() => setActive(true)}
        onHoverEnd={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(false);
        }}
      >
        <Link to={href} className="absolute inset-0 block" tabIndex={-1} aria-hidden>
          {image ? (
            <motion.img
              src={image}
              alt={product.title}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
              variants={{ rest: { scale: 1 }, hover: { scale: reduce ? 1 : 1.06 } }}
              transition={{ duration: 0.9, ease: EASE }}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-lg text-fg-muted">No image</span>
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {outOfStock && <Badge tone="dark">Sold out</Badge>}
          {!outOfStock && discount > 0 && <Badge tone="dark">Sale</Badge>}
          {isBestSeller && <Badge tone="gold">Best seller</Badge>}
          {isNew && <Badge>New</Badge>}
        </div>

        {/* Wishlist — always on top-right; fades up slightly while the tile is active */}
        <motion.button
          type="button"
          onClick={wishlist.toggle}
          aria-label={wishlist.isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          aria-pressed={wishlist.isWishlisted}
          variants={{ rest: { opacity: 0.9 }, hover: { opacity: 1 } }}
          transition={FAST}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-fg shadow-sm transition-colors duration-300 hover:text-primary"
        >
          <Heart size={16} strokeWidth={1.6} aria-hidden className={cn("transition-[fill,color] duration-300", wishlist.isWishlisted && "fill-primary text-primary")} />
        </motion.button>

        {!outOfStock && (
          <>
            {/* Pointer devices: bar slides up from the bottom on hover / focus */}
            <motion.div
              variants={{ rest: { y: "100%" }, hover: { y: 0 } }}
              transition={FAST}
              className="absolute inset-x-0 bottom-0 hidden h-[52px] items-center justify-between bg-surface-dark pl-5 pr-1.5 [@media(hover:hover)]:flex"
            >
              <button
                type="button"
                onClick={quickAdd}
                disabled={addToCart.isPending}
                aria-label={`${addLabel}: ${product.title}`}
                className="flex h-full flex-1 items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-inverse transition-colors hover:text-accent-light disabled:opacity-70"
              >
                {addToCart.isPending && <Loader2 size={14} className="animate-spin" aria-hidden />}
                {addLabel}
              </button>
              <motion.button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                aria-label={`Quick view: ${product.title}`}
                variants={{ rest: { opacity: 0, scale: 0.85 }, hover: { opacity: 1, scale: 1 } }}
                transition={{ ...FAST, delay: active ? 0.08 : 0 }}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-transparent bg-surface text-fg shadow-soft transition-colors duration-300 hover:border-gold"
              >
                <Eye size={16} strokeWidth={1.6} aria-hidden />
              </motion.button>
            </motion.div>

            {/* Touch devices: compact, always-visible bag button */}
            <button
              type="button"
              onClick={quickAdd}
              aria-label={`${addLabel}: ${product.title}`}
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg shadow-soft [@media(hover:hover)]:hidden"
            >
              {addToCart.isPending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <ShoppingBag size={16} strokeWidth={1.6} aria-hidden />}
            </button>
          </>
        )}
      </motion.div>

      {/* Details */}
      <div className="flex flex-1 flex-col pt-4">
        {(material || categoryName) && <p className="line-clamp-1 text-[11px] font-medium uppercase tracking-[0.2em] text-fg-muted">{material || categoryName}</p>}
        <h3 className="mt-1.5 line-clamp-2 font-display text-[19px] font-medium leading-[1.2] text-fg sm:text-[22px]">
          <Link to={href} className="transition-colors duration-300 hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="text-[15px] font-semibold text-fg">{formatCurrency(price)}</span>
          {discount > 0 && (
            <span className="text-sm text-fg-muted line-through">
              <span className="sr-only">Was </span>
              {formatCurrency(product.price)}
            </span>
          )}
        </p>
        {product.numReviews > 0 && (
          <p className="mt-2 flex items-center gap-1.5" aria-label={`Rated ${product.rating.toFixed(1)} out of 5 from ${product.numReviews} reviews`}>
            <span className="flex items-center gap-0.5" aria-hidden>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={12} strokeWidth={1.5} className={i <= Math.round(product.rating) ? "fill-gold-deep text-gold-deep" : "fill-transparent text-border-strong"} />
              ))}
            </span>
            <span className="text-xs text-fg-muted" aria-hidden>
              ({product.numReviews})
            </span>
          </p>
        )}
      </div>

      {quickViewOpen && <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />}
    </article>
  );
});

/** Placeholder matching the tile's footprint (image + three lines). */
export function LuxuryProductTileSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <Skeleton className="mt-4 h-3 w-1/3" />
      <Skeleton className="mt-2.5 h-5 w-4/5" />
      <Skeleton className="mt-2.5 h-4 w-1/4" />
    </div>
  );
}
