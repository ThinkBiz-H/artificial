import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, RotateCcw, Package } from "lucide-react";
import { useProductList, useDeleteProduct, useRestoreProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
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
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";
import { BulkActionBar, exportCsv, useSelection } from "@/components/common/BulkActions";

export function ProductsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useProductList({ page, limit: 15, keyword: keyword || undefined, category: category || undefined, brand: brand || undefined, status: status || undefined });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const deleteProduct = useDeleteProduct();
  const restoreProduct = useRestoreProduct();
  const qc = useQueryClient();
  const selection = useSelection(data?.products.map((p) => p._id) ?? []);

  return (
    <div>
      <PageHeader
        title="Products"
        description={data ? `${data.pagination.total} products` : undefined}
        action={
          <Link to="/products/new">
            <Button><Plus size={15} /> Add product</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={keyword} onChange={(v) => { setKeyword(v); setPage(1); }} placeholder="Search products…" />
          <div className="flex flex-wrap gap-2">
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-40">
              <option value="">All categories</option>
              {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
            <Select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} className="w-36">
              <option value="">All brands</option>
              {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </Select>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-32">
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !data || data.products.length === 0 ? (
          <EmptyState icon={<Package size={18} />} title="No products found" description="Try adjusting your filters or add a new product." />
        ) : (
          <>
            <BulkActionBar
              selection={selection}
              onDone={() => qc.invalidateQueries({ queryKey: ["admin-products"] })}
              actions={[
                { label: "Publish", run: (id) => productsApi.update(id, { status: "active" }) },
                { label: "Hide", run: (id) => productsApi.update(id, { status: "inactive" }) },
                { label: "Delete", variant: "danger", confirm: "Delete the selected products?", run: (id) => productsApi.remove(id) },
              ]}
              extra={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportCsv("products.csv", data.products.filter((p) => selection.isSelected(p._id)).map((p) => ({
                      title: p.title,
                      sku: p.SKU ?? "",
                      price: p.price,
                      salePrice: p.salePrice ?? "",
                      stock: p.stock,
                      status: p.status,
                    })))
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
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>GST %</Th>
                  <Th>GST Included</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {data.products.map((p) => {
                  // A deleted category populates as null (and typeof null === "object").
                  const categoryName = (typeof p.category === "object" ? p.category?.name : undefined) ?? "—";
                  const image = p.thumbnail?.url || p.images?.[0]?.url;
                  return (
                    <Tr key={p._id}>
                      <Td><input type="checkbox" aria-label={`Select ${p.title}`} checked={selection.isSelected(p._id)} onChange={() => selection.toggle(p._id)} /></Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-none overflow-hidden rounded-lg border border-border bg-surface">
                            {image && <img src={image} alt={p.title} className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                            {p.SKU && <p className="font-mono text-xs text-muted">{p.SKU}</p>}
                          </div>
                        </div>
                      </Td>
                      <Td className="text-sm text-muted">{categoryName}</Td>
                      <Td className="font-mono text-xs">{formatCurrency(p.salePrice || p.price)}</Td>
                      <Td className="font-mono text-xs">{p.gstRate ?? 18}%</Td>
                      <Td>
                        <Badge tone={(p.priceIncludesGST ?? true) ? "success" : "neutral"}>
                          {(p.priceIncludesGST ?? true) ? "Yes" : "No"}
                        </Badge>
                      </Td>
                      <Td className="text-sm">{p.hasVariants ? "Variants" : <StockBadge stock={p.stock} />}</Td>
                      <Td><Badge>{p.status}</Badge></Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigate({ to: "/products/$productId/edit", params: { productId: p._id } })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
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
