import { Gem, Headset, RotateCcw, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Reveal } from "@/components/common/Reveal";
import { resolveIcon } from "./iconMap";
import type { HomeSectionData } from "./homeData";

const DEFAULTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Gem, title: "Premium Quality", body: "Skin-friendly finishes and stones set to last." },
  { icon: ShieldCheck, title: "Secure Payments", body: "UPI, cards and net banking via Razorpay." },
  { icon: RotateCcw, title: "Easy Returns", body: "Simple return requests on eligible orders." },
  { icon: Truck, title: "Fast Shipping", body: "Tracked, insured delivery across India." },
  { icon: Headset, title: "Customer Support", body: "Real people, ready to help with every order." },
];

/** Uses the admin's "Why Choose" items when configured, otherwise the store's standard promises. */
export function WhyChooseUs({ section }: { section?: HomeSectionData }) {
  const adminItems = (section?.config?.items ?? []).filter((i) => i.title);
  const items = adminItems.length
    ? adminItems.map((i) => ({ icon: resolveIcon(i.icon), title: i.title!, body: i.description || "" }))
    : DEFAULTS;

  return (
    <section className="border-y border-border bg-canvas py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading eyebrow="The promise" title={section?.title || "Why Shop With Us"} description={section?.subtitle} align="center" />
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-border">
          {items.slice(0, 5).map(({ icon: Icon, title, body }, i, arr) => (
            <Reveal
              key={title}
              delay={i * 0.06}
              className={`flex flex-col items-center px-4 text-center ${arr.length % 2 === 1 ? "last:col-span-2 sm:last:col-span-1" : ""}`}
            >
              <Icon size={30} strokeWidth={1} className="text-accent" />
              <p className="mt-4 font-display text-xl font-semibold text-fg">{title}</p>
              {body && <p className="mt-1.5 max-w-[220px] text-sm leading-relaxed text-fg-muted">{body}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
