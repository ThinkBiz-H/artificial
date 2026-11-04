import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { inventoryApi } from "@/api/inventory";
import { productsApi } from "@/api/products";
import { useWarehouseList } from "@/hooks/useWarehouses";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { cn, getErrorMessage } from "@/lib/utils";
import type { Product } from "@/types";

export type StockMode = "purchase" | "adjust" | "damaged";

const MODES: { id: StockMode; label: string; hint: string }[] = [
  { id: "purchase", label: "Purchase entry", hint: "Stock received from production or a supplier." },
  { id: "adjust", label: "Adjustment", hint: "Correct a count: use a negative number to reduce stock." },
  { id: "damaged", label: "Damaged", hint: "Moves pieces out of sellable stock." },
];

/**
 * Purchase entry, stock adjustment and damaged stock for one product (or
 * variant) in one warehouse. Every operation is written to the stock ledger.
 */
export function StockOperationModal({ open, mode: initialMode, onClose }: { open: boolean; mode: StockMode; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: warehouses } = useWarehouseList();
  const [mode, setMode] = useState<StockMode>(initialMode);
  const [q, setQ] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const { data: results } = useQuery({
    queryKey: ["stock-op-products", q],
    queryFn: () => productsApi.list({ keyword: q, limit: 8 }),
    enabled: open && q.trim().length >= 2 && !product,
    select: (r) => r.data.products,
  });
  const { data: variants } = useQuery({
    queryKey: ["stock-op-variants", product?._id],
    queryFn: () => productsApi.listVariants(product!._id),
    enabled: !!product?.hasVariants,
    select: (r) => r.data.variants,
  });

  const reset = () => {
    setQ("");
    setProduct(null);
    setVariantId("");
    setQuantity("");
    setReference("");
    setNote("");
  };

  const run = useMutation({
    mutationFn: () => {
      const qty = Number(quantity);
      const fullNote = [reference && `Ref: ${reference}`, note].filter(Boolean).join(" · ") || undefined;
      const values = { productId: product!._id, variantId: variantId || undefined, warehouseId: warehouseId || undefined, quantity: qty, note: fullNote };
      return mode === "purchase" ? inventoryApi.purchase(values) : mode === "adjust" ? inventoryApi.adjust(values) : inventoryApi.damaged(values);
    },
    onSuccess: () => {
      toast.success(mode === "purchase" ? "Stock received" : mode === "adjust" ? "Stock adjusted" : "Marked as damaged");
      // Stock lists, warehouse summaries, products and the dashboard all show stock.
      qc.invalidateQueries({ predicate: (query) => /^(inventory|warehouse|admin-products|dashboard)/.test(String(query.queryKey[0])) });
      reset();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const qty = Number(quantity);
  const qtyValid = mode === "adjust" ? Number.isFinite(qty) && qty !== 0 : qty > 0;
  const valid = !!product && (!product.hasVariants || !!variantId) && qtyValid && (mode !== "adjust" || note.trim().length > 0);

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Stock operation"
      className="max-w-lg"
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) run.mutate();
        }}
      >
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border p-0.5">
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)} className={cn("rounded-md py-1.5 text-xs font-medium", mode === m.id ? "bg-brand text-white" : "text-muted hover:text-ink")}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="-mt-2 text-xs text-muted">{MODES.find((m) => m.id === mode)?.hint}</p>

        {product ? (
          <div className="flex items-center gap-3 rounded-lg border border-border p-2.5">
            {(product.thumbnail?.url || product.images?.[0]?.url) && <img src={product.thumbnail?.url || product.images?.[0]?.url} alt="" className="h-10 w-10 rounded object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{product.title}</p>
              <p className="text-xs text-muted">
                {product.SKU || "No SKU"} · {product.hasVariants ? "has variants" : `${product.stock} in stock`}
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={() => setProduct(null)}>
              Change
            </Button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find product by name, SKU or design code"
                className="h-10 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
            {results && results.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border">
                {results.map((p) => (
                  <button key={p._id} type="button" onClick={() => setProduct(p)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface">
                    <span className="truncate">{p.title}</span>
                    <span className="flex-none text-xs text-muted">{p.SKU}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {product?.hasVariants && (
          <Select label="Variant" required value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            <option value="">Choose variant</option>
            {(variants ?? []).map((v) => (
              <option key={v._id} value={v._id}>
                {[v.color, v.size].filter(Boolean).join(" / ") || v.sku} ({v.stock} in stock)
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select label="Warehouse" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            <option value="">Default warehouse</option>
            {(warehouses ?? [])
              .filter((w) => w.status === "active")
              .map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
          </Select>
          <Input
            label={mode === "adjust" ? "Quantity (+ / −)" : "Quantity"}
            type="number"
            required
            min={mode === "adjust" ? undefined : 1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        {mode === "purchase" && <Input label="Reference (optional)" placeholder="Supplier bill / production batch no." value={reference} onChange={(e) => setReference(e.target.value)} />}
        <Input label={mode === "adjust" ? "Reason (required)" : "Note (optional)"} value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" className="w-full" disabled={!valid} isLoading={run.isPending}>
          {mode === "purchase" ? "Receive stock" : mode === "adjust" ? "Apply adjustment" : "Mark damaged"}
        </Button>
      </form>
    </Modal>
  );
}
