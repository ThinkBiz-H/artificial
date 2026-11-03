import { useState } from "react";
import { AlertTriangle, Bell, BellRing, History, LayoutTemplate, Pencil, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/useNotificationsAdmin";
import { useNotifications, useMarkSelfNotificationRead, useMarkAllSelfNotificationsRead } from "@/hooks/useNotificationsCount";
import { useCampaignSummary, useRetryFailedDeliveries } from "@/hooks/useNotificationCampaigns";
import type { NotificationCampaign } from "@/api/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatDateTime, cn, formatNumber } from "@/lib/utils";
import type { NotificationTemplate } from "@/types";
import { useNotificationStats } from "@/hooks/useAdminOps";
import { StatCard } from "@/components/common/StatCard";
import { CampaignComposer } from "./CampaignComposer";
import { CampaignHistory } from "./CampaignHistory";

const TABS = [
  { id: "compose", label: "Compose", icon: Send },
  { id: "history", label: "History", icon: History },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "inbox", label: "Inbox", icon: Bell },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Notification Center: compose & schedule push campaigns, history with analytics, templates and the admin inbox. */
export function NotificationsPage() {
  const [tab, setTab] = useState<TabId>("compose");
  const [editing, setEditing] = useState<NotificationCampaign | null>(null);
  const { data: summary, isLoading } = useCampaignSummary(30);

  return (
    <div>
      <PageHeader title="Notification Center" description="Push notifications to the app, scheduled campaigns, templates and delivery analytics" />

      {summary && !summary.push.configured && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
          <AlertTriangle size={16} className="mt-0.5 flex-none" />
          <p>
            <span className="font-medium">Firebase isn't configured on the server</span> — notifications are saved to customers' in-app inbox and logged, but
            no push reaches phones. Set <code className="rounded bg-white/60 px-1">FIREBASE_SERVICE_ACCOUNT</code> in the backend environment.
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Campaigns (30 days)" value={formatNumber(summary?.totals.campaigns)} isLoading={isLoading} />
        <StatCard label="Delivered" value={formatNumber(summary?.totals.delivered)} isLoading={isLoading} />
        <StatCard label="Opened" value={formatNumber(summary?.totals.opened)} isLoading={isLoading} />
        <StatCard label="Click rate" value={`${summary?.totals.clickRate ?? 0}%`} isLoading={isLoading} />
        <StatCard label="Scheduled" value={formatNumber(summary?.scheduled)} isLoading={isLoading} />
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors",
              tab === id ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <CampaignComposer
          key={editing?._id ?? "new"}
          editing={editing}
          topics={summary?.topics ?? ["all", "promotions"]}
          onDone={() => {
            setEditing(null);
            setTab("history");
          }}
        />
      )}
      {tab === "history" && (
        <CampaignHistory
          onEdit={(c) => {
            setEditing(c);
            setTab("compose");
          }}
        />
      )}
      {tab === "templates" && <TemplatesTab />}
      {tab === "inbox" && <InboxTab />}
    </div>
  );
}

const emptyForm = { type: "", channel: "push", subject: "", body: "", isActive: true, name: "", imageUrl: "", link: "" };

/** Notification templates per (type, channel). Push templates double as composer presets. */
function TemplatesTab() {
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: NotificationTemplate) => {
    setEditing(t);
    setForm({ type: t.type, channel: t.channel, subject: t.subject || "", body: t.body, isActive: t.isActive, name: t.name || "", imageUrl: t.imageUrl || "", link: t.link || "" });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const presets = form.channel === "push" ? { name: form.name, imageUrl: form.imageUrl, link: form.link } : {};
    if (editing) updateTemplate.mutate({ id: editing._id, values: { subject: form.subject, body: form.body, isActive: form.isActive, ...presets } }, { onSuccess: () => setModalOpen(false) });
    else createTemplate.mutate({ type: form.type, channel: form.channel, subject: form.subject, body: form.body, isActive: form.isActive, ...presets }, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div className="space-y-6">
      <DeliveryStats />
      <Card>
        <CardHeader
          title="Templates"
          description="Order, payment and wishlist notifications use the push template for their type. Switch one off to stop that push; push templates also appear as presets in Compose. Use {{name}}, {{title}}, {{message}}."
          action={<Button size="sm" onClick={openAdd}><Plus size={13} /> New template</Button>}
        />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !templates || templates.length === 0 ? (
            <EmptyState icon={<BellRing size={18} />} title="No templates yet" description="Built-in defaults are used until you add one." className="py-10" />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {templates.map((t) => (
                  <Tr key={t._id}>
                    <Td className="text-sm font-medium">{t.name ? `${t.name} · ` : ""}{t.type}</Td>
                    <Td className="text-sm text-muted">{t.channel}</Td>
                    <Td><Badge tone={t.isActive ? "success" : "neutral"}>{t.isActive ? "Active" : "Off"}</Badge></Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(t._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit template" : "New template"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Type" required disabled={!!editing} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} hint="e.g. order_shipped, flash_sale, back_in_stock" />
          <Select label="Channel" disabled={!!editing} value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>
            <option value="push">Push</option>
            <option value="in_app">In-app</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </Select>
          {form.channel === "push" && <Input label="Preset name (shown in Compose)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Weekend flash sale" />}
          <Input label={form.channel === "push" ? "Title" : "Subject (optional)"} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          <Textarea label="Body" required rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          {form.channel === "push" && (
            <>
              <Input label="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
              <Input label="Deep link (optional)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/sale" />
            </>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <Button type="submit" className="w-full" isLoading={createTemplate.isPending || updateTemplate.isPending}>
            Save template
          </Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteTemplate.mutate(deleteId, { onSuccess: () => setDeleteId(null) })} title="Delete template" confirmLabel="Delete" danger isLoading={deleteTemplate.isPending} />
    </div>
  );
}

/** The signed-in admin's own notifications. */
function InboxTab() {
  const { data: inbox, isLoading } = useNotifications();
  const markRead = useMarkSelfNotificationRead();
  const markAllRead = useMarkAllSelfNotificationsRead();
  return (
    <Card>
      <CardHeader title="Your notifications" action={inbox && inbox.notifications.length > 0 ? <Button size="sm" variant="ghost" onClick={() => markAllRead.mutate()}>Mark all read</Button> : undefined} />
      <CardBody className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !inbox || inbox.notifications.length === 0 ? (
          <EmptyState icon={<Bell size={18} />} title="No notifications" className="py-10" />
        ) : (
          <ul className="divide-y divide-border">
            {inbox.notifications.map((n) => (
              <li key={n._id} onClick={() => !n.isRead && markRead.mutate(n._id)} className={cn("flex cursor-pointer items-start gap-3 px-5 py-3", !n.isRead && "bg-surface/60")}>
                {!n.isRead && <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-ink" />}
                <div>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/** Delivery stats for the last 30 days: email/SMS/push jobs and in-app notifications. */
function DeliveryStats() {
  const { data, isLoading } = useNotificationStats(30);
  const retry = useRetryFailedDeliveries();
  const channels = Object.entries(data?.byChannel ?? {});
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Automatic sent (30d)" value={formatNumber(data?.totals.sent)} isLoading={isLoading} />
        <StatCard label="Failed" value={formatNumber(data?.totals.failed)} isLoading={isLoading} />
        <StatCard label="Queued" value={formatNumber(data?.totals.queued)} isLoading={isLoading} />
        <StatCard label="In-app delivered" value={formatNumber(data?.inApp.sent)} isLoading={isLoading} />
        <StatCard label="In-app opened" value={formatNumber(data?.inApp.read)} isLoading={isLoading} />
      </div>
      {(data?.totals.failed ?? 0) > 0 && (
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={() => retry.mutate()} isLoading={retry.isPending}>
            <RotateCcw size={13} /> Retry failed deliveries
          </Button>
        </div>
      )}
      {channels.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          {channels
            .map(([channel, c]) => `${channel.toUpperCase()}: ${c.sent} sent · ${c.failed} failed · ${c.pending + c.processing} queued`)
            .join("  |  ")}
        </p>
      )}
    </div>
  );
}
