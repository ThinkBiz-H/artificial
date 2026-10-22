import { useState } from "react";
import type { Address } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type AddressPayload = Omit<Address, "_id" | "createdAt" | "updatedAt">;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const empty: AddressPayload = {
  type: "Home",
  firstName: "",
  lastName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  isDefault: false,
};

/** Saved-address form (existing /users/address API fields). */
export function AddressForm({
  initial,
  onSubmit,
  isLoading,
  submitLabel = "Save address",
}: {
  initial?: Partial<Address>;
  onSubmit: (payload: AddressPayload) => void;
  isLoading?: boolean;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<AddressPayload>(() => ({
    ...empty,
    ...Object.fromEntries(Object.entries(initial ?? {}).filter(([k, v]) => v != null && !["_id", "createdAt", "updatedAt"].includes(k))),
  }));
  const [pinError, setPinError] = useState<string | null>(null);
  const set = (k: keyof AddressPayload) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.country.trim().toLowerCase() === "india" && !/^\d{6}$/.test(form.pincode.trim())) {
      setPinError("Enter a valid 6-digit pincode");
      return;
    }
    setPinError(null);
    onSubmit({ ...form, pincode: form.pincode.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2" role="radiogroup" aria-label="Address type">
        {(["Home", "Office", "Other"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={form.type === t}
            onClick={() => setForm((f) => ({ ...f, type: t }))}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              form.type === t ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="First name" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} />
        <Input label="Last name" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} />
      </div>
      <Input label="Phone" type="tel" inputMode="numeric" autoComplete="tel" value={form.phone} onChange={set("phone")} />
      <Input label="House / flat, street" required autoComplete="address-line1" value={form.addressLine1} onChange={set("addressLine1")} />
      <Input label="Area, landmark (optional)" autoComplete="address-line2" value={form.addressLine2} onChange={set("addressLine2")} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Pincode"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          value={form.pincode}
          onChange={set("pincode")}
          error={pinError ?? undefined}
        />
        <Input label="City" required autoComplete="address-level2" value={form.city} onChange={set("city")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="State" required list="in-states" autoComplete="address-level1" value={form.state} onChange={set("state")} />
        <Input label="Country" required autoComplete="country-name" value={form.country} onChange={set("country")} />
      </div>
      <datalist id="in-states">
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <label className="flex items-center gap-2.5 text-sm text-fg-soft">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          className="h-4 w-4 accent-primary"
        />
        Make this my default address
      </label>
      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </form>
  );
}
