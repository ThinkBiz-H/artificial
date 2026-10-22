import { usePublicSettings } from "@/hooks/useCatalog";

const DEFAULT_SITE_NAME = "Swastikala";

/**
 * Brand + store-policy values the storefront shows everywhere (header,
 * footer, SEO, announcement bar). All of it comes from Admin > Settings via
 * the existing public settings endpoint — this hook only normalises it.
 */
export function useStoreInfo() {
  const { data: settings, isLoading } = usePublicSettings();

  const general = settings?.general;
  const shipping = settings?.shipping;

  return {
    isLoading,
    settings,
    siteName: (general?.siteName as string) || DEFAULT_SITE_NAME,
    tagline: (general?.siteTagline as string) || (general?.tagline as string) || "",
    logo: settings?.logo?.url || "",
    email: settings?.contact?.email || (general?.supportEmail as string) || "",
    phone: settings?.contact?.phone || (general?.supportPhone as string) || "",
    address: settings?.contact?.address || "",
    social: (settings?.social || {}) as Record<string, string | undefined>,
    freeShippingEnabled: !!shipping?.freeShippingEnabled,
    freeShippingThreshold: shipping?.freeShippingThreshold ?? 0,
    codEnabled: settings?.payment?.codEnabled ?? true,
    onlinePaymentEnabled: settings?.payment?.onlinePaymentEnabled ?? true,
    whatsapp: settings?.whatsapp,
  };
}
