import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  viewAllTo,
  viewAllLabel = "View all",
  align = "left",
  className,
  tone = "dark",
}: {
  /** Heading id — lets the section reference it with aria-labelledby. */
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  className?: string;
  tone?: "dark" | "light";
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-9 flex gap-4 sm:mb-12",
        centered ? "flex-col items-center text-center" : "flex-col sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(centered && "flex flex-col items-center")}>
        {eyebrow && <p className={cn("eyebrow", centered && "ornament", tone === "light" && "text-accent-light")}>{eyebrow}</p>}
        <h2
          id={id}
          className={cn(
            "mt-3 font-display text-4xl font-semibold leading-display sm:text-5xl lg:text-[3.5rem]",
            tone === "light" ? "text-fg-inverse" : "text-fg",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-3 max-w-xl font-sub text-base leading-relaxed", tone === "light" ? "text-fg-inverse/75" : "text-fg-muted")}>
            {description}
          </p>
        )}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className={cn(
            "group inline-flex flex-none items-center gap-2 border-b pb-1 text-xs font-semibold uppercase tracking-label transition-colors",
            tone === "light"
              ? "border-fg-inverse/40 text-fg-inverse hover:border-accent-light hover:text-accent-light"
              : "border-accent-soft text-primary hover:border-primary hover:text-primary-hover",
          )}
        >
          {viewAllLabel}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
