/**
 * Builds the wa.me "Start Chat" URL with the first message pre-filled —
 * the one place this text/logic lives, shared by OrderSuccessPage and
 * account/OrderDetailsPage (FEATURE 8: no duplicate logic).
 */
export function buildStartChatUrl({
  businessNumber,
  orderNumber,
  customerName,
}: {
  businessNumber: string;
  orderNumber: string;
  customerName: string;
}): string {
  const message = `Hello Swastikala Team,

My Order Number is ${orderNumber}.

I need support regarding my order.

Customer Name:
${customerName}

Thank you.`;

  const digitsOnly = businessNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}
