import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/Button";
import { usePublicSettings } from "@/hooks/useCatalog";
import { buildStartChatUrl } from "@/lib/whatsapp";

/**
 * "Start Chat" button — opens WhatsApp with the order number and customer
 * name already filled into the first message. Used on both the Order
 * Success page and the account order tracking page (FEATURE 3/5), same
 * behavior in both places (FEATURE 8: no duplicate logic — this is the one
 * component both render).
 *
 * Renders nothing if WhatsApp isn't configured/enabled from Admin Settings
 * (no business number set, or the admin has turned the button off) —
 * FEATURE 6: everything here is admin-controlled, nothing hardcoded.
 */
export function StartChatButton({
  orderNumber,
  customerName,
  className,
}: {
  orderNumber: string;
  customerName: string;
  className?: string;
}) {
  const { data: settings } = usePublicSettings();
  const whatsapp = settings?.whatsapp;

  if (!whatsapp?.enableStartChat || !whatsapp.businessNumber) return null;

  const chatUrl = buildStartChatUrl({
    businessNumber: whatsapp.businessNumber,
    orderNumber,
    customerName,
  });

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => window.open(chatUrl, "_blank", "noopener,noreferrer")}
    >
      <FaWhatsapp size={16} />
      Start Chat
    </Button>
  );
}
