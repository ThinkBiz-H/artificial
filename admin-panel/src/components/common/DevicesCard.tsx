import { LogOut, Monitor, Smartphone } from "lucide-react";
import type { DeviceSession } from "@/api/adminOps";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils";
import { describeUserAgent } from "@/lib/userAgent";

/** Active devices (sessions) with per-device and all-device logout. */
export function DevicesCard({
  sessions,
  onLogout,
  onLogoutAll,
  logoutAllLabel = "Log out all",
  busy,
  className,
}: {
  sessions: (DeviceSession & { isCurrent?: boolean })[] | undefined;
  onLogout: (sessionId: string) => void;
  onLogoutAll: () => void;
  logoutAllLabel?: string;
  busy?: boolean;
  className?: string;
}) {
  const others = sessions?.filter((s) => !s.isCurrent) ?? [];
  return (
    <Card className={className}>
      <CardHeader
        title="Active devices"
        description={sessions ? `${sessions.length} signed-in device${sessions.length === 1 ? "" : "s"}` : undefined}
        action={
          others.length > 0 ? (
            <Button size="sm" variant="outline" isLoading={busy} onClick={onLogoutAll}>
              <LogOut size={13} /> {logoutAllLabel}
            </Button>
          ) : undefined
        }
      />
      <CardBody className="p-0">
        {!sessions ? (
          <div className="p-5"><Skeleton className="h-24 w-full" /></div>
        ) : sessions.length === 0 ? (
          <p className="p-5 text-sm text-muted">Not signed in on any device.</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((d) => {
              const { browser, platform } = describeUserAgent(d.userAgent);
              const mobile = platform === "Android" || platform === "iOS";
              return (
                <li key={d._id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div className="flex min-w-0 gap-2.5">
                    {mobile ? <Smartphone size={15} className="mt-0.5 flex-none text-muted" /> : <Monitor size={15} className="mt-0.5 flex-none text-muted" />}
                    <div className="min-w-0">
                      <p className="truncate text-ink">
                        {browser} · {platform}
                        {d.isCurrent && <Badge tone="success" className="ml-2">This device</Badge>}
                      </p>
                      <p className="text-xs text-muted">
                        {d.ip || "—"} · last active {formatDateTime(d.lastUsedAt)} · signed in {formatDateTime(d.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!d.isCurrent && (
                    <Button size="sm" variant="ghost" onClick={() => onLogout(d._id)}>
                      Log out
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
