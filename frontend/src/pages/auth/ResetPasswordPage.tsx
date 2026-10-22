import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const forgot = useForgotPasswordMobile();
  const verify = useVerifyResetOtp();
  const reset = useResetPasswordMobile();

  const sendOtp = () => {
    forgot.mutate(
      {
        mobile: getValues("mobile"),
      },
      {
        onSuccess: () => setStep(2),
      },
    );
  };

  const verifyOtp = () => {
    verify.mutate(
      {
        mobile: getValues("mobile"),
        otp: getValues("otp"),
      },
      {
        onSuccess: () => setStep(3),
      },
    );
  };

  const onSubmit = (data: FormValues) => {
    reset.mutate({
      mobile: data.mobile,
      otp: data.otp,
      password: data.password,
    });
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset Password"
      subtitle="Recover your account using mobile OTP."
      footer={<AuthLink to="/login">Back to Login</AuthLink>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Mobile Number"
          placeholder="9876543210"
          {...register("mobile")}
          error={errors.mobile?.message}
        />

        {step >= 2 && (
          <Input
            label="OTP"
            placeholder="123456"
            {...register("otp")}
            error={errors.otp?.message}
          />
        )}

        {step >= 3 && (
          <>
            <Input
              type="password"
              label="New Password"
              {...register("password")}
              error={errors.password?.message}
            />

            <Input
              type="password"
              label="Confirm Password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </>
        )}

        {step === 1 && (
          <Button
            type="button"
            className="w-full"
            onClick={sendOtp}
            isLoading={forgot.isPending}
          >
            Send OTP
          </Button>
        )}

        {step === 2 && (
          <Button
            type="button"
            className="w-full"
            onClick={verifyOtp}
            isLoading={verify.isPending}
          >
            Verify OTP
          </Button>
        )}

        {step === 3 && (
          <Button type="submit" className="w-full" isLoading={reset.isPending}>
            Reset Password
          </Button>
        )}
      </form>
    </AuthShell>
  );
}
