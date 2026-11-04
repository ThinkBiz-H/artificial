import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, Search, Trash2 } from "lucide-react";
import { productsApi } from "@/api/products";
import { usePublicBrand } from "@/hooks/useBrand";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { code128B } from "@/lib/code128";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

/** SVG barcode for a code (Code 128 B). */
function Barcode({ value, height = 38 }: { value: string; height?: number }) {
  const bars = code128B(value);
  if (!bars) return <p className="text-[9px] text-danger">Can't encode “{value}”</p>;
  const total = bars.reduce((a, b) => a + b, 0) + 20; // 10-module quiet zone each side
  let x = 10;
  return (
    <svg viewBox={`0 0 ${total} ${height}`} preserveAspectRatio="none" className="h-[38px] w-full" role="img" aria-label={`Barcode ${value}`}>
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={height} fill="#000" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

type Line = { product: Product; copies: number };

/**
 * Barcode labels for stock and packing: pick products, set how many labels
 * each, and print (labels are 50 × 30 mm, four across on A4).
 */
export function BarcodeLabelsPage() {
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [showPrice, setShowPrice] = useState(true);
  const { data: brand } = usePublicBrand();
  const siteName = brand?.company?.brandName || brand?.company?.companyName || "ABJ Jewellery";
  const { data: results } = useQuery({
    queryKey: ["barcode-products", q],
    queryFn: () => productsApi.list({ keyword: q, limit: 10 }),
    enabled: q.trim().length >= 2,
    select: (r) => r.data.products,
  });

  const add = (p: Product) => setLines((list) => (list.some((l) => l.product._id === p._id) ? list : [...list, { product: p, copies: 1 }]));
  const labels = lines.flatMap((l) => Array.from({ length: Math.min(200, Math.max(1, l.copies)) }, () => l.product));

  return (
    <div>
      <div className="print:hidden">
        <PageHeader
          title="Barcode labels"
          description="Code 128 labels from each product's SKU (or design code) for racks, packets and dispatch."
          action={
            <>
              <Link to="/inventory">
                <Button variant="outline">
                  <ArrowLeft size={15} /> Inventory
                </Button>
              </Link>
              <Button onClick={() => window.print()} disabled={!labels.length}>
                <Printer size={15} /> Print {labels.length || ""} label{labels.length === 1 ? "" : "s"}
              </Button>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Card>
            <CardHeader title="Products" />
            <CardBody className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, SKU or design code"
                  className="h-10 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:border-brand"
                />
              </div>
              {results && q.trim().length >= 2 && (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                  {results.map((p) => (
                    <button key={p._id} type="button" onClick={() => add(p)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface">
                      <span className="truncate">{p.title}</span>
                      <span className="flex-none font-mono text-xs text-muted">{p.SKU || p.designCode || "no code"}</span>
                    </button>
                  ))}
                </div>
              )}
              {lines.length === 0 ? (
                <EmptyState title="Add products to print labels" className="py-8" />
              ) : (
                <ul className="divide-y divide-border">
                  {lines.map((l) => (
                    <li key={l.product._id} className="flex items-center gap-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{l.product.title}</p>
                        <p className="font-mono text-xs text-muted">{l.product.SKU || l.product.designCode || "— add a SKU first"}</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={l.copies}
                        onChange={(e) => setLines((list) => list.map((x) => (x.product._id === l.product._id ? { ...x, copies: Number(e.target.value) || 1 } : x)))}
                        aria-label={`Labels for ${l.product.title}`}
                        className="h-8 w-16 rounded-md border border-border px-2 text-sm"
                      />
                      <button type="button" onClick={() => setLines((list) => list.filter((x) => x.product._id !== l.product._id))} aria-label="Remove" className="text-muted hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} /> Show wholesale price on labels
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Preview" description={labels.length ? `${labels.length} labels` : undefined} />
            <CardBody>
              {labels.length ? <LabelSheet labels={labels} showPrice={showPrice} siteName={siteName} /> : <EmptyState title="Nothing to preview" className="py-8" />}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Print layout */}
      <div className="hidden print:block">
        <LabelSheet labels={labels} showPrice={showPrice} siteName={siteName} />
      </div>
    </div>
  );
}

function LabelSheet({ labels, showPrice, siteName }: { labels: Product[]; showPrice: boolean; siteName: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-4 print:gap-[2mm]">
      {labels.map((p, i) => {
        const code = p.SKU || p.designCode || "";
        return (
          <div key={`${p._id}-${i}`} className="break-inside-avoid rounded border border-border bg-white p-2 text-black print:h-[30mm] print:w-[50mm] print:rounded-none">
            <p className="truncate text-[8px] font-semibold uppercase tracking-wider">{siteName}</p>
            <p className="truncate text-[10px] font-medium">{p.title}</p>
            {code ? <Barcode value={code} /> : <p className="py-3 text-[9px]">No SKU</p>}
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span>{code}</span>
              {showPrice && <span className="font-sans font-semibold">{formatCurrency(p.salePrice || p.price)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
