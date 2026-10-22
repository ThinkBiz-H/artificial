import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAdminProfile, useUpdateAdminProfile, useUploadAdminAvatar } from "@/hooks/useProfile";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { User, Camera } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DevicesCard } from "@/components/common/DevicesCard";
import { useMySessions, useRevokeMySession } from "@/hooks/useAdminOps";

interface FormShape {
  name: string;
  mobile: string;
}

export function ProfilePage() {
  const { data: mySessions } = useMySessions();
  const revokeMine = useRevokeMySession();
  const { data: user, isLoading } = useAdminProfile();
  const updateProfile = useUpdateAdminProfile();
  const uploadAvatar = useUploadAdminAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<FormShape>();

  useEffect(() => {
    if (user) reset({ name: user.name, mobile: user.mobile || "" });
  }, [user, reset]);

  const onSubmit = (values: FormShape) => updateProfile.mutate(values);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  if (isLoading || !user) return <Skeleton className="h-80 w-full" />;

  return (
    <div>
      <PageHeader title="Profile" description="Your admin account details" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardBody className="flex flex-col items-center py-8 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface">
                {user.profileImage?.url ? <img src={user.profileImage.url} alt={user.name} className="h-full w-full object-cover" /> : <User size={28} className="text-muted" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white" aria-label="Change photo">
                <Camera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink">{user.name}</h3>
            <p className="text-sm text-muted">{user.email}</p>
            <Badge className="mt-3">{user.role}</Badge>
            <p className="mt-4 text-xs text-muted">Member since {formatDate(user.createdAt)}</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Edit details" />
          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full name" required {...register("name", { required: true })} />
              <Input label="Mobile" {...register("mobile")} />
              <Button type="submit" isLoading={updateProfile.isPending}>Save changes</Button>
            </form>
          </CardBody>
        </Card>
      </div>
      <DevicesCard
        className="mt-6"
        sessions={mySessions}
        busy={revokeMine.isPending}
        logoutAllLabel="Log out other devices"
        onLogout={(id) => revokeMine.mutate(id)}
        onLogoutAll={() => revokeMine.mutate(undefined)}
      />
    </div>
  );
}
