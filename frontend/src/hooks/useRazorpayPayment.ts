import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loadRazorpayScript } from "@/lib/razorpay";
import { paymentsApi } from "@/api/payments";
import { useAuthStore } from "@/stores/auth.store";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { getErrorMessage } from "@/lib/utils";
import type { Order, RazorpayOrder } from "@/types";

/**
 * Opens Razorpay Checkout for an order created by the backend (POST /orders
 * or POST /payments/:id/retry) and reports the outcome back through the
 * existing /payments verify / failure / cancelled endpoints. Success is only
 * ever declared after the backend verifies the signature.
 */
export function useRazorpayPayment() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { siteName } = useStoreInfo();

  return async ({ order, razorpayOrder, razorpayKeyId }: { order: Order; razorpayOrder: RazorpayOrder; razorpayKeyId: string }) => {
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ["order", order._id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    };
    const currentUser = useAuthStore.getState().user;
    await loadRazorpayScript();
    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: siteName,
      description: `Order ${order.orderNumber}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: currentUser?.name,
        email: currentUser?.email,
        contact: currentUser?.mobile,
      },
      // Brand colour comes from the design tokens (index.css), not a hard-coded value.
      theme: { color: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || undefined },
      handler: async (response) => {
        try {
          await paymentsApi.verify({ ...response, orderId: order._id });
          refresh();
          toast.success("Payment successful");
          navigate(`/order-success/${order._id}`);
        } catch (err) {
          toast.error(getErrorMessage(err));
          refresh();
          navigate(`/account/orders/${order._id}`);
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await paymentsApi.cancelled({ orderId: order._id });
          } catch {
            /* ignore */
          }
          refresh();
          toast.info("Payment cancelled — you can complete it from your order page.");
          navigate(`/account/orders/${order._id}`);
        },
      },
    });
    rzp.on("payment.failed", async (response) => {
      try {
        await paymentsApi.failure({
          orderId: order._id,
          reason: response.error?.description || response.error?.reason,
          razorpay_payment_id: response.error?.metadata?.payment_id,
        });
      } catch {
        /* ignore */
      }
      refresh();
      toast.error("Payment failed. Please try again.");
      navigate(`/account/orders/${order._id}`);
    });
    rzp.open();
  };
}
