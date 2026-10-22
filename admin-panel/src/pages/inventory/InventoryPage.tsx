import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, History, PackageX } from "lucide-react";
import { dashboardApi } from "@/api/dashboard";
import { inventoryApi } from "@/api/inventory";
import { PageHeader } from "@/components/common/PageHeader";
import { Pagination } from "@/components/common/Pagination";
import { StockBadge } from "@/components/common/StockBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDateTime } from "@/lib/utils";

type Tab = "low" | "out" | "history";

const MOVEMENT_TYPES = ["purchase", "sale", "return", "adjustment", "transfer_in", "transfer_out", "reservation", "release", "damaged"];

/** Low stock, out of stock and stock history (existing dashboard + inventory APIs). */
export function InventoryPage() {
  const [tab, setTab] = useState<Tab>("low");
  const [threshold, setThreshold] = useState(10);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const stock = useQuery({
    queryKey: ["inventory-stock", tab === "out" ? 0 : threshold],
    queryFn: () => dashboardApi.lowStock(tab === "out" ? 0 : threshold),
    select: (r) => r.data,
    enabled: tab !== "history",
  });
  const history = useQuery({
    queryKey: ["inventory-movements", type, page],
    queryFn: () => inventoryApi.movements({ type: type || undefined, page, limit: 20 }),
    select: (r) => r.data,
    enabled: tab === "history",
    placeholderData: (p) => p,
  });

  const rows = stock.data
    ? [
        ...stock.data.products.map((p) => ({ key: p._id, productId: p._id, title: p.title, sku: p.SKU, variant: "", stock: p.stock })),
        ...stock.data.variants.map((v) => {
          // /admin/dashboard/low-stock populates the variant's product.
          const product = v.product as unknown as { _id?: string; title?: string } | string | null;
          const populated = product && typeof product === "object" ? product : null;
          return {
          key: v._id,
          productId: populated?._id ?? (typeof product === "string" ? product : ""),
          title: populated?.title ?? "",
          sku: v.sku,
          variant: v.attributes?.map((a) => a.value).join(" · ") ?? "",
          stock: v.stock,
          };
        }),
      ].sort((a, b) => a.stock - b.stock)
    : [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "low", label: "Low stock", icon: <AlertTriangle size={14} /> },
    { id: "out", label: "Out of stock", icon: <PackageX size={14} /> },
    { id: "history", label: "Stock history", icon: <History size={14} /> },
  ];

  return (
    <div>
      <PageHeader title="Inventory" description="Stock alerts and every stock movement" />
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium",
              tab === t.id ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:bg-surface",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "history" ? (
        <Card>
          <CardHeader
            title={tab === "low" ? "Low stock" : "Out of stock"}
            description={tab === "low" ? `Products and variants at or below ${threshold} units` : "Products and variants with no stock left"}
            action={
              tab === "low" ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">Threshold</span>
                  <Input type="number" min={1} value={threshold} onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))} className="w-20" />
                </div>
              ) : undefined
            }
          />
          <CardBody className="p-0">
            {stock.isLoading ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : rows.length === 0 ? (
              <EmptyState icon={<AlertTriangle size={18} />} title={tab === "low" ? "Stock levels are healthy" : "Nothing is out of stock"} className="py-10" />
            ) : (
              <Table>
                <Thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Variant</Th>
                    <Th>SKU</Th>
                    <Th className="text-right">Stock</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {rows.map((r) => (
                    <Tr key={r.key}>
                      <Td>
                        {r.productId ? (
                          <Link to="/products/$productId/edit" params={{ productId: r.productId }} className="text-sm hover:underline">{r.title}</Link>
                        ) : (
                          <span className="text-sm">{r.title}</span>
                        )}
                      </Td>
                      <Td className="text-xs text-muted">{r.variant || "—"}</Td>
                      <Td className="font-mono text-xs">{r.sku || "—"}</Td>
                      <Td className="text-right"><StockBadge stock={r.stock} threshold={threshold} /></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Stock history"
            description="Purchases, sales, returns, adjustments and transfers"
            action={
              <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-44">
                <option value="">All movements</option>
                {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </Select>
            }
          />
          <CardBody className="p-0">
            {history.isLoading ? (
              <div className="p-5"><Skeleton className="h-40 w-full" /></div>
            ) : !history.data || history.data.movements.length === 0 ? (
              <EmptyState icon={<History size={18} />} title="No stock movements yet" className="py-10" />
            ) : (
              <>
                <Table>
                  <Thead>
                    <tr>
                      <Th>When</Th>
                      <Th>Product</Th>
                      <Th>Type</Th>
                      <Th className="text-right">Change</Th>
                      <Th className="text-right">Stock</Th>
                      <Th>Warehouse</Th>
                      <Th>By / note</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {history.data.movements.map((m) => (
                      <Tr key={m._id}>
                        <Td className="text-xs text-muted">{formatDateTime(m.createdAt)}</Td>
                        <Td className="text-sm">{m.product?.title ?? "—"}{m.variant?.sku ? <span className="ml-1 font-mono text-xs text-muted">{m.variant.sku}</span> : null}</Td>
                        <Td><Badge tone={m.quantity < 0 ? "warning" : "info"}>{m.type.replace("_", " ")}</Badge></Td>
                        <Td className={cn("text-right font-mono text-xs", m.quantity < 0 ? "text-danger" : "text-success")}>{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</Td>
                        <Td className="text-right font-mono text-xs">{m.previousStock} → {m.newStock}</Td>
                        <Td className="text-xs">{m.warehouse?.name ?? "—"}</Td>
                        <Td className="text-xs text-muted">{m.performedBy?.name ?? "System"}{m.note ? ` · ${m.note}` : ""}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Pagination page={history.data.page} totalPages={history.data.totalPages} onChange={setPage} />
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
