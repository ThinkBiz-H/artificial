import { Modal } from "@/components/ui/Modal";
import { Loader2, ShieldCheck } from "lucide-react";
import { OtpInput, ResendOtp, useResendTimer } from "@/components/auth/OtpInput";

/** Checkout's mobile-verification step (guest checkout). */
export function OtpModal({
  open,
  onClose,
  mobile,
  sentAt,
  isVerifying,
  isResending,
  error,
  onVerify,
  onResend,
}: {
  open: boolean;
  onClose: () => void;
  mobile: string;
  /** Bump this (e.g. Date.now()) whenever a fresh OTP is sent, to reset the resend timer. */
  sentAt: number;
  isVerifying: boolean;
  isResending: boolean;
  error?: string | null;
  onVerify: (otp: string) => void;
  onResend: () => void;
}) {
  const secondsLeft = useResendTimer(open, sentAt);

  return (
    <Modal open={open} onClose={onClose} title="Verify your mobile" className="max-w-md">
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg bg-surface-muted/60 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-accent" strokeWidth={1.5} />
          <p className="text-sm leading-relaxed text-fg-soft">
            Enter the 6-digit code sent to <span className="font-semibold text-fg">+91 {mobile}</span>. Verifying creates
            your account (or signs you in) and places your order.
          </p>
        </div>

        {open && <OtpInput onComplete={onVerify} disabled={isVerifying} error={error} resetKey={sentAt} />}

        {error && (
          <p className="text-center text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {isVerifying ? (
          <p className="flex items-center justify-center gap-2 text-sm text-fg-muted">
            <Loader2 size={16} className="animate-spin" /> Verifying and placing your order…
          </p>
        ) : (
          <ResendOtp secondsLeft={secondsLeft} onResend={onResend} isResending={isResending} />
        )}
      </div>
    </Modal>
  );
}
