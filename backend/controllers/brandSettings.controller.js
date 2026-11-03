const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendResponse } = require("../utils/ApiResponse");
const logger = require("../utils/logger");
const settingsService = require("../services/settings.service");
const brand = require("../services/brand.service");
const BrandAssetVersion = require("../models/BrandAssetVersion");
const Media = require("../models/Media");
const User = require("../models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinary.service");
const { invalidate } = require("../services/cache.service");
const { emitToAll } = require("../services/socket.service");

const VERSIONS_KEPT = 10;
const HEX = /^#[0-9a-f]{6}$/i;
const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[0-9+\-\s()]{6,20}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "twitter", "linkedin", "pinterest", "whatsapp"];

const str = (v) => (v === undefined || v === null ? "" : String(v).trim());
const assertSlot = (slot) => {
  if (!brand.SLOT_NAMES.includes(slot)) throw new ApiError(400, `Unknown logo slot "${slot}"`);
};

const loadSettings = () => settingsService.getSettings({ bypassCache: true });

/** Saves, bumps the brand revision and pushes the change everywhere. */
const commit = async (settings, userId, sections, extra = {}) => {
  settings.brand.revision = (settings.brand.revision || 0) + 1;
  settings.brand.updatedAt = new Date();
  settings.brand.updatedBy = userId;
  settings.updatedBy = userId;
  settings.markModified("brand");
  await settings.save();
  await settingsService.getSettings({ bypassCache: true }); // refresh this instance's cache

  // Only the brand/settings responses are cached copies of this data.
  await Promise.all([invalidate("brand-settings:*"), invalidate("settings:*")]);
  await brand.applyServerBranding(settings);

  const revision = settings.brand.revision;
  emitToAll("brand.updated", { revision, sections });
  if (sections.includes("theme")) emitToAll("theme.updated", { revision, theme: brand.resolveTheme(settings) });
  if (sections.includes("logos")) emitToAll("logo.updated", { revision, slots: extra.slots || [], logos: brand.resolveLogos(settings) });
  return settings;
};

/** Full admin view: public payload + editable raw values + slot metadata + audit info. */
const adminView = async (settings) => {
  const [versionCounts, updatedBy] = await Promise.all([
    BrandAssetVersion.aggregate([{ $group: { _id: "$slot", n: { $sum: 1 } } }]),
    settings.brand?.updatedBy ? User.findById(settings.brand.updatedBy).select("name email").lean() : null,
  ]);
  const counts = Object.fromEntries(versionCounts.map((v) => [v._id, v.n]));
  const assets = brand.assetsOf(settings);
  const resolved = brand.resolveLogos(settings);
  const s = settings.toObject();
  return {
    brand: brand.publicBrand(settings),
    company: brand.companyOf(settings),
    social: s.social || {},
    theme: { stored: s.brand?.theme || {}, resolved: brand.resolveTheme(settings), defaults: brand.DEFAULT_THEME, fonts: brand.FONTS },
    slots: brand.SLOT_NAMES.map((slot) => ({
      slot,
      ...brand.SLOTS[slot],
      current: assets[slot]?.url ? { ...assets[slot], versionId: assets[slot].versionId } : null,
      effectiveUrl: resolved[slot],
      inheritedFrom: !assets[slot]?.url && resolved[slot] ? brand.SLOTS[slot].fallback.find((f) => resolved[f] === resolved[slot]) || "legacy" : null,
      versions: counts[slot] || 0,
    })),
    meta: { revision: s.brand?.revision || 0, updatedAt: s.brand?.updatedAt || null, updatedBy },
  };
};

// ---------------------------------------------------------------- validation of editable sections

const parseCompany = (input = {}) => {
  const out = {};
  const set = (key, value) => {
    if (input[key] !== undefined) out[key] = value(str(input[key]));
  };
  set("companyName", (v) => v);
  set("brandName", (v) => {
    if (!v) throw new ApiError(400, "Brand name is required");
    return v;
  });
  set("tagline", (v) => v);
  set("gst", (v) => {
    const g = v.toUpperCase();
    if (g && !GSTIN.test(g)) throw new ApiError(400, "GST number must be a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5)");
    return g;
  });
  set("pan", (v) => {
    const p = v.toUpperCase();
    if (p && !PAN.test(p)) throw new ApiError(400, "PAN must be 10 characters (e.g. ABCDE1234F)");
    return p;
  });
  ["email", "supportEmail"].forEach((k) =>
    set(k, (v) => {
      if (v && !EMAIL.test(v)) throw new ApiError(400, `${k === "email" ? "Email" : "Support email"} is not a valid email address`);
      return v.toLowerCase();
    }),
  );
  ["phone", "customerCare", "whatsapp"].forEach((k) =>
    set(k, (v) => {
      if (v && !PHONE.test(v)) throw new ApiError(400, `${k === "customerCare" ? "Customer care number" : k === "whatsapp" ? "WhatsApp number" : "Phone"} is not a valid phone number`);
      return v;
    }),
  );
  set("address", (v) => v);
  set("mapUrl", (v) => {
    if (v && !/^https:\/\/\S+$/i.test(v)) throw new ApiError(400, "Google Maps link must start with https://");
    return v;
  });
  set("workingHours", (v) => v);
  if (input.invoiceAddress !== undefined) {
    const a = input.invoiceAddress || {};
    out.invoiceAddress = {
      line1: str(a.line1),
      line2: str(a.line2),
      city: str(a.city),
      state: str(a.state),
      country: str(a.country) || "India",
      pincode: str(a.pincode),
    };
    if (out.invoiceAddress.pincode && !/^\d{6}$/.test(out.invoiceAddress.pincode)) throw new ApiError(400, "Invoice address pincode must be 6 digits");
  }
  if (input.invoice !== undefined) {
    const inv = input.invoice || {};
    out.invoice = {};
    if (inv.prefix !== undefined) out.invoice.prefix = str(inv.prefix);
    if (inv.footerNote !== undefined) out.invoice.footerNote = str(inv.footerNote);
    if (inv.termsAndConditions !== undefined) out.invoice.termsAndConditions = str(inv.termsAndConditions);
  }
  return out;
};

/** Writes company fields into the sections the rest of the app already reads. */
const applyCompany = (settings, c) => {
  const section = (name) => ({ ...(settings[name]?.toObject?.() ?? settings[name] ?? {}) });
  const general = section("general");
  const store = section("store");
  const contact = section("contact");
  const invoice = section("invoice");
  if (c.companyName !== undefined) store.legalName = c.companyName;
  if (c.brandName !== undefined) general.siteName = c.brandName;
  if (c.tagline !== undefined) general.siteTagline = c.tagline;
  if (c.gst !== undefined) store.gstNumber = c.gst;
  if (c.email !== undefined) contact.email = c.email;
  if (c.supportEmail !== undefined) general.supportEmail = c.supportEmail;
  if (c.phone !== undefined) contact.phone = c.phone;
  if (c.customerCare !== undefined) general.supportPhone = c.customerCare;
  if (c.whatsapp !== undefined) contact.whatsapp = c.whatsapp;
  if (c.address !== undefined) contact.address = c.address;
  if (c.invoiceAddress !== undefined) store.address = c.invoiceAddress;
  if (c.invoice) Object.assign(invoice, c.invoice);
  settings.general = general;
  settings.store = store;
  settings.contact = contact;
  settings.invoice = invoice;
  ["pan", "mapUrl", "workingHours"].forEach((k) => {
    if (c[k] !== undefined) settings.brand.company[k] = c[k];
  });
};

const parseSocial = (input = {}) => {
  const out = {};
  SOCIAL_KEYS.forEach((k) => {
    if (input[k] === undefined) return;
    const v = str(input[k]);
    if (v && k !== "whatsapp" && !/^https?:\/\/\S+$/i.test(v)) throw new ApiError(400, `${k[0].toUpperCase() + k.slice(1)} link must be a full URL (https://…)`);
    out[k] = v;
  });
  return out;
};

const parseTheme = (input = {}) => {
  const out = {};
  brand.THEME_COLORS.forEach((k) => {
    if (input[k] === undefined) return;
    const v = str(input[k]);
    if (v && !HEX.test(v)) throw new ApiError(400, `${k} must be a hex colour like #5a1e36`);
    out[k] = v.toLowerCase();
  });
  if (input.radius !== undefined) {
    if (input.radius === null || input.radius === "") out.radius = null;
    else {
      const r = Number(input.radius);
      if (!Number.isFinite(r) || r < 0 || r > 40) throw new ApiError(400, "Border radius must be between 0 and 40 px");
      out.radius = Math.round(r);
    }
  }
  ["headingFont", "bodyFont"].forEach((k) => {
    if (input[k] === undefined) return;
    const v = str(input[k]);
    if (v && !brand.FONTS.includes(v)) throw new ApiError(400, `${k === "headingFont" ? "Heading" : "Body"} font must be one of: ${brand.FONTS.join(", ")}`);
    out[k] = v;
  });
  return out;
};

const applyTheme = (settings, t) => {
  Object.entries(t).forEach(([k, v]) => {
    settings.brand.theme[k] = v;
  });
};

const ensureBrand = (settings) => {
  if (!settings.brand) settings.brand = {};
  if (!settings.brand.assets) settings.brand.assets = new Map();
  if (!settings.brand.theme) settings.brand.theme = {};
  if (!settings.brand.company) settings.brand.company = {};
};

// ---------------------------------------------------------------- logos

/** Makes a version the current logo of its slot (and mirrors the legacy fields). */
const setCurrentAsset = (settings, slot, v, userId) => {
  const asset = {
    url: v.url,
    publicId: v.publicId,
    width: v.width,
    height: v.height,
    format: v.format,
    bytes: v.bytes,
    version: v.version,
    versionId: v._id,
    updatedAt: new Date(),
    updatedBy: userId,
  };
  settings.brand.assets.set(slot, asset);
  if (slot === "headerLogo") settings.logo = { url: v.url, publicId: v.publicId };
  if (slot === "favicon") settings.favicon = { url: v.url, publicId: v.publicId };
};

const clearAsset = (settings, slot) => {
  settings.brand.assets.delete(slot);
  if (slot === "headerLogo") settings.logo = { url: "", publicId: "" };
  if (slot === "favicon") settings.favicon = { url: "", publicId: "" };
};

/** Keeps the newest versions per slot; deletes files we uploaded that nothing uses any more. */
const pruneVersions = async (settings, slot) => {
  const old = await BrandAssetVersion.find({ slot }).sort({ createdAt: -1 }).skip(VERSIONS_KEPT).lean();
  if (!old.length) return;
  const inUse = new Set(Object.values(brand.assetsOf(settings)).map((a) => a?.publicId).filter(Boolean));
  await BrandAssetVersion.deleteMany({ _id: { $in: old.map((v) => v._id) } });
  await Promise.all(
    old
      .filter((v) => v.source === "upload" && v.publicId && !inUse.has(v.publicId))
      .map(async (v) => {
        const stillReferenced = await BrandAssetVersion.exists({ publicId: v.publicId });
        if (!stillReferenced) await deleteFromCloudinary(v.publicId);
      }),
  );
};

// ---------------------------------------------------------------- handlers

// @route GET /api/v1/settings/brand — public brand payload (website, app, admin)
const getPublicBrand = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  sendResponse(res, 200, { brand: brand.publicBrand(settings) }, "Brand fetched successfully");
});

// @route GET /api/v1/admin/brand
const getBrand = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  sendResponse(res, 200, await adminView(settings), "Brand settings fetched successfully");
});

// @route PUT /api/v1/admin/brand  { company?, social?, theme? }
const updateBrand = asyncHandler(async (req, res) => {
  const { company, social, theme } = req.body || {};
  if (!company && !social && !theme) throw new ApiError(400, "Nothing to update — send company, social or theme");
  const parsed = { company: company ? parseCompany(company) : null, social: social ? parseSocial(social) : null, theme: theme ? parseTheme(theme) : null };

  const settings = await loadSettings();
  ensureBrand(settings);
  const sections = [];
  if (parsed.company) {
    applyCompany(settings, parsed.company);
    sections.push("company");
  }
  if (parsed.social) {
    settings.social = { ...(settings.social?.toObject?.() ?? {}), ...parsed.social };
    sections.push("social");
  }
  if (parsed.theme) {
    applyTheme(settings, parsed.theme);
    sections.push("theme");
  }
  await commit(settings, req.user._id, sections);
  sendResponse(res, 200, await adminView(settings), "Brand settings saved");
});

// @route POST /api/v1/admin/brand/assets/:slot  (multipart "file")
const uploadAsset = asyncHandler(async (req, res) => {
  const { slot } = req.params;
  assertSlot(slot);
  if (!req.file) throw new ApiError(400, "Choose an image to upload");

  const uploaded = await uploadToCloudinary(req.file.buffer, `ecommerce/branding/${slot}`, { resourceType: "image", optimize: false });
  let version;
  try {
    version = await BrandAssetVersion.create({
      slot,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      version: Number(String(uploaded.url).match(/\/v(\d+)\//)?.[1]) || null,
      source: "upload",
      originalName: req.file.originalname || "",
      createdBy: req.user._id,
    });
  } catch (err) {
    await deleteFromCloudinary(uploaded.publicId);
    throw err;
  }

  const settings = await loadSettings();
  ensureBrand(settings);
  setCurrentAsset(settings, slot, version, req.user._id);
  await commit(settings, req.user._id, ["logos"], { slots: [slot] });
  await pruneVersions(settings, slot);
  sendResponse(res, 201, await adminView(settings), `${brand.SLOTS[slot].label} updated`);
});

// @route POST /api/v1/admin/brand/assets/:slot/media  { mediaId } — reuse a Media Library image (no re-upload)
const useMediaAsset = asyncHandler(async (req, res) => {
  const { slot } = req.params;
  assertSlot(slot);
  if (!mongoose.isValidObjectId(req.body?.mediaId)) throw new ApiError(400, "Choose an image from the Media Library");
  const media = await Media.findById(req.body.mediaId).lean();
  if (!media) throw new ApiError(404, "Media file not found");
  if (media.type && media.type !== "image") throw new ApiError(400, "Only images can be used as a logo");

  // Same file picked again → reuse its version record.
  let version = await BrandAssetVersion.findOne({ slot, publicId: media.publicId, source: "media" });
  if (!version) {
    version = await BrandAssetVersion.create({
      slot,
      url: media.url,
      publicId: media.publicId,
      width: media.width || null,
      height: media.height || null,
      format: media.format || "",
      bytes: media.size || null,
      source: "media",
      originalName: media.originalName || "",
      createdBy: req.user._id,
    });
  }
  const settings = await loadSettings();
  ensureBrand(settings);
  setCurrentAsset(settings, slot, version, req.user._id);
  await commit(settings, req.user._id, ["logos"], { slots: [slot] });
  await pruneVersions(settings, slot);
  sendResponse(res, 200, await adminView(settings), `${brand.SLOTS[slot].label} updated`);
});

// @route DELETE /api/v1/admin/brand/assets/:slot — back to the fallback / bundled default (history kept)
const removeAsset = asyncHandler(async (req, res) => {
  const { slot } = req.params;
  assertSlot(slot);
  const settings = await loadSettings();
  ensureBrand(settings);
  clearAsset(settings, slot);
  await commit(settings, req.user._id, ["logos"], { slots: [slot] });
  sendResponse(res, 200, await adminView(settings), `${brand.SLOTS[slot].label} removed — the fallback is used now`);
});

// @route GET /api/v1/admin/brand/assets/:slot/versions
const listVersions = asyncHandler(async (req, res) => {
  const { slot } = req.params;
  assertSlot(slot);
  const [versions, settings] = await Promise.all([
    BrandAssetVersion.find({ slot }).sort({ createdAt: -1 }).populate("createdBy", "name").lean(),
    settingsService.getSettings(),
  ]);
  const currentId = String(brand.assetsOf(settings)[slot]?.versionId || "");
  sendResponse(res, 200, { versions: versions.map((v) => ({ ...v, isCurrent: String(v._id) === currentId })) }, "Versions fetched successfully");
});

// @route POST /api/v1/admin/brand/assets/:slot/versions/:versionId/restore
const restoreVersion = asyncHandler(async (req, res) => {
  const { slot, versionId } = req.params;
  assertSlot(slot);
  if (!mongoose.isValidObjectId(versionId)) throw new ApiError(400, "Invalid version");
  const version = await BrandAssetVersion.findOne({ _id: versionId, slot });
  if (!version) throw new ApiError(404, "That version no longer exists");
  const settings = await loadSettings();
  ensureBrand(settings);
  setCurrentAsset(settings, slot, version, req.user._id);
  await commit(settings, req.user._id, ["logos"], { slots: [slot] });
  sendResponse(res, 200, await adminView(settings), "Previous version restored");
});

// @route POST /api/v1/admin/brand/reset  { sections: ["theme", "logos"] }
const resetBrand = asyncHandler(async (req, res) => {
  const sections = Array.isArray(req.body?.sections) ? req.body.sections.filter((s) => ["theme", "logos"].includes(s)) : [];
  if (!sections.length) throw new ApiError(400, 'Choose what to reset: "theme" and/or "logos"');
  const settings = await loadSettings();
  ensureBrand(settings);
  if (sections.includes("theme")) {
    brand.THEME_COLORS.concat(["headingFont", "bodyFont"]).forEach((k) => {
      settings.brand.theme[k] = "";
    });
    settings.brand.theme.radius = null;
  }
  const slots = sections.includes("logos") ? brand.SLOT_NAMES.filter((s) => brand.assetsOf(settings)[s]?.url || (s === "headerLogo" && settings.logo?.url) || (s === "favicon" && settings.favicon?.url)) : [];
  slots.forEach((slot) => clearAsset(settings, slot));
  await commit(settings, req.user._id, sections, { slots });
  sendResponse(res, 200, await adminView(settings), `Reset ${sections.join(" and ")} to defaults (logo history is kept)`);
});

// @route GET /api/v1/admin/brand/export
const exportBrand = asyncHandler(async (req, res) => {
  const settings = await loadSettings();
  const s = settings.toObject();
  const company = brand.companyOf(settings);
  const assets = brand.assetsOf(settings);
  sendResponse(res, 200, {
    format: "abj-brand-settings",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    company: {
      ...Object.fromEntries(Object.entries(company).filter(([k]) => k !== "invoice")),
      invoice: company.invoice,
    },
    social: s.social || {},
    theme: s.brand?.theme || {},
    assets: Object.fromEntries(
      Object.entries(assets)
        .filter(([, a]) => a?.url)
        .map(([slot, a]) => [slot, { url: a.url, publicId: a.publicId, width: a.width, height: a.height, format: a.format }]),
    ),
  }, "Brand settings exported");
});

// @route POST /api/v1/admin/brand/import  (an export file's data)
const importBrand = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (body.format !== "abj-brand-settings") throw new ApiError(400, "This isn't a brand settings export file");
  const parsed = {
    company: body.company ? parseCompany(body.company) : null,
    social: body.social ? parseSocial(body.social) : null,
    theme: body.theme ? parseTheme(body.theme) : null,
  };
  const assets = Object.entries(body.assets || {}).filter(([slot, a]) => brand.SLOT_NAMES.includes(slot) && a && /^https:\/\/\S+$/i.test(a.url || ""));

  const settings = await loadSettings();
  ensureBrand(settings);
  const sections = [];
  if (parsed.company) {
    applyCompany(settings, parsed.company);
    sections.push("company");
  }
  if (parsed.social) {
    settings.social = { ...(settings.social?.toObject?.() ?? {}), ...parsed.social };
    sections.push("social");
  }
  if (parsed.theme) {
    applyTheme(settings, parsed.theme);
    sections.push("theme");
  }
  for (const [slot, a] of assets) {
    // eslint-disable-next-line no-await-in-loop
    const version =
      (await BrandAssetVersion.findOne({ slot, url: a.url })) ||
      // eslint-disable-next-line no-await-in-loop
      (await BrandAssetVersion.create({ slot, url: a.url, publicId: str(a.publicId), width: a.width || null, height: a.height || null, format: str(a.format), source: "import", createdBy: req.user._id }));
    setCurrentAsset(settings, slot, version, req.user._id);
  }
  if (assets.length) sections.push("logos");
  if (!sections.length) throw new ApiError(400, "The file has nothing to import");
  await commit(settings, req.user._id, sections, { slots: assets.map(([slot]) => slot) });
  logger.info(`Brand settings imported by ${req.user._id}: ${sections.join(", ")}`);
  sendResponse(res, 200, await adminView(settings), `Imported ${sections.join(", ")}`);
});

module.exports = {
  getPublicBrand,
  getBrand,
  updateBrand,
  uploadAsset,
  useMediaAsset,
  removeAsset,
  listVersions,
  restoreVersion,
  resetBrand,
  exportBrand,
  importBrand,
};
