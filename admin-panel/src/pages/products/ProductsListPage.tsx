import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Copy, Download, Pencil, Plus, RotateCcw, Package, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProductList, useDeleteProduct, useRestoreProduct } from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCategories";
import { StockBadge } from "@/components/common/StockBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn, formatCurrency, getErrorMessage } from "@/lib/utils";
import { productsApi, type ProductListParams } from "@/api/products";
import { BulkActionBar, exportCsv, useSelection } from "@/components/common/BulkActions";
import type { Category, Product } from "@/types";

const STATUS_TONE = { active: "success", inactive: "neutral", draft: "warning" } as const;

/** Bulk flag changes, applied in one request. */
const FLAG_ACTIONS: { value: string; label: string; set: Parameters<typeof productsApi.bulkUpdate>[1] }[] = [
  { value: "featured-on", label: "Mark featured", set: { featured: true } },
  { value: "featured-off", label: "Remove featured", set: { featured: false } },
  { value: "trending-on", label: "Mark trending", set: { isTrending: true } },
  { value: "trending-off", label: "Remove trending", set: { isTrending: false } },
  { value: "best-on", label: "Mark best seller", set: { isTopSelling: true } },
  { value: "best-off", label: "Remove best seller", set: { isTopSelling: false } },
  { value: "new-on", label: "Mark new arrival", set: { isNewArrival: true } },
  { value: "new-off", label: "Remove new arrival", set: { isNewArrival: false } },
  { value: "draft", label: "Move to draft", set: { status: "draft" } },
];

/** CSV columns for export and import (import matches categories by name). */
const CSV_COLUMNS = ["title", "sku", "designCode", "mainCategory", "subCategory", "wholesalePrice", "retailPrice", "moq", "stock", "status"] as const;

/** Minimal CSV parser (quoted fields, commas and newlines inside quotes). */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) rows.push([...row, field]);
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) return [];
  const keys = header.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

export function ProductsListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [mainId, setMainId] = useState("");
  const [subId, setSubId] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: tree } = useCategoryTree();
  const mains = tree ?? [];
  const subs = mains.find((m) => m._id === mainId)?.children ?? [];
  // Category id → { main, sub } names for the table.
  const placement = useMemo(() => {
    const map = new Map<string, { main: string; sub?: string }>();
    for (const m of tree ?? []) {
      map.set(m._id, { main: m.name });
      const walk = (list: Category[] | undefined, top: string, sub?: string) =>
        (list ?? []).forEach((c) => {
          map.set(c._id, { main: top, sub: sub ?? c.name });
          walk(c.children, top, sub ?? c.name);
        });
      walk(m.children, m.name);
    }
    return map;
  }, [tree]);

  const filters: ProductListParams = {
    keyword: keyword || undefined,
    category: subId || mainId || undefined,
    status: status || undefined,
  };
  const { data, isLoading } = useProductList({ page, limit: 20, ...filters });
  const deleteProduct = useDeleteProduct();
  const restoreProduct = useRestoreProduct();
  const selection = useSelection(data?.products.map((p) => p._id) ?? []);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-products"] });

  const categoryOf = (p: Product) => {
    const id = typeof p.category === "object" ? p.category?._id : p.category;
    return (id && placement.get(id)) || { main: "—" };
  };

  const row = (p: Product) => {
    const c = categoryOf(p);
    return {
      title: p.title,
      sku: p.SKU ?? "",
      designCode: p.designCode ?? "",
      mainCategory: c.main,
      subCategory: c.sub ?? "",
      wholesalePrice: p.salePrice || p.price,
      retailPrice: p.price,
      moq: p.minOrderQuantity ?? 1,
      stock: p.stock,
      status: p.status,
    };
  };

  /** Every product matching the current filters (all pages). */
  const exportAll = async () => {
    setBusy("export");
    try {
      const all: Product[] = [];
      for (let p = 1; p <= 50; p++) {
        const res = await productsApi.list({ ...filters, page: p, limit: 100 });
        all.push(...res.data.products);
        if (p >= res.data.pagination.totalPages) break;
      }
      exportCsv(`products-${new Date().toISOString().slice(0, 10)}.csv`, all.map(row));
      toast.success(`Exported ${all.length} products`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  /** Creates products from a CSV (same columns as the export; photos are added later). */
  const importCsv = async (file: File) => {
    setBusy("import");
    try {
      const rows = parseCsv(await file.text());
      const findMain = (name: string) => mains.find((m) => m.name.toLowerCase() === name.toLowerCase());
      let created = 0;
      const failed: string[] = [];
      for (const [i, r] of rows.entries()) {
        const main = findMain(r.mainCategory || "");
        const sub = main?.children?.find((c) => c.name.toLowerCase() === (r.subCategory || "").toLowerCase());
        const category = sub?._id ?? (main && !main.children?.length ? main._id : undefined);
        const retail = Number(r.retailPrice || r.wholesalePrice);
        if (!r.title || !category || !Number.isFinite(retail) || retail <= 0) {
          failed.push(`row ${i + 2}: ${!r.title ? "missing title" : !category ? "unknown main / sub category" : "invalid price"}`);
          continue;
        }
        try {
          const wholesale = Number(r.wholesalePrice);
          await productsApi.create({
            title: r.title,
            SKU: r.sku || undefined,
            designCode: r.designCode || undefined,
            category,
            price: retail,
            salePrice: Number.isFinite(wholesale) && wholesale > 0 && wholesale < retail ? wholesale : undefined,
            minOrderQuantity: Number(r.moq) > 0 ? Number(r.moq) : 1,
            stock: Number(r.stock) > 0 ? Number(r.stock) : 0,
            status: ["active", "inactive", "draft"].includes(r.status) ? r.status : "draft",
          });
          created++;
        } catch (e) {
          failed.push(`row ${i + 2}: ${getErrorMessage(e)}`);
        }
      }
      refresh();
      if (created) toast.success(`Imported ${created} product${created === 1 ? "" : "s"}`);
      if (failed.length) toast.error(`${failed.length} row(s) skipped — ${failed.slice(0, 3).join("; ")}`, { duration: 10000 });
      if (!rows.length) toast.error("The file has no rows");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const applyFlags = async (value: string) => {
    const action = FLAG_ACTIONS.find((a) => a.value === value);
    if (!action || !selection.selected.length) return;
    setBusy("bulk");
    try {
      const res = await productsApi.bulkUpdate(selection.selected, action.set);
      toast.success(`${action.label}: ${res.data.modified} updated`);
      refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const duplicate = async (p: Product) => {
    setBusy(`dup-${p._id}`);
    try {
      const res = await productsApi.duplicate(p._id);
      toast.success("Duplicated as a draft");
      refresh();
      navigate({ to: "/products/$productId/edit", params: { productId: res.data.product._id } });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await productsApi.bulkUpdate([p._id], { featured: !p.featured });
      refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description={data ? `${data.pagination.total} designs in the catalogue` : undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} isLoading={busy === "import"}>
              <Upload size={15} /> Import CSV
            </Button>
            <Button variant="outline" onClick={exportAll} isLoading={busy === "export"}>
              <Download size={15} /> Export
            </Button>
            <Link to="/products/new">
              <Button>
                <Plus size={15} /> Add product
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={keyword}
            onChange={(v) => {
              setKeyword(v);
              setPage(1);
            }}
            placeholder="Search name, SKU or design code…"
          />
          <div className="flex flex-wrap gap-2">
            <Select
              value={mainId}
              onChange={(e) => {
                setMainId(e.target.value);
                setSubId("");
                setPage(1);
              }}
              className="w-44"
              aria-label="Main category"
            >
              <option value="">All main categories</option>
              {mains.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Select
              value={subId}
              onChange={(e) => {
                setSubId(e.target.value);
                setPage(1);
              }}
              className="w-44"
              disabled={!subs.length}
              aria-label="Sub category"
            >
              <option value="">{mainId ? "All sub categories" : "Sub category"}</option>
              {subs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-32"
              aria-label="Status"
            >
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !data || data.products.length === 0 ? (
          <EmptyState icon={<Package size={18} />} title="No products found" description="Try adjusting your filters, import a CSV or add a new product." />
        ) : (
          <>
            <BulkActionBar
              selection={selection}
              onDone={refresh}
              actions={[
                { label: "Publish", run: (id) => productsApi.update(id, { status: "active" }) },
                { label: "Hide", run: (id) => productsApi.update(id, { status: "inactive" }) },
                { label: "Delete", variant: "danger", confirm: "Delete the selected products?", run: (id) => productsApi.remove(id) },
              ]}
              extra={
                <div className="flex gap-2">
                  <select
                    value=""
                    onChange={(e) => applyFlags(e.target.value)}
                    disabled={busy === "bulk"}
                    aria-label="Bulk edit"
                    className="h-8 rounded-md border border-border bg-white px-2 text-xs"
                  >
                    <option value="">Bulk edit…</option>
                    {FLAG_ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" variant="outline" onClick={() => exportCsv("products-selected.csv", data.products.filter((p) => selection.isSelected(p._id)).map(row))}>
                    Export selected
                  </Button>
                </div>
              }
            />
            <Table>
              <Thead>
                <tr>
                  <Th className="w-8">
                    <input type="checkbox" aria-label="Select all" checked={selection.allSelected} onChange={selection.toggleAll} />
                  </Th>
                  <Th>Product</Th>
                  <Th>SKU · Design</Th>
                  <Th>Category</Th>
                  <Th className="text-right">Wholesale</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th className="text-center">Featured</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.products.map((p) => {
                  const c = categoryOf(p);
                  const image = p.thumbnail?.url || p.images?.[0]?.url;
                  return (
                    <Tr key={p._id}>
                      <Td>
                        <input type="checkbox" aria-label={`Select ${p.title}`} checked={selection.isSelected(p._id)} onChange={() => selection.toggle(p._id)} />
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                            {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[240px] truncate text-sm font-medium text-ink">{p.title}</p>
                            <p className="text-xs text-muted">MOQ {p.minOrderQuantity ?? 1}{p.packSize && p.packSize > 1 ? ` · pack of ${p.packSize}` : ""}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <p className="font-mono text-xs text-ink">{p.SKU || "—"}</p>
                        {p.designCode && <p className="font-mono text-xs text-muted">{p.designCode}</p>}
                      </Td>
                      <Td>
                        <p className="text-sm text-ink">{c.main}</p>
                        {c.sub && <p className="text-xs text-muted">└ {c.sub}</p>}
                      </Td>
                      <Td className="text-right">
                        <p className="font-mono text-sm text-ink">{formatCurrency(p.salePrice || p.price)}</p>
                        {p.salePrice ? <p className="font-mono text-xs text-muted line-through">{formatCurrency(p.price)}</p> : null}
                      </Td>
                      <Td className="text-sm">{p.hasVariants ? "Variants" : <StockBadge stock={p.stock} />}</Td>
                      <Td>
                        <Badge tone={STATUS_TONE[p.status as keyof typeof STATUS_TONE] ?? "neutral"}>{p.status}</Badge>
                      </Td>
                      <Td className="text-center">
                        <button type="button" onClick={() => toggleFeatured(p)} aria-pressed={p.featured} aria-label={p.featured ? "Remove featured" : "Mark featured"}>
                          <Star size={16} className={cn(p.featured ? "fill-warning text-warning" : "text-muted-light hover:text-warning")} />
                        </button>
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigate({ to: "/products/$productId/edit", params: { productId: p._id } })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => duplicate(p)}
                            disabled={busy === `dup-${p._id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface disabled:opacity-40"
                            aria-label="Duplicate"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          {p.isDeleted ? (
                            <button onClick={() => restoreProduct.mutate(p._id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface" aria-label="Restore">
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button onClick={() => setDeleteId(p._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-bg" aria-label="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          </>
        )}
      </Card>
      <p className="mt-3 text-xs text-muted">CSV columns: {CSV_COLUMNS.join(", ")}. Imported products start as drafts unless the status column says otherwise; add photos from the product page.</p>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteProduct.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        title="Delete product"
        description="This product will be soft-deleted and can be restored later."
        confirmLabel="Delete"
        danger
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
