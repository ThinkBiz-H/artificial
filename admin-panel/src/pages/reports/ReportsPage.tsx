import { useState } from "react";
import { Download } from "lucide-react";
import { downloadReport, type ReportType } from "@/api/reports";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const REPORTS: { type: ReportType; label: string; description: string }[] = [
  { type: "sales", label: "Sales report", description: "Order-level sales breakdown for the selected period." },
  { type: "revenue", label: "Revenue report", description: "Revenue totals and trends." },
  { type: "orders", label: "Orders report", description: "Full order list with statuses." },
  { type: "customers", label: "Customer report", description: "Customer signups and spend." },
  { type: "products", label: "Product report", description: "Product performance and sales counts." },
  { type: "inventory", label: "Inventory report", description: "Current stock levels across products and variants." },
  { type: "coupons", label: "Coupon report", description: "Coupon redemption and discount totals." },
  { type: "tax", label: "Tax report", description: "Tax collected across orders." },
  { type: "profit", label: "Profit report", description: "Estimated profit for the period." },
];

export function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: ReportType, format: "csv" | "excel") => {
    setDownloading(`${type}-${format}`);
    try {
      await downloadReport(type, format, { from: from || undefined, to: to || undefined });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" description="Export store data as CSV or Excel for a given date range." />

      <Card className="mb-6">
        <CardBody className="flex flex-wrap items-end gap-3">
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.type}>
            <CardHeader title={r.label} description={r.description} />
            <CardBody className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" isLoading={downloading === `${r.type}-csv`} onClick={() => handleDownload(r.type, "csv")}>
                <Download size={13} /> CSV
              </Button>
              <Button variant="outline" size="sm" className="flex-1" isLoading={downloading === `${r.type}-excel`} onClick={() => handleDownload(r.type, "excel")}>
                <Download size={13} /> Excel
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
