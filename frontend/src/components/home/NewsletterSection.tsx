import { NewsletterForm } from "@/components/common/NewsletterForm";
import { Reveal } from "@/components/common/Reveal";

export function NewsletterSection() {
  return (
    <section className="bg-primary py-20 text-fg-inverse sm:py-28">
      <Reveal className="container-x flex flex-col items-center text-center">
        <span className="ornament text-label font-semibold uppercase tracking-eyebrow text-accent-light">The inner circle</span>
        <h2 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-display sm:text-6xl">Be the First to Know</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-fg-inverse/70">
          Get updates on new collections, exclusive offers and jewellery inspiration — straight to your inbox.
        </p>
        <NewsletterForm tone="dark" className="mt-10 w-full max-w-md" />
        <p className="mt-4 text-label text-fg-inverse/45">No spam — we respect your inbox and your privacy.</p>
      </Reveal>
    </section>
  );
}
