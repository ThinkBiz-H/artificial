import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { contactApi } from "@/api/contact";
import { useFaqs } from "@/hooks/useCatalog";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { cn, getErrorMessage, socialUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { AccordionItem } from "@/components/ui/Accordion";
import { PageHeader } from "@/components/common/PageHeader";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INQUIRY_TYPES = ["Order support", "Product question", "Returns & exchanges", "Bulk / wedding orders", "General inquiry"];

export function ContactPage() {
  const store = useStoreInfo();
  const { data: faqs } = useFaqs();
  const [inquiryType, setInquiryType] = useState(INQUIRY_TYPES[0]);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await contactApi.submit({ ...values, inquiryType });
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const whatsapp = store.whatsapp?.businessNumber ? socialUrl("whatsapp", store.whatsapp.businessNumber) : socialUrl("whatsapp", store.social.whatsapp);
  const crumbs = [{ name: "Home", path: "/" }, { name: "Contact us", path: "/contact" }];

  const details = [
    store.phone && { Icon: Phone, label: "Call us", value: store.phone, href: `tel:${store.phone.replace(/\s/g, "")}` },
    store.email && { Icon: Mail, label: "Email", value: store.email, href: `mailto:${store.email}` },
    whatsapp && { Icon: FaWhatsapp, label: "WhatsApp", value: "Chat with us", href: whatsapp },
    store.address && { Icon: MapPin, label: "Visit", value: store.address },
  ].filter(Boolean) as { Icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; href?: string }[];

  return (
    <>
      <Seo title="Contact Us" description={`Get in touch with ${store.siteName} for order help, product questions and returns.`} jsonLd={breadcrumbJsonLd(crumbs)} />
      <PageHeader eyebrow="We're here to help" title="Contact Us" description="Questions about an order, a piece or a special occasion? Our team would love to hear from you." crumbs={crumbs} />

      <div className="container-x grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-20">
        <aside className="space-y-8">
          {details.length > 0 && (
            <ul className="space-y-5">
              {details.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-muted text-accent">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-label font-semibold uppercase tracking-label text-fg-muted">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-0.5 block break-words text-base text-fg hover:text-accent">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-base leading-relaxed text-fg">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-sm text-fg-soft">
            <Clock size={18} strokeWidth={1.5} className="mt-0.5 flex-none text-accent" />
            <p>We reply to every message as quickly as we can on business days. For order queries, please keep your order number handy.</p>
          </div>
          <p className="text-sm text-fg-muted">
            Looking for an order? <Link to="/account/orders" className="font-medium text-fg underline underline-offset-4">Track it here</Link>.
          </p>
        </aside>

        <section id="contact-form" className="rounded-2xl border border-border bg-surface p-6 sm:p-9">
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center" role="status">
              <CheckCircle2 size={40} strokeWidth={1.25} className="text-success" />
              <p className="mt-4 font-display text-3xl font-semibold text-fg">Message received</p>
              <p className="mt-2 max-w-sm text-sm text-fg-muted">Thank you for reaching out — our team will get back to you soon.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl font-semibold text-fg">Send us a message</h2>
              <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Inquiry type">
                {INQUIRY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={inquiryType === t}
                    onClick={() => setInquiryType(t)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      inquiryType === t ? "border-primary bg-primary text-fg-inverse" : "border-border text-fg hover:border-primary",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Name" required autoComplete="name" {...register("name", { required: "Please enter your name" })} error={errors.name?.message} />
                  <Input
                    label="Phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    {...register("phone", { required: "Please enter your phone number" })}
                    error={errors.phone?.message}
                  />
                </div>
                <Input
                  label="Email"
                  required
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Please enter your email",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
                  })}
                  error={errors.email?.message}
                />
                <Input label="Subject" required {...register("subject", { required: "Please add a subject" })} error={errors.subject?.message} />
                <Textarea
                  label="Message"
                  required
                  rows={5}
                  {...register("message", {
                    required: "Please write your message",
                    minLength: { value: 10, message: "Tell us a little more" },
                  })}
                  error={errors.message?.message}
                />
                <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
                  Send message
                </Button>
              </form>
            </>
          )}
        </section>
      </div>

      {faqs && faqs.length > 0 && (
        <section className="border-t border-border bg-surface py-14 sm:py-20">
          <div className="container-x grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <p className="eyebrow">Quick answers</p>
              <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-fg">Frequently asked</h2>
              <Link to="/faq" className="mt-4 inline-block text-sm text-fg underline underline-offset-4">
                See all FAQs
              </Link>
            </div>
            <div className="border-t border-border">
              {faqs.slice(0, 5).map((f) => (
                <AccordionItem key={f._id} title={<span className="normal-case tracking-normal text-base font-medium">{f.question}</span>}>
                  <p className="whitespace-pre-line">{f.answer}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
