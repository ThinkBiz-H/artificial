import { Link } from "react-router-dom";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { formatCurrency, stripHtml, truncate } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { CmsHtml, useFirstCmsPage } from "@/components/common/CmsContent";
import { Seo, breadcrumbJsonLd } from "@/components/common/Seo";
import { Skeleton } from "@/components/ui/Skeleton";

type Store = ReturnType<typeof useStoreInfo>;

function ContactLine({ store }: { store: Store }) {
  return (
    <>
      {store.email && (
        <>
          email us at <a href={`mailto:${store.email}`}>{store.email}</a>
        </>
      )}
      {store.email && store.phone && " or "}
      {store.phone && <>call/WhatsApp {store.phone}</>}
      {!store.email && !store.phone && (
        <>
          reach us through our <Link to="/contact">contact page</Link>
        </>
      )}
    </>
  );
}

/** Built-in policy text, shown only until the admin publishes the matching CMS page. */
const FALLBACKS: Record<string, { title: string; description: string; body: (s: Store) => React.ReactNode }> = {
  refund: {
    title: "Returns & Refunds",
    description: "Everything you need to know about returning or exchanging your jewellery.",
    body: (s) => (
      <>
        <p>We want you to love every piece from {s.siteName}. If something isn't right, here's how we'll make it right.</p>
        <h2>Return window</h2>
        <p>
          You can request a return within <strong>5 days of delivery</strong>. Requests made after 5 days unfortunately can't be accepted.
        </p>
        <h2>Eligibility</h2>
        <ul>
          <li>The item must be unused and unworn, in the condition you received it.</li>
          <li>It must be returned in its original packaging, with all tags, pouches and accessories.</li>
        </ul>
        <h2>Damaged, defective or wrong items</h2>
        <p>
          If your order arrives damaged, defective or different from what you ordered, contact us within <strong>48 hours of delivery</strong> with
          clear photos or a video of the product, packaging and shipping label. Once verified, we'll arrange a <strong>free replacement or a full refund</strong>.
        </p>
        <h2>How to request a return</h2>
        <p>
          <ContactLine store={s} /> within 5 days of delivery, sharing your order number and photos of the item. Our team responds within 1–2
          business days with next steps.
        </p>
        <h2>Refunds</h2>
        <ul>
          <li>Approved refunds are processed to the original payment method within 5–7 business days.</li>
          <li>Cash on Delivery refunds are issued via bank transfer or UPI — we'll ask for your details.</li>
          <li>Shipping charges are non-refundable unless the return is due to our error.</li>
        </ul>
        <h2>Exchanges</h2>
        <p>We're happy to exchange an eligible item for another design within the same 5-day window.</p>
        <h2>Cancellations</h2>
        <p>
          Orders can be cancelled any time before they're shipped, from <Link to="/account/orders">My Orders</Link>. Once dispatched, the order can
          no longer be cancelled but may be returned as per this policy.
        </p>
      </>
    ),
  },
  shipping: {
    title: "Shipping Policy",
    description: "How and when your jewellery reaches you.",
    body: (s) => (
      <>
        <h2>Delivery across India</h2>
        <p>
          We ship to serviceable pincodes across India through our logistics partner Shiprocket and its courier network. Every parcel is packed
          securely and shipped with tracking.
        </p>
        <h2>Shipping charges</h2>
        <p>
          {s.freeShippingEnabled && s.freeShippingThreshold > 0 ? (
            <>
              Orders above <strong>{formatCurrency(s.freeShippingThreshold)}</strong> ship free.{" "}
            </>
          ) : null}
          The exact shipping charge for your pincode is calculated and shown at checkout before you pay.
        </p>
        <h2>Delivery time</h2>
        <p>
          An estimated delivery time for your pincode is available on every product page and at checkout. Timelines may vary during festive
          seasons or due to circumstances outside our control.
        </p>
        <h2>Tracking your order</h2>
        <p>
          Once your order ships, you can follow it from <Link to="/account/orders">My Orders</Link> — including courier details and live shipment
          updates.
        </p>
        <h2>Questions?</h2>
        <p>
          <ContactLine store={s} /> — we're happy to help.
        </p>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use and protect your information.",
    body: (s) => (
      <>
        <p>
          {s.siteName} respects your privacy. This policy explains what information we collect when you shop with us and how we use it.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>Contact details you provide — name, mobile number, email address.</li>
          <li>Delivery addresses you save or enter at checkout.</li>
          <li>Order history, wishlist and reviews you leave on our site.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To process, ship and support your orders, and to verify your mobile number by OTP.</li>
          <li>To send order updates and, if you subscribe, news about new collections and offers.</li>
          <li>To improve our website and the products we offer.</li>
        </ul>
        <h2>Payments</h2>
        <p>Online payments are processed securely by Razorpay. We never see or store your full card or banking details.</p>
        <h2>Sharing</h2>
        <p>
          We share only what's necessary with trusted partners who help us run the store — such as our payment gateway and courier partners —
          and never sell your personal information.
        </p>
        <h2>Your choices</h2>
        <p>
          You can view and update your details from <Link to="/account/profile">My Account</Link> at any time. To request deletion of your data,{" "}
          <ContactLine store={s} />.
        </p>
      </>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    description: "The terms that apply when you use our website and shop with us.",
    body: (s) => (
      <>
        <p>By accessing or shopping on the {s.siteName} website, you agree to the following terms.</p>
        <h2>Products</h2>
        <p>
          We sell artificial (fashion) jewellery. We make every effort to display colours and finishes accurately; slight variations due to
          lighting and screen settings are possible.
        </p>
        <h2>Pricing & payment</h2>
        <p>
          All prices are in Indian Rupees. Prices and availability may change without notice. Orders are confirmed once payment is verified (for
          online payments) or the order is accepted (for Cash on Delivery).
        </p>
        <h2>Orders</h2>
        <p>We reserve the right to cancel an order in case of stock unavailability, pricing errors or suspected fraud, with a full refund where applicable.</p>
        <h2>Returns</h2>
        <p>
          Returns and refunds are governed by our <Link to="/refund-policy">Returns & Refunds policy</Link>.
        </p>
        <h2>Intellectual property</h2>
        <p>All content on this website — images, designs and text — belongs to {s.siteName} and may not be reused without permission.</p>
        <h2>Contact</h2>
        <p>
          For any questions about these terms, <ContactLine store={s} />.
        </p>
      </>
    ),
  },
};

const SLUGS: Record<string, { slugs: string[]; path: string }> = {
  refund: { slugs: ["refund-policy", "return-policy", "returns"], path: "/refund-policy" },
  shipping: { slugs: ["shipping-policy", "shipping"], path: "/shipping-policy" },
  privacy: { slugs: ["privacy-policy", "privacy"], path: "/privacy-policy" },
  terms: { slugs: ["terms-conditions", "terms-and-conditions", "terms"], path: "/terms-conditions" },
};

export function PolicyPage({ kind }: { kind: keyof typeof FALLBACKS }) {
  const store = useStoreInfo();
  const { slugs, path } = SLUGS[kind];
  const { page, isLoading } = useFirstCmsPage(slugs);
  const fallback = FALLBACKS[kind];
  const title = page?.title || fallback.title;
  const crumbs = [{ name: "Home", path: "/" }, { name: title, path }];

  return (
    <>
      <Seo
        title={page?.seo?.title || title}
        description={page?.seo?.description || truncate(stripHtml(page?.excerpt) || fallback.description)}
        canonicalPath={path}
        jsonLd={breadcrumbJsonLd(crumbs)}
      />
      <PageHeader eyebrow="Customer care" title={title} description={page ? page.excerpt : fallback.description} crumbs={crumbs} />
      <div className="container-x py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : page?.content ? (
            <CmsHtml html={page.content} />
          ) : (
            <div className="rich-content">{fallback.body(store)}</div>
          )}
        </div>
      </div>
    </>
  );
}

export const PrivacyPolicyPage = () => <PolicyPage kind="privacy" />;
export const TermsPage = () => <PolicyPage kind="terms" />;
export const RefundPolicyPage = () => <PolicyPage kind="refund" />;
export const ShippingPolicyPage = () => <PolicyPage kind="shipping" />;
