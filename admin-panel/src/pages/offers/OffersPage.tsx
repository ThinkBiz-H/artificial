import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgePercent, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { offersApi, type Offer, type OfferFormValues, type OfferKind } from "@/api/offers";
import { productsApi } from "@/api/products";
import { useCategoryTree } from "@/hooks/useCategories";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { getErrorMessage } from "@/lib/utils";
import type { Category } from "@/types";

const KINDS: { value: OfferKind; label: string; hint: string }[] = [
  { value: "festival", label: "Festival offer", hint: "Whole store, or the categories / products you pick." },
  { value: "category", label: "Category offer", hint: "Every product in the chosen categories (and their sub-categories)." },
  { value: "product", label: "Product offer", hint: "Only the products you pick." },
  { value: "store", label: "Store-wide", hint: "Every active product." },
];

/** "2026-11-04T10:30" for <input type="datetime-local"> in local time. */
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const blank = (): OfferFormValues => ({
  name: "",
  kind: "category",
  discountType: "percentage",
  value: 10,
  categories: [],
  products: [],
  startsAt: toLocalInput(new Date()),
  endsAt: toLocalInput(new Date(Date.now() + 7 * 864e5)),
  isActive: true,
  description: "",
});

const flatten = (list: Category[], depth = 0): { c: Category; depth: number }[] =>
  list.flatMap((c) => [{ c, depth }, ...flatten(c.children ?? [], depth + 1)]);

const STATUS_TONE = { running: "success", scheduled: "info", ended: "neutral" } as const;

/**
 * Automatic offers — no code needed at checkout. While an offer runs the
 * backend lowers each target's wholesale price and restores it when it ends.
 */
export function OffersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-offers"], queryFn: () => offersApi.list(), select: (r) => r.data.offers });
  const { data: tree } = useCategoryTree();
  const categories = useMemo(() => flatten(tree ?? []), [tree]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<OfferFormValues>(blank);
  const [productSearch, setProductSearch] = useState("");
  const [picked, setPicked] = useState<{ _id: string; title: string }[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: productResults } = useQuery({
    queryKey: ["admin-offer-products", productSearch],
    queryFn: () => productsApi.list({ keyword: productSearch, limit: 8 }),
    enabled: open && productSearch.trim().length >= 2,
    select: (r) => r.data.products,
  });

  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    toast.success(msg);
  };
  const save = useMutation({
    mutationFn: (values: OfferFormValues) => {
      const body = { ...values, startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString() };
      return editing ? offersApi.update(editing._id, body) : offersApi.create(body);
    },
    onSuccess: () => {
      setOpen(false);
      done(editing ? "Offer updated" : "Offer created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => offersApi.remove(id),
    onSuccess: () => {
      setDeleteId(null);
      done("Offer deleted — prices restored");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  const toggle = useMutation({
    mutationFn: (o: Offer) => offersApi.update(o._id, { isActive: !o.isActive }),
    onSuccess: () => done("Offer updated"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const openAdd = () => {
    setEditing(null);
    setForm(blank());
    setPicked([]);
    setProductSearch("");
    setOpen(true);
  };
  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({
      name: o.name,
      kind: o.kind,
      discountType: o.discountType,
      value: o.value,
      categories: o.categories.map((c) => c._id),
      products: o.products.map((p) => p._id),
      startsAt: toLocalInput(new Date(o.startsAt)),
      endsAt: toLocalInput(new Date(o.endsAt)),
      isActive: o.isActive,
      description: o.description || "",
    });
    setPicked(o.products.map((p) => ({ _id: p._id, title: p.title })));
    setProductSearch("");
    setOpen(true);
  };

  const set = <K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleCategory = (id: string) =>
    set("categories", form.categories.includes(id) ? form.categories.filter((x) => x !== id) : [...form.categories, id]);
  const addProduct = (p: { _id: string; title: string }) => {
    if (form.products.includes(p._id)) return;
    set("products", [...form.products, p._id]);
    setPicked((list) => [...list, p]);
  };
  const removeProduct = (id: string) => {
    set("products", form.products.filter((x) => x !== id));
    setPicked((list) => list.filter((p) => p._id !== id));
  };

  const showCategories = form.kind === "category" || form.kind === "festival";
  const showProducts = form.kind === "product" || form.kind === "festival";
  const describe = (o: Offer) =>
    o.kind === "store" || (o.kind === "festival" && !o.categories.length && !o.products.length)
      ? "Whole store"
      : [...o.categories.map((c) => c.name), ...o.products.map((p) => p.title)].slice(0, 3).join(", ") +
        (o.categories.length + o.products.length > 3 ? ` +${o.categories.length + o.products.length - 3}` : "");
  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <PageHeader
        title="Offers"
        description="Automatic discounts for festivals, categories or products — prices drop when an offer starts and return when it ends."
        action={
          <Button onClick={openAdd}>
            <Plus size={15} /> Create offer
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState icon={<BadgePercent size={18} />} title="No offers yet" description="Create a festival, category or product offer." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Offer</Th>
                <Th>Discount</Th>
                <Th>Applies to</Th>
                <Th>Runs</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {data.map((o) => (
                <Tr key={o._id}>
                  <Td>
                    <p className="text-sm font-medium text-ink">{o.name}</p>
                    <p className="text-xs capitalize text-muted">{o.kind} offer</p>
                  </Td>
                  <Td className="text-sm text-ink">{o.discountType === "percentage" ? `${o.value}% off` : `₹${o.value} off`}</Td>
                  <Td className="max-w-[220px] truncate text-sm text-muted">{describe(o)}</Td>
                  <Td className="text-xs text-muted">
                    {fmt(o.startsAt)} → {fmt(o.endsAt)}
                  </Td>
                  <Td>
                    <Badge tone={o.isActive ? STATUS_TONE[o.status] : "neutral"}>{o.isActive ? o.status : "disabled"}</Badge>
                    {o.status === "running" && <p className="mt-1 text-xs text-muted">{o.appliedCount ?? 0} prices lowered</p>}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggle.mutate(o)} disabled={toggle.isPending}>
                        {o.isActive ? "Disable" : "Enable"}
                      </Button>
                      <button onClick={() => openEdit(o)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(o._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit offer" : "Create offer"} className="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="space-y-4"
        >
          <Input label="Offer name" required placeholder="e.g. Diwali Dhamaka" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Select label="Offer type" value={form.kind} onChange={(e) => set("kind", e.target.value as OfferKind)}>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
          <p className="-mt-2 text-xs text-muted">{KINDS.find((k) => k.value === form.kind)?.hint}</p>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Discount" value={form.discountType} onChange={(e) => set("discountType", e.target.value as OfferFormValues["discountType"])}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat amount (₹)</option>
            </Select>
            <Input
              label={form.discountType === "percentage" ? "Percent off" : "Rupees off (per piece)"}
              type="number"
              min={1}
              max={form.discountType === "percentage" ? 90 : undefined}
              required
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Starts" type="datetime-local" required value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            <Input label="Ends (limited time)" type="datetime-local" required value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
          </div>

          {showCategories && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Categories {form.kind === "festival" && <span className="font-normal text-muted">(optional)</span>}</p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-2">
                {categories.map(({ c, depth }) => (
                  <label key={c._id} className="flex items-center gap-2 py-1 text-sm" style={{ paddingLeft: depth * 16 }}>
                    <input type="checkbox" checked={form.categories.includes(c._id)} onChange={() => toggleCategory(c._id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {showProducts && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink">Products {form.kind === "festival" && <span className="font-normal text-muted">(optional)</span>}</p>
              {picked.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {picked.map((p) => (
                    <span key={p._id} className="flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-xs">
                      {p.title}
                      <button type="button" onClick={() => removeProduct(p._id)} aria-label={`Remove ${p.title}`} className="text-muted hover:text-danger">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or SKU"
                  className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:border-brand"
                />
              </div>
              {productResults && productResults.length > 0 && (
                <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-border">
                  {productResults.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => addProduct({ _id: p._id, title: p.title })}
                      disabled={form.products.includes(p._id)}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface disabled:opacity-40"
                    >
                      {p.title} <span className="text-xs text-muted">{p.SKU}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Textarea label="Note (optional, internal)" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Enabled
          </label>
          <p className="text-xs text-muted">
            The wholesale price drops only where the offer is cheaper. Variants are discounted too. If you edit a product's wholesale price while its offer is running, the offer's saved price is put back when the offer ends.
          </p>
          <Button type="submit" className="w-full" isLoading={save.isPending}>
            Save offer
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        title="Delete offer"
        description="Any prices this offer lowered go back to what they were."
        confirmLabel="Delete"
        danger
        isLoading={remove.isPending}
      />
    </div>
  );
}
