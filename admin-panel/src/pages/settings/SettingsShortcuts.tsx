import { SettingsPage } from "./SettingsPage";

/** Menu entries "Minimum Order Settings" and "Delivery Charges" — Settings opened on that tab. */
export function MinimumOrderSettingsPage() {
  return <SettingsPage key="wholesale" initialTab="Wholesale" />;
}

export function DeliveryChargesPage() {
  return <SettingsPage key="shipping" initialTab="Shipping" />;
}

export function CloudinarySettingsPage() {
  return <SettingsPage key="cloudinary" initialTab="Cloudinary" />;
}
