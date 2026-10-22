import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChangePassword } from "@/hooks/useAuth";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const changePassword = useChangePassword();

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="max-w-xl">
      <h2 className="mb-6 font-display text-3xl font-semibold text-fg">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border border-border bg-surface p-6 sm:p-8">
        <Input label="Current password" type="password" {...register("currentPassword")} error={errors.currentPassword?.message} />
        <Input label="New password" type="password" {...register("newPassword")} error={errors.newPassword?.message} />
        <Input label="Confirm new password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        <Button type="submit" isLoading={changePassword.isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}
