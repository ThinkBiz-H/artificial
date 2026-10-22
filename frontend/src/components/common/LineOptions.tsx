import type { ItemOptionValues } from "@/types";
import { cn } from "@/lib/utils";
import { optionParts } from "@/lib/itemOptions";

/** Small round colour swatch; renders nothing without a hex. */
export function ColorDot({ hex, className }: { hex?: string; className?: string }) {
  if (!hex) return null;
  return <span className={cn("inline-block h-3 w-3 flex-none rounded-full ring-1 ring-border-strong", className)} style={{ backgroundColor: hex }} aria-hidden />;
}

/**
 * Selected jewellery options for a cart line / order item:
 * "Color: ● Gold · Size: 2.6 · Metal: Brass · Plating: Gold Plated".
 * `stacked` lists them one per line (checkout summary, order details).
 */
export function LineOptions({ item, stacked = false, className }: { item: ItemOptionValues; stacked?: boolean; className?: string }) {
  const parts = optionParts(item);
  if (parts.length === 0) return null;

  return (
    <dl className={cn("text-xs text-fg-muted", stacked ? "space-y-0.5" : "flex flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
      {parts.map((p, i) => (
        <div key={p.label} className="inline-flex items-center gap-1">
          {!stacked && i > 0 && (
            <span className="mr-1 text-border-strong" aria-hidden>
              ·
            </span>
          )}
          <dt>{p.label}:</dt>
          <dd className="inline-flex items-center gap-1 font-medium text-fg-soft">
            <ColorDot hex={p.hex} />
            {p.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
