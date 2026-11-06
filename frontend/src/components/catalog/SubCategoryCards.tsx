import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const active = (list?: Category[]) => (list ?? []).filter((c) => c.status === "active").sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

/** The parent of a category in the (cached) category tree. */
export function findParentCategory(nodes: Category[], id: string): Category | undefined {
  for (const n of nodes) {
    if (n.children?.some((c) => c._id === id)) return n;
    const hit = findParentCategory(n.children ?? [], id);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Top of a category page: search, then every main category as a round
 * image (Flipkart-style strip). Main categories come from Admin > Categories.
 */
export function CategorySearchStrip({ tree, currentId }: { tree: Category[]; currentId: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const roots = active(tree);

  return (
    <div className="mt-6 space-y-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        className="flex h-12 max-w-2xl items-center gap-3 rounded-pill border border-border bg-surface px-5 transition-colors focus-within:border-gold-deep"
      >
        <Search size={17} className="flex-none text-fg-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jhumka, choker, bangles…"
          aria-label="Search products"
          className="search-input min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-muted"
        />
      </form>

      {roots.length > 0 && (
        <nav aria-label="Main categories" className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {roots.map((c) => {
            const selected = c._id === currentId;
            const src = c.icon?.url || c.image?.url;
            return (
              <Link key={c._id} to={`/categories/${c.slug}`} aria-current={selected ? "page" : undefined} className="group flex w-[76px] flex-none flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "block h-[68px] w-[68px] overflow-hidden rounded-full border bg-surface transition-[border-color,box-shadow] duration-300",
                    selected ? "border-gold-deep shadow-soft ring-2 ring-gold-deep ring-offset-2 ring-offset-cream" : "border-border group-hover:border-gold-deep",
                  )}
                >
                  {src ? (
                    <img src={src} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-xl text-fg-muted">{c.name.charAt(0)}</span>
                  )}
                </span>
                <span className={cn("line-clamp-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em]", selected ? "text-primary" : "text-fg group-hover:text-primary")}>
                  {c.name}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function Card({ label, image, selected, onClick, to }: { label: string; image?: string; selected: boolean; onClick?: () => void; to?: string }) {
  const className = "group flex w-[96px] flex-none snap-start flex-col items-center gap-2 text-center sm:w-[112px]";
  const body = (
    <>
      <span
        className={cn(
          "block aspect-square w-full overflow-hidden rounded-image border bg-surface transition-[border-color,box-shadow] duration-300",
          selected ? "border-gold-deep shadow-soft ring-1 ring-gold-deep" : "border-border group-hover:border-gold-deep",
        )}
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            className="h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl text-fg-muted">{label.charAt(0)}</span>
        )}
      </span>
      <span
        className={cn(
          "line-clamp-2 text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] transition-colors",
          selected ? "text-primary" : "text-fg group-hover:text-primary",
        )}
      >
        {label}
      </span>
      <span aria-hidden className={cn("h-0.5 w-8 rounded-full transition-colors", selected ? "bg-gold-deep" : "bg-transparent")} />
    </>
  );
  return to ? (
    <Link to={to} aria-current={selected ? "page" : undefined} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} aria-pressed={selected} className={className}>
      {body}
    </button>
  );
}

/**
 * Sub-category image cards (Yes Madam style): "All" + every sub-category of
 * the main category, in the admin's order.
 *   onSelect  → buttons (main category page: the preview below updates in place)
 *   linkMode  → links to each sub-category's full listing ("All" → ?view=all)
 */
export function SubCategoryCards({
  group,
  selectedId,
  onSelect,
  linkMode = false,
}: {
  group: Category;
  selectedId?: string;
  onSelect?: (sub: Category | null) => void;
  linkMode?: boolean;
}) {
  const cards = active(group.children);
  if (!cards.length) return null;
  return (
    <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:gap-4 sm:px-0" aria-label={`${group.name} sub-categories`}>
      <Card
        label={`All ${group.name}`}
        image={group.image?.url}
        selected={!selectedId}
        to={linkMode ? `/categories/${group.slug}?view=all` : undefined}
        onClick={() => onSelect?.(null)}
      />
      {cards.map((c) => (
        <Card
          key={c._id}
          label={c.name}
          image={c.image?.url}
          selected={c._id === selectedId}
          to={linkMode ? `/categories/${c.slug}` : undefined}
          onClick={() => onSelect?.(c)}
        />
      ))}
    </div>
  );
}
