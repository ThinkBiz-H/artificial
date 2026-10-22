import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <div className={cn("border-b border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-label text-fg">{title}</span>
        <ChevronDown size={17} className={cn("flex-none text-fg-muted transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div id={id} hidden={!open} className="pb-5 text-sm leading-relaxed text-fg-soft">
        {children}
      </div>
    </div>
  );
}
