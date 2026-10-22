import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label,
  value,
  icon,
  trend,
  isLoading,
}: {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  trend?: number;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-ink">{icon}</div>}
      </div>
      {isLoading ? (
        <div className="mt-3 h-7 w-24 animate-pulse rounded bg-surface" />
      ) : (
        <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      )}
      {trend !== undefined && !isLoading && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trend >= 0 ? "text-success" : "text-danger")}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}
