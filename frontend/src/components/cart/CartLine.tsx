import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import type { CartLineItem } from "@/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { formatCurrency } from "@/lib/utils";
import { resolveLineImage, resolveLineOptions } from "@/lib/itemOptions";
import { LineOptions } from "@/components/common/LineOptions";

/** Line image: what the server/guest cart resolved, else variant → colour gallery → product. */
export function cartLineImage(item: CartLineItem) {
  return item.image || resolveLineImage(item.product, item.variant, item.color);
}

/** Colour / size / metal / plating for a line (works for lines stored before these fields existed). */
export function cartLineOptions(item: CartLineItem) {
  const resolved = resolveLineOptions(item.product, item.variant, { color: item.color, size: item.size });
  return { ...resolved, colorHex: resolved.colorHex || item.colorHex };
}

/** One cart line — used by both the cart drawer (compact) and the cart page. */
export function CartLine({ item, compact, onNavigate }: { item: CartLineItem; compact?: boolean; onNavigate?: () => void }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const wishlist = useWishlistToggle(item.product._id);
  const image = cartLineImage(item);
  const options = cartLineOptions(item);
  // Remove just this line (one product/variant/colour/size), not every line of the product.
  const removeLine = () => removeItem.mutate(item);
  const href = `/products/${item.product.slug}`;
  const mrp = item.variant?.price ?? item.product.price;

  const moveToWishlist = () => wishlist.addOnly({ onSuccess: removeLine });

  return (
    <div className="flex gap-4">
      <Link to={href} onClick={onNavigate} className={compact ? "h-24 w-20 flex-none overflow-hidden rounded-2xl bg-surface-muted" : "h-32 w-26 flex-none overflow-hidden rounded-2xl bg-surface-muted sm:h-36 sm:w-30"}>
        {image && <img src={image} alt={item.product.title} loading="lazy" className="h-full w-full object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={href} onClick={onNavigate} className="line-clamp-2 text-sm leading-snug text-fg hover:text-accent">
              {item.product.title}
            </Link>
            <LineOptions item={options} className="mt-1" />
            <p className="mt-1.5 flex items-baseline gap-2 text-sm">
              <span className="font-semibold text-fg">{formatCurrency(item.price)}</span>
              {mrp > item.price && <span className="text-xs text-fg-muted line-through">{formatCurrency(mrp)}</span>}
            </p>
          </div>
          {!compact && <p className="hidden flex-none text-sm font-semibold text-fg sm:block">{formatCurrency(item.itemTotal)}</p>}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            min={item.product.minOrderQuantity || 1}
            max={item.product.maxOrderQuantity || 99}
            disabled={updateItem.isPending}
            onChange={(q) => updateItem.mutate({ line: item, quantity: q })}
          />
          {!compact && (
            <button type="button" onClick={moveToWishlist} className="flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-fg">
              <Heart size={13} /> Move to wishlist
            </button>
          )}
          <button
            type="button"
            onClick={removeLine}
            aria-label={`Remove ${item.product.title}`}
            className="flex items-center gap-1.5 text-xs text-fg-muted transition-colors hover:text-danger"
          >
            <Trash2 size={13} /> {!compact && "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
