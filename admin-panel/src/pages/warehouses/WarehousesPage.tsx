import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  Crown,
  MapPin,
  PackageX,
  Pencil,
  Phone,
  Plus,
  Power,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  User,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import type { Warehouse, WarehouseActivity, WarehouseInput } from "@/api/warehouses";
import { productsApi } from "@/api/products";
import {
  useCreateWarehouse,
  useDeactivateWarehouse,
  useRepairWarehouses,
  useTransferStock,
  useUpdateWarehouse,
  useWarehouseOverview,
  useWarehouseSummary,
} from "@/hooks/useWarehouses";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { cn, formatDateTime, formatNumber } from "@/lib/utils";

const MOVEMENT_LABEL: Record<string, string> = {
  purchase: "Stock received",
  sale: "Sold",
  return: "Returned",
  adjustment: "Adjusted",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
  reservation: "Reserved",
  release: "Released",
  damaged: "Marked damaged",
};

const cityLine = (w: Warehouse) => [w.address?.city, w.address?.state, w.address?.pincode].filter(Boolean).join(", ");

/** Warehouse dashboard: health, totals, every warehouse with its stock, and recent activity. */
export function WarehousesPage() {
  const { data, isLoading } = useWarehouseOverview();
  const repair = useRepairWarehouses();
  const update = useUpdateWarehouse();
  const deactivate = useDeactivateWarehouse();
  const [editing, setEditing] = useState<Warehouse | "new" | null>(null);
  const [viewing, setViewing] = useState<Warehouse | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ warehouse: Warehouse; action: "default" | "deactivate" | "activate" } | null>(null);

  const runConfirm = () => {
    if (!confirm) return;
    const done = { onSuccess: () => setConfirm(null) };
    if (confirm.action === "deactivate") deactivate.mutate(confirm.warehouse._id, done);
    else update.mutate({ id: confirm.warehouse._id, values: confirm.action === "default" ? { isDefault: true } : { status: "active" } }, done);
  };

  const activeWarehouses = data?.warehouses.filter((w) => w.status === "active") ?? [];

  return (
    <div>
      <PageHeader
        title="Warehouses"
        description="Where your stock lives — one default warehouse receives new products and fulfils orders"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTransferOpen(true)} disabled={activeWarehouses.length < 2}>
              <ArrowLeftRight size={14} /> Transfer stock
            </Button>
            <Button onClick={() => setEditing("new")}>
              <Plus size={14} /> Add warehouse
            </Button>
          </div>
        }
      />

      {data && (
        <div
          className={cn(
            "mb-6 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm",
            data.health.healthy ? "border-success/20 bg-success-bg text-success" : "border-warning/30 bg-warning-bg text-warning",
          )}
        >
          {data.health.healthy ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
          <p className="flex-1">
            {data.health.healthy
              ? `Inventory healthy — ${data.health.defaultWarehouse?.name ?? "default"} is the default warehouse. Checked automatically on every server start.`
              : `Needs attention: ${data.health.issues.join(" · ")}`}
          </p>
          <Button size="sm" variant={data.health.healthy ? "ghost" : "primary"} onClick={() => repair.mutate(undefined)} isLoading={repair.isPending}>
            <RefreshCw size={13} /> {data.health.healthy ? "Re-check" : "Repair now"}
          </Button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Warehouses" value={data ? `${data.totals.active} / ${data.totals.warehouses}` : "—"} icon={<WarehouseIcon size={16} />} isLoading={isLoading} />
        <StatCard label="Units in stock" value={formatNumber(data?.totals.units)} icon={<Boxes size={16} />} isLoading={isLoading} />
        <StatCard label="Reserved" value={formatNumber(data?.totals.reserved)} isLoading={isLoading} />
        <StatCard label="Low stock" value={formatNumber(data?.totals.lowStock)} icon={<TrendingDown size={16} />} isLoading={isLoading} />
        <StatCard label="Out of stock" value={formatNumber(data?.totals.outOfStock)} icon={<PackageX size={16} />} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
            : data?.warehouses.map((w) => (
                <WarehouseCard
                  key={w._id}
                  warehouse={w}
                  onView={() => setViewing(w)}
                  onEdit={() => setEditing(w)}
                  onMakeDefault={() => setConfirm({ warehouse: w, action: "default" })}
                  onToggle={() => setConfirm({ warehouse: w, action: w.status === "active" ? "deactivate" : "activate" })}
                />
              ))}
        </div>

        <Card className="self-start">
          <CardHeader title="Recent activity" description="Latest stock movements across all warehouses" />
          <CardBody className="p-0">
            {isLoading ? (
              <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : !data?.recentActivity.length ? (
              <EmptyState icon={<Boxes size={18} />} title="No stock movements yet" className="py-10" />
            ) : (
              <ActivityList items={data.recentActivity} showWarehouse />
            )}
          </CardBody>
        </Card>
      </div>

      <WarehouseFormModal editing={editing} onClose={() => setEditing(null)} />
      <WarehouseDetailModal warehouse={viewing} onClose={() => setViewing(null)} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} warehouses={activeWarehouses} />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        isLoading={update.isPending || deactivate.isPending}
        danger={confirm?.action === "deactivate"}
        title={
          confirm?.action === "default"
            ? `Make ${confirm.warehouse.name} the default warehouse?`
            : confirm?.action === "deactivate"
              ? `Deactivate ${confirm?.warehouse.name}?`
              : `Activate ${confirm?.warehouse.name}?`
        }
        description={
          confirm?.action === "default"
            ? "New products get their stock here, and orders are fulfilled from it."
            : confirm?.action === "deactivate"
              ? confirm.warehouse.isDefault
                ? "Another active warehouse becomes the default automatically. A warehouse that still holds stock can't be deactivated — transfer it first."
                : "A warehouse that still holds stock can't be deactivated — transfer it first."
              : "It can then receive stock and be made the default."
        }
        confirmLabel={confirm?.action === "default" ? "Make default" : confirm?.action === "deactivate" ? "Deactivate" : "Activate"}
      />
    </div>
  );
}

function WarehouseCard({
  warehouse: w,
  onView,
  onEdit,
  onMakeDefault,
  onToggle,
}: {
  warehouse: Warehouse;
  onView: () => void;
  onEdit: () => void;
  onMakeDefault: () => void;
  onToggle: () => void;
}) {
  const s = w.summary;
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg",
        w.isDefault ? "border-brand/30" : "border-border",
        w.status === "inactive" && "opacity-70",
      )}
    >
      <div className={cn("h-1.5", w.isDefault ? "bg-gradient-to-r from-brand to-gold" : "bg-border")} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">{w.name}</p>
            <p className="text-xs uppercase tracking-wider text-muted">{w.code}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {w.isDefault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-medium text-white">
                <Crown size={11} /> Default
              </span>
            )}
            <Badge tone={w.status === "active" ? "success" : "neutral"}>{w.status === "active" ? "Active" : "Inactive"}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-muted">
          {cityLine(w) && <p className="flex items-center gap-2"><MapPin size={13} /> {cityLine(w)}</p>}
          {w.contactPerson && <p className="flex items-center gap-2"><User size={13} /> {w.contactPerson}</p>}
          {w.contactPhone && <p className="flex items-center gap-2"><Phone size={13} /> {w.contactPhone}</p>}
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl bg-surface p-3 text-center">
          {[
            ["Units", s?.units],
            ["Products", s?.products],
            ["Low", s?.lowStock],
            ["Out", s?.outOfStock],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-base font-semibold tabular-nums text-ink">{formatNumber(value as number)}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
            </div>
          ))}
        </div>

        {w.utilisation !== null && w.utilisation !== undefined && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Capacity used</span>
              <span>{w.utilisation}% of {formatNumber(w.capacity)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface">
              <div className={cn("h-full rounded-full", w.utilisation > 90 ? "bg-danger" : "bg-gold")} style={{ width: `${w.utilisation}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" variant="outline" onClick={onView}>View</Button>
          <Button size="sm" variant="ghost" onClick={onEdit}><Pencil size={13} /> Edit</Button>
          {!w.isDefault && w.status === "active" && (
            <Button size="sm" variant="ghost" onClick={onMakeDefault}><Crown size={13} /> Make default</Button>
          )}
          <Button size="sm" variant="ghost" onClick={onToggle} className={w.status === "active" ? "text-danger" : ""}>
            <Power size={13} /> {w.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityList({ items, showWarehouse }: { items: WarehouseActivity[]; showWarehouse?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((m) => (
        <li key={m._id} className="flex items-start gap-3 px-5 py-3">
          <span className={cn("mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums", m.quantity >= 0 ? "bg-success-bg text-success" : "bg-danger-bg text-danger")}>
            {m.quantity >= 0 ? "+" : ""}
            {formatNumber(m.quantity)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{m.product?.title ?? "Deleted product"}{m.variant?.sku ? ` · ${m.variant.sku}` : ""}</p>
            <p className="truncate text-xs text-muted">
              {MOVEMENT_LABEL[m.type] ?? m.type}
              {showWarehouse && m.warehouse ? ` · ${m.warehouse.code}` : ""}
              {m.performedBy ? ` · ${m.performedBy.name}` : m.referenceType === "system" ? " · System" : ""} · {formatDateTime(m.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const emptyForm = {
  name: "",
  code: "",
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  capacity: "",
  notes: "",
  isDefault: false,
};

const formFrom = (w: Warehouse | null) =>
  w
    ? {
        name: w.name,
        code: w.code,
        contactPerson: w.contactPerson || "",
        contactPhone: w.contactPhone || "",
        contactEmail: w.contactEmail || "",
        line1: w.address?.line1 || "",
        line2: w.address?.line2 || "",
        city: w.address?.city || "",
        state: w.address?.state || "",
        pincode: w.address?.pincode || "",
        capacity: w.capacity ? String(w.capacity) : "",
        notes: w.notes || "",
        isDefault: w.isDefault,
      }
    : emptyForm;

function WarehouseFormModal({ editing, onClose }: { editing: Warehouse | "new" | null; onClose: () => void }) {
  const isEdit = !!editing && editing !== "new";
  return (
    <Modal open={!!editing} onClose={onClose} title={isEdit ? `Edit ${(editing as Warehouse).name}` : "Add warehouse"}>
      {/* Keyed so the form starts from the warehouse being edited (or blank). */}
      {editing && <WarehouseForm key={isEdit ? (editing as Warehouse)._id : "new"} warehouse={isEdit ? (editing as Warehouse) : null} onDone={onClose} />}
    </Modal>
  );
}

function WarehouseForm({ warehouse, onDone }: { warehouse: Warehouse | null; onDone: () => void }) {
  const create = useCreateWarehouse();
  const update = useUpdateWarehouse();
  const [form, setForm] = useState(() => formFrom(warehouse));

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: WarehouseInput = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      contactPerson: form.contactPerson.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
      address: { line1: form.line1.trim(), line2: form.line2.trim(), city: form.city.trim(), state: form.state.trim(), pincode: form.pincode.trim(), country: "India" },
      capacity: form.capacity ? Number(form.capacity) : 0,
      notes: form.notes.trim(),
      ...(form.isDefault && !warehouse?.isDefault ? { isDefault: true } : {}),
    };
    if (warehouse) update.mutate({ id: warehouse._id, values }, { onSuccess: onDone });
    else create.mutate(values, { onSuccess: onDone });
  };

  return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <Input label="Name" required value={form.name} onChange={set("name")} placeholder="Bengaluru Fulfilment Centre" />
          <Input label="Code" required value={form.code} onChange={set("code")} placeholder="BLR-01" hint="Letters, numbers, - or _" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Manager" value={form.contactPerson} onChange={set("contactPerson")} />
          <Input label="Phone" value={form.contactPhone} onChange={set("contactPhone")} />
          <Input label="Email" type="email" value={form.contactEmail} onChange={set("contactEmail")} />
        </div>
        <Input label="Address line 1" value={form.line1} onChange={set("line1")} />
        <Input label="Address line 2" value={form.line2} onChange={set("line2")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="City" value={form.city} onChange={set("city")} />
          <Input label="State" value={form.state} onChange={set("state")} />
          <Input label="Pincode" value={form.pincode} onChange={set("pincode")} inputMode="numeric" maxLength={6} />
        </div>
        <Input label="Capacity (units)" type="number" min={0} value={form.capacity} onChange={set("capacity")} hint="Optional — shows how full the warehouse is. Leave empty to not track." />
        <Textarea label="Notes" rows={2} value={form.notes} onChange={set("notes")} maxLength={500} />
        {!warehouse?.isDefault && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            Make this the default warehouse
          </label>
        )}
        <Button type="submit" className="w-full" isLoading={create.isPending || update.isPending}>
          {warehouse ? "Save changes" : "Add warehouse"}
        </Button>
      </form>
  );
}

function WarehouseDetailModal({ warehouse, onClose }: { warehouse: Warehouse | null; onClose: () => void }) {
  const { data, isLoading } = useWarehouseSummary(warehouse?._id ?? null);
  return (
    <Modal open={!!warehouse} onClose={onClose} title={warehouse ? `${warehouse.name} (${warehouse.code})` : ""} className="max-w-3xl">
      {isLoading || !data ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Units", data.warehouse.summary?.units],
              ["Reserved", data.warehouse.summary?.reserved],
              ["Damaged", data.warehouse.summary?.damaged],
              ["Incoming", data.warehouse.summary?.incoming],
              ["Products", data.warehouse.summary?.products],
              ["SKUs in stock", data.warehouse.summary?.skus],
              ["Low stock", data.warehouse.summary?.lowStock],
              ["Out of stock", data.warehouse.summary?.outOfStock],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-xl border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatNumber(value as number)}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Low stock</p>
            {!data.lowStockItems.length ? (
              <p className="rounded-xl border border-border px-4 py-3 text-sm text-muted">Nothing is running low here.</p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {data.lowStockItems.map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                    <span className="truncate text-ink">{item.product?.title ?? "Deleted product"}{item.variant?.sku ? ` · ${item.variant.sku}` : ""}</span>
                    <span className={cn("tabular-nums", item.available <= 0 ? "text-danger" : "text-warning")}>
                      {formatNumber(item.available)} left <span className="text-muted">/ alert at {item.lowStockThreshold}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Recent activity</p>
            {!data.recentActivity.length ? (
              <p className="rounded-xl border border-border px-4 py-3 text-sm text-muted">No stock movements yet.</p>
            ) : (
              <div className="rounded-xl border border-border">
                <ActivityList items={data.recentActivity} />
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Move stock of one product between two active warehouses (uses the existing transfer API). */
function TransferModal({ open, onClose, warehouses }: { open: boolean; onClose: () => void; warehouses: Warehouse[] }) {
  const transfer = useTransferStock();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [product, setProduct] = useState<{ _id: string; title: string } | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);
  const { data: results } = useQuery({
    queryKey: ["warehouse-transfer-products", debounced],
    queryFn: () => productsApi.list({ keyword: debounced, limit: 8 }),
    enabled: open && debounced.length >= 2 && !product,
    select: (r) => r.data.products,
  });

  const close = () => {
    setTerm("");
    setProduct(null);
    setFrom("");
    setTo("");
    setQuantity("");
    setNote("");
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !from || !to || from === to || !(Number(quantity) > 0)) return;
    transfer.mutate({ productId: product._id, fromWarehouseId: from, toWarehouseId: to, quantity: Number(quantity), note: note.trim() || undefined }, { onSuccess: close });
  };

  return (
    <Modal open={open} onClose={close} title="Transfer stock">
      <form onSubmit={submit} className="space-y-4">
        {product ? (
          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
            <span className="font-medium text-ink">{product.title}</span>
            <button type="button" className="text-xs text-muted hover:text-ink" onClick={() => setProduct(null)}>Change</button>
          </div>
        ) : (
          <div className="relative">
            <Input label="Product" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search by name…" />
            {!!results?.length && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                {results.map((p) => (
                  <button key={p._id} type="button" onClick={() => setProduct({ _id: p._id, title: p.title })} className="block w-full px-3 py-2 text-left text-sm hover:bg-surface">
                    {p.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)} required>
            <option value="">Choose…</option>
            {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </Select>
          <Select label="To" value={to} onChange={(e) => setTo(e.target.value)} required>
            <option value="">Choose…</option>
            {warehouses.filter((w) => w._id !== from).map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </Select>
        </div>
        <Input label="Quantity" type="number" min={1} required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Restocking the Pune store" />
        <Button type="submit" className="w-full" isLoading={transfer.isPending} disabled={!product || !from || !to || from === to}>
          <ArrowLeftRight size={14} /> Transfer
        </Button>
      </form>
    </Modal>
  );
}
