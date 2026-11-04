import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { productsApi } from "@/api/products";

export interface PickedProduct {
  _id: string;
  title: string;
}

/** Search-and-pick list of products (related products, frequently bought together). */
export function ProductPicker({
  label,
  hint,
  value,
  onChange,
  excludeId,
  max = 12,
}: {
  label: string;
  hint?: string;
  value: PickedProduct[];
  onChange: (next: PickedProduct[]) => void;
  excludeId?: string;
  max?: number;
}) {
  const [q, setQ] = useState("");
  const { data: results } = useQuery({
    queryKey: ["admin-product-picker", q],
    queryFn: () => productsApi.list({ keyword: q, limit: 8 }),
    enabled: q.trim().length >= 2,
    select: (r) => r.data.products,
  });
  const chosen = new Set(value.map((p) => p._id));

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      {hint && <p className="-mt-1 mb-2 text-xs text-muted">{hint}</p>}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((p) => (
            <span key={p._id} className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs">
              {p.title}
              <button type="button" onClick={() => onChange(value.filter((x) => x._id !== p._id))} aria-label={`Remove ${p.title}`} className="text-muted hover:text-danger">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      {value.length < max && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, SKU or design code"
            className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
      )}
      {results && results.length > 0 && q.trim().length >= 2 && (
        <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-border">
          {results
            .filter((p) => p._id !== excludeId)
            .map((p) => (
              <button
                key={p._id}
                type="button"
                disabled={chosen.has(p._id)}
                onClick={() => {
                  onChange([...value, { _id: p._id, title: p.title }]);
                  setQ("");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface disabled:opacity-40"
              >
                {p.thumbnail?.url || p.images?.[0]?.url ? (
                  <img src={p.thumbnail?.url || p.images?.[0]?.url} alt="" className="h-7 w-7 rounded object-cover" />
                ) : null}
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-xs text-muted">{p.SKU}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
