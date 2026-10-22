import { Link, useLocation } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { useWishlist, useRemoveFromWishlist, useMoveToCart } from "@/hooks/useWishlist";
import { useAuthStore } from "@/stores/auth.store";
import { discountPercent, effectivePrice, productImage } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Seo } from "@/components/common/Seo";
import { ProductPrice } from "@/components/product/ProductCard";

/** Wishlist grid — shared by /wishlist and /account/wishlist. */
export function WishlistView() {
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const moveToCart = useMoveToCart();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!wishlist || wishlist.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-7 w-7" strokeWidth={1.25} />}
        title="Your wishlist is empty"
        description="Tap the heart on any piece to save it here for later."
        action={
          <Link to="/products" className={buttonClasses()}>
            Discover jewellery
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {wishlist.map((product) => {
        const image = productImage(product);
        const outOfStock = !product.hasVariants && product.stock <= 0;
        const href = `/products/${product.slug}`;
        const moving = moveToCart.isPending && moveToCart.variables?.productId === product._id;
        return (
          <article key={product._id} className="group flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-muted">
              <Link to={href} className="block h-full w-full" aria-label={product.title}>
                {image && <img src={image} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />}
              </Link>
              {discountPercent(product.price, product.salePrice) > 0 && (
                <span className="absolute left-2.5 top-2.5 rounded-2xl bg-primary px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-fg-inverse">
                  {discountPercent(product.price, product.salePrice)}% off
                </span>
              )}
              <button
                type="button"
                onClick={() => removeFromWishlist.mutate(product._id)}
                aria-label={`Remove ${product.title} from wishlist`}
                className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-surface/95 text-fg shadow-sm transition-colors hover:bg-primary hover:text-fg-inverse"
              >
                <X size={15} />
              </button>
            </div>
            <Link to={href} className="mt-3 line-clamp-2 text-sm text-fg hover:text-accent">
              {product.title}
            </Link>
            <ProductPrice className="mt-1" price={effectivePrice(product)} mrp={product.price} />
            <div className="mt-3">
              {product.hasVariants ? (
                <Link to={href} className={buttonClasses({ variant: "outline", size: "sm", className: "w-full" })}>
                  Choose options
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={outOfStock}
                  isLoading={moving}
                  onClick={() => moveToCart.mutate({ productId: product._id, quantity: 1 })}
                >
                  {outOfStock ? "Out of stock" : "Move to bag"}
                </Button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function WishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const { data: wishlist } = useWishlist();
  const location = useLocation();

  return (
    <div className="container-x py-10 sm:py-14">
      <Seo title="Wishlist" noindex />
      <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="eyebrow">Saved for later</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-fg sm:text-5xl">Wishlist</h1>
        </div>
        {isAuthenticated && !!wishlist?.length && (
          <p className="pb-1 text-sm text-fg-muted">
            {wishlist.length} piece{wishlist.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <div className="mt-10">
        {isInitializing ? null : isAuthenticated ? (
          <WishlistView />
        ) : (
          <EmptyState
            icon={<Heart className="h-7 w-7" strokeWidth={1.25} />}
            title="Save your favourites"
            description="Log in with your mobile number to create a wishlist that follows you across devices."
            action={
              <Link to="/login" state={{ from: location.pathname }} className={buttonClasses()}>
                Log in
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
