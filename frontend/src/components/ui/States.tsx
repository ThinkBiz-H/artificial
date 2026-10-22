import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Inbox, WifiOff } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-4 py-20 text-center", className)}>
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-accent">
        {icon ?? <Inbox className="h-7 w-7" strokeWidth={1.25} />}
      </div>
      <h3 className="font-display text-2xl font-semibold text-fg">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-4 py-20 text-center", className)}>
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WifiOff className="h-7 w-7" strokeWidth={1.25} />
      </div>
      <h3 className="font-display text-2xl font-semibold text-fg">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
