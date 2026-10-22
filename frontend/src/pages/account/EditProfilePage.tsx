import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Loader2, User } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadProfileImage } from "@/hooks/useUser";
import { Input } from "@/components/ui/Input";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface FormValues {
  name: string;
  mobile?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export function EditProfilePage() {
  const { data: user, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>();

  useEffect(() => {
    if (user) reset({ name: user.name, mobile: user.mobile, city: user.city, state: user.state, country: user.country, pincode: user.pincode });
  }, [user, reset]);

  const onSubmit = (values: FormValues) => updateProfile.mutate(values, { onSuccess: () => navigate("/account/profile") });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl font-semibold text-fg">Edit Profile</h2>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User size={28} strokeWidth={1.25} className="text-accent" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-fg-inverse hover:bg-accent"
              aria-label="Change photo"
            >
              {uploadImage.isPending ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage.mutate(file);
              }}
            />
          </div>
          <p className="text-sm text-fg-muted">Upload a profile photo (JPG or PNG).</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <Input label="Full name" required {...register("name", { required: "Name is required" })} error={formState.errors.name?.message} />
          <Input label="Mobile" type="tel" inputMode="numeric" {...register("mobile")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register("city")} />
            <Input label="State" {...register("state")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Country" {...register("country")} />
            <Input label="Pincode" inputMode="numeric" {...register("pincode")} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={updateProfile.isPending}>
              Save changes
            </Button>
            <Link to="/account/profile" className={buttonClasses({ variant: "ghost" })}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
