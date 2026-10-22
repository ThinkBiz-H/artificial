import { Badge } from "@/components/ui/Badge";

/** Inventory badge: Out of stock (0), Low stock (≤ threshold) or In stock. */
export function StockBadge({ stock, threshold = 10 }: { stock: number; threshold?: number }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (stock <= threshold) return <Badge tone="warning">Low · {stock}</Badge>;
  return <Badge tone="success">In stock · {stock}</Badge>;
}
