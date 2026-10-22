import { useState } from "react";
import { Plus, Pencil, Trash2, Send, Bell } from "lucide-react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useBroadcast } from "@/hooks/useNotificationsAdmin";
import { useNotifications, useMarkSelfNotificationRead, useMarkAllSelfNotificationsRead } from "@/hooks/useNotificationsCount";
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
import { formatDateTime, cn } from "@/lib/utils";
import type { NotificationTemplate } from "@/types";
import { useNotificationStats } from "@/hooks/useAdminOps";
import { StatCard } from "@/components/common/StatCard";
import { formatNumber } from "@/lib/utils";

const emptyForm = { type: "", channel: "in_app", subject: "", body: "", isActive: true };

export function NotificationsPage() {
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const broadcast = useBroadcast();

  const { data: inbox, isLoading: loadingInbox } = useNotifications();
  const markRead = useMarkSelfNotificationRead();
  const markAllRead = useMarkAllSelfNotificationsRead();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [broadcastForm, setBroadcastForm] = useState({ audience: "all" as "all" | "admins", title: "", message: "" });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: NotificationTemplate) => { setEditing(t); setForm({ type: t.type, channel: t.channel, subject: t.subject || "", body: t.body, isActive: t.isActive }); setModalOpen(true); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateTemplate.mutate({ id: editing._id, values: { subject: form.subject, body: form.body, isActive: form.isActive } }, { onSuccess: () => setModalOpen(false) });
    else createTemplate.mutate(form, { onSuccess: () => setModalOpen(false) });
  };

  const submitBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    broadcast.mutate(broadcastForm, { onSuccess: () => setBroadcastForm({ audience: "all", title: "", message: "" }) });
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Templates, broadcasts, and your inbox" />
      <DeliveryStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Templates" action={<Button size="sm" onClick={openAdd}><Plus size={13} /> New template</Button>} />
          <CardBody className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !templates || templates.length === 0 ? (
              <EmptyState title="No templates yet" className="py-10" />
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
                      <Td className="text-sm font-medium">{t.type}</Td>
                      <Td className="text-sm text-muted">{t.channel}</Td>
                      <Td><Badge tone={t.isActive ? "success" : "neutral"}>{t.isActive ? "Active" : "Inactive"}</Badge></Td>
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

        <Card>
          <CardHeader title="Send broadcast" />
          <CardBody>
            <form onSubmit={submitBroadcast} className="space-y-3">
              <Select label="Audience" value={broadcastForm.audience} onChange={(e) => setBroadcastForm((f) => ({ ...f, audience: e.target.value as "all" | "admins" }))}>
                <option value="all">All users</option>
                <option value="admins">Admins only</option>
              </Select>
              <Input label="Title" required value={broadcastForm.title} onChange={(e) => setBroadcastForm((f) => ({ ...f, title: e.target.value }))} />
              <Textarea label="Message" required rows={3} value={broadcastForm.message} onChange={(e) => setBroadcastForm((f) => ({ ...f, message: e.target.value }))} />
              <Button type="submit" className="w-full" isLoading={broadcast.isPending}>
                <Send size={14} /> Send broadcast
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Your notifications" action={inbox && inbox.notifications.length > 0 ? <Button size="sm" variant="ghost" onClick={() => markAllRead.mutate()}>Mark all read</Button> : undefined} />
        <CardBody className="p-0">
          {loadingInbox ? (
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit template" : "New template"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Type" required disabled={!!editing} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} />
          <Select label="Channel" disabled={!!editing} value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>
            <option value="in_app">In-app</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </Select>
          <Input label="Subject (optional)" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          <Textarea label="Body" required rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
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

/** Delivery stats for the last 30 days: email/SMS/push jobs and in-app notifications. */
function DeliveryStats() {
  const { data, isLoading } = useNotificationStats(30);
  const channels = Object.entries(data?.byChannel ?? {});
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Sent (30 days)" value={formatNumber(data?.totals.sent)} isLoading={isLoading} />
        <StatCard label="Failed" value={formatNumber(data?.totals.failed)} isLoading={isLoading} />
        <StatCard label="Queued" value={formatNumber(data?.totals.queued)} isLoading={isLoading} />
        <StatCard label="In-app delivered" value={formatNumber(data?.inApp.sent)} isLoading={isLoading} />
        <StatCard label="In-app opened" value={formatNumber(data?.inApp.read)} isLoading={isLoading} />
      </div>
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
