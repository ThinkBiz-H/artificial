import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChangePassword } from "@/hooks/useAuth";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Include an uppercase letter").regex(/[a-z]/, "Include a lowercase letter").regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const changePassword = useChangePassword();

  const onSubmit = (values: FormValues) => {
    changePassword.mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword }, { onSuccess: () => reset() });
  };

  return (
    <div>
      <PageHeader title="Change password" />
      <Card className="max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Current password" type="password" {...register("currentPassword")} error={errors.currentPassword?.message} />
            <Input label="New password" type="password" {...register("newPassword")} error={errors.newPassword?.message} />
            <Input label="Confirm new password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
            <Button type="submit" isLoading={changePassword.isPending}>Update password</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
