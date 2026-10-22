import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, Loader2, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import {
  formatCurrency,
  effectivePrice,
  discountPercent,
  cn,
  productImage,
  isNewProduct,
} from "@/lib/utils";
import { RatingStars } from "@/components/ui/RatingStars";
import { useAddToCart } from "@/hooks/useCart";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { useUiStore } from "@/stores/ui.store";
import { QuickViewModal } from "./QuickViewModal";

export function ProductPrice({
  price,
  mrp,
  size = "md",
  className,
}: {
  price: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const discount =
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-semibold text-fg",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-2xl tracking-tight",
        )}
      >
        {formatCurrency(price)}
      </span>
      {discount > 0 && (
        <>
          <span
            className={cn(
              "text-fg-muted line-through",
              size === "lg" ? "text-base" : "text-xs",
            )}
          >
            {formatCurrency(mrp)}
          </span>
          <span
            className={cn(
              "font-semibold text-success",
              size === "lg" ? "text-sm" : "text-xs",
            )}
          >
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
}

/*
 * Hover controls (Add to bag + quick view): pointer devices only. They start
 * 20px low and transparent, then rise in over 300ms on hover — or on keyboard
 * focus, so they stay reachable without a mouse.
 */
const revealOnHover =
  "hidden translate-y-5 opacity-0 transition-[opacity,transform,background-color,color,border-color] duration-300 ease-luxe group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:hover)]:flex";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const openCart = useUiStore((s) => s.setCartDrawerOpen);
  const wishlist = useWishlistToggle(product._id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = effectivePrice(product);
  const discount = discountPercent(product.price, product.salePrice);
  const image = productImage(product);
  const hoverImage = product.images?.find((img) => img.url !== image)?.url;
  const outOfStock = product.stock <= 0 && !product.hasVariants;
  const isNew = isNewProduct(product.createdAt);
  const categoryName =
    typeof product.category === "object" ? product.category?.name : undefined;
  // Material / finish from the product's own attributes (e.g. "Material: Brass", "Plating: Gold").
  const material = product.attributes?.find(
    (a) => /material|metal|plating|finish/i.test(a.key) && a.value,
  )?.value;
  const href = `/products/${product.slug}`;

  const quickAdd = () => {
    if (product.hasVariants) return navigate(href);
    addToCart.mutate(
      { product, productId: product._id, quantity: 1 },
      { onSuccess: () => openCart(true) },
    );
  };

  const addLabel = product.hasVariants ? "Choose options" : "Add to bag";

  return (
    <article className="group flex h-full w-full flex-col">
      {/* Image — fills the frame, no card around it */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
        <Link
          to={href}
          className="absolute inset-0 block"
          tabIndex={-1}
          aria-hidden
        >
          {image ? (
            <>
              <img
                src={image}
                alt={product.title}
                loading={priority ? "eager" : "lazy"}
                onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                decoding="async"
                className={cn(
                  "h-full w-full object-cover transition-[transform,opacity] duration-700 ease-luxe group-hover:scale-105",
                  hoverImage && "[@media(hover:hover)]:group-hover:opacity-0",
                )}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                  className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-700 ease-luxe group-hover:scale-105 group-hover:opacity-100 [@media(hover:hover)]:block"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-lg text-fg-muted">
              No image
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/55">
              <span className="bg-surface px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-fg shadow-sm">
                Sold out
              </span>
            </div>
          )}
        </Link>

        {/* Badges — top left */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-fg-inverse">
              Sale · {discount}%
            </span>
          )}
          {isNew && (
            <span className="bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase leading-none tracking-[0.18em] text-fg">
              New
            </span>
          )}
        </div>

        {/* Wishlist — top right, always visible */}
        <button
          type="button"
          onClick={wishlist.toggle}
          aria-label={
            wishlist.isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          aria-pressed={wishlist.isWishlisted}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg shadow-sm transition-[transform,color] duration-300 ease-luxe hover:scale-105 hover:text-primary"
        >
          <Heart
            size={17}
            strokeWidth={1.6}
            aria-hidden
            className={cn(
              "transition-colors",
              wishlist.isWishlisted && "fill-primary text-primary",
            )}
          />
        </button>

        {!outOfStock && (
          <>
            {/* Add to bag — bottom left: 16px inset, 44px tall, leaves room for the eye button */}
            <button
              type="button"
              onClick={quickAdd}
              disabled={addToCart.isPending}
              className={cn(
                revealOnHover,
                "absolute bottom-4 left-4 h-11 w-[calc(100%-80px)] items-center justify-center gap-2 rounded-none bg-espresso px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-inverse hover:bg-surface-dark disabled:opacity-80",
              )}
            >
              {addToCart.isPending ? (
                <Loader2 size={15} className="animate-spin" aria-hidden />
              ) : (
                <ShoppingBag size={15} strokeWidth={1.6} aria-hidden />
              )}
              <span className="truncate">{addLabel}</span>
            </button>
            {/* Touch devices: only the bag icon, always visible */}
            <button
              type="button"
              onClick={quickAdd}
              aria-label={`${addLabel}: ${product.title}`}
              className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg shadow-sm [@media(hover:hover)]:hidden"
            >
              {addToCart.isPending ? (
                <Loader2 size={15} className="animate-spin" aria-hidden />
              ) : (
                <ShoppingBag size={16} strokeWidth={1.6} aria-hidden />
              )}
            </button>
          </>
        )}

        {/* Quick view — its own 44px circle, bottom right (not inside Add to bag) */}
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          aria-label={`Quick view: ${product.title}`}
          className={cn(
            revealOnHover,
            "absolute bottom-4 right-4 h-11 w-11 items-center justify-center rounded-full border border-transparent bg-surface text-fg shadow-md hover:border-fg",
          )}
        >
          <Eye size={17} strokeWidth={1.6} aria-hidden />
        </button>
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col pb-2 pt-5">
        {(material || categoryName) && (
          <p className="line-clamp-1 text-[11px] font-medium uppercase tracking-[0.2em] text-fg-muted">
            {material || categoryName}
          </p>
        )}
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-medium leading-snug text-fg">
          <Link to={href} className="transition-colors duration-300 hover:text-primary">
            {product.title}
          </Link>
        </h3>
        {product.numReviews > 0 && (
          <RatingStars
            rating={product.rating}
            size={11}
            showCount
            count={product.numReviews}
            className="mt-2"
          />
        )}
        <ProductPrice price={price} mrp={product.price} className="mt-2" />
      </div>

      {quickViewOpen && (
        <QuickViewModal
          product={product}
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </article>
  );
}
