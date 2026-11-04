import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("scroll-mt-24 rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(31,20,24,0.04),0_8px_24px_-12px_rgba(31,20,24,0.08)]", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <span aria-hidden className="h-4 w-[3px] rounded-full bg-gradient-to-b from-gold to-brand" />
          {title}
        </h3>
        {description && <p className="mt-1 pl-[11px] text-xs leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
