import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import type { Product } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductPrice } from "./ProductCard";
import { useAddToCart } from "@/hooks/useCart";
import { useBuyNow } from "@/hooks/useBuyNow";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { useUiStore } from "@/stores/ui.store";
import { cn, effectivePrice } from "@/lib/utils";

/** Lightweight product preview opened from a product card. Uses the card's list data — no extra request. */
export function QuickViewModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const images = product.images?.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(product.minOrderQuantity || 1);
  const addToCart = useAddToCart();
  const { buyNow, isLoading: buying } = useBuyNow();
  const openCart = useUiStore((s) => s.setCartDrawerOpen);
  const wishlist = useWishlistToggle(product._id);
  const href = `/products/${product.slug}`;
  const inStock = product.hasVariants || product.stock > 0;

  return (
    <Modal open={open} onClose={onClose} className="max-w-4xl p-0 sm:p-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-surface-muted">
          <div className="aspect-square overflow-hidden">
            {images[active]?.url && <img src={images[active].url} alt={product.title} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn("h-14 w-14 flex-none overflow-hidden rounded border", i === active ? "border-primary" : "border-transparent opacity-70")}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-6 sm:p-8">
          {typeof product.category === "object" && product.category?.name && (
            <p className="eyebrow">{product.category.name}</p>
          )}
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-fg">{product.title}</h2>
          {product.numReviews > 0 && <RatingStars className="mt-3" rating={product.rating} showCount count={product.numReviews} />}
          <ProductPrice className="mt-4" size="lg" price={effectivePrice(product)} mrp={product.price} />
          <p className="mt-1 text-xs text-fg-muted">Inclusive of all taxes</p>
          {product.shortDescription && <p className="mt-5 text-sm leading-relaxed text-fg-soft">{product.shortDescription}</p>}

          <div className="mt-auto pt-6">
            {product.hasVariants ? (
              <Link to={href} onClick={onClose} className="block">
                <Button className="w-full" size="lg">
                  Choose options <ArrowRight size={15} />
                </Button>
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <QuantityStepper value={qty} onChange={setQty} min={product.minOrderQuantity || 1} max={product.maxOrderQuantity || 99} />
                  <button
                    type="button"
                    onClick={wishlist.toggle}
                    aria-label="Toggle wishlist"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border transition-colors hover:border-primary"
                  >
                    <Heart size={17} className={cn(wishlist.isWishlisted && "fill-accent-soft text-accent-soft")} />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    disabled={!inStock}
                    isLoading={addToCart.isPending}
                    onClick={() =>
                      addToCart.mutate(
                        { product, productId: product._id, quantity: qty },
                        {
                          onSuccess: () => {
                            onClose();
                            openCart(true);
                          },
                        },
                      )
                    }
                  >
                    {inStock ? "Add to cart" : "Sold out"}
                  </Button>
                  <Button size="lg" variant="outline" disabled={!inStock} isLoading={buying} onClick={() => buyNow({ product, quantity: qty })}>
                    Buy now
                  </Button>
                </div>
              </>
            )}
            <Link
              to={href}
              onClick={onClose}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-label text-accent hover:text-fg"
            >
              View full details <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
