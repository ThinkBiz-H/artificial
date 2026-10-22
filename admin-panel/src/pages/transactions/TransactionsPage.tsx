import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { useTransactions } from "@/hooks/useAdminOps";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUSES = ["Created", "Success", "Failed", "Cancelled", "Retried", "Refund Initiated", "Refund Processing", "Refund Completed", "Refund Failed"];

const tone = (status: string): "success" | "danger" | "warning" | "info" | "neutral" =>
  status === "Success" || status === "Refund Completed"
    ? "success"
    : status.includes("Failed") || status === "Cancelled"
      ? "danger"
      : status === "Created" || status === "Retried"
        ? "neutral"
        : "warning";

/** Payment & refund history (PaymentTransaction log). */
export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isLoading } = useTransactions({
    page,
    limit: 20,
    q: q || undefined,
    status: status || undefined,
    type: type || undefined,
    from: from || undefined,
    to: to || undefined,
  });
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <div>
      <PageHeader title="Transactions" description="Every payment and refund recorded by the gateway" />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="min-w-56 flex-1">
            <SearchInput value={q} onChange={reset(setQ)} placeholder="Payment ID, Razorpay order or order number…" />
          </div>
          <Select value={type} onChange={(e) => reset(setType)(e.target.value)} className="w-36">
            <option value="">All types</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
          </Select>
          <Select value={status} onChange={(e) => reset(setStatus)(e.target.value)} className="w-44">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input type="date" value={from} onChange={(e) => reset(setFrom)(e.target.value)} className="w-40" aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => reset(setTo)(e.target.value)} className="w-40" aria-label="To date" />
        </div>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !data || data.transactions.length === 0 ? (
          <EmptyState icon={<CreditCard size={18} />} title="No transactions found" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Type</Th>
                  <Th>Gateway</Th>
                  <Th>Payment ID</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Refund</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.transactions.map((t) => (
                  <Tr key={t._id}>
                    <Td className="text-xs text-muted">{formatDateTime(t.createdAt)}</Td>
                    <Td>
                      {t.order ? (
                        <Link to="/orders/$orderId" params={{ orderId: t.order._id }} className="font-mono text-xs hover:underline">{t.order.orderNumber}</Link>
                      ) : "—"}
                    </Td>
                    <Td className="text-sm">{t.user?.name ?? "—"}</Td>
                    <Td className="text-xs capitalize">{t.type}</Td>
                    <Td className="text-xs">{t.order?.paymentMethod === "cod" ? "COD" : "Razorpay"}{t.method ? ` · ${t.method}` : ""}</Td>
                    <Td className="font-mono text-xs">{t.razorpayRefundId || t.razorpayPaymentId || t.razorpayOrderId || "—"}</Td>
                    <Td className="text-right font-mono text-xs">{formatCurrency(t.amount)}</Td>
                    <Td>
                      <Badge tone={tone(t.status)}>{t.status}</Badge>
                      {t.failureReason && <p className="mt-0.5 max-w-48 truncate text-xs text-danger" title={t.failureReason}>{t.failureReason}</p>}
                    </Td>
                    <Td className="text-xs">{t.order?.returnRequest?.refund?.status ?? "—"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
