import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Truck, PackageCheck, XCircle, Mail, Printer } from "lucide-react";
import {
  useOrder,
  useUpdateOrderStatus,
  useCreateShipment,
  useRequestPickup,
  useCancelShipment,
  useResendOrderEmail,
} from "@/hooks/useOrders";
import { ordersApi } from "@/api/orders";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, Textarea, Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ItemOptions } from "@/components/common/ItemOptions";
import { ErrorState } from "@/components/ui/States";
import { formatCurrency, formatDate, formatDateTime, cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";
import { apiClient } from "@/api/client"; // ya jahan tumhara auth helper hai
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

export function OrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus(orderId);
  const createShipment = useCreateShipment(orderId);
  const requestPickup = useRequestPickup(orderId);
  const cancelShipment = useCancelShipment(orderId);
  const resendEmail = useResendOrderEmail(orderId);

  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !order) return <ErrorState onRetry={refetch} />;

  const customer = typeof order.user === "object" ? order.user : null;

  const submitStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStatus) return;
    updateStatus.mutate(
      {
        orderStatus: nextStatus,
        note: note || undefined,
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
      },
      {
        onSuccess: () => {
          setNextStatus("");
          setNote("");
          setTrackingNumber("");
          setTrackingUrl("");
        },
      },
    );
  };
  const downloadInvoice = async () => {
    try {
      const response = await apiClient.get(`/orders/${order._id}/invoice`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`Placed on ${formatDate(order.createdAt)}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/orders" })}
            >
              <ArrowLeft size={14} /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={downloadInvoice}>
              <Download size={14} />
              Invoice
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer size={14} />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={resendEmail.isPending}
              onClick={() => resendEmail.mutate()}
            >
              <Mail size={14} />
              Resend Order Email
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Items" />
            <CardBody className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <div className="h-20 w-20 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-medium text-ink">
                        {item.title}
                      </p>
                      {item.sku && <p className="font-mono text-xs text-muted">SKU: {item.sku}</p>}
                      <ItemOptions item={item} className="mt-1.5" />
                      <p className="mt-1.5 text-xs text-muted">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-ink">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Update status" />
            <CardBody>
              <form onSubmit={submitStatusUpdate} className="space-y-3">
                <Select
                  label="New status"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  {ORDER_STATUSES.map((s) => (
                    <option
                      key={s}
                      value={s}
                      disabled={s === order.orderStatus}
                    >
                      {s}
                    </option>
                  ))}
                </Select>
                <Textarea
                  label="Note (optional)"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {(nextStatus === "Shipped" ||
                  nextStatus === "Out For Delivery") && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <Input
                      label="Tracking URL"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  isLoading={updateStatus.isPending}
                  disabled={!nextStatus}
                >
                  Update status
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Shipment"
              description="Shiprocket integration actions"
            />
            <CardBody className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                isLoading={createShipment.isPending}
                onClick={() => createShipment.mutate(undefined)}
              >
                <Truck size={14} /> Create shipment
              </Button>
              <Button
                variant="outline"
                size="sm"
                isLoading={requestPickup.isPending}
                onClick={() => requestPickup.mutate()}
              >
                <PackageCheck size={14} /> Request pickup
              </Button>
              <Button
                variant="outline"
                size="sm"
                isLoading={cancelShipment.isPending}
                onClick={() => cancelShipment.mutate()}
              >
                <XCircle size={14} /> Cancel shipment
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Timeline" description="Order, payment and return events" />
            <CardBody>
              <OrderTimeline order={order} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="space-y-1.5 text-sm">
              <p className="font-medium text-ink">
                {customer?.name || order.shippingAddress.fullName}
              </p>
              {customer?.email && (
                <p className="text-muted">{customer.email}</p>
              )}
              {customer?.mobile && (
                <p className="text-muted">{customer.mobile}</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Shipping address" />
            <CardBody className="text-sm text-muted">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 &&
                `, ${order.shippingAddress.addressLine2}`}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
              <br />
              {order.shippingAddress.country}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment summary" />
            <CardBody className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-mono">
                  {formatCurrency(order.subTotal)}
                </span>
              </div>
              {order.coupon?.discountAmount ? (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span className="font-mono">
                    -{formatCurrency(order.coupon.discountAmount)}
                  </span>
                </div>
              ) : null}
              {order.discountAmount ? (
                <div className="flex justify-between text-success">
                  <span>
                    Razorpay Discount
                    {order.discountPercentage ? ` (${order.discountPercentage}%)` : ""}
                  </span>
                  <span className="font-mono">
                    -{formatCurrency(order.discountAmount)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-mono">
                  {formatCurrency(order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span className="font-mono">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-medium text-ink">
                <span>Total</span>
                <span className="font-mono">
                  {formatCurrency(order.grandTotal)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-muted">Method</span>
                <span>
                  {order.paymentMethod === "cod"
                    ? "Cash on delivery"
                    : "Online"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Status</span>
                <Badge className="!px-1.5 !py-0.5">{order.paymentStatus}</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** The order fields the timeline reads. */
interface TimelineOrder {
  createdAt: string;
  orderStatus: string;
  paymentMethod: string;
  statusHistory?: { status: string; changedAt: string; note?: string }[];
  paymentInfo?: { paidAt?: string | null; razorpayPaymentId?: string | null } | null;
  returnRequest?: { requestedAt?: string; status?: string; reviewedAt?: string; refund?: { status?: string; processedAt?: string } } | null;
}

/** Status history merged with payment and return events, oldest first. */
function OrderTimeline({ order }: { order: TimelineOrder }) {
  const events: { at: string; title: string; detail?: string; tone: "done" | "current" | "alert" }[] = [];
  const history = order.statusHistory ?? [];
  if (!history.some((h) => h.status === "Pending")) events.push({ at: order.createdAt, title: "Order placed", tone: "done" });
  history.forEach((h) =>
    events.push({ at: h.changedAt, title: h.status, detail: h.note, tone: ["Cancelled", "Returned", "Refunded"].includes(h.status) ? "alert" : "done" }),
  );
  if (order.paymentInfo?.paidAt)
    events.push({
      at: order.paymentInfo.paidAt,
      title: "Payment received",
      detail: order.paymentInfo.razorpayPaymentId ? `Razorpay ${order.paymentInfo.razorpayPaymentId}` : order.paymentMethod.toUpperCase(),
      tone: "done",
    });
  const rr = order.returnRequest;
  if (rr?.requestedAt) events.push({ at: rr.requestedAt, title: "Return requested", tone: "alert" });
  if (rr?.reviewedAt) events.push({ at: rr.reviewedAt, title: `Return ${rr.status?.toLowerCase()}`, tone: rr.status === "Rejected" ? "alert" : "done" });
  if (rr?.refund?.processedAt) events.push({ at: rr.refund.processedAt, title: `Refund ${rr.refund.status?.toLowerCase()}`, tone: "done" });
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const lastStatus = [...events].reverse().find((e) => e.title === order.orderStatus);
  if (lastStatus && lastStatus.tone === "done") lastStatus.tone = "current";

  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white",
              e.tone === "current" ? "bg-ink" : e.tone === "alert" ? "bg-danger" : "bg-success",
            )}
          />
          <p className={cn("text-sm text-ink", e.tone === "current" && "font-semibold")}>{e.title}</p>
          <p className="text-xs text-muted">{formatDateTime(e.at)}</p>
          {e.detail && <p className="text-xs text-muted">{e.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
