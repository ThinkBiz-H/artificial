import { cn } from "@/lib/utils";

export interface ItemOptionValues {
  color?: string;
  colorHex?: string;
  size?: string;
  metal?: string;
  plating?: string;
}

/** Round colour swatch; renders nothing without a hex. */
export function ColorSwatch({ hex, className }: { hex?: string; className?: string }) {
  if (!hex) return null;
  return <span className={cn("inline-block h-3 w-3 flex-none rounded-full border border-border-strong", className)} style={{ backgroundColor: hex }} aria-hidden />;
}

/** Labelled Color / Size / Metal / Plating chips for an order line (only the parts that exist). */
export function ItemOptions({ item, compact = false, className }: { item: ItemOptionValues; compact?: boolean; className?: string }) {
  const parts: { label: string; value: string; hex?: string }[] = [
    ...(item.color ? [{ label: "Color", value: item.color, hex: item.colorHex }] : []),
    ...(item.size ? [{ label: "Size", value: item.size }] : []),
    ...(item.metal ? [{ label: "Metal", value: item.metal }] : []),
    ...(item.plating ? [{ label: "Plating", value: item.plating }] : []),
  ];
  if (parts.length === 0) return null;

  if (compact) {
    return (
      <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs text-muted", className)}>
        {parts.map((p, i) => (
          <span key={p.label} className="inline-flex items-center gap-1">
            {i > 0 && <span aria-hidden>·</span>}
            <ColorSwatch hex={p.hex} />
            {p.value}
          </span>
        ))}
      </p>
    );
  }

  return (
    <dl className={cn("flex flex-wrap gap-1.5", className)}>
      {parts.map((p) => (
        <div key={p.label} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs">
          <dt className="text-muted">{p.label}:</dt>
          <dd className="inline-flex items-center gap-1 font-medium text-ink">
            <ColorSwatch hex={p.hex} />
            {p.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
