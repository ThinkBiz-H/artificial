import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { useUiStore } from "@/stores/ui.store";
import { formatCurrency } from "@/lib/utils";
import { CartLine } from "./CartLine";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartDrawer() {
  const open = useUiStore((s) => s.isCartDrawerOpen);
  const setOpen = useUiStore((s) => s.setCartDrawerOpen);
  const navigate = useNavigate();
  const { data, isLoading } = useCart();
  const items = data?.cart || [];
  const subTotal = data?.subTotal ?? items.reduce((s, i) => s + i.itemTotal, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const close = () => setOpen(false);

  return (
    <Drawer
      open={open}
      onClose={close}
      label="Shopping bag"
      title={
        <span>
          Your bag {count > 0 && <span className="font-sans text-sm font-normal text-fg-muted">({count})</span>}
        </span>
      }
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-fg-muted">Subtotal</span>
              <span className="text-lg font-semibold text-fg">{formatCurrency(subTotal)}</span>
            </div>
            <p className="text-xs text-fg-muted">Shipping and discounts are calculated at checkout.</p>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                close();
                navigate("/checkout");
              }}
            >
              Checkout
            </Button>
            <Link to="/cart" onClick={close} className={buttonClasses({ variant: "outline", size: "lg", className: "w-full" })}>
              View bag
            </Link>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-5 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-accent">
            <ShoppingBag size={26} strokeWidth={1.25} />
          </div>
          <p className="mt-4 font-display text-2xl font-semibold text-fg">Your bag is empty</p>
          <p className="mt-2 text-sm text-fg-muted">Discover pieces made for every occasion.</p>
          <Link to="/products" onClick={close} className={buttonClasses({ className: "mt-6" })}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5 p-5">
          <FreeShippingProgress subTotal={subTotal} />
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={`${item.product._id}-${item.variant?._id || ""}-${item.color || ""}-${item.size || ""}`} className="py-5 first:pt-0">
                <CartLine item={item} compact onNavigate={close} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
