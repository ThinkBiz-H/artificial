const https = require("https");
const logger = require("../utils/logger");

/**
 * Brand Management — the single place logos, company details, social links
 * and theme come from (Admin → Settings → Brand Management).
 *
 * Storage: Settings.brand (logos, theme, extra company fields) plus the
 * existing Settings sections the rest of the app already reads (general,
 * store, contact, social, invoice) — edited in place, never duplicated, so
 * every existing consumer stays in sync automatically.
 */

/** Every logo slot: where it's used, recommended size and fallback chain. */
const SLOTS = {
  headerLogo: { label: "Website header logo", group: "website", size: "600 × 200 px, transparent PNG/SVG", fallback: ["lightLogo"] },
  footerLogo: { label: "Website footer logo", group: "website", size: "600 × 200 px, light version for the dark footer", fallback: ["darkLogo", "headerLogo"] },
  darkLogo: { label: "Logo for dark backgrounds", group: "website", size: "600 × 200 px, light-coloured artwork", fallback: ["headerLogo"] },
  lightLogo: { label: "Logo for light backgrounds", group: "website", size: "600 × 200 px, dark-coloured artwork", fallback: ["headerLogo"] },
  favicon: { label: "Favicon", group: "browser", size: "512 × 512 px square PNG/SVG/ICO", fallback: ["browserIcon"] },
  browserIcon: { label: "Browser / home-screen icon", group: "browser", size: "512 × 512 px square PNG", fallback: ["favicon"] },
  appLogo: { label: "Mobile app logo", group: "app", size: "600 × 400 px, transparent PNG", fallback: ["headerLogo"] },
  splashLogo: { label: "Splash screen logo", group: "app", size: "1200 × 800 px", fallback: ["appLogo", "headerLogo"] },
  loginLogo: { label: "Login screen logo", group: "app", size: "600 × 400 px, transparent PNG", fallback: ["appLogo", "headerLogo"] },
  registerLogo: { label: "Register screen logo", group: "app", size: "600 × 400 px, transparent PNG", fallback: ["loginLogo", "appLogo", "headerLogo"] },
  drawerLogo: { label: "Drawer / menu logo", group: "app", size: "600 × 400 px, transparent PNG", fallback: ["appLogo", "headerLogo"] },
  appBarLogo: { label: "App bar logo", group: "app", size: "600 × 200 px, transparent PNG", fallback: ["appLogo", "headerLogo"] },
  androidIcon: { label: "Android app icon", group: "app", size: "1024 × 1024 px square PNG (applied at next app build)", fallback: [] },
  iosIcon: { label: "iOS app icon", group: "app", size: "1024 × 1024 px square PNG, no transparency (applied at next app build)", fallback: [] },
  invoiceLogo: { label: "Invoice logo", group: "documents", size: "600 × 200 px PNG/JPG", fallback: ["headerLogo"] },
  pdfLogo: { label: "PDF documents logo", group: "documents", size: "600 × 200 px PNG/JPG", fallback: ["invoiceLogo", "headerLogo"] },
  emailLogo: { label: "Email logo", group: "documents", size: "600 × 200 px PNG/JPG (not SVG — many email apps block it)", fallback: ["headerLogo"] },
  adminLogo: { label: "Admin panel logo", group: "admin", size: "600 × 200 px, transparent PNG/SVG", fallback: ["headerLogo"] },
};
const SLOT_NAMES = Object.keys(SLOTS);

/** Built-in theme — today's storefront design tokens. Empty values in the DB mean "use this". */
const DEFAULT_THEME = {
  primary: "#5a1e36",
  secondary: "#7b2749",
  accent: "#8b5e3c",
  button: "#5a1e36",
  navbar: "#fff9f5",
  footer: "#16120f",
  background: "#fff9f5",
  text: "#241419",
  textMuted: "#75656a",
  radius: 18,
  headingFont: "Cormorant Garamond",
  bodyFont: "Inter",
};
const THEME_COLORS = ["primary", "secondary", "accent", "button", "navbar", "footer", "background", "text", "textMuted"];
const FONTS = ["Cormorant Garamond", "Playfair Display", "Inter", "Poppins", "Montserrat", "Lora", "DM Sans", "Marcellus", "Cinzel", "Jost", "Libre Baskerville", "Nunito Sans"];

const assetsOf = (settings) => {
  const raw = settings?.brand?.assets;
  if (!raw) return {};
  // Map values are Mongoose subdocuments — convert to plain objects.
  const entries = raw instanceof Map ? [...raw.entries()] : Object.entries(raw.toObject?.() ?? raw);
  return Object.fromEntries(entries.map(([k, v]) => [k, v?.toObject ? v.toObject() : v]));
};

const plainAsset = (a) =>
  a && a.url
    ? { url: a.url, publicId: a.publicId || "", width: a.width || null, height: a.height || null, format: a.format || "", version: a.version || null, updatedAt: a.updatedAt || null }
    : null;

/** Slot → URL with fallbacks (legacy logo/favicon included); "" means "use the bundled default". */
const resolveLogos = (settings) => {
  const assets = assetsOf(settings);
  const legacy = { headerLogo: settings?.logo?.url || "", favicon: settings?.favicon?.url || "" };
  const own = (slot) => assets[slot]?.url || legacy[slot] || "";
  const out = {};
  SLOT_NAMES.forEach((slot) => {
    let url = own(slot);
    for (const next of SLOTS[slot].fallback) {
      if (url) break;
      url = own(next);
    }
    out[slot] = url;
  });
  return out;
};

const resolveTheme = (settings) => {
  const stored = settings?.brand?.theme?.toObject?.() ?? settings?.brand?.theme ?? {};
  const theme = { ...DEFAULT_THEME };
  Object.keys(DEFAULT_THEME).forEach((key) => {
    const v = stored[key];
    if (v !== undefined && v !== null && v !== "") theme[key] = v;
  });
  return theme;
};

/** Company details assembled from the sections the rest of the app already reads. */
const companyOf = (settings) => {
  const s = settings?.toObject?.() ?? settings ?? {};
  const extra = s.brand?.company || {};
  return {
    companyName: s.store?.legalName || "",
    brandName: s.general?.siteName || "",
    tagline: s.general?.siteTagline || "",
    gst: s.store?.gstNumber || "",
    pan: extra.pan || "",
    email: s.contact?.email || "",
    supportEmail: s.general?.supportEmail || "",
    phone: s.contact?.phone || "",
    customerCare: s.general?.supportPhone || "",
    whatsapp: s.contact?.whatsapp || "",
    address: s.contact?.address || "",
    invoiceAddress: s.store?.address || {},
    mapUrl: extra.mapUrl || "",
    workingHours: extra.workingHours || "",
    invoice: {
      prefix: s.invoice?.prefix || "",
      footerNote: s.invoice?.footerNote || "",
      termsAndConditions: s.invoice?.termsAndConditions || "",
    },
  };
};

/** Public brand payload (website, app, admin) — no internal ids or authors. */
const publicBrand = (settings) => {
  const assets = assetsOf(settings);
  const company = companyOf(settings);
  return {
    revision: settings?.brand?.revision || 0,
    updatedAt: settings?.brand?.updatedAt || null,
    logos: resolveLogos(settings),
    assets: Object.fromEntries(SLOT_NAMES.map((slot) => [slot, plainAsset(assets[slot])]).filter(([, a]) => a)),
    theme: resolveTheme(settings),
    company: {
      companyName: company.companyName,
      brandName: company.brandName,
      tagline: company.tagline,
      gst: company.gst,
      email: company.email,
      supportEmail: company.supportEmail,
      phone: company.phone,
      customerCare: company.customerCare,
      whatsapp: company.whatsapp,
      address: company.address,
      mapUrl: company.mapUrl,
      workingHours: company.workingHours,
    },
    social: settings?.social?.toObject?.() ?? settings?.social ?? {},
  };
};

// ---------------------------------------------------------------- server-side branding (emails, invoices)

/** Cloudinary can deliver any image as PNG — what pdfkit needs. */
const pngUrl = (url) => (/res\.cloudinary\.com\/.+\/upload\//.test(url) ? url.replace("/upload/", "/upload/f_png,w_400,c_limit/") : url);

const fetchBuffer = (url) =>
  new Promise((resolve) => {
    if (!/^https:\/\//i.test(url)) return resolve(null);
    const req = https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      const chunks = [];
      let size = 0;
      res.on("data", (c) => {
        size += c.length;
        if (size > 3 * 1024 * 1024) req.destroy();
        else chunks.push(c);
      });
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(null));
  });

let appliedRevision = null;

/**
 * Pushes the current brand into the shared email BRAND and invoice COMPANY
 * objects (they're read synchronously by templates). Called at startup,
 * after every brand change, and on change events from other instances.
 */
const applyServerBranding = async (settings) => {
  try {
    // Lazy requires: these modules are loaded by the template/invoice code paths.
    // eslint-disable-next-line global-require
    const { BRAND } = require("../utils/emailTemplates/brand");
    // eslint-disable-next-line global-require
    const invoice = require("./invoice.service");
    const company = companyOf(settings);
    const logos = resolveLogos(settings);
    const name = company.brandName || company.companyName;

    if (name) BRAND.name = name;
    if (logos.emailLogo) BRAND.logoUrl = logos.emailLogo;
    if (company.supportEmail || company.email) BRAND.supportEmail = company.supportEmail || company.email;
    if (company.customerCare || company.phone) BRAND.supportPhone = company.customerCare || company.phone;

    const addr = company.invoiceAddress || {};
    const structured = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
    invoice.COMPANY.name = company.companyName || name || invoice.COMPANY.name;
    invoice.COMPANY.address = structured || company.address || invoice.COMPANY.address;
    invoice.COMPANY.gstin = company.gst || invoice.COMPANY.gstin;
    invoice.COMPANY.phone = company.phone || invoice.COMPANY.phone;
    invoice.COMPANY.email = company.email || invoice.COMPANY.email;

    const revision = settings?.brand?.revision || 0;
    const invoiceLogo = logos.pdfLogo || logos.invoiceLogo;
    if (revision !== appliedRevision || (invoiceLogo && !invoice.COMPANY.logo)) {
      invoice.COMPANY.logo = invoiceLogo ? await fetchBuffer(pngUrl(invoiceLogo)) : null;
      appliedRevision = revision;
    }
  } catch (err) {
    logger.error(`Applying brand to emails/invoices failed: ${err.message}`);
  }
};

module.exports = {
  SLOTS,
  SLOT_NAMES,
  DEFAULT_THEME,
  THEME_COLORS,
  FONTS,
  resolveLogos,
  resolveTheme,
  companyOf,
  publicBrand,
  assetsOf,
  applyServerBranding,
};
