import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useProfile } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { buttonClasses } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export function ProfilePage() {
  const { data: user, isLoading, isError, refetch } = useProfile();

  if (isLoading) return <Skeleton className="h-72 w-full" />;
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />;

  const rows = [
    { label: "Full name", value: user.name },
    { label: "Mobile", value: user.mobile ? `+91 ${user.mobile}` : undefined },
    { label: "Email", value: user.email },
    { label: "City", value: user.city },
    { label: "State", value: user.state },
    { label: "Pincode", value: user.pincode },
    { label: "Member since", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold text-fg">Profile</h2>
        <Link to="/account/profile/edit" className={buttonClasses({ variant: "outline", size: "sm" })}>
          Edit profile
        </Link>
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full bg-surface-muted">
            {user.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User size={24} strokeWidth={1.25} className="text-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold text-fg">{user.name}</p>
            <p className="truncate text-sm text-fg-muted">{user.email || (user.mobile && `+91 ${user.mobile}`)}</p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-border border-t border-border text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4 py-3">
              <dt className="text-fg-muted">{r.label}</dt>
              <dd className="text-right text-fg">{r.value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
      {user.email && (
        <p className="mt-4 text-sm text-fg-muted">
          Use a password as well?{" "}
          <Link to="/account/change-password" className="text-fg underline underline-offset-4">
            Change password
          </Link>
        </p>
      )}
    </div>
  );
}
