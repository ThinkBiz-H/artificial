import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { SearchDrawer } from "./Search";
import { MobileMenu } from "./MobileMenu";
import { Brand, SHOP_LINKS, useMenuCategories } from "./nav";

/** Max categories shown as cards in the mega menu; the rest are one click away on /categories. */
const MEGA_MENU_MAX = 8;

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold text-fg-inverse ring-2 ring-canvas">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* Inter Medium, wide uppercase tracking, with a gold rule that draws in on hover / when active. */
const navLink = cn(
  "relative flex items-center gap-1 py-2 text-[11.5px] font-medium uppercase tracking-[0.2em] text-fg transition-colors duration-300 hover:text-primary",
  "after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-luxe hover:after:scale-x-100",
);
const navLinkActive = "text-primary after:scale-x-100";

/** Outline icon buttons: soft scale + rose-gold accent on hover. */
const iconBtn =
  "relative flex h-10 w-10 items-center justify-center rounded-full text-fg transition-[color,transform] duration-300 ease-luxe hover:scale-110 hover:text-accent";

/** Category card grid — every card is a real admin category (image, name, short title / description). */
function CategoriesMegaMenu({ id, categories, onNavigate }: { id: string; categories: Category[]; onNavigate: () => void }) {
  const items = categories.slice(0, MEGA_MENU_MAX);
  // 2–4 columns depending on how many categories the store has; 7–8 wrap to two rows of four.
  const cols = items.length >= 7 || items.length === 4 ? 4 : Math.max(2, Math.min(items.length, 3));
  const COLS = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;
  const WIDTH = { 2: "w-[460px]", 3: "w-[min(640px,calc(100vw-5rem))]", 4: "w-[min(820px,calc(100vw-5rem))]" } as const;

  return (
    <div
      id={id}
      className={cn(
        "animate-fade-up overflow-hidden rounded-b-card border border-t-0 border-border bg-surface shadow-lift",
        WIDTH[cols as 2 | 3 | 4],
      )}
    >
      <div className="gold-rule" aria-hidden />
      <ul className={cn("grid gap-x-5 gap-y-7 p-7", COLS[cols as 2 | 3 | 4])}>
        {items.map((c) => {
          const blurb = c.shortTitle || c.description;
          return (
            <li key={c._id}>
              <Link to={`/categories/${c.slug}`} onClick={onNavigate} className="group/card block">
                <div className="aspect-square overflow-hidden rounded-xl bg-surface-muted transition-[transform,box-shadow] duration-500 ease-luxe group-hover/card:-translate-y-1 group-hover/card:shadow-soft">
                  {c.image?.url ? (
                    <img
                      src={c.image.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                      className="h-full w-full object-cover opacity-95 transition duration-700 ease-luxe group-hover/card:scale-105 group-hover/card:opacity-100"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-5xl italic text-accent/60" aria-hidden>
                      {c.name.charAt(0)}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-display text-xl font-semibold leading-tight text-fg transition-colors group-hover/card:text-primary">{c.name}</p>
                {blurb && <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{blurb}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-4 border-t border-border bg-canvas px-7 py-4">
        <p className="font-sub text-sm text-fg-muted">
          {categories.length} {categories.length === 1 ? "category" : "categories"} to explore
        </p>
        <Link
          to="/categories"
          onClick={onNavigate}
          className="group/all inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary hover:text-primary-hover"
        >
          View all categories <ArrowRight size={13} className="transition-transform group-hover/all:translate-x-1" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

/** Left-hand desktop navigation: Home · Shop · Categories (mega menu) · New Arrivals. */
function PrimaryNav() {
  const { header, all } = useMenuCategories();
  const categories = header.length ? header : all;
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    if (categories.length) setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  const close = () => setOpen(false);
  const categoriesActive = location.pathname.startsWith("/categories") || location.pathname.startsWith("/collections");

  return (
    <nav
      aria-label="Main"
      className="relative hidden h-full lg:flex"
      onMouseLeave={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          close();
          toggleRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close();
      }}
    >
      <ul className="flex h-full items-center gap-7 xl:gap-9">
        <li onMouseEnter={hide}>
          <NavLink to="/" end className={({ isActive }) => cn(navLink, isActive && navLinkActive)}>
            Home
          </NavLink>
        </li>
        <li onMouseEnter={hide}>
          <NavLink to="/products" className={({ isActive }) => cn(navLink, isActive && navLinkActive)}>
            Shop
          </NavLink>
        </li>
        <li className="flex h-full items-center" onMouseEnter={show}>
          <Link to="/categories" className={cn(navLink, (open || categoriesActive) && navLinkActive)}>
            Categories
          </Link>
          {categories.length > 0 && (
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={`${open ? "Hide" : "Show"} categories menu`}
              className="-ml-0.5 flex h-8 w-6 items-center justify-center text-fg transition-colors hover:text-primary"
            >
              <ChevronDown size={13} className={cn("transition-transform duration-300", open && "rotate-180")} aria-hidden />
            </button>
          )}
        </li>
        <li onMouseEnter={hide}>
          <NavLink to={SHOP_LINKS.newArrivals} className={({ isActive }) => cn(navLink, isActive && navLinkActive)}>
            New Arrivals
          </NavLink>
        </li>
      </ul>

      {open && (
        <div className="absolute -left-6 top-full z-40" onMouseEnter={show}>
          <CategoriesMegaMenu id={menuId} categories={categories} onNavigate={close} />
        </div>
      )}
    </nav>
  );
}

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setCartOpen = useUiStore((s) => s.setCartDrawerOpen);
  const mobileOpen = useUiStore((s) => s.isMobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);
  const searchOpen = useUiStore((s) => s.isSearchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const scrolled = useScrolled();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  // Transparent over the homepage hero until the visitor scrolls.
  const transparent = location.pathname === "/" && !scrolled && !mobileOpen;

  // Publish the header height so the homepage hero (and sticky toolbars) can sit against it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, setMobileOpen, setSearchOpen]);

  const cartCount = cart?.cart?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const wishlistCount = isAuthenticated ? wishlist?.length || 0 : 0;
  const accountHref = isAuthenticated ? "/account" : "/login";
  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          // Same height in both states — only the surface changes, so nothing below shifts.
          "sticky top-0 z-[900] w-full border-b transition-[background-color,box-shadow,border-color] duration-500 ease-luxe",
          transparent ? "border-transparent bg-transparent" : "border-border/80 bg-canvas/95 shadow-soft backdrop-blur-md",
        )}
        data-transparent={transparent || undefined}
      >
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:h-[76px] lg:h-[88px] lg:gap-6">
          {/* Left */}
          <div className="flex h-full min-w-0 items-center gap-1">
            <button type="button" className={cn(iconBtn, "-ml-2 lg:hidden")} onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}>
              <Menu size={22} strokeWidth={1.4} aria-hidden />
            </button>
            <button type="button" className={cn(iconBtn, "lg:hidden")} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} strokeWidth={1.4} aria-hidden />
            </button>
            <PrimaryNav />
          </div>

          {/* Centre */}
          <Brand tagline className="max-w-[56vw] sm:max-w-none" />

          {/* Right */}
          <div className="flex h-full min-w-0 items-center justify-end gap-0.5 sm:gap-1">
            <ul className="mr-4 hidden items-center gap-7 xl:flex">
              <li>
                <NavLink to={SHOP_LINKS.bestSellers} className={({ isActive }) => cn(navLink, isActive && navLinkActive)}>
                  Best Sellers
                </NavLink>
              </li>
              <li>
                <NavLink to={SHOP_LINKS.sale} className={({ isActive }) => cn(navLink, "text-primary", isActive && navLinkActive)}>
                  Sale
                </NavLink>
              </li>
            </ul>
            <button type="button" className={cn(iconBtn, "hidden lg:flex")} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} strokeWidth={1.4} aria-hidden />
            </button>
            <Link
              to={accountHref}
              className={cn(iconBtn, "hidden sm:flex")}
              aria-label={isAuthenticated ? `Account${firstName ? ` — ${firstName}` : ""}` : "Log in"}
              title={isAuthenticated ? `Hi, ${firstName || "there"}` : "Log in"}
            >
              <User size={20} strokeWidth={1.4} aria-hidden />
            </Link>
            <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}>
              <Heart size={20} strokeWidth={1.4} aria-hidden />
              <CountBadge count={wishlistCount} />
            </Link>
            <button type="button" className={cn(iconBtn, "-mr-2 sm:mr-0")} onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${cartCount} items`}>
              <ShoppingBag size={20} strokeWidth={1.4} aria-hidden />
              <CountBadge count={cartCount} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
