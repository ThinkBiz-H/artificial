import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMobileLoginRequestOtp, useMobileLoginVerifyOtp } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth.store";
import { AuthShell } from "@/components/layout/AuthShell";
import { OtpInput, ResendOtp, useResendTimer } from "@/components/auth/OtpInput";
import { Seo } from "@/components/common/Seo";
import { getErrorMessage } from "@/lib/utils";

/**
 * OTP login for returning customers (existing /auth/mobile/login + verify
 * endpoints). Accounts are created automatically at first checkout, so an
 * unregistered number gets pointed to the shop instead.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [otpSentAt, setOtpSentAt] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);

  const requestOtp = useMobileLoginRequestOtp();
  const verifyOtp = useMobileLoginVerifyOtp();
  const secondsLeft = useResendTimer(step === "otp", otpSentAt);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || "/account";
      navigate(from, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const sendOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }
    setMobileError(null);
    requestOtp.mutate(
      { mobile },
      {
        onSuccess: () => {
          setOtpError(null);
          setOtpSentAt(Date.now());
          setStep("otp");
        },
        onError: (err) => setMobileError(getErrorMessage(err)),
      },
    );
  };

  const handleVerify = (otp: string) => {
    setOtpError(null);
    verifyOtp.mutate({ mobile, otp }, { onError: (err) => setOtpError(getErrorMessage(err)) });
  };

  return (
    <>
      <Seo title="Log in" noindex />
      <AuthShell
        eyebrow={step === "mobile" ? "Welcome" : "Verify"}
        title={step === "mobile" ? "Log in or continue" : "Enter the code"}
        subtitle={
          step === "mobile"
            ? "Use your mobile number to log in securely with a one-time password."
            : `We've sent a 6-digit code to +91 ${mobile}.`
        }
        footer={
          <>
            New here?{" "}
            <Link to="/register" state={location.state} className="font-semibold text-primary underline underline-offset-4">
              Create an account
            </Link>
            <span className="mt-2 block text-xs">Or simply check out — we create your account when you place your first order.</span>
          </>
        }
      >
        {step === "mobile" ? (
          <form onSubmit={sendOtp} noValidate className="space-y-5">
            <div>
              <label htmlFor="mobile" className="mb-1.5 block text-xs font-medium text-fg-soft">
                Mobile number
              </label>
              <div
                className={`flex h-12 items-center overflow-hidden rounded-xl border bg-surface focus-within:border-accent-soft focus-within:ring-2 focus-within:ring-accent-soft/15 ${mobileError ? "border-danger" : "border-border"}`}
              >
                <span className="flex h-full items-center border-r border-border bg-surface-muted px-3.5 text-sm font-medium text-fg">+91</span>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  aria-invalid={!!mobileError}
                  aria-describedby={mobileError ? "mobile-error" : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-base tracking-wide text-fg outline-none placeholder:text-placeholder"
                />
              </div>
              {mobileError && (
                <p id="mobile-error" className="mt-2 text-sm text-danger" role="alert">
                  {mobileError}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={requestOtp.isPending}>
              Send OTP
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-fg-muted">
              <ShieldCheck size={13} /> We never share your number
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <OtpInput onComplete={handleVerify} disabled={verifyOtp.isPending} error={otpError} resetKey={otpSentAt} />
            {otpError && (
              <p className="text-center text-sm text-danger" role="alert">
                {otpError}
              </p>
            )}
            {verifyOtp.isPending ? (
              <p className="flex items-center justify-center gap-2 text-sm text-fg-muted">
                <Loader2 size={16} className="animate-spin" /> Verifying…
              </p>
            ) : (
              <ResendOtp secondsLeft={secondsLeft} isResending={requestOtp.isPending} onResend={() => sendOtp()} />
            )}
            <button
              type="button"
              onClick={() => {
                setStep("mobile");
                setOtpError(null);
              }}
              className="mx-auto flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
            >
              <ArrowLeft size={14} /> Change mobile number
            </button>
          </div>
        )}
      </AuthShell>
    </>
  );
}
