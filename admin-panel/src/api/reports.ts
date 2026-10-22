import { apiClient } from "./client";

export type ReportType = "sales" | "revenue" | "orders" | "customers" | "products" | "inventory" | "coupons" | "tax" | "profit";

/** Downloads a report as a CSV or Excel blob and triggers a browser save. */
export async function downloadReport(type: ReportType, format: "csv" | "excel", params: { from?: string; to?: string } = {}) {
  const res = await apiClient.get(`/admin/reports/${type}`, {
    params: { ...params, format },
    responseType: "blob",
  });
  const contentDisposition = res.headers["content-disposition"] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || `${type}-report.${format === "excel" ? "xlsx" : "csv"}`;

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
