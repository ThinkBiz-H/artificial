import { useCallback, useEffect, useRef, useState } from "react";
import { checkoutApi, type AutofillCustomer } from "@/api/checkout";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEBOUNCE_MS = 500;

function isValidMobile(value: string) {
  return /^\d{10}$/.test(value.trim());
}

function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

/**
 * Checkout "auto fill customer details" — debounced lookup by mobile/email
 * against the existing customer database (MongoDB via the backend API, not
 * a client-side query), so a returning customer's saved name + address
 * prefills the guest checkout form the way Amazon/Flipkart do.
 *
 * Purely additive: never throws into the caller, never overwrites fields
 * the user already touched (the caller passes `touched` into `fillForm`),
 * and silently no-ops on "not found" or network errors — manual checkout
 * always still works.
 */
export function useCustomerAutofill() {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<AutofillCustomer | null>(null);
  const [found, setFound] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueryRef = useRef<string>("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const runLookup = useCallback(
    async (params: { mobile?: string; email?: string }, queryKey: string) => {
      lastQueryRef.current = queryKey;
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const res = await checkoutApi.lookupCustomer(params);
        if (requestId !== requestIdRef.current) return; // superseded by a newer search
        if (res.data.found && res.data.customer) {
          setCustomer(res.data.customer);
          setFound(true);
        } else {
          setFound(false);
        }
      } catch {
        // Network/validation/server errors are treated exactly like "not
        // found" — no popup, checkout stays fully usable manually.
        setFound(false);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [],
  );

  /** Call on every mobile/email change; debounces and validates internally. */
  const searchCustomer = useCallback(
    (mobile: string, email: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const trimmedMobile = mobile.trim();
      const trimmedEmail = email.trim();
      const mobileValid = isValidMobile(trimmedMobile);
      const emailValid = isValidEmail(trimmedEmail);

      // Mobile takes priority over email per the required search order.
      if (!mobileValid && !emailValid) return;

      const queryKey = mobileValid
        ? `mobile:${trimmedMobile}`
        : `email:${trimmedEmail}`;
      if (queryKey === lastQueryRef.current) return; // already searched this exact value

      const params = mobileValid
        ? { mobile: trimmedMobile }
        : { email: trimmedEmail };

      timerRef.current = setTimeout(() => {
        void runLookup(params, queryKey);
      }, DEBOUNCE_MS);
    },
    [runLookup],
  );

  /**
   * Returns only the fields the caller hasn't marked as user-touched, so
   * spreading this into form state never clobbers a manual edit.
   */
  const fillForm = useCallback(
    (
      touched: Partial<Record<keyof AutofillCustomer, boolean>> = {},
    ): Partial<AutofillCustomer> => {
      if (!customer) return {};
      const patch: Partial<AutofillCustomer> = {};
      (Object.keys(customer) as (keyof AutofillCustomer)[]).forEach((key) => {
        if (touched[key]) return;
        const value = customer[key];
        if (value) patch[key] = value;
      });
      return patch;
    },
    [customer],
  );

  return { loading, customer, found, searchCustomer, fillForm };
}
