import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  path?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs text-fg-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {c.path && !last ? (
                <Link to={c.path} className="transition-colors hover:text-accent">
                  {c.name}
                </Link>
              ) : (
                <span className={cn(last && "truncate text-fg")} aria-current={last ? "page" : undefined}>
                  {c.name}
                </span>
              )}
              {!last && <ChevronRight size={12} className="flex-none text-border-strong" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
