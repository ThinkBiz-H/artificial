import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOTION, useFocusTrap, useOverlay } from "./Modal";

/**
 * Slide-in panel used for the cart drawer, mobile navigation and the mobile
 * filter sheet. `side="bottom"` renders a bottom sheet (mobile filters).
 * Accessible dialog: labelled, focus trapped, Escape closes, focus restored.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  label,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right" | "bottom";
  title?: React.ReactNode;
  /** Accessible name when `title` isn't plain text. */
  label?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useOverlay(open, onClose);
  const panelRef = useFocusTrap(open);
  const titleId = React.useId();

  const offscreen = side === "left" ? { x: "-100%" } : side === "right" ? { x: "100%" } : { y: "100%" };
  const onscreen = side === "bottom" ? { y: 0 } : { x: 0 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.fast }}
            className="absolute inset-0 bg-surface-dark/45"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            ref={panelRef as React.Ref<HTMLElement>}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title !== undefined && !label ? titleId : undefined}
            aria-label={label}
            tabIndex={-1}
            initial={offscreen}
            animate={onscreen}
            exit={offscreen}
            transition={{ type: "tween", duration: MOTION.normal, ease: MOTION.ease }}
            className={cn(
              "absolute flex flex-col bg-surface shadow-lift outline-none",
              side === "left" && "left-0 top-0 h-full w-[88vw] max-w-sm",
              side === "right" && "right-0 top-0 h-full w-[92vw] max-w-md",
              side === "bottom" && "bottom-0 left-0 max-h-[88vh] w-full rounded-t-panel",
              className,
            )}
          >
            {side === "bottom" && <span className="mx-auto mt-3 h-1 w-10 flex-none rounded-pill bg-border" aria-hidden />}
            {title !== undefined && (
              <div className="flex flex-none items-center justify-between gap-4 border-b border-border px-6 py-5">
                <div id={titleId} className="min-w-0 font-display text-2xl text-fg">
                  {title}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-pill text-fg transition-colors hover:bg-surface-muted"
                >
                  <X size={19} />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="flex-none border-t border-border bg-surface px-6 py-5">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
