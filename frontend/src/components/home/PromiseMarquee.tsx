import { Sparkle } from "lucide-react";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { formatCurrency } from "@/lib/utils";

/** Slow-scrolling brand promise strip under the hero. Pauses on hover; static for reduced motion. */
export function PromiseMarquee() {
  const { freeShippingEnabled, freeShippingThreshold } = useStoreInfo();
  const items = [
    "Handpicked designs",
    "Skin-friendly finishes",
    freeShippingEnabled && freeShippingThreshold > 0 ? `Free shipping above ${formatCurrency(freeShippingThreshold)}` : "Insured, tracked shipping",
    "Easy returns",
    "Secure payments",
    "Gift-ready packaging",
  ];
  const row = (
    <div className="flex flex-none items-center gap-10 pr-10">
      {items.map((t) => (
        <span key={t} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-xl italic sm:text-2xl">{t}</span>
          <Sparkle size={14} className="text-accent-light" fill="currentColor" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="group overflow-hidden bg-primary py-4 text-fg-inverse" aria-label="Our promise">
      <div className="flex w-max animate-[promise-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row}
        <div aria-hidden>{row}</div>
      </div>
      <style>{`@keyframes promise-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
