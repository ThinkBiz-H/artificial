import { Link, useParams } from "react-router-dom";
import { Check, Package, Truck, Mail } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { StartChatButton } from "@/components/common/StartChatButton";
import { Seo } from "@/components/common/Seo";
import { Reveal } from "@/components/common/Reveal";
import { LineOptions } from "@/components/common/LineOptions";

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  return (
    <div className="container-x py-12 sm:py-20">
      <Seo title="Order confirmed" noindex />
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-fg-inverse">
          <Check size={28} strokeWidth={2} />
        </span>
        <p className="eyebrow mt-6">Thank you</p>
        <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-fg sm:text-5xl">Your order is placed</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
          We've received your order and will notify you at every step — from packing to your doorstep.
        </p>
      </Reveal>

      <div className="mx-auto mt-10 max-w-2xl">
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : order ? (
          <div className="rounded-2xl border border-border bg-surface">
            <div className="grid grid-cols-2 gap-4 border-b border-border p-5 text-sm sm:grid-cols-3 sm:p-6">
              <div>
                <p className="text-xs text-fg-muted">Order number</p>
                <p className="mt-0.5 font-semibold text-fg">#{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">Total</p>
                <p className="mt-0.5 font-semibold text-fg">{formatCurrency(order.grandTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">Payment</p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="text-fg">{order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}</span>
                  {order.paymentMethod !== "cod" && <Badge>{order.paymentStatus}</Badge>}
                </p>
              </div>
            </div>
            <ul className="divide-y divide-border px-5 sm:px-6">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-14 flex-none overflow-hidden rounded-2xl bg-surface-muted">
                    {item.thumbnail && <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm text-fg">
                    <p className="line-clamp-2">{item.title}</p>
                    <LineOptions item={item} className="mt-0.5" />
                    <p className="text-xs text-fg-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-fg">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-5 text-sm text-fg-soft sm:p-6">
              <p className="text-xs text-fg-muted">Delivering to</p>
              <p className="mt-1">
                <span className="font-medium text-fg">{order.shippingAddress.fullName}</span>, {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        ) : null}

        <ul className="mt-8 grid gap-4 text-center text-sm sm:grid-cols-3">
          {[
            { Icon: Mail, title: "Confirmation sent", text: "Order details are on their way to you." },
            { Icon: Package, title: "Packed with care", text: "We'll update you once it's packed." },
            { Icon: Truck, title: "Track anytime", text: "Follow your parcel from My Orders." },
          ].map(({ Icon, title, text }) => (
            <li key={title} className="rounded-2xl bg-surface-muted/60 p-5">
              <Icon size={20} strokeWidth={1.25} className="mx-auto text-accent" />
              <p className="mt-2 font-semibold text-fg">{title}</p>
              <p className="mt-0.5 text-xs text-fg-muted">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to={`/account/orders/${id}`} className={buttonClasses({ variant: "outline", size: "lg" })}>
            View order
          </Link>
          <Link to="/products" className={buttonClasses({ size: "lg" })}>
            Continue shopping
          </Link>
        </div>
        {order && (
          <div className="mt-4 flex justify-center">
            <StartChatButton orderNumber={order.orderNumber} customerName={order.shippingAddress.fullName} />
          </div>
        )}
      </div>
    </div>
  );
}
