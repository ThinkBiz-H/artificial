import { apiClient } from "./client";
import type { ApiEnvelope } from "@/types";

export type BrandSlot =
  | "headerLogo"
  | "footerLogo"
  | "darkLogo"
  | "lightLogo"
  | "favicon"
  | "browserIcon"
  | "appLogo"
  | "splashLogo"
  | "loginLogo"
  | "registerLogo"
  | "drawerLogo"
  | "appBarLogo"
  | "androidIcon"
  | "iosIcon"
  | "invoiceLogo"
  | "pdfLogo"
  | "emailLogo"
  | "adminLogo";

export interface BrandTheme {
  primary: string;
  secondary: string;
  accent: string;
  button: string;
  navbar: string;
  footer: string;
  background: string;
  text: string;
  textMuted: string;
  radius: number;
  headingFont: string;
  bodyFont: string;
}

export interface BrandAsset {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string;
  version: number | null;
  updatedAt: string | null;
}

/** What the website, app and admin read (GET /settings/brand). */
export interface PublicBrand {
  revision: number;
  updatedAt: string | null;
  logos: Record<BrandSlot, string>;
  assets: Partial<Record<BrandSlot, BrandAsset>>;
  theme: BrandTheme;
  company: {
    companyName: string;
    brandName: string;
    tagline: string;
    gst: string;
    email: string;
    supportEmail: string;
    phone: string;
    customerCare: string;
    whatsapp: string;
    address: string;
    mapUrl: string;
    workingHours: string;
  };
  social: Record<string, string>;
}

export interface BrandCompany {
  companyName: string;
  brandName: string;
  tagline: string;
  gst: string;
  pan: string;
  email: string;
  supportEmail: string;
  phone: string;
  customerCare: string;
  whatsapp: string;
  address: string;
  invoiceAddress: { line1?: string; line2?: string; city?: string; state?: string; country?: string; pincode?: string };
  mapUrl: string;
  workingHours: string;
  invoice: { prefix: string; footerNote: string; termsAndConditions: string };
}

export interface BrandSlotInfo {
  slot: BrandSlot;
  label: string;
  group: "website" | "browser" | "app" | "documents" | "admin";
  size: string;
  fallback: BrandSlot[];
  current: (BrandAsset & { versionId?: string }) | null;
  effectiveUrl: string;
  inheritedFrom: BrandSlot | "legacy" | null;
  versions: number;
}

export interface BrandAdminView {
  brand: PublicBrand;
  company: BrandCompany;
  social: Record<string, string>;
  theme: { stored: Partial<BrandTheme>; resolved: BrandTheme; defaults: BrandTheme; fonts: string[] };
  slots: BrandSlotInfo[];
  meta: { revision: number; updatedAt: string | null; updatedBy: { name: string; email: string } | null };
}

export interface BrandAssetVersion {
  _id: string;
  slot: BrandSlot;
  url: string;
  width: number | null;
  height: number | null;
  format: string;
  bytes: number | null;
  source: "upload" | "media" | "import";
  originalName: string;
  createdAt: string;
  createdBy: { name: string } | null;
  isCurrent: boolean;
}

export type BrandExport = Record<string, unknown> & { format: "abj-brand-settings" };

const data = <T>(p: Promise<{ data: ApiEnvelope<T> }>) => p.then((r) => r.data);

export const brandApi = {
  /** Public — used by the admin shell itself (sidebar logo, title, favicon). */
  publicBrand: () => data(apiClient.get<ApiEnvelope<{ brand: PublicBrand }>>("/settings/brand")),

  get: () => data(apiClient.get<ApiEnvelope<BrandAdminView>>("/admin/brand")),
  update: (values: { company?: Partial<BrandCompany>; social?: Record<string, string>; theme?: Partial<Record<keyof BrandTheme, string | number | null>> }) =>
    data(apiClient.put<ApiEnvelope<BrandAdminView>>("/admin/brand", values)),

  upload: (slot: BrandSlot, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return data(apiClient.post<ApiEnvelope<BrandAdminView>>(`/admin/brand/assets/${slot}`, form, { headers: { "Content-Type": "multipart/form-data" } }));
  },
  useMedia: (slot: BrandSlot, mediaId: string) => data(apiClient.post<ApiEnvelope<BrandAdminView>>(`/admin/brand/assets/${slot}/media`, { mediaId })),
  remove: (slot: BrandSlot) => data(apiClient.delete<ApiEnvelope<BrandAdminView>>(`/admin/brand/assets/${slot}`)),
  versions: (slot: BrandSlot) => data(apiClient.get<ApiEnvelope<{ versions: BrandAssetVersion[] }>>(`/admin/brand/assets/${slot}/versions`)),
  restore: (slot: BrandSlot, versionId: string) =>
    data(apiClient.post<ApiEnvelope<BrandAdminView>>(`/admin/brand/assets/${slot}/versions/${versionId}/restore`)),

  reset: (sections: ("theme" | "logos")[]) => data(apiClient.post<ApiEnvelope<BrandAdminView>>("/admin/brand/reset", { sections })),
  exportFile: () => data(apiClient.get<ApiEnvelope<BrandExport>>("/admin/brand/export")),
  importFile: (file: BrandExport) => data(apiClient.post<ApiEnvelope<BrandAdminView>>("/admin/brand/import", file)),
};
