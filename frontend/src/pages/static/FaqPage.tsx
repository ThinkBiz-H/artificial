import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Search } from "lucide-react";
import { useFaqs } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { AccordionItem } from "@/components/ui/Accordion";
import { buttonClasses } from "@/components/ui/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { cn } from "@/lib/utils";

/** FAQs managed in Admin > FAQs, grouped by their category. */
export function FaqPage() {
  const { data: faqs, isLoading, isError, refetch } = useFaqs();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("All");

  const groups = useMemo(() => ["All", ...Array.from(new Set((faqs ?? []).map((f) => f.category).filter((c): c is string => !!c)))], [faqs]);
  const visible = (faqs ?? []).filter(
    (f) =>
      (group === "All" || f.category === group) &&
      (!query.trim() || `${f.question} ${f.answer}`.toLowerCase().includes(query.trim().toLowerCase())),
  );
  const crumbs = [{ name: "Home", path: "/" }, { name: "FAQs", path: "/faq" }];

  return (
    <>
      <Seo
        title="FAQs"
        description="Answers to common questions about orders, shipping, returns and jewellery care."
        jsonLd={[
          breadcrumbJsonLd(crumbs),
          ...(faqs?.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.slice(0, 20).map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
                },
              ]
            : []),
        ]}
      />
      <PageHeader eyebrow="Help centre" title="Frequently Asked Questions" description="Everything you need to know about shopping with us." crumbs={crumbs} />

      <div className="container-x py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !faqs || faqs.length === 0 ? (
            <EmptyState icon={<HelpCircle className="h-7 w-7" strokeWidth={1.25} />} title="No FAQs yet" description="Have a question? Our team is happy to help." />
          ) : (
            <>
              <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary">
                <Search size={17} className="text-fg-muted" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions…" aria-label="Search FAQs" className="w-full bg-transparent text-sm outline-none" />
              </label>
              {groups.length > 2 && (
                <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
                  {groups.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroup(g)}
                      className={cn("flex-none rounded-full border px-4 py-1.5 text-sm", group === g ? "border-primary bg-primary text-fg-inverse" : "border-border bg-surface text-fg hover:border-primary")}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-8 border-t border-border">
                {visible.length === 0 ? (
                  <p className="py-10 text-center text-sm text-fg-muted">No questions match your search.</p>
                ) : (
                  visible.map((f, i) => (
                    <AccordionItem key={f._id} defaultOpen={i === 0 && !query} title={<span className="normal-case tracking-normal text-base font-medium">{f.question}</span>}>
                      <p className="whitespace-pre-line text-base">{f.answer}</p>
                    </AccordionItem>
                  ))
                )}
              </div>
            </>
          )}

          <div className="mt-14 rounded-2xl bg-surface-muted/60 p-8 text-center">
            <p className="font-display text-2xl font-semibold text-fg">Still have questions?</p>
            <p className="mt-1 text-sm text-fg-muted">Our team is just a message away.</p>
            <Link to="/contact" className={buttonClasses({ className: "mt-5" })}>
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
