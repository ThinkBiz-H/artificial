import * as React from "react";
import { cn } from "@/lib/utils";

export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 60;

/**
 * Six-box OTP entry. Auto-submits once when the sixth digit lands (typed or
 * pasted) — `lastSubmittedRef` guarantees a given code is only ever sent to
 * `onComplete` once, however many re-renders happen while verifying.
 * Bump `resetKey` (e.g. the time the OTP was sent) to clear the boxes.
 */
export function OtpInput({
  onComplete,
  disabled,
  error,
  resetKey,
  autoFocus = true,
}: {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: string | null;
  resetKey?: number;
  autoFocus?: boolean;
}) {
  const [digits, setDigits] = React.useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const lastSubmittedRef = React.useRef("");

  const reset = React.useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""));
    lastSubmittedRef.current = "";
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!autoFocus) return;
    return reset();
  }, [resetKey, reset, autoFocus]);

  // Failed verification: clear the boxes so the user can retry immediately.
  React.useEffect(() => {
    if (!error) return;
    return reset();
  }, [error, reset]);

  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH;

  React.useEffect(() => {
    if (!isComplete || disabled) return;
    if (lastSubmittedRef.current === code) return;
    lastSubmittedRef.current = code;
    onComplete(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isComplete, disabled]);

  const setDigitAt = (index: number, value: string) =>
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const clean = value.replace(/\D/g, "");
    if (!clean) return setDigitAt(index, "");
    // SMS autofill can deliver the whole code into one box; 2 digits just
    // means the user typed over an existing digit, so keep the newest.
    if (clean.length > 2) {
      const next = Array(OTP_LENGTH).fill("");
      clean
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((d, i) => (next[i] = d));
      setDigits(next);
      inputRefs.current[Math.min(clean.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    setDigitAt(index, clean[clean.length - 1]);
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="One-time password">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-12 w-11 flex-none rounded-xl border bg-surface text-center text-lg font-semibold text-fg outline-none transition-colors focus:border-accent-soft focus:ring-2 focus:ring-accent-soft/15 disabled:opacity-50 sm:h-14 sm:w-12",
            error ? "border-danger" : digit ? "border-fg/40" : "border-border",
          )}
        />
      ))}
    </div>
  );
}

/** Countdown for the "Resend OTP" link. Restarts whenever `resetKey` changes. */
export function useResendTimer(active: boolean, resetKey: number) {
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  React.useEffect(() => {
    setSecondsLeft(RESEND_SECONDS);
  }, [resetKey]);
  React.useEffect(() => {
    if (!active || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [active, secondsLeft]);
  return secondsLeft;
}

export function ResendOtp({
  secondsLeft,
  onResend,
  isResending,
}: {
  secondsLeft: number;
  onResend: () => void;
  isResending?: boolean;
}) {
  return (
    <div className="text-center text-sm">
      {secondsLeft > 0 ? (
        <p className="text-fg-muted">
          Didn't receive it? Resend in <span className="font-semibold tabular-nums text-fg">0:{String(secondsLeft).padStart(2, "0")}</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={isResending}
          className="font-semibold text-accent underline-offset-4 transition-colors hover:underline disabled:opacity-50"
        >
          {isResending ? "Resending…" : "Resend OTP"}
        </button>
      )}
    </div>
  );
}
