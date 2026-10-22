import { useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { useReplyTicket, useTickets, useUpdateTicket } from "@/hooks/useAdminOps";
import { useStaffList } from "@/hooks/useStaff";
import type { SupportTicket, TicketPriority, TicketStatus } from "@/api/adminOps";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { cn, formatDateTime } from "@/lib/utils";

const STATUSES: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];
const PRIORITIES: TicketPriority[] = ["Low", "Normal", "High", "Urgent"];
const statusTone = (s: TicketStatus) => (s === "Open" ? "warning" : s === "In Progress" ? "info" : s === "Resolved" ? "success" : "neutral");
const priorityTone = (p: TicketPriority) => (p === "Urgent" ? "danger" : p === "High" ? "warning" : p === "Low" ? "neutral" : "info");

/** Support tickets — the storefront contact form's inquiries. */
export function SupportPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useTickets({ page, limit: 20, q: q || undefined, status: status || undefined, priority: priority || undefined });
  const open = data?.inquiries.find((t) => t._id === openId) ?? null;

  return (
    <div>
      <PageHeader title="Support" description="Customer questions from the contact form" />
      <div className="mb-4 flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium",
              status === s ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:bg-surface",
            )}
          >
            {s || "All"}
            {s && data?.counts?.[s] ? <span className="ml-1.5 text-xs opacity-70">{data.counts[s]}</span> : null}
          </button>
        ))}
      </div>
      <Card>
        <div className="flex flex-wrap gap-2 border-b border-border p-4">
          <div className="min-w-56 flex-1">
            <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Name, email, phone or subject…" />
          </div>
          <Select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="w-40">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !data || data.inquiries.length === 0 ? (
          <EmptyState icon={<LifeBuoy size={18} />} title="No tickets" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Received</Th>
                  <Th>From</Th>
                  <Th>Subject</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Assigned</Th>
                  <Th className="text-right">Replies</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.inquiries.map((t) => (
                  <Tr key={t._id} onClick={() => setOpenId(t._id)}>
                    <Td className="text-xs text-muted">{formatDateTime(t.createdAt)}</Td>
                    <Td className="text-sm">{t.name}<p className="text-xs text-muted">{t.email}</p></Td>
                    <Td className="max-w-64 truncate text-sm">{t.subject}<p className="text-xs text-muted">{t.inquiryType}</p></Td>
                    <Td><Badge tone={priorityTone(t.priority)}>{t.priority}</Badge></Td>
                    <Td><Badge tone={statusTone(t.status)}>{t.status}</Badge></Td>
                    <Td className="text-sm">{t.assignedTo?.name ?? <span className="text-muted">Unassigned</span>}</Td>
                    <Td className="text-right text-xs">{t.replies.length}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
      {open && <TicketModal ticket={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function TicketModal({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const update = useUpdateTicket();
  const reply = useReplyTicket();
  const { data: staff } = useStaffList();
  const [message, setMessage] = useState("");

  return (
    <Modal open onClose={onClose} title={ticket.subject}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <label className="space-y-1">
            <span className="text-xs text-muted">Status</span>
            <Select value={ticket.status} onChange={(e) => update.mutate({ id: ticket._id, body: { status: e.target.value as TicketStatus } })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted">Priority</span>
            <Select value={ticket.priority} onChange={(e) => update.mutate({ id: ticket._id, body: { priority: e.target.value as TicketPriority } })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted">Assign to</span>
            <Select value={ticket.assignedTo?._id ?? ""} onChange={(e) => update.mutate({ id: ticket._id, body: { assignedTo: e.target.value || null } })}>
              <option value="">Unassigned</option>
              {(staff ?? []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </Select>
          </label>
        </div>

        <div className="rounded-lg bg-surface p-3">
          <p className="text-xs text-muted">{ticket.name} · {ticket.email} · {ticket.phone} · {formatDateTime(ticket.createdAt)}</p>
          <p className="mt-2 whitespace-pre-line text-ink">{ticket.message}</p>
        </div>

        {ticket.replies.length > 0 && (
          <ol className="space-y-2">
            {ticket.replies.map((r) => (
              <li key={r._id} className="ml-6 rounded-lg border border-border p-3">
                <p className="text-xs text-muted">{r.byName || "Staff"} · {formatDateTime(r.at)}{r.emailed ? " · emailed" : ""}</p>
                <p className="mt-1 whitespace-pre-line">{r.message}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="space-y-2">
          <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Reply to ${ticket.name} (sent by email)…`} />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!message.trim()}
              isLoading={reply.isPending}
              onClick={() => reply.mutate({ id: ticket._id, message }, { onSuccess: () => setMessage("") })}
            >
              <Send size={14} /> Send reply
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
