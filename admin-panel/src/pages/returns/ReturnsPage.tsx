import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, RotateCcw, X } from "lucide-react";
import { useReturns, useUpdateReturn } from "@/hooks/useAdminOps";
import type { ReturnOrder, ReturnRequest } from "@/api/adminOps";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

const RETURN_STATUSES: ReturnRequest["status"][] = ["Requested", "Approved", "Rejected", "Picked Up", "Received", "Completed"];
const REFUND_STATUSES: ReturnRequest["refund"]["status"][] = ["Not Applicable", "Pending", "Processing", "Completed", "Failed"];
const REFUND_METHODS = ["Original Payment Method", "Bank Transfer", "Store Credit"];

const returnTone = (s: string) => (s === "Rejected" ? "danger" : s === "Completed" ? "success" : s === "Requested" ? "warning" : "info");
const refundTone = (s: string) => (s === "Completed" ? "success" : s === "Failed" ? "danger" : s === "Not Applicable" ? "neutral" : "warning");

/** Return requests and their refunds (Order.returnRequest). */
export function ReturnsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [refundStatus, setRefundStatus] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useReturns({ page, limit: 20, status: status || undefined, refundStatus: refundStatus || undefined });
  const open = data?.orders.find((o) => o._id === openId) ?? null;

  return (
    <div>
      <PageHeader title="Returns & refunds" description="Review return requests and track their refunds" />
      <Card>
        <div className="flex flex-wrap gap-2 border-b border-border p-4">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
            <option value="">All return statuses</option>
            {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={refundStatus} onChange={(e) => { setRefundStatus(e.target.value); setPage(1); }} className="w-44">
            <option value="">All refund statuses</option>
            {REFUND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !data || data.orders.length === 0 ? (
          <EmptyState icon={<RotateCcw size={18} />} title="No return requests" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Requested</Th>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Reason</Th>
                  <Th>Return</Th>
                  <Th>Refund</Th>
                  <Th className="text-right">Order total</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.orders.map((o) => (
                  <Tr key={o._id} className="cursor-pointer" onClick={() => setOpenId(o._id)}>
                    <Td className="text-xs text-muted">{formatDate(o.returnRequest.requestedAt)}</Td>
                    <Td className="font-mono text-xs">{o.orderNumber}</Td>
                    <Td className="text-sm">{o.user?.name ?? "—"}</Td>
                    <Td className="max-w-56 truncate text-sm">{o.returnRequest.reason}</Td>
                    <Td><Badge tone={returnTone(o.returnRequest.status)}>{o.returnRequest.status}</Badge></Td>
                    <Td><Badge tone={refundTone(o.returnRequest.refund.status)}>{o.returnRequest.refund.status}</Badge></Td>
                    <Td className="text-right font-mono text-xs">{formatCurrency(o.grandTotal)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
      {open && <ReturnModal order={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function ReturnModal({ order, onClose }: { order: ReturnOrder; onClose: () => void }) {
  const rr = order.returnRequest;
  const update = useUpdateReturn();
  const [comment, setComment] = useState(rr.adminComment ?? "");
  const [refundStatus, setRefundStatus] = useState(rr.refund.status);
  const [refundAmount, setRefundAmount] = useState(String(rr.refund.amount || order.grandTotal));
  const [refundMethod, setRefundMethod] = useState<string>(rr.refund.method ?? "Original Payment Method");
  const [note, setNote] = useState("");

  const setStatus = (status: ReturnRequest["status"]) =>
    update.mutate({ orderId: order._id, body: { status, adminComment: comment.trim() || undefined } });
  const saveRefund = () =>
    update.mutate({
      orderId: order._id,
      body: { refund: { status: refundStatus, amount: Number(refundAmount) || 0, method: refundMethod, note: note.trim() || undefined } },
    }, { onSuccess: () => setNote("") });

  const timeline = [
    { at: rr.requestedAt, label: "Return requested", detail: rr.reason },
    ...(rr.reviewedAt ? [{ at: rr.reviewedAt, label: `Marked ${rr.status}`, detail: rr.adminComment ?? "" }] : []),
    ...rr.refund.history.map((h) => ({ at: h.at, label: `Refund ${h.status} · ${formatCurrency(h.amount)}`, detail: h.note ?? "" })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <Modal open onClose={onClose} title={`Return · ${order.orderNumber}`}>
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={returnTone(rr.status)}>{rr.status}</Badge>
          <Badge tone={refundTone(rr.refund.status)}>Refund: {rr.refund.status}</Badge>
          <Link to="/orders/$orderId" params={{ orderId: order._id }} className="ml-auto text-xs font-medium hover:underline">Open order</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-muted">Customer</p><p>{order.user?.name ?? "—"}</p><p className="text-xs text-muted">{order.user?.email ?? order.user?.mobile ?? ""}</p></div>
          <div><p className="text-xs text-muted">Payment</p><p>{order.paymentMethod === "cod" ? "Cash on delivery" : "Online"} · {order.paymentStatus}</p><p className="text-xs text-muted">Total {formatCurrency(order.grandTotal)}</p></div>
        </div>

        <div>
          <p className="text-xs text-muted">Reason</p>
          <p className="font-medium">{rr.reason}</p>
          {rr.comment && <p className="mt-1 text-muted">{rr.comment}</p>}
        </div>

        {rr.images && rr.images.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs text-muted">Images</p>
            <div className="flex flex-wrap gap-2">
              {rr.images.map((img) => (
                <a key={img.url} href={img.url} target="_blank" rel="noreferrer">
                  <img src={img.url} alt="Return evidence" className="h-20 w-20 rounded-lg border border-border object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-xs text-muted">Items</p>
          <ul className="space-y-1">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between"><span>{i.title}</span><span className="text-muted">× {i.quantity}</span></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-xs text-muted">Timeline</p>
          <ol className="space-y-2 border-l border-border pl-4">
            {timeline.map((t, i) => (
              <li key={i}>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted">{formatDateTime(t.at)}{t.detail ? ` · ${t.detail}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Decision</p>
          <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Note for the customer (optional)" />
          <div className="flex flex-wrap gap-2">
            {rr.status === "Requested" && (
              <>
                <Button size="sm" isLoading={update.isPending} onClick={() => setStatus("Approved")}><Check size={14} /> Approve</Button>
                <Button size="sm" variant="danger" isLoading={update.isPending} onClick={() => setStatus("Rejected")}><X size={14} /> Reject</Button>
              </>
            )}
            <Select value={rr.status} onChange={(e) => setStatus(e.target.value as ReturnRequest["status"])} className="w-40">
              {RETURN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Refund</p>
          <div className="grid grid-cols-2 gap-2">
            <Select value={refundStatus} onChange={(e) => setRefundStatus(e.target.value as ReturnRequest["refund"]["status"])}>
              {REFUND_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input type="number" min={0} max={order.grandTotal} step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} aria-label="Refund amount" />
            <Select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className="col-span-2">
              {REFUND_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Refund note / reference (optional)" className="col-span-2" />
          </div>
          <p className="text-xs text-muted">
            Records the refund status. Razorpay refunds are issued from the Razorpay dashboard; its webhook updates this automatically.
          </p>
          <Button size="sm" isLoading={update.isPending} onClick={saveRefund}>Save refund</Button>
        </div>
      </div>
    </Modal>
  );
}
