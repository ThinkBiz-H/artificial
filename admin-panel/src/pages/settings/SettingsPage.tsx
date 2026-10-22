import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useSettings,
  useUpdateSettings,
  useUpdateLogo,
  useUpdateFavicon,
  useEnvironmentStatus,
} from "@/hooks/useSettings";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const TABS = [
  "General",
  "Store",
  "Currency & tax",
  "Payments",
  "Shipping",
  "WhatsApp",
  "Invoice",
  "SEO",
  "Social & contact",
  "Maintenance",
  "Feature flags",
  "App version",
  "Branding",
  "Environment",
] as const;

interface FormShape {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportPhone: string;
  legalName: string;
  gstNumber: string;
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressCountry: string;
  addressPincode: string;
  currencyCode: string;
  currencySymbol: string;
  defaultTaxPercent: number;
  gstEnabled: boolean;
  pricesIncludeTax: boolean;
  invoicePrefix: string;
  invoiceStartingNumber: number;
  invoiceTerms: string;
  invoiceFooter: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  googleAnalyticsId: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  defaultShippingCharge: number;
  expressShippingCharge: number;
  codCharge: number;
  whatsappBusinessNumber: string;
  whatsappEnableStartChat: boolean;
  whatsappTrackingBaseUrl: string;
  // Feature flags (Settings.featureFlags — unset counts as on)
  flag_otpLogin: boolean;
  flag_registration: boolean;
  flag_coupons: boolean;
  flag_wishlist: boolean;
  flag_reviews: boolean;
  flag_notifications: boolean;
  appLatestVersion: string;
  appMinimumVersion: string;
  appForceUpdate: boolean;
  appOptionalUpdate: boolean;
  appUpdateMessage: string;
  appAndroidUrl: string;
  appIosUrl: string;
}

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const updateLogo = useUpdateLogo();
  const updateFavicon = useUpdateFavicon();
  const { data: environment } = useEnvironmentStatus();

  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormShape>();
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.general?.siteName || "",
        siteTagline: settings.general?.siteTagline || "",
        supportEmail: settings.general?.supportEmail || "",
        supportPhone: settings.general?.supportPhone || "",
        legalName: settings.store?.legalName || "",
        gstNumber: settings.store?.gstNumber || "",
        addressLine1: settings.store?.address?.line1 || "",
        addressCity: settings.store?.address?.city || "",
        addressState: settings.store?.address?.state || "",
        addressCountry: settings.store?.address?.country || "",
        addressPincode: settings.store?.address?.pincode || "",
        currencyCode: settings.currency?.code || "INR",
        currencySymbol: settings.currency?.symbol || "₹",
        defaultTaxPercent: settings.tax?.defaultTaxPercent || 0,
        gstEnabled: settings.tax?.gstEnabled || false,
        pricesIncludeTax: settings.tax?.pricesIncludeTax || false,
        invoicePrefix: settings.invoice?.prefix || "",
        invoiceStartingNumber: settings.invoice?.startingNumber || 1,
        invoiceTerms: settings.invoice?.termsAndConditions || "",
        invoiceFooter: settings.invoice?.footerNote || "",
        defaultMetaTitle: settings.seo?.defaultMetaTitle || "",
        defaultMetaDescription: settings.seo?.defaultMetaDescription || "",
        googleAnalyticsId: settings.seo?.googleAnalyticsId || "",
        facebook: settings.social?.facebook || "",
        instagram: settings.social?.instagram || "",
        twitter: settings.social?.twitter || "",
        youtube: settings.social?.youtube || "",
        contactEmail: settings.contact?.email || "",
        contactPhone: settings.contact?.phone || "",
        contactAddress: settings.contact?.address || "",
        maintenanceEnabled: settings.maintenanceMode?.enabled || false,
        maintenanceMessage: settings.maintenanceMode?.message || "",
        codEnabled: settings.payment?.codEnabled ?? true,
        onlinePaymentEnabled: settings.payment?.onlinePaymentEnabled ?? true,
        freeShippingEnabled: settings.shipping?.freeShippingEnabled ?? true,
        freeShippingThreshold: settings.shipping?.freeShippingThreshold ?? 999,
        defaultShippingCharge: settings.shipping?.defaultShippingCharge ?? 60,
        expressShippingCharge: settings.shipping?.expressShippingCharge ?? 0,
        codCharge: settings.shipping?.codCharge ?? 0,
        whatsappBusinessNumber: settings.whatsapp?.businessNumber || "",
        whatsappEnableStartChat: settings.whatsapp?.enableStartChat ?? true,
        whatsappTrackingBaseUrl: settings.whatsapp?.trackingBaseUrl || "",
        flag_otpLogin: settings.featureFlags?.otpLogin !== false,
        flag_registration: settings.featureFlags?.registration !== false,
        flag_coupons: settings.featureFlags?.coupons !== false,
        flag_wishlist: settings.featureFlags?.wishlist !== false,
        flag_reviews: settings.featureFlags?.reviews !== false,
        flag_notifications: settings.featureFlags?.notifications !== false,
        appLatestVersion: settings.appVersion?.latestVersion || "",
        appMinimumVersion: settings.appVersion?.minimumVersion || "",
        appForceUpdate: settings.appVersion?.forceUpdate ?? false,
        appOptionalUpdate: settings.appVersion?.optionalUpdate ?? false,
        appUpdateMessage: settings.appVersion?.message || "",
        appAndroidUrl: settings.appVersion?.androidUrl || "",
        appIosUrl: settings.appVersion?.iosUrl || "",
      });
    }
  }, [settings, reset]);

  const onSubmit = (values: FormShape) => {
    updateSettings.mutate({
      general: {
        siteName: values.siteName,
        siteTagline: values.siteTagline,
        supportEmail: values.supportEmail,
        supportPhone: values.supportPhone,
      },
      store: {
        legalName: values.legalName,
        gstNumber: values.gstNumber,
        address: {
          line1: values.addressLine1,
          city: values.addressCity,
          state: values.addressState,
          country: values.addressCountry,
          pincode: values.addressPincode,
        },
      },
      currency: { code: values.currencyCode, symbol: values.currencySymbol },
      tax: {
        gstEnabled: values.gstEnabled,
        defaultTaxPercent: values.defaultTaxPercent,
        pricesIncludeTax: values.pricesIncludeTax,
      },
      invoice: {
        prefix: values.invoicePrefix,
        startingNumber: values.invoiceStartingNumber,
        termsAndConditions: values.invoiceTerms,
        footerNote: values.invoiceFooter,
      },
      seo: {
        defaultMetaTitle: values.defaultMetaTitle,
        defaultMetaDescription: values.defaultMetaDescription,
        googleAnalyticsId: values.googleAnalyticsId,
      },
      social: {
        facebook: values.facebook,
        instagram: values.instagram,
        twitter: values.twitter,
        youtube: values.youtube,
      },
      contact: {
        email: values.contactEmail,
        phone: values.contactPhone,
        address: values.contactAddress,
      },
      maintenanceMode: {
        enabled: values.maintenanceEnabled,
        message: values.maintenanceMessage,
      },
      payment: {
        codEnabled: values.codEnabled,
        onlinePaymentEnabled: values.onlinePaymentEnabled,
      },
      shipping: {
        freeShippingEnabled: values.freeShippingEnabled,
        freeShippingThreshold: values.freeShippingThreshold,
        defaultShippingCharge: values.defaultShippingCharge,
        expressShippingCharge: values.expressShippingCharge,
        codCharge: values.codCharge,
      },
      whatsapp: {
        businessNumber: values.whatsappBusinessNumber,
        enableStartChat: values.whatsappEnableStartChat,
        trackingBaseUrl: values.whatsappTrackingBaseUrl,
      },
      featureFlags: {
        otpLogin: values.flag_otpLogin,
        registration: values.flag_registration,
        coupons: values.flag_coupons,
        wishlist: values.flag_wishlist,
        reviews: values.flag_reviews,
        notifications: values.flag_notifications,
      },
      appVersion: {
        latestVersion: values.appLatestVersion.trim(),
        minimumVersion: values.appMinimumVersion.trim(),
        forceUpdate: values.appForceUpdate,
        optionalUpdate: values.appOptionalUpdate,
        message: values.appUpdateMessage.trim(),
        androidUrl: values.appAndroidUrl.trim(),
        iosUrl: values.appIosUrl.trim(),
      },
    });
  };

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Website, store, tax, and integration configuration"
      />

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium",
              tab === t
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {tab === "General" && (
          <Card>
            <CardHeader title="General" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Site name" {...register("siteName")} />
              <Input label="Tagline" {...register("siteTagline")} />
              <Input
                label="Support email"
                type="email"
                {...register("supportEmail")}
              />
              <Input label="Support phone" {...register("supportPhone")} />
            </CardBody>
          </Card>
        )}

        {tab === "Store" && (
          <Card>
            <CardHeader title="Store details" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Legal name" {...register("legalName")} />
              <Input label="GST number" {...register("gstNumber")} />
              <Input
                label="Address line 1"
                className="sm:col-span-2"
                {...register("addressLine1")}
              />
              <Input label="City" {...register("addressCity")} />
              <Input label="State" {...register("addressState")} />
              <Input label="Country" {...register("addressCountry")} />
              <Input label="Pincode" {...register("addressPincode")} />
            </CardBody>
          </Card>
        )}

        {tab === "Currency & tax" && (
          <Card>
            <CardHeader title="Currency & tax" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Currency code" {...register("currencyCode")} />
              <Input label="Currency symbol" {...register("currencySymbol")} />
              <Input
                label="Default tax %"
                type="number"
                step="0.01"
                {...register("defaultTaxPercent", { valueAsNumber: true })}
              />
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register("gstEnabled")} /> GST
                  enabled
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register("pricesIncludeTax")} />{" "}
                  Prices include tax
                </label>
              </div>
            </CardBody>
          </Card>
        )}

        {tab === "Invoice" && (
          <Card>
            <CardHeader title="Invoice" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Invoice prefix" {...register("invoicePrefix")} />
              <Input
                label="Starting number"
                type="number"
                {...register("invoiceStartingNumber", { valueAsNumber: true })}
              />
              <Textarea
                label="Terms & conditions"
                rows={3}
                className="sm:col-span-2"
                {...register("invoiceTerms")}
              />
              <Textarea
                label="Footer note"
                rows={2}
                className="sm:col-span-2"
                {...register("invoiceFooter")}
              />
            </CardBody>
          </Card>
        )}

        {tab === "SEO" && (
          <Card>
            <CardHeader title="SEO defaults" />
            <CardBody className="grid grid-cols-1 gap-4">
              <Input
                label="Default meta title"
                {...register("defaultMetaTitle")}
              />
              <Textarea
                label="Default meta description"
                rows={2}
                {...register("defaultMetaDescription")}
              />
              <Input
                label="Google Analytics ID"
                {...register("googleAnalyticsId")}
              />
            </CardBody>
          </Card>
        )}

        {tab === "Social & contact" && (
          <Card>
            <CardHeader title="Social & contact" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Facebook" {...register("facebook")} />
              <Input label="Instagram" {...register("instagram")} />
              <Input label="Twitter / X" {...register("twitter")} />
              <Input label="YouTube" {...register("youtube")} />
              <Input
                label="Contact email"
                type="email"
                {...register("contactEmail")}
              />
              <Input label="Contact phone" {...register("contactPhone")} />
              <Textarea
                label="Contact address"
                rows={2}
                className="sm:col-span-2"
                {...register("contactAddress")}
              />
            </CardBody>
          </Card>
        )}

        {tab === "Maintenance" && (
          <Card>
            <CardHeader title="Maintenance mode" />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("maintenanceEnabled")} />{" "}
                Enable maintenance mode
              </label>
              <Textarea
                label="Message shown to visitors"
                rows={3}
                {...register("maintenanceMessage")}
              />
            </CardBody>
          </Card>
        )}
        {tab === "Feature flags" && (
          <Card>
            <CardHeader title="Feature flags" description="Switch store features on or off. Changes apply as soon as you save." />
            <CardBody className="divide-y divide-border p-0">
              {[
                { name: "maintenanceEnabled" as const, label: "Maintenance mode", hint: "Shows the maintenance message instead of the store." },
                { name: "codEnabled" as const, label: "Cash on Delivery", hint: "Offer COD at checkout." },
                { name: "onlinePaymentEnabled" as const, label: "Razorpay (online payment)", hint: "Offer UPI, cards and net banking via Razorpay." },
                { name: "flag_otpLogin" as const, label: "OTP login", hint: "Customers sign in with a mobile OTP (checkout OTP is not affected)." },
                { name: "flag_registration" as const, label: "Registration", hint: "New customer sign-ups (mobile and email)." },
                { name: "flag_coupons" as const, label: "Coupons", hint: "Applying coupon codes in the bag and at checkout." },
                { name: "flag_wishlist" as const, label: "Wishlist", hint: "Adding products to a wishlist." },
                { name: "flag_reviews" as const, label: "Reviews", hint: "Customers writing product reviews." },
                { name: "flag_notifications" as const, label: "Notifications", hint: "Sending broadcast notifications from the admin." },
              ].map((f) => (
                <label key={f.name} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-3.5">
                  <span>
                    <span className="block text-sm font-medium text-ink">{f.label}</span>
                    <span className="block text-xs text-muted">{f.hint}</span>
                  </span>
                  <input type="checkbox" className="h-4 w-4" {...register(f.name)} />
                </label>
              ))}
            </CardBody>
          </Card>
        )}
        {tab === "App version" && (
          <Card>
            <CardHeader title="Mobile app version" description="The app reads this at launch to prompt or require an update." />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Latest version" placeholder="1.4.0" {...register("appLatestVersion")} />
                <Input label="Minimum supported version" placeholder="1.2.0" {...register("appMinimumVersion")} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("appForceUpdate")} />
                Force update — versions below the minimum must update to continue
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("appOptionalUpdate")} />
                Optional update — suggest updating to the latest version
              </label>
              <Textarea label="Update message" rows={2} {...register("appUpdateMessage")} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Play Store URL" {...register("appAndroidUrl")} />
                <Input label="App Store URL" {...register("appIosUrl")} />
              </div>
            </CardBody>
          </Card>
        )}
        {tab === "Payments" && (
          <Card>
            <CardHeader title="Payment Settings" />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("codEnabled")} />
                Enable Cash on Delivery (COD)
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("onlinePaymentEnabled")} />
                Enable Online Payments
              </label>
            </CardBody>
          </Card>
        )}
        {tab === "Shipping" && (
          <Card>
            <CardHeader
              title="Shipping"
              description="Single source of truth for shipping charges storefront-wide — every order (Cart, Buy Now, COD, Razorpay), the checkout preview, and the invoice all read these values live. Nothing about shipping cost is hardcoded in the code."
            />
            <CardBody className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("freeShippingEnabled")} />
                Enable Free Shipping
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Free Shipping Above Amount (₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  hint="Orders at or above this subtotal ship free."
                  {...register("freeShippingThreshold", {
                    valueAsNumber: true,
                    min: 0,
                  })}
                  error={
                    errors.freeShippingThreshold
                      ? "Threshold cannot be negative"
                      : undefined
                  }
                />
                <Input
                  label="Default Shipping Charge (₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  hint="Charged when free shipping doesn't apply."
                  {...register("defaultShippingCharge", {
                    valueAsNumber: true,
                    min: 0,
                  })}
                  error={
                    errors.defaultShippingCharge
                      ? "Charge cannot be negative"
                      : undefined
                  }
                />
                <Input
                  label="Express Shipping Charge (optional, ₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("expressShippingCharge", {
                    valueAsNumber: true,
                    min: 0,
                  })}
                  error={
                    errors.expressShippingCharge
                      ? "Charge cannot be negative"
                      : undefined
                  }
                />
                <Input
                  label="Cash on Delivery Charge (optional, ₹)"
                  type="number"
                  min={0}
                  step="0.01"
                  hint="Added on top for COD orders specifically."
                  {...register("codCharge", { valueAsNumber: true, min: 0 })}
                  error={errors.codCharge ? "Charge cannot be negative" : undefined}
                />
              </div>
            </CardBody>
          </Card>
        )}
        {tab === "WhatsApp" && (
          <Card>
            <CardHeader
              title="WhatsApp"
              description="Configures only the storefront 'Start Chat' button. Automatic order-status notifications (Confirmed / Shipped / Delivered / Cancelled) are sent via SMS instead — see the message templates in backend/utils/smsTemplates.js."
            />
            <CardBody className="space-y-4">
              <Input
                label="Business WhatsApp number"
                placeholder="919876543210"
                hint="Digits only, country code included, no + or spaces — used for the Start Chat wa.me link."
                {...register("whatsappBusinessNumber")}
              />
              <Input
                label="Tracking base URL"
                placeholder="https://swastikala.com/account/orders"
                hint="Order id is appended automatically. Leave blank to fall back to the storefront's own order page. Also used by the order-status SMS templates."
                {...register("whatsappTrackingBaseUrl")}
              />
              <label className="flex items-center gap-2 border-t border-border pt-4 text-sm">
                <input type="checkbox" {...register("whatsappEnableStartChat")} />
                Enable Start Chat Button (storefront)
              </label>
            </CardBody>
          </Card>
        )}
        {tab !== "Branding" && tab !== "Environment" && (
          <Button
            type="submit"
            className="mt-6"
            isLoading={updateSettings.isPending}
          >
            Save settings
          </Button>
        )}
      </form>

      {tab === "Branding" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader title="Logo" />
            <CardBody>
              <ImageUpload
                value={logo}
                onChange={(v) => setLogo(v as File | null)}
                existingUrl={settings?.logo?.url}
              />
              <Button
                className="mt-4"
                size="sm"
                disabled={!logo}
                isLoading={updateLogo.isPending}
                onClick={() =>
                  logo &&
                  updateLogo.mutate(logo, { onSuccess: () => setLogo(null) })
                }
              >
                Upload logo
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Favicon" />
            <CardBody>
              <ImageUpload
                value={favicon}
                onChange={(v) => setFavicon(v as File | null)}
                existingUrl={settings?.favicon?.url}
              />
              <Button
                className="mt-4"
                size="sm"
                disabled={!favicon}
                isLoading={updateFavicon.isPending}
                onClick={() =>
                  favicon &&
                  updateFavicon.mutate(favicon, {
                    onSuccess: () => setFavicon(null),
                  })
                }
              >
                Upload favicon
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "Environment" && (
        <Card>
          <CardHeader
            title="Integration status"
            description="Read-only status of connected services"
          />
          <CardBody>
            {!environment ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(environment).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="capitalize text-muted">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <Badge tone={value ? "success" : "danger"}>
                      {value ? "Connected" : "Not set"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
