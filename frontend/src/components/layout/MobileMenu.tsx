import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Heart, Package, Search, ShoppingBag, User } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Brand, SHOP_LINKS, sortForMenu, useMenuCategories } from "./nav";

function MobileCategory({ category, depth, onNavigate }: { category: Category; depth: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const children = sortForMenu(category.children ?? []);
  const hasChildren = children.length > 0;

  return (
    <li>
      <div className="flex items-center justify-between">
        <Link
          to={`/categories/${category.slug}`}
          onClick={onNavigate}
          className={cn("block flex-1 py-3", depth === 0 ? "text-base text-fg" : "text-sm text-fg-soft")}
          style={{ paddingLeft: depth * 14 }}
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${category.name}`}
            className="flex h-10 w-10 items-center justify-center text-fg-muted"
          >
            <ChevronDown size={17} className={cn("transition-transform duration-300", open && "rotate-180")} aria-hidden />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="animate-fade-up border-l border-accent-soft/40 pl-2">
          {children.map((child) => (
            <MobileCategory key={child._id} category={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { all } = useMenuCategories();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartDrawerOpen);
  // Close the menu first, then open the next overlay so focus/scroll-lock hand over cleanly.
  const openAfterClose = (open: (v: boolean) => void) => {
    onClose();
    window.setTimeout(() => open(true), 50);
  };

  const primary = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
    { label: "New Arrivals", to: SHOP_LINKS.newArrivals },
    { label: "Best Sellers", to: SHOP_LINKS.bestSellers },
    { label: "Sale", to: SHOP_LINKS.sale },
    { label: "All Collections", to: "/categories" },
  ];
  const secondary = [
    { label: "Track order", to: "/track-order" },
    { label: "Contact us", to: "/contact" },
    { label: "FAQs", to: "/faq" },
    { label: "Journal", to: "/blog" },
    { label: "About us", to: "/about" },
  ];

  return (
    <Drawer open={open} onClose={onClose} side="left" label="Menu" title={<Brand className="pointer-events-none [&_span]:text-xl" />}>
      <div className="flex flex-col">
        <div className="border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={() => openAfterClose(setSearchOpen)}
            className="flex h-12 w-full items-center gap-3 rounded-input border border-border bg-surface px-4 text-left text-sm text-placeholder transition-colors hover:border-primary"
          >
            <Search size={17} strokeWidth={1.5} className="text-accent" aria-hidden />
            Search jewellery…
          </button>
        </div>
        <div className="grid grid-cols-4 border-b border-border text-center text-label font-medium uppercase tracking-label text-fg">
          <Link to={isAuthenticated ? "/account" : "/login"} onClick={onClose} className="flex flex-col items-center gap-1.5 py-4">
            <User size={19} strokeWidth={1.5} aria-hidden />
            {isAuthenticated ? user?.name?.split(" ")[0] || "Account" : "Log in"}
          </Link>
          <Link to="/wishlist" onClick={onClose} className="flex flex-col items-center gap-1.5 border-x border-border py-4">
            <Heart size={19} strokeWidth={1.5} aria-hidden />
            Wishlist
          </Link>
          <button type="button" onClick={() => openAfterClose(setCartOpen)} className="flex flex-col items-center gap-1.5 border-r border-border py-4 uppercase">
            <ShoppingBag size={19} strokeWidth={1.5} aria-hidden />
            Bag
          </button>
          <Link to="/account/orders" onClick={onClose} className="flex flex-col items-center gap-1.5 py-4">
            <Package size={19} strokeWidth={1.5} aria-hidden />
            Orders
          </Link>
        </div>

        <nav aria-label="Mobile" className="px-5 py-4">
          <ul>
            {primary.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={onClose}
                  className={cn(
                    "block py-3 font-display text-2xl font-semibold leading-tight",
                    l.label === "Sale" ? "text-accent" : "text-fg",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {all.length > 0 && (
            <>
              <p className="eyebrow mt-6 border-t border-border pt-6">Shop by category</p>
              <ul className="mt-2 divide-y divide-border/70">
                {all.map((cat) => (
                  <MobileCategory key={cat._id} category={cat} depth={0} onNavigate={onClose} />
                ))}
              </ul>
            </>
          )}

          <ul className="mt-6 space-y-1 border-t border-border pt-5">
            {secondary.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={onClose} className="block py-2 text-sm text-fg-muted hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Drawer>
  );
}
