import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="font-display text-[32px] font-semibold leading-none tracking-tight text-ink">{title}</h1>
        <span aria-hidden className="mt-2.5 block h-0.5 w-12 rounded-full bg-gradient-to-r from-gold to-brand" />
        {description && <p className="mt-2.5 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex flex-none flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
