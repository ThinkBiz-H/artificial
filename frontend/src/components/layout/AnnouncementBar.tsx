import { useMemo } from "react";
import { useAnnouncements } from "@/hooks/useCatalog";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { formatCurrency } from "@/lib/utils";

/**
 * Slim auto-scrolling bar above the header. Shows the admin's active
 * announcements (Admin > Announcements); when none exist, falls back to
 * messages built from Admin > Settings (shipping threshold, payment options).
 * Pauses on hover/focus; reduced-motion users get a static strip.
 */
export function AnnouncementBar() {
  const { data: announcements } = useAnnouncements();
  const { freeShippingEnabled, freeShippingThreshold, codEnabled, onlinePaymentEnabled } = useStoreInfo();

  const { messages, speed } = useMemo(() => {
    const active = (announcements || []).filter((a) => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
    if (active.length) {
      // Admin "scroll speed" is pixels/second-ish; fall back to a calm pace.
      const adminSpeed = active.find((a) => a.scrollSpeed > 0)?.scrollSpeed;
      return { messages: active.map((a) => a.text), speed: adminSpeed };
    }
    return {
      messages: [
        freeShippingEnabled && freeShippingThreshold > 0
          ? `Free shipping on orders above ${formatCurrency(freeShippingThreshold)}`
          : "Insured shipping across India",
        "Premium quality artificial jewellery",
        "Easy returns",
        ...(onlinePaymentEnabled ? ["Secure Razorpay payments", "Extra 10% off on prepaid orders"] : []),
        ...(codEnabled ? ["Cash on delivery available"] : []),
      ],
      speed: undefined,
    };
  }, [announcements, freeShippingEnabled, freeShippingThreshold, codEnabled, onlinePaymentEnabled]);

  // Repeat short lists so one copy of the track is wider than any screen.
  const track = messages.length < 4 ? [...messages, ...messages, ...messages] : messages;
  const chars = track.join("").length;
  const duration = Math.max(24, Math.round(chars / ((speed && speed > 0 ? Math.min(speed, 120) : 40) / 6)));

  const copy = (hidden: boolean) => (
    <ul className="flex flex-none items-center" aria-hidden={hidden || undefined}>
      {track.map((m, i) => (
        <li key={`${m}-${i}`} className="flex items-center whitespace-nowrap">
          <span className="px-7">{m}</span>
          <span className="text-[9px] text-gold" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="announce relative overflow-hidden bg-surface-dark text-fg-inverse" role="region" aria-label="Store announcements">
      <p className="sr-only">{messages.join(". ")}</p>
      <div className="flex h-9 items-center text-[10.5px] font-semibold uppercase tracking-[0.24em]" aria-hidden>
        <div className="announce-track flex w-max" style={{ animationDuration: `${duration}s` }}>
          {copy(false)}
          {copy(true)}
        </div>
      </div>
    </div>
  );
}
