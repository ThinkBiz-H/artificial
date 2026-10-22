import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link" | "dark" | "light";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  /** Shows a check + optional success label (e.g. right after "Add to bag"). */
  isSuccess?: boolean;
  successLabel?: string;
}

/*
 * States for every variant: default · hover · active (pressed) ·
 * focus-visible (global ring, index.css) · disabled · loading (spinner,
 * aria-busy) · success (check). Shape, type and motion come from tokens.
 */
const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-fg-inverse shadow-sm hover:bg-primary-hover hover:shadow-lift active:bg-primary",
  dark: "bg-primary text-fg-inverse hover:bg-primary-hover active:bg-primary",
  secondary: "border border-primary bg-surface text-primary hover:bg-primary hover:text-fg-inverse active:bg-primary-hover",
  outline: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-fg-inverse active:bg-primary-hover",
  ghost: "bg-transparent text-fg hover:bg-surface-muted active:bg-border",
  danger: "bg-danger text-fg-inverse hover:opacity-90 active:opacity-100",
  light: "bg-surface text-fg hover:bg-surface-muted active:bg-border",
  link: "h-auto bg-transparent p-0 text-fg underline decoration-border-strong underline-offset-4 hover:decoration-fg",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-5 text-label",
  md: "h-11 px-7 text-label",
  lg: "h-13 px-9 text-xs",
  icon: "h-10 w-10",
};

/** Class string for anything that should look like a button (e.g. a <Link>). */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold transition-[background-color,color,border-color,opacity,transform,box-shadow] duration-200 ease-luxe",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    variant !== "link" && "rounded-pill uppercase tracking-label active:scale-[0.98]",
    variant === "link" && "text-sm normal-case",
    variantClasses[variant],
    variant !== "link" && sizeClasses[size],
    className,
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, isSuccess, successLabel, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={buttonClasses({ variant, size, className })}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : isSuccess ? <Check className="h-4 w-4" aria-hidden /> : null}
        {isSuccess && successLabel ? <span role="status">{successLabel}</span> : children}
      </button>
    );
  },
);
Button.displayName = "Button";
