import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthShell, AuthLink } from "@/components/layout/AuthShell";

import {
  useForgotPasswordMobile,
  useVerifyResetOtp,
  useResetPasswordMobile,
} from "@/hooks/useAuth";

const schema = z
  .object({
    mobile: z.string().length(10, "Enter valid mobile number"),
    otp: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const forgotPassword = useForgotPasswordMobile();
  const verifyOtp = useVerifyResetOtp();
  const resetPassword = useResetPasswordMobile();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mobile = watch("mobile");

  const sendOtp = (data: FormValues) => {
    forgotPassword.mutate(
      {
        mobile: data.mobile,
      },
      {
        onSuccess: () => {
          setStep(2);
        },
      },
    );
  };

  const verify = (data: FormValues) => {
    verifyOtp.mutate(
      {
        mobile: data.mobile,
        otp: data.otp!,
      },
      {
        onSuccess: () => {
          setStep(3);
        },
      },
    );
  };

  const reset = (data: FormValues) => {
    resetPassword.mutate(
      {
        mobile: data.mobile,
        otp: data.otp!,
        password: data.password!,
      },
      {
        onSuccess: () => {
          navigate("/login");
        },
      },
    );
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset Password"
      subtitle="Recover your account using your registered mobile number."
      footer={<AuthLink to="/login">Back to Login</AuthLink>}
    >
      <form className="space-y-5">
        <Input
          label="Mobile Number"
          type="tel"
          placeholder="9876543210"
          disabled={step > 1}
          {...register("mobile")}
          error={errors.mobile?.message}
        />

        {step >= 2 && (
          <Input
            label="OTP"
            placeholder="Enter 6 digit OTP"
            {...register("otp")}
            error={errors.otp?.message}
          />
        )}

        {step === 3 && (
          <>
            <Input
              type="password"
              label="New Password"
              placeholder="********"
              {...register("password")}
              error={errors.password?.message}
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="********"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </>
        )}

        {step === 1 && (
          <Button
            type="button"
            className="w-full"
            size="lg"
            isLoading={forgotPassword.isPending}
            onClick={handleSubmit(sendOtp)}
          >
            Send OTP
          </Button>
        )}

        {step === 2 && (
          <>
            <Button
              type="button"
              className="w-full"
              size="lg"
              isLoading={verifyOtp.isPending}
              onClick={handleSubmit(verify)}
            >
              Verify OTP
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                forgotPassword.mutate({
                  mobile,
                })
              }
            >
              Resend OTP
            </Button>
          </>
        )}

        {step === 3 && (
          <Button
            type="button"
            className="w-full"
            size="lg"
            isLoading={resetPassword.isPending}
            onClick={handleSubmit(reset)}
          >
            Reset Password
          </Button>
        )}
      </form>
    </AuthShell>
  );
}
