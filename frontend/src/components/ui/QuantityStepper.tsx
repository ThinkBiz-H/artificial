import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const btn = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className={cn("inline-flex items-center rounded-pill border border-border bg-surface", className)}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(btn, "flex items-center justify-center text-fg transition-colors hover:text-accent disabled:opacity-30")}
        aria-label="Decrease quantity"
      >
        <Minus size={size === "sm" ? 12 : 14} />
      </button>
      <span className={cn("text-center text-sm font-medium tabular-nums", size === "sm" ? "w-7" : "w-9")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(btn, "flex items-center justify-center text-fg transition-colors hover:text-accent disabled:opacity-30")}
        aria-label="Increase quantity"
      >
        <Plus size={size === "sm" ? 12 : 14} />
      </button>
    </div>
  );
}
