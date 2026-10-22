import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth.store";
import { useMergeGuestCartIntoServer } from "@/hooks/useCart";
import { getErrorMessage } from "@/lib/utils";
import { AuthShell, AuthLink } from "@/components/layout/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput, ResendOtp, useResendTimer } from "@/components/auth/OtpInput";
import { Seo } from "@/components/common/Seo";

interface FormValues {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

/**
 * Account registration — existing /auth/register (sends a mobile OTP) →
 * /auth/verify-otp (marks the number verified) → /auth/login with the
 * credentials just entered, so the customer lands signed in.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const mergeGuestCart = useMergeGuestCartIntoServer();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [values, setValues] = useState<FormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState(0);
  const secondsLeft = useResendTimer(step === "otp", sentAt);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (isAuthenticated) navigate((location.state as { from?: string })?.from || "/account", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = async (v: FormValues) => {
    setSubmitting(true);
    try {
      await authApi.register({ name: v.name.trim(), email: v.email.trim(), mobile: v.mobile, password: v.password });
      setValues(v);
      setSentAt(Date.now());
      setOtpError(null);
      setStep("otp");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (otp: string) => {
    if (!values) return;
    setVerifying(true);
    setOtpError(null);
    try {
      await authApi.verifyOtp({ mobile: values.mobile, otp });
      const res = await authApi.login({ email: values.email.trim(), password: values.password });
      setUser(res.data.user);
      await mergeGuestCart.mutateAsync();
      qc.invalidateQueries();
      toast.success(`Welcome, ${res.data.user.name.split(" ")[0]}!`);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (!values) return;
    setResending(true);
    try {
      await authApi.resendOtp({ mobile: values.mobile });
      setSentAt(Date.now());
      toast.success("OTP resent");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Seo title="Create account" noindex />
      <AuthShell
        eyebrow={step === "details" ? "Join us" : "Verify"}
        title={step === "details" ? "Create your account" : "Enter the code"}
        subtitle={
          step === "details"
            ? "Save your favourites, track orders and check out faster."
            : `We've sent a 6-digit code to +91 ${values?.mobile}.`
        }
        footer={
          <>
            Already have an account? <AuthLink to="/login">Log in</AuthLink>
          </>
        }
      >
        {step === "details" ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label="Full name" required autoComplete="name" {...register("name", { required: "Please enter your name" })} error={errors.name?.message} />
            <Input
              label="Email"
              required
              type="email"
              autoComplete="email"
              {...register("email", { required: "Please enter your email", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })}
              error={errors.email?.message}
            />
            <Input
              label="Mobile number"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile"
              {...register("mobile", { required: "Please enter your mobile number", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" } })}
              error={errors.mobile?.message}
            />
            <Input
              label="Password"
              required
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters, with a letter and a number"
              {...register("password", {
                required: "Please choose a password",
                validate: (v) => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) || "At least 8 characters, with a letter and a number",
              })}
              error={errors.password?.message}
            />
            <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
              Create account
            </Button>
            <p className="text-center text-xs text-fg-muted">
              By continuing you agree to our <Link to="/terms-conditions" className="underline">Terms</Link> and{" "}
              <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <OtpInput onComplete={onVerify} disabled={verifying} error={otpError} resetKey={sentAt} />
            {otpError && (
              <p className="text-center text-sm text-danger" role="alert">
                {otpError}
              </p>
            )}
            {verifying ? (
              <p className="flex items-center justify-center gap-2 text-sm text-fg-muted">
                <Loader2 size={16} className="animate-spin" /> Verifying…
              </p>
            ) : (
              <ResendOtp secondsLeft={secondsLeft} onResend={onResend} isResending={resending} />
            )}
            <button type="button" onClick={() => setStep("details")} className="mx-auto flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
              <ArrowLeft size={14} /> Edit details
            </button>
          </div>
        )}
      </AuthShell>
    </>
  );
}
