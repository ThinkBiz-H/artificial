import { apiClient, setAccessToken } from "./client";
import type { ApiEnvelope, User } from "@/types";

export interface CheckoutShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
}

export interface RequestOtpPayload {
  mobile: string;
  email?: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  name?: string;
  email?: string;
  shippingAddress?: CheckoutShippingAddress;
  saveAddress?: boolean;
}

export interface AutofillCustomer {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export type PaymentMethodId = "cod" | "razorpay";

/** A payment method the admin has enabled (Admin > Settings > Payment). */
export interface CheckoutPaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
  offer?: string | null;
}

export interface CheckoutQuoteRequest {
  /** Guest bag lines — logged-in shoppers are priced from their server bag. */
  items?: { productId: string; variantId?: string; quantity: number; color?: string; size?: string }[];
  pincode?: string;
  paymentMethod?: PaymentMethodId | null;
  couponCode?: string;
}

/** The checkout summary, priced by the backend exactly as the order will be. */
export interface CheckoutQuote {
  subTotal: number;
  couponCode: string | null;
  couponDiscount: number;
  couponError: string | null;
  prepaidDiscount: number;
  prepaidDiscountPercent: number;
  shipping: { quoted: boolean; charge: number; free: boolean; estimatedDays: number | null };
  tax: number;
  /** true: `tax` is GST already included in the prices (not added to the total). */
  taxIncluded: boolean;
  grandTotal: number;
  paymentMethods: CheckoutPaymentMethod[];
}

export const checkoutApi = {
  lookupCustomer: (params: { mobile?: string; email?: string }) =>
    apiClient
      .get<
        ApiEnvelope<{ found: boolean; customer?: AutofillCustomer }>
      >("/checkout/lookup-customer", { params })
      .then((r) => r.data),

  quote: (payload: CheckoutQuoteRequest) =>
    apiClient.post<ApiEnvelope<CheckoutQuote>>("/checkout/quote", payload).then((r) => r.data),

  requestOtp: (payload: RequestOtpPayload) =>
    apiClient
      .post<
        ApiEnvelope<{ isExistingUser: boolean; expiresInMinutes: number }>
      >("/checkout/request-otp", payload)
      .then((r) => r.data),

  resendOtp: (payload: { mobile: string }) =>
    apiClient
      .post<
        ApiEnvelope<{ isExistingUser: boolean; expiresInMinutes: number }>
      >("/checkout/resend-otp", payload)
      .then((r) => r.data),

  /** Verifies the OTP and signs the customer in (creating the account if new). */
  verifyOtp: async (payload: VerifyOtpPayload) => {
    const res = await apiClient.post<
      ApiEnvelope<{ user: User; accessToken: string; isNewUser: boolean }>
    >("/checkout/verify-otp", payload);
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },
};
