import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, Check, CheckCircle2, CreditCard, Loader2, Lock, MapPin, Pencil, Plus, ShoppingBag } from "lucide-react";
import { useAddresses, useAddAddress, useUpdateAddress } from "@/hooks/useUser";
import { useCart, useMergeGuestCartIntoServer } from "@/hooks/useCart";
import { useCustomerAutofill } from "@/hooks/useCustomerAutofill";
import { useCheckoutQuote } from "@/hooks/useCheckoutQuote";
import { usePublicSettings } from "@/hooks/useCatalog";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useAuthStore } from "@/stores/auth.store";
import { checkoutApi, type AutofillCustomer, type PaymentMethodId } from "@/api/checkout";
import { cartApi } from "@/api/cart";
import { ordersApi } from "@/api/orders";
import { paymentsApi } from "@/api/payments";
import { loadRazorpayScript } from "@/lib/razorpay";
import { cn, formatCurrency, getErrorMessage } from "@/lib/utils";
import type { Address } from "@/types";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { OtpModal } from "@/components/checkout/OtpModal";
import { AddressForm, INDIAN_STATES } from "@/components/account/AddressForm";
import { cartLineImage, cartLineOptions } from "@/components/cart/CartLine";
import { LineOptions } from "@/components/common/LineOptions";
import { Seo } from "@/components/common/Seo";

interface OrderShippingAddress {
  fullName: string;
  email?: string;
  mobile?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

const emptyGuestAddress = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  phone: "",
};

const STAGES = ["Address", "Payment"];

function Stepper({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Checkout progress">
      {STAGES.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3 last:flex-none">
            <button
              type="button"
              disabled={!done}
              onClick={() => onSelect(i)}
              className="flex min-w-0 items-center gap-2 disabled:cursor-default"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-8 w-8 flex-none items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  done && "border-primary bg-primary text-fg-inverse",
                  active && "border-accent bg-accent text-fg-inverse ring-4 ring-accent/20",
                  !done && !active && "border-border bg-surface text-fg-muted",
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn("hidden truncate text-xs font-medium md:inline", active || done ? "text-fg" : "text-fg-muted")}>{label}</span>
            </button>
            {i < STAGES.length - 1 && <span className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** One checkout step: expanded when active, a one-line summary (with Edit) when done, a locked header when upcoming. */
function StepPanel({
  n,
  title,
  status,
  summary,
  onEdit,
  aside,
  children,
}: {
  n: number;
  title: string;
  status: "active" | "done" | "locked";
  summary?: React.ReactNode;
  onEdit?: () => void;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-card border bg-surface p-5 transition-shadow sm:p-7",
        status === "active" ? "border-primary/30 shadow-soft" : "border-border",
        status === "locked" && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-fg">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full font-sans text-xs font-semibold",
              status === "done" ? "bg-primary text-fg-inverse" : status === "active" ? "bg-accent text-fg-inverse" : "bg-surface-muted text-fg-muted",
            )}
          >
            {status === "done" ? <Check size={14} strokeWidth={3} aria-hidden /> : n}
          </span>
          {title}
        </h2>
        {status === "done" && onEdit ? (
          <button type="button" onClick={onEdit} className="text-sm font-medium text-primary underline underline-offset-4 hover:text-accent">
            Edit
          </button>
        ) : (
          status === "active" && aside
        )}
      </div>
      {status === "done" && summary && <div className="mt-3 pl-11 text-sm text-fg-soft">{summary}</div>}
      {status === "active" && <div className="mt-6">{children}</div>}
    </section>
  );
}

export function CheckoutPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { data: addresses, isLoading: loadingAddresses } = useAddresses();
  const { data: cartData, isLoading: loadingCart } = useCart();
  const { data: settings } = usePublicSettings();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const mergeGuestCart = useMergeGuestCartIntoServer();
  const { siteName } = useStoreInfo();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = (location.state as { couponCode?: string })?.couponCode;

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [addressModal, setAddressModal] = useState<{ open: boolean; editing?: Address }>({ open: false });
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(0);

  // ---- Guest checkout state (contact + shipping address) ----
  const [contact, setContact] = useState({ email: "", mobile: "" });
  const [guestAddress, setGuestAddress] = useState(emptyGuestAddress);
  const [saveAddress, setSaveAddress] = useState(true);

  // ---- Order OTP (every order is confirmed with an OTP) ----
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");
  const [otpSentAt, setOtpSentAt] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // ---- Auto-fill a returning customer's saved details (hooks/useCustomerAutofill) ----
  const { loading: autofillLoading, found: autofillFound, searchCustomer, fillForm } = useCustomerAutofill();
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof AutofillCustomer, boolean>>>({});
  const markTouched = (field: keyof AutofillCustomer) => setTouchedFields((t) => (t[field] ? t : { ...t, [field]: true }));

  useEffect(() => {
    searchCustomer(contact.mobile, contact.email);
  }, [contact.mobile, contact.email, searchCustomer]);

  useEffect(() => {
    const patch = fillForm(touchedFields);
    if (Object.keys(patch).length === 0) return;
    if (patch.email !== undefined || patch.mobile !== undefined) {
      setContact((c) => ({ email: patch.email ?? c.email, mobile: patch.mobile ?? c.mobile }));
    }
    setGuestAddress((a) => ({
      ...a,
      ...(patch.firstName !== undefined && { firstName: patch.firstName }),
      ...(patch.lastName !== undefined && { lastName: patch.lastName }),
      ...(patch.address1 !== undefined && { addressLine1: patch.address1 }),
      ...(patch.address2 !== undefined && { addressLine2: patch.address2 }),
      ...(patch.city !== undefined && { city: patch.city }),
      ...(patch.state !== undefined && { state: patch.state }),
      ...(patch.pincode !== undefined && { pincode: patch.pincode }),
      ...(patch.country !== undefined && { country: patch.country }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillForm, touchedFields]);

  const items = cartData?.cart || [];
  const subTotal = cartData?.subTotal ?? items.reduce((sum, i) => sum + i.itemTotal, 0);
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];
  const activeAddressId = selectedAddressId || defaultAddress?._id || null;
  const activeAddress = addresses?.find((a) => a._id === activeAddressId);

  const pincodeForShipping = isAuthenticated ? activeAddress?.pincode : guestAddress.pincode;

  // Totals and the payment methods the admin has enabled come from the backend,
  // priced exactly as the order will be (coupon, prepaid discount, shipping, GST).
  const { data: quote, isFetching: quoteLoading } = useCheckoutQuote({ lines: items, pincode: pincodeForShipping, paymentMethod, couponCode });
  const paymentMethods = quote?.paymentMethods;

  useEffect(() => {
    if (!paymentMethods?.length) return;
    if (!paymentMethods.some((m) => m.id === paymentMethod)) setPaymentMethod(paymentMethods[0].id);
  }, [paymentMethods, paymentMethod]);

  const guestAddressValid =
    contact.email.trim() &&
    contact.mobile.trim() &&
    guestAddress.firstName.trim() &&
    guestAddress.lastName.trim() &&
    guestAddress.addressLine1.trim() &&
    guestAddress.city.trim() &&
    guestAddress.state.trim() &&
    guestAddress.pincode.trim();

  const orderShippingAddress = (): OrderShippingAddress | null => {
    if (isAuthenticated) {
      if (!activeAddress) return null;
      const addressName = [activeAddress.firstName, activeAddress.lastName].filter(Boolean).join(" ");
      return {
        fullName: user?.name || addressName,
        email: user?.email,
        mobile: user?.mobile || activeAddress.phone,
        addressLine1: activeAddress.addressLine1,
        addressLine2: activeAddress.addressLine2,
        city: activeAddress.city,
        state: activeAddress.state,
        country: activeAddress.country,
        pincode: activeAddress.pincode,
      };
    }
    if (!guestAddressValid) return null;
    return {
      fullName: `${guestAddress.firstName} ${guestAddress.lastName}`.trim(),
      email: contact.email,
      mobile: contact.mobile,
      addressLine1: guestAddress.addressLine1,
      addressLine2: guestAddress.addressLine2,
      city: guestAddress.city,
      state: guestAddress.state,
      country: guestAddress.country,
      pincode: guestAddress.pincode,
    };
  };

  // ---- Place order: OTP first, then the order (COD) or Razorpay (online) ----
  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!orderShippingAddress()) return toast.error(isAuthenticated ? "Please select a delivery address" : "Please complete your delivery address");
    if (!paymentMethod) return toast.error("Please choose a payment method");
    // Logged-in shoppers confirm with their account's mobile, so the OTP signs in the same account.
    const mobile = (isAuthenticated ? user?.mobile || "" : contact.mobile).trim();
    if (!/^\d{10}$/.test(mobile)) {
      return toast.error(isAuthenticated ? "Please add a mobile number to your account to place orders" : "Please enter a valid 10-digit mobile number");
    }

    setRequestingOtp(true);
    try {
      await checkoutApi.requestOtp({ mobile, email: isAuthenticated ? undefined : contact.email });
      setOtpMobile(mobile);
      setOtpError(null);
      setOtpSentAt(Date.now());
      setOtpModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setResendingOtp(true);
    try {
      await checkoutApi.resendOtp({ mobile: otpMobile });
      setOtpSentAt(Date.now());
      setOtpError(null);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResendingOtp(false);
    }
  };

  const goToSuccess = (orderId: string) => {
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
    navigate(`/order-success/${orderId}`, { replace: true });
  };

  /** Online: open Razorpay; the order is created only after the payment is verified. */
  const payOnline = async (shippingAddress: OrderShippingAddress) => {
    const intent = await paymentsApi.createIntent({ shippingAddress, couponCode });
    await loadRazorpayScript();
    const { razorpayOrder, razorpayKeyId } = intent.data;

    await new Promise<void>((resolve) => {
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: siteName,
        description: "Order payment",
        order_id: razorpayOrder.id,
        prefill: { name: shippingAddress.fullName, email: shippingAddress.email, contact: shippingAddress.mobile },
        theme: { color: getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || undefined },
        handler: async (response) => {
          try {
            const res = await paymentsApi.confirmIntent(response);
            goToSuccess(res.data.order._id);
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            resolve();
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled — no order was placed.");
            resolve();
          },
        },
      });
      rzp.on("payment.failed", (r) => toast.error(r.error?.description || "Payment failed — no order was placed. You can try again."));
      rzp.open();
    });
  };

  const handleVerifyOtp = async (otp: string) => {
    const shippingAddress = orderShippingAddress();
    if (!shippingAddress || !paymentMethod) return;
    const wasGuest = !isAuthenticated;

    // 1. Verify — signs the shopper in (a guest's account is created or logged in).
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await checkoutApi.verifyOtp({
        mobile: otpMobile,
        otp,
        ...(wasGuest && {
          email: contact.email,
          shippingAddress: {
            firstName: guestAddress.firstName,
            lastName: guestAddress.lastName,
            addressLine1: guestAddress.addressLine1,
            addressLine2: guestAddress.addressLine2,
            city: guestAddress.city,
            state: guestAddress.state,
            country: guestAddress.country,
            pincode: guestAddress.pincode,
            phone: guestAddress.phone,
          },
          saveAddress,
        }),
      });
      setUser(res.data.user);

      if (wasGuest) {
        // The guest bag joins the account's bag. If the account already held
        // other items, show the new total instead of charging for unseen items.
        await mergeGuestCart.mutateAsync();
        const serverCart = await qc.fetchQuery({ queryKey: ["cart"], queryFn: () => cartApi.get() });
        if (Math.abs(serverCart.data.subTotal - subTotal) > 0.009) {
          setOtpModalOpen(false);
          toast.info("We added items saved in your account to this bag. Please review your order and place it again.", { duration: 8000 });
          return;
        }
      }
    } catch (err) {
      setOtpError(getErrorMessage(err));
      return;
    } finally {
      setVerifyingOtp(false);
    }

    // 2. Place the order.
    setOtpModalOpen(false);
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        const res = await ordersApi.create({ shippingAddress, paymentMethod: "cod", couponCode });
        goToSuccess(res.data.order._id);
      } else {
        await payOnline(shippingAddress);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  };

  const setGuest = (field: keyof typeof emptyGuestAddress, touched?: keyof AutofillCustomer) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestAddress((a) => ({ ...a, [field]: e.target.value }));
    if (touched) markTouched(touched);
  };

  const total = quote?.grandTotal ?? subTotal;
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const hasAddress = isAuthenticated ? !!activeAddress : !!guestAddressValid;
  const placeLabel = "Place order";
  const placing2 = requestingOtp || placing;
  const stepLabels = ["Continue to payment", placeLabel];

  const goNext = () => {
    if (step === 1) return handlePlaceOrder();
    if (!isAuthenticated) {
      if (!/^\d{10}$/.test(contact.mobile.trim())) return toast.error("Please enter a valid 10-digit mobile number");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) return toast.error("Please enter a valid email address");
    }
    if (!hasAddress) return toast.error(isAuthenticated ? "Please select a delivery address" : "Please complete your delivery address");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const ctaLabel = stepLabels[step];
  const onCta = goNext;
  const statusOf = (i: number): "active" | "done" | "locked" => (i === step ? "active" : i < step ? "done" : "locked");

  const shipName = isAuthenticated
    ? user?.name || [activeAddress?.firstName, activeAddress?.lastName].filter(Boolean).join(" ")
    : `${guestAddress.firstName} ${guestAddress.lastName}`.trim();
  const shipTo = isAuthenticated
    ? activeAddress
      ? `${activeAddress.addressLine1}${activeAddress.addressLine2 ? ", " + activeAddress.addressLine2 : ""}, ${activeAddress.city}, ${activeAddress.state} ${activeAddress.pincode}`
      : ""
    : `${guestAddress.addressLine1}${guestAddress.addressLine2 ? ", " + guestAddress.addressLine2 : ""}, ${guestAddress.city}, ${guestAddress.state} ${guestAddress.pincode}`;
  const shippingQuote = quote?.shipping;
  const freeShip = !!shippingQuote?.quoted && (shippingQuote.free || shippingQuote.charge === 0);
  const acceptedMethods = [
    ...(paymentMethods?.some((m) => m.id === "razorpay") ? ["Razorpay", "UPI", "Visa", "Mastercard", "RuPay", "Net Banking"] : []),
    ...(paymentMethods?.some((m) => m.id === "cod") ? ["COD"] : []),
  ];

  return (
    <div className="container-x py-8 sm:py-12">
      <Seo title="Checkout" noindex />
      <div className="flex flex-col gap-6 border-b border-border pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-tight text-fg sm:text-6xl">Checkout</h1>
        </div>
        <div className="w-full lg:max-w-xl">
          <Stepper current={step} onSelect={setStep} />
        </div>
      </div>

      {loadingCart || (isAuthenticated && loadingAddresses) ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" strokeWidth={1.25} />}
          title="Your bag is empty"
          description="Add a few favourites to your bag to check out."
          action={
            <Link to="/products" className={buttonClasses()}>
              Continue shopping
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
          <div className="space-y-4">
            <StepPanel
              n={1}
              title="Delivery address"
              status={statusOf(0)}
              onEdit={() => setStep(0)}
              summary={
                <>
                  <span className="font-medium text-fg">{shipName}</span> — {shipTo}
                  {!isAuthenticated && (
                    <span className="block text-fg-muted">
                      {contact.mobile} · {contact.email}
                    </span>
                  )}
                </>
              }
              aside={
                !isAuthenticated ? (
                  <Link to="/login" state={{ from: "/checkout" }} className="text-sm text-fg-muted underline underline-offset-4 hover:text-fg">
                    Have an account? Log in
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddressModal({ open: true })}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-label text-accent hover:text-fg"
                  >
                    <Plus size={14} /> Add new
                  </button>
                )
              }
            >
              <div className="space-y-6">
                <div>
              {isAuthenticated ? (
                <p className="flex items-center gap-3 text-sm text-fg-soft">
                  <CheckCircle2 size={18} className="text-success" />
                  Logged in as <span className="font-semibold text-fg">{user?.name}</span>
                  {user?.mobile && <span className="text-fg-muted">· +91 {user.mobile}</span>}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <Input
                        label="Mobile number"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        value={contact.mobile}
                        onChange={(e) => {
                          setContact((c) => ({ ...c, mobile: e.target.value }));
                          markTouched("mobile");
                        }}
                      />
                      {autofillLoading && <Loader2 size={16} className="absolute bottom-3.5 right-3 animate-spin text-fg-muted" />}
                    </div>
                    <Input
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      required
                      value={contact.email}
                      onChange={(e) => {
                        setContact((c) => ({ ...c, email: e.target.value }));
                        markTouched("email");
                      }}
                    />
                  </div>
                  {autofillFound && !autofillLoading ? (
                    <p className="flex items-center gap-1.5 text-xs text-success">
                      <CheckCircle2 size={14} /> Welcome back — we've filled in your saved address.
                    </p>
                  ) : (
                    <p className="text-xs text-fg-muted">We'll send an OTP to verify your number — this also creates your account for order tracking.</p>
                  )}
                </div>
              )}
</div>
                <div className="border-t border-border pt-6">
              {isAuthenticated ? (
                !addresses || addresses.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-muted py-10 text-center">
                    <MapPin size={24} strokeWidth={1.25} className="text-accent" />
                    <p className="text-sm text-fg-muted">No saved addresses yet.</p>
                    <Button size="sm" onClick={() => setAddressModal({ open: true })}>
                      Add address
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery address">
                    {addresses.map((addr) => {
                      const selected = activeAddressId === addr._id;
                      const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
                      return (
                        <div
                          key={addr._id}
                          role="radio"
                          aria-checked={selected}
                          tabIndex={0}
                          onClick={() => setSelectedAddressId(addr._id)}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedAddressId(addr._id)}
                          className={cn(
                            "relative cursor-pointer rounded-2xl border p-4 text-sm transition-colors",
                            selected ? "border-primary bg-canvas" : "border-border hover:border-fg-soft",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="flex items-center gap-2 text-label font-semibold uppercase tracking-label text-fg">
                              <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", selected ? "border-primary bg-primary" : "border-border-strong")}>
                                {selected && <span className="h-1.5 w-1.5 rounded-full bg-surface" />}
                              </span>
                              {addr.type}
                              {addr.isDefault && <span className="rounded-2xl bg-surface-muted px-1.5 py-0.5 text-2xs text-accent">Default</span>}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddressModal({ open: true, editing: addr });
                              }}
                              aria-label="Edit address"
                              className="text-fg-muted hover:text-fg"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                          {name && <p className="mt-2.5 font-medium text-fg">{name}</p>}
                          <p className="mt-1 leading-relaxed text-fg-soft">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city}, {addr.state} {addr.pincode}
                          </p>
                          {addr.phone && <p className="mt-1 text-fg-muted">+91 {addr.phone}</p>}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="First name" required autoComplete="given-name" value={guestAddress.firstName} onChange={setGuest("firstName", "firstName")} />
                    <Input label="Last name" required autoComplete="family-name" value={guestAddress.lastName} onChange={setGuest("lastName", "lastName")} />
                  </div>
                  <Input label="House / flat, street" required autoComplete="address-line1" value={guestAddress.addressLine1} onChange={setGuest("addressLine1", "address1")} />
                  <Input label="Area, landmark (optional)" autoComplete="address-line2" value={guestAddress.addressLine2} onChange={setGuest("addressLine2", "address2")} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Pincode" required inputMode="numeric" autoComplete="postal-code" value={guestAddress.pincode} onChange={setGuest("pincode", "pincode")} />
                    <Input label="City" required autoComplete="address-level2" value={guestAddress.city} onChange={setGuest("city", "city")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="State" required list="checkout-states" autoComplete="address-level1" value={guestAddress.state} onChange={setGuest("state", "state")} />
                    <Input label="Country" required autoComplete="country-name" value={guestAddress.country} onChange={setGuest("country", "country")} />
                  </div>
                  <datalist id="checkout-states">
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  <Input label="Alternate phone (optional)" type="tel" inputMode="numeric" value={guestAddress.phone} onChange={setGuest("phone")} />
                  <label className="flex items-center gap-2.5 pt-1 text-sm text-fg-soft">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-primary" />
                    Save this address for next time
                  </label>
                </div>
              )}
</div>
              </div>
            </StepPanel>

            <StepPanel n={2} title="Payment" status={statusOf(1)}>
              {!paymentMethods ? (
                <p className="text-sm text-fg-muted">Payment options are loading…</p>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-fg-muted">No payment method is available right now. Please try again shortly.</p>
              ) : (
                <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                  {paymentMethods.map((m) => {
                    const Icon = m.id === "cod" ? Banknote : CreditCard;
                    return (
                      <label
                        key={m.id}
                        className={cn("flex cursor-pointer items-start gap-4 rounded-card border p-4 transition-colors", paymentMethod === m.id ? "border-primary bg-canvas" : "border-border hover:border-fg-soft")}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="mt-1 h-4 w-4 accent-primary" />
                        <span className="flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                            <Icon size={16} strokeWidth={1.5} /> {m.label}
                            {m.offer && <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-label font-semibold text-success">{m.offer}</span>}
                          </span>
                          <span className="mt-1 block text-xs text-fg-muted">{m.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <Button className="mt-6 w-full" size="lg" isLoading={placing2} disabled={!paymentMethod} onClick={handlePlaceOrder}>
                {placeLabel}
              </Button>
            </StepPanel>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-[calc(var(--header-h,89px)+28px)] lg:self-start">
            <div className="overflow-hidden rounded-card border border-border bg-surface shadow-soft">
              <div className="gold-rule" aria-hidden />
              <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-3xl font-semibold text-fg">Order Summary</h2>
                <Link to="/cart" className="text-sm text-fg-muted underline underline-offset-4 hover:text-fg">
                  Edit bag
                </Link>
              </div>
              <ul className="mt-5 divide-y divide-border">
                {items.map((item) => {
                  const img = cartLineImage(item);
                  const options = cartLineOptions(item);
                  return (
                    <li key={`${item.product._id}-${item.variant?._id || ""}-${item.color || ""}-${item.size || ""}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-20 w-16 flex-none overflow-hidden rounded-2xl bg-surface-muted">
                        {img && <img src={img} alt="" className="h-full w-full object-cover" />}
                        <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-sm bg-primary px-1 text-2xs font-semibold text-fg-inverse">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm text-fg">{item.product.title}</p>
                        <LineOptions item={options} stacked className="mt-1" />
                        <p className="mt-1 text-xs text-fg-muted">
                          Qty {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="flex-none text-sm font-semibold text-fg">{formatCurrency(item.itemTotal)}</p>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Subtotal ({count} item{count === 1 ? "" : "s"})</dt>
                  <dd className="text-fg">{formatCurrency(quote?.subTotal ?? subTotal)}</dd>
                </div>
                {couponCode &&
                  (quote?.couponError ? (
                    <div className="flex justify-between gap-4 text-danger">
                      <dt>Coupon {couponCode}</dt>
                      <dd className="text-right">{quote.couponError}</dd>
                    </div>
                  ) : (
                    <div className="flex justify-between text-success">
                      <dt>Coupon {couponCode}</dt>
                      <dd>{quote?.couponDiscount ? `−${formatCurrency(quote.couponDiscount)}` : "Applied"}</dd>
                    </div>
                  ))}
                {quote && quote.prepaidDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Prepaid discount ({quote.prepaidDiscountPercent}%)</dt>
                    <dd>−{formatCurrency(quote.prepaidDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Shipping</dt>
                  <dd className="text-fg">
                    {quoteLoading && !shippingQuote?.quoted ? (
                      <Loader2 size={14} className="animate-spin text-fg-muted" />
                    ) : !shippingQuote?.quoted ? (
                      <span className="text-fg-muted">Enter pincode</span>
                    ) : freeShip ? (
                      <span className="font-semibold text-success">FREE</span>
                    ) : (
                      formatCurrency(shippingQuote.charge)
                    )}
                  </dd>
                </div>
                {settings?.shipping?.freeShippingEnabled && !freeShip && (
                  <p className="text-xs text-fg-muted">Free delivery on orders above {formatCurrency(settings.shipping.freeShippingThreshold)}</p>
                )}
                {quote && quote.tax > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">{quote.taxIncluded ? "GST (included)" : "GST"}</dt>
                    <dd className="text-fg">{formatCurrency(quote.tax)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt className="font-semibold text-fg">Total</dt>
                  <dd className="font-semibold text-fg">{formatCurrency(total)}</dd>
                </div>
              </dl>
              <Button className="mt-6 hidden w-full lg:flex" size="lg" isLoading={step === 1 && placing2} onClick={onCta}>
                {ctaLabel}
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
                <Lock size={12} aria-hidden /> Secure checkout · Encrypted payment
              </p>
              {acceptedMethods.length > 0 && (
                <ul className="mt-4 flex flex-wrap items-center justify-center gap-1.5 border-t border-border pt-4" aria-label="Accepted payment methods">
                  {acceptedMethods.map((m) => (
                    <li key={m} className="rounded-md border border-border bg-canvas px-2 py-1 text-2xs font-semibold tracking-wide text-fg-soft">
                      {m}
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile sticky action bar */}
      {!loadingCart && items.length > 0 && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 shadow-lift backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex-none">
                <p className="text-label text-fg-muted">Total</p>
                <p className="text-base font-semibold text-fg">{formatCurrency(total)}</p>
              </div>
              <Button className="flex-1" size="lg" isLoading={step === 1 && placing2} onClick={onCta}>
                {step === 1 ? placeLabel : "Continue"}
              </Button>
            </div>
          </div>
          <div className="h-20 lg:hidden" aria-hidden />
        </>
      )}

      {isAuthenticated && (
        <Modal
          open={addressModal.open}
          onClose={() => setAddressModal({ open: false })}
          title={addressModal.editing ? "Edit address" : "Add a new address"}
        >
          <AddressForm
            key={addressModal.editing?._id ?? "new"}
            initial={addressModal.editing}
            isLoading={addAddress.isPending || updateAddress.isPending}
            onSubmit={(payload) =>
              addressModal.editing
                ? updateAddress.mutate(
                    { addressId: addressModal.editing._id, payload },
                    { onSuccess: () => setAddressModal({ open: false }) },
                  )
                : addAddress.mutate(payload, {
                    onSuccess: (res) => {
                      setAddressModal({ open: false });
                      const added = res.data.address?.[res.data.address.length - 1];
                      if (added?._id) setSelectedAddressId(added._id);
                    },
                  })
            }
          />
        </Modal>
      )}

      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        mobile={otpMobile}
        sentAt={otpSentAt}
        isVerifying={verifyingOtp}
        isResending={resendingOtp}
        error={otpError}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </div>
  );
}
