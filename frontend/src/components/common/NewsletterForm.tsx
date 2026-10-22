import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { contactApi } from "@/api/contact";
import { cn, getErrorMessage } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter sign-up. There is no dedicated newsletter endpoint, so the
 * request goes through the existing public contact API as an inquiry of
 * type "Newsletter" — it appears in Admin > Contact Inquiries.
 */
export function NewsletterForm({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return setError("Please enter a valid email address");
    setError(null);
    setStatus("loading");
    try {
      await contactApi.submit({
        inquiryType: "Newsletter",
        name: "Newsletter subscriber",
        email: value,
        phone: "Not provided",
        subject: "Newsletter subscription",
        message: `Please add ${value} to the newsletter mailing list.`,
      });
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      toast.error(getErrorMessage(err));
    }
  };

  const dark = tone === "dark";

  if (status === "done") {
    return (
      <p className={cn("flex items-center gap-2 text-sm", dark ? "text-fg-inverse" : "text-fg", className)} role="status">
        <CheckCircle2 size={18} className="text-accent-soft" /> Thank you — you're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={className}>
      <div className={cn("flex border-b", dark ? "border-fg-inverse/40 focus-within:border-fg-inverse" : "border-fg/30 focus-within:border-primary")}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          autoComplete="email"
          className={cn(
            "h-12 min-w-0 flex-1 bg-transparent text-sm outline-none",
            dark ? "text-fg-inverse placeholder:text-fg-inverse/55" : "text-fg placeholder:text-placeholder",
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "flex flex-none items-center gap-2 pl-4 text-xs font-semibold uppercase tracking-eyebrow transition-colors disabled:opacity-60",
            dark ? "text-fg-inverse hover:text-accent-light" : "text-fg hover:text-accent",
          )}
        >
          {status === "loading" && <Loader2 size={14} className="animate-spin" />}
          Subscribe
        </button>
      </div>
      {error && <p className={cn("mt-2 text-xs", dark ? "text-accent-light" : "text-danger")}>{error}</p>}
    </form>
  );
}
