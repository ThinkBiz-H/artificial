import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Field states: default · hover · focus (border + ring) · disabled ·
 * error (border, icon, aria-invalid, described message) · success.
 * Pill shape for single-line fields; card radius for multi-line.
 */
const fieldBase =
  "w-full border bg-surface px-5 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 ease-luxe placeholder:text-placeholder hover:border-border-strong focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted";

const stateClass = (error?: string, success?: boolean) =>
  error
    ? "border-danger pr-11 hover:border-danger focus:border-danger focus:ring-danger/10"
    : success
      ? "border-success pr-11 focus:border-success focus:ring-success/10"
      : "border-border";

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-label font-medium uppercase tracking-label text-fg-soft">
      {children}
      {required && (
        <span className="ml-0.5 text-accent" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

function FieldMessage({ id, error, hint, success }: { id: string; error?: string; hint?: string; success?: string }) {
  if (error)
    return (
      <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-danger" role="alert">
        <AlertCircle size={13} aria-hidden /> {error}
      </p>
    );
  if (success)
    return (
      <p id={id} className="mt-2 flex items-center gap-1.5 text-xs text-success">
        <CheckCircle2 size={13} aria-hidden /> {success}
      </p>
    );
  if (hint)
    return (
      <p id={id} className="mt-2 text-xs text-fg-muted">
        {hint}
      </p>
    );
  return null;
}

function StateIcon({ error, success }: { error?: string; success?: boolean }) {
  if (!error && !success) return null;
  return (
    <span className={cn("pointer-events-none absolute right-4 top-1/2 -translate-y-1/2", error ? "text-danger" : "text-success")} aria-hidden>
      {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
    </span>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  /** Success state — pass a message (or true) once the value is validated. */
  success?: string | boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, label, hint, success, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id || props.name || autoId;
  const msgId = `${inputId}-msg`;
  const hasMsg = !!(error || hint || typeof success === "string");
  return (
    <div className="w-full">
      {label && (
        <FieldLabel htmlFor={inputId} required={props.required}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error || undefined}
          aria-describedby={hasMsg ? msgId : undefined}
          className={cn(fieldBase, "h-12 rounded-input", stateClass(error, !!success), className)}
          {...props}
        />
        <StateIcon error={error} success={!!success} />
      </div>
      <FieldMessage id={msgId} error={error} hint={hint} success={typeof success === "string" ? success : undefined} />
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string; label?: string; hint?: string }
>(({ className, error, label, hint, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id || props.name || autoId;
  const msgId = `${inputId}-msg`;
  return (
    <div className="w-full">
      {label && (
        <FieldLabel htmlFor={inputId} required={props.required}>
          {label}
        </FieldLabel>
      )}
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? msgId : undefined}
        className={cn(fieldBase, "rounded-input py-3.5", stateClass(error), "pr-5", className)}
        {...props}
      />
      <FieldMessage id={msgId} error={error} hint={hint} />
    </div>
  );
});
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }>(
  ({ className, label, id, children, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id || props.name || autoId;
    return (
      <div className="w-full">
        {label && <FieldLabel htmlFor={inputId}>{label}</FieldLabel>}
        <select id={inputId} ref={ref} className={cn(fieldBase, "h-12 cursor-pointer rounded-input border-border pr-10", className)} {...props}>
          {children}
        </select>
      </div>
    );
  },
);
Select.displayName = "Select";
