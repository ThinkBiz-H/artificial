import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { Category } from "@/types";

interface FlatRow {
  category: Category;
  depth: number;
}

function flatten(categories: Category[], depth = 0): FlatRow[] {
  const rows: FlatRow[] = [];
  categories.forEach((c) => {
    rows.push({ category: c, depth });
    if (c.children && c.children.length) rows.push(...flatten(c.children, depth + 1));
  });
  return rows;
}

/** True if this row, or any of its descendants, matches the search query. */
function matchesQuery(category: Category, query: string): boolean {
  if (category.name.toLowerCase().includes(query)) return true;
  return (category.children || []).some((c) => matchesQuery(c, query));
}

function filterTree(categories: Category[], query: string): Category[] {
  if (!query) return categories;
  return categories
    .filter((c) => matchesQuery(c, query))
    .map((c) => ({ ...c, children: filterTree(c.children || [], query) }));
}

/**
 * Searchable multi-select category tree with independent checkboxes — checking
 * a parent does not auto-check its children (matches the "Resin" checked but
 * only "Resin 3.1" checked among its children" example from the spec).
 */
export function CategoryTreeSelect({
  categories,
  selected,
  onChange,
  label,
}: {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const tree = filterTree(categories, query.trim().toLowerCase());
    return flatten(tree);
  }, [categories, query]);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-light" />
            <Input
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto p-2">
          {rows.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted">No categories found</p>
          ) : (
            rows.map(({ category, depth }) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface"
                style={{ paddingLeft: 8 + depth * 20 }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(category._id)}
                  onChange={() => toggle(category._id)}
                />
                {category.name}
              </label>
            ))
          )}
        </div>
      </div>
      {selected.length > 0 && (
        <p className="mt-1.5 text-xs text-muted">{selected.length} categor{selected.length === 1 ? "y" : "ies"} selected</p>
      )}
    </div>
  );
}
