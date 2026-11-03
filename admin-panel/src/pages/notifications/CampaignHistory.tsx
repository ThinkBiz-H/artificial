import { useState } from "react";
import { Ban, Copy, Loader2, MoreHorizontal, Pencil, RotateCcw, Send, Trash2, BellRing } from "lucide-react";
import type { NotificationCampaign } from "@/api/notifications";
import { useCampaignAction, useCampaigns } from "@/hooks/useNotificationCampaigns";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { CATEGORY_LABELS, STATUS_TONE } from "./campaignMeta";
import { PushPreview } from "./PushPreview";

type Action = "send" | "retry" | "cancel" | "duplicate" | "delete";

const audienceLabel = (c: NotificationCampaign) =>
  c.audience.type === "all"
    ? "All customers"
    : c.audience.type === "admins"
      ? "Admins"
      : c.audience.type === "topic"
        ? `Topic: ${c.audience.topic}`
        : `${c.audience.userIds.length} customer(s)`;

const clickRate = (c: NotificationCampaign) => (c.stats.delivered ? `${((c.stats.opened / c.stats.delivered) * 100).toFixed(1)}%` : "—");

export function CampaignHistory({ onEdit }: { onEdit: (campaign: NotificationCampaign) => void }) {
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCampaigns({ status: status || undefined, category: category || undefined, page, limit: 15 });
  const action = useCampaignAction();
  const [confirm, setConfirm] = useState<{ campaign: NotificationCampaign; action: Action } | null>(null);
  const [viewing, setViewing] = useState<NotificationCampaign | null>(null);
  const [menu, setMenu] = useState<string | null>(null);

  const run = (campaign: NotificationCampaign, a: Action) => {
    setMenu(null);
    if (a === "duplicate") return action.mutate({ id: campaign._id, action: a });
    setConfirm({ campaign, action: a });
  };

  const confirmText: Record<Action, { title: string; label: string; danger?: boolean }> = {
    send: { title: "Send this notification now?", label: "Send now" },
    retry: { title: "Retry this failed notification?", label: "Retry" },
    cancel: { title: "Cancel this scheduled notification?", label: "Cancel it", danger: true },
    delete: { title: "Delete this notification from history?", label: "Delete", danger: true },
    duplicate: { title: "", label: "" },
  };

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
        <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          {Object.keys(STATUS_TONE).map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <Select label="Type" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-44">
          <option value="">All types</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <CardBody className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !data?.campaigns.length ? (
          <EmptyState icon={<BellRing size={18} />} title="No notifications yet" description="Notifications you send or schedule appear here with delivery and click stats." className="py-14" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Notification</Th>
                <Th>Audience</Th>
                <Th>Status</Th>
                <Th className="text-right">Delivered</Th>
                <Th className="text-right">Opened</Th>
                <Th className="text-right"><span className="sr-only">Actions</span></Th>
              </tr>
            </Thead>
            <Tbody>
              {data.campaigns.map((c) => {
                const editable = c.status === "draft" || c.status === "scheduled";
                return (
                  <Tr key={c._id} className="cursor-pointer" onClick={() => setViewing(c)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt="" className="h-10 w-16 flex-none rounded-md object-cover" />
                        ) : (
                          <span className="flex h-10 w-16 flex-none items-center justify-center rounded-md bg-surface text-muted"><BellRing size={14} /></span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{c.title}</p>
                          <p className="truncate text-xs text-muted">
                            {CATEGORY_LABELS[c.category]} · {c.status === "scheduled" && c.scheduledAt ? `scheduled ${formatDateTime(c.scheduledAt)}` : c.sentAt ? formatDateTime(c.sentAt) : formatDateTime(c.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm text-muted">{audienceLabel(c)}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[c.status]}>
                        {c.status === "sending" && <Loader2 size={11} className="mr-1 animate-spin" />}
                        {c.status[0].toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </Td>
                    <Td className="text-right text-sm tabular-nums">
                      {c.audience.type === "topic" && c.status === "sent" ? "Topic" : formatNumber(c.stats.delivered)}
                      {c.stats.failed > 0 && <span className="block text-xs text-danger">{formatNumber(c.stats.failed)} failed</span>}
                    </Td>
                    <Td className="text-right text-sm tabular-nums">
                      {formatNumber(c.stats.opened)}
                      <span className="block text-xs text-muted">{clickRate(c)}</span>
                    </Td>
                    <Td className="text-right">
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setMenu(menu === c._id ? null : c._id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Actions">
                          <MoreHorizontal size={15} />
                        </button>
                        {menu === c._id && (
                          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-white py-1 text-left shadow-lg">
                            {editable && <MenuItem icon={<Send size={13} />} label="Send now" onClick={() => run(c, "send")} />}
                            {editable && <MenuItem icon={<Pencil size={13} />} label="Edit" onClick={() => { setMenu(null); onEdit(c); }} />}
                            {c.status === "failed" && <MenuItem icon={<RotateCcw size={13} />} label="Retry" onClick={() => run(c, "retry")} />}
                            {c.status === "scheduled" && <MenuItem icon={<Ban size={13} />} label="Cancel schedule" onClick={() => run(c, "cancel")} />}
                            <MenuItem icon={<Copy size={13} />} label="Duplicate" onClick={() => run(c, "duplicate")} />
                            {c.status !== "sending" && <MenuItem icon={<Trash2 size={13} />} label="Delete" danger onClick={() => run(c, "delete")} />}
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
        {data && data.pagination.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </div>
        )}
      </CardBody>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && action.mutate({ id: confirm.campaign._id, action: confirm.action }, { onSuccess: () => setConfirm(null) })}
        title={confirm ? confirmText[confirm.action].title : ""}
        description={confirm?.campaign.title}
        confirmLabel={confirm ? confirmText[confirm.action].label : ""}
        danger={confirm ? confirmText[confirm.action].danger : false}
        isLoading={action.isPending}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Notification details">
        {viewing && <CampaignDetail campaign={viewing} />}
      </Modal>
    </Card>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface ${danger ? "text-danger" : "text-ink"}`}>
      {icon} {label}
    </button>
  );
}

function CampaignDetail({ campaign: c }: { campaign: NotificationCampaign }) {
  const rows: [string, string][] = [
    ["Status", c.status],
    ["Type", CATEGORY_LABELS[c.category]],
    ["Audience", audienceLabel(c)],
    ["Opens", c.link || "Notifications screen"],
    ["Created", `${formatDateTime(c.createdAt)}${c.createdBy ? ` by ${c.createdBy.name}` : ""}`],
    ...(c.scheduledAt ? ([["Scheduled for", formatDateTime(c.scheduledAt)]] as [string, string][]) : []),
    ...(c.sentAt ? ([["Sent", formatDateTime(c.sentAt)]] as [string, string][]) : []),
    ...(c.provider ? ([["Delivery", c.provider === "firebase" ? "Firebase Cloud Messaging" : "Not sent — Firebase not configured (logged only)"]] as [string, string][]) : []),
  ];
  const stats: [string, number | string][] = [
    ["Customers", c.stats.targetedUsers],
    ["Devices", c.stats.devices],
    ["Delivered", c.stats.delivered],
    ["Failed", c.stats.failed],
    ["Stale devices removed", c.stats.invalidTokensRemoved],
    ["In-app copies", c.stats.inApp],
    ["Opened", c.stats.opened],
    ["Click rate", clickRate(c)],
  ];
  return (
    <div className="space-y-5">
      <PushPreview title={c.title} body={c.body} imageUrl={c.imageUrl} />
      {c.error && <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{c.error}</p>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{typeof value === "number" ? formatNumber(value) : value}</p>
          </div>
        ))}
      </div>
      <dl className="divide-y divide-border rounded-xl border border-border text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-3 py-2">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
