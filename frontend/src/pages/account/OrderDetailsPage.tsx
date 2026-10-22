import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Download } from "lucide-react";
import { useOrder, useCancelOrder, useOrderTracking } from "@/hooks/useOrders";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import { paymentsApi } from "@/api/payments";
import { apiClient } from "@/api/client";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { StartChatButton } from "@/components/common/StartChatButton";
import { OrderTracker } from "@/components/account/OrderTracker";
import { LineOptions } from "@/components/common/LineOptions";

const CANCELLABLE_STATUSES = ["Pending", "Confirmed", "Packed"];

function Card({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-40 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-label text-fg">{title}</h3>
      {children}
    </section>
  );
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { hash } = useLocation();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: tracking } = useOrderTracking(id);
  const cancelOrder = useCancelOrder();
  const openRazorpay = useRazorpayPayment();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // "Track" links land on #track — scroll there once the order has rendered.
  useEffect(() => {
    if (order && hash === "#track") document.getElementById("track")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [order, hash]);

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (isError || !order) return <ErrorState title="Order not found" onRetry={() => refetch()} />;

  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);
  const awaitingPayment =
    order.paymentMethod === "razorpay" && ["Pending", "Failed"].includes(order.paymentStatus) && !["Cancelled", "Returned", "Refunded"].includes(order.orderStatus);

  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      // Through the shared client: auth header, refresh on an expired access token, client id.
      const response = await apiClient.get<Blob>(`/orders/${order._id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't download the invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const retryPayment = async () => {
    setRetrying(true);
    try {
      const res = await paymentsApi.retry(order._id);
      await openRazorpay({ order: res.data.order, razorpayOrder: res.data.razorpayOrder, razorpayKeyId: res.data.razorpayKeyId });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRetrying(false);
    }
  };

  const a = order.shippingAddress;
  const couponDiscount = order.coupon?.discountAmount ?? 0;
  const prepaidDiscount = order.discountAmount ?? 0;

  return (
    <div className="space-y-5">
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={14} /> All orders
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-fg">Order #{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-fg-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{order.orderStatus}</Badge>
          <Button variant="outline" size="sm" onClick={downloadInvoice} isLoading={downloading}>
            {!downloading && <Download size={14} />} Invoice
          </Button>
        </div>
      </div>

      {awaitingPayment && (
        <div className="flex flex-col gap-4 rounded-2xl border border-warning/30 bg-warning-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-3 text-sm text-fg">
            <AlertCircle size={18} className="mt-0.5 flex-none text-warning" />
            <span>
              <strong className="font-semibold">Payment {order.paymentStatus === "Failed" ? "failed" : "pending"}.</strong> Complete your payment of{" "}
              {formatCurrency(order.grandTotal)} to confirm this order.
            </span>
          </p>
          <Button onClick={retryPayment} isLoading={retrying} className="flex-none">
            Complete payment
          </Button>
        </div>
      )}

      <Card title="Order status" id="track">
        <OrderTracker order={order} live={tracking?.live} />
        <div className="mt-5 border-t border-border pt-5">
          <StartChatButton orderNumber={order.orderNumber} customerName={a.fullName} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card title={`Items (${order.items.length})`}>
          <ul className="divide-y divide-border">
            {order.items.map((item, i) => {
              const slug = typeof item.product === "object" ? item.product?.slug : undefined;
              const content = (
                <>
                  <div className="h-20 w-16 flex-none overflow-hidden rounded-2xl bg-surface-muted">
                    {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-fg">{item.title}</p>
                    <LineOptions item={item} stacked className="mt-1" />
                    <p className="mt-1 text-xs text-fg-muted">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="flex-none text-sm font-semibold text-fg">{formatCurrency(item.price * item.quantity)}</p>
                </>
              );
              return (
                <li key={i} className="py-4 first:pt-0 last:pb-0">
                  {slug ? (
                    <Link to={`/products/${slug}`} className="flex gap-4 hover:opacity-80">
                      {content}
                    </Link>
                  ) : (
                    <div className="flex gap-4">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {canCancel && (
            <button type="button" onClick={() => setCancelOpen(true)} className="mt-5 text-sm text-danger underline underline-offset-4">
              Cancel this order
            </button>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Payment summary">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-muted">Subtotal</dt>
                <dd>{formatCurrency(order.subTotal)}</dd>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Coupon{order.coupon?.code ? ` (${order.coupon.code})` : ""}</dt>
                  <dd>−{formatCurrency(couponDiscount)}</dd>
                </div>
              )}
              {prepaidDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Prepaid discount{order.discountPercentage ? ` (${order.discountPercentage}%)` : ""}</dt>
                  <dd>−{formatCurrency(prepaidDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-fg-muted">Shipping</dt>
                <dd>{order.shippingCharge ? formatCurrency(order.shippingCharge) : "Free"}</dd>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Tax</dt>
                  <dd>{formatCurrency(order.tax)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-fg">
                <dt>Total</dt>
                <dd>{formatCurrency(order.grandTotal)}</dd>
              </div>
            </dl>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-fg-muted">Method</span>
                <span className="text-fg">{order.paymentMethod === "cod" ? "Cash on delivery" : "Online (Razorpay)"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-fg-muted">Status</span>
                <Badge>{order.paymentStatus}</Badge>
              </div>
              {order.paymentInfo?.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-fg-muted">Payment ID</span>
                  <span className="text-fg">{order.paymentInfo.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </Card>

          <Card title="Shipping address">
            <address className="text-sm not-italic leading-relaxed text-fg-soft">
              <span className="font-medium text-fg">{a.fullName}</span>
              <br />
              {a.addressLine1}
              {a.addressLine2 && `, ${a.addressLine2}`}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.country}
              {a.mobile && (
                <>
                  <br />
                  +91 {a.mobile}
                </>
              )}
            </address>
          </Card>
        </div>
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel order">
        <p className="mb-4 text-sm text-fg-muted">We're sorry to see this go. Could you tell us why you're cancelling?</p>
        <Textarea placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} aria-label="Cancellation reason" />
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)}>
            Keep order
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={cancelOrder.isPending}
            onClick={() => cancelOrder.mutate({ id: order._id, reason }, { onSuccess: () => setCancelOpen(false) })}
          >
            Cancel order
          </Button>
        </div>
      </Modal>
    </div>
  );
}
