import { useState } from "react";
import { Plus, Pencil, Trash2, Ticket, BarChart3 } from "lucide-react";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, useCouponAnalytics } from "@/hooks/useCoupons";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Coupon } from "@/types";
import { couponsApi } from "@/api/coupons";
import { useQueryClient } from "@tanstack/react-query";
import { BulkActionBar, exportCsv, useSelection } from "@/components/common/BulkActions";


const emptyForm = { code: "", discount: 0, type: "percentage" as "percentage" | "flat", expiry: "", minimumOrder: 0, maximumDiscount: undefined as number | undefined, usageLimit: 0, perUserLimit: 1, isActive: true };

export function CouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const qc = useQueryClient();
  const selection = useSelection(coupons?.map((c) => c._id) ?? []);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({ code: c.code, discount: c.discount, type: c.type, expiry: c.expiry.slice(0, 10), minimumOrder: c.minimumOrder, maximumDiscount: c.maximumDiscount, usageLimit: c.usageLimit, perUserLimit: c.perUserLimit, isActive: c.isActive });
    setModalOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateCoupon.mutate({ id: editing._id, values: form }, { onSuccess: () => setModalOpen(false) });
    else createCoupon.mutate(form, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <div>
      <PageHeader title="Coupons" description={coupons ? `${coupons.length} coupons` : undefined} action={<Button onClick={openAdd}><Plus size={15} /> Add coupon</Button>} />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !coupons || coupons.length === 0 ? (
          <EmptyState icon={<Ticket size={18} />} title="No coupons yet" />
        ) : (
          <>
          <BulkActionBar
            selection={selection}
            onDone={() => qc.invalidateQueries({ queryKey: ["admin-coupons"] })}
            actions={[
              { label: "Activate", run: (id) => couponsApi.update(id, { isActive: true }) },
              { label: "Deactivate", run: (id) => couponsApi.update(id, { isActive: false }) },
              { label: "Delete", variant: "danger", confirm: "Delete the selected coupons?", run: (id) => couponsApi.remove(id) },
            ]}
            extra={
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportCsv(
                    "coupons.csv",
                    coupons
                      .filter((c) => selection.isSelected(c._id))
                      .map((c) => ({ code: c.code, type: c.type, discount: c.discount, minimumOrder: c.minimumOrder, used: c.usedCount, limit: c.usageLimit, expiry: c.expiry, active: c.isActive })),
                  )
                }
              >
                Export
              </Button>
            }
          />
          <Table>
            <Thead>
              <tr>
                <Th className="w-8"><input type="checkbox" aria-label="Select all" checked={selection.allSelected} onChange={selection.toggleAll} /></Th>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Usage</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {coupons.map((c) => (
                <Tr key={c._id}>
                  <Td><input type="checkbox" aria-label={`Select ${c.code}`} checked={selection.isSelected(c._id)} onChange={() => selection.toggle(c._id)} /></Td>
                  <Td className="font-mono text-sm font-medium">{c.code}</Td>
                  <Td className="text-sm">{c.type === "percentage" ? `${c.discount}%` : formatCurrency(c.discount)}</Td>
                  <Td className="text-sm text-muted">{c.usedCount} / {c.usageLimit || "∞"}</Td>
                  <Td className="text-sm text-muted">{formatDate(c.expiry)}</Td>
                  <Td><Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge></Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setAnalyticsId(c._id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Analytics"><BarChart3 size={14} /></button>
                      <button onClick={() => openEdit(c)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(c._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit coupon" : "Add coupon"}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Code" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percentage" | "flat" }))}>
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </Select>
            <Input label="Discount" type="number" required value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))} />
          </div>
          <Input label="Expiry date" type="date" required value={form.expiry} onChange={(e) => setForm((f) => ({ ...f, expiry: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Minimum order" type="number" value={form.minimumOrder} onChange={(e) => setForm((f) => ({ ...f, minimumOrder: Number(e.target.value) }))} />
            <Input label="Max discount (optional)" type="number" value={form.maximumDiscount ?? ""} onChange={(e) => setForm((f) => ({ ...f, maximumDiscount: e.target.value ? Number(e.target.value) : undefined }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Usage limit (0 = unlimited)" type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))} />
            <Input label="Per-user limit" type="number" value={form.perUserLimit} onChange={(e) => setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
          <Button type="submit" className="w-full" isLoading={createCoupon.isPending || updateCoupon.isPending}>
            Save coupon
          </Button>
        </form>
      </Modal>

      <CouponAnalyticsModal couponId={analyticsId} onClose={() => setAnalyticsId(null)} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCoupon.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete coupon"
        confirmLabel="Delete"
        danger
        isLoading={deleteCoupon.isPending}
      />
    </div>
  );
}

function CouponAnalyticsModal({ couponId, onClose }: { couponId: string | null; onClose: () => void }) {
  const { data, isLoading } = useCouponAnalytics(couponId || undefined);
  return (
    <Modal open={!!couponId} onClose={onClose} title="Coupon analytics">
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : data ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted">Total redemptions</span><span>{data.totalRedemptions}</span></div>
          <div className="flex justify-between"><span className="text-muted">Unique users</span><span>{data.uniqueUsers}</span></div>
          <div className="flex justify-between"><span className="text-muted">Total discount given</span><span className="font-mono">{formatCurrency(data.totalDiscountGiven)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Total order value</span><span className="font-mono">{formatCurrency(data.totalOrderValue)}</span></div>
        </div>
      ) : (
        <p className="text-sm text-muted">No data available.</p>
      )}
    </Modal>
  );
}
