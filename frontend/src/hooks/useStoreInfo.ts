import { usePublicSettings } from "@/hooks/useCatalog";

const DEFAULT_SITE_NAME = "Abj Jewellery";

/** The brand logo (icon + name in one image), served from frontend/public. */
export const BRAND_LOGO = "/logo.jpeg";

/**
 * Brand + store-policy values the storefront shows everywhere (header,
 * footer, SEO, announcement bar). All of it comes from Admin > Settings via
 * the existing public settings endpoint — this hook only normalises it.
 */
export function useStoreInfo() {
  const { data: settings, isLoading } = usePublicSettings();

  const general = settings?.general;
  const brand = settings?.brand;
  // Admin Brand Management logos, falling back to the bundled logo.
  const logo = brand?.logos?.headerLogo || BRAND_LOGO;
  const shipping = settings?.shipping;
  // Wholesale defaults match the backend (min ₹5000, free delivery, no COD)
  // until settings load.
  const wholesale = settings?.wholesale;
  const wholesaleEnabled = wholesale?.enabled ?? true;

  return {
    isLoading,
    settings,
    siteName: brand?.company?.brandName || (general?.siteName as string) || DEFAULT_SITE_NAME,
    tagline:
      (general?.siteTagline as string) || (general?.tagline as string) || "",
    logo,
    footerLogo: brand?.logos?.footerLogo || logo,
    darkLogo: brand?.logos?.darkLogo || logo,
    lightLogo: brand?.logos?.lightLogo || logo,
    favicon: brand?.logos?.favicon || "",
    workingHours: brand?.company?.workingHours || "",
    mapUrl: brand?.company?.mapUrl || "",
    brand,
    email: settings?.contact?.email || (general?.supportEmail as string) || "",
    phone: settings?.contact?.phone || (general?.supportPhone as string) || "",
    address: settings?.contact?.address || "",
    social: (settings?.social || {}) as Record<string, string | undefined>,
    freeShippingEnabled: !!shipping?.freeShippingEnabled,
    freeShippingThreshold: shipping?.freeShippingThreshold ?? 0,
    codEnabled: (settings?.payment?.codEnabled ?? true) && (!wholesaleEnabled || !!wholesale?.allowCod),
    wholesaleEnabled,
    minOrderValue: wholesaleEnabled ? (wholesale?.minOrderValue ?? 5000) : 0,
    freeDelivery: wholesaleEnabled ? (wholesale?.freeDelivery ?? true) : false,
    collectBusinessDetails: wholesaleEnabled && (wholesale?.collectBusinessDetails ?? true),
    onlinePaymentEnabled: settings?.payment?.onlinePaymentEnabled ?? true,
    whatsapp: settings?.whatsapp,
  };
}
