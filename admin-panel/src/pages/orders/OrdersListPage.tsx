import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Printer, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useOrderList } from "@/hooks/useOrders";
import { ordersApi } from "@/api/orders";
import { apiClient } from "@/api/client";
import { downloadReport } from "@/api/reports";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ItemOptions } from "@/components/common/ItemOptions";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

/** Opens the order's invoice PDF in a new tab (admins can view any order's invoice). */
async function openInvoice(orderId: string) {
  try {
    const res = await apiClient.get(`/orders/${orderId}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    window.open(url, "_blank", "noopener");
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    toast.error(getErrorMessage(err));
  }
}

export function OrdersListPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);

  const { data, isLoading } = useOrderList({
    page,
    limit: 15,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    paymentMethod: paymentMethod || undefined,
    orderNumber: orderNumber || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
    setSelected(new Set());
  };
  const orders = data?.orders ?? [];
  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o._id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const changeStatus = async (ids: string[], orderStatus: string) => {
    const results = await Promise.allSettled(ids.map((id) => ordersApi.updateStatus(id, { orderStatus, note: "Updated from the orders list" })));
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    ids.forEach((id) => qc.invalidateQueries({ queryKey: ["admin-order", id] }));
    if (failed.length === 0) toast.success(ids.length === 1 ? `Order marked ${orderStatus}` : `${ids.length} orders marked ${orderStatus}`);
    else toast.error(`${failed.length} of ${ids.length} could not be updated: ${getErrorMessage(failed[0].reason)}`);
  };

  const applyBulk = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setBulkBusy(true);
    await changeStatus([...selected], bulkStatus);
    setBulkBusy(false);
    setSelected(new Set());
    setBulkStatus("");
  };

  const exportOrders = async (format: "csv" | "excel") => {
    setExporting(format);
    try {
      await downloadReport("orders", format, { from: from || undefined, to: to || undefined });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={data ? `${data.pagination.total} orders` : undefined}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" isLoading={exporting === "csv"} onClick={() => exportOrders("csv")}>
              <Download size={14} /> CSV
            </Button>
            <Button variant="outline" size="sm" isLoading={exporting === "excel"} onClick={() => exportOrders("excel")}>
              <FileSpreadsheet size={14} /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2 border-b border-border p-4 print:hidden">
          <div className="min-w-48 flex-1">
            <SearchInput value={orderNumber} onChange={filter(setOrderNumber)} placeholder="Order number…" />
          </div>
          <Select value={status} onChange={(e) => filter(setStatus)(e.target.value)} className="w-44">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={paymentStatus} onChange={(e) => filter(setPaymentStatus)(e.target.value)} className="w-40">
            <option value="">All payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </Select>
          <Select value={paymentMethod} onChange={(e) => filter(setPaymentMethod)(e.target.value)} className="w-36">
            <option value="">All methods</option>
            <option value="cod">COD</option>
            <option value="razorpay">Razorpay</option>
          </Select>
          <Input type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} className="w-40" aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} className="w-40" aria-label="To date" />
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface/60 px-4 py-2.5 text-sm print:hidden">
            <span className="font-medium">{selected.size} selected</span>
            <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-44">
              <option value="">Change status to…</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Button size="sm" disabled={!bulkStatus} isLoading={bulkBusy} onClick={applyBulk}>Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<ShoppingCart size={18} />} title="No orders found" />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th className="w-8 print:hidden">
                    <input
                      type="checkbox"
                      aria-label="Select all orders on this page"
                      checked={allSelected}
                      onChange={() => setSelected(allSelected ? new Set() : new Set(orders.map((o) => o._id)))}
                    />
                  </Th>
                  <Th>Order</Th>
                  <Th>Items</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                  <Th className="text-right print:hidden">Quick actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {orders.map((order) => {
                  const customer = order.user && typeof order.user === "object" ? order.user.name : "Guest";
                  return (
                    <Tr key={order._id}>
                      <Td className="print:hidden">
                        <input type="checkbox" aria-label={`Select ${order.orderNumber}`} checked={selected.has(order._id)} onChange={() => toggle(order._id)} />
                      </Td>
                      <Td>
                        <Link to="/orders/$orderId" params={{ orderId: order._id }} className="font-mono text-xs hover:underline">
                          {order.orderNumber}
                        </Link>
                      </Td>
                      <Td>
                        {order.items?.[0] && (
                          <div className="flex min-w-[220px] items-center gap-3">
                            <div className="h-10 w-10 flex-none overflow-hidden rounded-md border border-border bg-surface">
                              {order.items[0].thumbnail && <img src={order.items[0].thumbnail} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-ink">
                                {order.items[0].title}
                                <span className="text-muted"> × {order.items[0].quantity}</span>
                              </p>
                              <ItemOptions item={order.items[0]} compact />
                              {order.items.length > 1 && (
                                <p className="text-xs text-muted">
                                  + {order.items.length - 1} more item{order.items.length > 2 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </Td>
                      <Td className="text-sm">{customer}</Td>
                      <Td className="text-sm text-muted">{formatDate(order.createdAt)}</Td>
                      <Td>
                        <Badge>{order.paymentStatus}</Badge>
                        <p className="mt-0.5 text-xs text-muted">{order.paymentMethod === "cod" ? "COD" : "Online"}</p>
                      </Td>
                      <Td>
                        <Badge>{order.orderStatus}</Badge>
                      </Td>
                      <Td className="text-right font-mono text-xs">{formatCurrency(order.grandTotal)}</Td>
                      <Td className="print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <Select
                            value=""
                            onChange={(e) => e.target.value && changeStatus([order._id], e.target.value)}
                            className="w-32 text-xs"
                            aria-label={`Change status of ${order.orderNumber}`}
                          >
                            <option value="">Set status…</option>
                            {ORDER_STATUSES.filter((s) => s !== order.orderStatus).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </Select>
                          <Button size="sm" variant="ghost" onClick={() => openInvoice(order._id)} aria-label="Invoice">
                            <Download size={14} />
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Pagination page={data!.pagination.page} totalPages={data!.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
