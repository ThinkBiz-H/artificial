import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Coins, Wallet } from "lucide-react";
import { customersApi } from "@/api/customers";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { cn, formatCurrency, formatDateTime, getErrorMessage } from "@/lib/utils";
import type { AdminUser } from "@/types";

const VERIFY_TONE = { verified: "success", pending: "warning", rejected: "danger", unverified: "neutral" } as const;

/** Business verification, GST details and credit limit for a B2B customer. */
export function BusinessCard({ customer }: { customer: AdminUser }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    verification: customer.businessVerification?.status ?? "unverified",
    note: customer.businessVerification?.note ?? "",
    creditLimit: String(customer.creditLimit ?? 0),
    businessName: customer.businessProfile?.name ?? "",
    gstin: customer.businessProfile?.gstin ?? "",
  });
  const save = useMutation({
    mutationFn: () =>
      customersApi.updateBusiness(customer._id, {
        verification: form.verification,
        note: form.note,
        creditLimit: Number(form.creditLimit) || 0,
        businessName: form.businessName,
        gstin: form.gstin,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-customer", customer._id] });
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Business details saved");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const status = customer.businessVerification?.status ?? "unverified";

  return (
    <Card>
      <CardHeader
        title="Business & verification"
        description="GST and shop details checked by your team."
        action={
          <Badge tone={VERIFY_TONE[status]}>
            {status === "verified" && <BadgeCheck size={11} />} {status}
          </Badge>
        }
      />
      <CardBody>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <Input label="Business / shop name" value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
          <Input label="GSTIN" maxLength={15} value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Verification" value={form.verification} onChange={(e) => setForm((f) => ({ ...f, verification: e.target.value as typeof f.verification }))}>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
            <Input label="Credit limit (₹)" type="number" min={0} value={form.creditLimit} onChange={(e) => setForm((f) => ({ ...f, creditLimit: e.target.value }))} />
          </div>
          <Input label="Internal note" placeholder="e.g. GST certificate checked on call" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          {customer.businessVerification?.verifiedAt && <p className="text-xs text-muted">Verified {formatDateTime(customer.businessVerification.verifiedAt)}</p>}
          <Button type="submit" size="sm" className="w-full" isLoading={save.isPending}>
            Save business details
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

/** Wallet (₹) and reward points with admin adjustments and full history. */
export function WalletCard({ customer }: { customer: AdminUser }) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"wallet" | "points">("wallet");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const { data: entries } = useQuery({
    queryKey: ["admin-customer-ledger", customer._id],
    queryFn: () => customersApi.ledger(customer._id),
    select: (r) => r.data.entries,
  });
  const adjust = useMutation({
    mutationFn: (sign: 1 | -1) => customersApi.adjustLedger(customer._id, { kind, amount: sign * Math.abs(Number(amount)), note }),
    onSuccess: () => {
      setAmount("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-customer", customer._id] });
      qc.invalidateQueries({ queryKey: ["admin-customer-ledger", customer._id] });
      toast.success("Balance updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const valid = Number(amount) > 0 && note.trim().length > 0;

  return (
    <Card>
      <CardHeader title="Wallet & reward points" description="Credits, refunds to wallet and loyalty points — every change is logged." />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <Wallet size={13} /> Wallet
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">{formatCurrency(customer.walletBalance ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <Coins size={13} /> Reward points
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">{(customer.rewardPoints ?? 0).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="space-y-2 rounded-xl border border-border p-3">
          <div className="flex rounded-lg border border-border p-0.5">
            {(["wallet", "points"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={cn("flex-1 rounded-md py-1 text-xs font-medium", kind === k ? "bg-brand text-white" : "text-muted")}>
                {k === "wallet" ? "Wallet (₹)" : "Points"}
              </button>
            ))}
          </div>
          <Input type="number" min={0} step={kind === "wallet" ? "0.01" : "1"} placeholder={kind === "wallet" ? "Amount (₹)" : "Points"} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Reason (required)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" size="sm" className="flex-1" disabled={!valid} isLoading={adjust.isPending && adjust.variables === 1} onClick={() => adjust.mutate(1)}>
              Credit
            </Button>
            <Button type="button" size="sm" variant="outline" className="flex-1" disabled={!valid} isLoading={adjust.isPending && adjust.variables === -1} onClick={() => adjust.mutate(-1)}>
              Debit
            </Button>
          </div>
        </div>
        {!entries?.length ? (
          <EmptyState title="No wallet or points activity yet" className="py-6" />
        ) : (
          <ul className="max-h-64 divide-y divide-border overflow-y-auto">
            {entries.map((e) => (
              <li key={e._id} className="flex items-start justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-ink">{e.note}</p>
                  <p className="text-[11px] text-muted">
                    {e.kind === "wallet" ? "Wallet" : "Points"} · {formatDateTime(e.createdAt)}
                    {e.performedBy && typeof e.performedBy === "object" ? ` · ${e.performedBy.name}` : ""}
                  </p>
                </div>
                <span className={cn("flex-none font-mono text-xs font-semibold", e.amount >= 0 ? "text-success" : "text-danger")}>
                  {e.amount >= 0 ? "+" : "−"}
                  {e.kind === "wallet" ? formatCurrency(Math.abs(e.amount)) : Math.abs(e.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
