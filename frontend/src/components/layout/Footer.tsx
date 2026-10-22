import { Link, useLocation } from "react-router-dom";
import { Banknote, Landmark, Mail, MapPin, Phone, ShieldCheck, Smartphone, Truck, RotateCcw } from "lucide-react";
import { FaFacebookF, FaInstagram, FaPinterestP, FaWhatsapp, FaXTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
import { SiMastercard, SiRazorpay, SiVisa } from "react-icons/si";
import type { IconType } from "react-icons";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { usePages } from "@/hooks/usePages";
import { socialUrl } from "@/lib/utils";
import type { CmsPage } from "@/types";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { SHOP_LINKS, useMenuCategories } from "./nav";

const SOCIALS = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "pinterest", label: "Pinterest", Icon: FaPinterestP },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "twitter", label: "X", Icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
] as const;

const CUSTOMER_CARE = [
  { label: "Contact us", to: "/contact" },
  { label: "FAQs", to: "/faq" },
  { label: "Shipping policy", to: "/shipping-policy" },
  { label: "Returns & refunds", to: "/refund-policy" },
  { label: "Track your order", to: "/track-order" },
];

const INFORMATION = [
  { label: "About us", to: "/about" },
  { label: "Journal", to: "/blog" },
  { label: "Privacy policy", to: "/privacy-policy" },
  { label: "Terms & conditions", to: "/terms-conditions" },
];

const ACCOUNT = [
  { label: "My account", to: "/account" },
  { label: "My orders", to: "/account/orders" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "Shopping bag", to: "/cart" },
];

const DEFAULT_ABOUT =
  "Premium artificial jewellery crafted for weddings, festivals and everyday elegance — designed to be worn, loved and treasured.";

function Column({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h3 className="text-label font-semibold uppercase tracking-eyebrow text-accent-light">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={`${l.to}-${l.label}`}>
            <Link to={l.to} className="text-sm text-fg-inverse/70 transition-colors hover:text-fg-inverse">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PaymentMark({ label, Icon }: { label: string; Icon?: IconType | typeof Banknote }) {
  return (
    <li className="flex h-8 items-center gap-1.5 rounded-lg border border-fg-inverse/15 bg-fg-inverse/[0.04] px-2.5 text-2xs font-semibold tracking-wide text-fg-inverse/85">
      {Icon && <Icon size={14} aria-hidden />}
      {label}
    </li>
  );
}

export function Footer() {
  const store = useStoreInfo();
  const { pathname } = useLocation();
  const { header } = useMenuCategories();
  const { data: pagesRes } = usePages();

  const shopLinks = [
    { label: "New arrivals", to: SHOP_LINKS.newArrivals },
    ...header.slice(0, 6).map((c) => ({ label: c.name, to: `/categories/${c.slug}` })),
    { label: "Best sellers", to: SHOP_LINKS.bestSellers },
    { label: "Sale", to: SHOP_LINKS.sale },
  ];

  // Published admin CMS pages not already linked above are appended to "Information".
  const knownSlugs = new Set([...CUSTOMER_CARE, ...INFORMATION].map((l) => l.to.replace(/^\//, "")));
  const cmsPages: CmsPage[] = (pagesRes?.data?.pages ?? []) as CmsPage[];
  const information = [
    ...INFORMATION,
    ...cmsPages
      .filter((p) => p.status === "published" && !knownSlugs.has(p.slug) && !["about", "about-us"].includes(p.slug))
      .slice(0, 4)
      .map((p) => ({ label: p.title, to: `/${p.slug}` })),
  ];

  const socials = SOCIALS.map((s) => ({ ...s, href: socialUrl(s.key, store.social[s.key]) })).filter((s) => s.href);
  const year = new Date().getFullYear();

  const payments: { label: string; Icon?: IconType | typeof Banknote }[] = [
    ...(store.onlinePaymentEnabled
      ? [
          { label: "Razorpay", Icon: SiRazorpay },
          { label: "UPI", Icon: Smartphone },
          { label: "Visa", Icon: SiVisa },
          { label: "Mastercard", Icon: SiMastercard },
          { label: "RuPay" },
          { label: "Net Banking", Icon: Landmark },
        ]
      : []),
    ...(store.codEnabled ? [{ label: "Cash on Delivery", Icon: Banknote }] : []),
  ];

  return (
    <footer className="mt-auto bg-surface-dark text-fg-inverse/75">
      <div className="gold-rule" aria-hidden />
      {/* Service promises */}
      <div className="border-b border-fg-inverse/10">
        <div className="container-x grid grid-cols-1 divide-y divide-fg-inverse/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { Icon: Truck, title: "Insured shipping", text: "Tracked delivery across India" },
            { Icon: RotateCcw, title: "Easy returns", text: "Hassle-free return requests" },
            { Icon: ShieldCheck, title: "Secure payments", text: "UPI, cards, net banking & more" },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 py-6 sm:justify-center sm:px-6">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-accent-light/30 text-accent-light">
                <Icon size={19} strokeWidth={1.25} aria-hidden />
              </span>
              <div>
                <p className="text-label font-semibold uppercase tracking-eyebrow text-fg-inverse">{title}</p>
                <p className="mt-0.5 text-sm text-fg-inverse/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3" aria-label={`${store.siteName} home`}>
              {store.logo && <img src={store.logo} alt="" width={44} height={44} className="h-11 w-11 object-contain" />}
              <span className="font-display text-3xl font-semibold uppercase tracking-[0.28em] text-fg-inverse">{store.siteName}</span>
            </Link>
            <p className="mt-2 text-label uppercase tracking-[0.4em] text-accent-light">Premium Artificial Jewellery</p>
            <p className="mt-6 max-w-sm font-sub text-[15px] leading-7 text-fg-inverse/65">{store.tagline || DEFAULT_ABOUT}</p>
            <div className="mt-6 space-y-2.5 text-sm text-fg-inverse/70">
              {store.email && (
                <a href={`mailto:${store.email}`} className="flex items-center gap-2.5 transition-colors hover:text-fg-inverse">
                  <Mail size={15} strokeWidth={1.5} aria-hidden /> {store.email}
                </a>
              )}
              {store.phone && (
                <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 transition-colors hover:text-fg-inverse">
                  <Phone size={15} strokeWidth={1.5} aria-hidden /> {store.phone}
                </a>
              )}
              {store.address && (
                <p className="flex items-start gap-2.5">
                  <MapPin size={15} strokeWidth={1.5} className="mt-0.5 flex-none" aria-hidden /> {store.address}
                </p>
              )}
            </div>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Follow us">
                {socials.map(({ key, label, Icon, href }) => (
                  <li key={key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-fg-inverse/20 text-fg-inverse transition-colors hover:border-accent-light hover:bg-accent-light hover:text-surface-dark"
                    >
                      <Icon size={14} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Column title="Shop" links={shopLinks} />
          <Column title="Customer care" links={CUSTOMER_CARE} />
          <Column title="Information" links={information} />
          <Column title="Account" links={ACCOUNT} />
        </div>

        {/* The homepage has its own large newsletter section */}
        {pathname !== "/" && (
          <div className="mt-14 grid gap-8 border-t border-fg-inverse/10 pt-10 lg:grid-cols-2 lg:items-end">
            <div>
              <h3 className="font-display text-3xl font-semibold text-fg-inverse sm:text-4xl">Be the first to know</h3>
              <p className="mt-1.5 font-sub text-sm text-fg-inverse/65">New collections, exclusive offers and styling inspiration.</p>
            </div>
            <NewsletterForm tone="dark" className="w-full lg:max-w-md lg:justify-self-end" />
          </div>
        )}
      </div>

      <div className="border-t border-fg-inverse/10">
        <div className="container-x flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {payments.length > 0 && (
              <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
                {payments.map((p) => (
                  <PaymentMark key={p.label} {...p} />
                ))}
              </ul>
            )}
            <p className="flex items-center gap-1.5 text-label text-fg-inverse/60 sm:pl-2">
              <Truck size={14} strokeWidth={1.5} aria-hidden /> Shipped via Shiprocket
            </p>
          </div>
          <p className="text-xs text-fg-inverse/55">
            © {year} {store.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
